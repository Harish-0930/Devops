# ⚖️ `vi` vs `visudo` in RHEL (with Examples and Scenarios)

> 📂 **SECTION: VI vs VISUDO**

---

## 🤞 Difference Between `vi` and `visudo`

| Tool       | Purpose                                         | Use Case Example                                 |
|------------|--------------------------------------------------|--------------------------------------------------|
| `vi`       | General-purpose text editor                     | Edit any file like `/etc/hosts`, scripts, etc.  |
| `visudo`   | Safe editor specifically for `/etc/sudoers`     | Modify sudo privileges with syntax checks       |

---

## 🧠 Why Prefer `visudo` for `/etc/sudoers`?

Because a **syntax error in `/etc/sudoers` can break `sudo` completely**.
You might get locked out of root privileges. `visudo` **validates the syntax** before saving.

---

## ✅ Scenario 1: Using `vi` (Generic File Edit)

**📍 Task**: Edit a config file, e.g., Apache

```bash
sudo vi /etc/httpd/conf/httpd.conf
```

> Use `vi` to edit normal configuration or text files.

---

## ✅ Scenario 2: Using `visudo` to Grant Sudo Access

**📍 Task**: Allow user `kkfunda` to use `sudo`

### ❌ Don't do this:
```bash
sudo vi /etc/sudoers
```
> Any syntax mistake here can break sudo.

### ✔️ Correct way:
```bash
sudo visudo
```
Add at the bottom:
```bash
kkfunda ALL=(ALL) ALL
```

### 🔐 Passwordless sudo:
```bash
kkfunda ALL=(ALL) NOPASSWD: ALL
```

---

## ✅ Scenario 3: Add Group `devops` to Sudoers

```bash
sudo visudo
```
Add this line:
```bash
%devops ALL=(ALL) ALL
```
Now all users in `devops` group have sudo rights.

---

## ⚠️ If `/etc/sudoers` Is Broken:

1. Boot into recovery mode.
2. Mount root filesystem.
3. Use `visudo -f /mountpoint/etc/sudoers` to fix.

Or use EC2 SSM / another admin user if on AWS.

---

## 📅 Summary Table: `vi` vs `visudo`

| Command       | Use Case                                 | Safe for sudoers? |
|---------------|-------------------------------------------|--------------------|
| `vi`          | General file editing                     | ❌ No syntax check |
| `visudo`      | Safely edit `/etc/sudoers`               | ✅ Yes             |
| `visudo -f`   | Edit other sudoers files (e.g., custom)  | ✅ Yes             |

---

# 🔄 `sudo su` vs `sudo su -` in RHEL (with Examples & Scenarios)

> 📂 **SECTION: SUDO SU vs SUDO SU -**

---

## 🔍 Quick Comparison

| Command        | What it does                                      | Environment Loaded? | Use Case                         |
|----------------|---------------------------------------------------|---------------------|----------------------------------|
| `sudo su`      | Switches to root user (retains current env)       | ❌ Partial           | Quick root switch, same shell    |
| `sudo su -`    | Switches to root **login shell** (like fresh login) | ✅ Full (like root login) | Simulates full root login shell |

---

## ✅ `sudo su` (Switch to root without login shell)

```bash
sudo su
```
- You become root (`#` prompt)
- **Environment variables stay the same**
- You're still using your **current user’s environment**
- Useful for running a quick command or debugging

🔍 Example:
```bash
echo $HOME
```
Output: `/home/yourusername` (not `/root`)

---

## ✅ `sudo su -` (Full root login shell)

```bash
sudo su -
```
- You become root (`#` prompt)
- **Environment variables are updated**
- Loads root’s profile: `/root/.bash_profile`, `/etc/profile`
- It’s like **you logged in as root from scratch**

🔍 Example:
```bash
echo $HOME
```
Output: `/root`

---

## 🧠 Real-Life Scenario:

**You're logged in as `kkfunda` and need to install a package as root**

### Using `sudo su`:
```bash
sudo su
dnf install nginx
exit
```

### Using `sudo su -`:
```bash
sudo su -
dnf install nginx
exit
```

✅ `sudo su -` is safer when working with environment-dependent tasks like system config, software installation, or user environments.

---

## 📘 Summary Table

| Task                                 | Use `sudo su`? | Use `sudo su -`? |
|--------------------------------------|----------------|------------------|
| Quickly switch to root               | ✅              | ✅                |
| Simulate full root login             | ❌              | ✅                |
| Access root’s environment vars       | ❌              | ✅                |
| Edit root’s config files reliably    | ❌              | ✅                |
| Run just one root command            | ✅ (`sudo cmd`) | ✅                |

---

# 👥 `userdel` and `groupdel` in RHEL

