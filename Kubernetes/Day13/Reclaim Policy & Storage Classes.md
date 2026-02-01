
# Kubernetes Reclaim Policy & Storage Classes

This document explains **Reclaim Policies**, **Persistent Volume (PV) lifecycle states**, **Dynamic Provisioning**, **Storage Classes**, and **Access Modes** in Kubernetes in a clear and structured way.

---

## 1. Reclaim Policy

A **Reclaim Policy** defines what happens to a **Persistent Volume (PV)** after its bound **Persistent Volume Claim (PVC)** is deleted.

### Types of Reclaim Policies

1. **Retain** (Default)
   - The PV is not deleted automatically.
   - Data remains intact.
   - Manual cleanup is required.

2. **Delete**
   - The PV and underlying storage are deleted automatically.
   - Must be explicitly mentioned.

3. **Recycle** (Deprecated)
   - Performs basic cleanup (e.g., `rm -rf`).
   - No longer recommended or supported.

---

## 2. Persistent Volume (PV) Status Lifecycle

### PV Status in **Retain Policy**

1. **Available**
   - PV is created.
   - Not yet bound to any PVC.

2. **Bound**
   - PV is successfully bound to a PVC.

3. **Released**
   - PVC is deleted.
   - PV still exists but is not reusable until manually cleaned.

---

### PV Status in **Delete Policy**

1. **Available**
   - PV is created.
   - Not yet bound to any PVC.

2. **Bound**
   - PV is bound to a PVC.

3. **Failed**
   - PVC is deleted.
   - Kubernetes attempts to delete the PV and storage.
   - If deletion fails, PV moves to *Failed* state.

---

## 3. Dynamic Volumes & Storage Classes

### Dynamic Volumes
- Storage (PV) is created **on the fly**.
- No need to create PVs in advance.
- Automatically provisioned when a PVC is created.

### Storage Class
- Enables **dynamic provisioning**.
- Defines:
  - Storage type
  - Reclaim policy
  - Provisioner
  - Parameters

➡ PVC requests storage → StorageClass creates PV dynamically.

---

## 4. Access Modes

Access Modes define **how a Persistent Volume can be mounted and shared**.

### Commonly Used Access Modes
1. **ReadWriteOnce (RWO)**
2. **ReadWriteMany (RWX)**

---

## 5. Access Mode: ReadWriteOnce (RWO)

### Description
- Mounted as **Read-Write by only ONE node at a time**
- Multiple pods **on the same node** can access it
- Pods on **different nodes cannot**

### Characteristics
- Most commonly used access mode
- Supported by block storage

### Typical Storage Backends
- AWS EBS
- Azure Disk
- GCP Persistent Disk
- Local storage

### Use Cases
- Databases (MySQL, PostgreSQL, MongoDB)
- Stateful applications
- Single-instance workloads

---

## 6. Access Mode: ReadWriteMany (RWX)

### Description
- Mounted as **Read-Write by MULTIPLE nodes at the same time**
- Multiple pods across different nodes can read & write
- Used for shared storage
- Requires **file-based storage**

### Typical Storage Backends
- NFS
- Amazon EFS
- Azure File
- CephFS

### Use Cases
- Shared application data
- Logs and file uploads
- Media content
- Applications with multiple replicas needing same data

---

## 7. Summary Table

| Feature | RWO | RWX |
|------|------|------|
| Nodes Access | Single node | Multiple nodes |
| Pods Access | Same node only | Across nodes |
| Storage Type | Block storage | File storage |
| Common Use | Databases | Shared data |

---

✅ **This document is suitable for Kubernetes interviews, notes, and real-time project understanding.**
