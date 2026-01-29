
# 📈 Horizontal Pod Autoscaling (HPA) in Kubernetes

Horizontal Pod Autoscaler (HPA) is a Kubernetes feature that **automatically increases or decreases the number of Pod replicas** in a workload based on resource usage or custom metrics.

It helps applications:
- Handle traffic spikes efficiently
- Save resources during low usage
- Scale automatically without manual intervention

![image](https://miro.medium.com/v2/resize:fit:1400/1*LgM4NNphVcyDesY_lo8OkA.png)
---

## 🔹 What Does HPA Do?

- Monitors metrics like **CPU, Memory**, or **custom metrics**
- Automatically **scales out** (adds pods) when load increases
- Automatically **scales in** (removes pods) when load decreases
- Works at the **Pod level (horizontal scaling)**

📌 **Note:** HPA does *not* increase pod resources (that is vertical scaling).

---

## 🔹 Types of Scaling in Kubernetes

### 1️⃣ Horizontal Scaling
- Increases or decreases the **number of pods**
- Example: replicas from `2 → 4`
- Implemented using **HPA**

### 2️⃣ Vertical Scaling
- Increases or decreases **CPU / Memory of a pod**
- Implemented using **VPA (Vertical Pod Autoscaler)**

---

## 🔹 Manual Scaling vs Auto Scaling

### Manual Scaling
```bash
kubectl scale deployment myapp --replicas=4
```

### Auto Scaling
- Managed by **HPA**
- Dynamic and metric-driven
- Ideal for production workloads

---

## 🔹 How HPA Works (Flow)

1. **Metrics Server** collects resource metrics
2. HPA compares **current usage vs target usage**
3. Kubernetes recalculates desired replicas
4. Pods are **created or terminated automatically**

---

## 🔹 Supported Metrics

| Metric Type        | Examples                         |
|--------------------|----------------------------------|
| Resource Metrics   | CPU, Memory                      |
| Custom Metrics     | Requests per second              |
| External Metrics   | Queue length, Cloud metrics      |

---

## 🔹 HPA vs Other Autoscalers

| Autoscaler            | Purpose                 |
|----------------------|-------------------------|
| HPA                  | Scales Pods             |
| VPA                  | Scales Pod Resources    |
| Cluster Autoscaler   | Scales Nodes            |

---

## 🔹 Kubernetes HPA vs AWS Auto Scaling

| Kubernetes HPA          | AWS Auto Scaling        |
|------------------------|-------------------------|
| Scales Pods            | Scales EC2 instances    |
| App-level scaling      | Infra-level scaling     |
| Uses Metrics Server    | Uses CloudWatch         |

---

## 🔹 Metrics Server Setup

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

### Fix Certificate Issue
```bash
kubectl edit deploy metrics-server -n kube-system
```
Add:
```yaml
- --kubelet-insecure-tls
```

---

## 🔹 Deployment YAML

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hpadeployment
spec:
  replicas: 1
  selector:
    matchLabels:
      name: hpapod
  template:
    metadata:
      labels:
        name: hpapod
    spec:
      containers:
      - name: hpacontainer
        image: k8s.gcr.io/hpa-example
        resources:
          requests:
            cpu: "100m"
            memory: "64Mi"
          limits:
            cpu: "100m"
            memory: "128Mi"
```

---

## 🔹 HPA YAML

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: hpadeploymentautoscaler
spec:
  minReplicas: 2
  maxReplicas: 4
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: hpadeployment
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 30
```

---

## 🔹 Service YAML

```yaml
apiVersion: v1
kind: Service
metadata:
  name: hpaclusterservice
spec:
  selector:
    name: hpapod
  ports:
  - port: 80
    targetPort: 80
```

---

## 🔹 Load Testing

```bash
kubectl run -i --tty load-generator --rm --image=busybox /bin/sh
```

```sh
while true
do
  wget -q -O- http://hpaclusterservice
done
```

---

## 🔹 Observe Scaling

```bash
watch kubectl get hpa
```

---

## ✅ Summary

- HPA enables automatic pod scaling
- Requires Metrics Server
- Uses CPU, memory, or custom metrics
- Production-ready scaling solution
