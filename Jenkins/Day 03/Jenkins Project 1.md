# Jenkins Project 1: Build, Push & Run a Flask App with Jenkins (DooD)

---

## Table of Contents

1. [What is DooD (Docker-outside-of-Docker)?](#1-what-is-dood-docker-outside-of-docker)
2. [How Linux Processes Communicate via Sockets](#2-how-linux-processes-communicate-via-sockets)
3. [Step 1 — Recreate Jenkins with the Docker Socket Mounted](#3-step-1--recreate-jenkins-with-the-docker-socket-mounted)
4. [Step 2 — Allow the Jenkins User to Talk to the Socket](#4-step-2--allow-the-jenkins-user-to-talk-to-the-socket)
5. [Step 3 — Install the Docker CLI Inside Jenkins](#5-step-3--install-the-docker-cli-inside-jenkins)
6. [Step 4 — Verify from Inside Jenkins](#6-step-4--verify-from-inside-jenkins)
7. [Demo — Build, Push & Deploy a Flask App](#7-demo--build-push--deploy-a-flask-app)
8. [Application Source Files](#8-application-source-files)
9. [Jenkins Configuration — Step by Step](#9-jenkins-configuration--step-by-step)
10. [Run It End-to-End](#10-run-it-end-to-end)

---

## 1. What is DooD (Docker-outside-of-Docker)?

### Concept

**DooD** means running Docker commands *inside* a container while those commands are actually executed by the **host machine's Docker daemon** — not a separate daemon running inside the container.

The trick is straightforward: instead of installing a full Docker engine inside the Jenkins container, you simply **mount the host's Docker socket** (`/var/run/docker.sock`) into the container. Any `docker` command issued inside the container travels through that socket and is handled by the host daemon.

```
                     Docker-outside-of-Docker (DooD)

┌──────────────────────────────────────────────────────────────────────┐
│                           HOST MACHINE                               │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │                 Docker Daemon (Host)                         │    │
│  │                                                              │    │
│  │  • Builds Images                                             │    │
│  │  • Runs Containers                                           │    │
│  │  • Pushes Images to Registries                               │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                          ▲                                           │
│                          │                                           │
│                          │  Mounted Socket                           │
│                          │  /var/run/docker.sock                     │
│                          │                                           │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │                    Jenkins Container                         │    │
│  │                                                              │    │
│  │  Jenkins + Docker CLI                                        │    │
│  │                                                              │    │
│  │  docker build .                                              │    │
│  │  docker push image                                           │    │
│  │  docker run image                                            │    │
│  │      (Docker CLI only, no daemon)                            │    │
│  │    No Docker Daemon Inside Container                         |    │
│  │    Uses Host Docker Daemon Through Socket                    │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
│                                                                      │
│  Containers Created By Host Docker Daemon                            │
│                                                                      │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐     │
│  │   Flask App     │   │   React App     │   │     MySQL       │     │
│  │   Container     │   │   Container     │   │   Container     │     │
│  └─────────────────┘   └─────────────────┘   └─────────────────┘     │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### DooD vs DinD (Docker-in-Docker)

| | DooD | DinD |
|---|---|---|
| **Daemon location** | Host daemon (shared) | Separate daemon inside the container |
| **Socket mount needed** | Yes (`/var/run/docker.sock`) | No |
| **Privileged mode needed** | No | Yes (`--privileged`) |
| **Images shared with host** | Yes — same image cache | No — isolated layer store |
| **Security risk** | Moderate (socket access = root-equivalent) | Higher (full privileged container) |
| **Typical CI use** | ✅ Preferred for Jenkins pipelines | Rarely used in production CI |

### Why We Use DooD Here

- **No privileged container required** — DinD needs `--privileged`, which is a much larger attack surface.
- **Shared image cache** — images built inside Jenkins are immediately visible on the host, so deploying a freshly built image is instantaneous.
- **Simpler setup** — one socket mount, one CLI install, done.
- **Real-world pattern** — this is how most CI/CD pipelines (Jenkins, GitLab Runner, etc.) handle Docker builds in containerised environments.

---

## 2. How Linux Processes Communicate via Sockets

### The Docker Daemon

The **Docker daemon** (`dockerd`) is a long-running background process (system service) that does the actual heavy lifting of managing containers, images, networks, and volumes. When you run `docker build` or `docker run` from your terminal, you are not doing that work yourself — you are sending *instructions* to the daemon.

```
you (CLI)  ──request──►  dockerd  ──►  creates container / builds image
           ◄──response──
```

### What is `/var/run/docker.sock`?

`/var/run/docker.sock` is a **Unix domain socket** — a special file the daemon creates on startup to listen for API requests.

```bash
ls -l /var/run/docker.sock
# srw-rw---- 1 root docker ... /var/run/docker.sock
# │
# └── 's' prefix = socket file (not a regular file)
```

Think of it as a **named pipe with two-way communication**:

- The **Docker daemon** sits on one end, listening.
- Any **Docker CLI** (or any process with socket access) connects to the other end and sends HTTP/JSON messages over the REST API.

### How Two Processes Communicate via a Unix Socket

Linux provides several inter-process communication (IPC) mechanisms. A **Unix domain socket** is one of the most common:

```
Process A (writer)          Process B (reader)
      │                           │
      │──── connect to socket ───►│
      │──── write(request) ──────►│
      │◄─── read(response) ───────│
      │                           │
  Docker CLI               Docker Daemon
```

1. The daemon calls `bind()` on `/var/run/docker.sock` and starts `listen()`-ing.
2. When the CLI runs `docker ps`, it calls `connect()` on the same socket path.
3. The CLI serialises the request as an HTTP message and writes it to the socket with `send()`.
4. The daemon reads it, processes the request, and writes a JSON response back with `send()`.
5. The CLI reads the response and displays the output.

This all happens **locally on the same machine** — no network required, making it fast and secure (access is controlled purely by file permissions on the socket file).

> **Key insight:** When we mount `/var/run/docker.sock` into the Jenkins container, the Docker CLI inside Jenkins can `connect()` to that socket path, which now points directly to the *host* daemon. From Jenkins's perspective it is just making local socket calls; from the host's perspective the Jenkins container is a client.

---

## 3. Step 1 — Recreate Jenkins with the Docker Socket Mounted

```bash
# Remove any existing Jenkins container (ignore errors if it doesn't exist)
docker rm -f jenkins 2>/dev/null || true

# Start a fresh Jenkins container with the Docker socket mounted
docker run -d --name jenkins --restart unless-stopped \
  -p 8080:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -e TZ=Asia/Kolkata \
  jenkins/jenkins:lts
```

### Flag-by-Flag Explanation

| Flag | Purpose |
|---|---|
| `-d` | Run in detached (background) mode |
| `--name jenkins` | Name the container `jenkins` for easy reference |
| `--restart unless-stopped` | Auto-restart on host reboot, unless you explicitly stop it |
| `-p 8080:8080` | Expose the Jenkins Web UI on host port 8080 |
| `-p 50000:50000` | Expose the Jenkins agent (JNLP) port for build agents |
| `-v jenkins_home:/var/jenkins_home` | Persist Jenkins data in a named Docker volume |
| `-v /var/run/docker.sock:/var/run/docker.sock` | **Mount the host Docker socket into the container** — this is the DooD key |
| `-e TZ=Asia/Kolkata` | Set the timezone so build timestamps are in IST |
| `jenkins/jenkins:lts` | Official Jenkins LTS image |

The critical line is:

```
-v /var/run/docker.sock:/var/run/docker.sock
```

`HOST_PATH:CONTAINER_PATH` — it makes the host's socket file appear at the *same path* inside the container. The Docker CLI we install in Step 3 will find it there automatically (that is the default path the CLI looks for).

---

## 4. Step 2 — Allow the Jenkins User to Talk to the Socket

By default the socket is owned by `root:root` and not readable by others:

```bash
docker exec -it jenkins ls -l /var/run/docker.sock
# srw-rw---- 1 root root ... /var/run/docker.sock
```

The `jenkins` user inside the container is not `root`, so it cannot read or write the socket.

### Quick Lab Fix — Make the Socket World-Readable

```bash
docker exec -u root -it jenkins chmod 666 /var/run/docker.sock
```

`chmod 666` sets read+write for owner, group, *and* others — meaning any process inside the container (including the `jenkins` user) can now communicate with the Docker daemon.

> **Note:** This is intentionally simplified for demo/lab purposes. In production you would add the `jenkins` user to the `docker` group instead (`usermod -aG docker jenkins`), which limits socket access to that group only.

---

## 5. Step 3 — Install the Docker CLI Inside Jenkins

We are installing **only the Docker client (CLI)** — not a daemon. The daemon is already running on the host.

```bash
docker exec -u root -it jenkins bash -lc \
  'curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh'
```

What this does:

1. `curl -fsSL https://get.docker.com` — downloads Docker's official convenience install script.
2. `sh get-docker.sh` — runs the script, which detects the OS (Debian inside the Jenkins LTS image) and installs the full Docker Engine package set — but since there is no daemon configuration, only the CLI binary matters to us.

After this, `/usr/bin/docker` exists inside the Jenkins container and is ready to forward commands to the host daemon via the mounted socket.

---

## 6. Step 4 — Verify from Inside Jenkins

```bash
docker exec -it jenkins bash -lc 'docker version && docker ps'
```

Expected output structure:

```
Client: Docker Engine - Community
 Version: 26.x.x
 ...

Server: Docker Engine - Community
 Engine:
  Version: 26.x.x
  ...
```

And `docker ps` will list **your host's running containers** (including the `jenkins` container itself), confirming the CLI is talking to the host daemon — not a local one.

---

## 7. Demo — Build, Push & Deploy a Flask App

### Overview

```
┌──────────────┐    ┌───────────────┐    ┌───────────────┐    ┌──────────────────┐    ┌──────────────┐
│  Checkout    │───►│  Build Docker │───►│  Push to      │───►│  Deploy on       │───►│  Smoke Test  │
│  Private     │    │  Image        │    │  Docker Hub   │    │  Docker Host     │    │  (curl)      │
│  GitHub Repo │    │  (docker build)│   │  (docker push)│    │  (docker run)    │    │              │
└──────────────┘    └───────────────┘    └───────────────┘    └──────────────────┘    └──────────────┘
      SCM              Build Step            Push Step             Deploy Step           Verify Step
   (Jenkins Git)     (Execute Shell)      (Execute Shell)        (Execute Shell)       (Execute Shell)
```

All five stages happen inside a single Jenkins **Execute Shell** build step. The Docker CLI calls in Jenkins travel via the mounted socket and are executed by the host daemon — so the deployed `flask-app` container appears in the **host's** `docker ps`, not just inside Jenkins.

---

## 8. Application Source Files

Create a **private GitHub repository** and add the following four files:

### `app.py`

```python
from flask import Flask, jsonify

app = Flask(__name__)

@app.get("/")
def hello():
    return jsonify(
        message="✨ Welcome to Cloud Eorld ✨",
        tip="Built with Flask, shipped by Jenkins, running in Docker."
    )

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
```

### `requirements.txt`

```
flask==3.0.3
```

### `Dockerfile`

```dockerfile
# Small Python base image (Debian slim) to keep the final image light
FROM python:3.11-slim

# Set working directory inside the container
WORKDIR /app

# Copy only dependency list first to leverage Docker layer caching
COPY requirements.txt .

# Install Python dependencies (no pip download cache in the image)
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY app.py .

# Document the port the app listens on
EXPOSE 5000

# Start the Flask app
CMD ["python", "app.py"]
```

> **Layer caching tip:** Copying `requirements.txt` before `app.py` means pip only re-runs when dependencies change, not every time you edit `app.py`.

### `.dockerignore`

```
__pycache__/
*.pyc
.git
```

Keeps the build context small and prevents local cache files or Git metadata from being copied into the image.

---

## 9. Jenkins Configuration — Step by Step

### 9.1 Create a GitHub Personal Access Token (PAT)

1. GitHub → **Settings** → **Developer settings** → **Personal access tokens**
2. **Fine-grained token:** grant `Contents: Read` on your private repo
   *or* **Classic token:** enable the `repo` scope (read access is enough for checkout)
3. Copy the token immediately — it is shown only once.

---

### 9.2 Add Credentials in Jenkins

> **Security rule:** Never paste secrets directly into shell steps — they leak in console logs and job configs. Always store them in Jenkins Credentials and inject them as environment variables.

#### A) GitHub PAT

**Jenkins → Manage Jenkins → Credentials → System → Global → Add Credentials**

| Field | Value |
|---|---|
| Kind | Username with password |
| Username | Your GitHub username |
| Password | Your PAT |
| ID | `github-pat` |

#### B) Docker Hub

Ensure you have a repository on Docker Hub (e.g., `youruser/app-flask`).

**Jenkins → Manage Jenkins → Credentials → System → Global → Add Credentials**

| Field | Value |
|---|---|
| Kind | Username with password |
| Username | Your Docker Hub username |
| Password | Your Docker Hub password or access token |
| ID | `dockerhub` |

---

### 9.3 Create the Freestyle Job

**New Item → Job name:** `flask-dood-demo` → **Freestyle project** → OK

#### A) Source Code Management → Git

| Field | Value |
|---|---|
| Repository URL | `https://github.com/<your-username>/<repo-name>` |
| Credentials | `github-pat` |
| Branch | `*/main` |

#### B) Build Environment → Use secret text(s) or file(s)

Tick **"Use secret text(s) or file(s)"** → **Add** → **Username and password (separated)**

| Field | Value |
|---|---|
| Credentials | `dockerhub` |
| Username variable | `DOCKERHUB_USER` |
| Password variable | `DOCKERHUB_PWD` |

This injects Docker Hub credentials as environment variables so the shell script can use `$DOCKERHUB_USER` and `$DOCKERHUB_PWD` without them ever appearing in the job config or logs.

#### C) (Optional) Build Parameters

**"This project is parameterized"** → **Add Parameter** → **String Parameter**

| Field | Value |
|---|---|
| Name | `TAG` |
| Default value | `${BUILD_NUMBER}` |

#### D) Build Steps → Execute Shell

```bash
# ── 1) Login to Docker Hub 
echo "Logging in to Docker Hub..."
echo "$DOCKERHUB_PWD" | docker login -u "$DOCKERHUB_USER" --password-stdin

# ── 2) Set image name and tag 
IMAGE="youruser/flask-app"
TAG="${BUILD_NUMBER}"

# ── 3) Build the Docker image 
echo "Building image $IMAGE:$TAG ..."
docker build -t "$IMAGE:$TAG" -t "$IMAGE:latest" .

# ── 4) Push to Docker Hub 
echo "Pushing image..."
docker push "$IMAGE:$TAG"
docker push "$IMAGE:latest"

# ── 5) Deploy on the Docker host (DooD) 
echo "Deploying container..."
docker pull "$IMAGE:$TAG"
docker rm -f flask-app || true
docker run -d --name flask-app -p 5000:5000 "$IMAGE:$TAG"

# ── 6) Smoke test — retrieve the public IP from EC2 metadata 
sleep 2

TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" \
  -H "X-aws-ec2-metadata-token-ttl-seconds: 21600" -s)

PUBLIC_IP=$(curl -H "X-aws-ec2-metadata-token: $TOKEN" \
  -s http://169.254.169.254/latest/meta-data/public-ipv4)

echo "========================================="
echo "Deployment Successful!"
echo "Application URL: http://$PUBLIC_IP:5000"
echo "========================================="
```

> Because the job runs inside the Jenkins container but talks to the **host Docker daemon** (via `/var/run/docker.sock`), the deployed `flask-app` container runs **on the host** and is visible in the host's `docker ps`.

#### E) (Optional) Post-Build Workspace Cleanup

After confirming everything works, enable disk cleanup:

**Post-build Actions → Delete workspace when build is done** (Workspace Cleanup plugin)

Or add a final shell step:

```bash
echo "Cleaning workspace..."
rm -rf "$WORKSPACE"/* || true
```

---

## 10. Run It End-to-End

1. **Commit and push** all four files (`app.py`, `requirements.txt`, `Dockerfile`, `.dockerignore`) to your private GitHub repo.

2. In Jenkins, click **Build Now**.

3. Open **Console Output** — you should see each stage complete in sequence:
   - `Logging in to Docker Hub...`
   - `Building image ...`
   - `Pushing image ...`
   - `Deploying container ...`
   - `Deployment Successful!`

4. **Access the application:**

   ```bash
   # If running locally
   curl -s http://localhost:5000

   # If running on a cloud server
   curl -s http://<public-ip>:5000
   ```

5. **Expected response:**

   ```json
   {
     "message": "✨ Welcome to Cloud World ✨",
     "tip": "Built with Flask, shipped by Jenkins, running in Docker."
   }
   ```

6. **Confirm the container is running on the host:**

   ```bash
   docker ps
   # You should see both 'jenkins' and 'flask-app' listed
   ```

---

## Quick Reference Summary

| Concept | What it means |
|---|---|
| **DooD** | Docker CLI inside a container, talking to the *host* Docker daemon via a mounted socket |
| **`/var/run/docker.sock`** | Unix domain socket file — the channel between Docker CLI and daemon |
| **`chmod 666 docker.sock`** | Quick lab fix to allow the Jenkins user to access the socket |
| **Jenkins Credentials** | Secure store for secrets — never paste tokens into shell steps |
| **Build Number as tag** | `${BUILD_NUMBER}` gives each build a unique, traceable image tag |
| **`--password-stdin`** | Safer login method — password never appears in the process list |
