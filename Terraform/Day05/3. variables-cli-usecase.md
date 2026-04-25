## ✅ Situation (Use Case)

> **Project:** Deploy 3 EC2 instances for a QA environment.
>
> **Requirements:**
>
> * Region: `us-east-1`
> * Use variables for:
>
>   * AMI ID
>   * Instance Type
>   * Number of instances
>   * Availability Zone
> * All code inside **main.tf**
> * No `variables.tf` or `.tfvars` file

---

## 📂 main.tf (Everything Inside This One File)

```hcl
provider "aws" {
  region = "us-east-1"
}

# Declare input variables here
variable "ami_id" {
  type        = string
  description = "AMI ID for EC2 instance"
}

variable "instance_type" {
  type        = string
  description = "Type of EC2 instance"
  default     = "t2.micro"
}

variable "instance_count" {
  type        = number
  description = "How many EC2 instances to create"
  default     = 1
}

variable "availability_zone" {
  type        = string
  description = "Availability Zone to launch instances"
  default     = "us-east-1a"
}

# Create EC2 instances using count and variables
resource "aws_instance" "qa_ec2" {
  count         = var.instance_count
  ami           = var.ami_id
  instance_type = var.instance_type
  availability_zone = var.availability_zone

  tags = {
    Name = "QA-Server-${count.index + 1}"
  }
}
```

---

## 🧪 Step-by-Step to Run

### 🔹 Step 1: Save the above as `main.tf`

### 🔹 Step 2: Initialize the working directory

```bash
terraform init
```

### 🔹 Step 3: Validate the configuration

```bash
terraform validate
```

---

### 🔹 Step 4: Apply with CLI variable input

```bash
terraform apply \
  -var="ami_id=ami-0c55b159cbfafe1f0" \
  -var="instance_type=t2.small" \
  -var="instance_count=3" \
  -var="availability_zone=us-east-1a"
```

You’ll see that 3 EC2 instances will be created in the specified AZ.

---

## ✅ Output Sample (from Terraform)

```
aws_instance.qa_ec2[0] will be created
aws_instance.qa_ec2[1] will be created
aws_instance.qa_ec2[2] will be created
```

Each will be tagged:

* `QA-Server-1`
* `QA-Server-2`
* `QA-Server-3`

---

## 🧠 Notes

* All variables are defined and used in **main.tf**
* No need for `variables.tf` or `.tfvars`
* CLI overrides make it environment-flexible
* `count` allows provisioning multiple identical EC2 instances
