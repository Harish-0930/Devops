# 📘 Ansible - Loops, When Conditions, and Tags

## 📌 Overview
This document covers three important Ansible concepts:
- Loops
- When Conditions
- Tags


---

# 🌀 Loops in Ansible

Loops help you **repeat a task multiple times with different values**.  
Instead of writing many similar tasks, you write one task and a loop — cleaner and faster.

---

### 🔹 Without Loops
```yaml
- name: Install packages without loops
  hosts: all
  become: yes
  tasks:
    - name: Install Git
      yum:
        name: git
        state: present

    - name: Install Zip
      yum:
        name: zip
        state: present

    - name: Install Vim
      yum:
        name: vim
        state: present
```

Four tasks for four packages — repetitive and inefficient.

---

### ✅ 1. Basic Loop Using `loop` (Recommended)
```yaml
- name: Install packages
  hosts: all
  become: yes
  tasks:
    - name: Install multiple packages
      yum:
        name: "{{ item }}"
        state: present
      loop:
        - httpd
        - git
        - curl
```

**Explanation:**

- `item` → represents each element in the list.  
- The task runs once for each value (`httpd`, `git`, and `curl`).

---

### ✅ 2. Loop with Dictionaries

Useful when you have **key-value pairs**.

```yaml
- name: Create users
  hosts: all
  become: yes
  tasks:
    - name: Create users
      user:
        name: "{{ item.name }}"
        uid: "{{ item.uid }}"
      loop:
        - { name: user1, uid: 1010 }
        - { name: user2, uid: 1020 }
```

**Access Keys:**  
`item.name`, `item.uid`

---

### ⚠️ 3. Using `with_items` (Deprecated)
Older method — replaced by `loop`.

```yaml
- name: Install packages
  yum:
    name: "{{ item }}"
    state: present
  with_items:
    - httpd
    - git
```
Use `loop` for modern playbooks.

---

### ✅ 4. Loop with Register

Capture the result/output of each iteration.

```yaml
- name: Check multiple files
  command: ls "{{ item }}"
  loop:
    - /etc/passwd
    - /etc/shadow
  register: output

- name: Show results
  debug:
    var: output.results
```

You can access individual results with:  
`output.results[index].stdout`

---

### ✅ 5. Loop with Condition (`when`)

Run the loop only for items that meet a condition.

```yaml
- name: Install only httpd
  yum:
    name: "{{ item }}"
    state: present
  loop:
    - httpd
    - git
  when: item == "httpd"
```

Only `httpd` is processed.

---
### ✅ Using a custom loop variable (`loop_control`)
By default Ansible uses item, but you can rename it.

✔ Example:
``` yaml
- name: Install packages
  yum:
    name: "{{ pkg }}"
    state: present
  loop:
    - httpd
    - git
  loop_control:
    loop_var: pkg
``` 

### ✅ Using a variable list
```yaml
vars:
  web_packages:
    - httpd
    - php
    - git

tasks:
  - name: Install web packages
    yum:
      name: "{{ package_name }}"
      state: present
    loop: "{{ web_packages }}"
    loop_control:
      loop_var: package_name
```
---

### 💡 Best Practices for Loops

- Always use `loop:` — modern and less error-prone.
- Use descriptive variable names (instead of generic `item`).
- Combine with `register` and `when` for complex logic.
- Prefer dictionaries for structured data.

---

# ⚙️ When Condition in Ansible

`when` allows you to **run a task only if a condition is true.**  
It’s an essential tool for conditional execution.

---

### ✅ Basic Syntax
```yaml
- name: Install Apache only on RedHat
  yum:
    name: httpd
    state: present
  when: ansible_os_family == "RedHat"
```

---
### ✅ Setup module

- The setup module is used to gather system information (facts) about managed nodes.
- This command runs the setup module on all hosts.

```yaml
ansible all -m setup
```

📊 What are "facts"?

Facts are details about remote systems, like:

1. OS type
2. IP address
3. CPU info
4 .Memory
5. Hostname
6. Disk details



---
### ✅ Using `when` with Facts

Facts are system properties collected by Ansible automatically.

