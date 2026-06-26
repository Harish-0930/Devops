# Day 02 — Docker Objects, Images & Image Commands

> Today: the objects Docker manages, how images work, every image command you'll use, dangling images, and **two ways to move an image from one server to another**.

---

## 1. Docker Objects

When you use Docker, you create and manage several kinds of objects:

| Object | What it is |
|---|---|
| **Image** | A read-only template (blueprint) used to create containers. |
| **Container** | A running (or stopped) instance of an image. |
| **Network** | How containers talk to each other and the outside world. |
| **Volume** | Persistent storage that lives outside the container's writable layer. |

Today focuses on **images**. Containers, networks, and volumes get their own days.

---

## 2. What is a Docker Image?

An image is a **read-only template** that contains the application and its dependencies. Containers are created *from* images.

### Images are made of layers

Each instruction in a Dockerfile creates a **layer**. Layers are **stacked and cached**:

```
+-----------------------------+  <- your app code      (top layer)
+-----------------------------+  <- dependencies
+-----------------------------+  <- runtime
+-----------------------------+  <- base OS (e.g. alpine)  (bottom layer)
```

- Layers are **read-only** and **shared** between images. If two images use the same base, that base is stored once.
- When you run a container, Docker adds a thin **writable layer** on top.
- Because layers are cached, rebuilds only redo the layers that actually changed — this is why ordering Dockerfile instructions well makes builds fast (covered on Day 04 & 06).

### Image naming

```
registry/repository:tag
docker.io/library/nginx:1.27-alpine
                 ^name   ^tag
```

If you omit the tag, Docker assumes `:latest` (which is just a default name, **not** "newest" — always prefer explicit tags).

---

## 3. Image Commands

### Getting and finding images

```bash
# Download an image (prefer an explicit tag over :latest)
docker pull nginx:1.27-alpine

# Search Docker Hub from the command line
docker search redis
```

### Listing and inspecting

```bash
docker images                       # list local images
docker image ls                     # same thing (modern form)
docker images -q                    # just the image IDs
docker images -a                    # include intermediate layers

docker inspect nginx:1.27-alpine    # full JSON metadata
docker image history nginx          # show the layers and the commands that built them
```

### Tagging

Tagging does **not** copy data — it adds another name pointing at the same image.

```bash
docker tag nginx:1.27-alpine myrepo/nginx:v1
```

### Removing images

```bash
docker rmi nginx:1.27-alpine        # remove an image
docker image rm <imageId>           # same thing
docker image prune                  # remove dangling images
docker image prune -a               # remove ALL unused images (careful)
```

### Save / Load and Export / Import (these four are constantly confused)

| Command pair | Works on | Keeps history/layers? |
|---|---|---|
| `docker save` / `docker load` | **Images** | ✅ Yes — preserves all layers, tags, history |
| `docker export` / `docker import` | A **container's filesystem** | ❌ No — flattens to a single layer, drops metadata |

```bash
# IMAGES — save to a tar, load on another host
docker save -o app.tar myrepo/nginx:v1
docker load -i app.tar

# CONTAINERS — export a running container's filesystem, import as a flat image
docker export -o fs.tar mycontainer
docker import fs.tar flatimage:1.0
```

---

## 4. Dangling Images

A **dangling image** is an untagged image that shows up as `<none>:<none>`.

They are usually leftovers from rebuilds: when you rebuild `myapp:latest`, the old image loses its tag but its layers remain on disk, taking up space.

```bash
# List only dangling images
docker images -f "dangling=true"

# Reclaim the space
docker image prune
```

---

## 5. Moving an Image From One Server to Another

There are two common approaches.

### Approach 1 — Use a registry (recommended)

Push to a shared registry, then pull on the other server. This is the standard, repeatable, team-friendly way.

Registries you might use: **Docker Hub, AWS ECR, Nexus, JFrog Artifactory, Docker Trusted Registry (DTR)**.

```bash
# On the source server
docker tag myapp:latest <registry>/myapp:v1
docker login <registry>
docker push <registry>/myapp:v1

# On the target server
docker login <registry>
docker pull <registry>/myapp:v1
```

> AWS ECR specifically is covered on **Day 10**.

### Approach 2 — Save, copy, and load (no registry)

Useful for air-gapped environments or quick one-off transfers.

```bash
# 1. On the source server: save the image to a tar file
docker save -o myimage.tar <imageId-or-name>

# 2. Copy the tar to the target server over SSH
scp myimage.tar ubuntu@<TARGET_IP>:/home/ubuntu

# 3. On the target server: load the image
docker load -i myimage.tar
```

| | Approach 1 (Registry) | Approach 2 (save/scp/load) |
|---|---|---|
| Best for | Teams, CI/CD, repeatable deploys | Air-gapped, one-off, no registry available |
| Needs | A registry + credentials | SSH access between servers |
| Versioning | Built-in via tags/repos | Manual (filenames) |
| Speed at scale | Better (layer caching, dedup) | Whole image copied each time |

---

## Quick Recap

- Docker objects: **images, containers, networks, volumes**.
- Images are **read-only, layered, and cached**; containers add a writable layer on top.
- Know the four transfer commands: **save/load** = images (keeps layers), **export/import** = container FS (flattens).
- **Dangling images** (`<none>`) are rebuild leftovers — clean with `docker image prune`.
- Move images via a **registry** (Approach 1, preferred) or **save → scp → load** (Approach 2).
