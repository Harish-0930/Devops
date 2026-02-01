# 🚀 Amazon EKS (Elastic Kubernetes Service) – Setup Guide

This document provides a **step-by-step guide to set up Amazon EKS** using a **dedicated EC2 setup (bastion) instance**, which is a common **real-time DevOps practice** in enterprises.

---

## 📌 What is Amazon EKS?

**Amazon Elastic Kubernetes Service (EKS)** is a fully managed Kubernetes service that simplifies running Kubernetes on AWS without managing the control plane.

AWS manages:
- Kubernetes API server
- etcd
- Control plane HA & security

You manage:
- Worker nodes
- Applications
- IAM & networking

---

## 🧱 High-Level Architecture

- **Setup / Bastion EC2 Instance** (CLI operations)
- **EKS Control Plane** (AWS managed)
- **Managed Node Groups (EC2)**
- **VPC with public & private subnets**
- **IAM roles & policies**

---

## 🛠️ Prerequisites

- AWS Account
- IAM user with AdministratorAccess or EKS permissions
- Key Pair for EC2
- Internet Gateway enabled VPC

---

## 🖥️ Step 1: Create Setup (Bastion) EC2 Instance

> This EC2 instance is used to run `aws`, `kubectl`, and `eksctl` commands.

### EC2 Configuration

- **AMI**: Amazon Linux 2
- **Instance Type**: t2.micro / t3.micro
- **VPC**: Default or custom VPC
- **Subnet**: Public subnet
- **Security Group**:
  - SSH (22) – Your IP

### Connect to EC2

```bash
ssh -i eks-key.pem ec2-user@<EC2_PUBLIC_IP>
```

---

## 🔧 Step 2: Install Required Tools on EC2

### Install AWS CLI

```bash
sudo yum install awscli -y
aws --version
```

### Install kubectl

```bash
curl -O https://s3.us-west-2.amazonaws.com/amazon-eks/1.29.0/2024-01-04/bin/linux/amd64/kubectl
chmod +x kubectl
sudo mv kubectl /usr/local/bin/
kubectl version --client
```

### Install eksctl

```bash
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_Linux_amd64.tar.gz" | tar xz -C /tmp

sudo mv /tmp/eksctl /usr/local/bin
eksctl version
```

---

## 🔐 Step 3: Configure AWS CLI

```bash
aws configure
```

Provide:
- Access Key
- Secret Key
- Region (example: ap-south-1)

---

## 🌐 Step 4: Create EKS Cluster

```bash
eksctl create cluster \
  --name my-eks-cluster \
  --region ap-south-1 \
  --nodegroup-name standard-workers \
  --node-type t3.medium \
  --nodes 2 \
  --nodes-min 1 \
  --nodes-max 3 \
  --managed
```

⏳ Takes ~10–15 minutes.

---

## 📦 Step 5: Configure kubeconfig

```bash
aws eks --region ap-south-1 update-kubeconfig --name my-eks-cluster
kubectl get nodes
```

---

## 🧪 Step 6: Validate Cluster

```bash
kubectl get pods -A
```

Expected namespaces:
- kube-system
- default

---

## 📊 Step 7: Deploy Sample Application

```bash
kubectl create deployment nginx --image=nginx
kubectl expose deployment nginx --type=LoadBalancer --port=80
kubectl get svc
```

Access via **EXTERNAL-IP**.

---

## 🔐 Step 8: IAM & RBAC (Optional)

```bash
kubectl edit configmap aws-auth -n kube-system
```

Used to map IAM users/roles to Kubernetes RBAC.

---

## 🧹 Step 9: Cleanup Resources

```bash
eksctl delete cluster --name my-eks-cluster --region ap-south-1
```

(Optional)
```bash
aws ec2 terminate-instances --instance-ids <EC2_ID>
```

---

## 📂 Recommended Repo Structure

```text
eks-setup/
├── README.md
├── manifests/
│   ├── deployment.yaml
│   └── service.yaml
```

---

## 🧠 Real-Time Best Practices

- Use **bastion EC2** for cluster administration
- Prefer **Managed Node Groups**
- Enable **CloudWatch logging**
- Use **IAM Roles for Service Accounts (IRSA)**
- Keep nodes in **private subnets**

---

## 🏁 Summary

✔ Enterprise-style EKS setup  
✔ Secure and production-ready  
✔ Easy to extend with CI/CD, HPA, Ingress  

---

## 📎 References

- https://docs.aws.amazon.com/eks/
- https://eksctl.io/
