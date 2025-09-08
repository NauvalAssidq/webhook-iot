# IoT Backend Service

A Node.js backend service for IoT-style messaging. It provides JWT‑secured user accounts, room/topic management, and real‑time message broadcasting via Server‑Sent Events (SSE), backed by MongoDB.

---

## Table of Contents

* [Overview](#overview)
* [Architecture](#architecture)
* [Quick Start](#quick-start)

  * [Run with Docker Compose](#run-with-docker-compose)
  * [Run Locally](#run-locally)
* [Configuration](#configuration)

  * [Environment Variables](#environment-variables)
* [Project Structure](#project-structure)
* [Data Model](#data-model)
* [Authentication](#authentication)
* [API Reference](#api-reference)

  * [Auth](#auth)
  * [Rooms](#rooms)
  * [SSE Subscribe](#sse-subscribe)
  * [Publish Message](#publish-message)
  * [Admin](#admin)
* [Validation](#validation)
* [Operational Notes](#operational-notes)
* [Troubleshooting](#troubleshooting)
* [Development](#development)
* [License](#license)

---

## Overview

This service lets authenticated users create **rooms** (each with a unique `topicId`).

* **Subscribe** to a topic using an SSE stream to receive messages in real time.
* **Publish** JSON messages to a topic (only the room owner can publish).
* **Persist** users, rooms, and messages in MongoDB via Mongoose.
* **Admin** endpoints allow room administration.

> Note: Many response messages are returned in Indonesian (e.g., validation and error texts).

---

## Architecture

```mermaid
flowchart LR
  Client[[Client]] -- |GET /:topicId (SSE)| --> API
  Publisher[[Room Owner]] -- |POST /:topicId (JWT)| --> API
  subgraph API[Express API]
    Auth[Auth Middleware<br/>JWT verify]
    SSE[SSE Handler<br/>per-topic subscribers]
    Rooms[Rooms Router<br/>create/list own rooms]
    Admin[Admin Router<br/>list/delete rooms]
  end
  API -- |write/read| --> DB[(MongoDB)]
  API -- |broadcast| --> SSE
  SSE -- |events| --> Client
```

---

## Quick Start

### Run with Docker Compose

1. Create a `.env` file (see [Environment Variables](#environment-variables)).
2. Start services:

   ```bash
   docker-compose up --build
   ```
3. API will be available at `http://localhost:3000`.

Stop services:

```bash
docker-compose down
```

### Run Locally

Prerequisites: Node.js 18, MongoDB 6+ running locally.

```bash
npm install
# set env vars (see .env example below)
npm run dev    # or: npm start
```

---

## Configuration

### Environment Variables

The application constructs its MongoDB URI from discrete parts and requires a JWT secret.

| Variable               | Required | Default | Description                                                                       |
| ---------------------- | -------- | ------: | --------------------------------------------------------------------------------- |
| `PORT`                 | no       |  `3000` | HTTP server port                                                                  |
| `MONGO_USER`           | yes      |       – | MongoDB username used by the app                                                  |
| `MONGO_PASS`           | yes      |       – | MongoDB password used by the app                                                  |
| `MONGO_HOST`           | yes      |       – | MongoDB hostname (e.g., `mongo` in Compose or `localhost`)                        |
| `MONGO_PORT`           | yes      | `27017` | MongoDB port                                                                      |
| `MONGO_DB`             | yes      |       – | Application database name                                                         |
| `JWT_SECRET`           | yes      |       – | Secret for signing JWTs                                                           |
| `GOOGLE_CLIENT_ID`     | no       |       – | Present for optional Google OAuth (strategy exists but no route wired by default) |
| `GOOGLE_CLIENT_SECRET` | no       |       – | Optional Google OAuth secret                                                      |

**Example `.env`**

```env
PORT=3000
MONGO_USER=mongoadmin
MONGO_PASS=webhook-service
MONGO_HOST=localhost
MONGO_PORT=27017
MONGO_DB=webhook_db
JWT_SECRET=replace-with-a-long-random-string
```

> The included `docker-compose.yaml` loads `.env` for both the app and the MongoDB container.

---

## Project Structure

```
webhook-iot-main/
├─ app.js                     # Express app, CORS, Mongo connection, route mounts, SSE cleanup
├─ bin/www                    # (Not used to start; kept for compatibility)
├─ config/passport.js         # Google OAuth strategy (optional, not mounted by default)
├─ middleware/
│  ├─ auth.js                 # JWT auth middleware
│  ├─ admin.js                # Admin-only guard
│  └─ validate.js             # Joi-backed validation helper
├─ models/
│  ├─ User.js                 # username, password, role
│  ├─ Room.js                 # name, topicId, owner
│  └─ Message.js              # room, owner, payload, timestamps
├─ routes/
│  ├─ auth.js                 # /api/auth: register, login
│  ├─ rooms.js                # /api/rooms: list/create own rooms
│  ├─ admin.js                # /api/admin: list/delete rooms
│  └─ index.js                # /:topicId GET (SSE) and POST (publish)
├─ validation.js              # Joi schemas used by validate middleware
├─ seed-admin.js              # Script to seed a default admin user (local dev)
├─ Dockerfile                 # Node 18 Alpine image
├─ docker-compose.yaml        # App + Mongo services
└─ public/                    # Static files
```

---

## Data Model

**User**

* `username` (unique, required)
* `password` (hash stored)
* `role` (`user` | `admin`, default `user`)
* `createdAt`

**Room**

* `name` (required)
* `topicId` (unique, required)
* `owner` (ref: `User`, required)
* `createdAt`

**Message**

* `room` (ref: `Room`)
* `owner` (ref: `User`)
* `payload` (arbitrary JSON)
* `createdAt`

---

## Authentication

* JWT tokens are returned by `/api/auth/login`.
* Protected routes expect `Authorization: Bearer <token>`.
* The publish endpoint requires that the **JWT user is the owner** of the room for the `topicId`.

---

## API Reference

All endpoints return JSON. Unless stated otherwise, request/response examples omit nonessential headers for brevity.

### Auth

#### Register

`POST /api/auth/register`

```json
{
  "username": "iotuser",
  "password": "password123"
}
```

**Responses**

* `201/200` on success.
* `400` if username already exists or validation fails.

#### Login

`POST /api/auth/login`

```json
{
  "username": "iotuser",
  "password": "password123"
}
```

**Response**

```json
{
  "message": "Login berhasil.",
  "token": "<jwt>"
}
```

### Rooms

All room routes require a valid JWT.

#### List My Rooms

`GET /api/rooms`

**Response**

```json
[
  {
    "_id": "...",
    "name": "My Sensors",
    "topicId": "<base64url>",
    "owner": "<userId>",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

#### Create Room

`POST /api/rooms`

```http
Authorization: Bearer <jwt>
Content-Type: application/json
```

```json
{
  "name": "My Sensors"
}
```

**Response**

```json
{
  "message": "Ruangan berhasil dibuat.",
  "room": {
    "_id": "...",
    "name": "My Sensors",
    "topicId": "<base64url>",
    "owner": "<userId>",
    "createdAt": "..."
  }
}
```

### SSE Subscribe

Opens a long‑lived HTTP connection that pushes messages for a topic. This route is **public** (no JWT) to keep consumers lightweight.

`GET /:topicId`

**cURL example**

```bash
curl -N http://localhost:3000/<topicId>
```

**JavaScript example**

```js
const es = new EventSource(`http://localhost:3000/${topicId}`);
es.onmessage = (ev) => {
  const data = JSON.parse(ev.data);
  console.log(data);
};
```

### Publish Message

Only the **room owner** (authenticated) can publish to the room’s topic.

`POST /:topicId`

```http
Authorization: Bearer <jwt>
Content-Type: application/json
```

```json
{
  "temperature": 27.3,
  "unit": "C"
}
```

**Response**

```json
{
  "message": "Pesan berhasil disimpan dan disiarkan.",
  "data": { "temperature": 27.3, "unit": "C" },
  "timestamp": "2025-09-08T12:34:56.000Z"
}
```

**Broadcast payload format** (what subscribers receive):

```json
{
  "temperature": 27.3,
  "unit": "C",
  "timestamp": "2025-09-08T12:34:56.000Z",
  "room": "My Sensors"
}
```

### Admin

All admin routes require a JWT with `role=admin`.

#### List All Rooms

`GET /api/admin/rooms`

#### Delete Room

`DELETE /api/admin/rooms/:roomId`

---

## Validation

Validation is enforced with Joi via `middleware/validate.js` and schemas in `validation.js`.

* **Register/Login**: requires `username` and `password` (username is alphanumeric; length rules apply).
* **Create Room**: requires `name` (string).
* **Publish**: validates `topicId` in URL and accepts any JSON body as `payload`.
* **Subscribe**: validates `topicId` in URL format.

Validation and error messages are localized in Indonesian.

---

## Operational Notes

* **CORS**: Open by default to all origins and methods `GET, POST, DELETE`. Restrict `origin` in production.
* **SSE headers**: `Cache-Control: no-cache`, `Connection: keep-alive`, `X-Accel-Buffering: no`. The server flushes headers and keeps connections alive; it cleans up subscribers on client disconnect.
* **MongoDB connection**: Built from env parts. Ensure credentials and network reachability from the app container/host.
* **Graceful shutdown**: The app attempts to close SSE clients on termination.

**Security recommendations**

* Use a strong `JWT_SECRET` and rotate periodically.
* Serve behind TLS (terminate at proxy or in‑app as preferred).
* Restrict CORS `origin` to trusted domains.
* Consider rate limiting on publish endpoints.
* Consider authenticating SSE if your consumers should be private.

---

## Troubleshooting

* **Cannot connect to MongoDB**: Verify `MONGO_*` values and that MongoDB is reachable (ports, network). When using Compose, `MONGO_HOST=mongo`.
* **401/403 on publish**: Ensure the JWT is present and the token’s `id` matches the room’s `owner` for the `topicId`.
* **No events received**: Confirm you’re listening on the correct `topicId`, and that publishes return success. Check browser/network proxies for SSE support.
* **CORS blocked**: Narrow or correct the `origin` setting in `app.js` CORS config.

---

## Development

### Scripts

```json
{
  "start": "node app.js",
  "dev": "nodemon app.js"
}
```

### Seed an Admin User (local)

The script connects to `mongodb://mongoadmin:webhook-service@localhost:27017/webhook_db?authSource=admin` and creates:

* **username**: `adminwebhookiot@webhook.com`
* **password**: `adminwebhookiot123`

Run:

```bash
node seed-admin.js
```

> Update credentials/URI in `seed-admin.js` before using in production.

---

## License

MIT (or your chosen license). Update this file if you adopt a different license.
