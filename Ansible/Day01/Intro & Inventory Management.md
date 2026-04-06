  # Ansible – Complete Notes

## 📌 What is Ansible?
Ansible is an open-source automation tool used for:
- Configuration Management (server setup)
- Application Deployment
- Task Automation
- Infrastructure Provisioning

👉 **Simple Definition:**  
Ansible allows you to control multiple servers from a single machine using simple, human-readable scripts.

---

## 🚀 Key Features

### 1. Agentless Architecture
- Unlike Puppet and Chef, Ansible requires no agent software on target machines. It connects via:
- Uses:
  - SSH for Linux/Unix systems
  - WinRM for Windows systems
  
This simplifies setup and reduces overhead on managed nodes.

### 2. Easy to Learn
- Uses YAML (simple and human-readable syntax)

### 3. Idempotent
- Safe to run multiple times without changing the result unnecessarily

### 4. Push-Based
| Approach     | How It Works                                                   | Tools           |
|--------------|----------------------------------------------------------------|-----------------|
| Push-based   | Control node pushes configurations to targets on demand        | Ansible         |
| Pull-based   | Agents on targets periodically pull from a central server      | Puppet, Chef    |

---

## ⚙️ Background & Requirements
- Written in **Python**
- Python is required to run Ansible
- Maintained by **Red Hat**

---

## 🏗️ Basic Architecture

- **Control Node** → Machine where Ansible is installed  
- **Managed Nodes** → Target servers  
- **Inventory File** → List of servers  
- **Playbooks** → YAML files defining tasks  

---

## 📊 Ansible vs Other Tools

| Tool    | Agent Required | Language |
|---------|--------------|----------|
| Ansible | ❌ No         | YAML     |
| Puppet  | ✅ Yes        | Ruby     |
| Chef    | ✅ Yes        | Ruby     |

---

## 🔄 Push vs Pull Model

### Pull-Based (Puppet, Chef)
- Agents installed on nodes
- Nodes pull configuration from server periodically

### Push-Based (Ansible)
- No agents required
- Control node pushes configurations to servers

---

## 🧩 Core Components

### 1. Playbooks
- YAML files used to automate tasks

### 2. Modules
- Pre-built units of work (e.g., ping, yum, copy)

### 3. Inventory
- List of managed nodes

---
## 🔧 Common Use Cases

- Install packages (nginx, docker)
- Configure servers (users, permissions)
- Deploy applications
- Restart services
- Manage cloud infrastructure (AWS, Azure)

## 🖥️ Host Inventory(Important)

In Ansible, the host inventory is a file that defines the hosts (machines) that Ansible will manage. This file can be in various formats, but the most common is the INI format. You can also use YAML format for more complex structures.

### 📍 Default Location
```
/etc/ansible/hosts
```


### 📌 Key Points
- Comments start with `#`
- Blank lines are ignored
- Groups are defined using `[group_name]`
- Hosts can belong to multiple groups

---

## 📂 Types of Inventory

### 1. Static Inventory
- Manually maintained file
- Stored locally

### 2. Dynamic Inventory
- Fetches hosts automatically (e.g., from AWS, Azure)

---
## 📄 Inventory Formats
### 1. INI Format Example
```bash
# Ungrouped hosts
192.168.1.100

# Web servers group
[webservers]
web1.example.com
web2.example.com

# Database servers group
[dbservers]
db1.example.com ansible_user=admin ansible_ssh_private_key_file=/path/to/key.pem

# Group of groups
[production:children]
webservers
dbservers

```
### 2. YAML Format Example
```bash
all:
  children:
    webservers:
      hosts:
        web1.example.com:
        web2.example.com:
    dbservers:
      hosts:
        db1.example.com:
          ansible_user: admin
          ansible_ssh_private_key_file: /path/to/key.pem

```
---
## 🔑 Setup Steps

### Step 1: Prepare Key
- Copy `.pem` file to working directory
- Set permissions:
```bash
chmod 400 key.pem
```

👉 Note: Convert `.ppk` to `.pem` using PuTTYgen

---

### Step 2: Configure Inventory
- Edit or create:
```bash
/etc/ansible/hosts
```
### 🛠️ Example Inventory (INI Format)

```ini
[webservers]
192.168.1.10 ansible_user=ec2-user ansible_ssh_private_key_file=/home/ec2-user/key.pem

[dbservers]
192.168.1.20 ansible_user=ec2-user ansible_ssh_private_key_file=/home/ec2-user/key.pem
```
---

### Step 3: Test Connectivity

```bash
ansible all -m ping
```

#### Explanation:
- `all` → all hosts
- `-m` → module
- `ping` → module name

#### Expected output
```json
192.168.1.10 | SUCCESS => {
    "changed": false,
    "ping": "pong"
}
```
> **A SUCCESS response confirms your setup is correct.**
---
## 🔍 How Ansible knows the inventory (management IPs)
> **Even if you don’t specify the inventory path, Ansible still knows where to look because it has a default inventory location.**

### ⚙️ Order of Inventory Resolution
#### 1️⃣ Explicit inventory (highest priority)
```bash 
ansible all -i <inventory path> -m ping
```

#### 2️⃣ Environment variable (if set)
```bash 
export ANSIBLE_INVENTORY=./inventory
```
> Here ./inventory = inventory path

#### 3️⃣ ansible.cfg file
```INI 
[defaults]
inventory = ./inventory
```

#### 4️⃣ Default path (fallback)
> 👉 If nothing is given → it uses the default.
```bash 
/etc/ansible/hosts
```

## 📌 Ansible Quick Reference: Common Commands

### Ping all hosts
```bash
ansible all -m ping
```

### Ping a specific group
```bash
ansible webservers -m ping
```
### Run ad-hoc command on all hosts
```bash
ansible all -a "uptime"
```
### Run a playbook
```bash
ansible-playbook site.yml
```
### Check playbook syntax
```bash
ansible-playbook site.yml --syntax-check
```
### Dry run (check mode)
```bash
ansible-playbook site.yml --check
```
### List hosts in inventory
```bash
ansible all --list-hosts
```
### 📄 Summary
Ansible simplifies IT automation through its agentless, push-based architecture and human-readable YAML syntax. It's the go-to tool for DevOps teams managing configuration, deployment, and infrastructure at scale.

