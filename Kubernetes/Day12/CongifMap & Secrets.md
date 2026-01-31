# Kubernetes ConfigMaps and Secrets

## 📌 Overview
In Kubernetes, **ConfigMaps** and **Secrets** are objects used to externalize configuration from your application code so you don’t hard-code values inside container images.

---

## 🔧 What is a ConfigMap?
 A **ConfigMap** is an API object used to store **non-confidential data** in key-value pairs. Pods can consume ConfigMaps as environment variables, command-line arguments, or as configuration files in a volume.

A **ConfigMap** stores **non-sensitive configuration data**, such as:
- Application properties
- Environment variables
- Feature flags
- URLs, ports, log levels

> __Note:__ ConfigMap does not provide secrecy or encryption. If the data you want to store are confidential, use a Secret rather than a ConfigMap, or use additional (third party) tools to keep your data private.


### 👉 Purpose
- Change configuration **without rebuilding container images**
- Separate configuration from application logic

### Example ConfigMap
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  SPRING_PROFILES_ACTIVE: prod
  LOG_LEVEL: INFO
```

---

## 🔐 What is a Secret?
A **Secret** stores **sensitive data**, such as:
- Passwords
- API keys
- Tokens
- Certificates

### 👉 Purpose
- Protect confidential information
- Restrict access using Kubernetes security mechanisms

### Example Secret
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-secret
type: Opaque
data:
  MONGO_USERNAME: ZGV2ZGI=
  MONGO_PASSWORD: ZGV2ZGJAMTIz
```

> ⚠️ Values are **Base64 encoded**, not encrypted by default.

---

## 🔒 Security Considerations
- Secrets can be **encrypted at rest** using etcd encryption
- Access controlled via **RBAC**
- Avoid exposing Secrets in logs or environment dumps

---

## 📊 ConfigMap vs Secret Comparison

| Feature | ConfigMap | Secret |
|------|----------|--------|
| Used for | Non-sensitive config | Sensitive data |
| Encoding | Plain text | Base64 |
| Security | Not secure | RBAC + encryption |
| Typical data | URLs, ports | Passwords, tokens |
| Size limit | ~1MB | ~1MB |

---

## ✅ Best Practices

### Use ConfigMaps for:
- Application configuration
- Feature toggles
- Environment-specific values

### Use Secrets for:
- Database credentials
- TLS certificates
- API keys

### ❌ Avoid:
- Storing passwords in ConfigMaps
- Committing Secrets to Git repositories  
  (Use **Sealed Secrets** or **External Secret Managers**)

---

## 📌 Real-World Example (Spring Boot + MongoDB)

- **ConfigMap**
  - `SPRING_PROFILES_ACTIVE=prod`

- **Secret**
  - `MONGO_USERNAME`
  - `MONGO_PASSWORD`

---

## 📎 Summary
- ConfigMaps manage **application configuration**
- Secrets manage **sensitive credentials**
- Together, they enable **secure, flexible, and scalable** Kubernetes deployments


