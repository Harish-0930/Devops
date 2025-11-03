# SonarQube 9.6.1 Installation on RHEL 10 (EC2 t2.medium)

This guide outlines the step-by-step process to install SonarQube 9.6.1 on a Red Hat Enterprise Linux 10 EC2 instance.

---

## Prerequisites

- EC2 Instance: `t2.medium` (4 GB RAM minimum)
- OS: Red Hat Enterprise Linux 10
- Open Ports:
  - `22` for SSH
  - `9000` for SonarQube web interface
- Internet access (to download packages)

---

## 1. Connect to EC2

```bash
ssh -i your-key.pem ec2-user@<your-ec2-public-ip>
````

---

## 2. Switch to Root

```bash
sudo su -
```

---

## 3. Fix Time Sync (Avoid GPG Errors)

```bash
timedatectl set-ntp true
timedatectl set-timezone UTC
systemctl restart chronyd || systemctl restart systemd-timesyncd
timedatectl   # Confirm NTP is synchronized
```

---

## 4. Install Java 17 (Amazon Corretto)

```bash
rpm --import https://yum.corretto.aws/corretto.key
curl -Lo /etc/yum.repos.d/corretto.repo https://yum.corretto.aws/corretto.repo
yum install -y java-17-amazon-corretto-devel --nogpgcheck
```

---

## 5. Set Java 17 as Default

```bash
alternatives --config java
```

Select the option for Java 17 (e.g., `/usr/lib/jvm/java-17-amazon-corretto/bin/java`)

---

## 6. Set Required Kernel Parameters

```bash
sysctl -w vm.max_map_count=262144
echo 'vm.max_map_count=262144' >> /etc/sysctl.conf
```

---

## 7. Install Required Packages

```bash
yum install wget unzip -y
```

---

## 8. Download and Extract SonarQube

```bash
cd /opt
wget https://binaries.sonarsource.com/Distribution/sonarqube/sonarqube-9.6.1.59531.zip
unzip sonarqube-9.6.1.59531.zip
mv sonarqube-9.6.1.59531 sonarqube
```

---

## 9. Create a Dedicated User

```bash
useradd sonar
echo 'sonar   ALL=(ALL)       NOPASSWD: ALL' >> /etc/sudoers
chown -R sonar:sonar /opt/sonarqube
chmod -R 775 /opt/sonarqube
```

---

## 10. Configure Environment for `sonar` User

```bash
su - sonar
```

Add to `~/.bashrc`:

```bash
echo 'export JAVA_HOME=/usr/lib/jvm/java-17-amazon-corretto' >> ~/.bashrc
echo 'export PATH=$JAVA_HOME/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

Verify:

```bash
java -version
```

Should return Java 17.

---

## 11. Start SonarQube

```bash
cd /opt/sonarqube/bin/linux-x86-64/
sh sonar.sh start
sh sonar.sh status
```

---

## 12. Access SonarQube

Open in a browser:

```
http://<your-ec2-public-ip>:9000
```

Default credentials:

* Username: `admin`
* Password: `admin`

---

## Optional: Troubleshooting

If SonarQube does not start, check logs:

```bash
tail -n 100 /opt/sonarqube/logs/sonar.log
tail -n 100 /opt/sonarqube/logs/es.log
```

---

## Notes

* SonarQube should not be run as root.
* Ensure you are not using Java 21 or newer — Java 17 is recommended for SonarQube 9.6.1.
* SonarQube will not start if memory is insufficient or `vm.max_map_count` is not configured.

---
# End Of Document
---

📘 **Author:** Munagala Harish  
📅 **Title:** *SonarQube 9.6.1 Installation on RHEL 10 (EC2 t2.medium)*  
