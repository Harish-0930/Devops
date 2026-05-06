# ⚙️ Terraform Quick Guide – Meta-Arguments & Advanced Behavior

## Contents

1. [Meta Arguments](#meta-arguments)  
2. [Lifecycle Block](#lifecycle-block)  
3. [Parallelism](#parallelism)  
4. [Terraform Replace](#terraform-replace)  

## 📌 What are Meta-Arguments?

**Meta-arguments** are special, universal arguments that can be used inside any `resource`, `module`, or `data block` in Terraform. Unlike regular resource arguments (which are provider-specific), meta-arguments work across all resource types — they're part of the Terraform language itself, not any particular provider.

Think of them as "behavioral modifiers" — they don't describe what to build, but how Terraform should build it.

### 🔑 Common Meta-Arguments:

| Meta-Argument | Purpose |
|--------------|--------|
| `count`      | Create multiple copies of a resource using an integer |
| `for_each`   | Create multiple resources using map/set |
| `depends_on` | Manually enforce creation/destruction order |
| `lifecycle`  | Customize resource behavior |
| `provider`   | Use an alternate or aliased provider configuration |

> 🎯 **Interview Tip:** Meta-arguments are universal controls in Terraform.

---

## 🔢 count vs for_each

### Using `count`
```hcl
resource "aws_instance" "server" {
  count         = 2
  ami           = "ami-123456"
  instance_type = "t2.micro"
}
```

### Using `for_each`
```hcl
resource "aws_instance" "server" {
  for_each = {
    dev  = "t2.micro"
    prod = "t2.small"
  }

  instance_type = each.value
  ami           = "ami-123456"
}
```

### Difference

| Feature | count | for_each |
|--------|------|----------|
| Type   | Integer | Map/Set |
| Access | Index | Key |
| Use Case | Same configs | Different configs |

> 🎯 Prefer `for_each` when configs differ.

---

## 🔗 depends_on - Explicit Dependency Management

Terraform is smart enough to detect `implicit dependencies` automatically (e.g., when one resource references another's attribute). However, sometimes relationships between resources are indirect or logical — Terraform can't infer them on its own. That's where `depends_on` comes in.
It ensures one resource is only created or destroyed after another has fully completed.

```hcl
resource "aws_iam_role_policy_attachment" "example" {
  role       = aws_iam_role.example.name
  policy_arn = aws_iam_policy.example.arn

  # Explicitly wait for the policy to be fully created first
  depends_on = [aws_iam_policy.example]
}
```


---

## 🔄 lifecycle Block - Custom Resource Behavior Rules

The `lifecycle` block gives you fine-grained control over how Terraform handles a resource during create, update, and destroy operations. It's especially useful for protecting critical infrastructure or managing zero-downtime deployments.

```hcl
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"

  lifecycle {
    create_before_destroy = true   # Spin up new instance before killing the old one
    prevent_destroy       = true   # Block accidental deletion
    ignore_changes        = [tags] # Don't react to tag changes made outside Terraform
  }
}
```

Here's what each rule does in practice:

**`create_before_destroy`** is critical for zero-downtime deployments. Normally, Terraform destroys the old resource first, then creates the new one — leaving a gap. This flag reverses that order.

**`prevent_destroy`** acts as a safety lock. If any terraform apply or terraform destroy would delete this resource, Terraform will throw an error and stop. Ideal for databases or production infrastructure.

**`ignore_changes`** tells Terraform to ignore drift on specific attributes. For example, if your ops team manually updates instance tags, you don't want Terraform to revert those changes on every apply.

| Argument | Description |
|----------|------------|
| create_before_destroy | Avoid downtime |
| prevent_destroy | Prevent deletion |
| ignore_changes | Ignore attribute updates |

---

## ⚡ Parallelism

By default, Terraform executes up to 10 concurrent operations at a time. When you're provisioning hundreds of resources, Terraform processes them in batches of 10 — not one at a time, and not all at once.

You can tune this behaviour using the  `-parallelism` flag:


```bash
# Increase parallelism for faster provisioning (use carefully)
terraform apply -parallelism=20
```
> ⚠️ Increasing parallelism speeds things up but can hit cloud provider API rate limits. Lower it if you're seeing throttling errors during large deployments
---

## 🔁 Terraform Replace — Force Resource Recreation

**`terraform replace`** forces a specific resource to be destroyed and recreated on the next apply — even if its configuration hasn't changed. This is the modern replacement for the deprecated **`terraform taint`** command.

```bash
# Preview what recreation will look like
terraform plan -replace="aws_instance.mumbai_instance"

# Force recreation on apply
terraform apply -replace="aws_instance.my_server"
```

You'd reach for this command when a resource is in one of these situations:

- The resource has become corrupted or is in a broken state
- Manual changes were made outside of Terraform (configuration drift)
- You want a clean rebuild without touching your .tf files
- You're testing taint behavior in a lower environment
- Replacement for deprecated `taint`

> **`terraform taint`** is deprecated as of Terraform v0.15.2. The correct modern approach is -replace as a flag on plan or apply

