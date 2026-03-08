# Amazon EKS Cluster Autoscaler Setup Guide

## Overview

The **Cluster Autoscaler** in Amazon EKS automatically adjusts the
number of worker nodes in your Kubernetes cluster based on workload
demand.

It performs two main actions:

-   **Scale Out (Add Nodes):** When pods cannot be scheduled due to
    insufficient CPU or memory resources, the autoscaler increases the
    size of the node group.

-   **Scale In (Remove Nodes):** When nodes are underutilized and pods
    can be rescheduled elsewhere, the autoscaler removes unnecessary
    nodes.

This helps reduce infrastructure cost while ensuring workloads always
have enough resources.

------------------------------------------------------------------------

# Architecture Flow

1.  Pods request CPU/Memory.
2.  If the scheduler cannot place pods → pods remain **Pending**.
3.  Cluster Autoscaler detects unschedulable pods.
4.  Autoscaler increases the **Auto Scaling Group (ASG)** size.
5.  New worker nodes join the cluster.
6.  Pending pods are scheduled.

When nodes become idle:

1.  Autoscaler checks utilization.
2.  Nodes with low utilization are drained.
3.  Node is removed from the ASG.

------------------------------------------------------------------------

# Prerequisites

Before installing Cluster Autoscaler:

-   EKS cluster must be running
-   Worker nodes must use **Auto Scaling Groups**
-   kubectl must be configured
-   IAM permissions must be available

------------------------------------------------------------------------

# Step 1: Create IAM Policy

Create an IAM policy that allows Cluster Autoscaler to interact with AWS
Auto Scaling.

Go to:

    AWS Console → IAM → Policies → Create Policy → JSON

Paste the following policy:

``` json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "autoscaling:DescribeAutoScalingGroups",
        "autoscaling:DescribeAutoScalingInstances",
        "autoscaling:DescribeLaunchConfigurations",
        "autoscaling:DescribeScalingActivities",
        "ec2:DescribeImages",
        "ec2:DescribeInstanceTypes",
        "ec2:DescribeLaunchTemplateVersions",
        "ec2:GetInstanceTypesFromInstanceRequirements",
        "eks:DescribeNodegroup"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "autoscaling:SetDesiredCapacity",
        "autoscaling:TerminateInstanceInAutoScalingGroup"
      ],
      "Resource": "*"
    }
  ]
}
```

Policy Name:

    ClusterAutoScalerPolicy

Click **Create Policy**.

------------------------------------------------------------------------

# Step 2: Attach Policy to EKS Node Role

Attach this policy to the **Node IAM Role** used by worker nodes.

Steps:

    AWS Console → IAM → Roles
    Select the EKS Worker Node Role
    Permissions → Add permissions → Attach policies
    Select: ClusterAutoScalerPolicy
    Click: Add permissions

Note:

Attach the policy to the **NodeGroup IAM Role**, not the cluster control
plane role.

------------------------------------------------------------------------

# Step 3: Tag the Auto Scaling Group

Cluster Autoscaler discovers node groups using ASG tags.

Add the following tags to your **Auto Scaling Group**.

    k8s.io/cluster-autoscaler/enabled = true
    k8s.io/cluster-autoscaler/<cluster-name> = owned

Example:

    k8s.io/cluster-autoscaler/enabled = true
    k8s.io/cluster-autoscaler/my-demo-cluster = owned

------------------------------------------------------------------------

# Step 4: Deploy Cluster Autoscaler

Apply the following manifest.

``` bash
kubectl apply -f cluster-autoscaler.yaml
```

Below is a simplified and production-safe deployment manifest.

``` yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: cluster-autoscaler
  namespace: kube-system
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: cluster-autoscaler
rules:
- apiGroups: [""]
  resources: ["events","endpoints"]
  verbs: ["create","patch"]
- apiGroups: [""]
  resources: ["pods/eviction"]
  verbs: ["create"]
- apiGroups: [""]
  resources: ["pods/status"]
  verbs: ["update"]
- apiGroups: [""]
  resources: ["nodes"]
  verbs: ["watch","list","get","update"]
- apiGroups: [""]
  resources: ["pods","services","replicationcontrollers","persistentvolumeclaims","persistentvolumes"]
  verbs: ["watch","list","get"]
- apiGroups: ["apps"]
  resources: ["daemonsets","replicasets","statefulsets"]
  verbs: ["watch","list","get"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: cluster-autoscaler
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-autoscaler
subjects:
- kind: ServiceAccount
  name: cluster-autoscaler
  namespace: kube-system
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cluster-autoscaler
  namespace: kube-system
spec:
  replicas: 1
  selector:
    matchLabels:
      app: cluster-autoscaler
  template:
    metadata:
      labels:
        app: cluster-autoscaler
    spec:
      serviceAccountName: cluster-autoscaler
      containers:
      - name: cluster-autoscaler
        image: registry.k8s.io/autoscaling/cluster-autoscaler:v1.26.2
        command:
        - ./cluster-autoscaler
        - --v=4
        - --stderrthreshold=info
        - --cloud-provider=aws
        - --skip-nodes-with-local-storage=false
        - --expander=least-waste
        - --node-group-auto-discovery=asg:tag=k8s.io/cluster-autoscaler/enabled,k8s.io/cluster-autoscaler/<cluster-name>
        resources:
          limits:
            cpu: 100m
            memory: 600Mi
          requests:
            cpu: 100m
            memory: 600Mi
```

Replace:

    <cluster-name>

with your actual cluster name.

Example:

    my-demo-cluster

------------------------------------------------------------------------

# Step 5: Verify Installation

Check the autoscaler pod.

``` bash
kubectl get pods -n kube-system | grep autoscaler
```

View logs:

``` bash
kubectl logs -f deployment/cluster-autoscaler -n kube-system
```

------------------------------------------------------------------------

# Step 6: Test Autoscaling

Create a workload that requires more CPU than currently available.

Example:

``` bash
kubectl scale deployment nginx --replicas=20
```

If nodes do not have enough capacity:

-   Pods will become **Pending**
-   Cluster Autoscaler will **increase ASG size**
-   New nodes will be added automatically

------------------------------------------------------------------------

# Important Notes

### 1. Version Matching

Cluster Autoscaler version must match Kubernetes version.

Example:

| Kubernetes Version \| \| Autoscaler Version \|

\|-------------------\|\|--------------------\|

 \| 1.26 \| 1.26.x \| \|
1.27 \| 1.27.x \|

------------------------------------------------------------------------

### 2. Only Works With ASG NodeGroups

Cluster Autoscaler only manages nodes that belong to:

-   Managed Node Groups
-   Self Managed Node Groups (ASG)

It does **not** scale Fargate profiles.

------------------------------------------------------------------------

### 3. Minimum and Maximum Nodes

Autoscaler respects limits defined in the Auto Scaling Group:

    min size
    max size
    desired size

------------------------------------------------------------------------

# Useful Commands

Check node groups

``` bash
kubectl get nodes
```

Check pending pods

``` bash
kubectl get pods --all-namespaces | grep Pending
```

Describe autoscaler

``` bash
kubectl describe deployment cluster-autoscaler -n kube-system
```

------------------------------------------------------------------------

# Official Documentation

Kubernetes Autoscaler:

https://github.com/kubernetes/autoscaler/tree/master/cluster-autoscaler

AWS Specific Guide:

https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/cloudprovider/aws/README.md

------------------------------------------------------------------------

# Summary

Cluster Autoscaler helps automatically:

-   Add nodes when pods cannot be scheduled
-   Remove idle nodes to reduce cost
-   Maintain optimal cluster resource utilization

It integrates directly with **AWS Auto Scaling Groups** and ensures
Kubernetes workloads always have sufficient resources.
