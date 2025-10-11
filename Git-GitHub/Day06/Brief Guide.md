# Git and GitHub Guide

## 1. Introduction
- **Git:** CLI-based version control software that tracks changes locally.
- **GitHub:** Cloud-based hosting platform for Git repositories with GUI functionality.
- **Other Platforms:** GitLab, Bitbucket, etc.

### Key Differences: Git vs GitHub
| Feature       | Git                           | GitHub                              |
|---------------|-------------------------------|-------------------------------------|
| Type          | Version control system        | Cloud-based hosting platform        |
| Function      | Tracks code changes locally   | Collaboration, sharing, management |
| Interface     | CLI (optional GUI)            | Web-based GUI                       |
| Location      | Local machine                 | Online, needs internet              |
| Ownership     | Open-source, Linux Foundation | Microsoft                           |
| Security      | None built-in                 | Auth, access control, permissions  |
| Use Case      | Solo/offline work             | Team collaboration, open-source    |

---

## 2. How Git and GitHub Work Together
- Git manages code locally: commits, branches, merges.
- GitHub hosts code remotely: collaboration, review, issue tracking.

### Repository
- Local machine: folder/directory
- Git: repo (central place to store code, files, data)

**Types of Repositories**
1. **Code Repository:** Stores source code, version history.
2. **Data Repository:** Stores datasets for research or backup.
3. **Package Repository:** Hosts libraries/packages (npm, PyPI).
4. **Artifact Repository:** Stores binaries and compiled components.

---

## 3. Git Flow

### Working Directory
- Folder initialized with `git init`.

### Staging Area
- `git add <file>` or `git add .` brings files to staging.

### Local Repository
- `git commit -m "message"`

### Remote Repository (GitHub)
- Push changes: `git push -u origin main`

---

## 4. Git Commands & Usage

### Fetch vs Pull
- **git fetch:** download remote commits/branches without merging.
- **git pull:** fetch + merge immediately.

### Useful Commands
```bash
git --version          # check git version
git status             # current repo status
git init               # initialize repo
git commit -m "msg"    # commit changes
git log                # view commit history
git branch             # list branches
git branch <name>      # create branch
git checkout <branch>  # switch branch
git switch -c <branch> # create and switch branch
git checkout -b <branch> # create and switch branch
git merge <branch>     # merge branch
git branch -d <branch> # safe delete branch
git branch -D <branch> # force delete branch
git restore <file>     # restore last commit version
git diff --staged      # changes in staging area
git cherry-pick <commitID> # apply a specific commit
git clone <url>        # clone repo
```

### Git Stash
```bash
git stash save "msg"   # save changes temporarily
git stash list         # view stashes
git stash apply <ID>   # apply stash
git stash pop <ID>     # apply and delete stash
git stash drop <ID>    # delete specific stash
git stash clear        # delete all stashes
```

### Git Rebase
- Rebase = alternative way of merging, clean commit history.
- Run from side branches, **not on master/main**.
```bash
git rebase master
```

---

## 5. Branches
- Default branch: `master`
- **Head:** points to current branch
- Commands:
```bash
git branch             # list local branches
git branch -r          # list remote branches
git branch -a          # list all branches
git branch <name>      # create branch
git checkout <branch>  # switch branch
git switch <branch>    # switch branch
git switch -c <branch> # create & switch branch
git checkout -b <branch> # create & switch branch
git push origin --all  # push all local branches
git push origin :<branch> # delete remote branch
```

---

## 6. Merge Conflicts
- Occurs when the same file/line is modified in multiple branches.
- Resolve manually, then commit.

---

## 7. Git Tags vs Branches
| Feature       | Branch                          | Tag                  |
|---------------|---------------------------------|--------------------|
| Moves?        | Yes                             | No                 |
| Use Case      | Development/Collaboration       | Release/Milestone  |
| Lifecycle     | Temporary, deleted often        | Permanent          |
| Nature        | Mutable                          | Immutable          |
| Example       | feature/login                    | v1.0.0             |

---

## 8. Git Ignore
- `.gitignore` prevents sensitive or unnecessary files from being tracked (env files, node_modules, keys).

---

## 9. Atomic Commits
- Each commit should focus on **one feature, fix, or component**.

---

## 10. Git Configuration
```bash
git config --global user.name "Scarlet Johnson"
git config --global user.email "scarlet@domain.com"
git config --global core.editor "code --wait"
```

---

## 11. Interview Tips
- `git fetch` = "Tell me what's new, don't touch my code yet."  
- `git pull` = "Bring remote changes into my branch immediately."

