# Overseas Mobility Application

## Run the Project with Docker

### Prerequisites

* Docker Desktop
* Visual Studio Code
* MongoDB Compass

### Important

All Docker commands must be run from the `overseas` project directory, where the `docker-compose.yml` file is located.

If the project is inside another folder, first move to the `overseas` directory:

```bash
cd overseas
```

### Start the Application

1. Start Docker Desktop.

2. Open the project in Visual Studio Code.

3. Open a new terminal.

4. Make sure that the terminal is currently in the `overseas` project directory.

5. Reset the existing containers and MongoDB volume:

```bash
docker compose down -v
```

This command removes the existing containers and MongoDB volume and resets the database.

6. Build the Docker images and start the frontend, backend, and MongoDB containers:

```bash
docker compose up --build -d
```

7. Insert the seed data into MongoDB:

```bash
docker compose exec backend npm run seed
```

8. Check that all containers are running:

```bash
docker compose ps
```

9. Connect to the database using MongoDB Compass.

10. Open the application in a browser:

```text
http://localhost:4200
```

### Check the Logs

If necessary, check the backend logs:

```bash
docker compose logs backend
```

Check the frontend logs:

```bash
docker compose logs frontend
```

---

## Stop the Application

Run the following command from the `overseas` project directory:

```bash
docker compose down
```

To stop the application and also delete the MongoDB volume:

```bash
docker compose down -v
```

---

## Test User Accounts

### Students

#### Seohyun Park

* **Role:** Student
* **Email:** `student1@unive.it`
* **Password:** `s`

#### Inbeom Hwang

* **Role:** Student
* **Email:** `student2@unive.it`
* **Password:** `s`

### Referent Lecturers

#### Heungmin Son

* **Role:** Referent Lecturer
* **Email:** `lecturer1@unive.it`
* **Password:** `l`

#### Minjae Kim

* **Role:** Referent Lecturer
* **Email:** `lecturer2@unive.it`
* **Password:** `l`

### Overseas Office Staff

#### Kangin Lee

* **Role:** Overseas Office Staff
* **Email:** `staff1@unive.it`
* **Password:** `s`