# Kubernetes Ingress - AWS Load Balancer Controller

Deploying AWS Load Balancer Controller with the Ingress to route HTTP traffic to multiple backend applications
![NGINX Ingress](https://raw.githubusercontent.com/Harish-0930/Devops/main/Kubernetes/pictures/ALB%20Ingress%20in%20kubernetes.png)

Install Required Tools

Ensure the following tools are installed on your local machine or cloud jump-host:

* [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
* [eksctl](https://eksctl.io/installation/)
* [helm](https://helm.sh/docs/intro/install/)

---

# EKS Practical Walkthrough
## Step 1: Provision EKS Cluster

```yaml
apiVersion: eksctl.io/v1alpha5       # Defines the API version used by eksctl for parsing this config
kind: ClusterConfig                  # Declares the type of resource (an EKS cluster configuration)

metadata:
  name: ingress-demo                # Name of the EKS cluster to be created
  region: us-east-2                 # AWS region where the cluster will be deployed (Ohio)
  tags:                             # Custom tags for AWS resources created as part of this cluster
    owner: Harish                   # Tag indicating the owner of the cluster
    bu: hari                        # Tag indicating business unit or project group
    project: ingress-demo           # Tag for grouping resources under the ingress demo project

availabilityZones:
  - us-east-2a                      # First availability zone for high availability
  - us-east-2b                      # Second availability zone to span the cluster

iam:
  withOIDC: true                    # Enables IAM OIDC provider, required for IAM roles for service accounts (IRSA)

managedNodeGroups:
  - name: hari-eks-priv-ng          # Name of the managed node group
    instanceType: t3.small          # EC2 instance type for worker nodes
    minSize: 4                      # Minimum number of nodes in the group
    maxSize: 4                      # Maximum number of nodes (fixed at 4 here; no autoscaling)
    privateNetworking: true         # Launch nodes in **private subnets only** (no public IPs)
    volumeSize: 20                  # Size (in GB) of EBS volume attached to each node
    iam:
      withAddonPolicies:           # Enables AWS-managed IAM policies for certain addons
        autoScaler: true           # Allows Cluster Autoscaler to manage this node group
        externalDNS: false         # Disables permissions for ExternalDNS (not used in this demo)
        certManager: yes           # Grants cert-manager access to manage certificates using IAM
        ebs: false                 # Disables EBS volume policy (not required here)
        fsx: false                 # Disables FSx access
        efs: false                 # Disables EFS access
        albIngress: true           # Grants permissions needed by AWS Load Balancer Controller (ALB)
        xRay: false                # Disables AWS X-Ray (tracing not needed)
        cloudWatch: false          # Disables CloudWatch logging from nodes (optional in minimal setups)
    labels:
      lifecycle: ec2-autoscaler     # Custom label applied to all nodes in this group (useful for targeting in node selectors or autoscaler configs)

```
### Create the cluster using:
```yaml 
eksctl create cluster -f eks-config.yaml
```
### Verify the node distribution across AZs:

```yaml 
kubectl get nodes --show-labels | grep topology.kubernetes.io/zone
```

## **Step 2: Install AWS Load Balancer Controller**

The AWS Load Balancer Controller is required for managing ALBs (Application Load Balancers) in Kubernetes using the native `Ingress` API. It watches for `Ingress` resources and creates ALBs accordingly, enabling advanced HTTP features such as path-based and host-based routing. It also supports integration with target groups, health checks, SSL termination, and more.

This step involves two sub-phases:

* Setting up the IAM permissions that allow the controller to interact with AWS APIs
* Installing the controller itself using Helm

---

### **2.1 Create IAM Policy**

The AWS Load Balancer Controller requires specific IAM permissions to provision and manage ALB resources on your behalf (such as creating Target Groups, Listeners, and Rules).

Download the required IAM policy:

```bash
curl -O https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.13.3/docs/install/iam_policy.json
```

Create the policy in your AWS account:

```bash
aws iam create-policy \
  --policy-name AWSLoadBalancerControllerIAMPolicy \
  --policy-document file://iam_policy.json
```

> The created policy will be used to grant your controller the ability to call ELB, EC2, and IAM APIs. You can inspect the JSON file for exact permissions.

---

### **2.2 Create an IAM-Backed Kubernetes Service Account**

We now create a Kubernetes `ServiceAccount` that is linked to the IAM policy created above. This is achieved using `eksctl`, which automatically sets up the necessary IAM Role and CloudFormation resources under the hood.

```bash
eksctl create iamserviceaccount \
  --cluster=ingress-demo \
  --namespace=kube-system \
  --name=aws-load-balancer-controller \
  --attach-policy-arn=arn:aws:iam::261358761470:policy/AWSLoadBalancerControllerIAMPolicy \
  --override-existing-serviceaccounts \
  --region us-east-2 \
  --approve
```

This command does the following:

* Creates an **IAM Role** with the required policy attached (visible in AWS CloudFormation).
* Annotates a Kubernetes **ServiceAccount** with this role.
* Binds the ServiceAccount to the controller pods that we will deploy in the next step.

To verify:

```bash
kubectl get sa -n kube-system aws-load-balancer-controller -o yaml
```

Example output:

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: aws-load-balancer-controller
  namespace: kube-system
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::261358761470:role/eksctl-hari-ingress-demo-addon-iamserviceacco-Role1-Llblca1iSsNh
```

This annotation allows the controller pod to **assume the IAM role** and make API calls securely from within the cluster.

---

### **2.3 Install the AWS Load Balancer Controller Using Helm**

> Note: The **AWS Load Balancer Controller** was previously known as the **ALB Ingress Controller**. While the functionality has expanded beyond ALBs, many community articles and annotations still use the older term. The official and recommended name is now AWS Load Balancer Controller.

Add the AWS-maintained Helm chart repository:

```bash
helm repo add eks https://aws.github.io/eks-charts
helm repo update eks
```

Install the controller:

```bash
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=ingress-demo \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller \
  --version 1.13.0
```

> The `--set serviceAccount.create=false` flag ensures that Helm does not attempt to create a new service account. We are using the one we created and annotated earlier using `eksctl`.

> `helm list` alone won’t show the AWS Load Balancer Controller, as it’s installed in the `kube-system` namespace. Use `helm list -n kube-system` or `helm list -A` to view it.


Optional: List available versions of the chart

```bash
helm search repo eks/aws-load-balancer-controller --versions
```

Verify that the controller is installed:

```bash
kubectl get deployment -n kube-system aws-load-balancer-controller
```

Expected output:

```
NAME                           READY   UP-TO-DATE   AVAILABLE   AGE
aws-load-balancer-controller   2/2     2            2           84s
```

Inspect the pods to verify the correct service account is mounted:

```bash
kubectl describe pods -n kube-system -l app.kubernetes.io/name=aws-load-balancer-controller
```

Look for this line under the pod description:

```
Service Account: aws-load-balancer-controller
```

This confirms the pods are using the IAM-bound service account, enabling them to create ALBs, target groups, and associated rules when `Ingress` resources are created.



## Step 3

Deploy Applications
-   Create a Dedicated Namespace
-   iphone deployment manifest
-   android deployment manifest
-   desktop deployment manifest

This step creates three separate deployments and corresponding services, each exposing a static HTML page to simulate platform-specific landing pages. These applications will be accessed via context path routing using an Ingress resource in the later steps.

---

### **3.1 Create a Dedicated Namespace**

**01-ns.yaml**

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: app1-ns
```

> We create a dedicated namespace `app1-ns` to logically isolate all resources related to this application. Namespaces help with resource scoping, management, and RBAC.

Apply the namespace:

```bash
kubectl apply -f 01-ns.yaml
```

Set it as the default for the current context to avoid specifying `-n app1-ns` repeatedly:

```bash
kubectl config set-context --current --namespace=app1-ns
```

---

### **3.2 iPhone Deployment and Service**

**02-iphone.yaml**

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
      topologySpreadConstraints:
      - maxSkew: 1
        topologyKey: topology.kubernetes.io/zone
        whenUnsatisfiable: ScheduleAnyway
        labelSelector:
          matchLabels:
            app: iphone-page
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
                <p>Welcome to the World of Ingress</p>
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
  annotations:
    alb.ingress.kubernetes.io/healthcheck-path: /iphone/index.html
spec:
  selector:
    app: iphone-page
  ports:
  - protocol: TCP
    port: 80
    targetPort: 5678
```

**Explanation:**

* `python:alpine` image runs a minimal HTTP server on port `5678` to serve `/iphone/index.html`.
* `topologySpreadConstraints` ensure pods are distributed across availability zones (`topology.kubernetes.io/zone`) with `maxSkew: 1`, minimizing zonal skew.
* The Service listens on port 80 (ClusterIP), forwarding to container port 5678.
* ALB health check is scoped to `/iphone/index.html` via annotation on the service.

Apply the resources:

```bash
kubectl apply -f 02-iphone.yaml
```

---

### **3.3 Android Deployment and Service**

**03-android.yaml**

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
      topologySpreadConstraints:
      - maxSkew: 1
        topologyKey: topology.kubernetes.io/zone
        whenUnsatisfiable: ScheduleAnyway
        labelSelector:
          matchLabels:
            app: android-page
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
                <p>Welcome to the World of Ingress</p>
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
  annotations:
    alb.ingress.kubernetes.io/healthcheck-path: /android/index.html
spec:
  selector:
    app: android-page
  ports:
  - protocol: TCP
    port: 80
    targetPort: 5678
```

**Explanation:**

* Follows the same pattern as iPhone, except the route is `/android/index.html`.
* Health checks are isolated per app context, which is crucial when a single ALB serves multiple routes.
* Distribution of pods across zones is maintained.

Apply the resources:

```bash
kubectl apply -f 03-android.yaml
```

---

### **3.4 Desktop Deployment and Service**

**04-desktop.yaml**

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
      topologySpreadConstraints:
      - maxSkew: 1
        topologyKey: topology.kubernetes.io/zone
        whenUnsatisfiable: ScheduleAnyway
        labelSelector:
          matchLabels:
            app: desktop-page
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
                <p>Welcome to the World of Ingress</p>
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
  annotations:
    alb.ingress.kubernetes.io/healthcheck-path: /index.html
spec:
  selector:
    app: desktop-page
  ports:
  - protocol: TCP
    port: 80
    targetPort: 5678
```

## **Step 4: Creating the Ingress Resource**
Since the AWS Load Balancer Controller is installed and mapped to a service account with the necessary IAM permissions, it can interact with AWS APIs to automatically create:

- An ALB with listeners
- Target groups for your services
- Health check settings
- Routing rules

#### Manifest: 05-ingress.yaml
```yaml
apiVersion: networking.k8s.io/v1           # API version for Ingress resource; stable since Kubernetes v1.19
kind: Ingress                              # Declares that this manifest defines an Ingress resource
metadata:
  name: ingress-demo1                      # Name of the Ingress resource
  namespace: app1-ns                       # Namespace in which this Ingress is deployed
  annotations:
    alb.ingress.kubernetes.io/scheme: internet-facing
    # Makes the ALB internet-facing (publicly accessible); other option is 'internal' for private use

    alb.ingress.kubernetes.io/load-balancer-name: hari-ingress-demo1
    # Assigns a custom name to the ALB; helpful for identification in the AWS Console

    alb.ingress.kubernetes.io/target-type: ip
    # Registers individual Pod IPs (via VPC CNI) in ALB target groups, skipping NodePort/host networking

    alb.ingress.kubernetes.io/listen-ports: '[{"HTTP": 80}]'
    # Configures the ALB to listen on HTTP port 80; JSON array allows multiple listeners if needed (e.g., HTTPS)

    alb.ingress.kubernetes.io/healthcheck-protocol: HTTP
    # Defines protocol used for ALB health checks (can be HTTP or HTTPS)

    alb.ingress.kubernetes.io/healthcheck-port: traffic-port
    # Uses the same port as the listener for health checks ('traffic-port' is a special keyword)

    alb.ingress.kubernetes.io/healthcheck-interval-seconds: '15'
    # Frequency (in seconds) with which ALB sends health check requests

    alb.ingress.kubernetes.io/healthcheck-timeout-seconds: '5'
    # Max time (in seconds) to wait for a health check response

    alb.ingress.kubernetes.io/healthy-threshold-count: '2'
    # Number of successful health checks before a target is marked healthy

    alb.ingress.kubernetes.io/unhealthy-threshold-count: '2'
    # Number of failed health checks before a target is marked unhealthy

    alb.ingress.kubernetes.io/success-codes: '200'
    # ALB considers HTTP 200 as a successful health check response

spec:
  ingressClassName: alb                    # Instructs Kubernetes to use the AWS ALB Ingress Controller for this resource

  rules:                                   # List of rules that define how traffic is routed
    - http:                                # All rules here apply to HTTP traffic
        paths:                             # Each entry defines a routing path
          - path: /iphone
            pathType: Prefix               # Match all paths that start with '/iphone'
            backend:
              service:
                name: iphone-svc           # Traffic matching '/iphone' goes to this Kubernetes Service
                port:
                  number: 80               # Service port (which maps to containerPort 5678 inside pods)

          - path: /android
            pathType: Prefix               # Match all paths starting with '/android'
            backend:
              service:
                name: android-svc          # Routes traffic to android-svc
                port:
                  number: 80               # Matches the port exposed by the android-svc

          - path: /
            pathType: Prefix               # Catch-all path for requests that don't match the above
            backend:
              service:
                name: desktop-svc          # Default backend service for unmatched paths (e.g., desktop)
                port:
                  number: 80               # Service port for desktop-svc

```
#### Apply the resource:
```yaml
kubectl apply -f 05-ingress.yaml
```
Check available ingress classes:

```bash
kubectl get ingressclass
```

Sample output:

```
NAME   CONTROLLER            PARAMETERS   AGE
alb    ingress.k8s.aws/alb   <none>       3h38m
```

In our case, `alb` was auto-created during AWS LBC installation.


---
Check the deployed ingress:

```bash
kubectl get ingress
```

Sample output:

```
NAME            CLASS   HOSTS   ADDRESS                                                    PORTS   AGE
ingress-demo1   alb     *       hari-ingress-demo1-351634829.us-east-2.elb.amazonaws.com   80      33s
```

> **Allow up to  ~3 minutes** for the external ALB to be provisioned after applying the Ingress manifest. You can monitor its creation in the AWS Console under EC2 → Load Balancers.

---


### **Step 5: End-to-End Verification**


### **Test the Routing**

Once the ALB is fully provisioned and all services report healthy targets, test routing via the ALB's DNS name.

#### **iPhone Users Route**

```
http://hari-ingress-demo1-351634829.us-east-2.elb.amazonaws.com/iphone
```

Expected Output:

```
iPhone Users
Welcome to the World of Ingress
```

This is served by the `iphone-deploy` pods, with static HTML under `/iphone/index.html`.

---

#### **Android Users Route**

```
http://hari-ingress-demo1-351634829.us-east-2.elb.amazonaws.com/android
```

Expected Output:

```
Android Users
Welcome to the World of Ingress
```

This is served by the `android-deploy` pods from `/android/index.html`.

---

#### **Desktop Users Route (Default/Catch-All)**

```
http://hari-ingress-demo1-351634829.us-east-2.elb.amazonaws.com/
```

Expected Output:

```
Desktop Users
Welcome to the World of Ingress
```

This route is matched last and acts as the catch-all fallback. If the request path doesn't match `/iphone` or `/android`, it routes to `desktop-svc`, which serves from the root (`/index.html`).

---

### **Verify the Ingress Configuration**

You can use the following command to inspect your Ingress setup and ensure everything is registered as expected:

```bash
kubectl describe ingress ingress-demo1
```

Look for:

* Ingress class (`alb`)
* Load balancer hostname (ALB DNS name)
* Path rules and associated backends
* Events showing successful sync with the AWS Load Balancer Controller

---

### **Verify from the AWS Console**

To cross-check that your Ingress configuration has been reflected properly:

Navigate to **EC2 → Load Balancers** and locate the ALB with the name defined in:

```yaml
alb.ingress.kubernetes.io/load-balancer-name: hari-ingress-demo1
```

Then verify:

* **Scheme** is set to `internet-facing`
* **Listener** is configured on port `80`
* **Target Groups** are created for `iphone-svc`, `android-svc`, and `desktop-svc` with target type `ip`
* **Health Check** settings for each target group match the annotations set on the respective Service
* **Routing Rules** map `/iphone`, `/android`, and `/` paths to the correct target groups


By completing this verification, you confirm that your AWS ALB was dynamically provisioned and fully configured based on the Kubernetes-native Ingress resource—bridging the gap between Kubernetes and AWS networking seamlessly.

---


### **Step 6: Cleanup**

#### **Cleanup**

To remove the Kubernetes resources created during this demo, you can run:

```bash
kubectl delete -f .
```

> This command assumes all manifest files (`Namespace`, `Deployments`, `Services`, `Ingress`) are present in the current directory and were originally applied from here.

If you prefer to delete resources manually, use:

```bash
kubectl delete ingress ingress-demo1
kubectl delete svc iphone-svc android-svc desktop-svc
kubectl delete deploy iphone-deploy android-deploy desktop-deploy
kubectl delete ns app1-ns
```

This will:

* Remove the **Ingress** and associated **AWS Application Load Balancer**
* Delete **target groups**, **listeners**, and **security groups** that were provisioned dynamically

> **Note**: If you're done with all demos and want to completely clean up your EKS environment, you can delete the entire cluster using:

```bash
eksctl delete cluster --name hari-ingress-demo
```
