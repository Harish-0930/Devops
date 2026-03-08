# Kubernetes StatefulSet

## 1. What is StatefulSet?

A **StatefulSet** in Kubernetes is a workload controller used to manage
**stateful applications**.

Unlike **Deployments**, StatefulSets are designed for applications that
require: - Stable network identity - Persistent storage - Ordered
deployment and scaling - Unique pod identity

Common examples: - MySQL - MongoDB - Kafka - Elasticsearch - Zookeeper

------------------------------------------------------------------------

# 2. Why StatefulSet?

In a **Deployment**, pods are identical and interchangeable.

If a pod dies: - A new pod is created - It gets a new name - It may get
new storage

But some applications require: - Fixed hostname - Persistent storage -
Ordered startup

StatefulSet solves these problems.

------------------------------------------------------------------------

# 3. Key Features

## 3.1 Stable Pod Names

Pods always have predictable names.

Example:

    mysql-0
    mysql-1
    mysql-2

If a pod is recreated, the **same name is reused**.

------------------------------------------------------------------------

## 3.2 Stable Network Identity

Each pod gets a stable DNS name.

Example:

    mysql-0.mysql.default.svc.cluster.local
    mysql-1.mysql.default.svc.cluster.local
    mysql-2.mysql.default.svc.cluster.local

This is required for **cluster communication**.

------------------------------------------------------------------------

## 3.3 Persistent Storage

Each pod receives its own **Persistent Volume Claim (PVC)**.

Example:

    mysql-0 → pvc-mysql-0
    mysql-1 → pvc-mysql-1
    mysql-2 → pvc-mysql-2

Even if the pod restarts, the **data remains**.

------------------------------------------------------------------------

## 3.4 Ordered Deployment

Pods are created **one by one in sequence**.

Scaling to 3 replicas:

    mysql-0 → mysql-1 → mysql-2

------------------------------------------------------------------------

## 3.5 Ordered Termination

Scaling down happens in **reverse order**.

    mysql-2 → mysql-1 → mysql-0

------------------------------------------------------------------------

## 4. StatefulSet vs Deployment

| Feature       | Deployment          | StatefulSet          |
|---------------|---------------------|----------------------|
| Pod identity  | Random              | Stable               |
| Storage       | Ephemeral / Shared  | Persistent per pod   |
| Pod names     | Random              | Fixed                |
| Scaling       | Parallel            | Ordered              |
| Use case      | Stateless apps      | Stateful apps        |

------------------------------------------------------------------------

# 5. StatefulSet YAML Example

``` yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: nginx

spec:
  serviceName: "nginx"
  replicas: 3

  selector:
    matchLabels:
      app: nginx

  template:
    metadata:
      labels:
        app: nginx

    spec:
      containers:
      - name: nginx
        image: nginx
        ports:
        - containerPort: 80

  volumeClaimTemplates:
  - metadata:
      name: nginx-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 1Gi
```

Pods created:

    nginx-0
    nginx-1
    nginx-2

Each pod gets **its own storage volume**.

------------------------------------------------------------------------

# 6. Headless Service Requirement

StatefulSets require a **Headless Service**.

Example:

``` yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx

spec:
  clusterIP: None
  selector:
    app: nginx

  ports:
  - port: 80
```

Key point:

    clusterIP: None

This enables **direct DNS resolution for each pod**.

------------------------------------------------------------------------

# 7. Real World Example

Example: MongoDB cluster

    mongo-0
    mongo-1
    mongo-2

Each node: - Has its own persistent storage - Has a stable hostname -
Can reliably communicate with other nodes

------------------------------------------------------------------------

# 8. When to Use StatefulSet

Use StatefulSet when an application requires:

-   Persistent data storage
-   Stable pod identity
-   Stable network identity
-   Ordered scaling and updates

Examples:

-   Databases
-   Kafka
-   Elasticsearch
-   Cassandra
-   Zookeeper

------------------------------------------------------------------------

# 9. Quick Revision Summary

StatefulSet provides:

-   Stable **pod names**
-   Stable **network identity**
-   **Persistent storage per pod**
-   **Ordered deployment**
-   **Ordered scaling**

**Deployment → Stateless Applications**\
**StatefulSet → Stateful Applications**
