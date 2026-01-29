# **DaemonSet - Complete Guide**

## **1. What is a DaemonSet?**

A **DaemonSet** ensures that **one copy of a Pod runs on every node** in the Kubernetes cluster.

So whenever:

* A new node joins → Pod is automatically created on that node.
* A node is removed → Pod is automatically removed.

###  Why this is needed?

Some workloads are **node-specific** and must run everywhere, such as:

| Use Case                                             | Purpose                        |
| ---------------------------------------------------- | ------------------------------ |
| **Log collectors** (Fluentd, Filebeat)               | Collect logs from each node    |
| **Monitoring agents** (Node Exporter, Datadog agent) | Collect node-level metrics     |
| **Security agents**                                  | Enforce policies on each node  |
| **Kube-proxy / network plugins**                     | Manage networking on each node |

---

## **2. How DaemonSet Works Internally**

| Component                     | Responsibility                                    |
| ----------------------------- | ------------------------------------------------- |
| `DaemonSet Controller`        | Watches nodes and ensures Pods exist on all nodes |
| `Node Selector / Tolerations` | Controls where Pods can run                       |
| `Template.spec`               | Defines the container specification               |

DaemonSet is **similar to Deployment**, except:

* **Deployment** tries to maintain a fixed replica count (e.g., 3 Pods).
* **DaemonSet** runs **1 Pod per node** (not fixed count).

---

## **3. Real-Time Example: Node Exporter (Monitoring Agent)**

### **Objective**

Deploy **node-exporter** on **every node** to collect CPU, RAM, Disk metrics.

### **YAML File: `node-exporter-daemonset.yaml`**

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: node-exporter
  namespace: kube-system
spec:
  selector:
    matchLabels:
      app: node-exporter
  template:
    metadata:
      labels:
        app: node-exporter
    spec:
      hostNetwork: true
      hostPID: true
      containers:
      - name: node-exporter
        image: prom/node-exporter:latest
        ports:
        - containerPort: 9100
          name: metrics
```

### **Key Points**

| Field                 | Meaning                                                          |
| --------------------- | ---------------------------------------------------------------- |
| `hostNetwork: true`   | The Pod shares the node network → metrics accessible via node IP |
| `hostPID: true`       | Allows access to host process namespace                          |
| `containerPort: 9100` | Port where metrics are exposed                                   |

---

## **4. Apply the DaemonSet**

```bash
kubectl apply -f node-exporter-daemonset.yaml
```

---

## **5. Validate DaemonSet**

### **Check DaemonSet**

```bash
kubectl get daemonset -n kube-system
```

Expected Output:

```
NAME            DESIRED   CURRENT   READY
node-exporter   3         3         3
```

> `DESIRED = number of nodes in your cluster`

---

### **List Pods running on each node**

```bash
kubectl get pods -n kube-system -o wide | grep node-exporter
```

Example Output:

```
node-exporter-abcde   Running   ip:10.0.1.10   node:worker1
node-exporter-fghij   Running   ip:10.0.1.11   node:worker2
node-exporter-klmno   Running   ip:10.0.1.12   node:master
```

---

## **6. Verify Node Metrics (Important Step)**

Pick any node IP & test:

```bash
curl http://<NODE-IP>:9100/metrics
```

Example:

```bash
curl http://192.168.1.101:9100/metrics
```

You should see output like:

```
# HELP node_cpu_seconds_total Seconds the CPUs spent in each mode.
node_cpu_seconds_total{cpu="0",mode="idle"} 15052.92
```

###  If this output appears → **DaemonSet is working successfully**

---

## **7. (Optional) Expose via Service (for Prometheus)**

```yaml
apiVersion: v1
kind: Service
metadata:
  name: node-exporter
  namespace: kube-system
spec:
  selector:
    app: node-exporter
  ports:
  - name: metrics
    port: 9100
    targetPort: 9100
```

Apply:

```bash
kubectl apply -f node-exporter-service.yaml
```

---

## **8. Troubleshooting**

| Issue                             | Reason                         | Fix                                                                |
| --------------------------------- | ------------------------------ | ------------------------------------------------------------------ |
| Pods running only on worker nodes | Schedulable master disabled    | `kubectl taint node master node-role.kubernetes.io/control-plane-` |
| Pod not starting                  | Image pull issue               | Check image URL / registry access                                  |
| Metrics not showing               | Firewall / firewallD blocking  | Allow port `9100` on each node                                     |
| Port conflicts                    | Something else using port 9100 | Change container port                                              |

---

## **9. When to Use Deployment Instead of DaemonSet**

Use **Deployment** when:

* The app is **not tied to nodes**
* You just need a **fixed number of replicas**
* You want **rolling updates / autoscaling**

Use **DaemonSet** when:

* Workload must run **on every node**
* Workload needs **host-level access**
