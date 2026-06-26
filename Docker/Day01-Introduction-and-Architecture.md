# Day 01 — Introduction to Docker, Architecture & Installation

> Goal for today: understand *what* Docker is, *why* it exists, *how* its pieces fit together, and get it installed on your machine.

---

## 1. What is Docker?

Docker is an open-source platform for **building, shipping, and running applications inside containers**.

A **container** packages your application together with everything it needs to run — code, runtime, system libraries, and configuration — into a single, isolated, portable unit.

The key idea is **OS-level virtualization**: instead of virtualizing an entire machine, Docker isolates processes so each one behaves as if it has its own clean operating system, while they all share the host's kernel underneath.

### Why Docker?

It solves the classic *"but it works on my machine"* problem. Because the container carries its own dependencies, it behaves the same on a laptop, a CI runner, and a production server.

| Benefit | What it means |
|---|---|
| **Consistency** | The same image runs the same way everywhere. |
| **Speed** | Containers start in milliseconds to seconds, not minutes. |
| **Efficiency** | They share the host kernel, so you can pack far more containers than VMs onto the same hardware. |
| **Isolation** | Each container has its own filesystem, processes, and network view. |
| **Portability** | Build once, run anywhere Docker is installed. |
| **CI/CD friendly** | Small, versioned units are perfect for microservices and pipelines. |

---

## 2. Virtual Machines vs Containers

Both provide isolation, but at very different levels of the stack.

| | Virtual Machine | Container |
|---|---|---|
| Virtualizes | Hardware (via a hypervisor) | The operating system |
| Guest OS | Full OS per VM | Shares the host kernel |
| Size | Gigabytes | Megabytes |
| Startup | Minutes | Seconds / milliseconds |
| Isolation | Strong (full OS) | Process-level |
| Density | Few per host | Many per host |

**Rule of thumb:** a VM is a whole house; a container is an apartment in a shared building — lighter, faster, but sharing the same foundation (the kernel).

---

## 3. Docker Architecture

Docker uses a **client–server** architecture.

```
+-------------------+        REST API        +-----------------------------+
|   Docker Client   | --------------------->  |   Docker Daemon (dockerd)   |
|   (docker CLI)    |   (commands/requests)   |                             |
+-------------------+                         |  builds, runs, distributes  |
                                              |  manages images/containers  |
                                              +--------------+--------------+
                                                             |
                                                             | pull / push
                                                             v
                                              +-----------------------------+
                                              |   Registry (Docker Hub /    |
                                              |   ECR / Nexus / private)    |
                                              +-----------------------------+
```

### Core components

| Component | Role |
|---|---|
| **Docker Client** | The `docker` command you type. Sends requests to the daemon via the REST API. |
| **Docker Daemon (`dockerd`)** | The background service that does the real work — building images, running containers, managing networks and volumes. |
| **Docker Host** | The machine where the daemon runs (your laptop, a VM, an EC2 instance). |
| **Docker Registry** | Stores and distributes images. Docker Hub is the default public one; ECR, Nexus, JFrog, and private registries are alternatives. |
| **Docker Objects** | Images, containers, networks, volumes — covered in detail on later days. |

### How a command flows

When you run `docker run nginx`:

1. The **client** sends the request to the **daemon**.
2. The daemon checks if the `nginx` **image** exists locally.
3. If not, it **pulls** it from the **registry**.
4. The daemon creates and starts a **container** from that image.

---

## 4. Installation Guide

> Always install from Docker's official repositories — distro defaults are often outdated.

### Linux (Ubuntu / Debian)

```bash
# 1. Remove any old versions
sudo apt-get remove docker docker-engine docker.io containerd runc

# 2. Set up Docker's official APT repository
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 3. Install Docker Engine + CLI + Compose plugin
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io \
  docker-buildx-plugin docker-compose-plugin
```

### Linux (RHEL / CentOS / Amazon Linux)

```bash
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# On Amazon Linux 2 you can also simply use:
# sudo amazon-linux-extras install docker -y
```

### Start Docker and enable it on boot

```bash
sudo systemctl start docker
sudo systemctl enable docker
sudo systemctl status docker
```

### Run Docker without `sudo` (recommended for dev)

```bash
sudo groupadd docker            # usually already exists
sudo usermod -aG docker $USER   # add your user to the docker group
newgrp docker                   # apply the group in the current shell (or log out/in)
```

### Windows / macOS

Install **Docker Desktop** from <https://www.docker.com/products/docker-desktop>. It bundles the engine, CLI, Compose, and a small Linux VM to host the daemon.

---

## 5. Verify the Installation

```bash
# Versions of client and server
docker version

# System-wide info: storage driver, number of containers/images, etc.
docker info

# The classic smoke test — pulls and runs a tiny image
docker run hello-world
```

If `hello-world` prints its welcome message, your installation is working end to end: client → daemon → registry pull → container run.

---

## Quick Recap

- Docker runs apps in **containers** — lightweight, portable, kernel-sharing units.
- Containers are faster and denser than **VMs** because they don't ship a full guest OS.
- Architecture = **client → daemon → registry**, operating on **images, containers, networks, volumes**.
- Install from **official repos**, start the service, add your user to the `docker` group, then verify with `docker run hello-world`.
