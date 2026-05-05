# 🚀 Terraform Quick Guide – Core Concepts

## 📌 What is Terraform?

**Terraform** is an open-source infrastructure automation tool by HashiCorp that revolutionised how organisations build and manage IT infrastructure.

* Uses **declarative configuration**
* Supports multiple cloud providers (AWS, Azure, GCP, etc.)
* Written in **Go**
* Uses **HashiCorp Configuration Language (HCL)**

> 🎯 **Interview Tip:** Terraform is *declarative*, meaning you define *what you want*, not *how to achieve it*.

---

## 🧱 Infrastructure as Code (IaC)

Terraform allows you to define infrastructure using code instead of manual setup.

- Define infrastructure using HashiCorp Configuration Language (HCL), written in Go
- Declarative approach — you describe what you want, Terraform figures out how
- Enables version control, collaboration, and repeatable deployments across environments

### Key Benefits:

* Version control (Git)
* Reusability
* Consistency across environments
* Automation & scalability

### Example:

```hcl
resource "aws_instance" "example" {
  ami           = "ami-123456"
  instance_type = "t2.micro"
}
```

> ⚡ **Quick Note:** IaC eliminates configuration drift and manual errors.

---

## 🔌 Providers

Providers are plugins that allow Terraform to interact with cloud platforms or services.

### Key Points:

* Enable communication with APIs (AWS, Azure, GCP, etc.)
* Define available **resources** and **data sources**

### Example:

```hcl
provider "aws" {
  region = "ap-south-1"
}
```

> 🎯 **Interview Tip:** Without a provider, Terraform cannot manage infrastructure.

---

## 🏗️ Resources

Resources represent real infrastructure components.

### Examples:

* EC2 instances
* S3 buckets
* VPCs

### Key Points:

* Defined using `resource` block
* Terraform manages lifecycle: **create, update, destroy**

### Example:

```hcl
resource "aws_s3_bucket" "storage" {
  bucket = "my-terraform-bucket"
}
```

---

## ⚙️ Terraform Workflow Commands

### 🔹 1. terraform init – Initialization

Prepares the working directory.

**What it does:**

* Downloads provider plugins
* Initializes backend (state storage)
* Validates configuration structure

```bash
terraform init
```

> 🎯 **Interview Tip:** Always run `init` first — especially after adding a new provider or module.

---

### 🔹 2. terraform plan – Execution Plan

Shows what Terraform will do before applying changes.

**What it does:**

* Compares:

  * Desired state (.tf files)
  * Current state (terraform.tfstate)
* Displays actions:

  * Create
  * Update
  * Destroy

```bash
terraform plan
```

> ⚡ **Best Practice:** Always review the plan before applying changes.

---

### 🔹 3. terraform apply – Apply Changes

Executes the planned changes.

**What it does:**

* Calls provider APIs
* Creates/updates/deletes infrastructure
* Updates state file (terraform.tfstate)

```bash
terraform apply
```

> 🎯 **Interview Tip:** This command affects real infrastructure — use carefully.

---

## 🎯 Terraform Target Option (-target)

Used to apply or destroy specific resources instead of the entire configuration.

### Examples:

```bash
# Target a single resource
terraform destroy -target=aws_instance.web

# Target multiple resources
terraform destroy -target=aws_instance.web -target=aws_s3_bucket.storage
```

### ⚠️ Important:

* Can cause **state inconsistencies**
* Should be used **only when necessary**

> 🎯 **Interview Tip:** Overusing `-target` is considered bad practice.

---

## 🧹 Terraform Formatting (fmt)

Automatically formats Terraform configuration files.

### Commands:

```bash
terraform fmt
terraform fmt -recursive
terraform fmt -check -diff
```

### Options:

| Option     | Description                              |
| ---------- | ---------------------------------------- |
| -recursive | Formats files in subdirectories          |
| -check     | Checks formatting without changing files |
| -diff      | Shows formatting differences             |

> ⚡ **Best Practice:** Run `fmt` before pushing code to GitHub.

---

## ✅ Terraform Validation

Validates the syntax of Terraform configuration files.

```bash
terraform validate
```
Checks the syntax and internal consistency of your Terraform configuration files. Does not contact any remote APIs.

> 🎯 **Interview Tip:** `validate` checks logic and syntax — but it won't catch issues like invalid AMI IDs or missing IAM permissions. Those surface during `plan` or `apply`.

---

## 🔄 Quick Workflow Summary

```bash
terraform init
terraform validate
terraform fmt
terraform plan
terraform apply
```
