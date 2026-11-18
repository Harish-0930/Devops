# AWS EKS -- IAM Roles for Service Accounts (IRSA) Implementation Guide
---

## 1. What IRSA is

IRSA lets a Kubernetes pod assume an IAM role using an OIDC-federated identity, so AWS
API calls from that pod are authorised as the role rather than as the node.

The mechanism:

1. EKS publishes an OIDC discovery endpoint for the cluster.
2. That endpoint is registered in IAM as an OIDC identity provider.
3. An IAM role trusts that provider and pins itself to one namespace + ServiceAccount
   via a `sub` condition.
4. A ServiceAccount is annotated with the role ARN.
5. At pod admission, a mutating webhook injects a projected service-account token and
   three environment variables.
6. The AWS SDK inside the container calls `sts:AssumeRoleWithWebIdentity` using that
   token and receives temporary credentials.

### IRSA vs Pod Identity

| | IRSA | Pod Identity |
|---|---|---|
| Trust principal | `Federated: <oidc-provider-arn>` | `Service: pods.eks.amazonaws.com` |
| Trust action | `sts:AssumeRoleWithWebIdentity` | `sts:AssumeRole` + `sts:TagSession` |
| Binding to SA | `sub` condition in trust policy | Separate association resource |
| Prerequisite | OIDC provider registered in IAM | `eks-pod-identity-agent` addon |
| Credential path | Projected token file + env vars | Agent on node at link-local address |
| Cross-account | Supported | Supported |
| Role reuse across clusters | Needs one trust entry per cluster OIDC | Trust policy is cluster-agnostic |
| Precedence if both configured | Loses | **Wins** |

Pod Identity is the newer and generally simpler mechanism. IRSA remains relevant for
existing estates, for cross-account patterns built before Pod Identity, and because
many Helm charts still document the annotation-based approach.

---

## 2. Prerequisites

```bash
aws --version          # v2.x
eksctl version         # 0.19x+
kubectl version --client
aws sts get-caller-identity
```

Install `kubectl` if absent:

```bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl && sudo mv kubectl /usr/local/bin/
kubectl version --client
```

---

## 3. Environment Variables

Re-export these after any shell restart. Most IRSA failures trace back to an empty
variable silently producing a malformed ARN.

```bash
export AWS_REGION=us-east-1
export CLUSTER_NAME=irsa-demo-impl
export ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export OIDC_HOST=$(aws eks describe-cluster \
  --name $CLUSTER_NAME --region $AWS_REGION \
  --query "cluster.identity.oidc.issuer" --output text | sed -e "s/^https:\/\///")

echo "Account : $ACCOUNT_ID"
echo "OIDC    : $OIDC_HOST"
```

---

## 4. Cluster Creation

`cluster.yaml`:

```yaml
apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig

metadata:
  name: irsa-demo-impl
  region: us-east-1

iam:
  withOIDC: true              # REQUIRED for IRSA

managedNodeGroups:
  - name: ng-micro
    instanceType: t3.micro
    desiredCapacity: 2
    volumeSize: 20
    privateNetworking: false
```

```bash
eksctl create cluster -f cluster.yaml
```

**`iam:` is a top-level key** -- a sibling of `metadata:` and `managedNodeGroups:`, not
nested inside either. If it is misplaced, eksctl silently proceeds without OIDC and
logs:

```
recommended policies were found for "vpc-cni" addon, but since OIDC is disabled
on the cluster, eksctl cannot configure the requested permissions
```

That warning is the early signal that IRSA will not work.

Check which Kubernetes versions are currently supported before pinning one in the
config.

### Enabling OIDC on an existing cluster

```bash
eksctl utils associate-iam-oidc-provider \
  --cluster $CLUSTER_NAME --region $AWS_REGION --approve
```

### Verifying OIDC

```bash
aws eks describe-cluster --name $CLUSTER_NAME --region $AWS_REGION \
  --query "cluster.identity.oidc.issuer" --output text

aws iam list-open-id-connect-providers
```

Both must be present, and the ID at the end of the issuer URL must appear in one of the
provider ARNs. The issuer URL exists whether or not the provider was registered, so the
second command is the one that confirms IRSA is usable.


### Confirming nodes

```bash
kubectl get nodes -o wide
eksctl get nodegroup --cluster $CLUSTER_NAME --region $AWS_REGION
```

---

## 5. Permission Policy

The role needs a permission policy for whatever the pod will actually do. This build
used `ec2:DescribeInstances` because it requires no resource to be provisioned first.

