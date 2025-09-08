# IoT Backend Service (Webhook IOT)

A **Node.js backend service** designed for IoT applications. It provides **real-time messaging**, **user authentication**, and **room-based communication** with persistent storage and administrative management tools.

---

## Features

* **Real-Time Messaging**
  Real-time communication using **Server-Sent Events (SSE)**.

* **User Authentication and Authorization**
  JWT-based authentication with **role-based access control**.

* **Room Management**
  Create, join, and manage rooms with unique topic IDs.

* **Message Broadcasting**
  Publish messages to specific rooms and broadcast them to connected subscribers.

* **Admin Panel**
  Endpoints for managing **users** and **rooms**.

* **Persistent Storage**
  MongoDB integration using **Mongoose** ODM.

* **Validation Layer**
  Comprehensive request validation with **Joi**.

* **Containerized Deployment**
  Ready-to-use **Docker** and **Docker Compose** setup.

---

## Technology Stack

* **Runtime**: Node.js 18
* **Framework**: Express.js 5
* **Database**: MongoDB + Mongoose
* **Authentication**: JWT + Passport.js
* **Validation**: Joi
* **Deployment**: Docker and Docker Compose

---

## Project Structure

```
webhook-iot-main/
├── app.js                 # Main application entry point
├── bin/www                # Server startup script
├── config/passport.js     # Authentication strategies
├── middleware/            # Custom middleware (auth, admin, validation)
├── models/                # Mongoose models (User, Room, Message)
├── routes/                # Express routes (auth, admin, rooms, index)
├── public/                # Static files (HTML, CSS)
├── seed-admin.js          # Script to seed initial admin user
├── validation.js          # Centralized Joi validation
├── Dockerfile             # Docker configuration
├── docker-compose.yaml    # Multi-service Docker setup
└── README.md              # Documentation
```

---

## Installation and Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-repo/webhook-iot-main.git
cd webhook-iot-main
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/iotdb
JWT_SECRET=your-secret-key
```

### 4. Seed Admin User

```bash
node seed-admin.js
```

### 5. Run the Application

```bash
npm start
```

Server will be available at:
`http://localhost:3000`

---

## Run with Docker

### Build and Start

```bash
docker-compose up --build
```

### Stop Containers

```bash
docker-compose down
```

---

## API Endpoints

### Auth Routes

* `POST /auth/register` → Register new user
* `POST /auth/login` → Login and receive JWT

### Room Routes

* `POST /rooms` → Create a room
* `GET /rooms/:id` → Get room details
* `POST /rooms/:id/messages` → Send message to room

### SSE (Real-Time)

* `GET /rooms/:id/stream` → Subscribe to room messages

### Admin Routes

* `GET /admin/users` → List users
* `DELETE /admin/users/:id` → Delete user
* `DELETE /admin/rooms/:id` → Delete room

---

## Usage Examples

```bash
# Register user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"iotuser","password":"password123"}'
```

```bash
# Subscribe to messages via SSE
curl http://localhost:3000/rooms/123/stream
```

---

## Testing

Run all tests (if available):

```bash
npm test
```

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m "Add new feature"`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the **MIT License**.
