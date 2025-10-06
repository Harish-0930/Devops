# AWS CLI Comprehensive Reference Guide

The AWS Command Line Interface (CLI) is a unified tool to manage your
AWS services. It helps perform operations using simple commands in your
terminal or command prompt.

------------------------------------------------------------------------

## 🔧 Installation & Setup

### 1. Check AWS CLI Version

``` bash
aws --version
```

Displays the currently installed AWS CLI version.

### 2. Configure AWS CLI

``` bash
aws configure
```

Prompts for your AWS Access Key, Secret Key, region, and output format.

Example:

    AWS Access Key ID [None]: AKIA***********
    AWS Secret Access Key [None]: ****************
    Default region name [None]: ap-south-1
    Default output format [None]: json

### 3. View Current Region

``` bash
echo $AWS_REGION
```

Displays the currently configured AWS region.

------------------------------------------------------------------------

## 🪣 Amazon S3 Commands

### 1. List All Buckets

``` bash
aws s3 ls
```

### 2. List Files in a Bucket

``` bash
aws s3 ls s3://<BUCKET_NAME>/
```

### 3. Upload File to Bucket

``` bash
aws s3 cp <file_name> s3://<BUCKET_NAME>/
```

Example:

``` bash
aws s3 cp costs.csv s3://samplebucket00200/
```

### 4. Download File from Bucket

``` bash
aws s3 cp s3://<BUCKET_NAME>/<file_name> ./
```

### 5. Sync Local Folder with Bucket

``` bash
aws s3 sync ./localfolder s3://<BUCKET_NAME>/
```

### 6. Remove Object or Bucket

``` bash
aws s3 rm s3://<BUCKET_NAME>/<file_name>
aws s3 rb s3://<BUCKET_NAME> --force
```

------------------------------------------------------------------------

## 💻 Amazon EC2 Commands

### 1. Describe Instances

``` bash
aws ec2 describe-instances
```

### 2. Filter Output Format

``` bash
aws ec2 describe-instances --output table
aws ec2 describe-instances --output text
aws ec2 describe-instances --output json
```

### 3. Start/Stop/Terminate Instances

``` bash
aws ec2 start-instances --instance-ids <INSTANCE_ID>
aws ec2 stop-instances --instance-ids <INSTANCE_ID>
aws ec2 terminate-instances --instance-ids <INSTANCE_ID>
```

### 4. Describe Instance Status

``` bash
aws ec2 describe-instance-status
```

### 5. Create Key Pair

``` bash
aws ec2 create-key-pair --key-name <KEY_NAME> --query 'KeyMaterial' --output text > mykey.pem
```

------------------------------------------------------------------------

## 👥 IAM (Identity & Access Management)

### 1. List All Users

``` bash
aws iam list-users
```

### 2. List All Groups

``` bash
aws iam list-groups
```

### 3. List User Access Keys

``` bash
aws iam list-access-keys --user-name <USER_NAME>
```

### 4. Create New IAM User

``` bash
aws iam create-user --user-name <USER_NAME>
```

### 5. Attach Policy to User

``` bash
aws iam attach-user-policy --user-name <USER_NAME> --policy-arn arn:aws:iam::aws:policy/AdministratorAccess
```

------------------------------------------------------------------------

## 📊 CloudWatch & Logs

### 1. List CloudWatch Metrics

``` bash
aws cloudwatch list-metrics
```

### 2. Get Metric Statistics

``` bash
aws cloudwatch get-metric-statistics --metric-name CPUUtilization --namespace AWS/EC2 --statistics Average --period 300 --start-time 2025-10-06T00:00:00Z --end-time 2025-10-06T23:59:00Z
```

### 3. Describe Log Groups

``` bash
aws logs describe-log-groups
```

### 4. Describe Log Streams

``` bash
aws logs describe-log-streams --log-group-name <LOG_GROUP_NAME>
```

------------------------------------------------------------------------

## 🔐 Security & Identity

### 1. Get Caller Identity

``` bash
aws sts get-caller-identity
```

Example Output:

``` json
{
  "UserId": "AIDAEXAMPLE",
  "Account": "703671927949",
  "Arn": "arn:aws:iam::703671927949:user/Admin"
}
```

### 2. Assume a Role

``` bash
aws sts assume-role --role-arn arn:aws:iam::<ACCOUNT_ID>:role/<ROLE_NAME> --role-session-name session1
```

### 3. List KMS Keys

``` bash
aws kms list-keys
```

------------------------------------------------------------------------

## 🧠 Additional Useful Commands

### 1. List Available AWS Services

``` bash
aws help
```

### 2. List Available Commands for a Service

``` bash
aws ec2 help
```

### 3. Describe VPCs

``` bash
aws ec2 describe-vpcs
```

### 4. Describe Security Groups

``` bash
aws ec2 describe-security-groups
```

### 5. Create an S3 Bucket

``` bash
aws s3 mb s3://<NEW_BUCKET_NAME>
```

------------------------------------------------------------------------

## 🧩 Output Formats

AWS CLI supports multiple output formats: - **json** (default) -
**text** - **table**

Example:

``` bash
aws ec2 describe-instances --output table
```

------------------------------------------------------------------------

## 🧰 Tip:

Use the `--query` parameter to filter results using JMESPath syntax.

Example:

``` bash
aws ec2 describe-instances --query "Reservations[*].Instances[*].InstanceId"
```

------------------------------------------------------------------------

## ✅ Summary

This guide covers essential and advanced AWS CLI commands for managing
S3, EC2, IAM, CloudWatch, and security. These commands are the
foundation for automating tasks, monitoring cloud infrastructure, and
improving your AWS productivity.
