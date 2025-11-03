# SonarQube Overview

## Definition
SonarQube is an open-source platform used for continuous inspection of code quality.  
It performs static code analysis to identify **bugs**, **vulnerabilities**, and **code smells** in your code.

---

## 🔑 Key Features

### Code Quality and Security
- **Bugs and Vulnerabilities** – Detect and fix issues that might lead to bugs or security vulnerabilities.
- **Code Smells** – Identify maintainability issues in your code.
- **Code Coverage** – Measure how much of your code is covered by tests.
- **Duplication** – Detect duplicate code blocks.
- **Technical Debt** – Estimate the effort required to fix all issues in the code.

### Multi-Language Support
Supports a wide range of programming languages including **Java, JavaScript, C#, C++, Python, PHP**, and many more.

### Quality Gates
Set thresholds for quality metrics to ensure code meets standards before integration into the main branch.

---

## 🧰 Similar Tools
SonarQube, Checkmarx, Coverity, Fortify SCA, Veracode, PMD, ESLint, FindBugs/SpotBugs, StyleCop,  
Pylint, ReSharper, Flake8, Codacy, CodeClimate, DeepSource, Semmle LGTM, Klocwork, Infer, Bandit, Rubocop, Brakeman

---

## ⚖️ Code Review vs Code Coverage

### Code Coverage
The number of lines tested through unit test cases is called **code coverage**.  
In any project, at least **80%** coverage is recommended.

**Benefits:** Helps identify untested areas of code.  
**Tools:** JaCoCo (for Java).

### Code Review
Manual process of reviewing code by team members to find bugs, ensure coding standards, and improve overall quality.

**Benefits:** Leads to better software quality, fewer bugs, and promotes best practices.  
**Tools:** GitHub Pull Requests.

---

## 🧩 SonarQube Introduction
- **Type:** Continuous Code Quality  
- **Vendor:** Sonar  
- **Open Source:** Yes (for some languages)  
- **Version:** 9.x  
- **OS Support:** Cross-platform  
- **Executable Software:** No, download and extract zip  
- **Download:** [SonarQube Downloads](https://www.sonarsource.com/products/sonarqube/downloads/)

---

## 📘 More Information
- Previously called **Sonar**, it is a software quality management tool.
- Continuously analyzes and measures source code quality.
- Generates reports (HTML/PDF) on issues.
- Initially developed for Java but now supports many languages.
- Supports **macOS, Linux, Windows**, and databases like **Oracle, PostgreSQL, SQL Server**.
- Identifies:
  1. Duplicate code  
  2. Coding standards  
  3. Unit test coverage  
  4. Complex code  
  5. Comments  
  6. Potential bugs

> 📝 With SonarQube reports, you can stop deployments.

---

## ⚙️ Prerequisites for Installation

### Hardware
- **CPU:** Multi-core processor  
- **RAM:** Minimum 2GB (4GB recommended → t2.medium)  
- **Disk:** 1GB + database storage  

### Software
- **OS:** Linux (preferred), Windows, macOS  
- **Java:** JDK 11 or 17 (JRE not supported)  
  - Set `JAVA_HOME` to JDK path  
- **Database:** Oracle, MS SQL Server, PostgreSQL  
  - *(H2 inbuilt DB available for default use)*

---

## 🧠 SonarQube Practical Guide

### 🐞 Common Bug: Root User Start Issue
If you start SonarQube as the **root user**, it might not start properly.

```bash
sudo su -
cd /opt/sonarqube/bin/linux-x86-64
sh sonar.sh start
sh sonar.sh status
```

✅ Correct way (use **sonar** user):

```bash
su - sonar
cd /opt/sonarqube/bin/linux-x86-64
sh sonar.sh start
sh sonar.sh status
```

If error persists:

```bash
cd /opt/sonarqube/logs
cat sonar.log
sudo rm -rf /opt/sonarqube/temp/
sh sonar.sh start
sh sonar.sh status
```

Access:(http://IPaddress:9000/)

---

## 🧾 Execute SonarQube Report for Java (Maven)

### Step 1
Connect to the Maven server with your Java project.

### Step 2
Update `pom.xml`:
```xml
<properties>
    <sonar.host.url>http://IPaddress:9000</sonar.host.url>
    <sonar.login>admin</sonar.login>
    <sonar.password>admin</sonar.password>
</properties>
```

### Step 3
Run command:
```bash
mvn sonar:sonar package
```

### Step 4
Open SonarQube GUI → **Projects** → View report.

---

## 🔐 Use Token Instead of Username/Password

### Step 1
In SonarQube:
```
Administration → Security → Users → Tokens → Generate Token
```

### Step 2
Update `pom.xml`:
```xml
<properties>
   <sonar.host.url>http://IPaddress:9000</sonar.host.url>
   <sonar.login>squ_f16a79749bad93fb485aa8e2c3b323ef7f2c8b6d</sonar.login>
</properties>
```

### Step 3
```bash
mvn clean sonar:sonar
```

---

## 🔄 Change SonarQube Port Number

Default: `9000`

### Steps
```bash
cd /opt/sonarqube/conf
vi sonar.properties
# Edit:
sonar.web.context=/SQReports
sonar.web.port=8639

cd /opt/sonarqube/bin/linux-x86-64
sh sonar.sh restart
```

---

## 📊 Projects & Issues
- **Projects:** Displays all projects  
- **Issues:** Shows project issues  
- **Rules:** Rules available per language  

---

## 🧩 Quality Profile
A **collection of rules** applied during analysis.  
Each language has one profile by default.

### Create Custom Profile
1. **Quality Profiles → Create →** Name: `webapp-qp`, Language: `Java`
2. Check under Java → Profile created
3. Assign:  
   `Project → Settings → Quality Profiles → Java → Change → Save`
4. Build:
   ```bash
   mvn clean sonar:sonar
   ```

---

## 🚦 Quality Gates
A **set of conditions** (default: *Sonar Way*).

### Create Custom Quality Gate
1. `Quality Gates → Create → Name: webapp-qg`
2. Add conditions:
   - Coverage ≥ 80%  
   - Duplicate lines ≤ 3%
3. Assign to project → Save  
4. Run:
   ```bash
   mvn sonar:sonar
   ```

---

## 🛠️ Administration

### Configuration
- Manage languages, extensions, and settings.

### Security
- **Users:** Create and manage users  
- **Roles:** Assign `sonar-admin` to users  
- **Groups:** Create and assign users to groups

---

💡 **End of Document**
📘 **Author:** Munagala Harish  
📅 **Title:** *SonarQube Overview*  
