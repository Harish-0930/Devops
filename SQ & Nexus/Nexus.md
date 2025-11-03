# Nexus Repository - Installation and Integration Guide

1. Developer (e.g., `dev1`) pushes code to **GitHub**.  
2. **GitHub** acts as a version control system and source code repository.  
3. **Maven** is used to build the project and generate a `.war` file.  
4. The generated `.war` file is deployed onto the **Apache Tomcat server**.  

Multiple developers (e.g., `dev1`, `dev2`) can push their code to GitHub, following the same flow:  
*Maven build → WAR generation → Tomcat deployment.*

---

## 📘 Introduction

**Nexus** is a repository manager that serves as a **central hub** for managing binary artifacts such as libraries, Docker images, and build artifacts.  
It provides a **secure, efficient, and scalable** way to store, distribute, and manage software components and dependencies.

- **Developed in:** Java  
- **Type:** Open-source software  

---

## 🧱 Types of Repository Managers

1. **Nexus** → by *Sonatype* → *Sonatype Nexus*  
2. **JFrog Artifactory**

---

## ❓ Difference Between GitHub and Nexus

| Feature | GitHub | Nexus |
|----------|---------|--------|
| Purpose | Manages **source code**, Dockerfile | Manages **build artifacts** and Docker images |
| Type | Version Control System | Repository Manager |
| Example | GitHub Repositories | Nexus Maven Repositories |

---

## ⚙️ Nexus Installation

### 🔧 Prerequisites
- **Java 1.8** (required for Nexus 3.x)  
- **Minimum RAM:** 2GB for Nexus, 1GB for OS (t2.medium recommended)  
- **Cross-platform:** Linux, Windows, macOS  
- **Distribution:** Archive file (zip/tar.gz)

---

### 🪜 Installation Steps

#### Step 1: Launch EC2 Instance
```bash
Instance type: t2.medium
```

#### Step 2: Connect to Server
```bash
ssh -i <key.pem> ec2-user@<public-ip>
```

#### Step 3: Check RAM
```bash
free -h
```

#### Step 4: Switch to Root
```bash
sudo su -
```

#### Step 5: Check Java Installation
```bash
javac -version
```

#### Step 6: Install Java 1.8 (Amazon Corretto)
```bash
sudo rpm --import https://yum.corretto.aws/corretto.key
sudo curl -Lo /etc/yum.repos.d/corretto.repo https://yum.corretto.aws/corretto.repo
sudo yum install -y java-1.8.0-amazon-corretto-devel --nogpgcheck
java -version
```

#### Step 7: Install Required Utilities
```bash
sudo yum install -y tar wget tree
```

#### Step 8: Download Nexus Archive
```bash
wget https://download.sonatype.com/nexus/3/nexus-3.70.1-02-java8-unix.tar.gz
```

#### Step 9: Extract Archive
```bash
tar -zxvf nexus-3.70.1-02-java8-unix.tar.gz
```

#### Step 10: Move Nexus Folder
```bash
mv nexus-3.70.1-02 /opt/
mv /opt/nexus-3.70.1-02 /opt/nexus
```

#### Step 11: Create Nexus User
```bash
useradd nexus
visudo
# Add line:
nexus ALL=(ALL) NOPASSWD: ALL
```

#### Step 12: Set Ownership and Permissions
```bash
chown -R nexus:nexus /opt/nexus
chown -R nexus:nexus /opt/sonatype-work
chmod -R 775 /opt/nexus
chmod -R 775 /opt/sonatype-work
```

#### Step 13: Configure to Run as Nexus User
```bash
vi /opt/nexus/bin/nexus.rc
# Add:
run_as_user="nexus"
```

#### Step 14: Create Systemd Service
```bash
sudo vi /etc/systemd/system/nexus.service
```

Add the following content:
```ini
[Unit]
Description=Nexus service
After=network.target

[Service]
Type=forking
LimitNOFILE=65536
ExecStart=/opt/nexus/bin/nexus start
ExecStop=/opt/nexus/bin/nexus stop
User=nexus
Restart=on-abort

[Install]
WantedBy=multi-user.target
```

