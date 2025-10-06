# ☁️ AWS Services Comprehensive Notes

A complete and well-structured guide covering major AWS services, ideal for quick reference, learning, or GitHub documentation.

---

## 🗺️ Global AWS Services

- **Route 53** – DNS and domain management service.
- **CloudFront (CDN)** – Content delivery network for low latency.
- **S3 Transfer Acceleration** – Faster data upload to S3 buckets.
- **AWS Global Accelerator** – Improves availability and performance.

### IP Addressing
- **IPv4:** 4.3 billion addresses.
- **IPv6:** 3.4 × 10³⁸ addresses.

### Instance Types
| Type | Description | Examples |
|------|--------------|-----------|
| General Purpose | Balanced compute, memory, and network | M1, M2, M3, M4, T1, T2 |
| Compute Optimized | High-performance processors | C1, C3, C4 |
| Memory Optimized | Large memory workloads | R3, R4, X1, X1e |
| Storage Optimized | High storage throughput | D2, H1, I2, I3 |
| Accelerated Computing | GPU and FPGA instances | F1, G3, P2, P3 |

---

## 📊 Monitoring & Management

### **AWS CloudWatch**
- Monitoring and observability for AWS resources.
- Collects metrics, logs, and events.
- Can trigger alarms for performance issues.

### **AWS CloudTrail**
- Auditing and user activity logging.
- Records API calls and user actions.
- Helps in security and compliance.

### **AWS Config**
- Configuration management and compliance tracking.
- Continuously monitors configuration changes.
- Can trigger automatic remediation.

### **AWS CloudFormation**
- Infrastructure as Code (IaC) using YAML/JSON templates.
- Automates resource provisioning.
- Simplifies environment deployment.

---

## 🗄️ AWS Storage Services

### **Amazon S3** (Simple Storage Service)
- Object storage service with automatic scaling.
- Data stored as **objects in buckets**.

**Features:**
- **Versioning:** Keeps multiple versions of an object.
- **Replication:** Automatically copies objects across regions.
  - SRR (Same Region Replication)
  - CRR (Cross Region Replication)

**Use Cases:** Backup, disaster recovery, compliance, and performance optimization.

### **Amazon EFS (Elastic File System)**
- Shared file storage that auto-scales.
- Accessible by multiple EC2 or Lambda instances.

### **AWS Storage Gateway**
- Hybrid storage linking on-premises and AWS.
- Types:
  - **File Gateway (NFS/SMB)** – Access S3 as files.
  - **Tape Gateway (VTL)** – Virtual tapes.
  - **Volume Gateway (iSCSI)** – Block storage.

---

## 💾 Databases

### **Amazon RDS** – Managed Relational Database Service
- Supports MySQL, PostgreSQL, MariaDB, Oracle, SQL Server.
- Automates backups, patching, and scaling.

### **Amazon DynamoDB** – Managed NoSQL Database
- Scales automatically; single-digit millisecond latency.
- **DAX (DynamoDB Accelerator):** In-memory caching for microsecond latency.

### **Amazon Aurora**
- AWS proprietary database compatible with MySQL & PostgreSQL.
- Up to **5x faster** than MySQL, **3x faster** than PostgreSQL.
- Auto storage scaling up to 128TB.

### **Amazon Redshift** – Data Warehouse
- OLAP system for analytics; based on PostgreSQL.
- Supports PB-scale data storage.

### **Amazon ElastiCache**
- Managed **Redis** or **Memcached**.
- Improves application performance with in-memory caching.

---

## 🔍 Analytics & Big Data

- **Amazon EMR** – Big data processing using Hadoop/Spark.
- **Amazon Athena** – Serverless SQL querying on S3 data.
- **Amazon QuickSight** – Business Intelligence dashboards.
- **AWS Glue** – ETL (Extract, Transform, Load) service.
- **Amazon Timestream** – Time-series database.
- **Amazon QLDB** – Immutable, cryptographically verifiable ledger DB.

---

## ⚙️ Compute Services

### **Amazon EC2** – Elastic Compute Cloud
- Virtual machines in the cloud.

### **AWS Lambda** – Serverless compute
- Pay per request; scales automatically.
- Supports Node.js, Python, Java, C#.
- Up to 10GB RAM per function.

### **Elastic Beanstalk**
- PaaS for deploying applications without managing infra.
- Supports Java, .NET, Node.js, Python, Ruby, PHP, Go.

### **AWS Batch**
- Managed batch job service.
- Automatically provisions EC2 or Spot Instances.

### **Amazon Lightsail**
- Simple cloud hosting for small apps and websites.

