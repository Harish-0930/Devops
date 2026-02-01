# Kubernetes Network Policies – Complete Guide

## What are Network Policies?
Network Policies in Kubernetes are used to control **traffic flow between Pods and external endpoints**.
They act as a **firewall at the Pod level**, allowing you to define **who can talk to whom**.

Without Network Policies:
- All Pods can communicate with each other across namespaces.
- Any Pod can reach any Service.

With Network Policies:
- Traffic is **DENIED by default** once a policy selects a Pod.
- Only **explicitly allowed traffic** is permitted.

> ⚠️ Network Policies work only if your cluster uses a **network plugin that supports them** (Calico, Cilium, Weave, etc.)

---

## Key Concepts

### 1. Namespace Scope
- Network Policies are **namespace‑scoped**
- A policy affects only Pods in the namespace where it is created

### 2. Selectors
Selectors decide **which Pods the policy applies to**

- **Pod Selector** → Selects Pods inside the same namespace
- **Namespace Selector** → Allows traffic from Pods in other namespaces

### 3. Policy Types
- **Ingress** → Controls incoming traffic
- **Egress** → Controls outgoing traffic
- Can define **Ingress, Egress, or both**

---

## Application Setup (No Network Policies)

### Architecture
```
springapp  --->  mongodb
javawebapp --->  mongodb
nginx      --->  mongodb
```

All communication is allowed.

---

## MongoDB ReplicaSet & Service

```yaml
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: mongodb
  namespace: prod
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mongodb
  template:
    metadata:
      labels:
        app: mongodb
    spec:
      containers:
      - name: mongodb
        image: mongo
        ports:
        - containerPort: 27017
        env:
        - name: MONGO_INITDB_ROOT_USERNAME
          value: devdb
        - name: MONGO_INITDB_ROOT_PASSWORD
          value: devdb@123
---
apiVersion: v1
kind: Service
metadata:
  name: mongosvc
  namespace: prod
spec:
  type: ClusterIP
  selector:
    app: mongodb
  ports:
  - port: 27017
    targetPort: 27017
```

---

## Spring Boot App & Service

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: springapp
  namespace: prod
spec:
  replicas: 1
  selector:
    matchLabels:
      app: springapp
  template:
    metadata:
      labels:
        app: springapp
    spec:
      containers:
      - name: springapp
        image: harish0930/java-web-app:1.0.0
        ports:
        - containerPort: 8080
        env:
        - name: MONGO_DB_HOSTNAME
          value: mongosvc
---
apiVersion: v1
kind: Service
metadata:
  name: springappsvc
  namespace: prod
spec:
  type: NodePort
  selector:
    app: springapp
  ports:
  - port: 80
    targetPort: 8080
```

---

## Java Web App & Service

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: javawebapp
  namespace: prod
spec:
  replicas: 1
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
        image: harish0930/java-web-app:latest
        ports:
        - containerPort: 8080
---
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
```

---

## Connectivity Test (Before Network Policy)

```bash
kubectl exec -it <pod-name> -n prod -- curl telnet://mongosvc:27017
```

✅ Connection successful from:
- springapp
- javawebapp
- nginx (default namespace using FQDN)

---

## Applying Network Policies

### Example 1: Generic Network Policy (Reference)

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: sample-network-policy
  namespace: prod
spec:
  podSelector:
    matchLabels:
      app: springapp
  policyTypes:
  - Ingress
  - Egress
```

---

## Example 2: Allow Only Spring App → MongoDB

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: mongodb-allow-spring
  namespace: prod
spec:
  podSelector:
    matchLabels:
      app: mongodb
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: springapp
    ports:
    - protocol: TCP
      port: 27017
```

### Apply Policy
```bash
kubectl apply -f networkpolicy.yaml
kubectl get netpol -n prod
```

---

## Validation

| Source Pod | Result |
|----------|--------|
| springapp | ✅ Allowed |
| javawebapp | ❌ Blocked |
| nginx | ❌ Blocked |

---

## Allow Multiple Applications

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: mongodb-allow-multiple-apps
  namespace: prod
spec:
  podSelector:
    matchLabels:
      app: mongodb
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: springapp
    - podSelector:
        matchLabels:
          app: javawebapp
    ports:
    - protocol: TCP
      port: 27017
```

---

## Allow Traffic from Specific Namespace

```yaml
- namespaceSelector:
    matchLabels:
      ns: test-ns
```

> Namespace must be labeled first:
```bash
kubectl label namespace test-ns ns=test-ns
```

---

## Key Takeaways

- Network Policies are **deny‑all once applied**
- Always allow **DNS (UDP 53)** if using Egress rules
- Policies are **additive**
- Labels are critical — wrong labels = blocked traffic
