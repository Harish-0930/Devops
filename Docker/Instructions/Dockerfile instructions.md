# Dockerfile Quick Reference Guide

A concise revision guide covering common Dockerfile instructions, their use cases, and the differences between commonly confused ones.

<p align="center">
  <img src="https://raw.githubusercontent.com/Harish-0930/Devops/main/Docker/Instructions/docker%20insts.png" alt="Docker File Instructions" width="800">
</p>

---

## 1. Common Dockerfile Instructions

### `FROM`
Sets the base image. Must be the first instruction (after optional `ARG`). Supports multi-stage builds with `AS`.
```dockerfile
FROM node:20-alpine
FROM python:3.12-slim AS builder
```

### `LABEL`
Adds metadata to the image as key-value pairs.
```dockerfile
LABEL maintainer="dev@example.com" version="1.0"
```

### `RUN`
Executes commands during the **image build**. Each `RUN` creates a new image layer, so chain related commands to keep layers small.
```dockerfile
RUN apt-get update && apt-get install -y curl \
    && rm -rf /var/lib/apt/lists/*
```

### `CMD`
Provides the **default command** for the container at runtime. Easily overridden by arguments passed to `docker run`.
```dockerfile
CMD ["node", "server.js"]
```

### `ENTRYPOINT`
Configures the container's **main executable**. Arguments to `docker run` are appended to it (not replaced).
```dockerfile
ENTRYPOINT ["python", "app.py"]
```

### `COPY`
Copies files/directories from the build context into the image. Simple, predictable, and the recommended default.
```dockerfile
COPY package.json /app/
COPY --from=builder /build/dist /app
```

### `ADD`
Like `COPY`, but with extras: it can fetch from URLs and auto-extract local tar archives.
```dockerfile
ADD https://example.com/file.tar.gz /tmp/
ADD source.tar.gz /opt/   # auto-extracted
```

### `WORKDIR`
Sets the working directory for subsequent `RUN`, `CMD`, `ENTRYPOINT`, `COPY`, and `ADD` instructions. Creates the directory if it doesn't exist.
```dockerfile
WORKDIR /app
```

### `ENV`
Sets environment variables that persist in the image and at runtime.
```dockerfile
ENV NODE_ENV=production PORT=3000
```

### `ARG`
Defines build-time variables. **Not available at runtime** unless promoted to `ENV`.
```dockerfile
ARG VERSION=1.0
RUN echo "Building version ${VERSION}"
```

### `EXPOSE`
Documents which ports the container listens on. **Does not actually publish ports** — that requires `-p` on `docker run`.
```dockerfile
EXPOSE 8080
```

### `VOLUME`
Declares a mount point for external/persistent storage. Useful for databases and stateful apps.
```dockerfile
VOLUME ["/data"]
```

### `USER`
Sets the user (and optionally group) for subsequent instructions and at container runtime. Important for security — avoid running as `root`.
```dockerfile
RUN adduser -D appuser
USER appuser
```