---

## 🐳 Containers & Kubernetes

- **Amazon ECR** – Elastic Container Registry (stores images).
- **Amazon ECS** – Elastic Container Service (container orchestration).
- **AWS Fargate** – Serverless container hosting.
- **Amazon EKS** – Elastic Kubernetes Service (managed K8s clusters).

---

## 🌐 Networking & Connectivity

- **Elastic Load Balancers (ELB):** Distribute incoming traffic.
  - Application, Network, and Gateway Load Balancers.
- **VPC Endpoints:** Private connections to S3 and DynamoDB.
- **AWS Direct Connect:** Dedicated private connection to AWS.
- **Site-to-Site VPN:** Encrypted internet-based connectivity.
- **Transit Gateway:** Central hub for VPC and on-premise networks.

---

## 🧠 AI & Machine Learning

- **Amazon Rekognition:** Image and video analysis.
- **Amazon Polly:** Text-to-speech conversion.
- **Amazon Transcribe:** Speech-to-text.
- **Amazon Translate:** Language translation.
- **Amazon Comprehend:** Text analysis and insights.
- **Amazon SageMaker:** Build, train, and deploy ML models.
- **Amazon Kendra:** Intelligent document search.

---

## 🔐 Security, Identity & Compliance

- **AWS IAM:** Identity and Access Management.
- **AWS Cognito:** User authentication for web/mobile apps.
- **AWS KMS:** Key management for encryption.
- **AWS Secrets Manager:** Manage sensitive credentials.
- **AWS Shield:** DDoS protection (Standard & Advanced).
- **AWS WAF:** Web Application Firewall.
- **AWS GuardDuty:** Threat detection using ML.
- **AWS Inspector:** Vulnerability management.
- **AWS Detective:** Root-cause analysis for security issues.
- **Amazon Macie:** Sensitive data discovery in S3.

---

## 🧰 Developer & Management Tools

- **AWS Systems Manager:** Automate maintenance and patching.
- **AWS Trusted Advisor:** Best-practice recommendations.
- **AWS CodeGuru:** ML-powered code reviews and performance analysis.
- **AWS Cloud9:** Cloud-based IDE.
- **AWS OpsWorks:** Infrastructure automation with Chef/Puppet.

---

## ☁️ Migration & Hybrid Services

- **AWS Snowball / Snowball Edge:** Physical devices for data transfer.
- **AWS DMS:** Database Migration Service.
- **AWS Server Migration Service:** Move VMs to AWS.
- **AWS Elastic Disaster Recovery (DRS):** Rapid recovery solution.

---

## 🏗️ Architecture & Best Practices

### **AWS Well-Architected Framework – 6 Pillars**
1. Operational Excellence
2. Security
3. Reliability
4. Performance Efficiency
5. Cost Optimization
6. Sustainability

### **AWS Cloud Adoption Framework (CAF)**
- Perspectives: Business, People, Governance, Platform, Security, Operations.

### **7R’s Cloud Migration Strategies**
Retire | Retain | Relocate | Rehost | Replatform | Repurchase | Refactor

---

## 🌱 Sustainability & Cost Optimization
- **AWS Carbon Footprint Tool:** Track and forecast your carbon emissions.
- **AWS Cost Explorer:** Visualize and manage AWS spending.

---

## 🤝 Enterprise & Support

- **AWS IQ:** Connects users with certified AWS experts.
- **AWS Managed Services (AMS):** 24/7 infrastructure management.
- **Concierge Support Team:** Available with Enterprise Support plan.
- **AWS Partner Solutions:** Prebuilt third-party architectures.

---

### 🧾 Shared Responsibility Model (Example – S3)

| Managed by AWS | Managed by User |
|----------------|----------------|
| Global infrastructure | S3 versioning |
| Compliance validation | Bucket policies |
| Configuration analysis | Logging & monitoring |
| Availability & durability | Encryption at rest & transit |

---

## 🛰️ Specialized Services

- **AWS Ground Station:** Control satellite communications.
- **AWS Wavelength:** Brings AWS to edge 5G networks.
- **Amazon Pinpoint:** Multi-channel marketing communication.
- **Amazon Workspaces:** Managed virtual desktops.
- **AWS Device Farm:** App testing on real devices.

---

### ✅ Summary
This document serves as a single-stop AWS reference guide for understanding, revising, or documenting core AWS services for learning, interviews, or GitHub display.

---

**📘 Author:** Compiled and formatted by Harish Munagala  
**🎯 Purpose:** GitHub-ready AWS technical knowledge base

