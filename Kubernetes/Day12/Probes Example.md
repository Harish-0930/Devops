# Kubernetes Health Probes – Examples Using HTTP, TCP, and Exec

This document provides **clear, real-world YAML examples** for **all three Kubernetes probes**  
(**Liveness, Readiness, Startup**) using **all three health check methods**:

- HTTP Method  
- TCP Socket  
- Exec Command  

---

## 1️⃣ HTTP Method Examples

Used when your application exposes an **HTTP endpoint**.

---

### 🔹 Liveness Probe – HTTP

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 10
  failureThreshold: 3
```

📌 If `/health` does not return HTTP `200`, Kubernetes **restarts the container**.

---

### 🔹 Readiness Probe – HTTP

```yaml
readinessProbe:
  httpGet:
    path: /ready
    port: 8080
  initialDelaySeconds: 15
  periodSeconds: 5
  failureThreshold: 3
```

📌 If `/ready` fails, the pod is **removed from the Service load balancer**.

---

### 🔹 Startup Probe – HTTP

```yaml
startupProbe:
  httpGet:
    path: /startup
    port: 8080
  failureThreshold: 30
  periodSeconds: 10
```

📌 Until this succeeds, **liveness and readiness are disabled**.

---

## 2️⃣ TCP Socket Method Examples

Used when an application **opens a port** but doesn’t expose HTTP endpoints.

---

### 🔹 Liveness Probe – TCP

```yaml
livenessProbe:
  tcpSocket:
    port: 3306
  initialDelaySeconds: 30
  periodSeconds: 10
```

📌 If the port is unreachable → container restarted.

#### Use Case:
>Databases (MySQL, MongoDB), message brokers, legacy apps.
---

### 🔹 Readiness Probe – TCP

```yaml
readinessProbe:
  tcpSocket:
    port: 6379
  initialDelaySeconds: 10
  periodSeconds: 5
```

📌 If the port is closed → pod removed from traffic.

---

### 🔹 Startup Probe – TCP

```yaml
startupProbe:
  tcpSocket:
    port: 8080
  failureThreshold: 20
  periodSeconds: 5
```

📌 Best for slow-starting services.

---

## 3️⃣ Exec Command Method Examples

Used to **run commands inside the container**.

---

### 🔹 Liveness Probe – Exec

```yaml
livenessProbe:
  exec:
    command:
    - cat
    - /tmp/healthy
  initialDelaySeconds: 30
  periodSeconds: 10
```

📌 If file does not exist → container restarted.

---

### 🔹 Readiness Probe – Exec

```yaml
readinessProbe:
  exec:
    command:
    - sh
    - -c
    - "pgrep java"
  initialDelaySeconds: 10
  periodSeconds: 5
```

📌 If process not running → pod removed from Service.

---

### 🔹 Startup Probe – Exec

```yaml
startupProbe:
  exec:
    command:
    - sh
    - -c
    - "test -f /app/started.flag"
  failureThreshold: 30
  periodSeconds: 10
```

📌 Startup completes only when the flag file exists.

---

## 🔁 Comparison Summary

| Probe | HTTP | TCP | Exec |
|------|------|-----|------|
| Liveness | Restart | Restart | Restart |
| Readiness | Remove from LB | Remove from LB | Remove from LB |
| Startup | Delay probes | Delay probes | Delay probes |

---

## ✅ Best Practices

✔ Prefer HTTP probes for web apps  
✔ Use TCP probes for databases  
✔ Use Exec probes sparingly  
✔ Always configure startup probes for slow apps  

---

## 🎯 Final Takeaway

Proper probe configuration makes Kubernetes applications **self-healing, resilient, and production-ready** 🚀
