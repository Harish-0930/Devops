# 🔐 Ansible Vault

## 📌 Introduction

**Ansible Vault** is a  built-in feature in Ansible that allows you to **encrypt sensitive data** such as:

* Passwords 🔑
* API keys 🔐
* SSH keys 🖥️
* Database credentials 🗄️

This ensures that confidential information is **securely stored** and only accessible with a **vault password**.

---

## 🎯 Why Use Ansible Vault?

* ✅ Protect sensitive data in playbooks and inventories
* ✅ Safe to store in Git repositories
* ✅ Prevent accidental exposure
* ✅ Secure automation workflows

---

## 🛠️ Step 1: Create an Encrypted File

Create a new encrypted file:

```bash
ansible-vault create secret.yml
```

### 🔹 What happens?

* You’ll be prompted to **enter a vault password** then
* A text editor opens

### 🔹 Example content:

```yaml
db_password: "SuperSecretPassword123"
api_key: "abcdef1234567890"
```

💡 Save and exit → file is automatically encrypted

> Example file name: secret.yml

---

## 🔍 Step 2: View the Encrypted File

Check the encrypted content:

```bash
cat secret.yml
```

### ✅ Example Output:

```
$ANSIBLE_VAULT;1.1;AES256
6162636465663738393031323334353637383930...
```

📌 The file is fully encrypted and unreadable without the password.

---

## ✏️ Step 3: Edit the Encrypted File

To safely edit:

```bash
ansible-vault edit secret.yml
```

* Enter vault password
* Modify content
* Save → automatically re-encrypted

---

## 👀 Step 4: View Without Decrypting (Safer Method)

Instead of decrypting, you can view securely:

```bash
ansible-vault view secret.yml
```

📌 Recommended over decrypting for security.

---

## 🔓 Step 5: Decrypt the File (Optional)

```bash
ansible-vault decrypt secret.yml
```

Now the file becomes plain text.

```bash
cat secret.yml
```

⚠️ Use this carefully — sensitive data is now exposed.

---

## 🔒 Step 6: Re-Encrypt the File

```bash
ansible-vault encrypt secret.yml
```

---

## 🔁 Step 7: Change Vault Password (Rekey)

```bash
ansible-vault rekey secret.yml
```

👉 Use this when rotating passwords.

---

## ▶️ Step 8: Use Vault in a Playbook

### 🔹 Create Playbook: `playbook.yml`

```yaml
---
- name: Test Ansible Vault
  hosts: all
  gather_facts: no
  vars_files:
    - secret.yml

  tasks:
    - name: Print sensitive variables
      debug:
        msg: "The database password is {{ db_password }}"
```

---

## ▶️ Run Playbook with Vault Password

```bash
ansible-playbook playbook.yml --ask-vault-pass
```

### ✅ Example Output:

```json
TASK [Print sensitive variables]
ok: [172.31.4.57] => {
    "msg": "the database password is SuperSecretPassword123"
}

```

---

## 🔐 Step 9: Use Vault Password File (Automation)

### 1️⃣ Create password file

```bash
echo "<vault-password>" > vault-password.txt
chmod 600 vault-password.txt
```

---

### 2️⃣ Run playbook

```bash
ansible-playbook playbook.yml --vault-password-file vault-password.txt
```

✅ No manual password entry needed

---

## 🔥 Bonus: Encrypt an Entire Playbook

```bash
ansible-vault encrypt playbook.yml
```

Run it:

```bash
ansible-playbook playbook.yml --ask-vault-pass
```

---

## ⚠️ Important Notes

* ❌ There is **NO way to recover a lost vault password**
* ✅ Always keep a secure backup of sensitive data
* ✅ Use password managers for storing vault passwords
* ❌ Avoid committing decrypted files to Git

---

## 🧠 Best Practices

* ✅ Use `ansible-vault view` instead of decrypting
* ✅ Store secrets in separate files (`secret.yml`)
* ✅ Use `--vault-password-file` in CI/CD pipelines
* ✅ Rotate passwords using `rekey`
* ✅ Restrict file permissions (`chmod 600`)

---

## 🔄 Alternative: Encrypt Individual Variables

Instead of encrypting the whole file:

```bash
ansible-vault encrypt_string 'SuperSecretPassword123' --name 'db_password'
```

### Example Output:

```yaml
db_password: !vault |
          $ANSIBLE_VAULT;1.1;AES256
          613735623934...
```

📌 Useful for inline secrets inside playbooks.

---

## 📊 Common Commands Summary

| Command                          | Description           |
| -------------------------------- | --------------------- |
| `ansible-vault create file.yml`  | Create encrypted file |
| `ansible-vault view file.yml`    | View content          |
| `ansible-vault edit file.yml`    | Edit securely         |
| `ansible-vault encrypt file.yml` | Encrypt file          |
| `ansible-vault decrypt file.yml` | Decrypt file          |
| `ansible-vault rekey file.yml`   | Change password       |

---

## 🧩 Analogy

👉 Think of Ansible Vault like a **password-protected ZIP file**

* Your YAML file = data
* Vault password = key
* Encryption = protection

---

## 📌 Final Summary

Ansible Vault helps you:

* Secure sensitive data 🔐
* Safely store configs in Git 📦
* Build secure automation pipelines 🚀

👉 Always separate **code** and **secrets**
👉 Store secrets in Vault, not in plain playbooks

---
