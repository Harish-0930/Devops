
# Kubernetes Canary Deployment 

## 1. Introduction

Canary deployment is a release strategy where a small percentage of real traffic is routed to a new version of an application while the majority of users still use the stable version.
This allows safe rollout, real-world testing, and quick rollback if required.

In this setup:

* Version 1 (v1) – Stable version with 4 pods
* Version 2 (v2) – Canary version with 1 pod
* A single LoadBalancer Service sends traffic to all pods
* Kubernetes distributes traffic equally across pods

Traffic split:

* v1 receives approximately 80 percent
* v2 receives approximately 20 percent

---

## 2. Architecture

Browser or curl
→ LoadBalancer Service
→ v1 pods (4 replicas) and v2 pod (1 replica)

---

## 3. Create Namespace

```
kubectl create ns canary-demo
```

---

## 4. Docker Images Used

Both v1 and v2 use the image `nginxdemos/hello`.
This image displays:

* Pod IP
* Pod name
* Date
* URI

This makes it ideal for demonstrating canary deployments.

---

## 5. YAML Files

### 5.1 Deployment v1 (Stable – 4 Pods)

File: deploy-v1.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-v1
  namespace: canary-demo
spec:
  replicas: 4
  selector:
    matchLabels:
      app: myapp
      version: v1
  template:
    metadata:
      labels:
        app: myapp
        version: v1
    spec:
      containers:
      - name: myapp
        image: nginxdemos/hello
        ports:
        - containerPort: 80
```

---

### 5.2 Deployment v2 (Canary – 1 Pod)

File: deploy-v2.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-v2
  namespace: canary-demo
spec:
  replicas: 1
  selector:
    matchLabels:
      app: myapp
      version: v2
  template:
    metadata:
      labels:
        app: myapp
        version: v2
    spec:
      containers:
      - name: myapp
        image: nginxdemos/hello
        ports:
        - containerPort: 80
```

---

### 5.3 LoadBalancer Service

File: service-lb.yaml

```yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp-lb
  namespace: canary-demo
spec:
  type: LoadBalancer
  selector:
    app: myapp
  ports:
  - port: 80
    targetPort: 80
```

---

## 6. Apply All Resources

```
kubectl apply -f deploy-v1.yaml
kubectl apply -f deploy-v2.yaml
kubectl apply -f service-lb.yaml
```

---

## 7. Get LoadBalancer URL

```
kubectl get svc -n canary-demo myapp-lb
```

Open the external DNS in the browser.

---

## 8. Test Using Browser

Browser may appear to hit the same pod repeatedly because the browser reuses the same TCP connection.

To see different backend pods:

* Open multiple incognito windows
* Hard refresh (Ctrl+Shift+R)
* Use different query parameters

Examples:

```
http://elb-url/?test=1
http://elb-url/?test=2
http://elb-url/?test=3
```

---

## 9. Command Line Traffic Test

To see the actual distribution of traffic:

```
for i in {1..30}; do
  curl -s http://<LB-DNS> | grep -i "address";
  sleep 0.3;
done
```

Expected output includes 5 different pod IPs (4 from v1, 1 from v2).

---

## 10. Increase Canary Traffic

Increase v2 replicas:

```
kubectl scale deploy/myapp-v2 -n canary-demo --replicas=3
```

New distribution:

* v1: 4 pods
* v2: 3 pods

Traffic becomes roughly 57 percent v1 and 43 percent v2.

---

## 11. Promote Canary to Full Version

If v2 is stable:

```
kubectl delete deploy myapp-v1 -n canary-demo
```

All traffic now goes to v2.

---

## 12. Rollback to Stable Version

If v2 has issues:

```
kubectl delete deploy myapp-v2 -n canary-demo
```

Traffic automatically switches back to v1.

---

## 13. Interview Explanation

Explain that two deployments (v1 and v2) are placed behind a single LoadBalancer Service.
Since Kubernetes load-balances equally across pods, traffic split is controlled using replica count.
You then monitor traffic, increase v2 replicas gradually, and finally promote v2 to full deployment or rollback if required.
