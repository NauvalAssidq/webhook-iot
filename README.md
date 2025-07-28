# Production-Ready Blog & News API Backend

A complete, robust, and scalable headless backend for a blog, news site, or any content-driven application. Built with **Node.js**, **Express**, and **MongoDB**, and fully containerized with **Docker** for easy development and deployment.

This project is designed to be the "engine" for your content platform, providing a secure and feature-rich API that allows you to focus on building a beautiful frontend without worrying about backend complexities.

---

## Features

### Full Authentication

* Standard user registration (email & password)
* Secure login with password hashing (`bcryptjs`)
* Stateless authentication using JSON Web Tokens (JWT)
* Seamless Google OAuth 2.0 integration

### Complete Article Management (CRUD)

* Create, Read, Update, and Delete articles
* Admin-only restrictions on content creation and modification

### Full User Management (CRUD)

* Admin-only endpoints to get all users
* Update user roles (e.g., promote to admin)
* Delete users

### Advanced Content Features

* Multilingual support (English `en`, Indonesian `id`)
* Automated & unique slug generation for SEO-friendly URLs
* Smart view counting with cookie-based spam prevention
* Powerful filtering: by tag, featured status, etc.
* Flexible sorting: by creation date or view count

### Secure Media Uploads

* Endpoint to generate temporary presigned URLs for direct AWS S3 uploads

### Robust & Secure (Production-Ready)

* Input validation using `express-validator`
* Security hardening with `helmet` and `express-rate-limit`
* Performance optimization with `compression`

### Containerized

* Multi-stage Dockerfile for efficient production images

---

## Technology Stack

* **Backend:** Node.js, Express.js
* **Database:** MongoDB with Mongoose
* **Authentication:** Passport.js (Google OAuth), JWT, bcryptjs
* **File Storage:** AWS S3
* **Containerization:** Docker
* **Security & Validation:** Helmet, Express Rate Limit, Express Validator

---

## Getting Started

Follow these steps to get the backend running on your local machine for development.

### Prerequisites

* Node.js (v18 or later)
* Docker installed and running
* MongoDB Atlas account (free tier is sufficient)
* AWS account with an S3 bucket and IAM user configured
* Google OAuth 2.0 credentials

### Installation

#### 1. Clone the repository:

```bash
git clone https://github.com/NauvalAssidq/express-blog-api.git
cd express-blog-api
```

#### 2. Set up environment variables:

```bash
cp .env.example .env
```

Fill in all required values in `.env` (MongoDB URI, Google keys, AWS keys, etc.).

#### 3. Build the Docker image:

```bash
docker build -t blog-api .
```

#### 4. Run the application:

```bash
docker run -p 8080:8080 \
  -v "$(pwd):/usr/src/app" \
  -v /usr/src/app/node_modules \
  --env-file ./.env \
  blog-api
```

The server will be running at: [http://localhost:8080](http://localhost:8080)

---

## API Documentation and Use Cases

All endpoints are prefixed with `/api`. Protected routes require:

```
Authorization: Bearer <TOKEN>
```

### Authentication (`/api/auth`)

#### `POST /auth/register`

Registers a new user.

```json
{
  "displayName": "John Doe",
  "email": "john.doe@example.com",
  "password": "a-strong-password"
}
```

Use Case: Sign-up form that logs in the user on success.

#### `POST /auth/login`

Logs in an existing user.
Use Case: Login form that stores JWT in frontend on success.

#### `GET /auth/google`

Starts the Google OAuth login flow.
Use Case: Triggered by a "Login with Google" button.

---

### Articles (`/api/articles`)

#### `GET /articles`

Fetch a paginated list of published articles.
**Use Cases:**

* Blog homepage: latest posts
* Homepage featured: `?featured=true&limit=3`
* Category: `?tag=ui-design`
* Popular: `?sortBy=views&limit=5`

#### `GET /articles/:slug`

Fetch an article by slug.
**Use Case:** Displaying the full article page.

#### `POST /articles/:slug/view`

Increment view count for an article.
**Use Case:** Fire-and-forget after displaying the article.

#### `POST /articles`

Create an article (defaults to "draft").

* **Access:** Admin Only
  **Use Case:** Saving a new draft or article.

#### `PUT /articles/:id`

Update an existing article.

* **Access:** Admin Only
  **Use Case:** Editing and publishing updates.

#### `DELETE /articles/:id`

Delete an article.

* **Access:** Admin Only
  **Use Case:** Admin removes unwanted content.

---

### User Management (`/api/users`)

#### `GET /users`

Get all registered users.

* **Access:** Admin Only
  **Use Case:** Populate a user table in admin dashboard.

#### `PUT /users/:id/role`

Update user role.

* **Access:** Admin Only

```json
{
  "role": "admin"
}
```

**Use Case:** Promote a user to admin.

---

### Uploads (`/api/upload`)

#### `POST /upload/presigned-url`

Generate a temporary S3 upload URL.

* **Access:** Admin Only

```json
{
  "fileName": "my-cool-image.jpg",
  "fileType": "image/jpeg"
}
```

**Use Case:** Direct upload for article images.

---

## Deployment

To deploy this backend:

1. Use the provided multi-stage `Dockerfile`
2. Build the production image:

```bash
docker build -t blog-api-prod .
```

3. Push to your cloud provider (e.g., AWS ECS, Google Cloud Run)
4. Set environment variables securely on your platform

---

For any questions or suggestions, feel free to open an issue or create a pull request.