```bash
cat > policy.json <<'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    { "Effect": "Allow", "Action": "ec2:DescribeInstances", "Resource": "*" }
  ]
}
EOF


aws iam create-policy \ 
  --policy-name irsa-ec2-describe \
  --policy-document file://policy.json \
  --query 'Policy.Arn' --output text  #Policy name is irsa-ec2-describe
```


EC2 `Describe*` actions do not support resource-level permissions, so `"Resource": "*"`
is mandatory here.

### Choosing a test permission

The node's instance role already carries `AmazonEKS_CNI_Policy`, which **includes
`ec2:DescribeInstances`**. A pod silently falling back to the node role would therefore
still succeed at that call. If the negative test needs to be meaningful, use a
permission the node role lacks -- `ec2:DescribeVpcs` is a good choice.

Either way, the authoritative check is `sts:GetCallerIdentity`, not whether the API call
succeeded.

---

## 6. IAM Role and Trust Policy

```bash
kubectl create namespace demo
```

```bash
# Service account: irsa-demo-sa
# namespace: demo
cat > trust.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::$ACCOUNT_ID:oidc-provider/$OIDC_HOST"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "$OIDC_HOST:aud": "sts.amazonaws.com",
          "$OIDC_HOST:sub": "system:serviceaccount:demo:irsa-demo-sa"
        }
      }
    }
  ]
}
EOF

cat trust.json          # inspect before applying
```

```bash
# Role: irsa-ec2-reader-role
aws iam create-role \
  --role-name irsa-ec2-reader-role \
  --assume-role-policy-document file://trust.json \
  --query 'Role.Arn' --output text

aws iam attach-role-policy \
  --role-name irsa-ec2-reader-role \
  --policy-arn arn:aws:iam::$ACCOUNT_ID:policy/irsa-ec2-describe
```

### The two conditions

**`sub`** is the security boundary. The format is
`system:serviceaccount:<namespace>:<serviceaccount-name>`, and it must match exactly.
Loosening it to `system:serviceaccount:demo:*` lets *any* ServiceAccount in that
namespace assume the role -- a common and serious misconfiguration.

**`aud`** must be `sts.amazonaws.com`. Omitting it allows any OIDC token issued by the
cluster, for any audience, to be replayed against this role.

Use `StringEquals` for exact matches. `StringLike` is only appropriate when a wildcard
is genuinely intended, and should be reviewed carefully when it appears.

### eksctl shortcut

For routine work, eksctl creates the role, trust policy and annotated ServiceAccount in
one step:

```bash
eksctl create iamserviceaccount \
  --cluster $CLUSTER_NAME \
  --region $AWS_REGION \
  --namespace demo \
  --name irsa-demo-sa \
  --attach-policy-arn arn:aws:iam::$ACCOUNT_ID:policy/irsa-ec2-describe \
  --approve
```

This creates a CloudFormation stack. Writing the trust policy by hand at least once is
worth doing to understand what that stack generates.

---

## 7. ServiceAccount

```bash
cat > sa.yaml <<EOF
apiVersion: v1
kind: ServiceAccount
metadata:
  name: irsa-demo-sa
  namespace: demo
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::$ACCOUNT_ID:role/irsa-ec2-reader-role
EOF

kubectl apply -f sa.yaml
kubectl -n demo get irsa-demo-sa -o yaml
```

**The annotation must exist before the pod is created.** The mutating webhook runs only
at pod admission. Annotating a ServiceAccount whose pods are already running has no
effect until those pods are recreated.

---

## 8. Pod

```bash
cat > pod.yaml <<'EOF'
apiVersion: v1
kind: Pod
metadata:
  name: aws-cli
  namespace: demo
spec:
  serviceAccountName: irsa-demo-sa
  containers:
    - name: aws-cli
      image: amazon/aws-cli:latest
      command: ["sleep", "3600"]
EOF

kubectl apply -f pod.yaml
kubectl -n demo get pod aws-cli -w
```

`serviceAccountName` must be set. Without it the pod uses the namespace `default`
ServiceAccount, which has no annotation, and credentials fall through to the node role.

---

## 9. Verification

### Step 1 -- webhook injection

```bash
kubectl -n demo get pod aws-cli -o jsonpath='{.spec.containers[0].env}' | tr ',' '\n'
```

Expected:

- `AWS_ROLE_ARN=arn:aws:iam::87XXXXXXXXXX:role/irsa-ec2-reader-role`
- `AWS_WEB_IDENTITY_TOKEN_FILE=/var/run/secrets/eks.amazonaws.com/serviceaccount/token`
- `AWS_STS_REGIONAL_ENDPOINTS=regional`

