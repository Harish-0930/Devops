
# Helm in Kubernetes

## 1. What is Helm?
Helm is a **package manager for Kubernetes**, similar to **apt/yum** for Linux.  
It helps you **define, install, upgrade, and manage Kubernetes applications** using packages called **Charts**.

Instead of manually applying multiple Kubernetes YAML files, Helm allows you to deploy everything as a **single package**.

---

# 2. Key Concepts

## Charts
A **Helm Chart** is a collection of files that describe a related set of Kubernetes resources.

A chart contains:
- Kubernetes manifest templates
- Default configuration values
- Chart metadata

## Releases
A **Release** is an **instance of a chart deployed in a Kubernetes cluster**.

Example:

Chart → nginx-chart  
Release → nginx-prod

You can:
- Upgrade releases
- Rollback releases
- Track release history

## Repository
A **Helm Repository** is a location where Helm charts are stored and shared.

Examples:
- ArtifactHub
- Bitnami Helm Repo
- Custom private repositories

ArtifactHub:
https://artifacthub.io

---

# 3. Helm Architecture

## Helm 2 (Deprecated)
Helm 2 used a **client-server architecture**.

Components:

Helm Client  
Tiller (server inside cluster)

Problems:
- Security risks
- Complex RBAC management

## Helm 3 (Current Version)
Helm 3 removed **Tiller**.

Architecture:

Helm CLI → Kubernetes API Server

Advantages:
- Simpler
- More secure
- Uses Kubernetes RBAC directly

---

# 4. Install Helm

Install Helm 3 using the official script.

```bash
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3

chmod 700 get_helm.sh

./get_helm.sh
```

Verify installation:

```bash
helm version
```

---

# 5. Uninstall Helm

```bash
sudo rm /usr/local/bin/helm
rm -rf ~/.config/helm
rm get_helm.sh
```

---

# 6. Helm Chart Structure

Example chart structure:

```
mychart/
│
├── Chart.yaml
├── values.yaml
├── charts/
└── templates/
    ├── deployment.yaml
    ├── service.yaml
    └── pv.yaml
```

## Chart.yaml
Metadata about the chart.

Example:

```yaml
apiVersion: v2
name: javawebapp
description: Helm chart for Java Web Application
version: 1.0.0
appVersion: "1.0.1"
```

---

## values.yaml

Contains **default configuration values** for templates.

Example:

```yaml
replicaCount: 2

image:
  repository: myrepo/myapp
  tag: "1.0.0"

service:
  type: LoadBalancer
  port: 80

resources:
  requests:
    cpu: "1"
    memory: "12Gi"
```

These values can be overridden during deployment.

---

# 7. Helm Templating

Helm uses **Go Template Engine**.

Example:

```yaml
replicas: {{ .Values.replicaCount }}

image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
```

Common objects:

| Template Object | Description |
|---|---|
| `.Values` | Values from values.yaml |
| `.Release.Name` | Release name |
| `.Chart.Name` | Chart name |
| `.Chart.Version` | Chart version |

---

# 8. Deploy Third Party Applications Using Helm

Example: **Metrics Server**

Metrics Server collects **resource usage data** such as CPU and memory for pods and nodes.

Check current Kubernetes context:

```bash
kubectl config current-context
```

Check metrics (after installation):

```bash
kubectl top nodes
kubectl top pods
```

---

# 9. Add Helm Repository

Check repositories:

```bash
helm repo ls
```

Add metrics-server repo:

```bash
helm repo add metrics-server https://kubernetes-sigs.github.io/metrics-server/
```

Update repo index:

```bash
helm repo update
```

---

# 10. Search Charts

```bash
helm search repo metrics-server
```

---

# 11. View Chart Default Values

```bash
helm show values metrics-server/metrics-server
```

---

# 12. View All Kubernetes Templates

```bash
helm template metrics-server/metrics-server
```

This shows all Kubernetes manifests that Helm will generate.

