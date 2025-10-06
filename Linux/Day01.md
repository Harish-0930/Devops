# Day 2: Introduction to Linux  

## 1. What is Linux?  
Linux is an **open-source operating system** based on Unix, widely used for servers, cloud computing, and embedded systems.

### Key Features:  
✔ **Operating System:** Manages hardware and software resources.  
✔ **Open Source:** Free to use, modify, and distribute.  
✔ **Developed in 1991** by **Linus Torvalds**.  
✔ **Multi-User & Multi-Tasking:** Supports multiple users and processes simultaneously.  
✔ **Case Sensitive:** Treats uppercase and lowercase differently (`File.txt` ≠ `file.txt`).

---

## 2. Linux Distributions (Flavors)  
A **distribution (distro)** is a customized version of Linux that includes the OS, package management, and additional tools.

| **Distro**   | **Use Case**                                      |
|-------------|--------------------------------------------------|
| **RedHat**  | Enterprise-grade, commercial support (RHEL)      |
| **Ubuntu**  | User-friendly, widely used for desktops/servers  |
| **CentOS**  | Community-supported version of RedHat           |
| **Debian**  | Stable, known for reliability                   |
| **SUSE Linux** | Enterprise use, strong in SAP environments  |

Other distros: Fedora, Arch Linux, Kali Linux (for penetration testing), etc.

---

## 3. Linux Directory Structure  
Linux follows a hierarchical directory structure where everything starts from **`/` (root directory)**.


## 📌 Linux File System Diagram
![Linux Directory Structure](https://media.geeksforgeeks.org/wp-content/uploads/20210501124411/dir.png)




### **Key Directories Explained**
- **`/` (Root Directory):** The top-most directory that contains all files and subdirectories.  
- **`/bin`** - Essential binary executables (commands) like `ls`, `cp`, `mv`.  
- **`/sbin`** - System binaries used for system administration (e.g., `reboot`, `fdisk`).  
- **`/etc`** - System and application configuration files (e.g., `/etc/passwd` for user details).  
- **`/home`** - User home directories (`/home/user1`, `/home/user2`). Each user stores personal files here.  
- **`/dev`** - Represents hardware devices as files (e.g., `/dev/sda` for hard drives).  
- **`/root`** - Home directory for the **root (admin)** user.  
- **`/opt`** - Optional software packages installed manually.  
- **`/lib`** - Shared libraries required by system binaries (`/bin`, `/sbin`).  
- **`/proc`** - A virtual filesystem that provides system information (`/proc/cpuinfo`).  
- **`/tmp`** - Temporary file storage, often cleared on reboot.  

---

# 📌 Linux Interview Questions (IQ)

## 🔹 1. What is the difference between `/bin` and `/sbin`?

### 📌 `/bin` (Binary Executables)
- Contains **basic commands** that are **available to all users**.
- These commands are essential for basic system operations.
- Located in **`/bin`**, meaning they can be executed without requiring superuser privileges.

**✅ Examples:**
- `ls` - List directory contents.
- `cat` - View file contents.
- `cp` - Copy files.
- `mv` - Move or rename files.
- `rm` - Remove files.

### 📌 `/sbin` (System Binaries)
- Contains **system administration commands**, primarily used by the **root user**.
- These commands are used for system maintenance and management.
- Located in **`/sbin`**, requiring **root privileges** (`sudo`) for execution.

**✅ Examples:**
- `shutdown` - Power off the system.
- `reboot` - Restart the system.
- `ifconfig` - Configure network interfaces.
- `mount` - Mount filesystems.
- `fsck` - File system consistency check.

---

## 🔹 2. In which directory are all external software packages installed?

### 📌 Answer: **`/opt`**  
- The **`/opt`** directory is used to store **optional (third-party) software**.
- This includes **software not part of the default Linux distribution**.
- Typically used for **commercial software, large applications, or manually installed packages**.

**✅ Examples of software stored in `/opt`:**
- Google Chrome (`/opt/google/chrome`)
- VirtualBox (`/opt/VirtualBox`)
- Custom enterprise applications

**💡 Why `/opt`?**
- Keeps the system clean by separating **non-default software** from system files.
- Avoids conflicts with **default Linux package manager installations (`/usr/bin`, `/usr/sbin`)**.
- Easier to manage, upgrade, and remove third-party applications.

---

### 📌 Summary
| **Directory** | **Purpose** | **Access Level** | **Examples** |
|--------------|------------|----------------|-------------|
| `/bin` | Essential user commands | All users | `ls`, `cp`, `mv`, `rm` |
| `/sbin` | System administration commands | Root user (sudo required) | `shutdown`, `reboot`, `mount` |
| `/opt` | External software packages | Varies (depends on software) | Google Chrome, VirtualBox |

---







