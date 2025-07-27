# Production-Ready Blog/News API Backend

A complete, robust, and scalable headless backend for a blog, news site, or any content-driven application. Built with **Node.js**, **Express**, and **MongoDB**, and fully containerized with **Docker**.

This project is designed to be the "engine" for your content platform, allowing you to focus on building a beautiful frontend without worrying about the backend complexities.

---

## ✨ Features

### ✅ Full Authentication

* Standard user registration (email & password).
* Secure login with password hashing (`bcryptjs`).
* Stateless authentication using JSON Web Tokens (JWT).
* Seamless Google OAuth 2.0 integration.

### ✅ Complete Article Management (CRUD)

* Create, Read, Update, and Delete articles.
* Admin-only restrictions on all content creation and modification.

### ✅ Advanced Content Features

* **Multilingual Support:** Database schema is ready for English (`en`) and Indonesian (`id`) content.
* **Automated & Unique Slug Generation:** SEO-friendly URLs are created automatically from article titles.
* **Smart View Counting:** Tracks article views using cookies to prevent spam.
* **Powerful Filtering:** Fetch articles by tag, featured status, and more.
* **Flexible Sorting:** Sort articles by creation date or view count.

### ✅ Secure Media Uploads

* API endpoint to generate secure, temporary presigned URLs for direct file uploads to AWS S3.

### ✅ Robust & Secure

* Input Validation: All incoming data is validated to prevent errors and bad data.
* Security Hardening: Uses `helmet` for secure headers and `express-rate-limit` to prevent brute-force attacks.

### ✅ Containerized

* Comes with a multi-stage Dockerfile for creating small, efficient, and secure production images.
* Includes a `docker-compose.yml` file for easy, one-command local development.

---

## 🛠️ Tech Stack

* **Backend:** Node.js, Express.js
* **Database:** MongoDB with Mongoose
* **Authentication:** Passport.js (Google OAuth), JWT
* **File Storage:** AWS S3
* **Containerization:** Docker, Docker Compose

---

## 🚀 Getting Started

Follow these steps to get the backend running on your local machine for development.

### Prerequisites

* Node.js (v18 or later)
* Docker and Docker Compose
* An active MongoDB Atlas account (free tier is sufficient)
* An active AWS Account with S3 configured (free tier is sufficient)
* Google OAuth 2.0 credentials from the Google Cloud Console

### Installation

1. Clone the repository:

   ```bash
   git clone <your-repo-url>
   cd blog-project
   ```

2. Set up your Environment Variables:

   ```bash
   cd back-end
   cp .env.example .env
   ```

   Now open `.env` and fill in all the required values (MongoDB URI, Google keys, AWS keys, etc.).

3. Run the Application with Docker Compose:

   ```bash
   cd ..
   docker compose up --build
   ```

   The server will be available at `http://localhost:8080`.

---

## 📚 API Documentation

All endpoints are prefixed with `/api`.

### Authentication (`/auth`)

#### `POST /auth/register`

Registers a new user.

* **Access:** Public
* **Body:**

  ```json
  {
    "displayName": "John Doe",
    "email": "john.doe@example.com",
    "password": "a-strong-password"
  }
  ```
* **Success Response (201):**

  ```json
  {
    "_id": "...",
    "displayName": "John Doe",
    "email": "john.doe@example.com",
    "role": "user",
    "token": "your_jwt_token_here"
  }
  ```

#### `POST /auth/login`

Logs in an existing user.

* **Access:** Public
* **Body:**

  ```json
  {
    "email": "john.doe@example.com",
    "password": "a-strong-password"
  }
  ```
* **Success Response (200):** Same as registration.

#### `GET /auth/google`

Starts the Google OAuth flow. Redirects the user to Google's sign-in page.

* **Access:** Public

---

### Articles (`/articles`)

#### `GET /articles`

Fetches a paginated list of all published articles.

* **Access:** Public
* **Query Parameters:**

    * `tag` (string): Filter by tag
    * `featured` (boolean): Only featured articles
    * `sortBy` (string): Use `views` to sort by most viewed
    * `page` (number): Page number (default: 1)
    * `limit` (number): Articles per page (default: 10)

#### `GET /articles/:slug`

Fetch a single article by its English or Indonesian slug.

* **Access:** Public

#### `POST /articles`

Create a new article.

* **Access:** Admin Only
* **Authorization Header:** `Bearer <ADMIN_TOKEN>`
* **Body:** Complete article object (slug auto-generated)

#### `PUT /articles/:id`

Update an existing article by its ID.

* **Access:** Admin Only
* **Authorization Header:** `Bearer <ADMIN_TOKEN>`
* **Body:** Partial or full update object

#### `DELETE /articles/:id`

Delete an article by its ID.

* **Access:** Admin Only
* **Authorization Header:** `Bearer <ADMIN_TOKEN>`

---

### Uploads (`/upload`)

#### `POST /upload/presigned-url`

Generates a temporary presigned URL for uploading files directly to AWS S3.

* **Access:** Admin Only
* **Authorization Header:** `Bearer <ADMIN_TOKEN>`
* **Body:**

  ```json
  {
    "fileName": "my-cool-image.jpg",
    "fileType": "image/jpeg"
  }
  ```
* **Success Response (200):**

  ```json
  {
    "uploadUrl": "https://s3...",
    "finalImageUrl": "https://s3..."
  }
  ```

---

## ☁️ Deployment

To deploy this backend, use the provided multi-stage Dockerfile. Build the image and run it on your preferred cloud service (e.g., AWS ECS, Google Cloud Run). Make sure to supply all required environment variables via your cloud provider's dashboard or secrets manager.
