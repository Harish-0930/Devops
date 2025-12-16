# Kubernetes ReplicaSet (RS)

## What is a ReplicaSet?

A **ReplicaSet (RS)** is a Kubernetes controller that ensures a **specified number of Pod replicas are running at all times**.

👉 ReplicaSet is considered the **next‑generation version of Replication Controller (RC)**.

---

## Why ReplicaSet Was Introduced?

Replication Controller (RC) had limitations:
- RC does **not directly integrate with Deployment objects**
- RC supports **only equality‑based selectors**
- Less flexible and considered legacy

### ReplicaSet Improvements

- ReplicaSet **directly works with Deployment**
- Supports **equality‑based and set‑based selectors**
- More flexible and powerful
- Actively used in modern Kubernetes

---

## RC vs ReplicaSet Comparison

| Feature | Replication Controller (RC) | ReplicaSet (RS) |
|------|-----------------------------|-----------------|
| Status | Deprecated | Active |
| Selector Support | Equality‑based only | Equality + Set‑based |
| Used by Deployment | ❌ No | ✅ Yes |
| Flexibility | Low | High |
| Kubernetes Version | Older | Modern |
| Selector Requirement | Optional | Mandatory |

---

## Key Features of ReplicaSet

- Maintains the **desired number of Pods**
- Provides **self‑healing**
- Supports **advanced label selectors**
- Works as the **backend controller for Deployments**
- Uses **labels and selectors** to manage Pods

---

## Label Selector Support

### Equality‑Based Selectors (RC & RS)

```yaml
app: javawebapp
```

---

### Set‑Based Selectors (ReplicaSet Only)

```yaml
key in (value1, value2)
key notin (value1, value2)
```

Example:
```yaml
matchExpressions:
- key: app
  operator: In
  values:
  - javawebapp1
  - javawebapp2
```

---

## Important Difference (Must Remember)

- **RC selector is optional**
- **ReplicaSet selector is mandatory**

If selector and pod labels do not match, **Pods will not be created**.

---

## ReplicaSet Syntax (General)

```yaml
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: <rs-name>
  namespace: <namespace>
spec:
  replicas: 3
  selector:
    matchLabels:
      <key>: <value>
    matchExpressions:
    - key: <key>
      operator: In
      values:
      - <value1>
      - <value2>
  template:
    metadata:
      labels:
        <key>: <value>
    spec:
      containers:
      - name: <container-name>
        image: <image-name>
        ports:
        - containerPort: <port>
```

---

## Example 1: ReplicaSet with Equality‑Based Selector

```yaml
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: javawebapprs
  namespace: prod
spec:
  replicas: 2
  selector:
    matchLabels:
      app: javawebapp
  template:
    metadata:
      labels:
        app: javawebapp
    spec:
      containers:
      - name: javawebapp
        image: harish0930/java-webapp:1.1
        ports:
        - containerPort: 8080
```

---

## Service for the Above ReplicaSet

```yaml
apiVersion: v1
kind: Service
metadata:
  name: javawebappsvc
  namespace: prod
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

## Example 2: ReplicaSet with Set‑Based Selector

```yaml
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: javawebapprs
  namespace: test-ns
spec:
  replicas: 3
  selector:
    matchExpressions:
    - key: app
      operator: In
      values:
      - javawebapp1
      - javawebapp2
      - javawebapp
  template:
    metadata:
      labels:
        app: javawebapp1
    spec:
      containers:
      - name: javawebapp
        image: harish0930/java-webapp:1.1
        ports:
        - containerPort: 8080
```

---

## Service for Set‑Based ReplicaSet

```yaml
apiVersion: v1
kind: Service
metadata:
  name: javawebappsvc
  namespace: test-ns
spec:
  type: NodePort
  selector:
    app: javawebapp1
  ports:
  - port: 80
    targetPort: 8080
    nodePort: 30080
```

---

## ReplicaSet Commands

### Create ReplicaSet

```bash
kubectl apply -f rs.yaml
```

### Dry Run

```bash
kubectl apply -f rs.yaml --dry-run=client
```

### List ReplicaSets

```bash
kubectl get rs -n <namespace>
```

### View All Objects

```bash
kubectl get all -n <namespace>
```

### Describe ReplicaSet

```bash
kubectl describe rs <rs-name> -n <namespace>
```

### Scale ReplicaSet

```bash
kubectl scale rs <rs-name> --replicas=5 -n <namespace>
```

### Delete ReplicaSet

```bash
kubectl delete rs <rs-name> -n <namespace>
```

⚠️ Deleting the ReplicaSet will also delete its Pods.

---

## Important Notes

- ReplicaSets are **rarely created directly** in production
- Usually managed automatically by **Deployments**
- Understanding RS is critical to understand Deployments

---

## Key Takeaways

✔ ReplicaSet replaces Replication Controller
✔ Supports advanced selectors
✔ Selector is mandatory
✔ Backend controller for Deployments
✔ Ensures availability and scaling
