# Introduction to Jenkins

---

## 1. What is Jenkins?

- **Jenkins** is an open-source **Continuous Integration (CI)** tool written in **Java**.
- It is a **cross-platform** tool that automates building, testing, and deploying code.
- **Creator:** Kohsuke Kawaguchi (2004)
- **Originally named:** Hudson → renamed to **Jenkins in 2011**
- **Default Port:** `8080`

---

## 2. Advantages of Jenkins

| # | Advantage |
|---|-----------|
| 1 | Open-source with strong community support |
| 2 | Simple web-based GUI for easy configuration |
| 3 | **1900+ plugins** available ([plugins.jenkins.io](https://plugins.jenkins.io/)) |
| 4 | Built in Java → portable across all major platforms |
| 5 | Rich documentation and beginner-friendly resources |

---

## 3. CI/CD Concepts

### 3.1 Continuous Integration (CI)

> The practice of automating the **build and testing** of code every time a developer pushes changes to a shared repository.

- Developers integrate code into a **shared remote repository frequently** (multiple times/day).
- Each integration triggers an **automated build + test** to catch errors early.

**Benefits:**
- Immediate bug detection
- Fewer merge conflicts
- Deploy at any point in time
- Improved code quality (consistent testing + code reviews)
- Instant feedback to developers

---

### 3.2 Continuous Delivery (CD)

> Every successful build that passes all automated tests and quality gates **can be deployed to production** via a **one-click manual process**.

```
Code → Unit Tests → Integration → Acceptance Tests → [MANUAL] Deploy to Production
        AUTO           AUTO             AUTO
```

> 📌 Deployment happens **after client approval** and QA sign-off.

---

### 3.3 Continuous Deployment

> Every successful build is **automatically deployed to production** — no manual steps involved.

```
Code → Unit Tests → Integration → Acceptance Tests → [AUTO] Deploy to Production
        AUTO           AUTO             AUTO               AUTO
```

| | Continuous Delivery | Continuous Deployment |
|---|---|---|
| Final Deploy | **Manual** (one-click) | **Automatic** |
| Human approval needed | Yes | No |

---

## 4. Jenkins CI/CD Pipeline Flow

```
Developer → GitHub → Maven (Build) → SonarQube (Code Quality)
         → Nexus (Artifact Store) → Tomcat (Deploy) → Email Notification
```

| Stage | Tool | Purpose |
|-------|------|---------|
| Source Code | GitHub | Version control |
| Build | Maven | Compile & package the application |
| Code Quality | SonarQube | Static code analysis |
| Artifact Storage | Nexus | Store build artifacts (.jar/.war) |
| Deployment | Tomcat | Host and serve the application |
| Notification | Email/Slack | Notify team of build status |

---

## 5. What Can Jenkins Do?

- ✅ Integrate with VCS tools — **GitHub, GitLab, Bitbucket**
- ✅ Generate test reports — **JUnit**
- ✅ Push builds to artifact repositories — **Nexus, JFrog**
- ✅ Deploy directly to **production or test environments**
- ✅ Notify stakeholders via **Email, Slack**, etc.

---

## 6. Popular CI Tools Comparison

| Tool | Open Source | Notes |
|------|-------------|-------|
| **Jenkins** | ✅ Yes | Community Edition |
| **CloudBees Jenkins** | ❌ No | Enterprise Edition |
| **Bamboo** | ❌ No | Atlassian product |
| **CruiseControl** | ✅ Yes | |
| **Travis CI** | ✅ / Paid | |
| **CircleCI** | ✅ / Paid | |
| **GitLab CI** | ✅ / Paid | Built into GitLab |
| **TeamCity** | ✅ / Paid | JetBrains product |

---

## 7. Jenkins Installation (RHEL/Amazon Linux)

### Prerequisites
- EC2 instance: **t2.medium** (minimum)
- Java (JDK 21)

### Step-by-Step

```bash
# Step 1: Switch to root
sudo su -

# Step 2: Install wget & add Jenkins repo
yum install wget tree -y

sudo wget -O /etc/yum.repos.d/jenkins.repo \
    https://pkg.jenkins.io/redhat-stable/jenkins.repo

sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key

sudo yum upgrade -y

# Step 3: Install Java and Jenkins
sudo yum install fontconfig java-21-openjdk -y
sudo yum install jenkins -y
sudo systemctl daemon-reload

# Step 4: Enable & Start Jenkins
systemctl enable jenkins
systemctl start jenkins
systemctl status jenkins
```

### Step 5: Access Jenkins UI
```
http://<PUBLIC_IP>:8080
```
> ⚠️ Make sure **port 8080** is open in your EC2 Security Group.

### Step 6: Unlock Jenkins
```bash
cat /var/lib/jenkins/secrets/initialAdminPassword
```
Paste this password in the browser to unlock Jenkins, then click **"Install Suggested Plugins"**.

---

## 8. Quick Interview Q&A

**Q1. What is Jenkins?**  
Jenkins is an open-source CI/CD tool written in Java, used to automate building, testing, and deploying applications.

**Q2. What is the difference between CI, Continuous Delivery, and Continuous Deployment?**  
- **CI** — Automatically build and test on every code commit.  
- **Continuous Delivery** — Automatically build and test; deploy to production manually (one-click).  
- **Continuous Deployment** — Automatically build, test, AND deploy to production with no manual step.

**Q3. What was Jenkins originally called?**  
Hudson. It was renamed to Jenkins in 2011 after a dispute with Oracle.

**Q4. What is the default port for Jenkins?**  
`8080`

**Q5. What is the minimum EC2 instance type recommended for Jenkins?**  
`t2.medium`

**Q6. Where is the Jenkins initial admin password stored?**  
`/var/lib/jenkins/secrets/initialAdminPassword`

**Q7. Name some Jenkins integrations.**  
GitHub, GitLab, Bitbucket (VCS), JUnit (test reports), Nexus/JFrog (artifacts), Slack/Email (notifications), SonarQube (code quality).

**Q8. What are Jenkins plugins?**  
Plugins extend Jenkins functionality. There are **1900+** plugins available at [plugins.jenkins.io](https://plugins.jenkins.io/).

---

> 📝 *Notes by Harish Munagala | Jenkins Intro 
