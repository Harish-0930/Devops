# 📝 Ansible Dynamic Inventory (AWS EC2)

---

## 📌 1. Introduction

An **Ansible Inventory** is a list of managed nodes (servers). By default, Ansible uses a **static inventory file** (like `inventory.ini`) where hosts are manually defined.

However, in modern **cloud environments (AWS, Azure, GCP)**, servers are:

* Created dynamically
* Terminated frequently
* Scaled automatically

Maintaining a static inventory becomes **inefficient and error-prone**.

---

## 🔹 2. What is Dynamic Inventory?

**Dynamic Inventory** allows Ansible to fetch real-time infrastructure details from external systems such as:

* AWS EC2
* Azure VMs
* Google Cloud
* Kubernetes

Instead of manually listing servers, Ansible uses **API calls** to automatically generate inventory.

---

## 💡 3. Why Use Dynamic Inventory?

* ✅ No manual updates required
* ✅ Automatically detects new/terminated instances
* ✅ Works seamlessly with cloud platforms
* ✅ Supports filtering using tags
* ✅ Highly scalable for large environments

---

## ⚙️ 4. Prerequisites

Before starting, ensure the following:

1. AWS Account with IAM permissions
2. Ansible installed on control node
3. Python 3 installed
4. AWS CLI configured
5. Required Python libraries (`boto3`, `botocore`)

---

## 🧰 5. Install Required Dependencies

```bash
sudo yum update -y
sudo yum install python3 -y
sudo yum install python3-pip -y

pip3 install boto3 botocore
```

> ⚠️ Avoid using `sudo pip install` in production. Prefer virtual environments.

---

## 🔐 6. Configure AWS Credentials

### Install AWS CLI

```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
sudo yum install unzip -y
unzip awscliv2.zip
sudo ./aws/install
aws --version
```

### Configure Credentials

```bash
aws configure
```

Provide:

```ini
AWS Access Key ID
AWS Secret Access Key
Default region (e.g., ap-south-1)
Output format (json)
```

Credentials are stored in:

```
~/.aws/credentials
```

---

## 📦 7. Install AWS Collection for Ansible

```bash
ansible-galaxy collection install amazon.aws
```

---

## 📁 8. Create Dynamic Inventory File

```bash
mkdir -p ~/ansible/inventory
cd ~/ansible/inventory
```

Create file: `aws_ec2.yml`

```yaml
plugin: amazon.aws.aws_ec2
regions:
  - ap-south-1
filters:
  instance-state-name: running
keyed_groups:
  - key: tags.Name
    prefix: tag
compose:
  ansible_host: public_ip_address
```

### 🔍 Explanation

* `plugin`: Uses AWS EC2 plugin
* `regions`: AWS region
* `filters`: Only running instances
* `keyed_groups`: Creates groups based on tags
* `compose`: Defines connection IP

---

## ✅ 9. Verify Inventory

```bash
ansible-inventory -i aws_ec2.yml --list
```

```bash
ansible-inventory -i aws_ec2.yml --graph
```

If successful, you will see JSON output with EC2 details.

---

## 🚀 10. Run Ad-hoc Commands

### Ping All Instances

```bash
ansible all -i aws_ec2.yml -m ping \
-u ec2-user \
--private-key /path/to/key.pem
```

### Ping Specific Tag Group

```bash
ansible tag_Name_Value -i aws_ec2.yml -m ping \
-u ec2-user \
--private-key /path/to/key.pem
```

> Group name format: `tag_<TagName>_<TagValue>`

### Run Shell Command

```bash
ansible all -i aws_ec2.yml -m shell -a "uptime" \
-u ec2-user \
--private-key /path/to/key.pem
```

---

## 📘 11. Create Playbook Example

Create file: `install_apache.yml`

```yaml
- name: Install Apache on EC2
  hosts: tag_Name_WebServer
  become: yes

  tasks:
    - name: Install Apache
      ansible.builtin.yum:
        name: httpd
        state: present

    - name: Start Apache
      ansible.builtin.service:
        name: httpd
        state: started
        enabled: yes
```

---

## ▶️ 12. Run Playbook

```bash
ansible-playbook -i aws_ec2.yml install_apache.yml \
-u ec2-user \
--private-key /path/to/key.pem
```

---

## 🧠 13. Best Practices

* Use **IAM roles** instead of access keys (for EC2)
* Use **tags properly** (Environment, Role, Project)
* Use **ansible.cfg** to avoid repeating parameters
* Use **SSH agent** instead of private key path
* Store secrets securely (Ansible Vault)

---

## ⚠️ 14. Common Mistakes

| Issue             | Cause                | Fix                   |
| ----------------- | -------------------- | --------------------- |
| No hosts found    | Wrong region         | Check region          |
| Permission denied | Wrong key/user       | Verify key & username |
| Empty inventory   | No running instances | Check filters         |
| Group not found   | Wrong tag format     | Verify tag naming     |

---

## 🔄 15. Static vs Dynamic Inventory

| Feature           | Static | Dynamic   |
| ----------------- | ------ | --------- |
| Maintenance       | Manual | Automatic |
| Scalability       | Low    | High      |
| Cloud Support     | Poor   | Excellent |
| Real-time updates | No     | Yes       |

---

## 📌 16. Summary

1. Install dependencies (`boto3`, AWS CLI, Ansible collection)
2. Configure AWS credentials
3. Create `aws_ec2.yml`
4. Verify inventory using `ansible-inventory`
5. Run ad-hoc commands
6. Execute playbooks dynamically

---

## 🎯 Final Note

Dynamic Inventory is **essential for DevOps engineers** working with cloud platforms. It eliminates manual work and ensures your infrastructure automation is **real-time, scalable, and efficient**.
