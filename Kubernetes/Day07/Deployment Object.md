# 🧠 Kubernetes Objects – Deployment

## 📌 What is a Deployment?

In Kubernetes, a **Deployment** is a higher-level object that manages ReplicaSets and ensures that a specified number of pods are running at all times. It provides features like rolling updates, rollbacks, and scaling.

---

## ✅ Key Features of a Deployment

- Creates and manages ReplicaSets.
- Automatically updates pods via `PodTemplateSpec`.
- Supports rollback to previous stable versions.
- Scales applications up or down easily.
- Allows pause/resume during rollout for debugging or manual control.
- Tracks status of the rollout for visibility and monitoring.
- Cleans up old ReplicaSets automatically if configured.

---

## 🧪 Common Deployment Commands

```bash
# Scale a deployment
kubectl scale deployment <DEPLOYMENT_NAME> --replicas=<NUMBER_OF_REPLICAS>

# Check rollout status
kubectl rollout status deployment nginx-deployment

# Get all deployments
kubectl get deployment

# Update image and record the change
kubectl set image deployment nginx-deployment nginx-container=nginx:latest --record

# Check associated ReplicaSets
kubectl get replicaset

# Show rollout history
kubectl rollout history deployment nginx-deployment

# Show details of a specific revision
kubectl rollout history deployment nginx-deployment --revision=1

# Rollback to specific revision
kubectl rollout undo deployment nginx-deployment --to-revision=1
````

---

## 🚀 Deployment Strategies

### 🔄 1. Rolling Update (Default Strategy)

This strategy updates pods **gradually**, ensuring that some pods remain available during the update process.

> ✔ No downtime
> ✔ Version overlap: New and old pods run together temporarily
> ✔ Ideal for production environments

![Rolling Update Strategy](https://www.tatvasoft.com/blog/wp-content/uploads/2024/03/Rolling-Deployment-Strategy.jpg)

---

### 🔁 2. Recreate Strategy

All old pods are terminated **at once** before new pods are started.

> ❌ Downtime possible
> ❌ All pods stopped before new ones start
> ✔ Simple, clean rollout
> ✔ Used in dev/testing environments where downtime is acceptable

![Recreate Deployment Strategy](https://images.ctfassets.net/23aumh6u8s0i/1FVQm06ERSn67QJkI2zlfj/49ef78e46445aa7e6a7e54349e85e2b7/02_recreate-deployment.jpg)

---

## 📘 Comparison Table

| Strategy       | Downtime | Pod Lifecycle        | Rollback | Use Case                 |
| -------------- | -------- | -------------------- | -------- | ------------------------ |
| Rolling Update | ❌ No     | Gradual, overlapping | ✅ Yes    | Production environments  |
| Recreate       | ✅ Yes    | All at once          | ✅ Yes    | Dev/testing environments |
