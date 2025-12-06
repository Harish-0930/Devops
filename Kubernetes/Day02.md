# 🌱 Kubernetes Cluster Types & Namespaces — Quick Guide

## 🚀 1. Types of Kubernetes Clusters

### **1️⃣ Single-Node Cluster**
A single machine acts as **both Control Plane and Worker Node**.  
Best suited for **learning, development, and testing**.

**Examples:**
- minikube
- kubeadm
- k3s (local setups)

> 💡 *Think of it like practicing flying a plane in a simulator — small, safe, and simple.*

---

### **2️⃣ Multi-Node Cluster (Kubedium / Self-Managed Cluster)**
Consists of **one Control Plane node** and **multiple Worker Nodes**.

✔ Used in production  
✔ High availability  
✔ Workloads are distributed across nodes

> 💡 *Like an airport with a control tower and several airplanes.*

---

### **3️⃣ Managed Kubernetes Cluster**
Cloud provider manages the **Control Plane** for you.  
You only manage Worker Nodes (or none, depending on provider).

**Examples:**
- AWS → EKS
- Google Cloud → GKE
- Azure → AKS

> 💡 *Like renting pilots and tower crew — you focus only on your applications.*

---

## 🛠 Self-Managed Cluster Notes

In self-managed clusters:

### Kubernetes handles:
- Pod failures → Pods will restart automatically.

### You must handle:
- Node failures → You need to replace or repair the node manually.

---

## 🧩 Summary of Cluster Types

| Cluster Type | Control Plane Managed By | Example Tools | Use Case |
|--------------|---------------------------|--------------|----------|
| Single Node | You | Minikube, Kindkubeadm | Learning, Dev |
| Multi Node | You | Kubespray, Kubedium | Production |
| Managed K8s | Cloud Provider | EKS, GKE, AKS | Enterprise workloads |

---

# 🔹 What is a Namespace?

A **namespace** is a way to logically divide and isolate resources inside a Kubernetes cluster.

✔ Helps organize cluster resources  
✔ Separates environments (dev, prod, test)  
✔ Controls access and resource limits

---

# 🔧 Useful Kubernetes Namespace Commands

### List all namespaces
```sh
kubectl get ns
```

### List Pods in default namespace
```sh
kubectl get po
```

### List Pods in a specific namespace
```sh
kubectl get po -n <namespace-name>
```

### List Pods in ALL namespaces
```sh
kubectl get po --all-namespaces
```

### Create a namespace
```sh
kubectl create ns <namespace-name>
```

---

# 🗂 Types of Kubernetes Objects

## 1️⃣ Namespace-Level Objects
Resources created inside a specific namespace.

### List namespace-scoped objects:
```sh
kubectl api-resources --namespaced=true
```

---

## 2️⃣ Cluster-Level Objects
Resources that exist across the entire cluster.

### List cluster-scoped objects:
```sh
kubectl api-resources --namespaced=false
```

---
