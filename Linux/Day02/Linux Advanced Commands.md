# 📌 Linux Advanced Commands Guide  

## 🖥️ 1. `ls` (List Directory Contents)
### **Description:**
- The `ls` command lists files, directories, and other file system objects.
- If no directory is specified, it lists the contents of the **current working directory**.

### **Usage:**
```bash
ls         # List files and directories
ls -l      # Long listing format (detailed info)
ls -a      # Show hidden files (files starting with `.`)
ls -lh     # Human-readable format (sizes in KB, MB, etc.)
ls -r      # Reverse order listing
ls -t      # Sort by modification time
ls -i      # Show inode numbers (file metadata ID)
```

---

## 🖥️ 2. `vi` (Text Editor)
### **Description:**
- The `vi` command opens the **vi editor**, one of the most widely used text editors in Linux.

### **Basic Commands:**
```bash
vi file_name  # Open file in vi editor
```
**In vi Mode:**
- Press `i` to enter insert mode and start editing.
- Press `Esc` to switch back to command mode.
- **Save and Exit:** `:wq`
- **Exit Without Saving:** `:q!`

---

## 🖥️ 3. `cat` (Concatenate and Display Files)
### **Description:**
- The `cat` command is used to view and manipulate file contents.

### **Usage:**
```bash
cat file.txt  # Display contents of a file
cat file1 file2  # Concatenate multiple files
cat *  # Display contents of all files in a directory
cat -n file_name  # Show line numbers
```

**Create and Write to a File:**
```bash
cat > newfile.txt  # Create and add content (Ctrl+D to save)
cat >> existing.txt  # Append content to a file
```

**File Manipulation:**
```bash
>file.txt  # Nullify (empty) the file
cat app1.log app2.log > merged.txt  # Merge files (overwrite)
cat file1 >> file2  # Append content of file1 to file2
```

---

## 🖥️ 4. `tac` (Reverse `cat` - Display File in Reverse)
### **Description:**
- The `tac` command is the reverse of `cat`, displaying a file's contents **from bottom to top**.

### **Usage:**
```bash
tac file.txt  # Show file content in reverse order
```

---

## 🖥️ 5. `cp` (Copy Files and Directories)
### **Description:**
- The `cp` command copies files or directories from one location to another.

### **Usage:**
```bash
cp devops.txt DevOps/  # Copy file to a directory
cp -R Python DevOps/  # Copy an entire directory recursively
```

**Copy all `.java` files to a directory:**
```bash
cp *.java destination_dir/
```

---

## 🖥️ 6. `mv` (Move and Rename Files)
### **Description:**
- The `mv` command moves or renames files/directories.

### **Usage:**
```bash
mv python.txt devops.txt  # Rename file
mv DevOps/ Python/  # Move 'DevOps' directory into 'Python'
```

---

## 🖥️ 7. `tail` (View Last N Lines of a File)
### **Description:**
- The `tail` command displays the last few lines of a file.

### **Usage:**
```bash
tail file.txt  # Show last 10 lines
tail -n 3 file.txt  # Show last 3 lines
tail -3 file.txt  # Alternative syntax
```
**Multiple Files:**
```bash
tail file1.txt file2.txt  # Show last 10 lines of both files
tail -q file1.txt file2.txt  # Suppress headers while displaying output
```

---

## 🖥️ 8. `head` (View First N Lines of a File)
### **Description:**
- The `head` command displays the first few lines of a file.

### **Usage:**
```bash
head file.txt  # Show first 10 lines
head -n 3 file.txt  # Show first 3 lines
head -3 file.txt  # Alternative syntax
```

### **Display Specific Line Range (35-50) from a 100-Line File**
```bash
head -50 file.txt | tail -15
```

---

## 🖥️ 9. `sort` (Sort File Content)
### **Description:**
- The `sort` command arranges lines of text in a specified order.

### **Usage:**
```bash
sort file.txt  # Alphabetical sort
sort -r file.txt  # Reverse order sort
sort -k 2 data.txt  # Sort based on second column
sort -u file.txt  # Remove duplicate lines
```

---

## 🖥️ 10. `grep` (Search for Patterns in Files)
### **Description:**
- The `grep` command searches for text patterns in a file.

### **Usage:**
```bash
grep "UNIX" abc.txt  # Case-sensitive search
grep -i "UNIX" abc.txt  # Case-insensitive search
grep -c "UNIX" abc.txt  # Count occurrences
grep -l "UNIX" *  # Show files containing 'UNIX'
grep -w "UNIX" abc.txt  # Match whole words only
```
**Advanced Searching:**
```bash
grep -o "UNIX" abc.txt  # Show only matching content
grep -n "UNIX" abc.txt  # Show line numbers
grep -v "UNIX" abc.txt  # Show lines that do NOT match
```
**Context Search:**
```bash
grep -B5 "error" demo.txt  # Show 5 lines *before* match
grep -A5 "error" demo.txt  # Show 5 lines *after* match
grep -C5 "error" demo.txt  # Show 5 lines *before & after*
```

---

## 🖥️ 11. `wc` (Word Count)
### **Description:**
- The `wc` command counts **lines, words, bytes, and characters** in a file.

### **Usage:**
```bash
wc file.txt  # Show line, word, and character count
wc -l file.txt  # Count number of lines
wc -w file.txt  # Count number of words
wc -c file.txt  # Count number of bytes/characters
```

---

## 🖥️ 12. `id` & `groups` (User & Group Information)
### **Description:**
- The `id` command provides **detailed user information** (UID, GID, groups).
- The `groups` command displays **all groups a user belongs to**.

### **Usage:**
```bash
id
id username
groups
```

---



