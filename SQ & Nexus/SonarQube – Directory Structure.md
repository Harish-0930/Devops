# SonarQube – Directory Structure & Explanation

## Directory Structure
```
bin/             – Startup scripts (linux/windows)
conf/            – sonar.properties & wrapper.conf
data/            – Internal storage and runtime data
elasticsearch/   – Elasticsearch engine used by SonarQube
extensions/      – Plugins and custom extensions
lib/             – Core SonarQube libraries
logs/            – Web, CE (compute engine), ES logs
temp/            – Temporary runtime files
web/             – Web UI static resources and services
```

## One-line purpose for each folder
- `bin/` – Platform-specific start/stop scripts.
- `conf/` – Main configuration files (sonar.properties).
- `data/` – Application data and embedded DB files.
- `elasticsearch/` – Bundled Elasticsearch node files.
- `extensions/plugins/` – Installed plugins (language analyzers, scanners).
- `lib/` – Core runtime libraries.
- `logs/` – Application and component logs (web, ce, es).
- `temp/` – Temporary files and caches.
- `web/` – Frontend web application artifacts.

## Docker Structure (common volumes)
```
/opt/sonarqube/
├── conf/
├── data/
├── extensions/
├── logs/
└── temp/
```

## Diagram
```
+---------------------------+
|        SONARQUBE          |
+---------------------------+
| conf/  -> settings        |
| data/  -> storage         |
| logs/  -> logs            |
| extensions/ -> plugins    |
+---------------------------+
```


End of Document
---

📘 **Author:** Munagala Harish  
📅 **Title:** *Directory Structure & Build Lifecycle*  