### `HEALTHCHECK`
Tells Docker how to test whether the container is healthy.
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost/ || exit 1
```

### `ONBUILD`
Registers a trigger instruction to run when the image is used as a base for another build.
```dockerfile
ONBUILD COPY . /app/src
```

### `STOPSIGNAL`
Sets the system call signal sent to the container to exit (default: `SIGTERM`).
```dockerfile
STOPSIGNAL SIGINT
```

### `SHELL`
Overrides the default shell (`/bin/sh -c` on Linux). Often used for Windows or to switch to `bash`.
```dockerfile
SHELL ["/bin/bash", "-o", "pipefail", "-c"]
```

---

## 2. Key Differences (Commonly Confused)

### `CMD` vs `ENTRYPOINT`

| Aspect | `CMD` | `ENTRYPOINT` |
|---|---|---|
| Purpose | Default command/args | Main executable |
| Overridden by `docker run <img> xyz`? | Yes, fully replaced | No, `xyz` is appended as args |
| Multiple in Dockerfile | Only the last takes effect | Only the last takes effect |
| Typical use | Sensible default the user can change | Fixed entrypoint behavior |

**Common pattern — use them together:** `ENTRYPOINT` defines the binary, `CMD` provides default arguments.
```dockerfile
ENTRYPOINT ["python", "app.py"]
CMD ["--port", "8080"]
# docker run img             → python app.py --port 8080
# docker run img --port 9000 → python app.py --port 9000
```

---

### `ADD` vs `COPY`

| Feature | `COPY` | `ADD` |
|---|---|---|
| Copy local files | ✅ | ✅ |
| Download from URL | ❌ | ✅ |
| Auto-extract tar archives | ❌ | ✅ |
| Recommended default | ✅ | Only when you need its extras |

**Rule of thumb:** prefer `COPY` for clarity. Use `ADD` only when you specifically need URL fetching or tar extraction. For URLs, `RUN curl/wget` is often safer because you control caching and verification.

---

### `RUN` vs `CMD` vs `ENTRYPOINT`

| | When it runs | Layer created? | Purpose |
|---|---|---|---|
| `RUN` | **Build time** | Yes | Install packages, compile code, set up files |
| `CMD` | **Runtime** | No | Default command (overridable) |
| `ENTRYPOINT` | **Runtime** | No | Main executable (sticky) |

```dockerfile
RUN npm install        # build-time: installs dependencies into the image
CMD ["npm", "start"]   # runtime: default command when container starts
```

---

### `ARG` vs `ENV`

| | `ARG` | `ENV` |
|---|---|---|
| Scope | Build time only | Build time + runtime |
| Visible in final image | ❌ | ✅ |
| Set via | `--build-arg KEY=val` | `-e KEY=val` at `docker run` |
| Use case | Versions, flags during build | Runtime config |

```dockerfile
ARG APP_VERSION=1.0
ENV APP_VERSION=${APP_VERSION}   # promote ARG to ENV so it persists
```

⚠️ Don't put secrets in `ARG` — they're visible in image history. Use BuildKit secrets instead.

---

### Shell Form vs Exec Form

Many instructions (`RUN`, `CMD`, `ENTRYPOINT`) accept two forms:

```dockerfile
# Shell form — runs via /bin/sh -c
CMD echo hello && echo world

# Exec form — runs the binary directly, no shell
CMD ["echo", "hello"]
```

| | Shell form | Exec form |
|---|---|---|
| Shell features (`&&`, `$VAR`, pipes) | ✅ | ❌ (unless you invoke a shell explicitly) |
| Forwards signals (e.g. `SIGTERM`) correctly | ❌ | ✅ |
| Recommended for `CMD`/`ENTRYPOINT` | — | ✅ |

**Why it matters:** in shell form, your process becomes a child of `sh`, so `docker stop` may not reach it cleanly — important for graceful shutdown.

---

### `EXPOSE` vs `-p` (publishing ports)

- `EXPOSE 8080` → documentation only; tells users/orchestrators which port the app uses.
- `docker run -p 8080:8080` → actually maps the host port to the container port.

You still need `-p` (or `-P`) to make the port reachable from outside.

---

## 3. Best-Practice Checklist

- **Order matters for caching:** put rarely-changing instructions (e.g. `COPY package.json` + `RUN npm install`) **before** frequently-changing ones (`COPY . .`).
- **Use multi-stage builds** to keep final images small:
  ```dockerfile
    # Stage 1: Build the application
    FROM maven:3.9.9-eclipse-temurin-21 AS build

    WORKDIR /src

    COPY pom.xml .
    COPY src ./src

    RUN mvn clean package -DskipTests

    # Stage 2: Create lightweight runtime image
    FROM eclipse-temurin:21-jre

    WORKDIR /app

    COPY --from=build /src/target/*.jar app.jar

    ENTRYPOINT ["java", "-jar", "app.jar"]

  ```
- **Add a `.dockerignore`** to exclude `node_modules`, `.git`, secrets, etc. from the build context.
- **Pin versions** in `FROM` (e.g. `node:20.11-alpine`, not `node:latest`) for reproducibility.
- **Run as non-root** with `USER` for security.
- **Combine `RUN` commands** with `&&` and clean up in the same layer (`rm -rf /var/lib/apt/lists/*`).
- **Prefer exec form** for `CMD` and `ENTRYPOINT` so signals propagate correctly.

---

## 4. Tiny End-to-End Example

```dockerfile
# syntax=docker/dockerfile:1
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s CMD wget -qO- http://localhost:3000/health || exit 1
ENTRYPOINT ["node"]
CMD ["server.js"]
```

Author: Munagala Harish

Topic: Docker File Instructions
