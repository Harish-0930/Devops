# NGINX Ingress Controller with a LoadBalancer Service on EKS

### Table of Contents

1. NGINX Ingress Controller Installation and change LB to internet-facing
2. Application Manifest files
3. Ingress Resource file
4. Verification

## 1. **Installing NGINX Ingress Controller**
## Step 1: Add the Helm Repository

```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx

helm repo update
```

---

## Step 2: Install the NGINX Ingress Controller

```bash
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace
```

This creates several Kubernetes resources, including:

* Deployment (`ingress-nginx-controller`)
* Service (`ingress-nginx-controller`)
* Admission Webhook
* RBAC resources
* ConfigMaps

---

## Step 3: Verify the Installation

```bash
kubectl get pods -n ingress-nginx
```

Expected:

```text
NAME                                        READY   STATUS
ingress-nginx-controller-xxxx               1/1     Running
```

---

## Step 4: Verify the Service

```bash
kubectl get svc -n ingress-nginx
```

Expected:

```text
NAME                         TYPE           EXTERNAL-IP
ingress-nginx-controller     LoadBalancer   <AWS-ELB-DNS>
```

Notice:

```text
TYPE = LoadBalancer
```

Because the Service type is `LoadBalancer`, EKS automatically provisions an AWS Load Balancer.

---

# Why was the Load Balancer Internal?

Initially, the created Load Balancer showed:

```text
Type   : Network
Scheme : Internal
```

This means AWS created an **Internal Network Load Balancer (NLB)**, which is only accessible from within the VPC.

This happens because:

* the Service didn't specify a scheme, and
* AWS selected **Internal** based on the cluster/subnet configuration.

---

# Changing the Load Balancer from Internal to Internet-facing

## Option 1 (Recommended): Install with the Required Annotation

Install the controller with the following annotation:

```bash
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --set controller.service.annotations."service\.beta\.kubernetes\.io/aws-load-balancer-scheme"="internet-facing"
```

This tells AWS:

> Create a **public Network Load Balancer**.

---

## Option 2: Upgrade an Existing Installation

If the controller is already installed:

```bash
helm upgrade ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --reuse-values \
  --set controller.service.annotations."service\.beta\.kubernetes\.io/aws-load-balancer-scheme"="internet-facing"
```

---

## Option 3: Update the Existing Service

Add the annotation:

```bash
kubectl annotate svc ingress-nginx-controller \
  -n ingress-nginx \
  service.beta.kubernetes.io/aws-load-balancer-scheme=internet-facing \
  --overwrite
```

Depending on the cluster and cloud controller behavior, you may then need to recreate the Service (or reinstall/upgrade the Helm release) so AWS provisions a new internet-facing NLB.

---

# Verify the Load Balancer

Check the Service:

```bash
kubectl get svc -n ingress-nginx
```

Expected:

```text
NAME                         TYPE           EXTERNAL-IP
ingress-nginx-controller     LoadBalancer   k8s-xxxx.elb.amazonaws.com
```

In the AWS Console:

* **Type:** Network
* **Scheme:** Internet-facing

---

# Why is the Load Balancer Type "Network"?

You never explicitly selected **Network Load Balancer**.

The Helm chart creates the following Service:

```yaml
spec:
  type: LoadBalancer
```

When EKS sees a Service of type `LoadBalancer`, the AWS cloud provider provisions an **AWS Network Load Balancer (NLB)** by default.

So the flow is:

```text
Helm Install
      │
      ▼
Service (Type = LoadBalancer)
      │
      ▼
AWS Cloud Provider
      │
      ▼
Creates an AWS Network Load Balancer
```

---

# Complete Request Flow

```text
Internet
     │
     ▼
AWS Network Load Balancer (Internet-facing)
     │
     ▼
NGINX Ingress Controller Service (LoadBalancer)
     │
     ▼
NGINX Ingress Controller Pod
     │
     ▼
Ingress Resource
     │
     ▼
ClusterIP Service
     │
     ▼
Application Pods
```
## 2. Application Manifest files

