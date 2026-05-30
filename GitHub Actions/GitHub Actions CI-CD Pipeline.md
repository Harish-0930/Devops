# GitHub Actions CI/CD Pipeline Documentation

## Overview

This GitHub Actions workflow automates the complete CI/CD process for a Java Maven application. The pipeline performs the following tasks:

1. Build the application using Maven.
2. Deploy the generated WAR file to Apache Tomcat.
3. Run SonarQube code quality analysis.
4. Perform security scanning using Trivy.
5. Build a Docker image.
6. Run the Docker container.

The workflow is manually triggered using **workflow_dispatch** and runs on a **self-hosted runner**.

```
name: Build Deploy and SonarQube

on:
  workflow_dispatch:

jobs:

  build:
    name: Build and Deploy
    runs-on: self-hosted

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: 17
          cache: maven

      - name: Install Maven
        run: sudo yum install maven -y

      - name: Build WAR
        run: mvn -B clean package

      - name: Deploy WAR to Tomcat
        env:
          TOMCAT_URL: ${{ secrets.TOMCAT_URL }}
          TOMCAT_USER: ${{ secrets.TOMCAT_USER }}
          TOMCAT_PASSWORD: ${{ secrets.TOMCAT_PASSWORD }}

        run: |
          WAR=$(ls target/*.war | head -n 1)

          echo "WAR FILE: $WAR"
          echo "Deploying to: $TOMCAT_URL"

          curl -v -u "${TOMCAT_USER}:${TOMCAT_PASSWORD}" \
          --upload-file "$WAR" \
          "${TOMCAT_URL}/manager/text/deploy?path=/ecommerce-app&update=true"



    
  sonarqube:
    name: SonarQube Analysis
    runs-on: self-hosted
    needs: build

    steps:
      - name: Clear Sonar Cache
        run: rm -rf ~/.sonar/cache

      - name: Run SonarQube Scan
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}

        run: |
          mvn sonar:sonar \
          -Dsonar.projectKey=ecommerce-app \
          -Dsonar.host.url=$SONAR_HOST_URL \
          -Dsonar.login=$SONAR_TOKEN
  security-check:
    runs-on: self-hosted
    needs: sonarqube
    steps:
      - name: Install Trivy
        run: |
          curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sudo sh -s -- -b /usr/local/bin

      - name: Trivy FS Scan
        run: trivy fs --format table -o fs-report.json .
  docker-build:
    runs-on: self-hosted
    needs: security-check
    steps:
      - name: Build Docker Image
        run: |
          docker build -t ${{ secrets.Docker_Repository }}:${{ github.sha }} .
      - name: Run Docker Container
        run: |
          docker run -d \
           --name my_app_container \
           -p 8080:8080 \
           ${{secrets.Docker_Repository}}:${{github.sha}} 
```

---

# Workflow Structure

```yaml
name: Build Deploy and SonarQube

on:
  workflow_dispatch:
```

### Explanation

* **name**: Defines the workflow name displayed in GitHub Actions.
* **workflow_dispatch**: Allows manual execution of the workflow from the GitHub Actions UI.

---

# Job 1: Build and Deploy

```yaml
build:
  name: Build and Deploy
  runs-on: self-hosted
```

### Purpose

This job performs:

* Source code checkout
* Java setup
* Maven installation
* Application build
* Deployment to Tomcat

---

## Step 1: Checkout Source Code

```yaml
- name: Checkout Code
  uses: actions/checkout@v4
```

### Purpose

Downloads the latest repository code onto the self-hosted runner.

---

## Step 2: Setup Java

```yaml
- name: Setup Java
  uses: actions/setup-java@v4
  with:
    distribution: temurin
    java-version: 17
    cache: maven
```

### Purpose

Installs Java 17 using Eclipse Temurin distribution.

### Configuration

| Parameter    | Value   |
| ------------ | ------- |
| distribution | temurin |
| java-version | 17      |
| cache        | maven   |

### Benefits

* Faster builds through Maven dependency caching.
* Consistent Java environment across executions.

---

## Step 3: Install Maven

```yaml
- name: Install Maven
  run: sudo yum install maven -y
```

### Purpose

Installs Maven on the self-hosted runner.

### Command Breakdown

```bash
sudo yum install maven -y
```

| Option  | Description               |
| ------- | ------------------------- |
| yum     | Package manager           |
| install | Install package           |
| maven   | Maven package             |
| -y      | Auto confirm installation |

---

## Step 4: Build WAR File

```yaml
- name: Build WAR
  run: mvn -B clean package
```

### Purpose

Builds the application and generates a WAR file.

### Command Breakdown

```bash
mvn -B clean package
```

| Goal    | Description                      |
| ------- | -------------------------------- |
| clean   | Removes previous build artifacts |
| package | Creates deployable WAR file      |
| -B      | Batch mode                       |

### Output

```text
target/*.war
```

Example:

```text
target/ecommerce-app.war
```

---

## Step 5: Deploy WAR to Tomcat

```yaml
- name: Deploy WAR to Tomcat
```

### Environment Variables

```yaml
env:
  TOMCAT_URL: ${{ secrets.TOMCAT_URL }}
  TOMCAT_USER: ${{ secrets.TOMCAT_USER }}
  TOMCAT_PASSWORD: ${{ secrets.TOMCAT_PASSWORD }}
```

