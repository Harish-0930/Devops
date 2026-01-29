
# **Kubernetes Resource Requests & Limits**

In Kubernetes, every container can define **how much CPU & Memory it needs**.

| Term         | Meaning                                          | Who uses it?                               |
| ------------ | ------------------------------------------------ | ------------------------------------------ |
| **Requests** | Minimum guaranteed resource for the container    | **Scheduler** (decides where Pod will run) |
| **Limits**   | Maximum resource the container is allowed to use | **Kubelet / cgroup** (enforces usage)      |

---

## **Simple Real Life Example**

Imagine your **Pod is a student** and **Node is a hostel room**:

* **Requests = Minimum guaranteed facilities** (bed + chair)
* **Limits = Maximum allowed usage** (cannot occupy entire hall)

So,

* If a Node **does not have enough requested resources**, the Pod **will never be scheduled there**.
* If the container tries to use **more than limit**, Kubernetes **kills or throttles it**.

---

## **Understanding Your Deployment Example**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: javawebappdeploy
  namespace: test-ns
spec:
  replicas: 5
  strategy:
    type: RollingUpdate
  selector:
    matchLabels:
      app: javawebapp
  template:
    metadata:
      name: javawebapppod
      labels:
        app: javawebapp
    spec:
      containers:
      - name: javawebappcon
        image: harish0930/java-web-app
        resources:
          requests:
            memory: "256Mi"
            cpu: "600m"
          limits:
            memory: "256Mi"
            cpu: "900m"
        ports:
        - containerPort: 8080
---
apiVersion: v1
kind: Service
metadata:
  name: javawebappsvc
  namespace: test-ns
spec:
  type: NodePort
  selector:
    app: javawebapp
  ports:
  - port: 80
    targetPort: 8080
    # NodePort range: 30000 - 32767

```

### **Requests**

* **CPU:** `600m` → means **0.6 vCPU**
* **Memory:** `256Mi` → container must get at least **256 MB** allocated

If a node **does not have 0.6 CPU or 256Mi RAM free → the Pod won't be scheduled there.**

### **Limits**

* **Memory limit = 256Mi**
  If app tries to use **more than 256Mi** → **OOMKill** (container restarts)
* **CPU limit = 900m**
  The container can temporarily use up to **0.9 vCPU**, but if it tries more → **CPU throttling** occurs.

---

## **How Scheduler Decides Pod Placement (Real Teaching Point)**

Kubernetes checks each node:

```
Node Free CPU >= 600m ?
Node Free Memory >= 256Mi ?
```

If **Yes → Schedule Pod**
If **No → Try next node**

---

# **Commands to Demonstrate Live**

### 1️⃣ Deploy

```bash
kubectl apply -f java-deploy.yaml
```

### 2️⃣ Check Pods and Node Placement

```bash
kubectl get pods -n test-ns -o wide
```

### 3️⃣ Check Resource Usage

```bash
kubectl top pods -n test-ns
```

### 4️⃣ Check Node Capacity and Allocation

```bash
kubectl describe node <node-name> | grep -A5 "Allocated resources"
```

### 5️⃣ Describe Pod to Show Requests & Limits

```bash
kubectl describe pod <pod-name> -n test-ns
```

You will see:

```
Requests:
  cpu: 600m
  memory: 256Mi
Limits:
  cpu: 900m
  memory: 256Mi
```

---
