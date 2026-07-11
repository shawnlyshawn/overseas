# Overseas Mobility Management System

## Run the project with Docker

### 1. Start Docker Desktop

Make sure Docker Desktop is running before starting the project.

### 2. Open the project in VS Code

Open the `overseas` project folder in Visual Studio Code.

### 3. Open a new terminal

Move to the project root directory.

```bash
cd path/to/overseas
```

Example for Windows PowerShell:

```powershell
cd C:\Users\westh\overseas
```

### 4. Reset the database

```bash
docker compose down -v
```

This removes the existing containers, network, and MongoDB volume.

> This command deletes all existing MongoDB data.

### 5. Build and start the containers

```bash
docker compose up --build -d
```

This builds and starts the MongoDB, backend, and frontend containers in the background.

### 6. Insert seed data

```bash
docker compose exec backend npm run seed
```

### 7. Check the container status

```bash
docker compose ps
```

Make sure the MongoDB, backend, and frontend containers show `Up`.

### 8. Check the backend logs

```bash
docker compose logs backend
```

Check that the backend is running normally and connected to MongoDB.

### 9. Check the frontend logs

```bash
docker compose logs frontend
```

Check that the Angular frontend was built successfully.

### 10. Refresh MongoDB Compass

Connect MongoDB Compass to:

```text
mongodb://localhost:27017/overseas
```

Refresh the database after inserting the seed data.

## Application URLs

- Frontend: http://localhost:4200
- Backend: http://localhost:3000
- MongoDB: mongodb://localhost:27017/overseas

Now you can use the application.

## Stop the application

Open a terminal in the project root directory and run:

```bash
docker compose down
```

This stops and removes the containers and network, but keeps the MongoDB volume.

## Run the application again

When the database has already been initialized, run:

```bash
docker compose up -d
```

You do not need to insert the seed data again unless the MongoDB volume was deleted.

## Reset the database again

To completely reset the database:

```bash
docker compose down -v
docker compose up --build -d
docker compose exec backend npm run seed
```