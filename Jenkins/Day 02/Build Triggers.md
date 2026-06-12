# Jenkins — Build Triggers

---

## 1. Jenkins Build Triggers — Overview

A **Build Trigger** defines *when* Jenkins should start a pipeline/job.

| Trigger | How it works |
|---------|-------------|
| **Poll SCM** | Jenkins checks the repo on a cron schedule; builds only if changes found |
| **Webhook** | GitHub notifies Jenkins immediately on a push event |
| **Build Periodically** | Jenkins runs on a cron schedule regardless of code changes |

---

## 2. Poll SCM

> Jenkins periodically asks the SCM repository: *"Any new commits?"*

- Jenkins periodically checks the configured SCM repository (e.g., GitHub, GitLab, Bitbucket) according to the cron schedule you provide.
- During each poll, Jenkins compares the current repository state with the **last build's revision**.
- If **new commits are found** → triggers a build.
- If **no changes** → does nothing.

### Cron Syntax Example

```text
H/2 * * * *
```
→ Jenkins polls the repository approximately every **2 minutes**.

### Workflow

```text
GitHub Repository
        │
        ▼
Jenkins Poll SCM (every 2 mins)
        │
        ├── No new commit  →  Do nothing
        │
        └── New commit detected  →  Trigger Pipeline
```

### Interview Answer

> Poll SCM is a Jenkins build trigger where Jenkins periodically checks the source code repository based on a cron schedule. If new commits are detected since the last build, Jenkins triggers the pipeline; otherwise, no build is executed.

---

## 3. Webhooks

> GitHub notifies Jenkins **immediately** when a configured event (push/commit) occurs.

- **Event-driven** — no periodic polling needed.
- GitHub sends an **HTTP POST** request to Jenkins the moment code is pushed.
- Upon receiving the webhook, Jenkins triggers the pipeline without needing to periodically poll the repository.
- Near **real-time** build triggering.

### Workflow

```text
Developer Pushes Code
          │
          ▼
GitHub Webhook Event
          │
          ▼
HTTP POST → Jenkins
          │
          ▼
Jenkins Triggers Pipeline
```

### Poll SCM vs Webhook — Key Difference

```text
Poll SCM  →  Jenkins asks GitHub:  "Any new commits?"
Webhook   →  GitHub tells Jenkins: "A commit was just pushed."
```

| | Poll SCM | Webhook |
|---|---|---|
| Mechanism | Pull-based | Push-based |
| Timing | Delayed (next poll interval) | Near real-time |
| Network overhead | Higher (repeated requests) | Minimal |
| Use case | When webhooks can't be configured | Preferred in production |

### Interview Answer

> Poll SCM is a pull-based mechanism where Jenkins periodically checks the repository for changes. Webhooks are a push-based mechanism where GitHub automatically notifies Jenkins on a commit, triggering builds immediately without polling.

---

## 4. What Happens if Jenkins is Offline During a Webhook?

### Scenario

1. Jenkins is **offline**.
2. Developer pushes code to GitHub.
3. GitHub fires the webhook HTTP POST → Jenkins is unreachable → **delivery fails**.
4. Jenkins comes back online — the missed event is **not replayed automatically**.

**Result:** Jenkins will not automatically trigger the build for that missed webhook event because webhooks are not stored and replayed by Jenkins.

### GitHub's Behavior

GitHub logs failed deliveries. You can view and manually redeliver them at:

```text
Repository → Settings → Webhooks → Recent Deliveries → Redeliver
```

### Best Practice: Combine Webhook + Poll SCM

```groovy
triggers {
    pollSCM('H/5 * * * *')
}
```

- **Webhook** → triggers builds immediately when Jenkins is online.
- **Poll SCM** → acts as a safety net, catching any commits missed during downtime.

### Interview Answer

> If Jenkins is offline when GitHub fires a webhook, the request fails and Jenkins will not process that event when it comes back online. To avoid missed builds, organizations combine webhooks with Poll SCM — webhooks for real-time triggering and Poll SCM as a fallback to catch commits made during downtime.

---

## 5. Configuring GitHub Webhooks with Jenkins

### Step 1 — Install Required Jenkins Plugins

- Git Plugin
- GitHub Plugin
- GitHub Branch Source Plugin *(recommended for multibranch pipelines)*

### Step 2 — Configure the Jenkins Job

```text
Job → Configure → Build Triggers
→ Check: "GitHub hook trigger for GITScm polling"
```

> ⚠️ This is **different from Poll SCM** — it tells Jenkins to react to incoming webhook events.

### Step 3 — Add Webhook in GitHub

```text
Repository → Settings → Webhooks → Add webhook
```

| Field | Value |
|-------|-------|
| Payload URL | `http://<jenkins-server>/github-webhook/` |
| Content Type | `application/json` |
| Events | `Just the push event` (or `Send me everything`) |

### Payload URL Examples

