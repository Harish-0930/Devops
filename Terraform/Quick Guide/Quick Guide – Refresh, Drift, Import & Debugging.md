# 🔄 Terraform Quick Guide – Refresh, Drift, Import & Debugging


## ⚠️ Terraform Refresh (Deprecated)

**terraform refresh** In older versions of Terraform, terraform refresh was a standalone command used to sync the state file with real-world infrastructure — without touching your .tf files or making any changes to actual cloud resources. In simple terms, it overwrote your state file with whatever currently existed in the cloud.

### Key Points:
- Updates `terraform.tfstate` based on real infrastructure
- Does NOT modify `.tf` files
- Does NOT change cloud resources

> In simple terms: It overwrote the state file with actual cloud state.

### ❌ Status:
- Deprecated from Terraform 1.0+

> As of Terraform 1.0+, terraform refresh is deprecated. It has been replaced by a smarter, built-in mechanism called `drift detection`.

---

## 🔍 What is Drift?

**Drift** occurs when your real infrastructure changes outside of Terraform — meaning the actual cloud resources no longer match what Terraform's state file expects. between:


### 🚨 Common Drift Scenarios:
- Manually stopping or restarting an EC2 instance from the AWS console
- Someone modifying a Security Group rule directly in the UI
- A tag being added or removed outside of Terraform
- An instance type being changed in the AWS console

**The important thing to understand is that drift doesn't magically fix itself — Terraform needs to detect it first, and then you decide how to reconcile it.**

---

## 🔎 Drift Detection

Since `terraform refresh` is deprecated, Terraform now automatically performs a refresh as part of both `terraform plan` and `terraform apply`. So every time you run a plan, Terraform is already querying the real state of your cloud resources behind the scenes.


```bash
terraform plan
terraform apply
```

If you want to explicitly detect drift without making any changes, use:
  #### Manual Drift Detection:
```bash
terraform plan -refresh=only
```

### Behavior:
Think of `-refresh=only` as asking Terraform: "Just check what's changed in the cloud and tell me — don't do anything yet."

If drift is found, running a regular terraform apply afterward will reconcile the real infrastructure back to what your **.tf** files describe — essentially overwriting the manual changes.

> 🎯 **Interview Tip:** A common question is "What happens when someone makes manual changes to your cloud infrastructure?" The answer is: Terraform detects it as drift during plan or apply, and unless you've used ignore_changes in a lifecycle block, Terraform will revert those changes to match your declared configuration..



---

## ☁️ Note:
    
AWS CloudFormation also has its own drift detection mechanism, so this concept isn't unique to Terraform — it's a fundamental IaC challenge across tools.

---

## 🔄 Terraform Import

`terraform import` allows Terraform to take control of infrastructure that was created outside of Terraform — for example, resources manually created in the AWS console or by another tool. It pulls the real resource's current state into your terraform.tfstate file, so Terraform can manage it going forward.

The key thing to understand here is the two-step nature of importing:

Step 1 — Generate the configuration file from the existing resource:

```bash
# Automatically generates a .tf config file for the existing resource
terraform plan -generate-config-out=ec2.tf
```
Step 2 — Once the config is generated and reviewed, run terraform apply to bring the resource fully under Terraform management. After that, terraform plan works completely normally.

### Key Points:
- Imports resource into `terraform.tfstate`
- Does NOT create resource
- After import → `terraform plan` works normally


> 💡 Interview tip: Before Terraform 1.5, `import` only brought the resource into the state file — you still had to write the **.tf** configuration manually. The `-generate-config-out` flag was introduced in Terraform 1.5 to automate config generation. This is a detail that impresses interviewers.

> ⚡ **Best Practice:** Always define resource in `.tf` before import.

---

## 🐞 Terraform Debugging Options

When things go wrong in Terraform, you need visibility into what's happening under the hood. Terraform provides the TF_LOG environment variable to enable verbose logging at different levels of detail.

### 🔹 TF_LOG Environment Variable

Enables detailed logs for troubleshooting.

The TF_LOG variable accepts the following levels, ordered from most to least verbose:


### Log Levels:

| Level | Description |
|------|------------|
| TRACE | Most detailed |
| DEBUG | Debug information |
| WARN  | Warnings |
| ERROR | Errors only |

---

### 🛠️ Usage: Using Debug Logging

```bash
# Step 1: Set the log level as an environment variable
export TF_LOG=TRACE

# Step 2: Run your Terraform command — logs will stream to the terminal
terraform plan

# Step 3: Unset the variable when you're done
unset TF_LOG
```
If you want to capture logs to a file instead of printing them to the terminal (useful for sharing with a team or analysing later), combine TF_LOG with TF_LOG_PATH:

```bash
# Set log level
export TF_LOG=DEBUG

# Set log output path — logs will be written to this file
export TF_LOG_PATH="/var/log/terraform/debug.log"

# Run your command as usual
terraform apply

# Unset both when done
unset TF_LOG
unset TF_LOG_PATH
```

### Key Variables:

| Variable      | Purpose |
|---------------|--------|
| TF_LOG        | Shows logs in console |
| TF_LOG_PATH   | Saves logs to file |

> 💡 Interview tip: If asked "How do you troubleshoot a Terraform failure?", walk through the progression: start with the error message in `apply` output → enable `TF_LOG=ERROR` → escalate to `DEBUG` or `TRACE` if needed → use `TF_LOG_PATH` to persist logs for deeper analysis. This shows structured thinking, not just command knowledge



---

## 📌 Final Notes

- `terraform refresh` is deprecated → use drift detection
- Always run `plan` to identify drift
- Import helps manage existing infrastructure
- Use debugging only when troubleshooting

