# Kubernetes CNI Migration Runbook  
## Migrating from Weave Net to Calico

---

## Overview

This document provides a **step-by-step, production-safe procedure** to migrate a Kubernetes cluster CNI from **Weave Net** to **Calico** **without rebuilding the cluster**.

### Cluster Assumptions
- kubeadm-based Kubernetes cluster
- 1 Control Plane + N Worker nodes
- Container runtime: containerd
- OS: Ubuntu
- Kubernetes version: v1.20+
- Existing CNI: Weave Net
- Target CNI: Calico

---

## ⚠️ Important Notes

- Kubernetes does **not support hot CNI swapping**
- Expect **pod restarts**
- Follow **node-by-node migration**
- **Workers first, control-plane last**
- Never remove CNI config from all nodes at the same time

---

## High-Level Migration Flow

Weave Net → Install Calico → Remove Weave → Enable Calico CNI → Restart nodes one by one

---

## STEP 1: Pre-checks (Control Plane)

```bash
kubectl get nodes
kubectl get pods -n kube-system | grep weave
```

---

## STEP 2: Backup Cluster (Recommended)

```bash
kubectl get all -A > cluster-backup.txt
kubectl get cm -A > configmaps-backup.txt
sudo cp -r /etc/kubernetes /etc/kubernetes.backup
```

---

## STEP 3: Install Calico

```bash
kubectl apply -f https://raw.githubusercontent.com/projectcalico/calico/v3.27.2/manifests/calico.yaml
```

Verify:
```bash
kubectl get pods -n kube-system | grep calico
```

---

## STEP 4: Ensure Calico Installs CNI

```bash
kubectl edit daemonset calico-node -n kube-system
```

Ensure:
```yaml
- name: INSTALL_CNI
  value: "true"
- name: CNI_CONF_NAME
  value: "10-calico.conflist"
```

---

## STEP 5: Drain Worker Node

```bash
kubectl drain <worker-node> --ignore-daemonsets --delete-emptydir-data --force
```

---

## STEP 6: Remove Weave Net(From Control-Plane Only)

```bash
kubectl delete daemonset weave-net -n kube-system
kubectl delete clusterrole weave-net
kubectl delete clusterrolebinding weave-net
kubectl delete serviceaccount weave-net -n kube-system
```

---

## STEP 7: Clean CNI on Worker

```bash
sudo rm -rf /etc/cni/net.d/*
sudo systemctl restart containerd
sudo systemctl restart kubelet
```

---

## STEP 8: Uncordon Worker

```bash
kubectl uncordon <worker-node>
```

## STEP 9: Repeat for all workers.
```
Repeat Steps 5–8 for all remaining workers.

⚠️ Do NOT touch the control-plane yet.
```

## STEP 10: Verify Worker Migration
```
kubectl get nodes
kubectl get pods -n kube-system | grep calico
```
> __All workers must be Ready.__

# If workers are not-ready
## Enable Calico CNI installation (SAFE)

```bash
kubectl edit cm calico-config -n kube-system

```

Ensure:
```yaml
install-cni: "true"
cni_network_config: |-
  {
    "name": "k8s-pod-network",
    "cniVersion": "0.3.1",
    "plugins": [
      {
        "type": "calico",
        "log_level": "info",
        "datastore_type": "kubernetes",
        "nodename": "__KUBERNETES_NODE_NAME__",
        "mtu": 1450,
        "ipam": {
          "type": "calico-ipam"
        },
        "policy": {
          "type": "k8s"
        },
        "kubernetes": {
          "kubeconfig": "__KUBECONFIG_FILEPATH__"
        }
      },
      {
        "type": "portmap",
        "snat": true,
        "capabilities": {"portMappings": true}
      }
    ]
  }

```
---

## FINAL PHASE: Control Plane

### Drain Control Plane
```bash
kubectl drain <control-plane-node> --ignore-daemonsets --delete-emptydir-data --force
```

### Clean CNI
```bash
sudo rm -rf /etc/cni/net.d/*
sudo systemctl restart containerd
sudo systemctl restart kubelet
```

### Reinstall Calico CNI
```bash
kubectl rollout restart daemonset calico-node -n kube-system
sudo systemctl restart kubelet
```

### Uncordon
```bash
kubectl uncordon <control-plane-node>
```

---

## Final Validation

```bash
kubectl get nodes
kubectl get pods -n kube-system | grep calico
kubectl get pods -n kube-system | grep weave
```

---

## ✅ Migration Complete

✔ Weave Net removed
✔ Calico active as primary CNI
✔ Cluster fully operational

## Optional Post-Migration Checks
### Test networking
```bash
kubectl run net-test --image=busybox -it --rm -- sh
ping 8.8.8.8
```

### Check Calico IP pools:
```bash
kubectl get ippools
```

### Notes & Best Practices

- Always migrate workers first

- /etc/cni/net.d is the most critical directory

- INSTALL_CNI=true is mandatory

- Never reset kubeadm during CNI migration
