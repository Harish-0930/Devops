# Day 04 — Dockerfile

> Today: how a Dockerfile becomes an image, every instruction you need, and the gotchas that trip people up (`CMD` vs `ENTRYPOINT`, `COPY` vs `ADD`, `ARG` vs `ENV`).

---

## 1. What is a Dockerfile?

A **Dockerfile** is a plain-text file with step-by-step instructions for building an image. Each instruction creates a **layer**, and layers are cached.

```bash
# Build an image from a Dockerfile in the current directory
docker build -t myapp:1.0 .
```

- The final `.` is the **build context** — the folder Docker sends to the daemon. Keep it small; use a `.dockerignore` file to exclude `node_modules`, `.git`, etc.
- Docker reuses cached layers for instructions that haven't changed, so **order matters**: put rarely-changing steps (installing dependencies) before frequently-changing ones (copying source code).

---

## 2. Dockerfile Instructions

| Instruction | Purpose |
|---|---|
| `FROM` | Base image to start from (must be first, after optional `ARG`). |
| `RUN` | Execute a command at **build time** (creates a layer). |
| `CMD` | Default command to run at **container start** (overridable). |
| `ENTRYPOINT` | The fixed executable for the container. |
| `COPY` | Copy files/dirs from the build context into the image. |
| `ADD` | Like `COPY`, but can also fetch URLs and auto-extract tarballs. |
| `WORKDIR` | Set the working directory for following instructions. |
| `ENV` | Set an environment variable (persists into the running container). |
| `ARG` | Define a build-time variable (not available at runtime). |
| `LABEL` | Add metadata (maintainer, version, etc.). |
| `USER` | Set the user that runs subsequent instructions / the container. |
| `EXPOSE` | Document which port the app listens on (does **not** publish it). |
| `VOLUME` | Declare a mount point for persistent data. |
| `HEALTHCHECK` | Define a command Docker runs to test container health. |
| `SHELL` | Change the default shell used by `RUN`. |
| `STOPSIGNAL` | Set the signal sent to stop the container. |

---

## 3. The Three Tricky Pairs

### `CMD` vs `ENTRYPOINT`

- **`ENTRYPOINT`** = the executable that always runs.
- **`CMD`** = default arguments (or default command) that are easy to override at `docker run`.

```dockerfile
ENTRYPOINT ["python", "app.py"]
CMD ["--port", "8080"]
# `docker run myimg` -> python app.py --port 8080
# `docker run myimg --port 9090` -> python app.py --port 9090
```

Use `ENTRYPOINT` for "this image always runs *this* program", and `CMD` for the default arguments.

### `COPY` vs `ADD`

- **`COPY`** — straightforward copy from build context. Prefer this.
- **`ADD`** — also supports remote URLs and **auto-extracts local tar files**. Only use `ADD` when you specifically need those features.

```dockerfile
COPY ./app /usr/src/app          # normal copy (preferred)
ADD  release.tar.gz /opt/app     # auto-extracts the tarball
```

### `ARG` vs `ENV`

- **`ARG`** — available only **during build**. Gone at runtime.
- **`ENV`** — set during build **and** present inside the running container.

```dockerfile
ARG VERSION=1.0          # build-time only
ENV APP_VERSION=$VERSION # promote it into the runtime environment
```

```bash
docker build --build-arg VERSION=2.0 -t myapp .
```

---

## 4. Always Prefer Exec Form

Two ways to write `RUN`, `CMD`, `ENTRYPOINT`:

```dockerfile
# Shell form — runs inside /bin/sh -c, so signals may not reach your app
CMD npm start

# Exec form (preferred) — runs directly as PID 1, receives signals correctly
CMD ["npm", "start"]
```

The **exec form** (JSON array) ensures your process is PID 1 and receives `SIGTERM` for graceful shutdown.

---

## 5. A Complete Annotated Example

```dockerfile
# Base image
FROM node:20-alpine

# Metadata
LABEL maintainer="you@example.com"

# Build-time arg promoted to a runtime env var
ARG APP_ENV=production
ENV NODE_ENV=$APP_ENV

# Set working directory
WORKDIR /usr/src/app

# Install dependencies FIRST (better cache use — changes less often than source)
COPY package*.json ./
RUN npm ci --only=production

# Now copy the application source
COPY . .

# Run as a non-root user for security
USER node

# Document the port the app listens on
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://localhost:3000/health || exit 1

# Default command (exec form)
CMD ["node", "server.js"]
```

---

## Quick Recap

- A Dockerfile builds an image **layer by layer**; order steps so caching helps you.
- Keep the **build context** small with `.dockerignore`.
- `ENTRYPOINT` = fixed program, `CMD` = default args; `COPY` over `ADD`; `ARG` = build-time, `ENV` = runtime.
- Prefer the **exec form** (`["cmd", "arg"]`) for signal handling.
- Run as a **non-root `USER`** and add a `HEALTHCHECK` for production images.