> 📂 **SECTION: USERDEL and GROUPDEL**

---

## 👤 `userdel` – Delete a User

### 🔹 Syntax:
```bash
sudo userdel [options] username
```

### 🔹 Common Options:
- `-r`: Remove user's **home directory** and **mail spool**.

---

### ✅ Scenario 1: Delete a user (keep files)
```bash
sudo userdel testuser
```
- User is removed from `/etc/passwd`
- Home directory `/home/testuser` is **not deleted**

---

### ✅ Scenario 2: Delete a user and their files
```bash
sudo userdel -r intern1
```
- User removed
- `/home/intern1` and mail files deleted

---

### ⚠️ Check if user is logged in:
```bash
who | grep username
pkill -u username  # To force logout
```

---

## 👥 `groupdel` – Delete a Group

### 🔹 Syntax:
```bash
sudo groupdel groupname
```

---

### ✅ Scenario 3: Remove unused group
```bash
sudo groupdel interns
```
> Group must not be the **primary group** for any user

---

### ⚠️ Fix if group is still in use:
```bash
sudo usermod -g othergroup john
sudo groupdel interns
```

---

## 🧾 Summary Table

| Task                          | Command                            |
|-------------------------------|-------------------------------------|
| Delete user only              | `sudo userdel username`            |
| Delete user + home directory  | `sudo userdel -r username`         |
| Delete unused group           | `sudo groupdel groupname`          |
| Change user's primary group   | `sudo usermod -g newgroup username`|

---

## 💡 Pro Tips

- Backup user data before deletion
- Use `find / -user username` to locate leftover files
- Automate with user cleanup scripts for offboarding

---

# 🚀 `nohup sh demo.sh &` Explained

> 📂 **SECTION: NOHUP BACKGROUND SCRIPT**

---

### 🔹 Command:
```bash
nohup sh demo.sh &
```

### 🔍 What it does:
- Runs `demo.sh` **in the background**
- Keeps it running even if you **log out** or **close terminal**
- Output goes to `nohup.out` unless redirected

### ✅ Real-world use:
Run long tasks (like backups or data processing) on remote servers via SSH and not worry if the connection drops.

```bash
nohup sh backup.sh &
```

### 🛠 Monitor or redirect:
```bash
tail -f nohup.out
ps aux | grep demo.sh
```
Redirect output:
```bash
nohup sh demo.sh > demo.log 2>&1 &
```

---

# 📜 `more` and `less` Commands in Linux

> 📂 **SECTION: FILE VIEWING COMMANDS**

---

## 📘 `more` Command (Loads entire file)

```bash
more filename
```

### 🔹 Navigation:
- `Enter`: scroll **line by line**
- `Space`: scroll **page by page**
- `b`: go **back one page**

Good for small files but **loads the entire file into memory**.

---

## 📘 `less` Command (Loads part of file on demand)

```bash
less filename
```

### 🔹 Screen Navigation:
- `Ctrl + f`: forward one window
- `Ctrl + b`: back one window

### 🔹 Line Navigation:
- `j`: forward by one line
- `k`: back by one line

✅ Better for viewing **large files** (log files, configs).
Doesn’t load the whole file into memory.

---

# 🛠️ Useful Linux Commands

> 📂 **SECTION: MISC COMMANDS**

---

## 🔁 `uniq` Command
Removes **consecutive duplicate lines** from input.

```bash
uniq file.txt
```
Often used with `sort`:
```bash
sort file.txt | uniq
```
Count total lines:
```bash
wc -l < file.txt
```

---

## 📤 `tee` Command
Read from stdin and **write to file and screen at the same time**.

```bash
cat file.txt | tee copy.txt
```
Or:
```bash
echo "Hello" | tee output.txt
```

---

## 📦 `zcat` and `zgrep` Commands

```bash
zcat abc.gz         # View contents of gzipped file
zgrep -i "error" abc.gz   # Search text inside a .gz file
```
> Note: `abc.zip` is not for `zcat`, use `unzip abc.zip` instead.

---

## 🗓️ `cal` Command

```bash
cal            # Show current month
cal 08 2023    # Show August 2023
cal -y         # Full year view
cal -3         # Previous, current, next month
cal -j 2024    # Julian calendar (1–366)
```

---

## 🌐 `ping` and `yum`

```bash
ping google.com       # Check internet connectivity
sudo yum update       # Update all packages
```

---

## 🧠 System Info Commands

```bash
lscpu                 # Display CPU architecture info
lshw                  # Show detailed hardware info (needs root)
```

---

## 🔌 Shutdown and Memory Watch

```bash
sudo shutdown now     # Shutdown system immediately
watch -d free -h      # Monitor memory usage live with highlight
```

---
