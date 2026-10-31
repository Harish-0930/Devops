# 🧩 Git Branching and Environment Guide

---

## 🌍 Environments Overview

| 🌿 Branch Name | 🏗️ Environment | 🧾 Description |
|----------------|----------------|----------------|
| `dev`          | Development    | Active development branch |
| `stg`          | QA / Staging   | Used for testing and validation |
| `master`       | Production     | Main stable branch (default) |
| `release`      | Production     | Used for release-ready code |
| `feature`      | Development    | For new features and experiments |

> ⚠️ **Note:**  
> The `master` branch exists by default.  
> **Never push code directly to `master`.**  
> Always merge changes through development or feature branches.

---

## 🌱 Branch Management Commands

### 🧾 List all branches
```bash
git branch
```

### 🌿 Create a new branch
```bash
git branch <branch-name>
```

### 🔁 Switch between branches
```bash
git checkout <branch-name>
```

### 🚀 Create and switch to a new branch (in one command)
```bash
git checkout -b <branch-name>
```

---

## 🔀 Merging Concept

### Example Workflow:
1. Switch to the development branch:
   ```bash
   git checkout development
   ```
   > When you create the development branch from master, all files from master are initially copied.

2. Modify a file in the `development` branch and commit it.

3. Switch back to `master`:
   ```bash
   git checkout master
   ```
   The changes won't appear yet.

4. Compare both branches:
   ```bash
   git diff development
   ```

5. Merge development into master:
   ```bash
   git merge development
   ```

6. Verify that changes have been merged successfully.

---

## ⚠️ Merge Conflict Explained

A **merge conflict** occurs when two developers modify the **same file and the same lines** across different branches.

### Steps to Simulate a Conflict:
1. Update and commit a file in `master`.
2. Update and commit the same file in `development`.
3. Switch to master:
   ```bash
   git checkout master
   ```
4. Merge:
   ```bash
   git merge development
   ```
5. Resolve conflict markers manually (`<<<<<<<`, `=======`, `>>>>>>>`) and commit the resolved version.

---

## 🌐 Working with Remote Repositories

### 🔼 Push specific or all branches to remote
```bash
git push <alias> branch1 branch2
git push <alias> --all
```

### 🧠 Create a branch in a remote repository
> Usually done directly from the remote platform (e.g., GitHub or GitLab UI).

### ⬇️ Pull updated code from remote
```bash
git pull <alias> <branch-name>
```

### 🌍 List remote branches
```bash
git branch -r
```

### 🧭 List all branches (local + remote)
```bash
git branch -a
```

---

## 🧹 Branch Maintenance

### ✏️ Rename a branch
```bash
git branch -m <old-name> <new-name>
```

### ❌ Delete a local branch
```bash
git branch -d <branch-name>
```
> ⚠️ The current checked-out branch cannot be deleted.

### 🗑️ Delete a remote branch
```bash
git push <alias> :<branch-name>
```
---

## Compare local commits with GitHub

First, fetch the latest remote changes:

```
git fetch origin
```

Commits on GitHub but missing locally:

```
git log Main..origin/Main --oneline
```

Commits locally but missing on GitHub:

```
git log origin/Main..Main --oneline
```

Compare both sides together:

```
git log --oneline --left-right Main...origin/Main
```

## Check file-level differences

To see the code changes between your local branch and GitHub:

```
git diff origin/Main
```

To list only changed filenames:

```
git diff --name-status origin/Main
```

## If GitHub has commits missing locally

If you want to bring those changes into your local branch, use:

```
git merge origin/Main
```

If your local branch has no unique commits and you simply want to update it, you can instead use:

```
git pull origin Main
```

---

## ⚡ Quick Reference Summary

| 🧭 Action | 🧠 Command |
|-----------|------------|
| List local branches | `git branch` |
| Create branch | `git branch <name>` |
| Switch branch | `git checkout <name>` |
| Create & switch | `git checkout -b <name>` |
| Merge branch | `git merge <branch>` |
| List remote branches | `git branch -r` |
| List all branches | `git branch -a` |
| Rename branch | `git branch -m old new` |
| Delete local branch | `git branch -d <name>` |
| Delete remote branch | `git push <alias> :<name>` |

---

📘 **Author:** Munagala Harish  
📅 **Title:** *Git Branching and Workflow Reference*  
