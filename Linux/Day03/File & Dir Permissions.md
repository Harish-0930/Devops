# Linux File Permissions & Commands Reference

## 1. `umask`

The `umask` command defines the default permissions for newly created files and directories.

| User       | Umask | Default File | Default Directory |
|------------|-------|--------------|-----------------|
| root       | 0022  | 644          | 755             |
| normal     | 0022  | 644          | 755             |

> **RHEL 9.x:** Umask values are the same.

### Base Permissions

**Files:**
```
Base permissions: 0666
Umask:            0022
----------------------
Resulting perms: 644
```

**Directories:**
```
Base permissions: 0777
Umask:            0022
----------------------
Resulting perms: 755
```

### Permission Values

| Permission | Value |
|------------|-------|
| r (read)   | 4     |
| w (write)  | 2     |
| x (execute)| 1     |

### Example: Creating a File and Directory

```bash
touch file.txt
mkdir Dir1
ls -l
```
> Permissions are automatically assigned according to the `umask` value.

### Change Umask Value

- Only root can change umask for other users.
- Commands:
```bash
umask        # display current umask
umask 222    # set new umask
```
> **Note:** Changing umask does not affect existing files or directories.

## 2. Understanding File Permissions

Each file or directory has three types of permissions:

- **Read (r):** View file contents or list directory.
- **Write (w):** Modify file or directory contents.
- **Execute (x):** Execute file or access directory.

Permissions can be assigned to:

- **User (u):** Owner of the file.
- **Group (g):** Group associated with the file.
- **Others (o):** All other users.

### Permission Representation

**Symbolic Notation:**
```
-rwxr-xr--
```
- User: read, write, execute
- Group: read, execute
- Others: read

**Numeric (Octal) Notation:**

| Symbol | Value |
|--------|-------|
| r      | 4     |
| w      | 2     |
| x      | 1     |

Example: `rwx = 4 + 2 + 1 = 7`, `r-x = 4 + 0 + 1 = 5`, `r-- = 4 + 0 + 0 = 4`

## 3. `chmod` – Change File/Directory Permissions

### Numeric Examples
```bash
chmod 000 devops.txt   # No permissions
chmod 444 devops.txt   # Read only for all
chmod 766 devops.txt   # User: rwx, Group/Others: rw
chmod 777 devops.txt   # Full access for everyone
```

### Symbolic Examples
```bash
chmod +r devops.txt       # Add read permission for all
chmod u+rwx,go+rw devops.txt  # Set explicit permissions
chmod u+x file.txt        # Add execute permission for user
chmod g+w file.txt        # Add write permission for group
chmod o-r file.txt        # Remove read permission for others
chmod u-w file.txt        # Remove write permission for user
chmod u=rwx,g=rx,o=r file.txt  # Set permissions explicitly
chmod -v 644 file.txt     # Show changes made
```
> **Note:** A user may have write permission but still cannot open the file if **read permission is missing**.

### Directory Permissions
```bash
chmod 444 DevOps/      # Change parent directory only
chmod ugo+x DevOps/    # Add execute to access
chmod -R 444 DevOps/   # Apply recursively to subdirectories
```
> **Important:**  
> - `777` (numeric) **overrides existing permissions**.  
> - `ugo+rwx` (symbolic) **adds permissions but does not override existing ones**.

## 4. `chown` – Change File Ownership

- Only root user can change ownership.
- Syntax:
```bash
chown owner file        # Change file owner
chown root devops.txt
sudo chown root devops.txt
chown -R root DevOps/   # Recursively change ownership for directory
chown ec2-user:ec2-user devops.txt  # Change both owner & group
```

### Root Home Directory

- `/` → Root directory (parent)
- `/home` → Normal users’ home
- `/root` → Root user home

## 5. `chgrp` – Change Group Ownership

- Only root user can use.
```bash
chgrp wheel devops.txt
chgrp -R wheel DevOps/
```
- To change owner and group simultaneously:
```bash
chown ec2-user:ec2-user devops.txt
chown ec2-user:ec2-user DevOps/
```
- View all groups:
```bash
cat /etc/group
```

## 6. `file` – Check File Type
```bash
file demo.txt
file test.txt
```

## 7. `diff` – Compare Files
> Used to compare contents of two files line by line.

## 8. `echo` – Display Text
```bash
echo hello java
echo "hello       java"
```
> Quotation preserves spaces.

### ✅ Notes

1. Permissions are critical for security and access control.
2. Numeric and symbolic representations can be used interchangeably.
3. `chmod`, `chown`, and `chgrp` are commonly used for file management.
4. Umask only affects **newly created files/directories**.

