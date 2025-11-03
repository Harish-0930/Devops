
# 🧱 Maven Installation and Build Lifecycle Guide

## 📅 Day 1: Introduction to Maven

### 🔹 What is Maven?
- Maven is a **build tool** for **Java-based applications**, developed by the **Apache Software Foundation**.
- It is **open-source** and **platform-independent**, meaning it supports multiple operating systems.
- Maven is distributed as a **.zip** or **.tar** file, not as a `.exe` (executable) file.

---

### ❓ What is a Build?
**Build** is the process of automating the packaging of compiled source code into distributable formats such as `.jar`, `.war`, or `.ear`.

---

### 📦 Types of Application Packages

| Type | Description | Contains | File Type |
|------|--------------|-----------|------------|
| **Standalone Application** | Runs on a single machine; not exposed to the internet | Java code only | `.jar` (Java Archive) |
| **Web Application** | Runs on the internet | Java code + Web content | `.war` (Web Archive) |
| **Enterprise Application** | Contains multiple modules | Java code + Web content + Web modules | `.ear` (Enterprise Archive) |

---

### 📁 Maven Directory Structure
(Example directory structure illustration should go here if available)

```bash
export M2_HOME=/opt/apache-maven-3.9.11
export PATH=$PATH:$M2_HOME/bin
```

---

## ⚙️ Maven Installation Steps

### 🧩 System Requirements
- **JDK 8 or above** required for Maven 3.9+
- **Minimum Disk Space:** ~10MB
- **Memory:** No strict minimum requirement
- **OS:** Cross-platform (Linux, Windows, macOS)

> 🗒️ All external software should be stored in `/opt` directory.

---

### 🚀 Installation Steps

#### Step 0: Launch an EC2 Instance and Connect
```bash
ssh -i <key.pem> ec2-user@<public-ip>
```

#### Step 1: Switch to Root User
```bash
sudo su -
```

#### Step 2: Install Java
```bash
yum update -y
sudo yum install java-21-openjdk-devel -y
javac -version
```

#### Step 3: Install Maven
```bash
cd /opt/
yum install wget unzip -y
wget https://dlcdn.apache.org/maven/maven-3/3.9.11/binaries/apache-maven-3.9.11-bin.zip
unzip apache-maven-3.9.11-bin.zip
```

#### Step 4: Set Environment Variables
Edit the `.bash_profile`:
```bash
vi ~/.bash_profile
```
Add:
```bash
export M2_HOME=/opt/apache-maven-3.9.11
export PATH=$PATH:$M2_HOME/bin
```
Apply changes:
```bash
source ~/.bash_profile
mvn -version
```

---

## 📅 Day 2: Maven Repositories and Build System

### 🧩 Testing Frameworks
| Language | Framework |
|-----------|------------|
| Java | JUnit |
| JavaScript | Jest |
| Python | Pytest |
| C# | NUnit |
| Ruby | RSpec |
| C++ | GTest |
| Go | Testify |

---

### 🏗️ Maven Build System Components

1. **Local Repository** – Stored on your local machine (`~/.m2/repository`).
2. **Central Repository** – Hosted by Maven community (`https://repo.maven.apache.org/maven2/`).
3. **Remote Repository** – Private repo for your organization (e.g., Nexus, JFrog).

---

## 🔄 Maven Lifecycles

### 1. 🧹 Clean Lifecycle
Removes previous build outputs.
```bash
mvn clean
```

### 2. 📘 Site Lifecycle
Generates and deploys project documentation.
```bash
mvn site
```
> ⚠️ Nowadays, developers use **Swagger** instead of the site goal.

### 3. ⚙️ Default Lifecycle (Most Common)
| Phase | Description | Command |
|--------|--------------|----------|
| **validate** | Validates project structure and info | `mvn validate` |
| **compile** | Compiles source code | `mvn compile` |
| **test** | Runs unit tests | `mvn test` |
| **package** | Packages into `.jar`, `.war`, or `.ear` | `mvn package` |
| **install** | Installs package into local repository | `mvn install` |
| **deploy** | Deploys package to remote repository | `mvn deploy` |

---

### 🧩 Maven Build Phases Summary

| Phase | Action | Artifact Location |
|--------|--------|------------------|
| **package** | Builds `.jar`/`.war` | `target/` directory |
| **install** | Installs to local repo | `~/.m2/repository` |
| **deploy** | Uploads to remote repo | Nexus / Artifactory |

> 💡 **In short:**
> - `package` → Just build the app  
> - `install` → Build + use locally  
> - `deploy` → Build + share remotely

---

## 📅 Day 3: Skipping Tests & Dependency Management

### ⏭️ Skipping Unit Tests
| Command | Description |
|----------|-------------|
| `mvn clean install -DskipTests` | Skips tests but compiles code |
| `mvn clean package -Dmaven.test.skip=true` | Skips both compilation and tests |

---

### ⚡ Dependency Management

Dependencies are declared in `pom.xml` using the `<dependencies>` tag.

Example:
```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-web</artifactId>
  <version>3.3.0</version>
  <scope>compile</scope>
</dependency>
```

#### 🔍 Key Terms
| Element | Description |
|----------|--------------|
| **groupId** | Organization or group that owns the dependency |
| **artifactId** | Specific project/module name |
| **version** | Version number of the dependency |
| **scope** | Defines dependency availability (e.g., compile, test, runtime) |

---

### 🌐 Repository Resolution Order
1. Local Repository (`~/.m2/repository`)
2. Remote Repository (Company-hosted, e.g., Nexus)
3. Central Repository (Maven Community)

---
End of Document
---

📘 **Author:** Munagala Harish  
📅 **Title:** *Maven Reference Guide*  
✅ **End of Document**
This Markdown document is ready for GitHub upload.
