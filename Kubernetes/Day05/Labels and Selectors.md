# Kubernetes Labels, Selectors, Services



## 1. Labels in Kubernetes

### What are Labels?

Labels are **key‑value pairs** attached to Kubernetes objects such as Pods, Services, ReplicaSets, and Deployments.

👉 **Purpose:**
- Help one Kubernetes object **identify and find another object**
- Act like **tags** in Kubernetes
- Fully **user‑defined**

### Example Labels

```yaml
labels:
  app: nginx
  role: web
  env: dev
```

---

## 2. Selectors in Kubernetes

### What are Selectors?

A Service in Kubernetes is an object that provides a stable network identity to access a set of Pods.

Selectors are used to **filter and select objects based on labels**.

👉 **Purpose:**
- Match a group of Pods
- Used by Services, ReplicaSets, Deployments, etc.

### Selector Examples

```yaml
selectors:
  env: dev
  app: nginx
```

Advanced selector examples:

```
app != db
release in (1.3, 1.4)
```

---

## 3. Labels & Selectors in Action (Pod Example)

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: javawebapptest
  namespace: prod
  labels:
    app: javawebappTest
    env: prod
spec:
  containers:
  - name: javawebapp1
    image: harish0930/java-webapp:1.1
    ports:
    - containerPort: 8080
```

### Commands

```bash
kubectl apply -f javawebapp.yaml --dry-run=client
kubectl apply -f javawebapp.yaml
```

---

## 4. Useful Label‑Related Commands

### Describe Pod (includes labels)

```bash
kubectl describe pod <pod-name> -n <namespace>
```

### Show only labels

```bash
kubectl get pod <pod-name> -n <namespace> --show-labels
```

### Show Pod & Node IPs

```bash
kubectl get pods -n <namespace> -o wide
```

### Enter into a Pod

```bash
kubectl exec -it <pod-name> -n <namespace> -- sh
```

---

## 5. Why Do We Need a Kubernetes Service?

### Problem Without Service

- Pods communicate using **Pod IPs**
- Pod IPs are **not stable**
- When a Pod crashes, IP **changes**
- Multiple replicas → **multiple IPs**

❌ Not reliable

---

### Solution: Kubernetes Service

A **Service** provides:
- A **stable network identity**
- Load‑balancing across Pods
- Discovery using **labels & selectors**

> **A Service identifies Pods using Label Selectors**

---

## 6. Types of Kubernetes Services

### 1. ClusterIP (Default)

- Accessible **only inside the cluster**
- Used for **Pod‑to‑Pod communication**
- Gets a **virtual IP** registered in kube‑dns

```yaml
apiVersion: v1
kind: Service
metadata:
  name: javawebappsvc
  namespace: prod
spec:
  type: ClusterIP
  selector:
    app: javawebapp
  ports:
  - port: 80
    targetPort: 8080
```

👉 Traffic flow:

```
Client Pod → ClusterIP → kube‑proxy → Pod IP
```

---

### 2. NodePort

- Exposes the app using:

```
<NodeIP>:<NodePort>
```

- NodePort range: **30000–32767**
- Automatically creates a ClusterIP

```yaml
apiVersion: v1
kind: Service
metadata:
  name: javawebappsvcnp
  namespace: test-ns
spec:
  type: NodePort
  selector:
    app: javawebapp
  ports:
  - port: 80
    targetPort: 8080
    nodePort: 30080
```

---

### 3. LoadBalancer

- Used in **cloud environments** (AWS, Azure, GCP)
- Creates an external load balancer
- Routes traffic to NodePort → ClusterIP → Pods


