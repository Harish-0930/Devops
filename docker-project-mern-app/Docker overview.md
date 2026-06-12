# 🚀 MERN Stack Application with Docker & Docker Compose

This project is a complete **MERN application** (MongoDB, Express.js, React.js, Node.js) fully containerized using **Docker** and **Docker Compose**.

The application includes:

* ✔ Node.js + Express backend (API + JWT Auth)
* ✔ React frontend (served via Nginx)
* ✔ MongoDB as database
* ✔ Custom Docker network
* ✔ Auto-restart policies
* ✔ Named volumes for MongoDB persistence

---

## 📁 **Project Structure**

```
docker-project-mern-app/
│── docker-compose.yml
│── frontend/
│   ├── Dockerfile
│   ├── src/
│   └── public/
│
└── node/
    ├── Dockerfile
    ├── app.js
    ├── config/
    ├── models/
    ├── uploads/
    └── package.json
```

## 🐳 Docker Compose Overview

`docker-compose.yml` sets up the following services:

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


### **Services included**

| Service  | Description                | Port  |
| -------- | -------------------------- | ----- |
| mongo    | MongoDB database           | 27017 |
| backend  | Node.js + Express API      | 5000  |
| frontend | React app served via Nginx | 3000  |

---


# 🐳 Docker Setup

## 1️⃣ **Build and run all containers (detached mode)**

```
docker compose up --build -d
```

## 2️⃣ **Stop all containers**

```
docker compose down
```

## 3️⃣ **Stop and delete volumes (DB data also cleared)**

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

# ⚙️ Backend Environment Variable

The backend connects to MongoDB using:

```
MONGO_URL=mongodb://mongo-container:27017/mernapp
```

This is automatically passed from `docker-compose.yml`.

---

# 📦 Useful Docker Commands

### 👉 Enter Mongo container shell

```
docker exec -it mongo-container bash
```

### 👉 Enter Node container shell

```
docker exec -it node-container bash
```

### 👉 Enter React container

```
docker exec -it react-container bash
```

---

# 🗄️ Working With MongoDB

### Enter Mongo container shell

```
docker exec -it mongo-container bash
```

### Show databases:

```
mongosh --host localhost
show dbs
```

### Use your DB:

```
use mernapp
```

### Show collections:

```
show collections
```

### To delete all data (Dangerous ⚠️)

```
db.dropDatabase()
```
## 🗑 View Data In Database 

Inside Mongo shell:

```
use mernapp
show collections
db.users.find().pretty()
db.employees.find().pretty()
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


---

# 🔧 Why Nginx is used for frontend?

React builds production files inside:

```
/app/dist  (or /app/build)
```

These cannot run directly — so Nginx serves them as static files.
Hence, this line is required in Dockerfile:

```
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

It ensures:

* Proper routing (`/`, `/login`, `/register`, `/dashboard`)
* Avoids 404 Not Found error
* Handles React BrowserRouter paths correctly

---

# 📝 Nginx Config Example (if required)

```
server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;

    location / {
        try_files $uri /index.html;
    }
}
```

---

# 📌 How to Check Logs

### Backend logs:

```
docker logs node-container
```

### MongoDB logs:

```
docker logs mongo-container
```

### Frontend logs:

```
docker logs react-container
```

---

# 🎯 Deployment Ready

This project is fully dockerized and can be deployed on:

* AWS EC2
* Azure VM
* Google Cloud VM
* DigitalOcean
* Any Docker-compatible server
