# Terraform Quick Guide - Locking State File, Local-Exec, Remote-Exec & EC2 User Data
## 📚 Table of Contents

1. [Locking the State File with AWS S3?](#)
2. [Local-Exec, Remote-Exec & EC2 User Data with Terraform](#)

## Locking the State File with AWS S3

### What is the Terraform State File?

The `terraform.tfstate` file is Terraform's **source of truth** for tracking real infrastructure.

| Property | Detail |
|---|---|
| **Purpose** | Maps Terraform config to real cloud resources |
| **Contains** | Resource IDs, attributes, and dependencies |
| **Used for** | Determining what to create, update, or destroy |
| **Security** | May include sensitive data — store securely |
| **Remote storage** | S3, GCS, Azure Blob — for team collaboration and locking |

```bash
# List all resources tracked in the state file
terraform state list
```

---

### Migrating State to a Remote Backend (AWS S3)

By default, the state file is stored **locally**. To move it to a remote backend like S3:

**Step 1 — Configure the S3 backend in your Terraform code:**

```hcl
terraform {
  backend "s3" {
    bucket       = "my-terraform-state-bucket"
    key          = "envs/prod/terraform.tfstate"
    region       = "us-east-1"
    use_lockfile = true   # Enables native state locking (no DynamoDB needed)
  }
}
```

**Step 2 — Migrate the local state to S3:**

```bash
terraform init -migrate-state
```

> ⚠️ **Important:** Simply moving the state file to S3 does **not** enable locking. You must explicitly enable it.

---

### State File Locking

Locking prevents multiple users from applying changes simultaneously, avoiding state corruption.

#### Modern Approach (Terraform v1.10+)

```hcl
terraform {
  backend "s3" {
    bucket       = "my-terraform-state-bucket"
    key          = "envs/prod/terraform.tfstate"
    region       = "us-east-1"
    use_lockfile = true   # ✅ Native S3 locking — no DynamoDB required
  }
}
```

> 💡 **Interview Tip:** In older Terraform versions, locking required a **DynamoDB table**. Since Terraform v1.10, `use_lockfile = true` in the S3 backend block is sufficient. This is a commonly asked interview question.

#### How Locking Works

```
User A runs terraform apply  →  Lock acquired on state file
User B runs terraform apply  →  ❌ Blocked: "state is locked"
User A completes apply       →  Lock released
User B runs terraform apply  →  ✅ Lock acquired, proceeds
```

---

### Terraform State Subcommands

> ⚠️ Never manually edit `terraform.tfstate`. Use the safe subcommands below.

| Command | Description |
|---|---|
| `terraform state list` | List all resources tracked in state |
| `terraform state show <resource>` | Show detailed attributes of a resource |
| `terraform state rm <resource>` | Remove a resource from state (does not destroy it) |
| `terraform state mv <old> <new>` | Rename or move a resource in state |

```bash
# Show details of a specific EC2 instance in state
terraform state show aws_instance.myinstance

# Remove a resource from state without destroying it
terraform state rm aws_instance.myinstance

# Rename a resource in state (useful after refactoring)
terraform state mv aws_instance.old-instance aws_instance.new-instance
```

> 💡 **Interview Tip:** `terraform state rm` is used when you want Terraform to **forget** a resource without destroying it in the cloud (e.g., handing off management to another team).

---

## Local-Exec, Remote-Exec & EC2 User Data with Terraform

Terraform **provisioners** allow you to run scripts or commands on local or remote machines as part of resource creation.

### Provisioner Overview

| Block | Role |
|---|---|
| `resource` | Creates the EC2 instance |
| `connection` | Establishes SSH access to the instance |
| `provisioner "remote-exec"` | Runs commands **on the remote instance** after it's created |
| `provisioner "local-exec"` | Runs commands **on the machine running Terraform** |

---

### Remote-Exec Provisioner — Full Example

```hcl
resource "aws_instance" "web" {
  ami                    = "ami-02d05f76acbed4e3e"
  instance_type          = "t3.micro"
  vpc_security_group_ids = ["sg-0e244adb6f393f9b9"]
  key_name               = "awar06-lnx"

  # Establishes SSH connection to the instance
  connection {
    type        = "ssh"
    user        = "ec2-user"
    private_key = file("/Users/avizway/Desktop/keypairs/awar06-lnx.pem")
    host        = self.public_ip
    agent       = false
  }

  # Runs commands on the remote instance after creation
  provisioner "remote-exec" {
    inline = [
      "sudo yum install httpd -y",
      "sudo systemctl enable httpd --now",
      "echo '<h1> Deployed via Terraform </h1>' | sudo tee /var/www/html/index.html"
    ]
  }

  tags = {
    Name = "webserver"
  }
}
```

### Execution Flow

```
resource block         →   EC2 instance is created
connection block       →   SSH session established using public IP + key
remote-exec block      →   Commands run inside the instance (install httpd, start service, write index.html)
```

---

### Local-Exec Provisioner

Runs a command **on your local machine** (where Terraform is executed), not on the remote resource.

```hcl
resource "aws_instance" "web" {
  ami           = "ami-02d05f76acbed4e3e"
  instance_type = "t3.micro"

  provisioner "local-exec" {
    command = "echo Instance created with IP: ${self.public_ip} >> deployed.log"
  }
}
```

> 💡 **Use case:** Logging instance IPs, triggering Ansible playbooks locally, or sending notifications after provisioning.

---

### Key Differences: remote-exec vs local-exec

| Feature | `remote-exec` | `local-exec` |
|---|---|---|
| Where it runs | On the **remote** resource (EC2) | On the **local** machine (Terraform host) |
| Requires connection | ✅ Yes (SSH or WinRM) | ❌ No |
| Typical use | Install packages, configure services | Logging, triggering scripts locally |

> ⚠️ **Best Practice:** Prefer **user data scripts** or **configuration management tools** (Ansible, Chef) over provisioners for production environments. Provisioners are a last resort in Terraform's design philosophy.

> 💡 **Interview Tip:** Interviewers often ask: *"What's the difference between remote-exec and local-exec?"* — remote-exec runs **inside the created VM**, local-exec runs **on your Terraform workstation**.

---
