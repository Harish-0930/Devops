# 📦 Kubernetes PersistentVolume (PV) & PersistentVolumeClaim (PVC) with NFS

This document demonstrates how to configure **Persistent Volumes (PV)** and **Persistent Volume Claims (PVC)** using **NFS storage** in Kubernetes, along with a **MongoDB ReplicaSet** and a **Spring Boot application** consuming MongoDB.

---

## 📌 Architecture Overview

- **NFS Server** provides shared storage
- **PersistentVolume (PV)** maps to NFS export
- **PersistentVolumeClaim (PVC)** binds to PV (1:1)
- **MongoDB** stores data on NFS
- **Spring Boot App** connects to MongoDB via ClusterIP Service

```
Spring App → MongoDB Service → MongoDB Pod → PVC → PV → NFS Server
```

---

## 🧠 Key Concepts

### PersistentVolume (PV)
- Cluster-wide storage resource
- Provisioned by admin
- Backed by NFS

### PersistentVolumeClaim (PVC)
- Namespace-scoped
- Requests storage from PV
- **1 PVC binds to 1 PV**

> ⚠️ Even though NFS supports `ReadWriteMany`, **a PVC always binds to a single PV**.

---

## 📦 PersistentVolume (PV)

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: mongodb-pv
spec:
  capacity:
    storage: 1Gi
  accessModes:
    - ReadWriteMany
  nfs:
    server: 172.31.11.218
    path: /mnt/nfs_share
```

---

## 📦 PersistentVolumeClaim (PVC)

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mongodb-pvc
  namespace: prod
spec:
  accessModes:
    - ReadWriteMany
  resources:
    requests:
      storage: 1Gi
```

---

## 🍃 MongoDB ReplicaSet

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
        - name: mongonfsvol
          mountPath: /data/db
      volumes:
      - name: mongonfsvol
        persistentVolumeClaim:
          claimName: mongodb-pvc
```

---

## 🔌 MongoDB Service (ClusterIP)

```yaml
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

## 🚀 Spring Boot Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: springapp
  namespace: prod
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
        resources:
          requests:
            cpu: 300m
            memory: 256Mi
          limits:
            cpu: 500m
            memory: 512Mi
```

---

## 🌐 Spring Boot Service (NodePort)

```yaml
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

## 🔧 Deployment Commands

```bash
kubectl apply -f pv.yaml
kubectl apply -f pvc.yaml
kubectl apply -f mongodb.yaml
kubectl apply -f mongosvc.yaml
kubectl apply -f springapp.yaml
kubectl apply -f springappsvc.yaml
```

---

## 🔍 Verification Commands

```bash
kubectl get pv
kubectl get pvc -n prod
kubectl get pods -n prod
```

---

## ✅ Key Takeaways

- PV and PVC follow **1:1 binding**
- NFS supports **ReadWriteMany**
- Data persists across pod restarts
- Suitable for stateful workloads like MongoDB
