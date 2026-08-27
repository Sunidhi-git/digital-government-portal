# BharatSeva

BharatSeva is a digital public-services portal that allows citizens to access government services online. Citizens can register, apply for services, upload required documents, make payments, track application status, and submit complaints.

The system provides separate interfaces for **Citizens, Officers, and Administrators**.

## Features

* Citizen registration and login
* Browse and apply for government services
* Upload application documents
* Track application status
* View notifications
* Submit and track complaints
* View payment and transaction history
* Officer application review and verification
* Admin management of citizens, officers, services, complaints, and reports
* Responsive interface with light and dark themes

## Screenshots

Some screenshots of the BharatSeva application are shown below. The images include the main pages, authentication, services and applications, document management, role-based dashboards, and database.

## Technologies Used

* **Frontend:** React, TypeScript, Vite
* **Backend:** Node.js, Express.js
* **Database:** PostgreSQL
* **UI:** Tailwind CSS, shadcn/ui
* **Routing:** React Router
* **Testing:** Vitest, Testing Library

## How to Run

### Requirements

Install the following before running the project:

* Node.js 18 or later
* PostgreSQL 14 or later
* npm

### 1. Install Dependencies

Open the project folder in a terminal and run:

```bash
npm install
```

### 2. Create the Database

Create a PostgreSQL database named `bharatseva`:

```bash
createdb bharatseva
```

Then run the database schema:

```bash
psql -U postgres -d bharatseva -f schema.sql
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/bharatseva
PORT=4000
FRONTEND_ORIGIN=http://localhost:8080
STORAGE_PATH=./storage
```

Replace `your_password` with your PostgreSQL password.

### 4. Start the Backend

Open a terminal and run:

```bash
npm run backend
```

### 5. Start the Frontend

Open another terminal and run:

```bash
npm run dev
```

Open the local URL shown by Vite in your browser.

Usually:

```text
http://localhost:8080
```

## Project Structure

```text
BharatSeva/
├── backend/        # Express backend
├── public/         # Static files
├── src/            # React frontend
├── schema.sql      # PostgreSQL database schema
├── package.json    # Project configuration
└── README.md       # Project documentation
```

## License

This project was developed for **educational and academic purposes**.
