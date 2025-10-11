# 🌿 Git Branch vs Tag, Stash, and Restore Guide

---

## 🧩 Difference Between Branch and Tag

| Feature | 🌿 **Branch** | 🏷️ **Tag** |
|----------|---------------|-------------|
| **Nature** | Mutable (can change over time) | Immutable (fixed, cannot change) |
| **Purpose** | Used during development to add or modify features | Used after production deployment to mark a specific release |
| **Creation Time** | Created while development is ongoing | Created after a stable version or release |
| **Base Source** | Can be created from any branch | Usually created from the `master` (production) branch |
| **Command to List** | `git branch` | `git tag` |
| **Command to Create** | `git branch <name>` | `git tag <tag-name>` |
| **Command to Push** | `git push <alias> <branch-name>` | `git push <alias> <tag-name>` |
| **Push All** | `git push <alias> --all` | `git push <alias> --tags` |
| **Delete** | `git branch -d <branch-name>` | `git tag -d <tag-name>` |
| **Storage Format** | Just versioned references | Stored as compressed files (ZIP / TAR) when downloaded |

---

## 🧠 Example: Working with Branches

```bash
# List all branches
git branch

# Create a new branch
git branch feature/login

# Push a specific branch
git push origin feature/login

# Push all branches
git push origin --all

# Delete a branch
git branch -d feature/login
```

---

## 🏷️ Example: Working with Tags

```bash
# Step 1: List existing tags
git tag

# Step 2: Create a tag (from master branch)
git tag Airtel_V1.0.0    # Format: Major.Minor.Patch

# Step 3: Verify tag creation
git tag

# Step 4: Push the tag to remote
git push airtel Airtel_V1.0.0
```

### 📦 Notes:
- Tag files usually appear in **ZIP** or **TAR** format when downloaded from GitHub.
- Tags mark **releases** (stable versions of your project).

---

### 💡 Interview Question:  
**Q:** How to create a tag directly in a remote repository?  
**A:**  
👉 Go to **GitHub → Tags → Create Release → Create a new tag**.

---

## 🧰 Git Stash

When you're working on a task in the `dev` branch and suddenly need to fix something in `master`, you can use **stash** to save your current work temporarily.

### 📘 Steps:

1. **Save your current work (stash changes):**
   ```bash
   git stash save "login feature"
   ```

2. **List all stashes:**
   ```bash
   git stash list
   ```
   > Example output: `stash@{0}`, `stash@{1}`, etc.

3. **Switch to `master` branch, fix the issue, and return to `dev`.**

4. **Apply a specific stash:**
   ```bash
   git stash apply stash@{1}
   ```

---

### 🧹 Managing Stashes

| Action | Command | Description |
|--------|----------|-------------|
| Delete the most recent stash | `git stash drop` | Removes the latest stash |
| Delete a specific stash | `git stash drop stash@{5}` | Removes a particular stash |
| Apply and delete at once | `git stash pop` | Restores and deletes the stash |
| Delete all stashes | `git stash clear` | Clears all saved stashes |

---

### 💡 Interview Question:  
**Q:** My local repo size keeps increasing. How do I reduce it?  
**A:**  
👉 Delete all unused stash files using:  
```bash
git stash clear
```

---

## 🔁 Restoring Working Area Changes

If you accidentally modified a file and want to undo changes before committing:

### Steps:
1. Identify the wrongly updated file.
2. Restore it to its last committed state:
   ```bash
   git restore <file-name>
   ```

---

## ⚡ Quick Summary

| Action | Command |
|--------|----------|
| List branches | `git branch` |
| Create branch | `git branch <name>` |
| Delete branch | `git branch -d <name>` |
| Create tag | `git tag <tag-name>` |
| Delete tag | `git tag -d <tag-name>` |
| Push all branches | `git push origin --all` |
| Push all tags | `git push origin --tags` |
| Save stash | `git stash save "message"` |
| List stash | `git stash list` |
| Apply stash | `git stash apply stash@{n}` |
| Drop stash | `git stash drop stash@{n}` |
| Clear all stashes | `git stash clear` |
| Restore file | `git restore <file-name>` |

---

📘 **Author:** Munagala Harish  
📅 **Title:** *Git Branch vs Tag and Stash Management Guide*
