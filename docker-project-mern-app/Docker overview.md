# MERN App Dockerized Project

This repository contains a complete **MERN stack application** fully containerized using **Docker** and **Docker Compose**.

---

## 🚀 Project Structure

```
docker-project-mern-app/
├── docker-compose.yml
├── frontend/
│   ├── Dockerfile
│   └── (React app)
└── node/
    ├── Dockerfile
    └── (Node.js + Express API)
```

---

## 🐳 Docker Compose Overview

Your `docker-compose.yml` sets up the following services:

### **1️⃣ MongoDB Container**
- Uses image `mongo:8.0.9-noble`
- Stores persistent data using a **named volume** `mongo_data`
- Runs inside custom network `mernapp-net`

### **2️⃣ Node.js Backend Container**
- Connects to MongoDB using the internal hostname:  
  `mongodb://mongo-container:27017/mernapp`
- Automatically restarts on failures (`restart: unless-stopped`)
- Shares same Docker network as other services

### **3️⃣ React Frontend (Nginx) Container**
- Build React app using multi-stage build
- Serves static files using Nginx
- Runs inside same Docker network

---

## 🔂 Docker Networks Explained

Docker Compose automatically creates a custom network named:

```
mernapp-net
```

This allows containers to communicate using **service names**:

| Container       | Hostname inside network |
|----------------|--------------------------|
| mongo-container | `mongo-container`       |
| node-container  | `node-container`        |
| react-container | `react-container`       |

Example connection string:

```
mongodb://mongo-container:27017/mernapp
```

No IP addresses are needed.

---

## 📦 Docker Volumes Explained

A named Docker volume is used:

```
mongo_data
```

It stores your MongoDB database files **persistently** even if a container is removed:

```
volumes:
  mongo_data:
```

View all volumes:

```
docker volume ls
```

Inspect volume:

```
docker volume inspect mongo_data
```

---

## ▶️ Run the Application

Start all services in detached mode:

```
docker compose up -d
```

Rebuild containers:

```
docker compose up --build -d
```

Stop all containers:

```
docker compose down
```

Stop and clear volumes:

```
docker compose down -v
```

---

## 🧪 Access the Application

| Service   | URL |
|-----------|-----|
| Frontend | http://localhost:3000 |
| Backend  | http://localhost:5000 |
| MongoDB  | localhost:27017 |

---

## 🛠 Entering Containers

### Enter React container:
```
docker exec -it react-container bash
```

### Enter Node container:
```
docker exec -it node-container bash
```

### Enter MongoDB shell:
```
docker exec -it mongo-container mongosh
```

---

## 🔍 Inspect Docker Network

To inspect the custom network created for the MERN app:

```
docker inspect docker-project-mern-app_mernapp-net
```

This shows:
- Network ID  
- Subnet & Gateway  
- Attached containers  
- DNS settings  
- IP allocation  

If you're unsure of the network name, list all networks:

```
docker network ls
```

---

## 🗄 Inspect Docker Volume

To inspect the persistent MongoDB data volume:

```
docker inspect docker-project-mern-app_mongo_data
```

This displays:
- Volume mount path  
- Driver  
- Labels  
- Storage location on your system  

To list all volumes:

```
docker volume ls
```

---

## 🧹 Remove Volume (Warning: Deletes Database!)

```
docker volume rm docker-project-mern-app_mongo_data
```

---

## 📌 Summary

| Resource | Inspect Command |
|----------|------------------|
| Network  | `docker inspect docker-project-mern-app_mernapp-net` |
| Volume   | `docker inspect docker-project-mern-app_mongo_data` |

---

## 🗑 View Data In Database 

Inside Mongo shell:

```
use mernapp
show collections
db.users.find().pretty()
db.employees.find().pretty()
```

---

## 📁 Why Nginx + nginx.conf in Frontend?

The line in the Dockerfile:

```
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

Allows:

- Custom routing rules  
- Single Page App fallback to `index.html`  
- Handling React Router paths  
- Compression / caching optimization  

Without it, you may get **"404 Not Found"** on page reloads.

---


## Author

Munagala Harish — MERN + Docker Project