Plus a projected volume named `aws-iam-token`:

```bash
kubectl -n demo get pod aws-cli -o jsonpath='{.spec.volumes}' | tr ',' '\n'
kubectl -n demo exec aws-cli -- ls -l /var/run/secrets/eks.amazonaws.com/serviceaccount/
```

If these are absent, the pod was admitted before the annotation existed. Delete and
recreate it.

### Step 2 -- identity (the authoritative test)

```bash
kubectl -n demo exec aws-cli -- aws sts get-caller-identity
```

Expected ARN:

```
arn:aws:sts::87XXXXXXXXXX:assumed-role/irsa-ec2-reader-role/botocore-session-XXXXXXXXXX
```

If the ARN contains `NodeInstanceRole`, IRSA is **not** working -- regardless of whether
subsequent API calls succeed.

### Step 3 -- the permitted call

```bash
kubectl -n demo exec aws-cli -- aws ec2 describe-instances \
  --region us-east-1 \
  --filters "Name=instance-state-name,Values=running" \
  --query 'Reservations[].Instances[].{ID:InstanceId,Type:InstanceType,State:State.Name,IP:PrivateIpAddress}' \
  --output table
```

### Step 4 -- the boundary

```bash
kubectl -n demo exec aws-cli -- aws ec2 describe-vpcs --region us-east-1
# AccessDenied, if the policy does not grant it
```

A permission that is granted *and* a permission that is denied together demonstrate the
role is actually scoped rather than inherited.

### Step 5 -- the `sub` condition

This is the test that makes IRSA click. Create a second ServiceAccount in the same
namespace pointing at the *same* role:

```bash
kubectl -n demo create sa impostor
kubectl -n demo annotate sa impostor \
  eks.amazonaws.com/role-arn=arn:aws:iam::$ACCOUNT_ID:role/irsa-ec2-reader-role

kubectl -n demo run impostor-pod --image=amazon/aws-cli:latest \
  --overrides='{"spec":{"serviceAccountName":"impostor"}}' \
  --command -- sleep 3600

kubectl -n demo exec impostor-pod -- aws sts get-caller-identity
```

This fails with `Not authorized to perform sts:AssumeRoleWithWebIdentity` despite an
identical annotation, because the token's `sub` is `system:serviceaccount:demo:impostor`
and the trust policy accepts only `:irsa-demo-sa`.

**The annotation is a hint to the webhook. The trust policy is the authorisation.**

---

## 10. Troubleshooting

### Cluster and nodegroup

| Symptom | Cause | Fix |
|---|---|---|
| `exceeded max wait time for StackCreateComplete` | Generic timeout; real error is elsewhere | See diagnostic commands below |
| `health.issues` empty but no nodes | Nodegroup resource created, instances never launched | Check ASG scaling activities |
| `The specified instance type is not eligible for Free Tier` | Account on a Free Tier plan restricting instance types | Use `t3.micro`, or change the account plan |
| `NodeCreationFailure` | Nodes booted but could not reach the API server | Check NAT/routing when `privateNetworking: true` |
| `InsufficientFreeAddresses` | Private subnets too small | Larger subnet CIDRs |
| `Ec2SubnetInvalidConfiguration` | Subnet has no route to NAT | Check route tables |
| `InstanceLimitExceeded` | vCPU quota | Raise quota or change type |

Diagnostic sequence -- run in this order, since each narrows the next:

```bash
# 1. Nodegroup-level health
aws eks describe-nodegroup \
  --cluster-name $CLUSTER_NAME --nodegroup-name ng-micro --region $AWS_REGION \
  --query 'nodegroup.{status:status,health:health.issues}'

# 2. CloudFormation failures
aws cloudformation describe-stack-events \
  --stack-name eksctl-$CLUSTER_NAME-nodegroup-ng-micro --region $AWS_REGION \
  --query 'StackEvents[?ResourceStatus==`CREATE_FAILED`].[LogicalResourceId,ResourceStatusReason]' \
  --output table

# 3. ASG launch failures -- where instance-type and capacity errors surface
aws autoscaling describe-scaling-activities --region $AWS_REGION \
  --query 'Activities[0:5].[StatusCode,StatusMessage]' --output table
```

An empty `health.issues` with zero nodes points at step 3. The nodegroup was created
successfully; the Auto Scaling group simply could never launch an instance.

Free-tier-eligible instance types:

