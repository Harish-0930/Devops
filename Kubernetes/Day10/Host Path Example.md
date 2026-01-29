# Kubernetes App with HostPath Volume (MongoDB)

This guide explains how to deploy a Spring Boot application with MongoDB using **HostPath volumes**, apply Kubernetes manifests, access the application, and verify data persistence on the host.

---

## 📦 Prerequisites

- Kubernetes cluster (Minikube / kubeadm / EKS / AKS / GKE)
- `kubectl` configured
- Node access (required for HostPath verification)

---

## 🗂️ Directory Structure (Recommended)

```bash
k8s-hostpath-demo/
├── app-deployment.yaml
├── app-service.yaml
├── mongo-rs.yaml
└── mongo-service.yaml
```

---

## 🚀 Step 1: Apply Kubernetes Manifests

### Create Namespace (if not already created)
```bash
kubectl create namespace test-ns
```

### Apply App Deployment
```bash
kubectl apply -f app-deployment.yaml
```

### Apply App Service
```bash
kubectl apply -f app-service.yaml
```

### Apply MongoDB ReplicaSet
```bash
kubectl apply -f mongo-rs.yaml
```

### Apply MongoDB Service
```bash
kubectl apply -f mongo-service.yaml
```

---

## 🔍 Step 2: Verify Resources

### Check Pods
```bash
kubectl get pods -n test-ns
```

### Check Services
```bash
kubectl get svc -n test-ns
```

### Describe Pods (Debugging)
```bash
kubectl describe pod <pod-name> -n test-ns
```

---

## 🌐 Step 3: Access the Application

### Get NodePort
```bash
kubectl get svc springappsvc -n test-ns
```

Output example:
```text
NAME           TYPE       CLUSTER-IP     PORT(S)
springappsvc   NodePort   10.96.20.15    80:31234/TCP
```

### Access via Browser / Curl
```bash
http://<NODE-IP>:31234
```

Get Node IP:
```bash
kubectl get nodes -o wide
```

---

## 🗄️ Step 4: Verify MongoDB Data Persistence (HostPath)

### 1️⃣ SSH into Node (or Minikube)
```bash
ssh <node-ip>
```

For Minikube:
```bash
minikube ssh
```

### 2️⃣ Check HostPath Directory
```bash
ls -l /mongobkp
```

You should see MongoDB data files like:
```text
WiredTiger
collection-0--123456.wt
index-1--123456.wt
```

### 3️⃣ Verify Volume Mount from Pod
```bash
kubectl exec -it <mongo-pod-name> -n test-ns -- df -h
```

### 4️⃣ Check Data Directory Inside Container
```bash
kubectl exec -it <mongo-pod-name> -n test-ns -- ls /data/db
```

---

## 🧪 Step 5: Test MongoDB Data Persistence

### Insert Sample Data
```bash
kubectl exec -it <mongo-pod-name> -n test-ns -- mongosh -u devdb -p devdb@123
```

```javascript
use testdb
db.users.insertOne({ name: "Hari", role: "DevOps" })
```

### Restart Mongo Pod
```bash
kubectl delete pod <mongo-pod-name> -n test-ns
```

### Verify Data Exists
```javascript
db.users.find()
```





# app-deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: springapp
  namespace: test-ns 
spec:
  replicas: 2
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
        image: harish0930/java-web-app
        ports:
        - containerPort: 8080
        env:
        - name: MONGO_DB_HOSTNAME
          value: mongosvc
        - name: MONGO_DB_USERNAME
          value: devdb
        - name: MONGO_DB_PASSWORD
          value: devdb@123
```

# app-service.yaml
```yaml
apiVersion: v1
kind: Service
metadata:
  name: springappsvc
  namespace: test-ns
spec:
  type: NodePort
  selector:
    app: springapp
  ports:
  - port: 80
    targetPort: 8080
```


# mongo-rs.yaml
```yaml
apiVersion: apps/v1
kind: ReplicaSet
metadata: 
  name: mongodb
  namespace: test-ns
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
      - name: mongocon
        image: mongo
        ports:
        - containerPort: 27017
        env:
        - name: MONGO_INITDB_ROOT_USERNAME
          value: devdb
        - name: MONGO_INITDB_ROOT_PASSWORD
          value: devdb@123
        volumeMounts:
        - name: mongovol
          mountPath: /data/db
      volumes:
      - name: mongovol
        hostPath:
          path: /mongobkp
          
```

# mongo-service.yaml
```yaml
apiVersion: v1
kind: Service
metadata:
  name: mongosvc
  namespace: test-ns
spec:
  type: ClusterIP
  selector:
    app: mongodb
  ports:
    - port: 27017
      targetPort: 27017
```
