# IoT Backend Service

A Node.js backend service designed for IoT applications, providing real-time messaging capabilities through Server-Sent Events (SSE), user authentication, and room-based message broadcasting.

## Features

- **Real-time Messaging**: Server-Sent Events (SSE) for real-time communication
- **User Authentication**: JWT-based authentication system with role-based access control
- **Room Management**: Create and manage messaging rooms with unique topic IDs
- **Message Broadcasting**: Publish messages to specific rooms and broadcast to subscribers
- **Admin Panel**: Administrative endpoints for managing rooms and users
- **MongoDB Integration**: Persistent storage for users, rooms, and messages
- **Docker Support**: Containerized deployment with Docker Compose
- **Input Validation**: Comprehensive request validation using Joi

## Technology Stack

- **Runtime**: Node.js 18
- **Framework**: Express.js 5
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **Password Hashing**: bcryptjs
- **Validation**: Joi
- **Development**: Nodemon for hot reloading
- **Containerization**: Docker and Docker Compose

## Prerequisites

- Node.js 18 or higher
- MongoDB instance
- Docker and Docker Compose (for containerized deployment)

## Installation

### Local Development

1. Clone the repository:
```bash
git clone <repository-url>
cd iot-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment configuration:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
JWT_SECRET=your_jwt_secret_key
MONGO_USER=your_mongodb_username
MONGO_PASS=your_mongodb_password
MONGO_HOST=localhost
MONGO_PORT=27017
MONGO_DB=webhook_db
PORT=3000
```

5. Start the development server:
```bash
npm run dev
```

### Docker Deployment

1. Ensure Docker and Docker Compose are installed on your system.

2. Create the `.env` file with appropriate values for your environment.

3. Build and start the services:
```bash
docker-compose up -d
```

4. For development with hot reloading:
```bash
docker-compose up dev
```

## Database Setup

### Admin User Seeding

To create an initial admin user, run the seeding script:

```bash
node seed-admin.js
```

Default admin credentials:
- Username: `adminwebhookiot@webhook.com`
- Password: `adminwebhookiot123`

**Important**: Change these credentials immediately after first login in production environments.

## API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "your_username",
  "password": "your_password"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "your_username",
  "password": "your_password"
}
```

### Room Management

#### Get User Rooms
```http
GET /api/rooms
Authorization: Bearer <jwt_token>
```

#### Create Room
```http
POST /api/rooms
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Room Name"
}
```

### Message Broadcasting

#### Subscribe to Room (SSE)
```http
GET /:topicId
```

This endpoint establishes a Server-Sent Events connection for real-time message reception.

#### Publish Message
```http
POST /:topicId
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "message": "Your message content",
  "data": "Additional data"
}
```

### Admin Endpoints

#### Get All Rooms (Admin Only)
```http
GET /api/admin/rooms
Authorization: Bearer <admin_jwt_token>
```

#### Delete Room (Admin Only)
```http
DELETE /api/admin/rooms/:roomId
Authorization: Bearer <admin_jwt_token>
```

## Project Structure

```
iot-backend/
├── config/
│   └── passport.js          # Passport configuration (not currently used)
├── middleware/
│   ├── admin.js             # Admin role verification
│   ├── auth.js              # JWT authentication
│   └── validate.js          # Request validation middleware
├── models/
│   ├── Message.js           # Message model
│   ├── Room.js              # Room model
│   └── User.js              # User model
├── routes/
│   ├── admin.js             # Admin routes
│   ├── auth.js              # Authentication routes
│   ├── index.js             # SSE and message routes
│   └── rooms.js             # Room management routes
├── public/                  # Static files
├── app.js                   # Application entry point
├── validation.js            # Joi validation schemas
├── seed-admin.js            # Admin user seeding script
├── docker-compose.yaml      # Docker Compose configuration
├── Dockerfile               # Docker image configuration
└── package.json             # Project dependencies and scripts
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Role-Based Access Control**: Separate admin and user permissions
- **Input Validation**: Comprehensive request validation
- **CORS Configuration**: Cross-origin resource sharing controls

## Development

### Available Scripts

- `npm start`: Start the production server
- `npm run dev`: Start the development server with hot reloading

### Environment Configuration

The application uses environment variables for configuration. Ensure all required variables are set in your `.env` file:

- `JWT_SECRET`: Secret key for JWT token signing
- `MONGO_USER`: MongoDB username
- `MONGO_PASS`: MongoDB password
- `MONGO_HOST`: MongoDB host
- `MONGO_PORT`: MongoDB port
- `MONGO_DB`: MongoDB database name
- `PORT`: Application port (defaults to 3000)

## Deployment Considerations

### Production Deployment

1. Ensure all environment variables are properly configured
2. Use strong, unique values for `JWT_SECRET`
3. Configure MongoDB with appropriate security settings
4. Consider using a reverse proxy (nginx) for SSL termination
5. Implement proper logging and monitoring
6. Change default admin credentials immediately

### Scaling

The application maintains in-memory subscriber connections for SSE. For horizontal scaling:

1. Consider implementing Redis or similar for shared state
2. Use sticky sessions or connection affinity
3. Implement proper session management for distributed deployments

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is private and proprietary. All rights reserved.

## Support

For support and questions, please contact the development team or create an issue in the project reposito