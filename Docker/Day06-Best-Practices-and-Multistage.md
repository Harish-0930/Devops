# Day 06 — Best Practices & Multi-Stage Builds
---

## 1. Docker Best Practices

### 1. Use small, specific base images
Prefer `node:20-alpine` over `node:20`, and pin a version instead of `:latest`. Smaller bases mean faster pulls and a smaller attack surface.

### 2. Leverage the build cache — order matters
Put instructions that change rarely (installing dependencies) **before** instructions that change often (copying source). A change busts the cache for that layer and everything after it.

### 3. Use a `.dockerignore`
Keep the build context small and avoid leaking secrets:
```
.git
node_modules
*.log
.env
Dockerfile
```

### 4. Minimize layers and clean up in the same `RUN`
```dockerfile
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*
```
Cleaning up in a *separate* `RUN` doesn't shrink the image — the files already live in an earlier layer.

### 5. Run as a non-root user
```dockerfile
RUN addgroup -S app && adduser -S app -G app
USER app
```

### 6. One concern per container
A container should run **one** main process (a web server, *or* a database — not both). It keeps scaling, logging, and restarts simple.

### 7. Prefer exec form for `CMD`/`ENTRYPOINT`
```dockerfile
CMD ["node", "server.js"]   # not: CMD node server.js
```
So your process is PID 1 and receives `SIGTERM` for graceful shutdown.

### 8. Don't bake secrets into images
Never `COPY` a `.env` or hardcode credentials. Use build secrets, runtime env vars, or a secrets manager.

### 9. Tag images meaningfully
Use semantic or commit-based tags (`myapp:1.4.2`, `myapp:git-9f3a1c`) so deployments are traceable. `:latest` is ambiguous.

### 10. Add a `HEALTHCHECK`
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:8080/health || exit 1
```

> **PID 1 note:** the process you launch becomes PID 1, which must reap zombie processes and forward signals. If yours doesn't, add a lightweight init like `tini` (`docker run --init ...`).

---

## 2. Multi-Stage Builds

The problem: build tools (compilers, SDKs, dev dependencies) make images huge — but you only need them to *build*, not to *run*.

A **multi-stage build** uses multiple `FROM` statements. You build in a heavy "builder" stage, then copy only the finished artifact into a tiny final image.

### Go example — from ~800 MB to ~10 MB

```dockerfile
# ---------- Stage 1: build ----------
FROM golang:1.22-alpine AS builder
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /bin/app ./cmd/app

# ---------- Stage 2: runtime ----------
FROM alpine:3.20
# Copy ONLY the compiled binary from the builder stage
COPY --from=builder /bin/app /bin/app
EXPOSE 8080
ENTRYPOINT ["/bin/app"]
```

The final image contains just Alpine + your binary. None of the Go toolchain ships to production.

### Node example — build assets, ship only what's needed

```dockerfile
# ---------- Stage 1: build ----------
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---------- Stage 2: runtime ----------
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

### Key multi-stage tricks

- Name stages with `AS <name>` and pull from them with `COPY --from=<name>`.
- You can also copy from an external image: `COPY --from=nginx:alpine /etc/nginx/nginx.conf ./`
- Build a specific stage only: `docker build --target builder -t myapp:build .`

---

## 3. Build Args & Secrets

```bash
# Build-time variable
docker build --build-arg VERSION=2.0 -t myapp:2.0 .

# Build without cache
docker build --no-cache -t myapp .
```

For secrets at build time, use BuildKit instead of `ARG` (which would leak into image history):

```dockerfile
# syntax=docker/dockerfile:1.7
RUN --mount=type=secret,id=npmtoken \
    NPM_TOKEN=$(cat /run/secrets/npmtoken) npm ci
```

```bash
DOCKER_BUILDKIT=1 docker build --secret id=npmtoken,src=./token.txt -t myapp .
```

---

## Quick Recap

- Small bases, good layer ordering, `.dockerignore`, single-`RUN` cleanup, non-root user, exec form, no baked secrets, meaningful tags, health checks.
- **Multi-stage builds** = build in a heavy stage, `COPY --from` only the artifact into a tiny final image. Biggest single win for image size.
- Use **BuildKit secrets**, not `ARG`, for build-time credentials.
