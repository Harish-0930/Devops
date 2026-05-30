# **GitHub Actions Basics**
---

# **1. Introduction to GitHub Actions**

## **1.1 What is GitHub Actions?**

GitHub Actions is a **CI/CD automation platform built directly inside GitHub**.
It helps you automate tasks like:

* Building code
* Running tests
* Deploying applications
* Creating Docker images
* Pushing artifacts
* Running cron jobs
* Triggering workflows on pull requests
* Infrastructure automation (Terraform / Ansible)

### **Simple Definition **

> GitHub Actions = Automation engine inside GitHub where every automation is written as YAML and executed automatically using runners.

You don’t need:

* No servers
* No plugins
* No Jenkins master
* No external CI tools

Just create a file → **.github/workflows/main.yml** → GitHub executes it.

---

## **1.2 Why GitHub Actions? **

* Built directly inside GitHub → No integrations needed
* Free minutes for public repositories
* Fastest setup: Just add YAML
* Supports all languages: Java, Python, Node, Go, .NET, etc
* Supports Docker, Kubernetes, and cloud deployments
* 20,000+ marketplace actions (pre-built automation modules)
* Highly secure with GitHub secrets + environment protection
* Multi-platform support

---

# **1.3 Supported Operating Systems in GitHub Actions**

GitHub Actions supports 3 main OS platforms:

---

## **A. GitHub-Hosted Runners (Official)**

### **1. Ubuntu Linux (Most commonly used)**

* ubuntu-latest
* ubuntu-24.04
* ubuntu-22.04
* ubuntu-20.04

**Usage:**
Java, Python, Docker, Terraform, Kubernetes all work best on Ubuntu.

---

### **2. Windows**

* windows-latest
* windows-2022
* windows-2019

**Usage:**
DotNet apps, Powershell scripts, Windows builds.

---

### **3. macOS**

* macos-latest
* macos-14 (Apple Silicon M1/M2)
* macos-13
* macos-12

**Usage:**
iOS apps, Swift, Xcode builds.

---

## **B. Self-Hosted Runners (Custom)**

You can use your own OS/machine as runner:

* Any Linux
* Windows
* macOS
* On-prem VMs
* AWS EC2 / Azure VM / GCP
* Kubernetes runners
* Docker runners

Self-hosted runners support **ANY custom OS** your organization needs.

---

# **2. Introduction to Workflows**

Workflows = **Main CI/CD automation file**.

Location:

```
.github/workflows/<workflow-name>.yml
```

### **Definition**

> A workflow is a YAML file that contains automation logic such as when to run, which jobs to run, how to build, test, deploy, etc.

### **Workflow Trigger Examples**

A workflow can run on:

* Push
* Pull request
* Tag creation
* Release creation
* Branch merge
* Schedule (cron)
* Manual dispatch
* Reusable workflows
* Issue/comment events

Example:

```yaml
on: push
```

---

# **3. Jobs, Steps, and Runners (Core Concepts)**

These 3 terms form the foundation of GitHub Actions.

---

## **3.1 What is a Job?**

A job is a group of steps that run **inside the same runner**.

### **Important Points**

* A workflow contains **one or more jobs**
* Each job runs **in parallel** by default
* You can add dependencies using `needs:`
* A job uses **one runner**

Example:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
```

---

## **3.2 What is a Step?**

Steps are the **actual commands/actions** executed inside a job.

Types of steps:

1. **Shell commands**
2. **Marketplace actions**
3. **Your own custom action**

Example:

```yaml
steps:
  - name: Checkout code
    uses: actions/checkout@v4

  - name: Run tests
    run: mvn test
```

---

## **3.3 What is a Runner?**

A runner is a machine that **executes your GitHub Actions jobs**.

### Two types:

* GitHub-hosted runners
* Self-hosted runners

GitHub-hosted runner is managed by GitHub → Fresh VM every run.
Self-hosted runner is your own machine → Persistent environment.

---

# **4. Types of Runners (Most Important Topic)**

GitHub Actions provides **3 main categories** of runners.

---

# **4.1 GitHub-Hosted Runners (Default)**

### Features:

* Fully managed by GitHub
* Auto-scale
* Clean environment
* Comes pre-installed with:

  * Docker
  * Java
  * Node
  * Python
  * AWS CLI
  * Git
  * Terraform
  * K8s tools (kubectl, helm)

### Best For:

* General CI/CD
* Docker builds
* Cloud deployments
* Testing frameworks

### Example:

```yaml
runs-on: ubuntu-latest
```

---

# **4.2 Self-Hosted Runners (Custom runners)**

### What are they?

Your own machine acting as runner.

Can be:

* On-prem server
* Laptop
* Cloud VM (EC2/Azure/GCP)
* Kubernetes pod
* Docker container

### Why use them?

✔ Needed for private networks
✔ When you need large CPU/RAM
✔ For large Docker builds
✔ To install custom tools
✔ For cost saving (no GitHub billing)

### Example:

```yaml
runs-on: self-hosted
```

---

# **4.3 Self-Hosted Runner Labels**

You can classify your runners by giving labels:

Example:

```
self-hosted, linux, large-runner, prod-build
```

Workflow:

```yaml
runs-on: [self-hosted, linux, prod-build]
```

---

# **5. Summary Diagram **

```
WORKFLOW (YAML)
   |
   |- TRIGGER (on: push, PR, cron)
   |
   |- JOBS (build, test, deploy)
        |
        |- RUNNER (ubuntu-latest / windows / self-hosted)
        |
        |- STEPS
             |- actions (prebuilt modules)
             |- run commands (shell scripts)
```

---

# **6. Real-Time Example Workflow**

```yaml
name: Day1 GitHub Actions Demo

on:
  push:
    branches:
      - main

jobs:

  build-job:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Show system info
        run: uname -a

      - name: Install dependencies
        run: echo "Installing dependencies..."

      - name: Build project
        run: echo "Build complete!"
```



