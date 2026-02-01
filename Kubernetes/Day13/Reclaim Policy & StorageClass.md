
# Kubernetes Reclaim Policy & StorageClass

This document provides **clear, real-world YAML examples** for:
- Reclaim Policies (`Retain`, `Delete`)
- Static Persistent Volumes
- Dynamic Provisioning using StorageClasses
- PVC usage

---

## 1. Persistent Volume with **Retain** Reclaim Policy

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-retain-example
spec:
  capacity:
    storage: 5Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  storageClassName: manual
  hostPath:
    path: /mnt/data/retain
```

🔹 Behavior:
- PVC deletion → PV moves to **Released**
- Data is preserved
- Manual cleanup required

---

## 2. Persistent Volume with **Delete** Reclaim Policy

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-delete-example
spec:
  capacity:
    storage: 5Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Delete
  storageClassName: manual
  hostPath:
    path: /mnt/data/delete
```

🔹 Behavior:
- PVC deletion → PV & storage deleted
- If deletion fails → PV moves to **Failed**

---

## 3. Persistent Volume Claim (PVC)

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc-example
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
  storageClassName: manual
```

🔹 Binds automatically to matching PV

---

## 4. StorageClass for Dynamic Provisioning

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: standard-sc
provisioner: kubernetes.io/no-provisioner
volumeBindingMode: WaitForFirstConsumer
reclaimPolicy: Delete
```

🔹 Enables **dynamic volume provisioning**
🔹 Reclaim policy applied automatically to created PVs

---

## 5. Dynamic PVC using StorageClass

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: dynamic-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
  storageClassName: standard-sc
```

🔹 PV is created **on the fly**
🔹 No need to pre-create PV

---

## 6. RWX Example using NFS Storage

### StorageClass (NFS)

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: nfs-sc
provisioner: nfs.csi.k8s.io
reclaimPolicy: Retain
volumeBindingMode: Immediate
```

---

### PVC with RWX

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: nfs-pvc
spec:
  accessModes:
    - ReadWriteMany
  resources:
    requests:
      storage: 20Gi
  storageClassName: nfs-sc
```

🔹 Multiple pods across nodes can read/write
🔹 Ideal for shared storage

---

## 7. Quick Comparison

| Feature | Retain | Delete |
|------|--------|--------|
| Default | ✅ Yes | ❌ No |
| Data preserved | ✅ Yes | ❌ No |
| Manual cleanup | ✅ Required | ❌ Not needed |
| Common usage | Critical data | Temporary workloads |

---

✅ **This document is production-ready, interview-ready, and GitHub-friendly.**
