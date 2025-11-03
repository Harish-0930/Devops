# 🐱 Apache Tomcat – Installation & Configuration Guide

## 🚀 How to Run JAR/WAR/EAR Files

| File Type | Command / Requirement |
|------------|-----------------------|
| **JAR** | `java -jar <filename>.jar` |
| **WAR** | Requires **Tomcat** (Application Server) |
| **EAR** | Requires **WildFly** (Application Server) |

---

## 🏗️ Tomcat Server Overview

**Definition:**  
Tomcat (or Apache Tomcat) is an open-source web container used to deploy and run Java-based web applications.  
Developed by the **Apache Software Foundation (ASF)**.

---

## ⚙️ Types of Application Servers

1. **Apache Tomcat** → Deploys only `.war` files (not `.ear` files)  
2. **JBoss / WildFly**  
   - Versions 1.x to 7.x → JBoss  
   - Versions 8.x → WildFly  
3. **WebSphere Application Server** → IBM  
4. **WebLogic** → Oracle  
5. **GlassFish** → Open Source

---

## 💡 Interview Question

**Q:** Why do we use Tomcat as an application server?  
**A:** Most modern projects are developed using **microservice architecture**. In Java, microservices are built using the **Spring Boot framework**, whose **default embedded server is Tomcat**.

**Q:** What is the difference between Tomcat and JBoss/WildFly?  
**A:** Tomcat is mainly used for **web applications**, whereas **JBoss/WildFly** supports **enterprise applications** as well.

---

## 📁 Tomcat Directory Structure

| Directory | Description |
|------------|-------------|
| **bin** | Contains startup and shutdown scripts |
| **conf** | Configuration files (`server.xml`, `tomcat-users.xml`) |
| **lib** | All required JARs for runtime |
| **logs** | Contains logs like `catalina.log`, `manager.log`, etc. |
| **webapps** | Deployment directory for `.war` files |
| **work** | Temporary files created after deployment |
| **temp** | Stores temporary runtime files |

---

## 🔧 Important Files

### 1️⃣ bin/
```bash
startup.sh     # Linux/Mac - Start Tomcat
startup.bat    # Windows
shutdown.sh    # Stop Tomcat (Linux/Mac)
shutdown.bat   # Stop Tomcat (Windows)
catalina.sh start/stop/restart
```

### 2️⃣ conf/
- `server.xml`  
- `tomcat-users.xml`

### 3️⃣ logs/
Once the server is started, the following logs will be created:
```
catalina.log
host-manager.log
manager.log
localhost.log
```

### 4️⃣ webapps/
Default web applications:
```
ROOT/
manager/
host-manager/
examples/
docs/
```

---

## 🖥️ Tomcat Installation Guide (on Linux / EC2)

### 🧩 Prerequisites

- **Java 1.8+** required for Tomcat 9.x  
- Minimum **1 GB RAM**  
- EC2 instance with Linux (Amazon Linux 2 preferred)

### 🪜 Installation Steps

```bash
# Step 1: Connect to EC2 instance
ssh -i <your-key>.pem ec2-user@<your-public-ip>

# Step 2: Switch to root
sudo su -

# Step 3: Install Java
sudo yum search java | grep OpenJDK
sudo yum install java-21-openjdk-devel -y
java -version

# Step 4: Install required packages
sudo yum install wget unzip tree -y

# Step 5: Go to /opt directory
cd /opt/

# Step 6: Download Tomcat
wget https://dlcdn.apache.org/tomcat/tomcat-9/v9.0.109/bin/apache-tomcat-9.0.109.zip

# Step 7: Unzip the file
unzip apache-tomcat-9.0.109.zip

# Step 8: Go to bin folder
cd /opt/apache-tomcat-9.0.109/bin

# Step 9: Give execution permission
chmod u+x *.sh
```

---

## ▶️ Start / Stop Tomcat Server

```bash
# Start
sh startup.sh
# or
sh catalina.sh start

# Stop
sh shutdown.sh
# or
sh catalina.sh stop
```

> 🧠 **Default Port:** `8080`  
> **TCP Port Range:** `0 – 65535`

---

## 🩺 Check if Tomcat is Running

```bash
sudo yum install lsof -y
lsof -i :8080
ps -ef | grep -i "tomcat"
```

---

## 🌍 Start/Stop Tomcat from Anywhere

```bash
ln -s /opt/apache-tomcat-9.0.109/bin/startup.sh /usr/bin/startTomcat
ln -s /opt/apache-tomcat-9.0.109/bin/shutdown.sh /usr/bin/stopTomcat
```
Now you can use:
```bash
startTomcat
stopTomcat
```

---

## 🔓 Accessing Tomcat from Browser

By default, Tomcat runs on **port 8080**.  
Open it in your browser using:

```
http://<Public-IP>:8080
```

If it doesn’t open:
- Go to your EC2 **Security Group**
- Edit **Inbound Rules**
- Add rule: **Custom TCP | Port 8080 | Source: 0.0.0.0/0 (Anywhere)**

Then reload the URL.

---

## 🧭 Enabling Manager & Host Manager Access

### Step 1: Modify Manager Context
```bash
cd /opt/apache-tomcat-9.0.109/webapps/manager/META-INF
vi context.xml
# Comment out the 21st and 22nd lines
<!--
   <Valve className="org.apache.catalina.valves.RemoteAddrValve"
          allow="127\.\d+\.\d+\.\d+|::1" />
-->
```

### Step 2: Add User Credentials
```bash
cd /opt/apache-tomcat-9.0.109/conf/
vi tomcat-users.xml

<user username="admin" password="*******" roles="manager-gui,admin-gui"/>
<user username="mahesh" password="*******" roles="manager-gui,admin-gui"/>
```

### Step 3: Modify Host Manager (if required)
```bash
cd /opt/apache-tomcat-9.0.109/webapps/host-manager/META-INF
vi context.xml
# Comment the same 21st and 22nd lines
```

Then refresh the main page → it will prompt for credentials.

---

## 🧾 Log Verification

To confirm logs are being generated:
```bash
cd /opt/apache-tomcat-9.0.109/logs
ls
```

You should see:
```
catalina.out
localhost.log
manager.log
host-manager.log
```

---

## ✅ Summary

| Command | Description |
|----------|-------------|
| `sh startup.sh` | Start Tomcat |
| `sh shutdown.sh` | Stop Tomcat |
| `lsof -i :8080` | Check running status |
| `ln -s` | Create shortcuts for global access |
| `vi tomcat-users.xml` | Configure user roles |

---

**🧠 Pro Tip:** Always verify logs after starting Tomcat to ensure the deployment is successful.  
**📘 Recommended:** Use **Tomcat 9.x or 10.x** for Spring Boot microservice projects.

---
End of Document
---

📘 **Author:** Munagala Harish  
📅 **Title:** *Apache Tomcat – Installation & Configuration Guide*  
