# Nexus Repository Manager – Directory Structure & Explanation

## Directory Structure
```
bin/        – Start/stop scripts
etc/        – Configuration files (nexus.properties)
lib/        – Libraries required by Nexus
system/     – Internal components and OSGi bundles
deploy/     – Drop-in plugins for auto-deployment
public/     – Static UI frontend assets
data/       – Repository storage (blobs, db, cache)
log/        – Application logs
```

## One-line purpose for each folder
- `bin/` – Scripts to start/stop Nexus (nexus script).
- `etc/` – Configuration files including `nexus.properties`.
- `lib/` – Runtime libraries and dependencies.
- `system/` – Internal OSGi bundles and components.
- `deploy/` – Drop-in plugins you can deploy at runtime.
- `public/` – Static frontend resources.
- `data/` – The most important: blob stores, DB and repository data.
- `log/` – Nexus logs and access logs.

## Docker Structure (common volume)
```
/nexus-data/
├── db/
├── blobs/
├── cache/
├── restore-from-backup/
└── log/
```

## Diagram
```
+------------------------+
|        NEXUS           |
+------------------------+
| bin/      -> scripts   |
| etc/      -> config    |
| data/     -> repos     |
| log/      -> logs      |
+------------------------+
```



End of Document
---

📘 **Author:** Munagala Harish  
📅 **Title:** *Nexus Repository Manager – Directory Structure*  
