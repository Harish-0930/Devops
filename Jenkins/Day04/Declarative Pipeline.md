# Jenkins Declarative Pipeline: Build, Push & Deploy a Flask App

---

## Table of Contents

1. [What is a Jenkins Pipeline & Why Use It?](#1-what-is-a-jenkins-pipeline--why-use-it)
2. [Types of Pipelines](#2-types-of-pipelines)
3. [Scripted vs Declarative — When to Use What](#3-scripted-vs-declarative--when-to-use-what)
4. [Pipeline Syntax Deep Dive](#4-pipeline-syntax-deep-dive)
5. [Useful Companion Blocks](#5-useful-companion-blocks)
6. [Creating a Pipeline in Jenkins](#6-creating-a-pipeline-in-jenkins)
7. [Snippet Generator](#7-snippet-generator)
8. [The `environment {}` Block](#8-the-environment--block)
9. [Running a Pipeline with SCM (Jenkinsfile from Git)](#9-running-a-pipeline-with-scm-jenkinsfile-from-git)
10. [Full Jenkinsfile — Block-by-Block Explanation](#10-full-jenkinsfile--block-by-block-explanation)
11. [The `post {}` Block](#11-the-post--block)
12. [Generate & Archive `deploy-info.txt`](#12-generate--archive-deploy-infotxt)
13. [Summary](#13-summary)

---

## 1. What is a Jenkins Pipeline & Why Use It?

### What

A **Jenkins Pipeline** is a suite of plugins that lets you define your entire CI/CD process — build, test, push, deploy — as **code** stored in a file called `Jenkinsfile`, committed alongside your application source.

Instead of clicking through the Jenkins UI to configure build steps (as in a Freestyle job), you write a script that Jenkins reads and executes.

```
Without Pipeline (Freestyle)          With Pipeline (Jenkinsfile)
──────────────────────────────         ──────────────────────────────
Jenkins UI → click → click → click     Git repo → Jenkinsfile → Jenkins reads & runs
Config lives in Jenkins only           Config lives in your repo, versioned with code
Hard to review, diff, or reuse         PR-reviewable, branchable, reusable
```

### Why

| Problem with Freestyle | How Pipeline Solves It |
|---|---|
| Build config lives only in Jenkins UI | Jenkinsfile lives in Git — versioned, auditable |
| No way to branch your CI logic | Each branch can have its own Jenkinsfile |
| Hard to reproduce builds | Code defines the pipeline exactly |
| No conditional logic between steps | Full programmatic control with `when`, `script` |
| Secrets scattered across jobs | Centralised `withCredentials` / `environment` |
| Multi-stage visibility is poor | Pipeline view shows each stage pass/fail at a glance |

---

## 2. Types of Pipelines

Jenkins offers two pipeline syntaxes and one organisational construct:

### A) Declarative Pipeline

The modern, **recommended** approach. Structured, opinionated, easier to read. Uses a fixed set of sections (`pipeline`, `agent`, `stages`, `steps`, `post`).

```groovy
pipeline {
    agent any
    stages {
        stage('Build') {
            steps {
                sh 'make build'
            }
        }
    }
}
```

### B) Scripted Pipeline

The original approach. Written in full **Groovy** — flexible but verbose, no enforced structure. Every step is inside a `node {}` block.

```groovy
node {
    stage('Build') {
        sh 'make build'
    }
}
```

### C) Multibranch Pipeline

A project type (not a syntax) that **automatically creates a job for every branch** in your repo that contains a `Jenkinsfile`. Used for monorepos and feature-branch workflows.

```
repo/
├── main         → Jenkins creates job: my-app/main
├── feature/auth → Jenkins creates job: my-app/feature-auth
└── hotfix/bug   → Jenkins creates job: my-app/hotfix-bug
```

---

## 3. Scripted vs Declarative — When to Use What

### Sample — Scripted Pipeline

```groovy
node {
    def image = "myuser/flask-app"
    def tag   = "build-${env.BUILD_NUMBER}"

    stage('Checkout') {
        git branch: 'main',
            credentialsId: 'github-token',
            url: 'https://github.com/myuser/my-repo.git'
    }

    stage('Build') {
        sh "docker build -t ${image}:${tag} ."
    }

    stage('Push') {
        withCredentials([usernamePassword(
            credentialsId: 'dockerhub',
            usernameVariable: 'USER',
            passwordVariable: 'PASS'
        )]) {
            sh "echo $PASS | docker login -u $USER --password-stdin"
            sh "docker push ${image}:${tag}"
        }
    }

    stage('Deploy') {
        sh "docker rm -f flask-app || true"
        sh "docker run -d --name flask-app -p 5000:5000 ${image}:${tag}"
    }
}
```

### Sample — Declarative Pipeline

```groovy
pipeline {
    agent any
    environment {
        IMAGE = "myuser/flask-app"
        TAG   = "build-${BUILD_NUMBER}"
    }
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    credentialsId: 'github-token',
                    url: 'https://github.com/myuser/my-repo.git'
            }
        }
        stage('Build') {
            steps {
                sh 'docker build -t "$IMAGE:$TAG" .'
            }
        }
        stage('Push') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub',
                    usernameVariable: 'DOCKERHUB_USERNAME',
                    passwordVariable: 'DOCKERHUB_PASSWORD'
                )]) {
                    sh 'echo "$DOCKERHUB_PASSWORD" | docker login -u "$DOCKERHUB_USERNAME" --password-stdin'
                    sh 'docker push "$IMAGE:$TAG"'
                }
            }
        }
        stage('Deploy') {
            steps {
                sh 'docker rm -f flask-app || true'
                sh 'docker run -d --name flask-app -p 5000:5000 "$IMAGE:$TAG"'
            }
        }
    }
    post {
        success { echo "Pipeline succeeded!" }
        failure { echo "Pipeline failed." }
    }
}
```

### When to Use What

| Situation | Choose |
|---|---|
| New projects, team environments | **Declarative** — readable, enforced structure |
| Need full Groovy logic (loops, try/catch, dynamic stage names) | **Scripted** — total flexibility |
| Want Blue Ocean / Stage View UI | **Declarative** — maps directly to the visual pipeline |
| Legacy pipelines already written in Scripted | Keep **Scripted** — no need to rewrite |
| You need `script {}` inside Declarative for a few lines of logic | **Declarative** with embedded `script {}` block |

> **Rule of thumb:** Start Declarative. Drop into `script {}` for the 5% of cases where you need Groovy logic.

---

## 4. Pipeline Syntax Deep Dive

### Overall Structure

```
pipeline {                     ← required top-level wrapper
    agent  { ... }             ← WHERE to run
    environment { ... }        ← VARIABLES
    options { ... }            ← JOB-LEVEL SETTINGS
    parameters { ... }         ← USER INPUTS
    stages {                   ← ORDERED LIST OF STAGES
        stage('Name') {
            steps {            ← ACTUAL WORK
                sh '...'
            }
        }
    }
    post { ... }               ← CLEANUP / NOTIFICATIONS
}
```

---

### `pipeline { }`

The mandatory top-level block. Everything in a Declarative pipeline lives inside it. Jenkins refuses to parse the file if this is missing.

```groovy
pipeline {
    // all other blocks go here
}
```

---

### `agent`

Tells Jenkins **where** to run the pipeline (or a specific stage).

```groovy
// Run on any available Jenkins node/executor
agent any

// Run on a node tagged with the label 'docker'
agent { label 'docker' }

// Run inside a Docker container
agent {
    docker { image 'python:3.11-slim' }
}

// No global agent — each stage defines its own
agent none
```

| Value | Meaning |
|---|---|
| `any` | First available executor (built-in node or agent) |
| `label 'X'` | Only on nodes tagged with label X |
| `docker { image '...' }` | Spin up a container for each stage |
| `none` | No global agent; every `stage` must define its own `agent` |

---

### `stages { }` and `stage('Name') { }`

`stages` is the ordered container for all your `stage` blocks. Stages run **sequentially** by default. Each stage appears as a column in the Pipeline Stage View.

```groovy
stages {
    stage('Checkout') { ... }   // runs first
    stage('Build')    { ... }   // runs second
    stage('Push')     { ... }   // runs third
    stage('Deploy')   { ... }   // runs last
}
```

---

### `steps { }`

The actual commands inside each stage. Common step types:

```groovy
steps {
    sh 'docker build -t myapp .'          // run a shell command
    echo 'Build complete'                 // print to console log
    git url: 'https://github.com/...'    // SCM checkout
    archiveArtifacts artifacts: '*.txt'   // save files as build artifacts
    sleep 5                               // pause (seconds)

    script {                              // drop into Groovy for logic
        def result = sh(script: 'curl ...', returnStdout: true).trim()
        echo "Got: ${result}"
    }
}
```

---

## 5. Useful Companion Blocks

### `environment { }`

Defines environment variables available to all stages (or just one stage if declared inside it).

```groovy
environment {
    IMAGE = "myuser/flask-app"
    TAG   = "build-${BUILD_NUMBER}"   // BUILD_NUMBER is a Jenkins built-in variable
}
```

Access in shell: `$IMAGE`, `$TAG`
Access in Groovy: `env.IMAGE`, `env.TAG`

---

### `options { }`

Job-level settings applied before any stage runs.

```groovy
options {
    timeout(time: 30, unit: 'MINUTES')   // fail if the whole pipeline takes > 30 min
    timestamps()                          // prefix every log line with a timestamp
    buildDiscarder(logRotator(numToKeepStr: '10'))  // keep only last 10 builds
    disableConcurrentBuilds()             // prevent two runs at the same time
}
```

---

### `parameters { }`

Let users provide input when triggering a build manually.

```groovy
parameters {
    string(name: 'TAG', defaultValue: "${BUILD_NUMBER}", description: 'Image tag')
    booleanParam(name: 'SKIP_TESTS', defaultValue: false, description: 'Skip test stage?')
    choice(name: 'ENV', choices: ['dev', 'staging', 'prod'], description: 'Target environment')
}
```

Access in pipeline: `${params.TAG}`, `${params.SKIP_TESTS}`

---

### `post { }`

Runs **after** all stages complete, regardless of outcome. Used for notifications, cleanup, archiving.

```groovy
post {
    always   { echo "Pipeline finished" }           // runs every time
    success  { echo "All stages passed ✅" }
    failure  { echo "Something failed ❌" }
    unstable { echo "Tests had failures" }
    changed  { echo "Result changed from last run" }
}
```

---

### `when { }`

Conditionally run a stage based on branch, environment variable, or expression.

```groovy
stage('Deploy to Prod') {
    when {
        branch 'main'                         // only on main branch
    }
    steps { sh './deploy-prod.sh' }
}

stage('Integration Tests') {
    when {
        environment name: 'RUN_TESTS', value: 'true'
    }
    steps { sh './run-tests.sh' }
}
```

---

### `tools { }`

Auto-provisions a named tool (configured in Jenkins → Global Tool Configuration) for the pipeline run.

```groovy
tools {
    maven 'Maven-3.9'       // name as configured in Jenkins
    jdk   'OpenJDK-17'
}
```

After this, `mvn`, `java`, and `javac` are on the `PATH` for all stages.

---

## 6. Creating a Pipeline in Jenkins

### Step 1 — Create the Job

1. Jenkins dashboard → **New Item**
2. Enter a name (e.g., `flask-pipeline`)
3. Select **Pipeline** → **OK**

### Step 2 — Configure the Pipeline

Navigate to the **Pipeline** section at the bottom of the job config page. You have two options:

**Option A — Inline Script (paste directly)**

Select `Pipeline script` from the dropdown and paste your Jenkinsfile content into the text area.

**Option B — Pipeline from SCM (recommended)**

Select `Pipeline script from SCM`. Jenkins will read the `Jenkinsfile` from your Git repository on every build. This is the correct production approach.

### Step 3 — Pipeline Skeleton

Use this skeleton as a starting template for any new pipeline:

```groovy
pipeline {
    agent any

    environment {
        // Define reusable variables here
        APP_NAME = "my-app"
    }

    options {
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                // git step goes here
            }
        }

        stage('Build') {
            steps {
                echo 'Building...'
                sh 'echo "replace with build command"'
            }
        }

        stage('Test') {
            steps {
                echo 'Testing...'
                sh 'echo "replace with test command"'
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying...'
                sh 'echo "replace with deploy command"'
            }
        }

    }

    post {
        success { echo "Build ${env.BUILD_NUMBER} succeeded ✅" }
        failure { echo "Build ${env.BUILD_NUMBER} failed ❌" }
        always  { echo "Build ${env.BUILD_NUMBER} finished" }
    }
}
```

### Step 4 — Save and Run

1. Click **Save** at the bottom of the job config page.
2. Click **Build Now** in the left sidebar.
3. Click the build number that appears under **Build History**.
4. Click **Console Output** to watch the live log.
5. The **Stage View** panel on the job page shows each stage as a colour-coded column.

---

## 7. Snippet Generator

### What is It?

The **Snippet Generator** is a built-in Jenkins tool that generates the correct pipeline step syntax for any installed plugin — without memorising syntax. It is especially useful for `git` checkout steps and credential injection.

### How to Access

```
Jenkins Job → Pipeline Syntax  (left sidebar link, only visible on Pipeline jobs)
```

Or directly: `http://<jenkins-url>/job/<job-name>/pipeline-syntax/`

---

### Using Snippet Generator: Git Checkout

1. Open **Pipeline Syntax** → ensure **Snippet Generator** tab is selected.
2. In the **Sample Step** dropdown, select `git: Git`.
3. Fill in:
   - **Repository URL:** `https://github.com/youruser/your-repo.git`
   - **Branch:** `main`
   - **Credentials:** select `github-pat` (the credential you added earlier)
4. Click **Generate Pipeline Script**.
5. Output:

```groovy
git branch: 'main', credentialsId: 'github-pat', url: 'https://github.com/youruser/your-repo.git'
```

Copy this directly into your `steps {}` block.

---

### Using Snippet Generator: Docker Hub Login (withCredentials)

Credentials should **always** be stored in Jenkins and injected — never hard-coded in shell steps.

**Store the credential first:**

Jenkins → **Manage Jenkins** → **Credentials** → **System** → **Global** → **Add Credentials**

| Field | Value |
|---|---|
| Kind | Username with password |
| Username | Your Docker Hub username |
| Password | Your Docker Hub password or access token |
| ID | `dockerhub` |

**Generate the step:**

1. Open **Pipeline Syntax** → **Snippet Generator**.
2. Sample Step: `withCredentials: Bind credentials to variables`.
3. Click **Add** → **Username and password (separated)**.
4. Select credential: `dockerhub`
5. Set Username Variable: `DOCKERHUB_USERNAME`
6. Set Password Variable: `DOCKERHUB_PASSWORD`
7. Click **Generate Pipeline Script**.
8. Output:

```groovy
withCredentials([usernamePassword(
    credentialsId: 'dockerhub',
    passwordVariable: 'DOCKERHUB_PASSWORD',
    usernameVariable: 'DOCKERHUB_USERNAME'
)]) {
    sh 'echo "$DOCKERHUB_PASSWORD" | docker login -u "$DOCKERHUB_USERNAME" --password-stdin'
    sh 'docker push "$IMAGE:$TAG"'
}
```

> `--password-stdin` pipes the password via stdin so it never appears in the process list or shell history.

---

## 8. The `environment {}` Block

### How It Works

Variables declared in `environment {}` are set as **OS environment variables** before any stage runs. They are available to all `sh` steps (as `$VAR`) and to Groovy code (as `env.VAR`).

```groovy
environment {
    IMAGE = "harish0930/flask-app"
    TAG   = "${BUILD_NUMBER}"
}
```

`BUILD_NUMBER` is one of Jenkins' built-in variables — it increments with every build, giving each image a unique, traceable tag.

### Built-in Jenkins Variables Available in `environment {}`

| Variable | Value |
|---|---|
| `BUILD_NUMBER` | Current build number (1, 2, 3…) |
| `BUILD_URL` | Full URL to this build |
| `GIT_COMMIT` | Full SHA of the checked-out commit |
| `GIT_BRANCH` | Branch name (e.g., `origin/main`) |
| `WORKSPACE` | Absolute path to the job's workspace directory |
| `JOB_NAME` | Name of the Jenkins job |

### Stage-Scoped Variables

Variables can also be declared inside a single stage — they are not visible to other stages:

```groovy
stage('Deploy') {
    environment {
        DEPLOY_ENV = "production"
    }
    steps {
        sh 'echo "Deploying to $DEPLOY_ENV"'
    }
}
```

---

## 9. Running a Pipeline with SCM (Jenkinsfile from Git)

### What "Pipeline from SCM" Means

Instead of pasting the pipeline script into the Jenkins UI, you:

1. Commit a file named `Jenkinsfile` to your Git repository (alongside `app.py`, `Dockerfile`, etc.)
2. Tell Jenkins: "read the pipeline definition from this repo"

Every time Jenkins runs the job, it **fetches the latest Jenkinsfile from Git first**, then executes it. This means your pipeline evolves with your code — one PR can change both the app and the CI process.

### Configuration Steps

1. Open the job → **Configure**
2. Scroll to **Pipeline** section
3. Definition dropdown: select **Pipeline script from SCM**
4. SCM: **Git**
5. Repository URL: `https://github.com/youruser/your-repo.git`
6. Credentials: `github-pat`
7. Branch: `*/main`
8. Script Path: `Jenkinsfile` (default — leave as is)
9. **Save**

Now clicking **Build Now** will:
- Clone your repo
- Read `Jenkinsfile`
- Execute each stage

---

## 10. Full Jenkinsfile — Block-by-Block Explanation

> As git is a private repo, project files are located under python folder

### The Complete Jenkinsfile

```groovy
pipeline {
    agent any 
    environment {
        IMAGE = "harish0930/flask-app"
        TAG = "${BUILD_NUMBER}"
    }
    stages {
        stage ('Checkout') {
            steps {
                echo 'Checking out from private repository'
                git branch: 'main', credentialsId: 'github-token', poll: false, 
                url: 'https://github.com/Harish-0930/DooD-Jenkins-Private-Repo.git'
            }
        }
        stage ('Build') {
            steps {
                echo 'Building the image'
                sh 'docker build -t "$IMAGE:$TAG" -t "$IMAGE:latest" .'
            }
        }
        stage ('Push') {
            steps {
                echo 'Pushing the image to Docker Hub'
                withCredentials([usernamePassword(credentialsId: 'dockerhub', passwordVariable: 'DOCKERHUB_PASSWORD', usernameVariable: 'DOCKERHUB_USERNAME')]) {
                    sh 'echo "$DOCKERHUB_PASSWORD" | docker login -u "$DOCKERHUB_USERNAME" --password-stdin'
                    sh 'docker push "$IMAGE:$TAG"'
                    sh 'docker push "$IMAGE:latest"'
                }
            }
        }
        stage ('Deploy') {
            steps {
                echo 'Deploying the application'
                sh 'docker pull "$IMAGE:$TAG"'
                sh 'docker rm -f flask-app || true'
                sh 'docker run -d --name flask-app -p 5000:5000 "$IMAGE:$TAG"'
                sh '''
                    cat > deploy-info-$BUILD_NUMBER.txt <<EOF
                    build: $BUILD_NUMBER
                    image: $IMAGE:$TAG
                    commit: ${GIT_COMMIT}
                    branch: $GIT_BRANCH
                    time: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
                    url: $BUILD_URL
                    EOF
                '''
                archiveArtifacts artifacts: "deploy-info-${BUILD_NUMBER}.txt", fingerprint: true
            }
        }
        stage ('Test') {
            steps {
                echo 'Testing the application'
                script {
                    sleep 2
                    def token = sh(
                        script: '''
                            curl -X PUT "http://169.254.169.254/latest/api/token" \
                            -H "X-aws-ec2-metadata-token-ttl-seconds: 21600" -s
                        ''',
                        returnStdout: true
                    ).trim()

                    def publicIp = sh(
                        script: """
                            curl -H "X-aws-ec2-metadata-token: ${token}" \
                            -s http://169.254.169.254/latest/meta-data/public-ipv4
                        """,
                        returnStdout: true
                    ).trim()

                    echo "========================================="
                    echo "Deployment Successful!"
                    echo "Application URL: http://${publicIp}:5000"
                    echo "========================================="
                }
            }
        }
    }
    post {
        success { echo "Build ${env.BUILD_NUMBER} succeeded" }
        failure { echo "Build ${env.BUILD_NUMBER} failed" }
        always  { echo "Build ${env.BUILD_NUMBER} finished" }
    }
}
```

---

### Pipeline Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        JENKINS PIPELINE EXECUTION                           │
│                                                                             │
│  ┌───────────┐   ┌───────────┐   ┌───────────┐   ┌───────────┐   ┌──────┐   │
│  │ CHECKOUT  │──►│   BUILD   │──►│   PUSH    │──►│  DEPLOY   │──►│ TEST │   │
│  │           │   │           │   │           │   │           │   │      │   │
│  │ git clone │   │  docker   │   │  docker   │   │  docker   │   │ curl │   │
│  │ from      │   │  build    │   │  login    │   │  run      │   │ EC2  │   │
│  │ GitHub    │   │  tag:     │   │  push     │   │  flask-   │   │ meta │   │
│  │ (private) │   │  latest   │   │  latest   │   │  app      │   │ data │   │
│  └───────────┘   └───────────┘   └───────────┘   └───────────┘   └──────┘   │
│                                                                     │       │
│                                                         archive     │       │
│                                                      deploy-info.txt│       │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│                              post { }                                       │
│                    success / failure / always                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Block-by-Block Breakdown

#### `agent any`

```groovy
agent any
```

Tells Jenkins: run every stage on **any available executor** — the built-in node (the Jenkins server itself) or any connected agent. Since we are using DooD (Docker CLI via socket mount), we need the executor that has the socket — in this case the Jenkins container itself — so `any` works fine.

---

#### `environment { }` — Variables Block

```groovy
environment {
    IMAGE = "harish0930/flask-app"
    TAG = "${BUILD_NUMBER}"
}
```

- `IMAGE` — the Docker Hub repository path. Defined once, reused in every stage that needs it.
- `TAG` — `pipeline-` prefix + the auto-incrementing Jenkins build number. Every build produces a uniquely tagged image (e.g., `pipeline-7`), making rollbacks trivial.
- These variables are available as `$IMAGE` / `$TAG` in `sh` steps and as `env.IMAGE` / `env.TAG` in Groovy.

---

#### Stage: `Checkout`

```groovy
stage ('Checkout') {
    steps {
        echo 'Checking out from private repository...'
        git branch: 'main', credentialsId: 'github-token', poll: false,
            url: 'https://github.com/Harish-0930/DooD-Jenkins-Private-Repo.git'
    }
}
```

| Parameter | Purpose |
|---|---|
| `branch: 'main'` | Checkout the `main` branch |
| `credentialsId: 'github-token'` | Reference to the GitHub PAT stored in Jenkins Credentials |
| `poll: false` | Do not use this step for SCM polling (polling is configured at the job level) |
| `url:` | The HTTPS URL of the private repository |

After this stage, the workspace contains `app.py`, `requirements.txt`, `Dockerfile`, `.dockerignore`, and `Jenkinsfile`.

---

#### Stage: `Build`

```groovy
stage ('Build') {
    steps {
        echo 'Building the image'
        sh 'docker build -t "$IMAGE:$TAG" -t "$IMAGE:latest" .'
    }
}
```

- Builds a Docker image from the `Dockerfile` in the workspace (`.` = current directory).
- Tags it **twice**:
  - `$IMAGE:$TAG` → e.g., `harish0930/flask-app:pipeline-7` — immutable, traceable
  - `$IMAGE:latest` → always points to the most recent successful build
- Because Jenkins runs inside a container with the Docker socket mounted (DooD), this command talks to the **host Docker daemon**.

---

#### Stage: `Push`

```groovy
stage ('Push') {
    steps {
        withCredentials([usernamePassword(
            credentialsId: 'dockerhub',
            passwordVariable: 'DOCKERHUB_PASSWORD',
            usernameVariable: 'DOCKERHUB_USERNAME'
        )]) {
            sh 'echo "$DOCKERHUB_PASSWORD" | docker login -u "$DOCKERHUB_USERNAME" --password-stdin'
            sh 'docker push "$IMAGE:$TAG"'
            sh 'docker push "$IMAGE:latest"'
        }
    }
}
```

- `withCredentials` fetches the `dockerhub` credential from Jenkins Credential Store and exposes it **only inside the block** as `$DOCKERHUB_USERNAME` and `$DOCKERHUB_PASSWORD`.
- Jenkins automatically **masks these values** in console output — they appear as `****`.
- `--password-stdin` sends the password via stdin pipe, so it never appears in the process list (`ps aux`).
- Both tags are pushed to Docker Hub, making the image available for deployment from any host.

---

#### Stage: `Deploy`

```groovy
stage ('Deploy') {
    steps {
        sh 'docker pull "$IMAGE:$TAG"'
        sh 'docker rm -f flask-app || true'
        sh 'docker run -d --name flask-app -p 5000:5000 "$IMAGE:$TAG"'
        sh '''
            cat > deploy-info-$BUILD_NUMBER.txt <<EOF
            build: $BUILD_NUMBER
            image: $IMAGE:$TAG
            commit: ${GIT_COMMIT}
            branch: $GIT_BRANCH
            time: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
            url: $BUILD_URL
            EOF
        '''
        archiveArtifacts artifacts: "deploy-info-${BUILD_NUMBER}.txt", fingerprint: true
    }
}
```

Line by line:

| Command | Purpose |
|---|---|
| `docker pull "$IMAGE:$TAG"` | Ensure the exact tagged image is present on the host |
| `docker rm -f flask-app \|\| true` | Remove the previous container if it exists; `\|\| true` prevents the stage failing if no container exists |
| `docker run -d --name flask-app -p 5000:5000 "$IMAGE:$TAG"` | Run the new container in detached mode, map port 5000 |
| `cat > deploy-info-...txt <<EOF` | Generate a deployment record text file (explained in Section 12) |
| `archiveArtifacts` | Save the text file as a Jenkins build artifact (explained in Section 12) |

---

#### Stage: `Test`

```groovy
stage ('Test') {
    steps {
        script {
            sleep 2

            def token = sh(
                script: '''
                    curl -X PUT "http://169.254.169.254/latest/api/token" \
                    -H "X-aws-ec2-metadata-token-ttl-seconds: 21600" -s
                ''',
                returnStdout: true
            ).trim()

            def publicIp = sh(
                script: """
                    curl -H "X-aws-ec2-metadata-token: ${token}" \
                    -s http://169.254.169.254/latest/meta-data/public-ipv4
                """,
                returnStdout: true
            ).trim()

            echo "Application URL: http://${publicIp}:5000"
        }
    }
}
```

Key points:

- `script {}` — drops into Groovy mode inside a Declarative pipeline, allowing variable assignment (`def`) and multi-step logic.
- `sleep 2` — waits 2 seconds for the container to fully start before testing.
- `sh(script: '...', returnStdout: true).trim()` — runs a shell command and **captures its output** as a Groovy string variable instead of just printing it.
- **IMDSv2 flow (AWS EC2 Metadata):**
  1. First `curl` gets a temporary session token from the EC2 instance metadata service (IMDSv2 requires a token header for security).
  2. Second `curl` uses that token to retrieve the public IPv4 of the EC2 instance.
  3. The URL is then printed to the console so you can open it immediately.

---

## 11. The `post {}` Block

```groovy
post {
    success { echo "Build ${env.BUILD_NUMBER} succeeded" }
    failure { echo "Build ${env.BUILD_NUMBER} failed" }
    always  { echo "Build ${env.BUILD_NUMBER} finished" }
}
```

### How `post` Works

`post` runs **after all stages have completed**, regardless of whether they passed or failed. It is the pipeline equivalent of a `try/catch/finally` block.

```
Stages run...
     │
     ▼
┌─────────────────────────────────────┐
│           post { }                  │
│                                     │
│  always   → runs every single time  │
│  success  → only if all passed      │
│  failure  → only if any stage failed│
│  unstable → tests failed but built  │
│  changed  → result differs from     │
│             previous build          │
└─────────────────────────────────────┘
```

### Execution Order

When multiple conditions match, `post` blocks execute in this order:
`always` → `changed` → `fixed` → `regression` → `aborted` → `failure` → `success` → `unstable` → `cleanup`

### Real-World `post` Examples

```groovy
post {
    success {
        // Send Slack notification
        slackSend channel: '#deployments', message: "✅ Build ${env.BUILD_NUMBER} deployed successfully"
    }
    failure {
        // Email the team
        mail to: 'team@company.com',
             subject: "❌ Jenkins Build ${env.BUILD_NUMBER} Failed",
             body: "Check: ${env.BUILD_URL}"
    }
    always {
        // Clean up workspace regardless of result
        cleanWs()
        // Logout from Docker Hub
        sh 'docker logout || true'
    }
}
```

---

## 12. Generate & Archive `deploy-info.txt`

### What It Does

```groovy
sh '''
    cat > deploy-info-$BUILD_NUMBER.txt <<EOF
    build: $BUILD_NUMBER
    image: $IMAGE:$TAG
    commit: ${GIT_COMMIT}
    branch: $GIT_BRANCH
    time: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
    url: $BUILD_URL
    EOF
'''
archiveArtifacts artifacts: "deploy-info-${BUILD_NUMBER}.txt", fingerprint: true
```

### The Heredoc (`<<EOF`)

`cat > file.txt <<EOF ... EOF` is a **heredoc** — it writes multiple lines to a file in a single shell command. Everything between the two `EOF` markers is written verbatim (with variable expansion).

### What Gets Written

For build number 7, the file `deploy-info-7.txt` contains:

```
build: 7
image: harish0930/flask-app:pipeline-7
commit: a3f92c1d8e4b7f0123456789abcdef0123456789
branch: origin/main
time: 2025-06-15T08:30:00Z
url: http://jenkins:8080/job/flask-pipeline/7/
```

This is a **deployment receipt** — a human-readable snapshot of exactly what was deployed, from which commit, on which branch, at what time.

### `archiveArtifacts`

```groovy
archiveArtifacts artifacts: "deploy-info-${BUILD_NUMBER}.txt", fingerprint: true
```

| Parameter | Purpose |
|---|---|
| `artifacts:` | Glob pattern matching files in the workspace to archive |
| `fingerprint: true` | Jenkins computes an MD5 hash of the file and records it — lets you trace which builds produced which files, even across jobs |

**Where to find it:** Jenkins Job → Build Number → **Build Artifacts** section → click the filename to download.

**Why it matters:**

- Gives you a permanent record of every deployment without needing external logging.
- The fingerprint lets you answer: "which build deployed commit `a3f92c1`?" — without searching logs.
- Useful for audit trails, incident response, and rollback decisions.

---

## 13. Summary

### What We Built

A fully code-driven Jenkins pipeline that takes source code from a private GitHub repo through to a running Docker container on the host — all defined in a single `Jenkinsfile`.

### Pipeline at a Glance

```
GitHub (private repo)
        │
        │  Jenkinsfile + app source
        ▼
┌───────────────────────────────────────────────────────┐
│                   Jenkins Pipeline                    │
│                                                       │
│  Checkout → Build → Push → Deploy → Test              │
│     │          │       │       │        │             │
│  git clone  docker   docker  docker  curl EC2         │
│  (PAT auth)  build    push    run   metadata API      │
│              :tag    to Hub  flask-  → print URL      │
│            :latest  :latest   app                     │
│                               │                       │
│                         deploy-info.txt               │
│                         (archived artifact)           │
└───────────────────────────────────────────────────────┘
        │
        ▼
  post { success / failure / always }
```

### Key Concepts Recap

| Concept | What it does |
|---|---|
| `Jenkinsfile` | Pipeline as code — versioned in Git alongside app source |
| `agent any` | Run on any available Jenkins executor |
| `environment {}` | Define reusable variables (`IMAGE`, `TAG`) once, use everywhere |
| `withCredentials` | Safely inject secrets from Jenkins Credential Store — masked in logs |
| `script {}` | Groovy logic inside a Declarative pipeline (`def`, `if`, return values) |
| `returnStdout: true` | Capture shell output as a Groovy variable |
| `archiveArtifacts` | Save files as build artifacts — permanent, downloadable, fingerprintable |
| `post {}` | Always/success/failure hooks — notifications, cleanup |
| `<<EOF` heredoc | Write multi-line files in a single shell step |
| DooD socket | Docker CLI in Jenkins → host daemon via `/var/run/docker.sock` |

### Declarative vs Freestyle — Final Comparison

| | Freestyle Job  | Declarative Pipeline  |
|---|---|---|
| Config location | Jenkins UI only | `Jenkinsfile` in Git |
| Version controlled | No | Yes |
| Stage visibility | None | Visual stage view |
| Secret injection | Build Environment checkbox | `withCredentials {}` block |
| Conditional logic | Not possible | `when {}`, `script {}` |
| Reusability | Per-job | Shared libraries possible |
| Auditability | Hard | Every change is a Git commit |