---

# 13. Install a Helm Chart

Dry run:

```bash
helm upgrade --install metrics-server metrics-server/metrics-server -n test-ns --dry-run
```

Install:

```bash
helm upgrade --install metrics-server metrics-server/metrics-server -n test-ns
```

---

# 14. List Helm Releases

```bash
helm ls -A
```

Specific namespace:

```bash
helm ls -n kube-system
```

---

# 15. Change Configuration

Example: increase replicas

```bash
helm upgrade metrics-server metrics-server/metrics-server --set replicas=3
```

⚠ Not recommended for large configurations.

---

# 16. Rollback Helm Release

Check release history:

```bash
helm history metrics-server
```

Rollback:

```bash
helm rollback metrics-server <revision>
```

---

# 17. Uninstall Helm Release

```bash
helm uninstall metrics-server
```

---

# 18. Using Custom values.yaml

Passing many values using `--set` is not recommended.

Instead create a custom values file.

Example:

metricservervalues.yaml

```yaml
replicas: 2

resources:
  requests:
    cpu: 300m
    memory: 512Mi
```

Deploy:

```bash
helm upgrade --install metrics-server -f metricservervalues.yaml metrics-server/metrics-server
```

Verify:

```bash
kubectl describe pod <pod-name>
```

---

# 19. Create Your Own Helm Chart

Create chart:

```bash
helm create javawebapp
```

Structure:

```
javawebapp/
├── Chart.yaml
├── values.yaml
└── templates/
```

---

# 20. Example values.yaml

```yaml
replicaCount: 2

image:
  repository: harish0930/java-web-app:1.0.0
  pullPolicy: IfNotPresent
  tag: "1.0.1"

service:
  type: NodePort
  port: 80
  targetPort: 8080
```

---

# 21. Example Deployment Template

templates/deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Release.Name }}
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      app: {{ .Release.Name }}
  template:
    metadata:
      labels:
        app: {{ .Release.Name }}
    spec:
      containers:
      - name: {{ .Release.Name }}
        image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
        ports:
        - containerPort: {{ .Values.service.targetPort }}
```

---

# 22. Example Service Template

templates/service.yaml

```yaml
apiVersion: v1
kind: Service
metadata:
  name: {{ .Release.Name }}-service
spec:
  type: {{ .Values.service.type }}
  selector:
    app: {{ .Release.Name }}
  ports:
  - port: {{ .Values.service.port }}
    targetPort: {{ .Values.service.targetPort }}
```

---

# 23. Deploy Your Chart

```bash
helm install javawebapp ./javawebapp
```

or

```bash
helm upgrade --install javawebapp ./javawebapp
```

---

# 24. Useful Helm Commands

Create chart

```bash
helm create <chartName>
```

Validate chart

```bash
helm lint <chartName>
```

Package chart

```bash
helm package javawebapp
```

Install packaged chart

```bash
helm upgrade --install javawebapp2 javawebapp-1.0.0.tgz -n prod
```

Show values

```bash
helm show values javawebapp-1.0.0.tgz
```

Release status

```bash
helm status <release-name> --show-resources
```

Delete release

```bash
helm uninstall <release-name> -n <namespace>
```

---

# 25. Best Practices

Use Version Control for charts

Create reusable charts

Avoid using --set for many values

Use separate values.yaml for each environment

Example:

values-dev.yaml  
values-stg.yaml  
values-prod.yaml

---

# 26. Popular Helm Charts

Common applications available as Helm charts:

- NGINX
- Prometheus
- Grafana
- MySQL
- PostgreSQL
- Metrics Server
- Jenkins
- Elasticsearch

Browse charts:

https://artifacthub.io

---

# Quick Summary

Helm helps you:

- Package Kubernetes applications
- Reuse templates
- Manage releases
- Upgrade and rollback deployments easily
- Deploy complex applications quickly

Helm is **one of the most important tools in Kubernetes ecosystem**.