#### webapp.yaml
```yaml
apiVersion: apps/v1
kind: Deployment

metadata:
  name: webapp-deployment

spec:
  replicas: 2

  selector:
    matchLabels:
      app: webapp

  template:
    metadata:
      labels:
        app: webapp

    spec:
      containers:
      - name: webapp
        image: hari123/webapp:v1
        imagePullPolicy: Always

        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service

metadata:
  name: webapp-service

spec:

  selector:
    app: webapp

  ports:
  - port: 80
    targetPort: 80

  type: ClusterIP
  ```
#### Apply maifest file
```yaml
kubectl apply -f deployment.yaml
```
#### Verify
```
kubectl get pods 
kubectl get svc
```
## 3. Create Ingress Resource
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: webapp-ingress
spec:
  ingressClassName: nginx
  rules:
  - http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: webapp-service
            port:
              number: 80
```
#### Deploy
```
kubectl apply -f ingress.yaml
```
## 4. Verify
```
kubectl get ingress
```
#### Expected Output
```
NAME                 CLASS   HOSTS   ADDRESS

techgosoft-ingress   nginx   *       a1b2c3d....
```
## Verification Commands

## Verify Pods

```bash
kubectl get pods
```

## Verify Services

```bash
kubectl get svc
```

## Verify Ingress

```bash
kubectl get ingress
```

## Verify Controller

```bash
kubectl get pods -n ingress-nginx
```

---
## Access the Website

## Local

```
http://localhost:9090
```

## Public

```
http://<AWS-ELB-DNS>
```

Example:

```
http://k8s-ingressn-ingressn-xxxxxxxx.elb.us-east-2.amazonaws.com
```

### Useful Commands
## List Ingress Controller Service

```bash
kubectl get svc -n ingress-nginx
```

## Describe Ingress Controller Service

```bash
kubectl describe svc ingress-nginx-controller -n ingress-nginx
```

---

## Deployment Commands

## List Deployments

```bash
kubectl get deployments
```

## Describe Deployment

```bash
kubectl describe deployment <deploy-name>
```

---

## Ingress Commands

## List Ingress

```bash
kubectl get ingress
```

## Describe Ingress

```bash
kubectl describe ingress techgosoft-ingress
```
---

## Port Forwarding

## Forward Service

```bash
kubectl port-forward svc/techgosoft-service 9090:80
```

Access:

```
http://localhost:9090
```

---

## Endpoint Commands

## List Endpoints

```bash
kubectl get endpoints
```

## Ingress Controller Endpoints

```bash
kubectl get endpoints ingress-nginx-controller -n ingress-nginx
```

---

## Helm Repository

## Add Repository

```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
```

## Update Repository

```bash
helm repo update
```


---

## Helm Status

## List Releases

```bash
helm list -A
```

## Namespace Releases

```bash
helm list -n ingress-nginx
```

## Release Status

```bash
helm status ingress-nginx -n ingress-nginx
```

## View Rendered Manifests

```bash
helm get manifest ingress-nginx -n ingress-nginx
```

## Show Default Values

```bash
helm show values ingress-nginx/ingress-nginx
```
## Delete Service

```bash
kubectl delete svc ingress-nginx-controller -n ingress-nginx
```

---

## Check All Resources

## Current Namespace

```bash
kubectl get all
```

## Ingress Namespace

```bash
kubectl get all -n ingress-nginx
```

---

## Check NGINX Controller Logs

```bash
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller
```

Last 100 lines:

```bash
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller --tail=100
```

---
## Verification Commands

## Verify Pods

```bash
kubectl get pods
```

## Verify Services

```bash
kubectl get svc
```

## Verify Ingress

```bash
kubectl get ingress
```

## Verify Controller

```bash
kubectl get pods -n ingress-nginx
```
