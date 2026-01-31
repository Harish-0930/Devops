# Kubernetes Health Probes (Liveness, Readiness, Startup)

## Introduction
Kubernetes **Probes** are mechanisms used to **inspect, monitor, and validate the health of containers** running inside a Pod.  
They help Kubernetes decide **when to restart a container**, **when to send traffic**, and **when to wait during startup**.

> **Probe = Inspecting / Monitoring process**

---

## Why Probes Are Important
- Ensure applications are **running correctly**
- Prevent traffic from hitting **unhealthy pods**
- Automatically **recover** from failures
- Handle **slow-starting applications** safely

---

## Types of Kubernetes Health Probes

| Probe Type   | Purpose                              | What Happens on Failure |
|-------------|--------------------------------------|-------------------------|
| **Liveness** | Is the container alive?              | 🔁 Container restarted |
| **Readiness** | Can the pod receive traffic?        | 🚫 Removed from Service |
| **Startup** | Has the application started?         | ⏳ Delays other probes |

---

## Probe Check Mechanisms
Each probe can check health using **three methods**:

1. **HTTP Method**
2. **TCP Socket**
3. **Exec Command**

![image](https://miro.medium.com/v2/resize:fit:1400/1*URtaORtrA_WhvA8VXbYExw.jpeg)
---

## 1️⃣ Liveness Probe

### What it Does
- Checks whether the **application is still running**
- If the application is stuck (deadlock, memory leak, CPU issue), Kubernetes **restarts the container**

### Use Case
- Application is running but **not responding**
- JVM deadlock
- Infinite loop
- Memory leak

### Outcome
- ❌ Probe fails → 🔁 **Container Restarted**

---

## 2️⃣ Readiness Probe

### What it Does
- Checks whether the **pod is ready to receive traffic**
- If the probe fails, traffic is **stopped immediately**

### Use Case
- App is starting
- App temporarily unavailable (DB down, dependency issue)
- Maintenance mode

### Outcome
- ❌ Probe fails → 🚫 **Removed from Load Balancer**
- ✅ Probe succeeds → ✅ Traffic resumes

---

## 3️⃣ Startup Probe

### What it Does
- Ensures the application has **fully started**
- Used for **slow-starting applications**

### Important Behavior
Until **startup probe succeeds**:
- 🚫 Liveness probe is disabled
- 🚫 Readiness probe is ignored

This prevents Kubernetes from **restarting apps too early**.

---

## Probe Execution Flow
1. **Startup Probe** runs first
2. Once successful:
   - **Liveness Probe** is enabled
   - **Readiness Probe** is enabled
3. Normal traffic flow begins

---

## Example: Deployment with Liveness & Readiness Probes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: javawebappdep
  namespace: prod
spec:
  replicas: 2
  strategy:
    type: Recreate
  selector:
    matchLabels:
      app: javawebapp
  template:
    metadata:
      name: javawebapp
      labels:
        app: javawebapp
    spec:
      containers:
      - name: javawebapp
        image: harish0930/java-web-app
        ports:
        - containerPort: 8080
        livenessProbe:
          httpGet:
            path: /maven-web-application
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /maven-web-application
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 5
          failureThreshold: 3
```

---

## Example: Service Definition

```yaml
apiVersion: v1
kind: Service
metadata:
  name: javawebappsvc
  namespace: prod
spec:
  type: NodePort
  selector:
    app: javawebapp
  ports:
  - port: 80
    targetPort: 8080
```

---

## Example: Separate Health Endpoints

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 10
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /ready
    port: 8080
  initialDelaySeconds: 15
  periodSeconds: 5
  failureThreshold: 3
```

---

## Best Practices
✔ Use **separate endpoints** for liveness & readiness  
✔ Add **startup probe** for slow apps (Spring Boot, Java)  
✔ Tune `initialDelaySeconds` properly  
✔ Keep probe logic **lightweight**

---

## Summary
- **Liveness** → Restart broken containers  
- **Readiness** → Control traffic flow  
- **Startup** → Protect slow-starting apps  

Using probes correctly makes your Kubernetes applications **self-healing, resilient, and production-ready** 🚀
