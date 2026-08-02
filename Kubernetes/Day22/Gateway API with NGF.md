# Gateway API with NGINX Gateway Fabric (NGF)

> Deploying NGINX Gateway Fabric with the Kubernetes Gateway API to route HTTP traffic to multiple backend applications — on a local KIND cluster and on EKS with a LoadBalancer-type Gateway.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Part 1 — Local Setup on KIND](#part-1--local-setup-on-kind)
   - [Step 1: Configure the KIND Cluster](#step-1-configure-the-kind-cluster)
   - [Step 2: Install Gateway API CRDs](#step-2-install-gateway-api-crds)
   - [Step 3: Install the NGINX Gateway Fabric Controller](#step-3-install-the-nginx-gateway-fabric-controller)
   - [Step 4: Deploy Application Manifests](#step-4-deploy-application-manifests)
   - [Step 5: Create the Gateway](#step-5-create-the-gateway)
   - [Step 6: Create HTTPRoutes](#step-6-create-httproutes)
   - [Step 7: Check Connectivity](#step-7-check-connectivity)
5. [Part 2 — Setup on EKS (LoadBalancer)](#part-2--setup-on-eks-loadbalancer)
6. [Gateway API Resource Reference](#gateway-api-resource-reference)
7. [Troubleshooting](#troubleshooting)
8. [Interview Q&A](#interview-qa)
9. [Key Takeaways](#key-takeaways)
10. [Next Steps](#next-steps)

---

## Overview

This guide walks through deploying **NGINX Gateway Fabric (NGF)** with the **Kubernetes Gateway API** to route HTTP traffic to multiple backend applications:

- Running in a local **KIND** (Kubernetes in Docker) cluster
- Running in an **EKS** cluster, with the Gateway exposed as a `LoadBalancer` type

**What we'll build:**

1. Deploy NGF in a KIND cluster using Helm, and in an EKS cluster with `LoadBalancer` type.
2. Expose the NGF Gateway via `NodePort` for local access.
3. Create a `Gateway`, `Listeners`, and `HTTPRoutes` for different applications.
4. Route traffic to multiple backends (`/iphone`, `/android`, `/`) using the Gateway API.

---

## Architecture

**Local (KIND) workflow:**

![Gateway API Local](https://raw.githubusercontent.com/Harish-0930/Devops/main/Kubernetes/pictures/Gateway%20API-Deploy%20workflow-local.png)

**EKS (LoadBalancer) workflow:**

![Gateway API LoadBalancer type](https://raw.githubusercontent.com/Harish-0930/Devops/main/Kubernetes/pictures/Gateway%20API-Deploy%20workflow%20-%20LB(1).png)
> The Load Balancer is not the data plane. The NGINX proxy pods are the data plane. Think of the Load Balancer as just the entry point that forwards traffic to the data plane.
---

## Prerequisites

| Tool | Purpose | Install Guide |
|---|---|---|
| **KIND** | Local Kubernetes-in-Docker cluster | [kind.sigs.k8s.io](https://kind.sigs.k8s.io/docs/user/quick-start/#installation) |
| **Helm** | Install the NGF controller | [helm.sh](https://helm.sh/docs/intro/install/) |
| **kubectl** | Cluster interaction (includes Kustomize, used for CRDs) | — |

---

## Part 1 — Local Setup on KIND

### Step 1: Configure the KIND Cluster

**1.1 Delete any existing cluster**

```bash
kind get clusters
kind delete cluster --name=<cluster-name>
```

**1.2 KIND cluster config (`00-kind-cluster.yaml`)**

```yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
    image: kindest/node:v1.33.1@sha256:050072256b9a903bd914c0b2866828150cb229cea0efe5892e2b644d5dd3b34f
    extraPortMappings:
      - containerPort: 31000  # Port inside the KIND container
        hostPort: 31000       # Port on your local machine
```

> **Why this matters:** This mapping allows your local machine (`localhost:31000`) to directly hit the Kubernetes NodePort service running inside the KIND control-plane container.

**1.3 Create the cluster**

```bash
kind create cluster --name=gateway-api --config=00-kind-cluster.yaml
```

---

### Step 2: Install Gateway API CRDs

The Gateway API introduces several new resource types that NGINX Gateway Fabric depends on:

```bash
kubectl kustomize "https://github.com/nginx/nginx-gateway-fabric/config/crd/gateway-api/standard?ref=v2.6.7" | kubectl apply -f -
```

> ⚠️ **Important — version alignment**
>
> Step 3 installs the NGF controller via Helm, which by default installs the **latest available version**. The Gateway API CRDs installed here must **match that release version** — installing older CRDs with a newer controller can cause controller crashes or missing resources (e.g., `BackendTLSPolicy`).
>
> Before running the command above, check the latest version in the [official NGF Helm docs](https://docs.nginx.com/nginx-gateway-fabric/install/helm/) and replace the `ref=` tag accordingly so CRDs and controller stay version-aligned.

**What gets installed:**

| Resource | Purpose |
|---|---|
| `GatewayClass` | Defines a class of gateways (cluster-wide template for data planes) |
| `Gateway` | An instance of a GatewayClass (control plane + listener configuration) |
| `HTTPRoute` | Rules that route HTTP traffic to backend services |
| `GRPCRoute` | Similar to HTTPRoute, but for gRPC traffic |
| `ReferenceGrant` | Allows controlled cross-namespace references |

**Verify installation:**

```bash
kubectl api-resources | grep gateway
```

> **Note:** NGF currently supports `HTTPRoute` and `GRPCRoute` from the Gateway API standard channel. `TLSRoute`, `TCPRoute`, and `UDPRoute` are not yet supported, but may arrive in future releases.

---

### Step 3: Install the NGINX Gateway Fabric Controller

We'll run NGF in its own namespace and expose it via `NodePort` **31000**.

```bash
helm install ngf oci://ghcr.io/nginx/charts/nginx-gateway-fabric \
  --create-namespace -n ngf-gatewayapi-ns \
  --set nginx.service.type=NodePort \
  --set-json 'nginx.service.nodePorts=[{"port":31000,"listenerPort":80}]'
```

**What this does:**

- Deploys the NGINX Gateway Fabric controller into the `ngf-gatewayapi-ns` namespace as a Gateway API controller.
- `--create-namespace` ensures the namespace is created if it doesn't already exist.
- `nginx.service.type=NodePort` exposes the NGINX service externally via a fixed node port.
- `--set-json 'nginx.service.nodePorts=[{"port":31000,"listenerPort":80}]'` maps **ListenerPort 80** (the Gateway's HTTP listener) to **NodePort 31000** on the cluster nodes — allowing you to reach the Gateway from outside the cluster via `<NodeIP>:31000`.

**Verify:**

```bash
kubectl get deploy -n ngf-gatewayapi-ns
```

Expected output:

```
deployment.apps/ngf-nginx-gateway-fabric
```

**GatewayClass auto-created:**

```bash
kubectl get gatewayclasses.gateway.networking.k8s.io -o wide
```

```
NAME    CONTROLLER                                   ACCEPTED   AGE   DESCRIPTION
nginx   gateway.nginx.org/nginx-gateway-controller   True       12m
```

> **Note:** GatewayClasses are cluster-scoped — any namespace can reference them.

---

### Step 4: Deploy Application Manifests

We'll deploy three simple Python-based HTTP servers to represent different device-specific frontends (iPhone, Android, Desktop). Each app lives in the **`app1-ns`** namespace and exposes a single web page.

**4.1 iPhone App (`02-iphone.yaml`)**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: iphone-deploy
  namespace: app1-ns
spec:
  replicas: 2
  selector:
    matchLabels:
      app: iphone-page
  template:
    metadata:
      labels:
        app: iphone-page
    spec:
      containers:
      - name: python-http
        image: python:alpine
        command: ["/bin/sh", "-c"]
        args:
          - |
            mkdir -p /iphone && echo '<html>
              <head><title>iPhone Users</title></head>
              <body>
                <h1>iPhone Users</h1>
                <p>Welcome to the World of API Gateway</p>
              </body>
            </html>' > /iphone/index.html && cd / && python3 -m http.server 5678
        ports:
        - containerPort: 5678
---
apiVersion: v1
kind: Service
metadata:
  name: iphone-svc
  namespace: app1-ns
spec:
  selector:
    app: iphone-page
  ports:
  - protocol: TCP
    port: 80
    targetPort: 5678
```

> **Note:** The Python container serves an HTML page from `/iphone/index.html` on port `5678`.

**4.2 Android App (`03-android.yaml`)**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: android-deploy
  namespace: app1-ns
spec:
  replicas: 2
  selector:
    matchLabels:
      app: android-page
  template:
    metadata:
      labels:
        app: android-page
    spec:
      containers:
      - name: python-http
        image: python:alpine
        command: ["/bin/sh", "-c"]
        args:
          - |
            mkdir -p /android && echo '<html>
              <head><title>Android Users</title></head>
              <body>
                <h1>Android Users</h1>
                <p>Welcome to the World of API Gateway</p>
              </body>
            </html>' > /android/index.html && cd / && python3 -m http.server 5678
        ports:
        - containerPort: 5678
---
apiVersion: v1
kind: Service
metadata:
  name: android-svc
  namespace: app1-ns
spec:
  selector:
    app: android-page
  ports:
  - protocol: TCP
    port: 80
    targetPort: 5678
```

**4.3 Desktop App (`04-desktop.yaml`)**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: desktop-deploy
  namespace: app1-ns
spec:
  replicas: 2
  selector:
    matchLabels:
      app: desktop-page
  template:
    metadata:
      labels:
        app: desktop-page
    spec:
      containers:
      - name: python-http
        image: python:alpine
        command: ["/bin/sh", "-c"]
        args:
          - |
            echo '<html>
              <head><title>Desktop Users</title></head>
              <body>
                <h1>Desktop Users</h1>
                <p>Welcome to the World of API Gateway</p>
              </body>
            </html>' > /index.html && python3 -m http.server 5678
        ports:
        - containerPort: 5678
---
apiVersion: v1
kind: Service
metadata:
  name: desktop-svc
  namespace: app1-ns
spec:
  selector:
    app: desktop-page
  ports:
  - protocol: TCP
    port: 80
    targetPort: 5678
```

**Apply all manifests:**

```bash
kubectl apply -f 02-iphone.yaml
kubectl apply -f 03-android.yaml
kubectl apply -f 04-desktop.yaml
```

**Verify:**

```bash
kubectl get all -n app1-ns
```

---

### Step 5: Create the Gateway

`05-gateway.yaml`

```yaml
apiVersion: gateway.networking.k8s.io/v1  # API group and version for Gateway API
kind: Gateway                             # Resource type: Gateway
metadata:
  name: gateway                           # Name of the Gateway resource
  namespace: ngf-gatewayapi-ns            # Namespace where this Gateway resides
spec:
  gatewayClassName: nginx                 # References the GatewayClass to determine LB type/implementation
  listeners:                              # Listeners define how the Gateway accepts traffic
    - name: http                          # Listener name (unique within this Gateway)
      port: 80                            # Port on which the listener will accept traffic
      protocol: HTTP                      # Protocol for this listener (HTTP, HTTPS, TCP, etc.)
      allowedRoutes:                      # Rules for which Routes can bind to this listener
        namespaces:
          from: All                       # Allows Routes from any namespace to attach
```

**Apply:**

```bash
kubectl apply -f 05-gateway.yaml
```

**Verify (controller picked it up, data plane exposed):**

**1. Gateway object exists & is Ready**

```bash
kubectl get gateway -n ngf-gatewayapi-ns
kubectl describe gateway gateway -n ngf-gatewayapi-ns
```

You should see:
- **Listeners:** `http` on port **80**
- **Addresses:** (may be empty on KIND until the Service is ready)
- **Conditions:** `Programmed=True`, `Ready=True` (names may vary by controller; any "all green" is fine)

**2. GatewayClass is Accepted (controller is responsible)**

```bash
kubectl get gatewayclasses.gateway.networking.k8s.io -o wide
```

Look for the referenced class (here **nginx**) with **ACCEPTED True** and controller `gateway.nginx.org/nginx-gateway-controller`.

**3. NGF Service created and listening on NodePort 31000**

```bash
kubectl get svc -n ngf-gatewayapi-ns
```

Expect a Service for the gateway (name varies by chart, e.g. `gateway-nginx`) showing:

```
TYPE      CLUSTER-IP      EXTERNAL-IP   PORT(S)
NodePort  10.x.x.x        <none>        80:31000/TCP
```

**4. Controller and (if applicable) data-plane pods are healthy**

```bash
kubectl get pods -n ngf-gatewayapi-ns -o wide
```

**5. Events (optional, useful for debugging)**

```bash
kubectl get events -n ngf-gatewayapi-ns --sort-by=.lastTimestamp | tail -n 20
```

**What happens next:**

- NGF **sees** the `Gateway` resource and **programs the data plane** for the HTTP listener on port **80**.
- Because NGF was installed with **NodePort 31000**, the Service in `ngf-gatewayapi-ns` exposes the listener externally on `<NodeIP>:31000` (KIND maps this to `localhost:31000`).
- **Note:** At this point, without any `HTTPRoute` objects, requests will typically return a default response (e.g., 404). Routing works once routes are created in the next step.

Example Service output:

```
ngf-gatewayapi-ns   service/gateway-nginx   NodePort   10.96.188.186   <none>   80:31000/TCP   42s
```

---

### Step 6: Create HTTPRoutes

`06-routes.yaml`

```yaml
# iPhone route: matches /iphone prefix and sends traffic to iphone-svc
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: iphone-routes
  namespace: app1-ns
spec:
  parentRefs:                 # Which Gateway and listener to attach to
    - name: gateway           # Gateway name
      namespace: ngf-gatewayapi-ns
      sectionName: http       # Listener name from Gateway spec
  rules:                      # Routing rules
    - matches:
        - path:
            type: PathPrefix  # Match any path starting with /iphone
            value: /iphone
      backendRefs:
        - name: iphone-svc    # Service to send traffic to
          port: 80

---

# Android route: matches /android prefix and sends traffic to android-svc
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: android-routes
  namespace: app1-ns
spec:
  parentRefs:
    - name: gateway
      namespace: ngf-gatewayapi-ns
      sectionName: http
  rules:
    - matches:
        - path:
            type: PathPrefix
            value: /android
      backendRefs:
        - name: android-svc
          port: 80

---

# Desktop route: matches "/" (default) and sends traffic to desktop-svc
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: desktop-routes
  namespace: app1-ns
spec:
  parentRefs:
    - name: gateway
      namespace: ngf-gatewayapi-ns
      sectionName: http
  rules:
    - matches:
        - path:
            type: PathPrefix
            value: /             # Default route; matches anything not caught earlier
      backendRefs:
        - name: desktop-svc
          port: 80
```

**Apply:**

```bash
kubectl apply -f 06-routes.yaml
```

**Verify:**

```bash
kubectl get httproutes -n app1-ns
```

Example output:

```
NAME             HOSTNAMES   AGE
android-routes               4m8s
desktop-routes               4m8s
iphone-routes                4m8s
```

Inspect a route in detail:

```bash
kubectl describe -n app1-ns httproutes.gateway.networking.k8s.io iphone-routes
```

Look for:
- **Route is accepted** → configuration is valid and bound.
- **All references resolved** → Gateway + listeners + backend Services are all present.

**Other Route Types (by protocol):**

| Route Kind | Use Case |
|---|---|
| `HTTPRoute` | L7 routing for HTTP(S) traffic (used in this guide) |
| `GRPCRoute` | L7 routing for gRPC calls |
| `TLSRoute` | Passthrough based on SNI (Gateway doesn't decrypt) |
| `TCPRoute` | Generic L4 TCP routing |
| `UDPRoute` | Generic L4 UDP routing (e.g., DNS, syslog) |

---

### Step 7: Check Connectivity

**Test locally via NodePort:**

```bash
curl http://localhost:31000/android
curl http://localhost:31000/iphone
curl http://localhost:31000/
```

**Expected output:**

| Request | Result |
|---|---|
| `http://localhost:31000/iphone` | Returns **iPhone Users** HTML page |
| `http://localhost:31000/android` | Returns **Android Users** HTML page |
| `http://localhost:31000/` (or `/desktop`) | Returns **Desktop Users** HTML page |

**Validate routing via the Gateway proxy pod (for deeper debugging):**

```bash
kubectl logs -f -n ngf-gatewayapi-ns gateway-nginx-6bb659b9cf-hclbp
```

You should see incoming requests being processed by the proxy.

---

## Part 2 — Setup on EKS (LoadBalancer)

**Step 1:** Ensure you have a running EKS cluster.

**Step 2:** Install the Gateway API CRDs — same as [Step 2](#step-2-install-gateway-api-crds) in the KIND setup.

**Step 3:** Install the NGINX Gateway Fabric controller with `LoadBalancer` type:

```bash
helm install ngf \
  oci://ghcr.io/nginx/charts/nginx-gateway-fabric \
  --create-namespace \
  -n ngf-gatewayapi-ns \
  --set nginx.service.type=LoadBalancer
```

**Step 4:** Repeat [Step 4 and Step 6 Skip Step 5](#step-4-deploy-application-manifests) from the KIND setup (application manifests, Gateway, and HTTPRoutes) — no changes needed.
Follow below **Step 5** while applying the gateway manifest.

**Step 5:** Load Balancer will be created as a `internal` facing, change it to `internet-facing`
- Updated **Gateway** manifest file
```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: gateway
  namespace: ngf-gatewayapi-ns
spec:
  gatewayClassName: nginx

  infrastructure:
    annotations:
      service.beta.kubernetes.io/aws-load-balancer-type: "external"
      service.beta.kubernetes.io/aws-load-balancer-scheme: "internet-facing"
      service.beta.kubernetes.io/aws-load-balancer-nlb-target-type: "ip"

  listeners:
  - name: http
    protocol: HTTP
    port: 80
    allowedRoutes:
      namespaces:
        from: All
```
#### Apply:
```
kubectl apply -f gateway.yaml
```
> The annotations are instructions for the infrastructure that the controller creates.   These are not annotations on the Gateway itself.

> Gateway API aims to eliminate annotations for standard networking behavior, not for cloud-provider-specific infrastructure behavior.

**Step 6:** Check connectivity using the AWS Load Balancer address:

```bash
curl http://<AWS-LB>/android/
curl http://<AWS-LB>/iphone/
curl http://<AWS-LB>/
```

**Expected output:**

| Request | Result |
|---|---|
| `http://<AWS-LB>/iphone/` | Returns **iPhone Users** HTML page |
| `http://<AWS-LB>/android/` | Returns **Android Users** HTML page |
| `http://<AWS-LB>/` (or `/desktop`) | Returns **Desktop Users** HTML page |

---

## Gateway API Resource Reference

```
GatewayClass  →  Gateway  →  Listener(s)  →  HTTPRoute(s)  →  Service(s)  →  Pod(s)
   (platform)     (platform)    (platform)      (app team)      (app team)
```

| Resource | Owned By | Scope | Purpose |
|---|---|---|---|
| `GatewayClass` | Platform team | Cluster-wide | Template referencing the controller implementation |
| `Gateway` | Platform team | Namespaced | Instantiates listeners (ports/protocols) for a class |
| `HTTPRoute` | App team | Namespaced | Binds paths/hosts to backend Services |
| `ReferenceGrant` | Platform/App team | Namespaced | Authorizes cross-namespace route → backend references |

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| `404` on all requests after Gateway is applied | No `HTTPRoute` created yet | Apply the `HTTPRoute` manifests (Step 6) |
| Controller crashes or missing CRDs (e.g., `BackendTLSPolicy`) | Gateway API CRD version mismatch with NGF controller version | Re-install CRDs pinned to the same `ref=` tag as the Helm chart version |
| `curl` to `localhost:31000` times out (KIND) | Port not mapped from host to container | Confirm `extraPortMappings` in `00-kind-cluster.yaml` matches the NodePort used in Helm install |
| `HTTPRoute` shows "not accepted" / route not attaching | Listener `hostname`/`port` doesn't align with route, or `sectionName` typo | Check `parentRefs.sectionName` matches the Gateway listener name exactly |
| Route in another namespace not working | `allowedRoutes.namespaces.from` not set to permit it | Set `allowedRoutes.namespaces.from: All` (or use `Selector` + labels) on the Gateway listener |
| `EXTERNAL-IP` stuck `<pending>` on EKS | AWS Load Balancer Controller not installed, or IAM/subnet tagging issue | Verify AWS LB Controller is deployed and subnets are tagged for ELB discovery |
| `GatewayClass` shows `ACCEPTED: False` | Controller not running or wrong `gatewayClassName` referenced | Check NGF controller pod status and confirm the class name matches exactly (`nginx`) |
| Backend Service unreachable / 500 errors | Service selector doesn't match Pod labels, or wrong `targetPort` | Verify `Service.spec.selector` matches Deployment `labels`, and `targetPort` matches container port (5678) |

---

## Interview Q&A

**Q1: What problem does the Gateway API solve that Ingress doesn't?**
Gateway API separates concerns via distinct roles — infrastructure/platform teams own `GatewayClass`/`Gateway`, while application teams own `HTTPRoute`. It replaces annotation-heavy, controller-specific Ingress configuration with a portable, expressive, strongly-typed API supporting native host/path/header matching, traffic splitting, and filters.

**Q2: What's the difference between `GatewayClass`, `Gateway`, and `HTTPRoute`?**
- `GatewayClass` — cluster-scoped template referencing a specific controller implementation (e.g., NGF).
- `Gateway` — a namespaced instance of a `GatewayClass`, defining listeners (ports/protocols).
- `HTTPRoute` — namespaced rules that bind paths/hosts on a `Gateway` listener to backend Services.

**Q3: How does an `HTTPRoute` attach to a `Gateway`?**
Via `spec.parentRefs`, specifying the Gateway's `name`, `namespace`, and optionally `sectionName` (the specific listener). The Gateway's listener must also permit the route's namespace through `allowedRoutes.namespaces.from`.

**Q4: Why must the Gateway API CRD version match the NGF controller version?**
Because CRDs define the schema for resources the controller expects to manage. A version mismatch (e.g., older CRDs with a newer controller) can cause missing fields, crashes, or unsupported resources like `BackendTLSPolicy`.

**Q5: How would you expose the same Gateway setup differently on KIND vs EKS?**
On KIND, expose NGF via `nginx.service.type=NodePort` with a fixed port mapped to the host through `extraPortMappings`. On EKS, expose it via `nginx.service.type=LoadBalancer`, which provisions an AWS ELB/NLB through the cloud provider integration — no application manifest changes required.

**Q6: What Route kinds does NGF currently support, and what's missing?**
NGF currently supports `HTTPRoute` and `GRPCRoute` from the Gateway API standard channel. `TLSRoute`, `TCPRoute`, and `UDPRoute` are not yet supported, though they may be added as NGF matures.

**Q7: If routing isn't working, what's your debugging order?**
1. Confirm `GatewayClass` is `ACCEPTED: True`.
2. Confirm `Gateway` shows `Programmed=True`/`Ready=True` and has the expected listener.
3. Confirm the NGF Service is exposing the right port (`NodePort`/`LoadBalancer`).
4. Confirm `HTTPRoute` is accepted and references resolved (parentRef + backendRef).
5. Check controller/proxy pod logs and `kubectl get events` for reconciliation errors.

---

## Key Takeaways

- **Separation of duties:** Platform owns `GatewayClass`/`Gateway`; app teams own `HTTPRoute`.
- **Attachment model:** Listeners + `allowedRoutes` safely govern cross-namespace routing.
- **Declarative routing:** Host/path matches, header matches, and weights — no brittle annotations.
- **Portable by design:** Specs first; the controller (NGF) implements the data plane cleanly.
- **TLS ready:** Terminate at the Gateway with cert refs; SNI maps cleanly to Listeners.
- **Operational clarity:** Status conditions (`Accepted`/`Programmed`), events, and `kubectl` give fast feedback.

---
**Common gotchas to watch:**

- *No routes matching:* Listener `hostname`/`port` doesn't align with HTTPRoute `hostnames`.
- *Cross-namespace misses:* `allowedRoutes`/`namespaces.from` not set as expected.
- *Service reachability:* NodePort/LoadBalancer paths not open → health checks fail.