```text
✅  http://192.168.1.10:8080/github-webhook/
✅  https://jenkins.mycompany.com/github-webhook/
❌  https://jenkins.mycompany.com/github-webhooks/   ← extra "s" is wrong
```

### Step 4 — Verify

- GitHub sends a **ping event** on save → look for a ✅ green checkmark.
- Push a commit → confirm Jenkins triggers the build.

### Interview Answer

> To configure GitHub webhooks with Jenkins: enable "GitHub hook trigger for GITScm polling" in the job's Build Triggers, then go to GitHub → Repository Settings → Webhooks → Add webhook. Set the payload URL to `http(s)://<jenkins-server>/github-webhook/`, content type to `application/json`, and select the desired events. On a push, GitHub sends an HTTP POST to Jenkins which triggers the pipeline immediately.

---

## 6. Build Periodically

> Jenkins runs the job on a cron schedule **regardless of whether any code changes occurred**.

- Does **not** check the SCM repository.
- Does **not** require a new commit.
- Simply fires at the scheduled time — every time.

### Cron Example

```text
0 9 * * *
```
→ Run every day at **9:00 AM**.

### Behaviour Example

Assume last commit was on **Monday**. Build Periodically configured as `0 9 * * *`:

```text
Tuesday   9 AM  →  Build triggered  (no new commit)
Wednesday 9 AM  →  Build triggered  (no new commit)
Thursday  9 AM  →  Build triggered  (no new commit)
Friday    9 AM  →  Build triggered  (no new commit)
```

### Interview Answer

> Build Periodically is a Jenkins trigger that executes jobs based on a cron expression alone. Jenkins runs the build at the configured time regardless of whether any code changes have occurred in the repository. Unlike Poll SCM, it does not check for new commits before triggering.

---

## 7. Full Comparison — All Three Triggers

| | Build Periodically | Poll SCM | GitHub Webhook |
|---|---|---|---|
| Checks SCM for changes | ❌ No | ✅ Yes | ✅ Yes |
| Requires new commit | ❌ No | ✅ Yes | ✅ Yes |
| Trigger basis | Cron schedule only | Cron + SCM change | Push/commit event |
| Real-time? | ❌ No | ❌ No (interval-based) | ✅ Yes |
| Network overhead | Low | Medium | Low |
| Best for | Scheduled tasks, nightly builds | Fallback / no webhook access | Production CI pipelines |

---

## 8. Cron Expression Reference

```text
┌───────── minute (0–59)
│ ┌───────── hour (0–23)
│ │ ┌───────── day of month (1–31)
│ │ │ ┌───────── month (1–12)
│ │ │ │ ┌───────── day of week (0–7, 0 & 7 = Sunday)
│ │ │ │ │
* * * * *
```

| Expression | Meaning |
|---|---|
| `H/2 * * * *` | Every ~2 minutes |
| `H/5 * * * *` | Every ~5 minutes |
| `H/10 * * * *` | Every ~10 minutes |
| `0 9 * * *` | Every day at 9:00 AM |
| `0 0 * * *` | Every day at midnight |
| `0 9 * * 1-5` | Weekdays at 9:00 AM |

> 💡 `H` (Hash) spreads the load across Jenkins — Jenkins picks a consistent but random minute within the range to avoid all jobs firing simultaneously.

---

## 9. Quick Interview Q&A

**Q1. What is Poll SCM in Jenkins?**  
A trigger where Jenkins checks the configured SCM repository on a cron schedule and triggers a build only if new commits are detected since the last build.

**Q2. What is a Webhook?**  
An event-driven mechanism where GitHub sends an HTTP POST to Jenkins immediately when a push/commit occurs. Jenkins triggers the pipeline without needing to poll.

**Q3. What is Build Periodically?**  
A cron-based trigger that runs a Jenkins job at scheduled intervals regardless of whether any code changes were made.

**Q4. What is the Jenkins webhook endpoint URL?**  
`http(s)://<jenkins-server>/github-webhook/` — note: no trailing "s" after "webhook".

**Q5. What happens if Jenkins is offline when a webhook fires?**  
The webhook delivery fails. Jenkins does not replay missed events automatically when it comes back online. Best practice is to combine webhooks with Poll SCM as a fallback.

**Q6. Which trigger is preferred in production and why?**  
Webhooks — they are push-based (event-driven), trigger builds in near real-time, and generate less network overhead compared to Poll SCM.

**Q7. What Jenkins plugin is required for GitHub webhook integration?**  
GitHub Plugin, Git Plugin, and GitHub Branch Source Plugin. The job must have "GitHub hook trigger for GITScm polling" enabled under Build Triggers.

**Q8. What does `H` mean in Jenkins cron expressions?**  
`H` (Hash) tells Jenkins to pick a consistent but distributed minute/time within the given range, preventing all jobs from firing at the exact same second and overloading the system.

---

> 📝 *Notes by Harish Munagala | Jenkins -- Build Triggers*
