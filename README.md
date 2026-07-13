# Overseas Mobility Application

## Run the Project with Docker

### Prerequisites

* Docker Desktop
* Visual Studio Code
* MongoDB Compass

### Start the Application

1. Start Docker Desktop.

2. Open the project folder in Visual Studio Code.

3. Open a new terminal and run the following commands from the `overseas` project directory:

```bash
docker compose down -v
```

Removes the existing containers and MongoDB volume to reset the database.

```bash
docker compose up --build -d
```

Builds the Docker images and starts the frontend, backend, and MongoDB containers.

```bash
docker compose exec backend npm run seed
```

Inserts the seed data into MongoDB.

4. Check that all containers are running:

```bash
docker compose ps
```

5. Connect to the database using MongoDB Compass.

6. Check the container logs if necessary:

```bash
docker compose logs backend
```

```bash
docker compose logs frontend
```

7. Open the application in a browser:

```text
http://localhost:4200
```

---

## Stop the Application

Run the following command from the project directory:

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