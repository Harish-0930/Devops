# Kubernetes RBAC with Amazon EKS – Practical Guide
---

# 1. Introduction

**RBAC (Role-Based Access Control)** in Kubernetes is used to control **who can access what resources in the Kubernetes cluster**.

It works by assigning permissions to **Roles** and then binding those roles to **Users, Groups, or Service Accounts**.

RBAC controls access to the **Kubernetes API Server**.

---

# 2. RBAC Core Components

## Role
- Defines a set of permissions.
- Applies **within a specific namespace**.
- Example resources:
  - pods
  - deployments
  - services

Example permissions:
- get
- list
- watch
- create
- delete

---

## RoleBinding
- Grants the permissions defined in a **Role** to a **User / Group / ServiceAccount**.
- Works **within a namespace**.

---

## ClusterRole
- Similar to a Role but works **across the entire cluster**.
- Used for:
  - Cluster-wide resources
  - Non‑namespaced resources
  - Admin-level permissions

Example resources:
- nodes
- persistentvolumes
- clusterroles

---

## ClusterRoleBinding
- Grants the permissions defined in a **ClusterRole** to a **User / Group / ServiceAccount**.
- Applies **cluster-wide**.

---

# 3. Practical Implementation (EKS + RBAC)

This lab demonstrates how to:

1. Install kubectl
2. Install AWS CLI
3. Configure AWS credentials
4. Connect to EKS
5. Add IAM user to EKS
6. Grant permissions using RBAC

---

# Step 1: Install kubectl (Windows)

Official documentation:

https://kubernetes.io/docs/tasks/tools/install-kubectl-windows/

Download using curl:

```powershell
curl.exe -LO "https://dl.k8s.io/release/v1.31.0/bin/windows/amd64/kubectl.exe"
```

Example versions:

```
v1.31.0
v1.32.0
v1.33.0
v1.34.0
```

Add kubectl path to environment variables.

Example:

```
D:\devops\k8s\rbac-practice
```

Verify installation:

```powershell
kubectl version --client
```

---

# Step 2: Install AWS CLI

Official documentation:

https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html

Download AWS CLI:

https://awscli.amazonaws.com/AWSCLIV2.msi

Install and verify:

```powershell
aws --version
```

---

# Step 3: Create IAM User

Create a new IAM user in AWS.

Give the user:

- Programmatic access
- Access Key
- Secret Key

Do NOT share credentials publicly.

Example permissions needed:

```
AmazonEKSClusterPolicy
AmazonEKSServicePolicy
AmazonEKSWorkerNodePolicy
```

---

# Step 4: Configure AWS CLI

Configure AWS credentials.

```bash
aws configure
```

Example:

```
Access Key: <your-access-key>
Secret Key: <your-secret-key>
Region: ap-south-1
Output Format: table
```

Verify identity:

```bash
aws sts get-caller-identity
```

List EKS clusters:

```bash
aws eks list-clusters
```

Update kubeconfig:

```bash
aws eks update-kubeconfig --name my-demo-cluster --region ap-south-1
```

Verify config:

```bash
cat ~/.kube/config
```

At this stage **kubectl access will fail** because the IAM user is not yet mapped in EKS.

---

# Step 5: Add IAM User to EKS (aws-auth ConfigMap)

Login to a machine that has **admin access to the cluster**.

Check aws-auth ConfigMap:

```bash
kubectl get configmap aws-auth -n kube-system
```

Edit ConfigMap:

```bash
kubectl edit configmap aws-auth -n kube-system
```

Example configuration:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: aws-auth
  namespace: kube-system
data:
  mapRoles: |
    - rolearn: arn:aws:iam::ACCOUNT_ID:role/EKS-worker-role
      username: system:node:{EC2PrivateDNSName}
      groups:
        - system:bootstrappers
        - system:nodes

  mapUsers: |
    - userarn: arn:aws:iam::ACCOUNT_ID:user/krishna
      username: krishna
      groups:
        - system:masters
```

After mapping the user, the user can authenticate to the cluster.

However, authorization will still depend on RBAC roles.

---

# Step 6: Create Role and RoleBinding

This example gives **read-only access to pods** in the `default` namespace.

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: default
  name: pod-reader
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "watch", "list"]
```

RoleBinding:

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-pods
  namespace: default
subjects:
- kind: User
  name: hari
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
```

Now the user can run:

```
kubectl get pods -n default
```

But cannot create or delete pods.

---

# Step 7: Cluster Admin Access (ClusterRole)

ClusterRole giving **full cluster access**.

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: fullaccesscr
rules:
- apiGroups: ["*"]
  resources: ["*"]
  verbs: ["*"]
```

ClusterRoleBinding:

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: fullaccess
subjects:
- kind: User
  name: hari
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: ClusterRole
  name: fullaccesscr
  apiGroup: rbac.authorization.k8s.io
```

This user now has **full admin access to the cluster**.

Equivalent to:

```
cluster-admin
```

---

# 8. Quick Revision Table

| Component | Scope | Purpose |
|----------|------|------|
| Role | Namespace | Defines permissions |
| RoleBinding | Namespace | Assigns Role to user |
| ClusterRole | Cluster | Defines cluster permissions |
| ClusterRoleBinding | Cluster | Assigns ClusterRole |

---

# 9. Useful Debug Commands

Check permissions:

```
kubectl auth can-i get pods --as=username
```

List roles:

```
kubectl get roles -A
```

List role bindings:

```
kubectl get rolebindings -A
```

List cluster roles:

```
kubectl get clusterroles
```

List cluster role bindings:

```
kubectl get clusterrolebindings
```

---

# 10. Best Practices

- Avoid giving `cluster-admin` access unless necessary
- Prefer **namespace-level roles**
- Use **least privilege principle**
- Use **groups instead of individual users**
- Regularly audit RBAC permissions