Run:
```bash
sudo systemctl daemon-reexec
sudo systemctl daemon-reload
sudo systemctl enable nexus
sudo systemctl start nexus
sudo systemctl status nexus
```

#### Step 15: Start Nexus Service
```bash
sudo systemctl start nexus
```

#### Step 16: Access Nexus
```
http://<public-ip>:8081/
```

#### Step 17: Login
Get the password from:
```bash
cat /opt/sonatype-work/nexus3/admin.password
```
> Before version 3.15: `admin / admin123`

---

## 🧰 Troubleshooting

### If Nexus service not starting:
- Verify ownership and permissions  
- Ensure Java is installed properly  
- Start as `nexus` user  
- Check logs:
  ```bash
  cat /opt/sonatype-work/nexus3/log/nexus.log
  ```

### If unable to access via browser:
- Ensure **port 8081** is open in security group.

---

## 🔄 Change Port and Context Path

```bash
cd /opt/nexus/etc/
vi nexus-default.properties
# Modify port and context
```

Restart service:
```bash
sudo systemctl restart nexus
```

---

## 🏗️ Creating Repositories

1. Login as **admin** → *Settings → Create repository → Maven2 (hosted)*  
2. Create:
   - **jio-snapshot** → Version policy: `snapshot`
   - **jio-release** → Version policy: `release`

Example URLs:
- `http://34.204.18.45:8081/repository/jio-release/`
- `http://<ip>:8081/repository/jio-snapshot/`

---

## 🔗 Integrate Nexus with Maven

### Step 1: Connect to Maven Server  
Where Java projects are available.

### Step 2: Update `pom.xml`
```xml
<distributionManagement>
  <repository>
    <id>nexus</id>
    <name>Nexus Releases Repository</name>
    <url>http://34.204.18.45:8081/repository/jio-release/</url>
  </repository>

  <snapshotRepository>
    <id>nexus</id>
    <name>Nexus Snapshot Repository</name>
    <url>http://34.204.18.45:8081/repository/jio-snapshot/</url>
  </snapshotRepository>
</distributionManagement>
```

### Step 3: Add Nexus Credentials  
In Maven settings file:
```xml
# /opt/apache-maven-3.9.10/conf/settings.xml

<server>
  <id>nexus</id>
  <username>admin</username>
  <password>Nexus@123</password>
</server>
```

---

## 📦 Deploy Artifact to Nexus

### Step 1: Go to Project Directory
```bash
cd /path/to/project
```

### Step 2: Deploy
```bash
mvn clean deploy
```

> ⚠️ Each execution of `mvn clean deploy` uploads the WAR file to **snapshot repository**.

---

## ❓ Why Always Uploads to Snapshot Repo?

Because the `<version>` tag in `pom.xml` includes `SNAPSHOT`.  
If removed:
```xml
<version>1.0.0</version>
```
then it deploys to the **release repository**.

> 🛑 Once a version is created, it cannot be redeployed unless redeploy is enabled.

Enable redeploy:
```
Settings → Repository → Allow redeploy → Save
```

Then run again:
```bash
mvn clean deploy
```

---

## ⚖️ Difference Between Snapshot and Release

| Type | Usage |
|------|--------|
| **Snapshot** | Used for continuous/integration builds |
| **Release** | Used for production deployment |

---

## 🏠 Maven Local vs Remote Deployment

| Command | Description |
|----------|--------------|
| `mvn clean install` | Store in local repository |
| `mvn clean deploy` | Store in remote Nexus repository |

---

## 🔁 Redeployment of Artifacts

By default, redeployment is **disabled**.  
To enable:
1. Go to repository **Settings**.  
2. Enable **Allow redeploy**.  
3. Run:
   ```bash
   mvn clean deploy
   ```

---
💡 **End of Document**
---
📘 **Author:** Munagala Harish  
📅 **Title:** *Nexus Repository - Installation and Integration Guide*  