### GitHub Secrets Used

| Secret          | Description             |
| --------------- | ----------------------- |
| TOMCAT_URL      | Tomcat server URL       |
| TOMCAT_USER     | Tomcat Manager username |
| TOMCAT_PASSWORD | Tomcat Manager password |

---

### Deployment Script

```bash
WAR=$(ls target/*.war | head -n 1)

echo "WAR FILE: $WAR"
echo "Deploying to: $TOMCAT_URL"

curl -v -u "${TOMCAT_USER}:${TOMCAT_PASSWORD}" \
--upload-file "$WAR" \
"${TOMCAT_URL}/manager/text/deploy?path=/ecommerce-app&update=true"
```

### How It Works

#### Locate WAR File

```bash
WAR=$(ls target/*.war | head -n 1)
```

Finds the generated WAR file.

---

#### Upload to Tomcat

```bash
curl -v -u username:password \
--upload-file app.war \
http://server:8080/manager/text/deploy
```

### Tomcat Manager Parameters

| Parameter   | Purpose                       |
| ----------- | ----------------------------- |
| path        | Context path                  |
| update=true | Redeploy existing application |

### Deployment Result

Application becomes available at:

```text
http://<server>:8080/ecommerce-app
```

---

# Job 2: SonarQube Analysis

```yaml
sonarqube:
  name: SonarQube Analysis
  runs-on: self-hosted
  needs: build
```

### Dependency

```yaml
needs: build
```

This job runs only after a successful build and deployment.

---

## Step 1: Clear Sonar Cache

```yaml
- name: Clear Sonar Cache
  run: rm -rf ~/.sonar/cache
```

### Purpose

Removes old SonarQube plugin cache to prevent plugin-related issues.

---

## Step 2: Run SonarQube Scan

```yaml
mvn sonar:sonar \
-Dsonar.projectKey=ecommerce-app \
-Dsonar.host.url=$SONAR_HOST_URL \
-Dsonar.login=$SONAR_TOKEN
```

### GitHub Secrets

| Secret         | Purpose              |
| -------------- | -------------------- |
| SONAR_HOST_URL | SonarQube Server URL |
| SONAR_TOKEN    | Authentication Token |

### Analysis Performed

* Bugs
* Vulnerabilities
* Code Smells
* Duplications
* Coverage Metrics

### Result

Reports are available in SonarQube Dashboard.

---

# Job 3: Security Check

```yaml
security-check:
  runs-on: self-hosted
  needs: sonarqube
```

### Dependency

Runs only after successful SonarQube analysis.

---

## Step 1: Install Trivy

```yaml
curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sudo sh -s -- -b /usr/local/bin
```

### Purpose

Downloads and installs Trivy vulnerability scanner.

---

## Step 2: Filesystem Scan

```yaml
trivy fs --format table -o fs-report.json .
```

### Purpose

Scans the repository filesystem for:

* Vulnerabilities
* Misconfigurations
* Secrets
* Dependency Issues

### Output

```text
fs-report.json
```

---

# Job 4: Docker Build and Run

```yaml
docker-build:
  runs-on: self-hosted
  needs: security-check
```

### Dependency

Runs only after successful security scanning.

---

## Step 1: Build Docker Image

```yaml
docker build -t ${{ secrets.Docker_Repository }}:${{ github.sha }} .
```

### Components

| Variable          | Description            |
| ----------------- | ---------------------- |
| Docker_Repository | Docker repository name |
| github.sha        | Current commit hash    |

### Example

```bash
docker build -t ecommerce-app:7f1ab45 .
```

### Benefits

Every image gets a unique version tag.

---

## Step 2: Run Docker Container

```yaml
docker run -d \
--name my_app_container \
-p 8080:8080 \
${{ secrets.Docker_Repository }}:${{ github.sha }}
```

### Parameters

| Parameter    | Purpose        |
| ------------ | -------------- |
| -d           | Detached mode  |
| --name       | Container name |
| -p 8080:8080 | Port mapping   |

### Result

Container runs in the background.

Application becomes accessible at:

```text
http://<server-ip>:8080
```

---

# Complete Pipeline Flow

```text
┌─────────────────────┐
│ Workflow Dispatch   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Build WAR           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Deploy to Tomcat    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ SonarQube Analysis  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Trivy Security Scan │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Docker Build        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Docker Run          │
└─────────────────────┘
```

---

# Required GitHub Secrets

Configure the following repository secrets before running the workflow:

| Secret Name       | Purpose                        |
| ----------------- | ------------------------------ |
| TOMCAT_URL        | Tomcat Manager URL             |
| TOMCAT_USER       | Tomcat Username                |
| TOMCAT_PASSWORD   | Tomcat Password                |
| SONAR_HOST_URL    | SonarQube Server URL           |
| SONAR_TOKEN       | SonarQube Authentication Token |
| Docker_Repository | Docker Repository/Image Name   |

---

# Key Benefits

* Fully automated CI/CD pipeline.
* Manual execution support through GitHub Actions UI.
* Automated Tomcat deployment.
* SonarQube code quality validation.
* Trivy security scanning.
* Docker image creation and deployment.
* Sequential execution using `needs` dependencies.
* Secure credential management using GitHub Secrets.
