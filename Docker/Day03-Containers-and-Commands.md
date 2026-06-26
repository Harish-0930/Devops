# Day 03 — Docker Containers & Container Commands

> Today: the container lifecycle and every container command you'll actually use day to day.

---

## 1. What is a Container?

A container is a **running (or stopped) instance of an image**. The image is the blueprint; the container is the live thing built from it, with its own thin **writable layer** on top of the image's read-only layers.

---

## 2. The Container Lifecycle

```
        docker create
            |
            v
        [Created] --- docker start ---> [Running] ---+
                                          |   ^       |
                              docker pause|   |unpause |
                                          v   |       | docker stop / kill
                                       [Paused]       |
                                                       v
                                                   [Stopped/Exited]
                                                       |
                                                 docker rm
                                                       |
                                                       v
                                                   (removed)
```

`docker run` is the shortcut for **create + start** in one step.

---

## 3. Creating & Running Containers

```bash
# Run a container (create + start). -d = detached (background)
docker run -d --name web -p 8080:80 nginx:1.27-alpine

# Run interactively with a shell
docker run -it ubuntu:22.04 bash

# Run and auto-remove when it exits
docker run --rm alpine echo "hello"

# Just create (don't start yet)
docker create --name web nginx
```

Common `run` flags:

| Flag | Meaning |
|---|---|
| `-d` | Detached / background |
| `-it` | Interactive + TTY (for shells) |
| `--name` | Give the container a friendly name |
| `-p host:container` | Publish a port |
| `-e KEY=value` | Set an environment variable |
| `-v vol:/path` | Mount a volume |
| `--rm` | Remove automatically on exit |
| `--restart` | Restart policy (e.g. `unless-stopped`) |

---

## 4. Controlling Container State

```bash
docker start web          # start a stopped container
docker stop web           # graceful stop (SIGTERM, then SIGKILL after grace period)
docker restart web        # stop then start
docker pause web          # freeze all processes
docker unpause web        # resume
docker kill web           # immediate stop (SIGKILL) — no graceful shutdown
docker rename web webapp  # rename
```

**`stop` vs `kill`:** `stop` sends `SIGTERM` and lets the app shut down cleanly (then `SIGKILL` if it ignores it). `kill` sends `SIGKILL` immediately — use only when a container is unresponsive.

---

## 5. Listing & Removing

```bash
docker ps                 # running containers only
docker ps -a              # include stopped containers
docker ps -q              # just the IDs (great for scripting)

docker rm web             # remove a stopped container
docker rm -f web          # force-remove a running container
docker container prune    # remove ALL stopped containers
```

```bash
# Stop and remove everything (use with care)
docker rm -f $(docker ps -aq)
```

---

## 6. Inspecting & Observing

```bash
docker logs web                 # view container output
docker logs -f web              # follow (stream) logs live
docker logs --tail 100 web      # last 100 lines

docker inspect web              # full JSON metadata (IP, mounts, env, ...)
docker stats                    # live CPU/memory/network usage of running containers
docker top web                  # processes running inside the container
docker diff web                 # files changed vs the image
docker port web                 # show port mappings
```

---

## 7. Interacting With a Running Container

```bash
# Run a new command inside a running container (most common)
docker exec -it web sh
docker exec -it web bash

# Attach to the container's main process (stdin/stdout)
docker attach web
```

**`exec` vs `attach`:** `exec` starts a **new** process inside the container (e.g. a debug shell) — exiting it doesn't stop the container. `attach` connects to the container's **existing main process** — pressing `Ctrl-C` can stop the container. Prefer `exec` for debugging.

---

## 8. Copying Files & Updating Limits

```bash
# Copy files in/out of a container
docker cp ./local.conf web:/etc/app/local.conf   # host -> container
docker cp web:/var/log/app.log ./app.log          # container -> host

# Update resource limits on a running container
docker update --memory 512m --cpus 1.5 web
```

---

## Container Command Cheat Sheet

| Task | Command |
|---|---|
| Run detached | `docker run -d --name web nginx` |
| Interactive shell | `docker run -it ubuntu bash` |
| List running | `docker ps` |
| List all | `docker ps -a` |
| Start / Stop | `docker start web` / `docker stop web` |
| Force remove | `docker rm -f web` |
| Logs (follow) | `docker logs -f web` |
| Shell into it | `docker exec -it web sh` |
| Inspect | `docker inspect web` |
| Live stats | `docker stats` |
| Copy file out | `docker cp web:/path ./local` |

---

## Quick Recap

- A container is a **live instance of an image** with a writable top layer.
- `docker run` = create + start; lifecycle goes Created → Running → Paused/Stopped → removed.
- Use **`stop`** for graceful shutdown, **`kill`** only when stuck.
- Use **`exec`** (new process) for debugging, not **`attach`** (main process).
- `logs`, `inspect`, `stats`, `top`, `diff` are your observability toolkit.
