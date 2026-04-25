# Terraform Variables & Outputs

## Overview
This document covers essential Terraform concepts including variable management, resource creation with count, and outputs. These concepts are fundamental for creating reusable and maintainable Infrastructure as Code.

---

## Table of Contents
1. [Variables](#variables)
2. [Variable Validation](#variable-validation)
3. [Sensitive Variables](#sensitive-variables)
4. [Resources with Count](#resources-with-count)
5. [Outputs](#outputs)
6. [terraform.tfvars File](#terraformtfvars-file)
7. [Variable Precedence](#variable-precedence)

---

## Variables

### Definition
Variables in Terraform allow you to parameterize your infrastructure code, making it reusable and flexible. Variables can be defined in a separate `variables.tf` file or in `main.tf`.

### Basic Syntax
```hcl
variable "variable_name" {
  type        = string              # Data type (required in best practices)
  default     = "default_value"     # Default value (optional)
  description = "Description"       # Description (recommended)
}
```

### Variable Types
Terraform supports the following variable types:
- **string** - Text values
- **number** - Numeric values
- **bool** - Boolean true/false values
- **list** - Ordered list of values
- **map** - Key-value pairs
- **object** - Complex structured data

### Example: String Variable
```hcl
variable "ami" {
    type = string
    default = "ami-0e12ffc2dd465f6e4"
    description = "AMI ID for the EC2 instance"
}
```

### Example: Number Variable
```hcl
variable "instance-count" {
    type = number
    default = 3
    description = "Number of EC2 instances to create"
}
```

### Example: Map Variable
```hcl
variable "ec2_tags" {
    type = map(string)
    default = {
        Name = "Mumbai-EC2-web-server"
        environment = "production"
    }
    description = "Tags for the EC2 instance"
}
```

### Using Variables in Resources
Reference variables using the `var.variable_name` syntax:
```hcl
resource "aws_instance" "ec2_mumbai" {
  ami           = var.ami
  instance_type = var.instance_type
  availability_zone = var.availability_zone
  tags = {
    Name = var.ec2_tags["Name"]
  }
}
```

---

## Variable Validation

### Purpose
Validation blocks allow you to define constraints on variable values to ensure only valid inputs are accepted.

### Syntax
```hcl
variable "variable_name" {
    type = string
    validation {
      condition     = # boolean condition
      error_message = "Custom error message"
    }
}
```

### Example: Instance Type Validation
```hcl
variable "instance_type" {
    type = string
    default = "t3.small"
    description = "Instance type for the EC2 instance"
    validation {
      condition = contains(["t3.micro", "t3.small", "t3.medium"], var.instance_type)
      error_message = "Instance type Not Allowed Here"
    }
}
```

### How It Works
- The `condition` must evaluate to `true` for the variable value to be accepted
- If the condition is `false`, Terraform throws an error with the specified `error_message`
- In this example, only "t3.micro", "t3.small", or "t3.medium" are allowed
- Attempting to use any other instance type will result in an error

### Common Validation Functions
- `contains(list, value)` - Check if value exists in list
- `length(value)` - Check string/list length
- `can(expression)` - Check if expression is valid

---

## Sensitive Variables

### Purpose
Sensitive variables hide their values from Terraform output, logs, and the console. They are ideal for storing passwords, API keys, and other confidential information. They are defined in the variable block with the sensitive argument set to true.

### Syntax
```hcl
variable "variable_name" {
    type      = string
    sensitive = true
    description = "Description"
}
```

### Example
```hcl
variable "db_password" {
    type = string
    sensitive = true
    description = "Password for the database"
}
```

### Behavior
- Sensitive variable values are NOT displayed in `terraform plan` output
- Sensitive variable values are NOT displayed in `terraform apply` output
- Sensitive values are hidden in logs and state files (for security purposes)
- Useful for storing secrets like database passwords, API keys, tokens

### Setting Sensitive Values
```bash
# Using -var flag
terraform apply -var="db_password=mysecretpassword"

# Using environment variables
export TF_VAR_db_password=mysecretpassword
terraform apply
```

---

## Resources with Count

### Definition
The `count` meta-argument allows you to create multiple instances of a resource without repeating the resource block multiple times.

### Syntax
```hcl
resource "resource_type" "resource_name" {
  count = var.instance_count
  # ... other configuration
}
```

### Example
```hcl
resource "aws_instance" "ec2_mumbai" {
  count              = var.instance-count
  provider           = aws.mumbai
  ami                = var.ami
  instance_type      = var.instance_type
  availability_zone  = var.availability_zone
  tags = {
    Name = var.ec2_tags["Name"]
  }
}
```

### Accessing Count Resources
- **Specific instance**: `aws_instance.ec2_mumbai[0].id` (first instance)
- **All instances**: `aws_instance.ec2_mumbai[*].id` (splat operator)

### How It Works
- If `count = 3`, Terraform creates 3 EC2 instances (indices: 0, 1, 2)
- Each instance is independently managed in the state file
- You can reference specific instances or all instances

### Advantages
- Reduces code repetition
- Dynamic resource creation based on variables
- Easy to scale infrastructure up or down

### Overriding Variables with Count
```bash
# Create 5 instances instead of the default 3
terraform apply -var="instance-count=5"
```

---

## Outputs

### Definition
Outputs display values from created resources or computed values after Terraform applies the configuration. They are useful for capturing important information like IPs, IDs, or endpoints.

### Syntax
```hcl
output "output_name" {
  value       = # resource attribute or variable
  description = "Description of the output"
}
```

### Example
```hcl
output "ec2_instance_ids" {
  value       = aws_instance.ec2_mumbai[*].id
  description = "IDs of the EC2 instances created in Mumbai region"
}

output "ec2_instance_public_ips" {
  value       = aws_instance.ec2_mumbai[*].public_ip
  description = "Public IPs of the EC2 instances created in Mumbai region"
}
```

### Using Outputs
```bash
# View all outputs
terraform output

# View specific output
terraform output ec2_instance_ids

# View in JSON format
terraform output -json
```

### Splat Operator
The `[*]` splat operator extracts specific attributes from all resource instances:
- `aws_instance.ec2_mumbai[*].id` - All instance IDs
- `aws_instance.ec2_mumbai[*].public_ip` - All public IPs

### Output Uses
- Display resource IDs for reference
- Show endpoints or IPs to access created infrastructure
- Pass values to other systems or scripts
- Document important infrastructure details

---

## terraform.tfvars File

### Purpose
The `terraform.tfvars` file stores variable values that override the default values defined in `variables.tf`. It's a convenient way to provide inputs without using command-line flags.

### Syntax
```hcl
variable_name = "value"
number_var    = 5
list_var      = ["value1", "value2"]
map_var       = {
  key1 = "value1"
  key2 = "value2"
}
```

### Example
```hcl
ami               = "ami-0e12ffc2dd465f6e4"
instance_type     = "t3.large"
availability_zone = "ap-south-1a"
instance-count    = 1
```

### Automatic Loading
- Terraform automatically loads `terraform.tfvars` if it exists in the working directory
- No need to manually specify it with `-var-file`
- Values in this file override default values in `variables.tf`

### Benefits
- Clean separation of configuration values from code
- Easy to maintain different configurations (dev, prod, etc.)
- Prevents hardcoding sensitive values
- Improves code readability

### Creating Environment-Specific Files
```bash
terraform apply -var-file="dev.tfvars"
terraform apply -var-file="prod.tfvars"
```

---

## Variable Precedence

### Order of Precedence
When a variable value is needed, Terraform uses the following priority order:

1. **Command-line variables** (`-var` or `-var-file` flags) - **HIGHEST PRIORITY**
   ```bash
   terraform apply -var="instance-count=10"
   ```

2. **terraform.tfvars file** - Automatically loaded
   ```hcl
   instance-count = 5
   ```

3. **Default values in variables.tf** - **LOWEST PRIORITY**
   ```hcl
   default = 3
   ```

### Example Scenario
Given this variable definition:
```hcl
variable "instance-count" {
    type = number
    default = 3  # Lowest priority
    description = "Number of EC2 instances to create"
}
```

And `terraform.tfvars` contains:
```hcl
instance-count = 5
```

If you run:
```bash
terraform apply -var="instance-count=10"
```

**Result**: 10 instances are created (command-line flag wins)

### Practical Use Cases
- **Default values**: For common or safe defaults
- **terraform.tfvars**: For environment-specific configurations
- **Command-line flags**: For temporary overrides or CI/CD automation

---

## Best Practices

### Variable Naming
✅ Use snake_case for variable names
```hcl
variable "instance_type" {}  # Good
variable "InstanceType" {}   # Avoid
```

### Always Include Description
```hcl
variable "ami" {
    type        = string
    default     = "ami-0e12ffc2dd465f6e4"
    description = "AMI ID for the EC2 instance"  # Always add this
}
```

### Organize Files
- `variables.tf` - Variable definitions
- `main.tf` - Resource definitions
- `output.tf` - Output definitions
- `terraform.tfvars` - Variable values

### Use Validation
```hcl
validation {
  condition     = contains(["t3.micro", "t3.small"], var.instance_type)
  error_message = "Only t3.micro and t3.small are allowed"
}
```

### Separate Sensitive Data
- Use separate `.tfvars` files for sensitive data
- Add `.tfvars` files to `.gitignore`
- Use environment variables for CI/CD pipelines

---

## Quick Reference Commands

```bash
# Initialize Terraform
terraform init

# Validate configuration
terraform validate

# Format code
terraform fmt

# Plan changes
terraform plan

# Apply configuration
terraform apply

# Apply with variable override
terraform apply -var="instance-count=5"

# View outputs
terraform output

# View specific output
terraform output ec2_instance_ids

# Destroy infrastructure
terraform destroy
```

---

## Summary

| Concept | Purpose | Example |
|---------|---------|---------|
| **Variables** | Parameterize configuration | `variable "ami" { default = "..." }` |
| **Validation** | Enforce constraints | `condition = contains([...], value)` |
| **Sensitive** | Hide sensitive values | `sensitive = true` |
| **Count** | Create multiple resources | `count = var.instance-count` |
| **Outputs** | Display infrastructure info | `value = aws_instance.ec2[*].id` |
| **Precedence** | Variable value priority | CLI flags > tfvars > defaults |

