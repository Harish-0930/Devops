## 1. Key Differences Between Deployment and StatefulSet

| Feature            | Deployment                            | StatefulSet                                 |
| ------------------ | ------------------------------------- | ------------------------------------------- |
| Pod Identity       | Random (no stable name or ID)         | Stable, predictable pod names (`pod-0`)     |
| Persistent Storage | No guarantee, shared storage optional | Each Pod gets its own PersistentVolumeClaim |
| Scaling Behavior   | All replicas are identical            | Ordered scaling up/down                     |
| Use Cases          | Stateless apps (API, frontend)        | Stateful apps (Databases, Kafka, Zookeeper) |
| Headless Service   | Not required                          | Usually Required (for stable DNS)           |
| Rolling Update     | Faster                                | Slower (ordered updates)                    |

---

## 2. Solution Architecture

* MySQL StatefulSet
* ConfigMap for MySQL Username
* Secret for MySQL Password
* Headless Service for stable DNS
* PersistentVolumeClaim per Pod for MySQL data

---

## 3. Complete YAML Setup

### Step 1: ConfigMap (MySQL Username)

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: mysql-config
data:
  MYSQL_USER: "myuser"
```

---

### Step 2: Secret (MySQL Password)

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: mysql-secret
type: Opaque
data:
  MYSQL_PASSWORD: bXlwYXNzd29yZA==
```

---

### Step 3: Headless Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: mysql-headless
spec:
  clusterIP: None
  selector:
    app: mysql
  ports:
    - port: 3306
```

---

### Step 4: StatefulSet with PVC

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mysql
spec:
  serviceName: "mysql-headless"
  replicas: 1
  selector:
    matchLabels:
      app: mysql
  template:
    metadata:
      labels:
        app: mysql
    spec:
      containers:
      - name: mysql
        image: mysql:8.0
        ports:
        - containerPort: 3306
        env:
        - name: MYSQL_ROOT_PASSWORD
          valueFrom:
            secretKeyRef:
              name: mysql-secret
              key: MYSQL_PASSWORD
        - name: MYSQL_USER
          valueFrom:
            configMapKeyRef:
              name: mysql-config
              key: MYSQL_USER
        - name: MYSQL_PASSWORD
          valueFrom:
            secretKeyRef:
              name: mysql-secret
              key: MYSQL_PASSWORD
        volumeMounts:
        - name: mysql-persistent-storage
          mountPath: /var/lib/mysql
  volumeClaimTemplates:
  - metadata:
      name: mysql-persistent-storage
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 1Gi
```

---

## 4. How It Works

| Component                  | Purpose                                                                        |
| -------------------------- | ------------------------------------------------------------------------------ |
| ConfigMap                  | Stores MySQL username                                                          |
| Secret                     | Stores MySQL password (Base64 encoded)                                         |
| Headless Service           | Provides stable DNS (e.g., `mysql-0.mysql-headless.default.svc.cluster.local`) |
| StatefulSet                | Creates MySQL Pod with stable hostname and bound PVC                           |
| PVC (volumeClaimTemplates) | Creates persistent storage automatically for MySQL data                        |

---

## 5. Key Details

MySQL Pod Stable Hostname:

```
mysql-0.mysql-headless.default.svc.cluster.local
```

PVC Name:

```
mysql-persistent-storage-mysql-0
```

Access MySQL Password in Pod:

```bash
echo $MYSQL_PASSWORD
```

---

## 6. Explanation

MySQL cannot run with Deployment because it requires stable hostnames and persistent volumes.
StatefulSet is the right choice for stateful applications like databases.

ConfigMap stores non-sensitive information like username, while Secret safely holds the password.
This ensures better security and flexibility in production.

---

## 7. Troubleshooting Guide

1. PVC Pending: Check StorageClass and provisioner.
2. Pod CrashLoop: Verify passwords and environment variables.
3. MySQL Connectivity Issues: Test DNS and service inside the cluster.
4. Volume Issues: Inspect PVC events and Pod logs.

---

## 8. Why This Setup Will Work in Production

* Secrets prevent hardcoded passwords.
* Persistent volume storage is auto-provisioned.
* MySQL 8.0 image tested and supported.
* Stable DNS via headless service.
* StatefulSet provides ordering and stability.

