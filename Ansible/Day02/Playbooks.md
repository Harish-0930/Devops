# Ansible Playbooks

## What is a Playbook?
An **Ansible Playbook** is a YAML file that defines a set of tasks to be executed on one or more managed hosts. It is used for automation of configuration, deployment, and orchestration.

---

## Key Components of a Playbook

### 1. Plays
- A **play** maps a group of hosts to a set of tasks.
- A playbook can contain multiple plays.

```yaml
- name: Install and start Apache
  hosts: webservers
  become: yes
```

---

### 2. Tasks
- Tasks are the actions executed on hosts.
- Each task uses a module.

```yaml
- name: Install httpd
  yum:
    name: httpd
    state: present
```

---

### 3. Modules
- Pre-built tools provided by Ansible.
- Examples:
  - `yum` → Install packages
  - `copy` → Copy files
  - `service` → Manage services

---

### 4. Variables
- Used to store dynamic values.
- Makes playbooks reusable and flexible.

---

### 5. Handlers
- Special tasks that run only when notified.
- Typically used for restarting services.

```yaml
handlers:
  - name: restart httpd
    service:
      name: httpd
      state: restarted
```

---

### 6. Conditionals and Loops

#### Conditionals
```yaml
- name: Install package only on RedHat
  yum:
    name: httpd
    state: present
  when: ansible_os_family == "RedHat"
```

#### Loops
```yaml
- name: Install multiple packages
  yum:
    name: "{{ item }}"
    state: present
  loop:
    - httpd
    - git
    - vim
```

---

## Common Playbook Activities

### 1. Create a file on managed servers
```yaml
- hosts: all
  become: true
  tasks:
  - name: create py file in all management servers
    file:
      path: /tmp/security.py
      owner: ec2-user
      group: ec2-user
      mode: 0777
      state: touch

```

---

### 2. Install HTTPD, copy HTML file, and start service
```yaml
- name: Setup web server
  hosts: all
  become: yes

  tasks:
    - name: Install httpd
      yum:
        name: httpd
        state: present

    - name: Copy index.html
      copy:
        src: index.html
        dest: /var/www/html/index.html

    - name: Start httpd service
      service:
        name: httpd
        state: started
        enabled: yes
```
> Make sure to create a index.html in the working directory
---

## Copy vs Template Module

### copy module
- Copies files **as-is** from control node to remote hosts.
- No variable processing.

```yaml
- name: Copy static file
  hosts: all
  become: yes
  tasks:  
    - name: copying file
      copy:
        src: file.txt
        dest: /tmp/file.txt
```

---

### template module
- Copies a Jinja2 template (.j2 file) to the destination, but renders it first — replacing variables, expressions, and logic before writing the file.

```yaml
- name: Install and configure Apache HTTP server
  hosts: all
  become: true
  vars:
    location: Bangalore
    date: 04/07/2026
  tasks:
    - name: Install httpd
      yum:  # Use yum for Red Hat/CentOS or dnf for newer versions
        name: httpd
        state: present

    - name: Ensure httpd is started and enabled
      service:
        name: httpd
        state: started
        enabled: true

    - name: Copy custom index.html to the web root
      template:
        src: index.html  # Path to your local index.html file
        dest: /var/www/html/index.html  # Destination on the target server

```

Example template:
```html
<h1>My location is {{ location }} and date is {{date}}</h1>
```

---

## Variables in Ansible

### Types of Variables

### 1. Command Line Variables (Extra Vars)
```bash
ansible-playbook playbook.yml -e "location=hyd"
ansible-playbook playbook.yml -e "location=hyd phoneNo=99999999"
```
#### Use in template
```html
<h1>My location is {{ location }}, mobile number is {{ phoneNo }}</h1>
```
---

### 2. Variables from File

#### Step 1: Create `vars.yml`
```yaml
location: bangalore
phoneNo: 9876543215
```

#### Step 2: Use in template
```html
<h1>My location is {{ location }}, mobile number is {{ phoneNo }}</h1>
```

#### Step 3: Include in playbook
```yaml
vars_files:
  - vars.yml
```
#### Example playbook
```yaml
- name: Install and configure Apache HTTP server
  hosts: all
  become: true
  vars_files:
    - vars.yaml
  tasks:
    - name: Install httpd
      yum:  # Use yum for Red Hat/CentOS or dnf for newer versions
        name: httpd
        state: present

    - name: Ensure httpd is started and enabled
      service:
        name: httpd
        state: started
        enabled: true

    - name: Copy custom index.html to the web root
      template:
        src: index.html  # Path to your local index.html file
        dest: /var/www/html/index.html  # Destination on the target server
```

---

### 3. Variables in Playbook (Inline)
```yaml
vars:
  location: hyderabad
```

---

## Variable Precedence (Important)

Highest to Lowest:
1. Extra vars (command line `-e`)
2. Variables from files (`vars_files`)
3. Playbook variables (`vars`)

---

## Debug Module
- Used to print values and debug playbooks.

### ✅ 1. Simple Debug Message
```yaml
- name: Debug Example
  hosts: localhost
  gather_facts: no

  tasks:
    - name: Print simple message
      debug:
        msg: "Hello Hari, this is a debug message"
```

### ✅ 2. Debug a Variable

```yaml
- name: Debug Variable Example
  hosts: localhost
  gather_facts: no

  vars:
    location: Bangalore

  tasks:
    - name: Print variable value
      debug:
        msg: "Location is {{ location }}"
```

---

## Tasks vs Handlers

### Tasks
- Run in sequence every time.
- Execute regardless of change (unless conditional used).

### Handlers
- Handlers are only executed when notified by a task. If a task makes a change (e.g., installing a package or modifying a file) and issues a notification to a handler, the handler will run after all tasks have been processed.
- handlers are special kind of tasks, It will not executed by default, until other tasks are notify.
- Handlers will execute **at end of the play**.


---

### Example: Tasks + Handler
```yaml
- name: Install and configure httpd
  hosts: all
  become: yes

  tasks:
    - name: Install httpd
      yum:
        name: httpd
        state: present

    - name: Update config file
      copy:
        src: httpd.conf
        dest: /etc/httpd/conf/httpd.conf
      notify: restart httpd

  handlers:
    - name: restart httpd
      service:
        name: httpd
        state: restarted
```

---


## Summary
This document covers:
- Playbook structure
- Modules and tasks
- Variables and precedence
- Copy vs Template
- Debugging
- Handlers vs Tasks


