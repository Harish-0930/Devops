# Manual Node Scaling in Amazon EKS using eksctl

## Overview

In Amazon EKS, worker nodes are usually part of a **NodeGroup** backed
by an **Auto Scaling Group (ASG)**.

Even if **Cluster Autoscaler is NOT enabled**, you can manually scale
the number of nodes in the cluster using **eksctl**.

The `eksctl scale nodegroup` command updates the **desired capacity** of
the nodegroup, and AWS automatically launches or terminates EC2
instances to match that number.

------------------------------------------------------------------------

# Command Syntax

``` bash
eksctl scale nodegroup --cluster <cluster-name> --name <nodegroup-name> --nodes <number-of-nodes>
```

------------------------------------------------------------------------

# Example

Scale the nodegroup to **4 nodes**:

``` bash
eksctl scale nodegroup --cluster my-demo-cluster --name worker-nodes --nodes 4
```

This command will:

-   Update the **desired node count** to 4
-   The Auto Scaling Group launches or terminates EC2 instances
-   New nodes automatically join the Kubernetes cluster

------------------------------------------------------------------------

# Internal Workflow

When the command runs:

    eksctl command
          ↓
    Update NodeGroup Desired Size
          ↓
    Auto Scaling Group updated
          ↓
    EC2 instances launched or terminated
          ↓
    Nodes join / leave Kubernetes cluster

------------------------------------------------------------------------

# Check Nodegroups

Before scaling, you can check existing nodegroups.

``` bash
eksctl get nodegroup --cluster my-demo-cluster
```

Example output:

    CLUSTER           NODEGROUP        DESIRED   MIN   MAX
    my-demo-cluster   worker-nodes     2         2     5

------------------------------------------------------------------------

# Verify Nodes After Scaling

``` bash
kubectl get nodes
```

Example:

    ip-192-168-1-10.ec2.internal
    ip-192-168-1-11.ec2.internal
    ip-192-168-1-12.ec2.internal
    ip-192-168-1-13.ec2.internal

------------------------------------------------------------------------

# Scale Down Nodes

Example: scale the nodegroup down to **2 nodes**

``` bash
eksctl scale nodegroup --cluster my-demo-cluster --name worker-nodes --nodes 2
```

AWS will terminate extra EC2 instances and remove them from the cluster.

------------------------------------------------------------------------

# Important Notes

### 1. Cluster Autoscaler Not Required

This command works even if **Cluster Autoscaler is not installed**.

Manual scaling directly updates the **desired size of the nodegroup**.

------------------------------------------------------------------------

### 2. NodeGroup Must Exist

The command works only for nodegroups that already exist in the cluster.

------------------------------------------------------------------------

### 3. Minimum and Maximum Limits

Scaling must stay within the limits defined for the nodegroup:

-   **Min nodes**
-   **Max nodes**
-   **Desired nodes**

If you attempt to scale beyond the max limit, the operation will fail.

------------------------------------------------------------------------

# Quick One‑Line Command

``` bash
eksctl scale nodegroup --cluster my-demo-cluster --name worker-nodes --nodes 4
```

------------------------------------------------------------------------

# Summary

Manual scaling using **eksctl** allows administrators to control the
number of nodes in an EKS cluster without relying on Cluster Autoscaler.

Key points:

-   Updates the **desired node count**
-   Uses **Auto Scaling Groups** internally
-   Works even when **Cluster Autoscaler is disabled**
-   Nodes automatically **join or leave Kubernetes cluster**
