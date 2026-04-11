# 🚀 Ansible Roles

## 📌 Introduction

**Roles in Ansible** are a way to organize playbooks into **reusable, modular, and structured components**.

👉 Instead of writing everything in one large playbook, roles help you split things into:
- tasks
- variables
- handlers
- files
- templates

📌 Think of a role like a mini project that performs a specific function
(e.g., installing Apache, setting up MySQL, configuring users).

---

## 🎯 Why Use Roles?

Using roles provides:

* ✅ Reusability across multiple playbooks
* ✅ Clean and organized structure
* ✅ Easy maintenance
* ✅ Scalability for large projects
* ✅ Team collaboration support

---

## 🛠️ Creating a Role

You can create a role using the following command:

```bash
ansible-galaxy init apache
```

This generates a **standard role structure**.


---

## 📁 Role Directory Structure
Every role created with `ansible-galaxy init` contains:

```
roles/
└── apache/
    ├── tasks/
    │   └── main.yml
    ├── templates/
    │   └── index.html
    ├── vars/
    │   └── main.yml
    ├── defaults/
    │   └── main.yml
    ├── handlers/
    │   └── main.yml
    ├── files/
    ├── meta/
    │   └── main.yml
```

---

## 📂 Folder Explanation

### 🔹 tasks/

Contains the **list of tasks** that define what this role does.  
Each role **must have at least one file:** `tasks/main.yml`.

---

### 🔹 templates/

Stores **Jinja2-based template files**, usually for configuration or HTML pages.  
Templates are processed dynamically using variables.

---

### 🔹 vars/

Contains **high-priority variables** that are hard to override.
Use this only when values should stay fixed.

---

### 🔹 defaults/

Contains **default or low-priority variables** that can easily be overridden from playbooks or CLI.

---

### 🔹 handlers/

Defines **notifications or trigger actions** executed after tasks finish.  
Handlers commonly restart services when configuration changes.

---

### 🔹 files/

Stores **static files** (no variable replacements).  
You can copy these files directly using the `copy:` module.

---

### 🔹 meta/

Contains **role metadata and dependencies**, defining other roles that this one depends on.

---

## 🔄 Step-by-Step Conversion to Role

1. Create role using `ansible-galaxy init apache`
2. Move tasks into `tasks/main.yml`
3. Move `index.html` into `templates/`
4. Move variables into `vars/main.yml` or `defaults/main.yml`
5. Define handlers in `handlers/main.yml`

---

## 📜 Role Implementation

### 1️⃣ tasks/main.yml

```yaml
---
- name: Install Apache HTTP Server
  yum:
    name: "{{ apache_package_name }}"
    state: present
  tags: install

- name: Ensure httpd is started and enabled
  service:
    name: httpd
    state: started
    enabled: true
  tags: configure

- name: Deploy custom index.html
  template:
    src: index.html
    dest: /var/www/html/index.html
  notify:
    - restart httpd
  tags: deploy
```

---

### 2️⃣ templates/index.html

```html
<!DOCTYPE html>
<html>
<head>
    <title>Apache Server</title>
</head>
<body>
    <h1>Welcome to {{ apache_server_name }}!</h1>
    <p>Server Hostname: {{ ansible_hostname }}</p>
</body>
</html>
```

---

### 3️⃣ vars/main.yml (High Priority Variables)

```yaml
---
apache_package_name: httpd
apache_server_name: "My Apache Server"
```

---

### 4️⃣ defaults/main.yml (Low Priority Variables)

```yaml
---
apache_package_name: httpd
apache_server_name: "Default Apache Server"
```

📌 **Best Practice:**
Use `defaults/` instead of `vars/` unless necessary.

---

### 5️⃣ handlers/main.yml

```yaml
---
- name: restart httpd
  service:
    name: httpd
    state: restarted
```

---

### 6️⃣ meta/main.yml

```yaml
---
dependencies: []
```

---

## ▶️ Using the Role in a Playbook

### Main Playbook

```yaml
---
- name: Install and configure Apache
  hosts: all
  become: true
  gather_facts: yes

  roles:
    - apache
```

---

## 📄 Optional: External Variables File

If you want to override values externally:

### vars.yaml

```yaml
---
apache_server_name: "Custom Apache Server"
```

### Use in Playbook:

```yaml
vars_files:
  - vars.yaml
```

---

## ⚠️ Important Corrections & Notes

✔ `gather_facts` should be **yes** if using `ansible_hostname`

✔ Handler name should match exactly (`restart httpd`)

✔ Prefer `defaults/` over `vars/` for flexibility

✔ Role name should match directory (`apache`, not `httpd`)

---

## 🧠 Variable Precedence (Important)

From lowest → highest:

1. `defaults/` variables  
2. Playbook-level variables (`vars:` or `vars_files:`)  
3. `vars/` variables inside the role  
4. CLI extra vars using `-e` (highest priority)

This helps decide where to define flexible vs. fixed configurations.


---

## 🔥 Best Practices

- 🚀 One role = one clear purpose.  
- 🧩 Keep variable naming descriptive and consistent.  
- 🧠 Avoid hardcoding — use variables and defaults.  
- 📦 Use templates for dynamic configurations.  
- 🤝 Keep roles reusable — design them to fit multiple environments.  
- 💬 Document inputs (variables) and outputs (actions). 

---

## 💡 Real-Time Example Use Cases

| Role Name  | Purpose                  |
|-------------|--------------------------|
| `webserver` | Install and configure Apache/Nginx |
| `database`  | Setup MySQL/PostgreSQL services |
| `common`    | Manage users and install system tools |
| `monitoring`| Setup Prometheus or other monitoring agents |

---

## 🧩 Analogy

If your playbook is large, containing repetitive installation/configuration tasks,  
split parts into separate *roles*, just like separating reusable functions in code.

**Playbook** = `main.py`  
**Role** = `module.py`  

This keeps automation neat, maintainable, and adaptable.

---

## 📌 Summary

Ansible Roles help you:

* Structure your automation
* Reuse code efficiently
* Manage large infrastructure easily

---
## 🚀 Final Tip

If your playbook grows too large or repetitive —  
💡 **Convert it into roles.**  
It helps organization, saves time, and makes your DevOps automation scalable.

