# Kubernetes MongoDB with NFS Volume – Complete Setup Guide

This document explains **end-to-end NFS server setup**, **Kubernetes client configuration**, and **MongoDB deployment using NFS volume** with all relevant commands.

---

## 🧱 Architecture Overview

- **NFS Server**: Dedicated EC2 instance
- **Clients**: All Kubernetes worker nodes
- **Storage Type**: NFS (shared network storage)
- **Workload**: MongoDB ReplicaSet
- **Namespace**: `test-ns`

---

## 🔧 Part 1: Setting Up the NFS Server

### Step 1: Launch EC2 Instance
- Use **Ubuntu 20.04 / 22.04**
- Ensure it is in the **same VPC** as the Kubernetes cluster
- Connect via SSH

```bash
ssh ubuntu@<nfs-server-ip>
```

---

### Step 2: Update Package Manager

```bash
sudo apt update -y
```

---

### Step 3: Allow NFS Traffic (Port 2049)

In the **EC2 Security Group**, allow:

| Type | Protocol | Port | Source |
|----|----|----|----|
| NFS | TCP | 2049 | Kubernetes Node CIDR |

---

### Step 4: Install NFS Server

```bash
sudo apt install nfs-kernel-server -y
```

---

### Step 5: Create Shared Directory

```bash
sudo mkdir -p /mnt/nfs_share
sudo chown nobody:nogroup -R /mnt/nfs_share
sudo chmod 777 -R /mnt/nfs_share
```

---

### Step 6: Configure NFS Exports

Edit exports file:

```bash
sudo vi /etc/exports
```

Add:

```text
/mnt/nfs_share *(rw,sync,no_subtree_check,no_root_squash)
```

**Option explanation:**
- `rw` → read/write access
- `sync` → safer writes
- `no_root_squash` → required for containers
- `no_subtree_check` → improves reliability

---

### Step 7: Export the Directory

```bash
sudo exportfs -a
sudo systemctl restart nfs-kernel-server
```

Verify export:

```bash
sudo exportfs -v
```

---

### Step 8: Verify NFS Service

```bash
ps -ef | grep -i nfs
systemctl status nfs-kernel-server
```

---

## 🧩 Part 2: Configure Kubernetes Nodes (NFS Clients)

> **Install on ALL Kubernetes master & worker nodes**

```bash
sudo apt update -y
sudo apt install nfs-common -y
```

Verify client support:

```bash
showmount -e <NFS_SERVER_IP>
```

---

## 🚀 Part 3: Deploy MongoDB with NFS Volume

### MongoDB ReplicaSet YAML(mongo-rs.yaml)

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
        image: mongo:8.0.9-noble
        ports:
        - containerPort: 27017
        env:
        - name: MONGO_INITDB_ROOT_USERNAME
          value: devdb
        - name: MONGO_INITDB_ROOT_PASSWORD
          value: devdb@123
        volumeMounts:
        - name: mongonfsvol
          mountPath: /data/db
      volumes:
      - name: mongonfsvol
        nfs:
          server: 172.31.9.244
          path: /mnt/nfs_share
```

---

### Mongo Service(mongo-service.yaml)

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
---
Part 3.1: Deploy Application
---
### App Deployment(app-deployment.yaml)

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
### App service(app-service.yaml)
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

## ▶️ Part 4: Apply Kubernetes Resources

```bash
kubectl create namespace test-ns
kubectl apply -f mongodb-rs.yaml
kubectl apply -f mongo-service.yaml
kubectl apply -f app-deployment.yaml
kubectl apply -f app-service.yaml
```
---

## 🔍 Part 5: Verification Commands

### Check Pods

```bash
kubectl get pods -n test-ns
```

### Describe Pod

```bash
kubectl describe pod <mongo-pod> -n test-ns
```

### Verify Volume Mount

```bash
kubectl exec -it <mongo-pod> -n test-ns -- df -h
kubectl exec -it <mongo-pod> -n test-ns -- ls /data/db
```

---

## 🧪 Part 6: Test Data Persistence

### Insert Data

```bash
kubectl exec -it <mongo-pod> -n test-ns -- mongosh -u devdb -p devdb@123
```

```javascript
use testdb
db.users.insertOne({ name: "Hari", role: "DevOps" })
```

### Restart Pod

```bash
kubectl delete pod <mongo-pod> -n test-ns
```

### Verify Data

```javascript
db.users.find()
```

✅ Data persists because it is stored on **NFS server**

---

## 📂 Part 7: Verify Data on NFS Server

On NFS server:

```bash
ls -l /mnt/nfs_share
```

You should see MongoDB files like:

```text
WiredTiger
collection-*.wt
index-*.wt
```

---

## ⚠️ Best Practices & Notes

- NFS is **good for shared storage**
- Suitable for:
  - Dev / QA
  - Stateful apps (with care)
- For production:
  - Use **PersistentVolume + PVC**
  - Use **CSI drivers**
  - Enable **node affinity**

---

## 🧹 Cleanup

```bash
kubectl delete namespace test-ns
```

---

## ✅ Summary

- Centralized NFS storage
- MongoDB uses `/data/db` backed by NFS
- Data survives pod restarts & rescheduling
- Industry-standard setup for learning & projects

