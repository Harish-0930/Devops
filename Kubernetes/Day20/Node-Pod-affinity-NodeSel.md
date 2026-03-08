# Kubernetes Pod Scheduling Techniques  
## Node Selector, Node Affinity, Pod Affinity & Anti-Affinity (Complete Guide)

---

## 1. Node Selector (Basic Node Selection)

### Concept:
Node Selector is the simplest way to schedule Pods on specific Nodes by using Node Labels.

---

### Real-Time Use Case:
Schedule Database Pods only on Nodes with SSD disks.

---

### Step-by-Step Commands:

1. Label the Node:
```bash
kubectl label nodes node1 disk=ssd
```

2. Check Node Labels:
```bash
kubectl get nodes --show-labels
```

3. Pod YAML Using Node Selector:
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: db-pod
spec:
  nodeSelector:
    disk: ssd
  containers:
  - name: mysql
    image: mysql
    env:
    - name: MYSQL_ROOT_PASSWORD
      value: mypassword  # Replace with strong password

```

4. Apply Pod:
```bash
kubectl apply -f db-pod.yaml
```

---

### Troubleshooting:
If Pod is Pending:
```bash
kubectl describe pod db-pod
```
Check Node Labels, Spelling Errors, or Label Mismatches.

---

Remove Node Label:
```bash
kubectl label nodes node1 disk-
```

---

## 2. Node Affinity (Advanced Node Selection)

### Concept:
Node Affinity offers advanced Pod scheduling with flexible matching rules, supporting multiple conditions.

---

### Types:
- requiredDuringSchedulingIgnoredDuringExecution (Hard Rule)
- preferredDuringSchedulingIgnoredDuringExecution (Soft Rule)

---

### Real-Time Use Case:
Schedule Pods only on Nodes in Region `us-east` and Zone `zone1`.

---

### Step-by-Step Commands:

1. Label Nodes:
```bash
kubectl label nodes ip-192-168-17-235.ap-south-1.compute.internal region=ap-south-1 zone=ap-south-1c
kubectl label nodes ip-192-168-59-88.ap-south-1.compute.internal region=ap-south-1 zone=ap-south-1a

```

2. Check Labels:
```bash
kubectl get nodes --show-labels
```

3. Pod YAML with Required Node Affinity:
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: web-app-pod
spec:
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
        - matchExpressions:
          - key: region
            operator: In
            values:
            - ap-south-1
          - key: zone
            operator: In
            values:
            - ap-south-1c
  containers:
  - name: nginx
    image: nginx

```

4. Apply Pod:
```bash
kubectl apply -f web-app-pod.yaml
```

---

### Troubleshooting:
If Pod is Pending:
```bash
kubectl describe pod web-app-pod
```
Check Node Labels, Operators, Typing Mistakes.

---

Preferred Node Affinity Example:
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: web-app-pod
spec:
  affinity:
    nodeAffinity:
      preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        preference:
          matchExpressions:
          - key: region
            operator: In
            values:
            - ap-south-1
          - key: zone
            operator: In
            values:
            - ap-south-1b
  containers:
  - name: nginx
    image: nginx

```

---

Operators Summary:
| Operator     | Meaning                          |
|--------------|----------------------------------|
| In           | Match Labels in Given List       |
| NotIn        | Exclude Labels in Given List     |
| Exists       | Key Must Exist                   |
| DoesNotExist | Key Must Not Exist               |
| Gt, Lt       | Greater/Less Than for Numbers    |

---

## 3. Pod Affinity & Anti-Affinity (Pod-to-Pod Placement)

### Concept:
Schedule Pods based on the location of other Pods.

---

| Feature          | Purpose                         |
|------------------|--------------------------------|
| Pod Affinity     | Schedule Pods Together          |
| Pod Anti-Affinity| Schedule Pods Apart             |

---

### Key Term:
`topologyKey` defines the scope (Common: `kubernetes.io/hostname` for same Node).

---

### Real-Time Use Case:
- Pod Affinity for Web + Redis (Fast Communication)
- Pod Anti-Affinity for Replica Spreading (High Availability)

---

### Step-by-Step Example:

1. Deploy Frontend Pod:
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: frontend-pod
  labels:
    app: frontend
spec:
  containers:
  - name: nginx
    image: nginx
```

Apply:
```bash
kubectl apply -f frontend-pod.yaml
```

---

2. Pod Affinity Example:
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: backend-pod-affinity
spec:
  affinity:
    podAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
      - labelSelector:
          matchExpressions:
          - key: app
            operator: In
            values:
            - frontend
        topologyKey: "kubernetes.io/hostname"
  containers:
  - name: nginx
    image: nginx
```

Apply:
```bash
kubectl apply -f backend-pod-affinity.yaml
```

---

3. Pod Anti-Affinity Example:
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: backend-pod-anti-affinity
spec:
  affinity:
    podAntiAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
      - labelSelector:
          matchExpressions:
          - key: app
            operator: In
            values:
            - frontend
        topologyKey: "kubernetes.io/hostname"
  containers:
  - name: nginx
    image: nginx
```

Apply:
```bash
kubectl apply -f backend-pod-anti-affinity.yaml
```

---

Operators Summary:
| Operator     | Meaning                          |
|--------------|----------------------------------|
| In           | Match Specific Pods               |
| NotIn        | Exclude Specific Pods             |
| Exists       | Match Any Pod with the Label Key  |
| DoesNotExist | No Pod with the Label Key         |

---

### Troubleshooting:
If Pod is Pending:
```bash
kubectl describe pod pod-name
```
Verify:
- Required Pods are Running
- Correct Labels
- Correct topologyKey

---

## Summary Table (Quick Revision):

| Feature            | Purpose                            | YAML Field                            |
|--------------------|-----------------------------------|---------------------------------------|
| Node Selector      | Match Node Labels Exactly          | nodeSelector                          |
| Node Affinity Hard | Must Match Node Affinity           | requiredDuringSchedulingIgnoredDuringExecution |
| Node Affinity Soft | Prefer Matching Node Affinity      | preferredDuringSchedulingIgnoredDuringExecution |
| Pod Affinity       | Schedule Near Specific Pods        | affinity → podAffinity                |
| Pod Anti-Affinity  | Avoid Pods on Same Node            | affinity → podAntiAffinity            |

---

##  Plan Flow:
1. Explain Node Selector (Simple Case).
2. Move to Node Affinity (Advanced, with Hard/Soft Rules).
3. Explain Pod Affinity (Pod Co-location).
4. Explain Pod Anti-Affinity (Spread Pods Apart).
5. Show Practical Demos.
6. Teach Troubleshooting with `kubectl describe`.

---

## Command Cheat Sheet:

| Task                          | Command                                      |
|-------------------------------|----------------------------------------------|
| Label Node                    | kubectl label nodes node-name key=value       |
| Check Node Labels              | kubectl get nodes --show-labels               |
| Apply Pod                      | kubectl apply -f pod.yaml                    |
| Describe Pod                   | kubectl describe pod pod-name                |
| Remove Node Label              | kubectl label nodes node-name key-            |

---
