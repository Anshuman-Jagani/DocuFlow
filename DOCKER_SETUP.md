# Docker Setup Instructions

## Quick Start

### 1. Start PostgreSQL Database

```bash
docker-compose up -d
```

This will:
- Download PostgreSQL 14 Alpine image (if not already downloaded)
- Create a container named `docuflow-postgres`
- Start PostgreSQL on port 5432
- Create database `docprocessing`
- Set up persistent storage

### 2. Verify Database is Running

```bash
docker-compose ps
```

You should see:
```
NAME                  STATUS    PORTS
docuflow-postgres     Up        0.0.0.0:5432->5432/tcp
```

### 3. Check Database Health

```bash
docker-compose logs postgres
```

Look for: `database system is ready to accept connections`

### 4. Run Database Migrations

```bash
npm run migrate
```

### 5. Start the API Server

```bash
npm run dev
```

---

## Docker Commands

### Start Database
```bash
docker-compose up -d
```

### Stop Database
```bash
docker-compose down
```

### Stop and Remove Data (⚠️ Deletes all data)
```bash
docker-compose down -v
```

### View Logs
```bash
docker-compose logs -f postgres
```

### Access PostgreSQL CLI
```bash
docker-compose exec postgres psql -U postgres -d docprocessing
```

### Restart Database
```bash
docker-compose restart postgres
```

---

## Database Connection

Your `.env` file should have:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/docprocessing
DB_HOST=localhost
DB_PORT=5432
DB_NAME=docprocessing
DB_USER=postgres
DB_PASSWORD=password
```

---

## Troubleshooting

### Port 5432 Already in Use

If you have another PostgreSQL instance running:

```bash
# Stop local PostgreSQL (macOS with Homebrew)
brew services stop postgresql

# Or change the port in docker-compose.yml
ports:
  - "5433:5432"  # Use port 5433 instead

# Then update .env
DB_PORT=5433
```

### Container Won't Start

```bash
# Check what's using port 5432
lsof -i :5432

# Remove old containers
docker-compose down
docker-compose up -d
```

### Reset Database

```bash
# Stop and remove everything
docker-compose down -v

# Start fresh
docker-compose up -d

# Run migrations again
npm run migrate
```

---

## Optional: Run API in Docker Too

Uncomment the `api` service in `docker-compose.yml` and create a `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

Then run:
```bash
docker-compose up -d
```

Both API and database will run in containers!

---

## Data Persistence

Database data is stored in a Docker volume named `postgres_data`. This means:
- ✅ Data persists when you stop/start containers
- ✅ Data survives container restarts
- ❌ Data is deleted with `docker-compose down -v`

To backup data:
```bash
docker-compose exec postgres pg_dump -U postgres docprocessing > backup.sql
```

To restore:
```bash
docker-compose exec -T postgres psql -U postgres docprocessing < backup.sql
```
