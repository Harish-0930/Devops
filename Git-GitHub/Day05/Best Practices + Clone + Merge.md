# 🌿 Git Best Practices and Commands Guide

---

## ✅ Git Best Practices

- **Avoid committing half-done code** – commit only when work is complete.
- **Test your code before committing**.
- **Write proper commit messages**, e.g.:
  ```
  JIRA_ID: Updated pom.xml
  ```
- **Avoid merge conflicts** – communicate with your team regularly.
- **Raise Pull Requests** instead of direct merges to prevent binding merges.
- **Monitor branches** – delete unnecessary branches with lead approval.
- **Clean up stashes** that are no longer needed.

---

## 📂 Git Clone

The `git clone` command is used to create a copy of an existing repository along with its remote connection.

### Steps:
1. Create a folder on your Desktop.
2. Navigate inside the folder.
3. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
   > Along with the code, git config also comes by default.
4. Create a staging branch, switch to it, and start working:
   ```bash
   git checkout -b staging
   ```

> **Note:** Default remote alias name is `origin`.  
> List remotes:
```bash
git remote -v
```

---

## 🔀 Git Merging Strategies

### 1️⃣ Fast-Forward Merge

- **Description:** Moves the target branch pointer forward to include source branch commits.
- **Scenario:** No new commits in the target branch since branching.
- **Diagram:**
```
Before:
      A --- B --- C  (master)
                       D --- E  (feature)

After git merge feature:
      A --- B --- C --- D --- E  (master, feature)
```
- **Explanation:** Commits D and E from feature branch are added linearly.

---

### 2️⃣ Recursive Merge (Three-Way / ORT Strategy)

- **Description:** Creates a merge commit when both branches have diverged.
- **Scenario:** Both `master` and `feature` have new commits.
- **Diagram:**
```
Before:
      A --- B --- C  (master)
                       D --- E  (feature)

After git merge feature:
      A --- B --- C --------- M  (master)
           \               /
            D --- E ------   (feature)
```
- **Explanation:** New commit `M` reconciles changes while preserving history.

---

### 3️⃣ Merge and Rebase

- **Description:** Rebase moves feature branch commits on top of target branch, creating a linear history.
- **Scenario:** Incorporate feature commits without a merge commit.
- **Diagram:**
```
Before:
      A --- B --- C  (master)
                       X --- Y --- Z  (feature)

After git rebase master:
      A --- B --- C --- X' --- Y' --- Z'  (master, feature)
```
- **Explanation:** Commits X, Y, Z are replayed as X', Y', Z' on top of C.

---

## 🍒 Git Cherry-Pick

- **Purpose:** Apply specific commits from one branch to another.
- **Usage:** Useful to merge only particular commits.

```bash
git cherry-pick <commit-hash>
```

---

## 🔄 Git Pull vs Git Fetch

### Git Fetch
- Fetches updates from remote but **does not merge** automatically.
```bash
git fetch origin test
git merge origin/test
```

### Git Pull
- Fetch + merge in one command:
```bash
git pull origin test
```

---

## ✏️ Amend Recent Commit Message

- **Update message in last commit:**
```bash
git commit --amend -m "New commit message"
```

- **Open editor to edit message:**
```bash
git commit --amend
```

- **Push updated commit to remote (force required):**
```bash
git push --force
```

---

📘 **Author:** Munagala Harish  
📅 **Title:** *Git Best Practices and Workflow Guide*  

