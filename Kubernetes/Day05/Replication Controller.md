# Kubernetes Replication Controller (RC)

## What is a Replication Controller?

A **Replication Controller (RC)** is one of the core features of Kubernetes responsible for **managing the lifecycle of Pods**.

👉 Its primary responsibility is to **ensure that a specified number of Pod replicas are always running** at any point in time.

---

## Why Replication Controller is Required?

Pods by themselves are **not self-healing**.

### Problems with Pods Alone:
- If a Pod crashes, it **will not restart automatically**
- If a Pod is deleted accidentally, it **will not come back**
- Health-check failures can permanently remove a Pod

❌ This can lead to application downtime

---

## How Replication Controller Solves This Problem

A Replication Controller:
- Continuously **monitors Pod health**
- Ensures the **desired number of Pods** are always running
- Automatically **creates new Pods** if existing Pods fail or are deleted

✔ If one Pod goes down → RC creates a new Pod
✔ Desired state is always maintained

---

## Key Features of Replication Controller

- Manages **Pod replicas**
- Provides **high availability**
- Ensures **self-healing** of applications
- Uses **labels and selectors** to manage Pods
- Works on the principle of **desired state management**

> Creating an RC with **replicas = 1** ensures that **at least one Pod is always available**

---

## Relationship Between RC and Pods

- Replication Controllers and Pods are **associated using labels**
- RC uses **label selectors** to identify which Pods it manages
- Any Pod matching the selector is controlled by the RC

---

## Replication Controller Architecture (Conceptual Flow)

```
User → RC Definition → Label Selector → Matching Pods
                     ↓
           Maintains Desired Replica Count
```

---

## Example: Replication Controller YAML

```yaml
apiVersion: v1
kind: ReplicationController
metadata:
  name: javawebapprc
  namespace: test-ns
spec:
  replicas: 2
  selector:
    app: javawebapp
  template:
    metadata:
      name: javawebapprcpod
      labels:
        app: javawebapp
    spec:
      containers:
      - name: javawebapprccon
        image: harish0930/java-webapp:1.1
        ports:
        - containerPort: 8080
```

📁 **Save as:** `rc.yaml`

---

## Commands Related to Replication Controller

### Dry Run (Validation Only)

```bash
kubectl apply -f rc.yaml --dry-run=client
```

---

### Create Replication Controller

```bash
kubectl apply -f rc.yaml
```

---

### List Replication Controllers

```bash
kubectl get rc -n <namespace>
```

---

### View All Objects Created by RC

```bash
kubectl get all -n <namespace>
```

---

### Scale Replication Controller (Scale Up / Down)

```bash
kubectl scale rc <rc-name> --replicas=3 -n <namespace>
```

📌 **Scaling**: Increase number of Pods  
📌 **De-scaling**: Decrease number of Pods

---

### Describe Replication Controller

```bash
kubectl describe rc <rc-name> -n <namespace>
```

---

### Delete Replication Controller

```bash
kubectl delete rc <rc-name> -n <namespace>
```

⚠️ Deleting the RC will also delete the Pods it manages

---

## Important Notes

- Replication Controller is an **older concept**
- Mostly replaced by **ReplicaSet** and **Deployment**

---

## RC vs Pod (Quick Comparison)

| Feature | Pod | Replication Controller |
|------|-----|-------------------------|
| Self-healing | ❌ No | ✅ Yes |
| Scaling | ❌ Manual | ✅ Automatic |
| High Availability | ❌ No | ✅ Yes |
| Uses Labels | Optional | Mandatory |

---

## When to Use Replication Controller?

- Learning Kubernetes core concepts
- Understanding Pod lifecycle management
- Legacy Kubernetes environments

---

## Key Takeaways

✔ Pods alone are not reliable
✔ RC ensures Pods are always running
✔ RC uses labels & selectors
✔ RC supports scaling & self-healing
✔ Foundation for ReplicaSet & Deployment