```bash
aws ec2 describe-instance-types --region $AWS_REGION \
  --filters "Name=free-tier-eligible,Values=true" \
  --query 'InstanceTypes[].InstanceType' --output table
```

### t3.micro pod density

`t3.micro` supports 2 ENIs x 2 IPv4 addresses -> a hard ceiling of **4 pods per node**.
`aws-node` and `kube-proxy` use host networking and consume no IPs; CoreDNS does.

```bash
kubectl get nodes -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.allocatable.pods}{"\n"}{end}'
```

A pod stuck in `ContainerCreating` with `failed to assign an IP address` is this limit,
not an IRSA fault. Scale `desiredCapacity` up rather than switching instance type, which
the free-tier restriction would block.

### IRSA

| Symptom | Cause | Fix |
|---|---|---|
| Pod shows node role in `get-caller-identity` | Pod admitted before annotation existed, or `serviceAccountName` missing | Recreate the pod |
| `No OpenIDConnect provider found` | Provider never registered in IAM | `eksctl utils associate-iam-oidc-provider` |
| `Not authorized to perform sts:AssumeRoleWithWebIdentity` | `sub` mismatch -- usually a namespace typo | Compare trust policy against `system:serviceaccount:<ns>:<sa>` |
| Works in one namespace, fails after moving | Trust policy is namespace-scoped by design | Add a condition or create a second role |
| Old SDK ignores the token file | Web identity needs a reasonably recent SDK | Upgrade the base image |
| Token expired in a long-running pod | Normal; SDK refreshes from file | Only breaks if the application caches credentials manually |
| Role works via CLI but not in app | SDK not reading env vars, or explicit credentials in code | Remove hardcoded credentials and profile overrides |

Trace the chain in order. Each step depends on the one before it:

```bash
# OIDC provider registered?
aws iam list-open-id-connect-providers

# Annotation present and correct?
kubectl -n demo get sa irsa-demo-sa -o jsonpath='{.metadata.annotations}'

# Webhook injected env vars?
kubectl -n demo get pod aws-cli -o jsonpath='{.spec.containers[0].env}'

# Trust policy sub matches?
aws iam get-role --role-name irsa-ec2-reader-role \
  --query 'Role.AssumeRolePolicyDocument'

# Permission policy attached?
aws iam list-attached-role-policies --role-name irsa-ec2-reader-role
```

### EKS console shows "Unauthorized" / "Nodes (0)"

The console Nodes tab reads the Kubernetes API as the browser session's IAM principal.
If that principal has no access entry on the cluster, the read fails and the table
renders empty. **"Nodes (0)" is not a statement about the nodes** -- confirm with
`kubectl get nodes` instead.

To grant console access, first identify the browser identity. Running
`aws sts get-caller-identity` over SSH returns the *EC2 instance role*, not the console
identity. Use the account menu in the console's top-right, or CloudShell, which runs as
the console identity.

```bash
export PRINCIPAL=arn:aws:iam::87XXXXXXXXXX:role/YOUR_CONSOLE_ROLE

aws eks create-access-entry \
  --cluster-name $CLUSTER_NAME --region $AWS_REGION \
  --principal-arn $PRINCIPAL --type STANDARD

aws eks associate-access-policy \
  --cluster-name $CLUSTER_NAME --region $AWS_REGION \
  --principal-arn $PRINCIPAL \
  --policy-arn arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy \
  --access-scope type=cluster
```

Use `AmazonEKSAdminViewPolicy` for read-only browsing.

Notes:

- For IAM Identity Center roles, use the underlying role ARN including the
  `aws-reserved/sso.amazonaws.com/` path, not the `assumed-role` session ARN. Find it
  with:

  ```bash
  aws iam list-roles \
    --query 'Roles[?starts_with(RoleName, `AWSReservedSSO`)].Arn' --output text
  ```

- Access entries do not apply to the **account root user**. The console will keep
  showing Unauthorized. Log in as an IAM user or role instead.

### Not to be confused

The **"OIDC identity providers"** tab on the cluster's Access page is for federating
human users into Kubernetes RBAC. It is unrelated to IRSA. The IRSA provider lives in
IAM and is visible via `aws iam list-open-id-connect-providers`.

---

## 11. Permission Constraints Encountered

This build ran from an EC2 instance using `EC2fullaccessrole`, which lacked some
permissions. Worth noting because they shape which demo resources are practical.

| Blocked action | Error | Workaround used |
|---|---|---|
| `s3:CreateBucket` | AccessDenied | Switched the demo to `ec2:DescribeInstances`, which needs no resource created |
| `servicequotas:GetServiceQuota` | AccessDenied | Read ASG scaling activities instead |

