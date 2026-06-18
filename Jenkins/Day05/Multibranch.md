# Jenkins Multibranch Pipelines (MBP)

---

## Table of Contents

1. [What is a Multibranch Pipeline & Why Use It?](#1-what-is-a-multibranch-pipeline--why-use-it)
2. [How Multibranch Pipeline Works](#2-how-multibranch-pipeline-works)
3. [Multibranch vs Single Pipeline — At a Glance](#3-multibranch-vs-single-pipeline--at-a-glance)
4. [Step 0 — Create the MBP Job](#4-step-0--create-the-mbp-job)
5. [Build Strategies — What to Build](#5-build-strategies--what-to-build)
6. [Step 1 — Create a Feature Branch and Push](#6-step-1--create-a-feature-branch-and-push)
7. [Step 2 — Let MBP Discover and Build the Branch](#7-step-2--let-mbp-discover-and-build-the-branch)
8. [Step 3 — Open a PR → PR Job Runs](#8-step-3--open-a-pr--pr-job-runs)
9. [Step 4 — Gate the Merge on Success](#9-step-4--gate-the-merge-on-success)
10. [Step 5 — Merge to Main → Main Job Runs](#10-step-5--merge-to-main--main-job-runs)
11. [Verify the Full Result](#11-verify-the-full-result)
12. [Summary](#12-summary)

---

## 1. What is a Multibranch Pipeline & Why Use It?

### What

A **Multibranch Pipeline (MBP)** is a Jenkins project type that **automatically discovers every branch and pull request** in a Git repository and creates a separate Jenkins job for each one — all reading from that branch's own `Jenkinsfile`.

You create **one** MBP job in Jenkins, point it at your repo, and Jenkins takes care of the rest:

```
GitHub Repo
├── main           →  Jenkins auto-creates job: flask-mbp/main
├── feature/ui     →  Jenkins auto-creates job: flask-mbp/feature/ui
├── hotfix/bug-42  →  Jenkins auto-creates job: flask-mbp/hotfix/bug-42
└── PR #1 (f→main) →  Jenkins auto-creates job: flask-mbp/PR-1
```

When a branch is deleted or a PR is closed, Jenkins **automatically removes** the corresponding job.

### Why

| Problem | How MBP Solves It |
|---|---|
| One Jenkins job for the whole repo → all branches share one config | Each branch gets its own job, isolated builds |
| Manually creating a job for every feature branch | Auto-discovery — no human action needed |
| No CI on PRs before merge | Jenkins builds every PR automatically |
| Branch-specific pipeline logic is impossible | Each branch can have a different `Jenkinsfile` |
| Stale jobs for deleted branches pile up | MBP removes jobs when branches/PRs disappear |
| Can't gate merges on CI status | PR job result posts status back to GitHub — block merges on failure |

### The Core Idea

```
Traditional approach (one pipeline):            Multibranch approach:
─────────────────────────────────               ─────────────────────────────────
One job, manually configured per branch         One MBP job → N child jobs (auto)

  jenkins-flask-main     ← you created this       flask-mbp
  jenkins-flask-feature  ← you created this         ├── main        ← auto-created
  jenkins-flask-hotfix   ← you created this         ├── feature/ui  ← auto-created
                                                     ├── hotfix/bug  ← auto-created
                                                     └── PR-1        ← auto-created
```

---

## 2. How Multibranch Pipeline Works

### Internal Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                      MULTIBRANCH PIPELINE                              │
│                                                                        │
│  1. MBP scans the repo  ─────────────────────────────────────────────► │
│     (on schedule / webhook / manual)       GitHub / GitLab / Bitbucket │
│                                                                        │
│  2. Jenkins finds branches + open PRs                                  │
│                                                                        │
│  3. For each branch/PR that has a Jenkinsfile:                         │
│     └── Jenkins creates (or updates) a child job                       │
│                                                                        │
│  4. Child job runs the Jenkinsfile from THAT branch's tip              │
│                                                                        │
│  5. Build status posted back to GitHub PR check                        │
│                                                                        │
│  6. When branch is deleted / PR is closed → child job is removed       │
└────────────────────────────────────────────────────────────────────────┘
```

### Key Behaviours

- **Each branch runs its own `Jenkinsfile`** — `main` could have a full deploy pipeline while `feature/*` branches only build and test.
- **PR jobs run a synthetic merge** — Jenkins merges the PR branch into the target branch locally and builds the result, so you test what the code *will look like after merge*, not just the branch tip.
- **Scan triggers:** MBP can re-scan on a schedule (e.g., every minute), via a GitHub webhook (push events), or manually via **Scan Repository Now**.
- **Build status** flows back to GitHub — green check or red X appears on the PR, enabling branch protection rules.

---

## 3. Multibranch vs Single Pipeline — At a Glance

| | Single Branch Pipeline | Multibranch Pipeline |
|---|---|---|
| **Job creation** | Manual, one per branch | Automatic — one MBP job covers all branches |
| **PR builds** | Manual setup required | Built-in — PR jobs auto-created |
| **Branch isolation** | Shared config, easy conflicts | Each branch is a fully isolated child job |
| **Jenkinsfile location** | One file, often not in repo | `Jenkinsfile` in every branch of the repo |
| **Stale job cleanup** | Manual | Automatic on branch/PR deletion |
| **GitHub status checks** | Manual integration | Native — posts pass/fail to every PR |
| **Best for** | Single long-lived branch (e.g., only `main`) | Any team with feature branches or PRs |

---

## 4. Step 0 — Create the MBP Job

### Create the Job

1. Jenkins dashboard → **New Item**
2. Enter a name (e.g., `flask-mbp`)
3. Select **Multibranch Pipeline** → **OK**

### Configure Branch Sources

This is where you tell Jenkins which repo to watch.

**Branch Sources → Add source → GitHub** (or Git)

| Field | Value |
|---|---|
| **Credentials** | Select `github-pat` (your stored GitHub PAT) |
| **Repository HTTPS URL** | `https://github.com/youruser/your-repo.git` |

Click **Validate** to confirm Jenkins can reach the repo.

### Build Configuration

| Field | Value |
|---|---|
| **Mode** | `by Jenkinsfile` |
| **Script Path** | `Jenkinsfile` (default) |

Jenkins will read `Jenkinsfile` from the root of each branch.

### Scan Repository Triggers

For this example (no webhooks configured), set a periodic scan:

| Field | Value |
|---|---|
| **Periodically if not otherwise run** | ✅ Enabled |
| **Interval** | `1 minute` |

> In production, configure a GitHub webhook to trigger scans immediately on push/PR events instead of polling.

Click **Save**. Jenkins will immediately perform an initial scan and create child jobs for any branches containing a `Jenkinsfile`.

---

## 5. Build Strategies — What to Build

Build strategies control **which branches and PRs trigger jobs**. These are configured under **Branch Sources → Behaviours**.

### Setup for These Examples

Assume your repo has branches: `main`, `f1`, `f2`, `f3`

**Terms used:**
- **Branch build** — a build of the branch job (runs the branch tip)
- **PR job** — a build of the pull-request job (runs a synthetic merge of branch → target)

---

### Strategy 1: Exclude Branches That Are Also Filed as PRs ✅ Recommended

**Behaviour:** Branch jobs build freely until a PR is opened from that branch. Once a PR exists, the branch job is paused and the PR job takes over. If the PR closes without merging, branch jobs resume.

**Why it's recommended:** Eliminates duplicate builds — you never waste resources building both the branch and the PR for the same change.

**Step-by-step walkthrough:**

| Action | What Jenkins Does |
|---|---|
| Push to `f1` (no PR open) | ✅ `f1` branch job runs |
| Open PR `f1 → main` | ✅ PR job runs; ⏸ `f1` branch job paused/excluded |
| Push to `f1` while PR is open | ✅ PR job rebuilds; ❌ branch job does not run |
| Close PR without merging | ✅ Branch job resumes on next push to `f1` |
| Merge PR into `main` | ✅ `main` job runs per `main`'s rules; `f1` branch job stays paused until next push |
| Push to `f2` (no PR) | ✅ `f2` branch job runs normally |

---

### Strategy 2: Only Branches That Are Also Filed as PRs

**Behaviour:** Only branches with an active open PR are eligible for branch builds. Branches without PRs are completely ignored.

**When to use:** Teams that want CI to focus exclusively on proposed merges — no builds for unreviewed exploratory work.

**Step-by-step walkthrough:**

| Action | What Jenkins Does |
|---|---|
| Push to `f1` (no PR open) | ❌ No build — `f1` has no PR |
| Open PR `f1 → main` | ✅ PR job runs |
| Push to `f1` while PR is open | ✅ PR job rebuilds |
| Close PR without merging | ❌ `f1` becomes non-triggering again |
| Merge PR into `main` | ✅ `main` runs; `f1` is ignored unless a new PR is opened |
| Push to `f2` (no PR) | ❌ No build |

---

### Strategy 3: All Branches

**Behaviour:** Every branch triggers a build regardless of PR state. PR jobs also run for open PRs — potentially causing duplicate builds for the same change.

**When to use:** Maximum coverage scenarios where you want every branch built at all times. Requires additional de-duplication rules to avoid wasted builds.

**Step-by-step walkthrough:**

| Action | What Jenkins Does |
|---|---|
| Push to `f1` (no PR) | ✅ `f1` branch job runs |
| Open PR `f1 → main` | ✅ PR job runs; ✅ `f1` branch job still enabled → **duplicate builds** |
| Push to `f1` while PR is open | ✅ Both `f1` branch job AND PR job may run |
| Close or merge PR | ✅ Branch jobs continue unaffected |
| Push to `f2` | ✅ `f2` branch job runs |

---

### Strategy Comparison

| Strategy | Duplicate Builds? | Unreviewed Branches Built? | PR Branches Built? | Best For |
|---|---|---|---|---|
| **Exclude branches with open PRs** | ❌ No | ✅ Yes | ✅ Yes (via PR job) | Most teams — clean, no waste |
| **Only PR-filed branches** | ❌ No | ❌ No | ✅ Yes | Strict PR-gate workflows |
| **All branches** | ⚠️ Yes | ✅ Yes | ✅ Yes | Max coverage, needs de-dup rules |

> **Our choice for this example:** `Exclude branches that are also filed as PRs`
> Leave all other fields as default.

---

## 6. Step 1 — Create a Feature Branch and Push

Create a new branch locally and push a small code change:

```bash
# Create and switch to the new branch
git checkout -b feature/ui

# Make a change to app.py (add a UI feature message)
# Edit app.py so the response includes: "We've added a new Feature"

# Stage and commit
git add app.py
git commit -m "feat: add UI feature message"

# Push the branch to GitHub
git push origin feature/ui
```

**Result:** Your repo now has two branches:

```
main         ← releasable trunk
feature/ui   ← work-in-progress feature branch
```

---

## 7. Step 2 — Let MBP Discover and Build the Branch

### Trigger Discovery

If webhooks are configured, Jenkins discovers `feature/ui` automatically on push.

If not (demo mode):

1. Open the MBP job (`flask-mbp`) in Jenkins
2. Click **Scan Repository Now** (left sidebar)
3. Click **Scan Repository Log** to watch Jenkins find the new branch

### Observation After Scan

You will now see **two child jobs** under the MBP:

```
flask-mbp
├── main          ← existing job
└── feature/ui    ← newly auto-created job
```

Jenkins immediately **triggers a build** for `feature/ui` since it found a `Jenkinsfile` there.

### What Happens (based on our strategy)

```
feature/ui branch (no PR open)
         │
         │  push
         ▼
  MBP scans repo
         │
         ▼
  feature/ui branch job created + triggered ✅
  (No PR exists yet → branch builds freely)
```

---

## 8. Step 3 — Open a PR → PR Job Runs

### Goal

Create a pull request from `feature/ui` → `main` and have MBP build it as a PR job (synthetic merge build).

### A) Open the Pull Request on GitHub

1. Go to your repository on GitHub
2. Click **Compare & pull request** (appears after pushing a new branch)
   - Or: **Pull requests** → **New pull request**
3. Set **base:** `main`, **compare:** `feature/ui`
4. Add a title and description
5. Click **Create pull request**

> **Optional:** Enable auto-delete of head branches after merge:
> GitHub → **Settings** → **General** → **Pull Requests** → ✅ **Automatically delete head branches**

### B) Rescan in Jenkins

Since webhooks are not configured for this example:

1. Open `flask-mbp` → **Scan Repository Now**
2. After the scan, you will see a new `PR-1` job appear under the MBP:

```
flask-mbp
├── main
├── feature/ui   ← branch job now PAUSED (PR is open)
└── PR-1         ← new PR job AUTO-CREATED ✅
```

### C) Run the PR Job

Open `PR-1` → **Build Now** (or it starts automatically after the scan).

### What the PR Job Does

The PR job runs the **same `Jenkinsfile`** but on a **synthetic merge** — Jenkins internally merges `feature/ui` into `main` and builds the result:

```
Synthetic merge (local, not pushed):
    main HEAD
       +
  feature/ui tip
       =
  merged result  ← what gets built and tested
```

The pipeline stages execute:

| Stage | Action |
|---|---|
| Checkout | Clones the synthetic-merged code |
| Build | `docker build` → image tagged `:$BUILD_NUMBER` and `:latest` |
| Push | Pushes both tags to Docker Hub |
| Deploy | Runs container `flask-app` on port `5000` |
| Test | Hits EC2 metadata API, prints deployment URL |
| Post | Archives `deploy-info-$BUILD_NUMBER.txt` |

### D) Build Status Posted to GitHub

After the PR job completes, Jenkins posts the result back to the GitHub PR:

```
✅  Jenkins/PR-1 — Build succeeded
    Details → http://jenkins:8080/job/flask-mbp/job/PR-1/
```

This enables **branch protection rules** — you can configure GitHub to block the merge button until the Jenkins check is green.

---

## 9. Step 4 — Gate the Merge on Success

### The Idea

Only allow merging a PR when all required CI checks have passed. This is the enforcement layer that makes the PR build meaningful.

### Configure Required Status Checks (GitHub)

1. GitHub repo → **Settings** → **Branches** → **Add branch protection rule**
2. Branch name pattern: `main`
3. Enable: ✅ **Require status checks to pass before merging**
4. Search for and add your Jenkins check (e.g., `continuous-integration/jenkins/pr-merge`)
5. Enable: ✅ **Require branches to be up to date before merging**
6. Click **Save changes**

### Result

```
PR #1: feature/ui → main

  ✅ Jenkins build: passed
  ✅ Branch is up to date with main

  [ Merge pull request ]  ← button is now enabled
```

```
PR #1 (if build failed)

  ❌ Jenkins build: failed
  
  [ Merge pull request ]  ← button is BLOCKED
```

> In a full production setup you would also add checks for: unit tests, code coverage thresholds, security scans, and deploy-preview validation.

---

## 10. Step 5 — Merge to Main → Main Job Runs

### A) Merge the Pull Request

On GitHub → PR #1 → click **Merge pull request** → **Confirm merge**.

If auto-delete is enabled, GitHub automatically removes the `feature/ui` branch after merge.

### B) Rescan in Jenkins

```
flask-mbp → Scan Repository Now
```

Jenkins detects:
- New commit on `main` → triggers `main` job
- `feature/ui` branch deleted → removes `feature/ui` child job
- PR #1 closed → removes `PR-1` child job

```
flask-mbp (after merge + scan)
├── main    ← running build (new commit landed) ✅
│           feature/ui job → REMOVED (branch deleted)
│           PR-1 job       → REMOVED (PR closed)
```

### C) Main Job Executes the Full Pipeline

The `main` job runs the same `Jenkinsfile` stages — Build, Push, Deploy, Test — on the merged code. The deployed container now contains the `feature/ui` changes.

---

## 11. Verify the Full Result

Run these checks on the agent host (the machine where Jenkins and the Docker daemon are running):

### A) Container is Running

```bash
docker ps
```

Expected output:

```
CONTAINER ID   IMAGE                             PORTS                    NAMES
xxxxxxxxxxxx   harish0930/app-flask:N   0.0.0.0:5000->5000/tcp   flask-app
```

### B) App Responds with the New Feature

```bash
curl -s http://localhost:5000
```

Expected response:

```json
{
  "message": "✨ Welcome to Cloud World ✨",
  "tip": "We've added a new Feature"
}
```

The feature branch change is now live on `main`.

### C) Deployment Info Archived in Jenkins

Navigate to: **flask-mbp** → **main** → **Build #N** → **Build Artifacts** → `deploy-info-N.txt`

Contents:

```
build:   N
image:   harish0930/app-flask:N
commit:  <full GIT_COMMIT SHA>
branch:  main
time:    2025-06-15T08:30:00Z
url:     http://jenkins:8080/job/flask-mbp/job/main/N/
```

### D) Code Landed on Main (GitHub)

GitHub → repo → `main` branch → open `app.py`

Confirm the file contains:

```python
UI = "We've added a new Feature"
```

> **Note:** If Jenkins runs on a remote VM/agent, run all `docker` and `curl` commands on **that host** — the container starts there, not on your local machine.

---

## 12. Summary

### The Full Multibranch Pipeline Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    MULTIBRANCH PIPELINE — FULL FLOW                     │
│                                                                         │
│  Step 0: Create MBP job in Jenkins                                      │
│          └── Point to GitHub repo + credentials                         │
│                                                                         │
│  Step 1: Create feature/ui branch + push                                │
│          └── git checkout -b feature/ui && git push                     │
│                                                                         │
│  Step 2: MBP discovers feature/ui                                       │
│          └── Scan Repository Now                                        │
│          └── feature/ui child job auto-created + built ✅               |
│                                                                         │
│  Step 3: Open PR feature/ui → main                                      │
│          └── PR-1 child job auto-created                                │
│          └── feature/ui branch job paused                               │
│          └── PR job builds synthetic merge ✅                           │
│          └── Build status posted to GitHub PR                           │
│                                                                         │
│  Step 4: Gate merge on green CI                                         │
│          └── GitHub branch protection: require Jenkins check            │
│                                                                         │
│  Step 5: Merge PR → main                                                │
│          └── main job triggered ✅                                      | 
│          └── feature/ui job removed (branch deleted)                    │
│          └── PR-1 job removed (PR closed)                               │
│          └── Flask app running with new feature on port 5000            │
└─────────────────────────────────────────────────────────────────────────┘
```

### Key Concepts Recap

| Concept | What It Means |
|---|---|
| **Multibranch Pipeline** | One Jenkins job → auto-discovers all branches + PRs → creates child jobs |
| **Child job** | An auto-created job for a specific branch or PR, reads that branch's `Jenkinsfile` |
| **Synthetic merge** | PR job merges branch → target locally to test post-merge state before actual merge |
| **Scan Repository Now** | Manual trigger for MBP to re-discover branches and PRs |
| **Exclude branches with open PRs** | Recommended strategy — prevents duplicate branch + PR builds |
| **Build status to GitHub** | Jenkins posts ✅/❌ back to the PR — enables branch protection |
| **Auto-cleanup** | MBP removes child jobs when branches are deleted or PRs are closed |
| **Jenkinsfile per branch** | Each branch can define its own pipeline — `main` deploys, `feature/*` only tests |

### Build Strategy Quick Reference

| Strategy | Branch builds? | PR builds? | Duplicate risk? | Use when |
|---|---|---|---|---|
| **Exclude branches with open PRs** | ✅ Until PR opened | ✅ Always | ❌ None | Standard team workflow |
| **Only PR-filed branches** | ❌ Never | ✅ Always | ❌ None | Strict PR-gate enforcement |
| **All branches** | ✅ Always | ✅ Always | ⚠️ Yes | Max coverage + de-dup rules needed |

### MBP vs Single Pipeline — Final View

| | Single Pipeline | Multibranch Pipeline |
|---|---|---|
| Jobs created | Manually, one per branch | Automatically, one per branch + PR |
| PR validation | Not built-in | Native — PR job + GitHub status |
| Cleanup | Manual | Automatic |
| Scale | Breaks down with many branches | Scales to any number of branches |
| Pipeline definition | Centralised in Jenkins UI | `Jenkinsfile` in every branch |
