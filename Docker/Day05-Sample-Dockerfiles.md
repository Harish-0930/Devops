# Day 05 — Sample Dockerfiles

> Today: ready-to-adapt Dockerfiles for common stacks. Each one shows the conventions that matter for that language. (Multi-stage versions are on Day 06.)

---

## 1. Node.js (Express) App

```dockerfile
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy dependency manifests first to maximize layer caching
COPY package*.json ./
RUN npm ci --only=production

# Then copy the rest of the source
COPY . .

# Run as the built-in non-root user
USER node

EXPOSE 3000
CMD ["node", "server.js"]
```

---

## 2. Python (Flask / FastAPI) App

```dockerfile
FROM python:3.12-slim

# Keep Python from writing .pyc files and buffering stdout
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install dependencies first (cache-friendly)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

EXPOSE 8000
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "app:app"]
```

---

## 3. Java (Spring Boot) — running a pre-built JAR

```dockerfile
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Expecting the built artifact in target/
COPY target/app.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

## 4. Static Website served by Nginx

```dockerfile
FROM nginx:1.27-alpine

# Replace the default site with your static files
COPY ./site/ /usr/share/nginx/html/

# Optional: custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
# nginx image already has a sensible CMD; no need to override
```

---

## 5. Go App (compiled binary)

```dockerfile
FROM golang:1.22-alpine

WORKDIR /src

# Cache modules
COPY go.mod go.sum ./
RUN go mod download

# Build
COPY . .
RUN go build -o /bin/app ./cmd/app

EXPOSE 8080
ENTRYPOINT ["/bin/app"]
```

> A Go binary is the perfect candidate for a **multi-stage build** (Day 06) — compile in the SDK image, then ship just the binary in a tiny `scratch` or `alpine` image.

---

## 6. Simple Shell / Cron-style Worker

```dockerfile
FROM alpine:3.20

RUN apk add --no-cache bash curl

WORKDIR /app
COPY ./scripts/ ./scripts/
RUN chmod +x ./scripts/*.sh

# Exec form so the process is PID 1 and handles signals
ENTRYPOINT ["./scripts/run.sh"]
```

---

## Patterns Common to All of These

1. **Pick a small base** (`-alpine`, `-slim`) when you can.
2. **Copy dependency manifests before source** so dependency layers stay cached.
3. **Use `--no-cache` flags** (`npm ci`, `pip --no-cache-dir`) to avoid bloating layers.
4. **Run as non-root** where the base image supports it.
5. **Use exec-form `CMD`/`ENTRYPOINT`** for correct signal handling.
6. **`EXPOSE`** the port to document intent (publish it at `docker run` with `-p`).

---

## Quick Recap

- The shape is the same across stacks: **base → deps → source → run**.
- Order instructions for **cache efficiency** (deps before code).
- Compiled languages (Go, Java, Rust) benefit most from **multi-stage builds** — next up on Day 06.
