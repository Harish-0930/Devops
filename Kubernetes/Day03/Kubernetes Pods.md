# 📦 Kubernetes Pods

## 🚀 What is a Pod?
A **Pod** is the **smallest deployable unit** in Kubernetes.

A Pod can contain:
- **1 or more containers** (usually Docker containers)
- Containers in the same pod share:
  - Same **network** (IP & port space)
  - Same **storage volumes**
  - Same **lifecycle**

> 🔍 **Think of a Pod like a wrapper around one or more containers that work together.**

---

## 🧱 Pod Characteristics
### ✔ Ephemeral
Pods are **temporary**. If a pod dies, Kubernetes **does not recreate** it automatically unless a controller manages it.

### ✔ Should Not Be Used Directly for Production
Instead, use controllers:
- **ReplicaSet**
- **Deployment**
- **DaemonSet**
- **StatefulSet**

These ensure pods restart automatically.

---

## 🧩 Pod Models

### 1️⃣ **Single-Container Pod**
- Most common model
- Pod acts as a wrapper for **one container**

### 2️⃣ **Multi-Container Pod (Sidecar Pattern)**
- Pod contains multiple containers working together
- Examples of sidecars:
  - Logging agents
  - Monitoring agents
  - Proxy containers

---

# 🔄 Pod Lifecycle (Step-by-Step)

1. **You send Pod YAML → API Server**
2. API Server stores details in **etcd**
3. **Scheduler** picks a node for the pod
4. **Kubelet** on that node instructs container runtime (Docker/containerd) to create containers
5. Pod state is continuously persisted in **etcd**

---

# 📜 Pod YAML Syntax

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: webserverpod
  labels:
    app: webserver
  namespace: webserver
spec:
  containers:
    - name: nginxcontainer
      image: nginx:latest
      ports:
        - containerPort: 80
      env:
        - name: ENVIRONMENT
          value: PRODUCTION
```

Save with `.yaml` or `.yml`.

### Apply the Pod:
```sh
kubectl apply -f app1.yml
```

---

# 🧪 Pod Sanity Check (Dry Run)

### Client-side validation:
```sh
kubectl apply -f app1.yml --dry-run=client
```

### Server-side validation:
```sh
kubectl apply -f app1.yml --dry-run=server
```

> Dry-run = validate YAML without creating the pod.

### Debug YAML with verbosity:
```sh
kubectl apply -f app1.yml -v=8
```

---

# 🕵️ Identify Where Pod is Running

```sh
kubectl get pod -o wide
```

Get node for a specific namespace:
```sh
kubectl get po -o wide -n webserver
```

---

# 🔍 Describe Pod (Full Details)

```sh
kubectl describe pod webserverpod -n webserver
```

---

# 🐚 Exec into a Container

```sh
kubectl exec -it webserverpod -c nginxcontainer -n webserver -- /bin/bash
```

List containers inside a Pod:
```sh
kubectl get pod webserverpod -o jsonpath='{.spec.containers[*].name}'
```

---

# ❌ Delete a Pod

```sh
kubectl delete pod webserverpod -n webserver
```

---

# 🧰 Kubernetes Important Commands

### 1. List all API resources
```sh
kubectl api-resources
```

### 2. List all namespaces
```sh
kubectl get ns
```

### 3. List pods in default namespace
```sh
kubectl get po
```

### 4. List pods in specific namespace
```sh
kubectl get po -n <namespace-name>
```

### 5. List pods in all namespaces
```sh
kubectl get po --all-namespaces
```

### 6. Create a namespace
```sh
kubectl create ns <namespace-name>
```

### 7. List namespace-scoped objects
```sh
kubectl api-resources --namespaced=true
```

### 8. List cluster-scoped objects
```sh
kubectl api-resources --namespaced=false
```

---

# 🔧 Additional Useful Commands

### Get Pod Events
```sh
kubectl get events --sort-by='.metadata.creationTimestamp'
```

### Describe Node
```sh
kubectl describe node <node-name>
```

### Logs of a Pod
```sh
kubectl logs webserverpod -n webserver
```

### Logs of a specific container
```sh
kubectl logs webserverpod -c nginxcontainer -n webserver
```

---

# 🎯 Summary

| Concept | Description |
|--------|-------------|
| Pod | Smallest deployable unit |
| Single-container Pod | Most common type |
| Multi-container Pod | Uses sidecar/utility containers |
| Dry Run | Checks YAML validity |
| Describe Pod | View detailed info |
| Exec | Get inside container |

---