```yaml
- name: Install Apache on Amazon Linux
  yum:
    name: httpd
    state: present
  when: ansible_distribution == "Amazon"
```

---

### ✅ Using `when` with Loops

Run conditionally for specific items.

```yaml
- name: Install only httpd from list
  yum:
    name: "{{ item }}"
    state: present
  loop:
    - httpd
    - git
  when: item == "httpd"
```

---

### ✅ Using `when` with Register

You can base a task on registered output.

```yaml
- name: Check if file exists
  stat:
    path: /tmp/test.txt
  register: file_check

- name: Create file if not exists
  file:
    path: /tmp/test.txt
    state: touch
  when: not file_check.stat.exists
```

---

### ✅ Conditions

**AND condition**
```yaml
when: ansible_os_family == "RedHat" and ansible_processor_vcpus > 1
```

**OR condition**
```yaml
when: ansible_os_family == "Debian" or ansible_os_family == "RedHat"
```
**Alternative AND syntax**
```yaml
when:
  - ansible_os_family == "RedHat"
  - ansible_memtotal_mb > 512
```
> List conditions behave as `AND`.
---
### ✅ Using AND + OR together

You must use parentheses () to control logic.

✔ Example:
``` yaml
- name: Install package based on condition
  yum:
    name: httpd
    state: present
  when: (ansible_os_family == "RedHat" and ansible_memtotal_mb > 512) or ansible_distribution == "Ubuntu"
```

---

### 🧠 Common Operators

| Operator | Meaning          |
|-----------|------------------|
| `==`      | Equal            |
| `!=`      | Not equal        |
| `>` `<`   | Greater / Less   |
| `and`     | Both true        |
| `or`      | Any true         |
| `not`     | Logical NOT      |

---

### 🔍 Best Practices for `when`

- Use facts or registered variables, not hardcoded values.
- Validate facts using `setup` module.
- Keep conditions readable; use YAML list form for `AND`.

---

# 🏷️ Tags in Ansible

Tags act as **labels** for tasks, allowing selective execution of parts of a playbook.

Very useful for **fast, controlled deployments**.

---

### ✅ Basic Syntax
```yaml
- name: Install Apache
  yum:
    name: httpd
    state: present
  tags:
    - install
```

---

### ✅ Run Tagged Tasks

Run only tasks with specific tags:
```bash
ansible-playbook site.yml --tags "install"
```

Skip specific tags:
```bash
ansible-playbook site.yml --skip-tags "install"
```

Run multiple tags:
```bash
ansible-playbook site.yml --tags "web,start"
```

---

### 🧠 Example: Web Server Setup
```yaml
- name: Web Server Setup
  hosts: web
  become: yes
  tasks:

    - name: Install Apache
      yum:
        name: httpd
        state: present
      tags:
        - install

    - name: Copy index file
      copy:
        src: index.html
        dest: /var/www/html/index.html
      tags:
        - config

    - name: Start Apache
      service:
        name: httpd
        state: started
        enabled: yes
      tags:
        - start

    - name: Restart Apache
      service:
        name: httpd
        state: restarted
      tags:
        - restart
```

---

### 🧩 Helpful Commands for Tags

| Command | Description |
| -------- | ------------ |
| `ansible-playbook playbook.yml --list-tags` | Lists all tags in a playbook |
| `ansible-playbook playbook.yml --list-tasks` | Lists tasks along with their tags |
| `ansible-playbook playbook.yml --tags "config" --check` | Dry run (check mode) for tagged tasks |
| `ansible-playbook playbook.yml --tags "install" -v` | Run tag with verbose output |

---

### 💡 Best Practices for Tags

- Always assign meaningful tag names (`install`, `config`, `restart`, etc.).
- Use tags for task grouping (installation, configuration, cleanup).
- Combine tags with roles for modular playbooks.
- Avoid overlapping tag names across unrelated tasks.

---

## 🧭 Summary

| Concept | Purpose | Example |
|----------|----------|----------|
| **Loops** | Repeat tasks for multiple items | Install many packages |
| **When** | Conditional task execution | Run only on RedHat OS |
| **Tags** | Selective task execution | Run only “install” tasks |
