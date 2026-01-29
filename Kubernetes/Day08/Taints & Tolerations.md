###  Step-1: Check master taints

```bash
kubectl get nodes -o wide
kubectl describe node <master-node-name> | grep Taint
```

You will see something like:

```
node-role.kubernetes.io/control-plane:NoSchedule
```

This taint blocks scheduling.

---

###  Step-2: Add toleration to DaemonSet YAML

Update your DaemonSet → `spec.template.spec` section:

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

      #  Add this block so Pod can run on master
      tolerations:
      - key: "node-role.kubernetes.io/control-plane"
        operator: "Exists"
        effect: "NoSchedule"

      containers:
      - name: node-exporter
        image: prom/node-exporter:latest
        ports:
        - containerPort: 9100
          name: metrics
```

---

###  Step-3: Apply the DaemonSet

```bash
kubectl apply -f node-exporter-daemonset.yaml
```

---

###  Step-4: Verify Pods are running on all nodes including master

```bash
kubectl get pods -n kube-system -o wide | grep node-exporter
```

You should now see:

```
node-exporter-xxxxx   master-node   Running
node-exporter-yyyyy   worker1       Running
node-exporter-zzzzz   worker2       Running
```

---

###  Alternative Option (Not Recommended for Production)

You can remove taint from master permanently:

```bash
kubectl taint nodes <master-node-name> node-role.kubernetes.io/control-plane:NoSchedule-
```

But prefer **tolerations** because:

* It is **clean**
* Works in multi-master clusters
* Does **not affect scheduling of other apps**

---

### ✅ Summary (Keep in Notes)

| Method              | Recommended?                 | Why                                                   |
| ------------------- | ---------------------------- | ----------------------------------------------------- |
| **Add tolerations** | ✅ Yes                        | Lets DaemonSet run on master but keeps taint in place |
| **Remove taint**    | ⚠️ No (unless lab/demo only) | Makes master schedule **all workloads**, not ideal    |
