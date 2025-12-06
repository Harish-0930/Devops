# Kubernetes Introduction and Features


---

## What is Kubernetes?

Kubernetes (often abbreviated as K8s) is an open-source container orchestration engine for automating deployment, scaling, and management of containerized applications.

- **Container Orchestration Engine:** Kubernetes manages clusters of containers, ensuring the application runs consistently across different environments.
- **Key Responsibilities:**
  - Container deployment
  - Scaling & descaling
  - Load balancing of containers
- **Not a Replacement for Docker:** Kubernetes is not a replacement for Docker itself. Instead, it can be considered a replacement for Docker Swarm (another orchestrator). Kubernetes is more robust and complex, but it offers more control and features.
- **History:**
  - Developed by **Google**
  - Written in **Go/Golang**
  - Donated to **CNCF (Cloud Native Computing Foundation)** in **2014**
  - Kubernetes v1.0 was released on **July 21, 2015**
  - Current stable release: **v1.31**

---

## Kubernetes Key Features

### 1. Automated Scheduling
- Kubernetes includes an advanced scheduler that automatically places containers based on resource requirements and constraints without compromising availability.

### 2. Self-Healing Capabilities
- Automatically replaces and reschedules failed containers
- Kills containers that don’t respond to user-defined health checks

### 3. Automated Rollouts and Rollbacks
- Allows changes in app configuration or container image to be rolled out gradually
- Supports rollback in case of failure

### 4. Horizontal Scaling and Load Balancing
- Applications can be scaled up/down based on CPU usage or other metrics
- Kubernetes load-balances traffic across containers using built-in services

### 5. Service Discovery and Load Balancing
- Assigns IP addresses and a DNS name for each set of containers
- Traffic is load-balanced across healthy containers

### 6. Storage Orchestration
- Kubernetes supports mounting local storage or cloud provider storage (e.g., AWS EBS, GCP Persistent Disks)
- Supports NFS, iSCSI, etc.

---

## Kubernetes Architecture Overview


![Kubernetes Architecture](https://kubernetes.io/images/docs/kubernetes-cluster-architecture.svg)


### Control Plane Components:
- **kube-apiserver**: Frontend for Kubernetes control plane; receives REST commands
- **etcd**: Key-value store that holds all cluster data
- **kube-scheduler**: Assigns pods to nodes
- **kube-controller-manager**: Runs controller processes (node, replication, endpoints, etc.)
- **cloud-controller-manager**: Interacts with underlying cloud provider APIs

### Node Components:
- **kubelet**: Agent running on each node; communicates with the control plane
- **kube-proxy**: Maintains network rules and handles communication to Pods
- **Pods**: Smallest deployable units in Kubernetes; contain one or more containers
- **CRI (Container Runtime Interface)**: Interface between kubelet and container runtime (e.g., containerd, Docker)