Check what the calling role can do before designing the test:

```bash
aws iam list-attached-role-policies --role-name EC2fullaccessrole
```

Picking a read-only API that needs no pre-created resource avoids this class of problem
entirely.

---

## 12. Cleanup

```bash
# If created with eksctl
eksctl delete iamserviceaccount \
  --cluster $CLUSTER_NAME --namespace demo --name irsa-demo-sa --region $AWS_REGION

# If created manually
kubectl delete namespace demo
aws iam detach-role-policy \
  --role-name irsa-ec2-reader-role \
  --policy-arn arn:aws:iam::$ACCOUNT_ID:policy/irsa-ec2-describe
aws iam delete-role --role-name irsa-ec2-reader-role
aws iam delete-policy --policy-arn arn:aws:iam::$ACCOUNT_ID:policy/irsa-ec2-describe

# Cluster
eksctl delete cluster --name $CLUSTER_NAME --region $AWS_REGION --wait
```

Confirm no stacks were orphaned:

```bash
aws cloudformation list-stacks --region $AWS_REGION \
  --query 'StackSummaries[?contains(StackName,`irsa-demo-impl`) && StackStatus!=`DELETE_COMPLETE`].[StackName,StackStatus]' \
  --output table
```

The OIDC provider is not removed by `eksctl delete cluster` in all versions. Check and
delete it if it remains, since it is an orphaned trust anchor:

```bash
aws iam list-open-id-connect-providers
aws iam delete-open-id-connect-provider --open-id-connect-provider-arn <ARN>
```

---

## 13. Security Notes

- **Scope `sub` to a single ServiceAccount.** Wildcards grant the role to every
  ServiceAccount in the namespace.
- **Always include the `aud` condition.** Without it, any cluster-issued OIDC token can
  be replayed against the role.
- **One role per workload.** Shared roles accumulate permissions and lose the least
  privilege property the mechanism exists to provide.
- **Keep the node role minimal.** Pods fall back to it when IRSA is misconfigured, and
  a permissive node role masks the failure.
- **Audit annotations against trust policies.** An annotation referencing a role whose
  trust policy does not match that ServiceAccount is a silent misconfiguration that only
  surfaces at runtime.
- **Namespace deletion does not delete the role.** Clean up IAM resources explicitly.

---

## 14. Exercise: IRSA and Pod Identity Together

Having built both, the precedence behaviour is worth confirming directly. Add a Pod
Identity association to the same ServiceAccount that already carries an IRSA annotation,
pointing at a *different* role, then check which one the pod receives:

```bash
kubectl -n demo exec aws-cli -- aws sts get-caller-identity
```

Pod Identity takes precedence. This matters during migrations: adding an association to
a workload that already uses IRSA changes its effective identity, even though the
annotation is untouched.

---

## 15. Command Reference

```bash
# OIDC
aws eks describe-cluster --name $CLUSTER_NAME --region $AWS_REGION \
  --query "cluster.identity.oidc.issuer" --output text
aws iam list-open-id-connect-providers
eksctl utils associate-iam-oidc-provider \
  --cluster $CLUSTER_NAME --region $AWS_REGION --approve

# Role and trust
aws iam get-role --role-name irsa-ec2-reader-role \
  --query 'Role.AssumeRolePolicyDocument'
aws iam list-attached-role-policies --role-name irsa-ec2-reader-role

# ServiceAccount
kubectl -n demo get sa irsa-demo-sa -o yaml
kubectl -n demo get sa -o custom-columns=\
NAME:.metadata.name,ROLE:.metadata.annotations.eks\\.amazonaws\\.com/role-arn

# Pod
kubectl -n demo get pod aws-cli -o jsonpath='{.spec.containers[0].env}'
kubectl -n demo exec aws-cli -- aws sts get-caller-identity
kubectl -n demo exec aws-cli -- \
  cat /var/run/secrets/eks.amazonaws.com/serviceaccount/token | cut -d. -f2 | base64 -d 2>/dev/null

# Nodegroup
eksctl get nodegroup --cluster $CLUSTER_NAME --region $AWS_REGION
aws eks describe-nodegroup --cluster-name $CLUSTER_NAME \
  --nodegroup-name ng-micro --region $AWS_REGION --query 'nodegroup.health'
```

The token decode in the pod section prints the JWT payload, which shows the `sub`, `aud`
and `exp` claims. Useful when a trust policy mismatch is suspected -- it shows exactly
what value IAM is being asked to match.
