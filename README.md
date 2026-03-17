![Django](https://img.shields.io/badge/Django-%23092E20.svg?logo=django&logoColor=white)
![DRF](https://img.shields.io/badge/Django_REST-FF1709?logo=django&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?logo=JSON%20web%20tokens)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?logo=redis&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=fff)
![React](https://img.shields.io/badge/React-%2320232a.svg?logo=react&logoColor=%2361DAFB)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?logo=axios&logoColor=white)
![NodeJS](https://img.shields.io/badge/Node.js-6DA55F?logo=node.js&logoColor=white)
![npm](https://img.shields.io/badge/npm-CB3837?logo=npm&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-009639?logo=nginx&logoColor=white)

# 🏭 Factory Management System (FMS)

A Full-stack **Factory Management System (FMS)** built using **Django**, **React**, **PostgreSQL**, **Redis**, and **Docker**. Designed for seamless real-time operations, this web application provides an interactive platform for production monitoring, equipment management, labor allocation, and inventory tracking, while also offering robust administrative capabilities for supervisors, managers, and production staff. Built with comprehensive REST **API endpoints**, **WebSocket** real-time broadcasting, and **Google OAuth2 authentication** for secure access.

![picture](pic.jpg)

## ✨ Key Features

### 🏭 Core Manufacturing Operations

- **Real-Time Production Monitoring** — Live dashboards showing machine status, production progress, and KPIs
- **Production Scheduling** — Manage production lines and schedules with workflow tracking
- **Equipment Management** — Full machine lifecycle with operator assignment (8-hour auto-removal), maintenance scheduling
- **Manufacturing Processes** — Define and link standard manufacturing processes to products

### 📦 Inventory Management

- **Material Tracking** — Real-time stock levels with automatic low-stock alerts
- **Supplier Management** — Maintain supplier database with contact information
- **Purchase Orders** — Full procurement workflow (Draft → Ordered → Received/Cancelled)
- **Material Consumption** — Track material usage against tasks or production schedules
- **Invoice Management** — File upload support for order documentation

### 👥 Labor & Workforce Management

- **Labor Allocation** — Track employee hours across projects, tasks, and production lines
- **Skill Matrix** — Record and manage employee competencies across 12 skill categories
- **Project Assignment** — Assign employees to projects with automatic labor hour calculation
- **Time Management** — Daily labor allocation with automatic calculations

### 📊 Project & Task Management

- **Project Lifecycle** — Full status tracking (Planning → In Progress → Completed/On Hold/Cancelled)
- **Task Dependencies** — Complex task relationships with self-referential dependencies
- **Resource Allocation** — Automatic labor allocation on task assignment
- **Progress Tracking** — Real-time task and project status updates

### 🔐 Security & Access Control

- **6-Role RBAC System** — Admin, Manager, Supervisor, Operator, Technician, Purchasing
- **JWT Authentication** — 30-minute token lifetime with automatic rotation and blacklisting
- **Google OAuth 2.0** — Social authentication with pre-registration validation
- **Object-Level Permissions** — Fine-grained access control at the API and WebSocket level
- **Automated Role Management** — Roles automatically upgrade/downgrade based on appointments
- **WebSocket Security** — Socket handshake with auth token.

### 📡 Real-Time Capabilities

- **WebSocket Broadcasting** — Instant updates to all connected clients on CRUD operations
- **Permission-Filtered Updates** — Each user only receives data they're authorized to see
- **Live Dashboard** — Real-time statistics and KPI updates without page refresh
- **Automatic Sync** — Backend changes instantly reflect in all connected frontends

### 📱 User Experience

- **Responsive Design** — Mobile, tablet, and desktop support with dark theme
- **Lazy-Loaded Pages** — Fast load times with on-demand component loading
- **Intuitive Navigation** — Role-based sidebar with dynamic menu items
- **Bulk Operations** — CSV export and import for data management

---

## 🛠️ Tech Stack

| Layer              | Technology                                                   |
| ------------------ | ------------------------------------------------------------ |
| **Backend**        | Python 3.14, Django 5.2.6, Django REST Framework 3.16.1      |
| **Real-Time**      | Django Channels 4.3.1, Redis 7, Daphne (ASGI)                |
| **Auth**           | SimpleJWT 5.5.1, Google OAuth 2.0 (django-allauth)           |
| **Frontend**       | React 19.1.1, Vite 7.1.7 (SWC), Tailwind CSS 3.4.18          |
| **Database**       | SQLite (dev / main branch) · PostgreSQL 14 (docker branches) |
| **Infrastructure** | Docker, Docker Compose, Nginx 1.25                           |

## 🏗️ System Architecture

![pic2](pic2.png)

---

## 🚀 Getting Started

### 📋 Prerequisites

| Tool               | Version | Link                                                         |
| ------------------ | ------- | ------------------------------------------------------------ |
| **Git**            | Latest  | [git-scm.com](https://git-scm.com/downloads)                 |
| **Python**         | ≥ 3.14  | [python.org](https://www.python.org/downloads/)              |
| **Node.js**        | ≥ 18    | [nodejs.org](https://nodejs.org/en/download)                 |
| **Docker Desktop** | Latest  | [docker.com](https://www.docker.com/products/docker-desktop) |
| **Redis**          | ≥ 7     | [redis.io](https://redis.io/download/)                       |
| **PostgreSQL**     | ≥ 14    | [postgresql.org](https://www.postgresql.org/download/)       |

> **Note (Windows Users):** If using Python 3.14, also install:
>
> - [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) (C++ compiler)
> - [PostgreSQL](https://www.postgresql.org/download/windows/) (for development headers)

---

## ⛓️‍💥 Project Setup

```bash
git clone https://github.com/kevinThulnith/Factory-Management-System.git
cd Factory-Management-System
```

### ⚙️ Backend Setup

1. Go to backend directory:

   ```sh
   cd backend
   ```

2. 🔧 Setting up environment variables

   The backend requires a `.env` file before running. These files are **not committed** — create them manually.

#### 🪄 Google OAuth Credentials

Required for both Google sign-in and the `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `VITE_CLIENT_ID` variables.

1. Go to [Google Cloud Console](https://console.cloud.google.com/) and create a project (or select an existing one).
2. Navigate to **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**.
3. Set **Application type** to **Web application**.
4. Under **Authorised JavaScript origins** add:

   ```sh
   http://localhost
   http://localhost:5173
   ```

5. Under **Authorised redirect URIs** add:

   ```sh
   http://localhost
   http://localhost:5173
   http://localhost:8000/accounts/google/login/callback/
   ```

6. Click **Create** — copy the **Client ID** and **Client Secret** into the env files below.

> Only email addresses that already exist as users in the system can sign in via Google. New Google accounts are rejected by the custom adapter.

#### 🔑 Django Secret Key

Generate a secure key with:

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

---

**`backend/.env`**

Create a `.env` file in the backend directory with the following content:

```env
DEBUG=True
SECRET_KEY=your-django-secret-key        # ← generated above

# Comma-separated, no spaces
ALLOWED_HOSTS=localhost,127.0.0.1,localhost:5173,localhost:8000

# Google OAuth — from Google Cloud Console (step 6 above)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5173

# Redis (defaults shown — change if Redis runs elsewhere)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

3. 📦 Download required packages

   ```sh
   pip install uv
   uv sync --frozen
   ```

4. 🗄️ Run database migrations and create super-user

   ```sh
   uv run manage.py migrate
   uv run manage.py createsuperuser
   ```

5. 🌱 Run data seeder scripts (to populate initial data)

   ```sh
   uv run scripts/script1.py
   uv run scripts/script2.py
   uv run scripts/script3.py
   uv run scripts/script4.py
   uv run scripts/script5.py
   uv run scripts/script6.py
   uv run scripts/script7.py
   uv run scripts/script8.py
   uv run scripts/script9.py
   uv run scripts/script10.py
   uv run scripts/script11.py
   ```

6. 🚀 Run backend server

   ```sh
   uv run daphne -b 0.0.0.0 -p 8000 backend.asgi:application
   ```

   Backend will be available at: `http://localhost:8000`

---

### 🎨 Frontend Setup

1. Go to frontend directory:

   ```sh
   cd ../frontend
   ```

2. 📦 Install dependencies

   ```sh
   npm install
   ```

3. 🔧 Create frontend `.env` file

   Create `frontend/.env` with:

   ```env
   VITE_WS_URL="ws://localhost:8000"
   VITE_API_URL="http://localhost:8000"
   VITE_CLIENT_ID=your-google-client-id  # ← from Google Cloud Console
   ```

4. ▶️ Run development server

   ```sh
   npm run host
   ```

   Frontend will be available at: `http://localhost:5173`

---

## 🌿 Branch Strategy

| Branch           | Database   | Frontend                               | Notes                |
| ---------------- | ---------- | -------------------------------------- | -------------------- |
| `main`           | SQLite     | Vite dev server                        | Local development    |
| `docker-compose` | PostgreSQL | Separate container                     | Full docker stack    |
| `docker-slim`    | PostgreSQL | Dist files in volume, served via Nginx | Optimized production |

---

## 🐳 Docker Setup

Create `.env` and `.env.prod` files in project root directory. Add both frontend and backend `.env` file data in both of them.

```env
# frontend .env data

# backend .env data
GOOGLE_CALLBACK_URL = "http://localhost" # must set correctly
```

For `.env.prod` add this

```env
# Database Settings
DATABASE_ENGINE=postgresql_psycopg2
DATABASE_NAME=FmsDatabase
DATABASE_USERNAME=FmsDbUser
DATABASE_PASSWORD=FmsDB4080
DATABASE_HOST=fms-database
DATABASE_PORT=5432
DATABASE_URL=postgresql://FmsDbUser:FmsDB4080@fms-database:5432/FmsDatabase

# Postgres Settings
POSTGRES_DB=FmsDatabase
POSTGRES_USER=FmsDbUser
POSTGRES_PASSWORD=FmsDB4080

# Redis Settings
REDIS_HOST=fms-redis
REDIS_PORT=6379
```

For `.env` add this

```env
# Postgres Settings
POSTGRES_DB=FmsSlimDatabase
POSTGRES_USER=FmsSlimDbUser
POSTGRES_PASSWORD=FmsSlimDB4080

# Redis Settings
REDIS_HOST=fms-slim-redis
REDIS_PORT=6379

# Database Settings
DATABASE_ENGINE=postgresql_psycopg2
DATABASE_NAME=FmsSlimDatabase
DATABASE_USERNAME=FmsSlimDbUser
DATABASE_PASSWORD=FmsSlimDB4080
DATABASE_HOST=fms-slim-database
DATABASE_PORT=5432
DATABASE_URL=postgresql://FmsSlimDbUser:FmsSlimDB4080@fms-slim-database:5432/FmsSlimDatabase
```

> 🖥️ Make sure **Docker Desktop** is running before executing the commands below.

### 🐙 docker-compose branch

Switch branch

```sh
git switch docker-compose
```

Create | Run docker setup

```sh
docker-compose -p fms --env-file .env.prod up --build -d
```

### 🪶 docker-slim branch

Switch branch

```sh
git switch docker-slim
```

Create | Run docker setup

```sh
docker-compose -p fmsslim --env-file .env up --build -d
```

---

## 📖 API Documentation

Once the backend is running, explore the API at:

| Interface       | URL                                            |
| --------------- | ---------------------------------------------- |
| **Swagger UI**  | `http://localhost:8000/api/schema/swagger-ui/` |
| **ReDoc**       | `http://localhost:8000/api/schema/redoc/`      |
| **Admin Panel** | `http://localhost:8000/admin/`                 |

---

## 🔌 WebSockets

The system uses **Django Channels** over **ASGI (Daphne)** to provide real-time bidirectional communication between the server and all connected clients.

### ⚡ How It Works

```
Client ──── ws://localhost:8000/ws/<resource>/ ────▶ Django Channels (Redis Layer)
  ▲                                                          │
  └──────────── broadcast to authorized clients ◀────────────┘
```

1. 🤝 Client connects and sends a **JWT token** in the WebSocket handshake
2. 🔐 Server **validates the token** — unauthenticated connections are rejected
3. 📡 On any **CRUD operation** (create / update / delete), the backend broadcasts the change
4. 🎯 Each user only receives updates for **resources they are authorized to see**
5. ⚛️ The React frontend automatically **updates state** without a page refresh

### 🌐 Connection URL

```sh
ws://localhost:8000/ws/<resource>/
```

Configure the base WebSocket URL in `frontend/.env`:

```env
VITE_WS_URL="ws://localhost:8000"
```

### 🔐 Authentication

WebSocket connections are secured with JWT. The token is passed during the handshake:

```js
const socket = new WebSocket(`${import.meta.env.VITE_WS_URL}/ws/<resource>/`);
```

> ⚠️ The server **rejects** any connection attempt that does not carry a valid, non-expired JWT token.

### 📋 What Gets Broadcast

| Event        | Trigger                                      | Payload        |
| ------------ | -------------------------------------------- | -------------- |
| `created`    | New record added to the database             | New object     |
| `updated`    | Existing record modified                     | Updated object |
| `deleted`    | Record removed from the database             | Object ID      |
| `stats`      | Any change that affects dashboard KPIs       | Stats object   |

### 🛠️ Backend Stack

| Component          | Role                                         |
| ------------------ | -------------------------------------------- |
| **Django Channels** | WebSocket consumer routing & group layer    |
| **Daphne (ASGI)**  | Async server — handles WS + HTTP together    |
| **Redis**          | Channel layer backend for message passing    |

---

## 🐛 Troubleshooting

### ❌ Redis Connection Error

- Ensure Redis is running on `localhost:6379`
- Update `REDIS_HOST` and `REDIS_PORT` in `backend/.env` if Redis is elsewhere

### ❌ Database Error

- Run migrations: `uv run manage.py migrate`
- For PostgreSQL: ensure it's running and credentials are correct in `.env`

### ❌ CORS / WebSocket Issues

- Add your frontend URL to `ALLOWED_HOSTS` in `backend/.env`
- WebSockets require Daphne — Django's built-in dev server won't work

### ❌ Google OAuth Not Working

- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `backend/.env`
- Ensure redirect URIs in Google Cloud Console exactly match those in setup

### ❌ Python Build Errors (Windows)

- Install [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) with C++ workload
- Install [PostgreSQL](https://www.postgresql.org/download/windows/) for development headers

---

## 📚 Project Structure

```sh
Factory-Management-System/
├── 🐍 backend/              # Django REST API & WebSockets
│   ├── manage.py
│   ├── pyproject.toml
│   ├── .env                # ← Create this (not in repo)
│   ├── scripts/            # Data seeder scripts
│   └── ...
├── ⚛️  frontend/            # React + Vite application
│   ├── package.json
│   ├── .env               # ← Create this (not in repo)
│   └── ...
├── 🐳 docker-compose.yml   # Docker | Nginx orchestration on branches except `main`
├── 🛡️ nginx.conf
└── 📄 README.md
```

---

## 🤝 Contributing

1. 🍴 Fork the repository
2. 🌿 Create a feature branch: `git checkout -b feature/your-feature`
3. ✅ Commit your changes: `git commit -m "Add your feature"`
4. 📤 Push to your branch: `git push origin feature/your-feature`
5. 📬 Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 📞 Support & Contact

For issues, questions, or suggestions, please open a ticket at:
👉 [GitHub Issues](https://github.com/kevinThulnith/Factory-Management-System/issues)
