# Day 08 — Docker Volumes, Types & Commands

> Today: how to persist data beyond a container's life, the types of storage, their differences, and the commands (including backup & restore).

---

## 1. Why Volumes?

A container's writable layer is **ephemeral** — delete the container and that data is gone. Volumes (and bind mounts) let data **outlive** the container, and let multiple containers share data.

---

## 2. Types of Storage

| Type | Where it lives | Managed by Docker? | Best for |
|---|---|---|---|
| **Named volume** | Docker's managed area (`/var/lib/docker/volumes/`) | ✅ Yes | Databases, app data — the default choice |
| **Anonymous volume** | Same area, but random name | ✅ Yes | Throwaway data tied to one container |
| **Bind mount** | Any path on the host you choose | ❌ No (you manage the path) | Dev — mounting source code into a container |
| **tmpfs** | Host RAM (not on disk) | ✅ Yes | Secrets / temp data that must never persist |

### Key difference: volume vs bind mount

- A **named volume** is managed by Docker, portable, and the recommended way to persist app data.
- A **bind mount** maps a specific host directory into the container — great for live-reloading code in development, but tied to that host's filesystem layout.

---

## 3. Working With Named Volumes

```bash
# Create a named volume
docker volume create appdata

# Use it — data written to /var/lib/postgresql/data persists
docker run -d --name db -v appdata:/var/lib/postgresql/data postgres:16

# Modern --mount syntax (more explicit)
docker run -d --name db \
  --mount source=appdata,target=/var/lib/postgresql/data postgres:16
```

---

## 4. Bind Mounts (Development)

```bash
# Map the current host directory into the container
docker run -d --name web -v "$(pwd)":/usr/src/app node:20-alpine

# --mount form
docker run -d --name web \
  --mount type=bind,source="$(pwd)",target=/usr/src/app node:20-alpine
```

Edit code on the host and the container sees it immediately — ideal for local development.

---

## 5. Anonymous & tmpfs

```bash
# Anonymous volume (no name given)
docker run -d -v /var/lib/data myapp

# tmpfs — stored in RAM, vanishes when the container stops
docker run -d --tmpfs /app/cache myapp
docker run -d --mount type=tmpfs,target=/app/cache myapp
```

---

## 6. Managing Volumes

```bash
docker volume ls                 # list volumes
docker volume inspect appdata    # details (mountpoint, driver)
docker volume rm appdata         # remove a volume
docker volume prune              # remove all unused volumes
```

---

## 7. Backup & Restore a Volume

A common interview/ops task. Use a throwaway container to tar the volume's contents.

```bash
# BACKUP: tar the volume's data to a file on the host
docker run --rm \
  -v appdata:/data \
  -v "$(pwd)":/backup \
  alpine tar czf /backup/appdata-backup.tar.gz -C /data .

# RESTORE: extract the backup into a (new) volume
docker run --rm \
  -v appdata:/data \
  -v "$(pwd)":/backup \
  alpine sh -c "cd /data && tar xzf /backup/appdata-backup.tar.gz"
```

How it works: mount the volume at `/data` and the host folder at `/backup`, then tar one into the other using a tiny `alpine` container that exits (`--rm`) when done.

---

## 8. Volume Lifecycle Tip

Removing a container does **not** remove named volumes by default — that's the point (your data survives). To remove a container *and* its anonymous volumes:

```bash
docker rm -v <container>
```

---

## Quick Recap

- Storage types: **named volume** (default for persistence), **anonymous**, **bind mount** (dev), **tmpfs** (RAM/secrets).
- **Volume = Docker-managed & portable**; **bind mount = a specific host path**.
- Manage with `volume create / ls / inspect / rm / prune`.
- Back up by tarring the volume through a short-lived `alpine` container.
