# Deployment 

```bash
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hpadeployment
  labels:
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
        ports:
        - name: http
          containerPort: 80
        resources:
          requests:
            cpu: "100m"
            memory: "64Mi"
          limits:
            cpu: "100m"
            memory: "128Mi"
```
---
# HPA

```bash
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: hpadeploymentautoscaler
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: hpadeployment
  minReplicas: 2
  maxReplicas: 4
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 30
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```
---

# Service

```bash
apiVersion: v1
kind: Service
metadata:
  name: hpaclusterservice
  labels:
    name: hpaservice
spec:
  ports:
  - port: 80
    targetPort: 80
  selector:
    name: hpapod
  type: ClusterIP
```
