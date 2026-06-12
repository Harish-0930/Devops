# Jenkins — Plugins & Configuration
---

## 1. JaCoCo — Code Coverage

**Tool:** JaCoCo (Java Code Coverage)  
**Goal:** Ensure minimum **80% code coverage** across the project.

### What it does
- Identifies **untested/uncovered code** via detailed HTML reports.
- Integrates with Jenkins to **fail the build** if coverage drops below the threshold.

### Workflow
```text
Maven Build
    │
    ▼
JaCoCo Report Generated
    │
    ├── Coverage >= 80%  →  Build Passes ✅
    │
    └── Coverage <  80%  →  Build Fails  ❌
```

### Jenkins Configuration
- Install the **JaCoCo Plugin**.
- In job config → **Post-build Actions** → Add JaCoCo coverage report.
- Set the minimum threshold: `Line Coverage ≥ 80%`.
- Jenkins will automatically fail builds that fall below the threshold.

### Interview Answer
> JaCoCo is a Java code coverage tool integrated into Jenkins via a plugin. It generates coverage reports after a Maven build and can be configured to fail the Jenkins build if coverage falls below a defined threshold, such as 80%.

---

## 2. Discard Old Builds

Prevents disk space from filling up by automatically removing old build logs and artifacts.

### Configuration
```text
Job → Configure → General
→ Check: "Discard old builds"
   → Max # of builds to keep: 5   (example)
   → Max days to keep builds: 7   (example)
```

> 💡 Always enable this on long-running jobs to avoid filling up `/var/lib/jenkins/`.

---

## 3. Copy Job Configuration (Clone a Job)

To create a new job with the **same configuration** as an existing job:

```text
Dashboard → New Item
→ Enter new job name
→ At the bottom: "Copy from" → type the existing job name
→ Click OK
```

> The new job inherits all settings — source code, build triggers, post-build actions, etc. Modify only what's needed.

---

## 4. Jenkins Server IP Change Fix

When your EC2 instance gets a new public IP (e.g., after a stop/start), Jenkins may break because the old IP is hardcoded in its config.

### Fix

```bash
# Edit the Jenkins configuration file
vi /var/lib/jenkins/jenkins.model.JenkinsLocationConfiguration.xml
```

Update the `jenkinsUrl` field:

```xml
<!-- Old -->
<jenkinsUrl>http://52.66.196.163:8080/</jenkinsUrl>

<!-- New -->
<jenkinsUrl>http://65.2.171.155:8080/</jenkinsUrl>
```

Then restart Jenkins:

```bash
systemctl restart jenkins
```

> 💡 To avoid this issue in production, always use an **Elastic IP (EIP)** attached to your EC2 instance.

---

## 5. Jenkins Restart — `restart` vs `safeRestart`

When you don't have direct Linux server access (`systemctl` is restricted), use Jenkins' built-in browser-based restart URLs.

### URLs

```text
http://<jenkins-server>:8080/restart
http://<jenkins-server>:8080/safeRestart
```

### Difference

| | `restart` | `safeRestart` |
|---|---|---|
| Behaviour | Stops **all running jobs immediately** and restarts | **Waits** for all running jobs to finish, then restarts |
| Risk | Running builds are **killed/lost** | Running builds are **preserved** |
| When to use | Urgent restart needed | Preferred in production |
| Plugin needed | Built-in | **safeRestart Plugin** (install separately) |

### Interview Answer
> `restart` forcefully stops all running jobs and restarts Jenkins immediately. `safeRestart` waits for all currently running jobs to complete before restarting, making it the safer option in production environments.

---

## 6. Plugins Reference

### Deploy to Container ⭐
- Deploys the built application (`.war`) directly to a **Tomcat server** after a successful build.
- Configured under **Post-build Actions** → Deploy war/ear to a container.

### Maven Integration
- Required to create **Maven project type** jobs in Jenkins.
- Without this plugin, the Maven project option does not appear in the job type selection.

### safeRestart
- Adds the `/safeRestart` endpoint to Jenkins UI and browser URL.
- Allows restarting Jenkins gracefully after all running jobs complete.

### Next Build Number
- Allows manually setting the **next build number** for a job.
- The new number must be **greater than** the previous build number.
- Useful when syncing build numbers with a release versioning scheme.
- Alternative (if you have server access):
  ```bash
  vi /var/lib/jenkins/jobs/<job-name>/nextBuildNumber
  ```

### JaCoCo
- Integrates JaCoCo code coverage reports into Jenkins.
- Can **block deployments** if coverage percentage falls below the configured threshold.

### SSH Agent
- Used in **Pipeline jobs** to securely inject SSH credentials during builds.
- *(Covered in detail in the Pipeline sessions.)*

### Audit Trail ⭐⭐⭐
- Tracks all Jenkins activity — job creation, deletion, configuration changes, build triggers, etc.
- Essential for **security auditing** and compliance.

