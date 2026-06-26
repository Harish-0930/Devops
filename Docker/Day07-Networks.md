# Day 07 — Docker Networks & Types of Networks

> Today: how containers talk to each other and the outside world, the network drivers (types), and the commands to manage them.

---

## 1. Why Networking Matters

By default every container gets its own network namespace — its own IP, interfaces, and routing. Docker networks control **which containers can reach each other** and **how they reach the outside world**.

---

## 2. Types of Networks (Drivers)

| Driver | Use it for | Notes |
|---|---|---|
| **bridge** | Default for standalone containers on a single host | Containers get private IPs; reach the outside via NAT. |
| **host** | Remove network isolation; share the host's network stack | No port mapping; container uses host ports directly. Linux only. |
| **none** | Completely disable networking | The container has only a loopback interface. |
| **overlay** | Connect containers across **multiple hosts** | Used by Docker Swarm / multi-host setups. |
| **macvlan** | Give a container its own MAC and appear as a physical device on the LAN | For legacy apps that need to be on the physical network. |
| **ipvlan** | Similar to macvlan, sharing the parent's MAC | Useful where MAC limits exist. |

```bash
docker network ls           # list networks
docker network inspect bridge
```

---

## 3. The Default Bridge vs a User-Defined Bridge

This is the most important practical distinction.

| | Default `bridge` | User-defined bridge (recommended) |
|---|---|---|
| DNS by name | ❌ No — containers can't resolve each other by name | ✅ Yes — built-in DNS, reach containers by **container name** |
| Isolation | Shared by all default containers | Isolated to the containers you attach |
| Config | Limited | Fully configurable |

```bash
# Create a user-defined bridge
docker network create mynet

# Run containers on it — they can now resolve each other by name
docker run -d --name db  --network mynet postgres:16
docker run -d --name web --network mynet myapp

# Inside 'web', the hostname "db" resolves to the db container automatically
```

> On a user-defined bridge, **service discovery by name just works** — no need to hardcode IPs. This is why Docker Compose creates a user-defined network for you.

---

## 4. Port Mapping (Publishing)

To reach a container from outside the host, **publish** its port:

```bash
docker run -d -p 8080:80 nginx
#              ^host ^container
```

- `-p 8080:80` → host port 8080 forwards to container port 80.
- `-p 80` → publish to a random host port (`docker port <name>` shows it).
- `-P` → publish all `EXPOSE`d ports to random host ports.

**`EXPOSE` ≠ publish:** `EXPOSE` in a Dockerfile only *documents* the port. You still need `-p` at runtime to actually map it.

---

## 5. Managing Networks

```bash
docker network create mynet                 # create
docker network ls                           # list
docker network inspect mynet                # details (subnet, connected containers)
docker network connect mynet web            # attach a running container
docker network disconnect mynet web         # detach
docker network rm mynet                     # remove
docker network prune                        # remove all unused networks
```

---

## 6. Quick Decision Guide

- **Single host, containers need to talk by name?** → user-defined **bridge**.
- **Need maximum network performance / host ports directly?** → **host**.
- **Container should have no network at all?** → **none**.
- **Containers spread across multiple hosts?** → **overlay**.
- **App must appear as a real device on the LAN?** → **macvlan**.

---

## Quick Recap

- Network **drivers** = bridge, host, none, overlay, macvlan, ipvlan.
- Use a **user-defined bridge** so containers resolve each other by **name** (the default bridge can't).
- **Publish** ports with `-p host:container`; `EXPOSE` alone does not publish.
- Manage with `network create / ls / inspect / connect / disconnect / rm / prune`.
