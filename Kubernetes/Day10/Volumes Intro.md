
# Kubernetes Volumes – Complete Guide

## 1. Introduction to Kubernetes Volumes
In Kubernetes, a **Volume** is a directory that contains data, accessible to containers in a Pod.  
Unlike container file systems, volumes persist data beyond container restarts.

### Why Volumes?
- Containers are ephemeral
- Data persistence is required
- Sharing data between containers
- External storage integration

---

## 2. Kubernetes Volume Lifecycle
- Volume lifecycle is tied to the **Pod**, not the container
- If a container crashes, data remains
- If a Pod is deleted, volume behavior depends on the volume type

---

## 3. emptyDir Volume

### What is emptyDir?
- Created when a Pod is assigned to a node
- Deleted when the Pod is removed
- Stored on node disk (or memory if configured)

### Use Cases
- Temporary storage
- Cache
- Sharing data between containers in the same Pod

### emptyDir Example
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: emptydir-demo
spec:
  containers:
  - name: app
    image: busybox
    command: ["sh", "-c", "echo Hello > /data/hello.txt && sleep 3600"]
    volumeMounts:
    - name: temp-storage
      mountPath: /data
  volumes:
  - name: temp-storage
    emptyDir: {}
```

### emptyDir in Memory
```yaml
emptyDir:
  medium: Memory
```

---

## 4. hostPath Volume

### What is hostPath?
- Mounts a file or directory from the node filesystem
- Direct access to node storage

### Use Cases
- Log collection
- Node-level monitoring
- Development/testing (not recommended for production)

### Risks
- Pod becomes node-dependent
- Security risk if misused

### hostPath Example
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: hostpath-demo
spec:
  containers:
  - name: app
    image: nginx
    volumeMounts:
    - mountPath: /usr/share/nginx/html
      name: host-volume
  volumes:
  - name: host-volume
    hostPath:
      path: /data/nginx
      type: DirectoryOrCreate
```

---

## 5. NFS Volume

### What is NFS?
- Network File System
- Shared storage across multiple Pods and nodes

### Use Cases
- Shared application data
- Legacy applications
- Multi-pod read/write access

### Prerequisites
- NFS server installed and running
- Exported directory
- Network access from cluster nodes

### NFS Volume Example
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nfs-demo
spec:
  containers:
  - name: app
    image: busybox
    command: ["sh", "-c", "ls /mnt && sleep 3600"]
    volumeMounts:
    - name: nfs-volume
      mountPath: /mnt
  volumes:
  - name: nfs-volume
    nfs:
      server: 192.168.1.100
      path: /exports/data
```

---

## 6. Volume vs Persistent Volume (PV)

| Feature | Volume | Persistent Volume |
|------|-------|-----------------|
| Scope | Pod-level | Cluster-level |
| Lifecycle | Pod dependent | Independent |
| Reusability | No | Yes |
| Storage Abstraction | Low | High |

---

## 7. When to Use Which Volume

| Scenario | Recommended Volume |
|-------|------------------|
| Temporary data | emptyDir |
| Node-level access | hostPath |
| Shared storage | NFS |
| Production storage | PV + PVC |

---

## 8. Best Practices
- Avoid hostPath in production
- Prefer PV and PVC for persistent data
- Secure NFS with proper permissions
- Monitor disk usage

---

## 9. Summary
- Volumes solve container storage problems
- emptyDir → temporary
- hostPath → node-level
- NFS → shared network storage
- PV/PVC → production-grade storage

---

## 10. References
- Kubernetes Official Documentation
