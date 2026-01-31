# **1. What is NFS (Network File System)?**

NFS is a **shared file system** that allows multiple servers/clients to read/write files over the network **as if it is a local folder**.

### **1.1 Why NFS is used**

* To store data centrally
* To share same files with multiple servers
* To maintain consistent data across systems
* For Kubernetes pods needing **shared storage (RWX)**

### **1.2 How NFS works**

* One server exports a folder using `/etc/exports`
* Clients mount that folder using:

  ```
  mount -t nfs <nfs-ip>:/share /mnt
  ```
* Files appear the same from every client

### **1.3 Features**

* Supports ReadWriteMany (RWX)
* Lightweight & fast
* Works inside Kubernetes clusters
* Suitable for:

  * Web apps
  * CI/CD
  * Logging apps
  * Stateful apps

---

# **2. Why Kubernetes cannot directly use NFS**

Pods have **ephemeral storage**. When a pod restarts:

* Data is lost
* Pod may run on another node
* NFS mounting manually is impossible

Kubernetes needs a **standard, automated way** to manage external storage.

Hence the concepts: **PV** and **PVC**

---

# **3. Persistent Volume (PV)**

### **Definition**

Persistent Volume is a **cluster-wide storage resource** created by the admin.

Think of PV as **storage that has been plugged into the Kubernetes cluster**.

### **3.1 Why PV is needed**

* Kubernetes cannot directly work with NFS/EBS/AzureDisk
* PV makes external storage available **inside the cluster**
* PV defines:

  * Capacity
  * Path
  * Server IP
  * Access modes
  * Reclaim policies

### **3.2 PV YAML Example**

```
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-nfs
spec:
  capacity:
    storage: 5Gi
  accessModes:
    - ReadWriteMany
  persistentVolumeReclaimPolicy: Retain
  nfs:
    path: /data/k8s
    server: 10.0.0.50
```

### **3.3 PV Key Concepts (Deep)**

#### **Access Modes**

* RWO: Only one node can write
* ROX: Many nodes read only
* **RWX: Many nodes can read/write (NFS supports this)**

#### **Reclaim Policies**

* Retain → do not delete data on PVC delete
* Delete → delete backend storage (cloud disks)
* Recycle (deprecated)

#### **Binding**

PV waits for a PVC with matching:

* Storage size
* Access mode
* Storage class (if used)

---

# **4. Persistent Volume Claim (PVC)**

### **Definition**

PVC is a **request** for storage from the application.

Pod says:

> “I need 5Gi storage with RWX mode”

PVC handles this request.

### **4.1 PVC YAML Example**

```
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc-nfs
spec:
  accessModes:
    - ReadWriteMany
  resources:
    requests:
      storage: 5Gi
```

### **4.2 How PVC Works**

* PVC asks for storage
* Kubernetes searches for a matching PV
* When matched → PVC becomes **Bound**
* Pod can now use the PVC

---

# **5. How Pods Use PVC**

```
apiVersion: v1
kind: Pod
metadata:
  name: app-pod
spec:
  containers:
    - name: app
      image: nginx
      volumeMounts:
        - mountPath: /usr/share/nginx/html
          name: html-volume
  volumes:
    - name: html-volume
      persistentVolumeClaim:
        claimName: pvc-nfs
```

Pod → PVC → PV → NFS → Folder

Flow:

1. Pod requests volume via PVC
2. PVC binds to PV
3. PV uses NFS backend
4. NFS folder mounted into the Pod

---

# **6. Why PV and PVC are mandatory even if we have NFS? (Deep Reasoning)**

### **6.1 Automation**

Pods get storage automatically – no manual mount commands.

### **6.2 Dynamic Scheduling**

Pod may move to Node-1 → Node-3 → Node-5.
PVC ensures volume follows pod automatically.

### **6.3 Standard API**

Kubernetes supports:

* NFS
* EBS
* Azure Disk
* GCE Disk
* CephFS
* iSCSI
* Longhorn
* GlusterFS

One uniform way: PVC.

### **6.4 Access Control**

PVC restricts:

* How much storage to use
* Which pods can access
* What mode (RWX, RWO)

### **6.5 Lifecycle Management**

PV knows:

* What to do when PVC is deleted
* Whether to delete backend data
* Whether to retain data

### **6.6 Decoupling Developer vs Ops**

Ops team:

* Creates PV pointing to NFS

Developer:

* Simply creates PVC
* Doesn't know storage backend

---

# **7. Real-Time Scenario for Students**

### Scenario:

You have a web application running on 5 replicas.
All replicas must share uploaded images.

### Problem:

If you store images inside container filesystem →
Each pod has its own local storage → images mismatch.

### Solution:

Use Kubernetes NFS-based PV/PVC.

### Flow:

* NFS stores `/uploads`
* PV exposes this storage inside cluster
* PVC provides it to pods
* All 5 replicas share same folder

This is the **most common enterprise use case**.

---

# **8. Diagram (Explained Text)**

Node-1: Pod-A
Node-2: Pod-B
Node-3: Pod-C

All mount:

```
/mnt/nfs
```

via:

Pod → PVC → PV → NFS Server.

Kubernetes handles scheduling & auto-mounting.

---

# **9. One Sentence Summary**

**NFS is external storage.
PV brings that storage into Kubernetes.
PVC gives that storage to Pods.**
