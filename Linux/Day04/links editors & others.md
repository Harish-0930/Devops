# Linux Command Guide

---

## `ln` Command (Link Creation)
The `ln` command in Linux is used to create **links** between files. There are two types of links:
- **Hard Links**
- **Symbolic (Soft) Links**

### Syntax
```bash
ln originalfile linkfile         # Hard Link
ln -s originalfile linkfile     # Soft Link (Symbolic)
```

### Example
```bash
sudo ln devops.txt hardlink.txt
ln -s devops.txt softlink.txt   # It will start with 'l' in ls -l output
```

### Hard Link vs Soft Link
| Feature                          | Hard Link                                   | Soft Link (Symbolic)                      |
|----------------------------------|---------------------------------------------|-------------------------------------------|
| Inode Number                     | Same as original                            | Different from original                   |
| File Deletion Impact            | Still accessible                            | Link breaks if original is deleted       |
| Works With                      | Files only                                  | Files and directories                    |
| Data Synchronization            | Yes                                         | Yes                                      |
| Cross-filesystem Linking        | No                                          | Yes                                      |
| Identified With `ls -l`         | Regular file                                | Starts with 'l'                          |

### Use Cases
- Create multiple names for one file without duplicating data.
- Maintain backup references.
- Organize directory access using symbolic links.
- Shortcuts to config files or frequently accessed paths.

---

## `tr` Command (Translate Characters)
The `tr` command is used to translate or delete characters from input provided via stdin.

### Syntax
```bash
cat demo.txt | sort | tr [a-z] [A-Z]  # Converts lowercase to uppercase
```

### Use Case
- Format output (like logs or reports) to a specific case.
- Clean or normalize input data.

---

## Linux Editors

### `vi` Editor
A powerful, standard editor available on all Unix/Linux systems.

```bash
vi demo.txt     # Open file
:wq             # Save and exit
:q!             # Quit without saving
:q              # Quit if no changes
```

#### Navigation
```bash
:se nu        # Show line numbers
:se nonu      # Hide line numbers
:90           # Go to line 90
/data         # Search for 'data'
dd            # Delete a line
u             # Undo
```

### Use Case
- System administrators use `vi` to quickly edit config files.
- Lightweight and efficient on low-resource servers.

---

### `nano` Editor
A beginner-friendly text editor in Linux.

```bash
nano demo.txt
sudo yum install nano -y     # Install nano if not available
```

#### Commands
- Ctrl+O  → Save
- Ctrl+X  → Exit

### Use Case
- Quick and intuitive editing of small files or scripts.

---

## `find` Command (Search Files & Directories)
Used to search for files and directories based on different filters.

### Syntax & Examples
```bash
find . -type f -empty                 # Find empty files in current directory
find ~ -type f -empty                # Find empty files in home directory
find /tmp -type f -empty            # Find empty files in /tmp
find . -type d -name <dirName>      # Search directory by name

find . -name deployment.yaml         # Case-sensitive search
find . -iname deployment.yaml        # Case-insensitive search
find . -type f -perm 0777            # Files with 777 permissions

find . -mtime 1                      # Modified exactly 1 day ago
find . -mtime -1                     # Modified less than 1 day ago
find . -mtime +1                     # Modified more than 1 day ago

find ./ -type f -name "*.txt"        # Find all .txt files

```

### Use Case
- Locate old log files for cleanup.
- Search configuration files across directory structures.
- Security scans for permission issues.

---

## `sed` Command (Stream Editor)
Used for parsing and transforming text in files without opening them.

### Syntax & Examples
```bash
sed 's/unix/linux/' abc.txt          # Replace first occurrence
sed 's/unix/linux/2' abc.txt         # Replace 2nd occurrence
sed 's/unix/linux/g' abc.txt         # Replace all occurrences

sed '3 s/unix/linux/' abc.txt        # Replace on line 3
sed '3 s/am/was/p' sed.txt           # Duplicate replaced line
sed -n 's/am/was/p' sed.txt          # Print only replaced lines

sed '1,3 s/unix/linux/' abc.txt      # Replace in line range
sed '5d' filename.txt                # Delete line 5
sed '3,6d' filename.txt              # Delete lines 3 to 6
sed -n '60,80p' filename             # To display lines 60 to 80 of a file using sed

```

### Use Case
- Modify large files programmatically.
- Replace strings in configuration or data files.
- Scripted cleanup of logs or report files.

---

## `who` Command (User Sessions)
Displays users currently logged into the system.

```bash
who -H    # Display with headers
```

## `w` Command
Shows who is logged in and what they are doing.

```bash
w
```

### Use Case
- Monitor logged-in users.
- Check terminal activity.
- System performance monitoring.

---

## `/proc/cpuinfo` (CPU Info)
```bash
cat /proc/cpuinfo     # Displays processor details
```

### Load Average
Found in output of `top` or `uptime`:
```
load average: 0.08, 0.15, 0.16
```
- 1st value → last 1 minute
- 2nd value → last 5 minutes
- 3rd value → last 15 minutes

### Use Case
- Identify CPU usage over time.
- Detect overloaded systems.
- Useful for performance tuning and diagnostics.

---