**Setup:**
```text
Dashboard → Manage Jenkins → System → Audit Trail
→ Add Logger → Log File
   → Log Location : /var/lib/jenkins/audit-trail.log
   → Size in MB   : 20
   → Log File Count: 5
```

This creates a rotating set of log files:
```text
audit-trail.log.0   ← most recent
audit-trail.log.1
audit-trail.log.2
audit-trail.log.3
audit-trail.log.4
```

**To watch logs in real-time:**
```bash
tail -f /var/lib/jenkins/audit-trail.log.0
```

### Blue Ocean
- A modern, visual pipeline editor and dashboard for Jenkins.
- Provides a cleaner UI for viewing pipeline stages and build history.
- Install via **Manage Jenkins → Plugins → Blue Ocean**.

### Build Name and Description Setter
- Allows customizing the **build name** displayed in the build history.

**Setup:**
```text
Job → Configure → Build Environment
→ Check: "Set Build Name"
→ Build Name: jio-dev-#${BUILD_NUMBER}
```

Result: Builds appear as `jio-dev-#1`, `jio-dev-#2`, etc., instead of plain `#1`, `#2`.

### Thin Backup
- Used for **Jenkins backup and restore**.
- *(Covered in detail in the Jenkins Backup session.)*

### Role-Based Authorization Strategy
- Manages **user roles and permissions** in Jenkins.
- *(Covered in detail in the Jenkins Security session.)*

---

## 7. Build with Parameters

Allows triggering a Jenkins job with **dynamic inputs** — e.g., selecting which branch to build.

### Configuration

```text
Job → Configure → General
→ Check: "This project is parameterized"
→ Add Parameter → Choice Parameter
   Name    : BranchNames
   Choices : main
             dev
             qa
```

### Use the Parameter in Source Code Section

Under **Source Code Management → Branch Specifier**, enter:

```text
*/${BranchNames}
```

Jenkins substitutes the selected value at runtime.

### How to Trigger
- The job now shows **"Build with Parameters"** instead of "Build Now".
- Select the desired branch from the dropdown and click **Build**.

### Interview Answer
> Build with Parameters allows Jenkins jobs to accept runtime inputs before execution. A Choice Parameter, for example, lets the user select a branch name from a predefined list, which Jenkins then uses dynamically in the pipeline — such as checking out `*/dev` or `*/main` based on the selection.

---

## 8. How to Create a View in Jenkins

Views let you **group and filter jobs** on the Jenkins dashboard.

```text
Dashboard → + (New View tab)
→ Enter View Name
→ Select View Type:
   • List View    – Simple filtered list of jobs
   • My View      – Shows only jobs relevant to the current user
→ Select jobs to include
→ Save
```

> 💡 Useful in large environments where the dashboard has dozens of jobs — create views per team, project, or environment (dev/qa/prod).

---

## 9. Enable / Disable a Job

To temporarily stop a job from being triggered (without deleting it):

```text
Job → Configure → General
→ Uncheck "Enable" (or use the Disable button on the job page)
```

- A **disabled job** will not run via triggers, schedules, or webhooks.
- It can still be **re-enabled** at any time.
- All configuration and build history is **preserved**.

> 💡 Useful for pausing jobs during maintenance windows or when a feature is put on hold.

---

## 10. Quick Interview Q&A

**Q1. What is JaCoCo and how does it integrate with Jenkins?**  
JaCoCo is a Java code coverage library. The JaCoCo Jenkins plugin collects coverage data after a Maven build and can fail the build if coverage falls below a configured threshold (e.g., 80%).

**Q2. What is the difference between `restart` and `safeRestart` in Jenkins?**  
`restart` immediately stops all running jobs and restarts Jenkins. `safeRestart` waits for all running jobs to complete before restarting, making it safer for production use.

**Q3. How do you fix Jenkins after an EC2 IP change?**  
Update the `jenkinsUrl` in `/var/lib/jenkins/jenkins.model.JenkinsLocationConfiguration.xml` with the new IP and restart Jenkins. Long-term fix: use an Elastic IP.

**Q4. What does the Audit Trail plugin do?**  
It logs all Jenkins activity (job creation, deletion, config changes, build triggers) to rotating log files, enabling activity tracking and security auditing.

**Q5. What is Build with Parameters?**  
It enables jobs to accept runtime inputs (Choice, String, Boolean, etc.) before execution. For example, a Choice Parameter lets users pick a branch, which Jenkins uses dynamically in the pipeline.

**Q6. How do you clone a Jenkins job?**  
Create a New Item → enter a new name → use the "Copy from" field at the bottom to copy configuration from an existing job.

**Q7. What is the Next Build Number plugin used for?**  
It allows manually overriding the next build number for a job. The new number must always be greater than the last build number.

**Q8. Why would you disable a Jenkins job instead of deleting it?**  
Disabling preserves all configuration and build history while preventing the job from being triggered. It's useful during maintenance or when a project is temporarily paused.

---

> 📝 *Notes by HarisH Munagala | Jenkins - Plugins*
