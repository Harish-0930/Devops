# Kubernetes MongoDB Setup using ConfigMap & Secret
## 📌 Overview
This document contains a **complete, production-style MongoDB Kubernetes setup** using:
- ConfigMap for non-sensitive data
- Secret for sensitive credentials
- ReplicaSet for MongoDB Pod
- PersistentVolume & PVC for storage
- Service for internal access

---

## 1️⃣ ConfigMap – MongoDB Username

### 📄 springappconfig.yaml
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: springappconfig
  namespace: prod
data:
  db_username: devdb
```

### Commands
```bash
kubectl apply -f springappconfig.yaml
kubectl get configmap springappconfig -n prod
kubectl describe configmap springappconfig -n prod
```

---

## 2️⃣ Secret – MongoDB Password

### 📄 springappsecret.yaml
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: springappsecret
  namespace: prod
type: Opaque
stringData:
  db_password: devdb@123
```

### Commands
```bash
kubectl apply -f springappsecret.yaml
kubectl get secret springappsecret -n prod
kubectl describe secret springappsecret -n prod
```
Decode Secret:
```bash
kubectl get secret springappsecret -n prod -o jsonpath="{.data.db_password}" | base64 --decode
```
---

## 3️⃣ MongoDB Persistent Storage (PV + PVC)

### PersistentVolume(NFS)
### 📄 mongodb-pv.yaml
```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: mongodb-pv1
spec:
  capacity:
    storage: 1Gi
  accessModes:
    - ReadWriteMany
  nfs:
    server: 172.31.40.109
    path: /mnt/nfs_share
```

### PersistentVolumeClaim
### 📄 mongodb-pvc.yaml
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mongodb1-pvc
  namespace: prod
spec:
  accessModes:
    - ReadWriteMany
  resources:
    requests:
      storage: 1Gi
```

```bash
kubectl apply -f mongodb-pv.yaml
kubectl apply -f mongodb-pvc.yaml
```

---

## 4️⃣ MongoDB ReplicaSet (ConfigMap + Secret Injected)

### 📄 mongodb-replicaset.yaml
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
      - name: mongo
        image: mongo
        ports:
        - containerPort: 27017
        env:
        - name: MONGO_INITDB_ROOT_USERNAME
          valueFrom:
            configMapKeyRef:
              name: springappconfig
              key: db_username
        - name: MONGO_INITDB_ROOT_PASSWORD
          valueFrom:
            secretKeyRef:
              name: springappsecret
              key: db_password
        volumeMounts:
        - name: mongo-vol
          mountPath: /data/db
      volumes:
      - name: mongo-vol
        persistentVolumeClaim:
          claimName: mongodb1-pvc
```

### Commands
```bash
kubectl apply -f mongodb-replicaset.yaml
kubectl get rs -n prod
kubectl get pods -n prod
kubectl 
```

Verify env vars:
```bash
kubectl exec -it <mongodb-pod> -n prod -- env | grep MONGO
```
---

## 5️⃣ MongoDB Service
### 📄 mongosvc.yaml
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

### Commands
```bash
kubectl apply -f mongosvc.yaml
kubectl get svc -n prod
```

---

# 🔹 PART 2: Spring Boot Application

## 6️⃣ Spring Boot ConfigMap (Non-Sensitive Config)

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: springboot-config
  namespace: prod
data:
  SPRING_PROFILES_ACTIVE: prod
  MONGO_HOST: mongosvc
  MONGO_PORT: "27017"
  MONGO_DB: myappdb
```

```bash
kubectl apply -f springboot-config.yaml
```

---

## 7️⃣ Spring Boot Secret (Sensitive Config)

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: springboot-secret
  namespace: prod
type: Opaque
stringData:
  MONGO_USERNAME: devdb
  MONGO_PASSWORD: devdb@123
```

```bash
kubectl apply -f springboot-secret.yaml
```

---

## 8️⃣ Spring Boot Deployment

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
        - name: SPRING_PROFILES_ACTIVE
          valueFrom:
            configMapKeyRef:
              name: springboot-config
              key: SPRING_PROFILES_ACTIVE
        - name: MONGO_HOST
          valueFrom:
            configMapKeyRef:
              name: springboot-config
              key: MONGO_HOST
        - name: MONGO_PORT
          valueFrom:
            configMapKeyRef:
              name: springboot-config
              key: MONGO_PORT
        - name: MONGO_DB
          valueFrom:
            configMapKeyRef:
              name: springboot-config
              key: MONGO_DB
        - name: MONGO_USERNAME
          valueFrom:
            secretKeyRef:
              name: springboot-secret
              key: MONGO_USERNAME
        - name: MONGO_PASSWORD
          valueFrom:
            secretKeyRef:
              name: springboot-secret
              key: MONGO_PASSWORD
```

```bash
kubectl apply -f springapp-deployment.yaml
```

---

## 9️⃣ Spring Boot Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: springapp-svc
  namespace: prod
spec:
  type: ClusterIP
  selector:
    app: springapp
  ports:
    - port: 80
      targetPort: 8080
```

```bash
kubectl apply -f springapp-svc.yaml
```

---

# 🔄 End-to-End Flow

```text
Spring Boot App
   ↓
Reads Mongo details from ConfigMap + Secret
   ↓
Connects to MongoDB Service (mongosvc)
   ↓
MongoDB authenticates using root user
   ↓
Data stored on NFS via PVC
```

---

## 🧪 Verification Commands

```bash
kubectl get all -n prod
kubectl exec -it <spring-pod> -n prod -- env | grep MONGO
kubectl logs <spring-pod> -n prod
```

---

## ✅ Production Best Practices

✔ Separate ConfigMap & Secret  
✔ No credentials in images  
✔ Namespace isolation  
✔ Persistent storage for DB  
✔ Scalable Spring Boot replicas  
