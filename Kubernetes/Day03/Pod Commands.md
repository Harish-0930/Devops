# 📘 Kubernetes Pod Commands + Context Commands
---

# 🌐 Kubernetes Context Commands

### 👉 List all available contexts
```sh
kubectl config get-contexts
```

### 👉 Show current context
```sh
kubectl config current-context
```

### 👉 Switch to a different context
```sh
kubectl config use-context <context-name>
```
### 👉 Set Default Namespace for Current Context
```sh
kubectl config set-context --current --namespace=<namespace>
```

### 👉 Delete a Context
```sh
kubectl config delete-context <context-name>

```


---

# 🔍 Pod Creation & Validation

### Dry-run (validate YAML without creating pod)
```sh
kubectl apply -f app.yaml --dry-run=client
kubectl apply -f app.yaml --dry-run=server
```

### Apply pod from YAML
```sh
kubectl apply -f app.yaml
```

---

# 📋 Pod Listing Commands

### List pods in default namespace
```sh
kubectl get pods
```

### List pods in a specific namespace
```sh
kubectl get pods -n <namespace>
```

### List pods in all namespaces
```sh
kubectl get pods -A
```

### List pods with node info (wide output)
```sh
kubectl get pods -o wide
kubectl get pods -o wide -n <namespace>
```

---

# 🔎 Pod Inspection Commands

### Describe a pod
```sh
kubectl describe pod <pod-name>
kubectl describe pod <pod-name> -n <namespace>
```

### Check which node a pod is running on
```sh
kubectl get pod <pod-name> -o wide
```

### Extract container names from a pod
```sh
kubectl get pod <pod-name> -o jsonpath='{.spec.containers[*].name}'
```

---

# 🧑‍💻 Pod Execution Commands

### Exec into a running container
```sh
kubectl exec -it <pod-name> -- /bin/bash
```

### Exec into a specific container (multi-container pod)
```sh
kubectl exec -it <pod-name> -c <container-name> -- /bin/bash
```

---

# 📜 Pod Logs

### View pod logs
```sh
kubectl logs <pod-name>
```

### View logs of a specific container
```sh
kubectl logs <pod-name> -c <container-name>
```

---

# ❌ Pod Deletion

### Delete a pod
```sh
kubectl delete pod <pod-name>
kubectl delete pod <pod-name> -n <namespace>
```

---

# 🛠 Helpful Extra Commands

### View all Kubernetes resource types
```sh
kubectl api-resources
```

### View only namespace-scoped objects
```sh
kubectl api-resources --namespaced=true
```

### View only cluster-scoped objects
```sh
kubectl api-resources --namespaced=false
```

---

# 📌 Summary Table

| Purpose | Command |
|--------|---------|
| Validate Pod YAML | `kubectl apply --dry-run` |
| Create Pod | `kubectl apply -f` |
| List Pods | `kubectl get pods` |
| Debug Pod | `kubectl describe pod` |
| Enter Pod | `kubectl exec` |
| Delete Pod | `kubectl delete pod` |
| Check Pod Node | `kubectl get pod -o wide` |
| List Contexts | `kubectl config get-contexts` |
| Current Context | `kubectl config current-context` |
| Switch Context | `kubectl config use-context` |

---

This file contains **Pod-only commands + Kubernetes context commands**, filtered cleanly for GitHub documentation.

