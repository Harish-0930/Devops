# Step-by-Step Guide: Creating an Amazon EKS Cluster with eksctl

This guide walks through provisioning a production-style EKS cluster (`demo`) in `us-east-2` using `eksctl`, with private worker nodes, an IAM OIDC provider, and add-on IAM policies for the Cluster Autoscaler, cert-manager, and the AWS Load Balancer Controller.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Configure IAM Permissions](#2-configure-iam-permissions)
3. [Configure AWS CLI Credentials](#3-configure-aws-cli-credentials)
4. [Create the Cluster Configuration File](#4-create-the-cluster-configuration-file)
5. [Provision the EKS Cluster](#5-provision-the-eks-cluster)
6. [Verify the Cluster](#6-verify-the-cluster)
7. [Verify Node Distribution Across AZs](#7-verify-node-distribution-across-azs)
8. [Cleanup](#8-cleanup)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Prerequisites

Ensure the following tools are installed on your local machine or cloud jump-host:

| Tool | Purpose | Install Guide |
|------|---------|---------------|
| **AWS CLI** | Authenticate and interact with AWS | [Install](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) |
| **eksctl** | Create and manage EKS clusters | [Install](https://eksctl.io/installation/) |
| **helm** | Install Kubernetes packages (e.g., ingress controller) | [Install](https://helm.sh/docs/intro/install/) |
| **kubectl** | Interact with the cluster (needed for verification) | [Install](https://kubernetes.io/docs/tasks/tools/) |

Verify the installations:

```bash
aws --version
eksctl version
helm version
kubectl version --client
```

---

## 2. Configure IAM Permissions

The IAM user or role that creates the cluster and configures Pod Identity needs the following policies attached.

### 2.1 AWS Managed Policies

| Policy | Why It's Needed |
|--------|-----------------|
| `AmazonEC2FullAccess` | Creating and managing VPCs, subnets, security groups, and node-group EC2 instances. |
| `AWSCloudFormationFullAccess` | `eksctl` uses CloudFormation stacks under the hood to provision infrastructure. |
| `IAMFullAccess` | Creating the cluster service role, node role, and pod-identity-associated IAM roles. |
| `AmazonEKSClusterPolicy` | Core EKS control-plane permissions. |
| `AmazonEKSServicePolicy` | Allows EKS to manage AWS resources on your behalf. |

### 2.2 Custom Policy for EKS API and SSM Access

Create a policy (for example, `EKSCustomAccessPolicy`) with the following JSON:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "eks:*",
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ssm:GetParameter",
        "ssm:GetParameters"
      ],
      "Resource": "arn:aws:ssm:*:*:parameter/aws/service/*"
    }
  ]
}
```

Create it from the CLI:

```bash
aws iam create-policy \
  --policy-name EKSCustomAccessPolicy \
  --policy-document file://eks-custom-policy.json
```

### 2.3 Attach the Policies

Replace `<USER_NAME>` and `<ACCOUNT_ID>` with your values:

```bash
USER_NAME=<USER_NAME>
ACCOUNT_ID=<ACCOUNT_ID>

for POLICY in \
  arn:aws:iam::aws:policy/AmazonEC2FullAccess \
  arn:aws:iam::aws:policy/AWSCloudFormationFullAccess \
  arn:aws:iam::aws:policy/IAMFullAccess \
  arn:aws:iam::aws:policy/AmazonEKSClusterPolicy \
  arn:aws:iam::aws:policy/AmazonEKSServicePolicy \
  arn:aws:iam::${ACCOUNT_ID}:policy/EKSCustomAccessPolicy
do
  aws iam attach-user-policy --user-name "$USER_NAME" --policy-arn "$POLICY"
done
```

> **Note:** These policies are broad and suited for demos or learning environments. For production, scope them down to least privilege.

---

## 3. Configure AWS CLI Credentials

```bash
aws configure
```

Provide your Access Key ID, Secret Access Key, default region (`us-east-2`), and output format (`json`). Then confirm the identity in use:

```bash
aws sts get-caller-identity
```

---

## 4. Create the Cluster Configuration File

Save the following as `eks-config.yaml`:

```yaml
apiVersion: eksctl.io/v1alpha5       # API version used by eksctl for parsing this config
kind: ClusterConfig                  # Resource type (an EKS cluster configuration)

metadata:
  name: ingress-demo                 # Name of the EKS cluster to be created
  region: us-east-2                  # AWS region where the cluster will be deployed (Ohio)
  tags:                              # Custom tags applied to AWS resources created for this cluster
    owner: Harish                    # Owner of the cluster
    bu: hari                         # Business unit or project group
    project: demo                    # Groups resources under the ingress demo project

availabilityZones:
  - us-east-2a                       # First availability zone for high availability
  - us-east-2b                       # Second availability zone to span the cluster

iam:
  withOIDC: true                     # Enables IAM OIDC provider, required for IAM Roles for Service Accounts (IRSA)

managedNodeGroups:
  - name: demo-eks-priv-ng           # Name of the managed node group
    instanceType: t3.small           # EC2 instance type for worker nodes
    minSize: 4                       # Minimum number of nodes in the group
    maxSize: 4                       # Maximum number of nodes (fixed at 4; no autoscaling)
    privateNetworking: true          # Launch nodes in private subnets only (no public IPs)
    volumeSize: 20                   # Size (GB) of the EBS volume attached to each node
    iam:
      withAddonPolicies:             # Enables AWS-managed IAM policies for certain add-ons
        autoScaler: true             # Allows Cluster Autoscaler to manage this node group
        externalDNS: false           # No ExternalDNS permissions (not used in this demo)
        certManager: true            # Grants cert-manager access to manage certificates via IAM
        ebs: false                   # EBS CSI policy not required here
        fsx: false                   # FSx access disabled
        efs: false                   # EFS access disabled
        albIngress: true             # Permissions needed by the AWS Load Balancer Controller (ALB)
        xRay: false                  # X-Ray tracing disabled
        cloudWatch: false            # CloudWatch logging from nodes disabled (optional in minimal setups)
    labels:
      lifecycle: ec2-autoscaler      # Custom label on all nodes (useful for node selectors / autoscaler configs)
```

### What this configuration does

| Section | Effect |
|---------|--------|
| `availabilityZones` | Spreads the cluster across two AZs for high availability. |
| `iam.withOIDC` | Creates the OIDC provider so pods can assume IAM roles (IRSA). |
| `privateNetworking: true` | Worker nodes get no public IPs; outbound traffic goes through a NAT gateway. |
| `minSize` / `maxSize` | Both set to 4, so the group stays at a fixed 4 nodes. |
| `withAddonPolicies` | Pre-attaches IAM policies to the node role for the add-ons you plan to use. |

> **Tip:** `t3.small` nodes support a maximum of **11 pods per node** (an ENI/IP limit), including system pods. This is fine for a demo, but plan larger instance types for real workloads.

---

## 5. Provision the EKS Cluster

Create the cluster:

```bash
eksctl create cluster -f eks-config.yaml
```

This typically takes **15 to 20 minutes**. Behind the scenes, `eksctl`:

1. Creates a CloudFormation stack for the VPC, subnets, route tables, NAT gateway, and security groups.
2. Creates the EKS control plane.
3. Associates the IAM OIDC provider with the cluster.
4. Creates a second CloudFormation stack for the managed node group.
5. Updates your local `~/.kube/config` with the new cluster context.

---

## 6. Verify the Cluster

Check that `kubectl` is pointing at the new cluster:

```bash
kubectl config current-context
```

List the nodes. All 4 should be in `Ready` status:

```bash
kubectl get nodes -o wide
```

Check system pods:

```bash
kubectl get pods -n kube-system
```

Confirm the cluster details with `eksctl`:

```bash
eksctl get cluster --region us-east-2
eksctl get nodegroup --cluster ingress-demo --region us-east-2
```

Confirm the OIDC provider is associated:

```bash
aws eks describe-cluster \
  --name ingress-demo \
  --region us-east-2 \
  --query "cluster.identity.oidc.issuer" \
  --output text
```

---

## 7. Verify Node Distribution Across AZs

```bash
kubectl get nodes --show-labels | grep topology.kubernetes.io/zone
```

For a cleaner view, show the zone as a column:

```bash
kubectl get nodes -L topology.kubernetes.io/zone
```

You should see the 4 nodes split across `us-east-2a` and `us-east-2b`.

---

## 8. Cleanup

To avoid ongoing charges (control plane, EC2 nodes, NAT gateway), delete the cluster when you are finished:

```bash
eksctl delete cluster -f eks-config.yaml
```

Confirm that the CloudFormation stacks have been removed:

```bash
aws cloudformation list-stacks \
  --region us-east-2 \
  --stack-status-filter DELETE_IN_PROGRESS DELETE_COMPLETE \
  --query "StackSummaries[?contains(StackName, 'ingress-demo')].[StackName,StackStatus]" \
  --output table
```

> If you have created Load Balancers, Ingress resources, or other AWS resources from within the cluster, delete those **first**, or the VPC deletion may hang.

---

## 9. Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| `AccessDenied` during `create cluster` | Missing IAM permissions | Re-check the policies in [Section 2](#2-configure-iam-permissions). |
| CloudFormation stack stuck in `ROLLBACK_COMPLETE` | Quota limit or permission failure | Open the stack's **Events** tab in the console, fix the cause, then delete the stack and retry. |
| Nodes not joining the cluster | Private subnets without outbound access | Make sure the NAT gateway and route tables were created correctly. |
| `kubectl` cannot connect | Stale or wrong kubeconfig | Run `aws eks update-kubeconfig --name ingress-demo --region us-east-2`. |
| Pods stuck in `Pending` | `t3.small` pod/IP limit reached | Use a larger instance type or add nodes. |
| VPC/EC2 limit errors | Regional service quota reached | Request a quota increase in **Service Quotas**. |

---

## Next Steps

With the cluster running, you can proceed to:

1. Install the **AWS Load Balancer Controller** with Helm.
2. Deploy a sample application and expose it through an **Ingress**.
3. Install **cert-manager** for TLS certificates.
4. Configure the **Cluster Autoscaler** (note that `minSize` and `maxSize` are both 4 here, so adjust them if you want scaling).