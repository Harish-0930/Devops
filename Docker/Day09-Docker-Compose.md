# Day 09 — Docker Compose

> Today: what Docker Compose is, the structure of a `docker-compose.yml`, and the commands to run multi-container apps with a single command.

---

## 1. What is Docker Compose?

Real applications are rarely a single container — you might have a web app, a database, and a cache. **Docker Compose** lets you define a whole multi-container stack in one YAML file and run it with a single command.

You describe your **services, networks, and volumes** in `docker-compose.yml`, then `docker compose up` starts everything — correctly networked and in the right order.

> **`docker compose` vs `docker-compose`:** modern Docker ships Compose as a built-in plugin you invoke as `docker compose` (with a space). The older standalone `docker-compose` (with a hyphen) is the v1 Python tool. Commands are otherwise nearly identical — prefer the v2 form.

---

## 2. A Complete Example

```yaml
services:
  web:
    build: .                     # build from the local Dockerfile
    ports:
      - "8080:80"
    environment:
      - NODE_ENV=production
    depends_on:
      - db                       # start db before web
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost/health"]
      interval: 30s
      retries: 3

  db:
    image: postgres:16
    environment:
      - POSTGRES_PASSWORD=secret
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  db-data:                       # named volume, managed by Compose
```

Compose automatically creates a **user-defined network** for this stack, so `web` can reach `db` simply by the hostname `db`.

---

## 3. The Building Blocks

| Key | What it does |
|---|---|
| `services` | Each container in your app (web, db, cache…). |
| `image` / `build` | Use an existing image, or build from a Dockerfile. |
| `ports` | Publish container ports to the host (`host:container`). |
| `environment` | Set environment variables. |
| `env_file` | Load variables from a file. |
| `volumes` | Attach named volumes or bind mounts. |
| `networks` | Custom networks (otherwise a default one is created). |
| `depends_on` | Control start order (combine with `healthcheck` to wait for readiness). |
| `restart` | Restart policy (e.g. `unless-stopped`). |

---

## 4. Essential Commands

```bash
docker compose up                 # start the stack (foreground)
docker compose up -d              # start detached (background)
docker compose down               # stop and remove containers + networks
docker compose down -v            # ...also remove named volumes

docker compose ps                 # list the stack's containers
docker compose logs -f            # follow logs from all services
docker compose logs -f web        # logs from one service

docker compose build              # (re)build images
docker compose up -d --build      # rebuild then start

docker compose exec web sh        # shell into a running service
docker compose restart web        # restart one service
docker compose stop               # stop without removing
```

---

## 5. Scaling, Overrides & Profiles

```bash
# Run multiple instances of a service (behind a load balancer / proxy)
docker compose up -d --scale web=3
```

- **Override files:** Compose automatically merges `docker-compose.override.yml` on top of the base file — handy for dev-vs-prod differences. Use `-f` to combine specific files:
  ```bash
  docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
  ```
- **Profiles:** tag optional services so they only start when their profile is requested:
  ```yaml
  services:
    debugger:
      image: my-debug-tools
      profiles: ["debug"]
  ```
  ```bash
  docker compose --profile debug up -d
  ```

---

## 6. Typical Workflow

```bash
docker compose up -d --build      # build and launch everything
docker compose ps                 # confirm services are up/healthy
docker compose logs -f web        # watch the app
# ... make changes ...
docker compose up -d --build      # rebuild changed services
docker compose down               # tear it all down when done
```

---

## Quick Recap

- Compose defines a **multi-container stack** (services + networks + volumes) in one YAML file.
- Services on a Compose stack reach each other by **service name** (Compose makes a network for you).
- Core commands: **`up -d`, `down`, `ps`, `logs -f`, `up -d --build`, `exec`**.
- Use `--scale`, **override files**, and **profiles** for environment-specific and optional setups.
- Prefer `docker compose` (v2 plugin) over the old `docker-compose`.
