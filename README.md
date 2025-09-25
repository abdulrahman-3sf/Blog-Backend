# 📝 Blog Backend (NestJS + PostgreSQL)

A production-grade blog backend built with **NestJS**, **TypeORM**, and **PostgreSQL**, designed for learning and real-world practices.  
Implements secure **JWT authentication**, **refresh tokens**, **RBAC (role-based access control)**, **ownership rules**, **CSRF protection**, and more.

## 🚀 Features

- **Authentication**
  - JWT access tokens (short-lived)
  - Refresh tokens (rotated, stored hashed in DB)
  - Session limits (absolute + idle timeout)
  - Login, logout (this device / all devices)

- **Security**
  - Argon2 password hashing
  - CSRF protection (double-submit cookie pattern)
  - Rate limiting with Nest Throttler
  - Helmet for secure headers
  - Pino structured logging with sensitive data redaction

- **Users**
  - Register, login
  - Roles: `USER`, `ADMIN`
  - Admin can delete users

- **Posts**
  - Public list + detail (by slug)
  - CRUD for authenticated users (author manages own posts, admin can manage all)

- **Comments**
  - Public list by post slug
  - Add comment (auth required)
  - Delete comment (author/admin)

- **Docs & Testing**
  - **Swagger** UI for API documentation
  - **Postman collection** provided for manual testing

## 📦 Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/abdulrahman-3sf/blog-backend.git

cd blog-backend

npm install
```

## ⚙️ Configuration

Create a `.env` file in the project root:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=blog
DB_USER=postgres
DB_PASS=postgres

# JWT
JWT_SECRET=your_jwt_secret
JWT_TOKEN_EXPIRE_TIME=15m

REFRESH_JWT_SECRET=your_refresh_secret
REFRESH_JWT_TOKEN_EXPIRE_TIME=7d

# Cookies & CSRF
REFRESH_COOKIE_NAME=refresh_token
REFRESH_COOKIE_MAX_AGE_MS=604800000   # 7 days
CSRF_COOKIE_NAME=csrf_token
CSRF_HEADER_NAME=x-csrf-token
COOKIE_SECURE=false
COOKIE_SAMESITE=lax
COOKIE_DOMAIN=

# Logger
LOG_LEVEL=info
```

## 🗄️ Database

Run migrations:

```bash
npm run build

npm run typeorm migration:run
```

## ▶️ Running the App

### Development

```bash
npm run start:dev
```

### Production

```bash
npm run build

npm run start:prod
```

Server starts on [http://localhost:3000](http://localhost:3000).

## 📚 API Documentation

### Swagger UI

Available at:

```
http://localhost:3000/api/docs
```

Use this for exploring endpoints, request bodies, and responses.

### Postman

A **Postman collection JSON** is included (`Blog_API_Full_Test_Suite.postman_collection.json`).  
Import into Postman → run requests against your local or deployed API.

## 🔑 Authentication Flow

1. **Register** → `POST /users`
2. **Login** → `POST /auth/login`
   - Returns `{ access_token }`
   - Sets `refresh_token` (HttpOnly cookie) + `csrf_token` (readable cookie)
3. **Use API**
   - Send `Authorization: Bearer <access_token>` header
   - For `POST/PUT/PATCH/DELETE`, also send `x-csrf-token: <csrf_token>`
4. **Refresh** → `POST /auth/refresh` (auto-rotates refresh token)
5. **Logout** → `POST /auth/logout` (clears session + cookie)

## 🛡️ Security Practices

- Access tokens live **only in memory** (frontend stores, not localStorage).
- Refresh tokens are **HttpOnly cookies**.
- CSRF is enforced on state-changing routes.
- Passwords and refresh tokens are **argon2-hashed** in DB.
- Structured logs redact sensitive fields (passwords, tokens, cookies).

## 🧪 Testing

- Use Swagger or Postman collection to test all endpoints.
- Example workflows:
  - Register → Login → Me → Create Post → Add Comment → Logout.
  - Admin login → Delete user or post.

## 🌍 Deployment Notes

- **CORS:** allow frontend origin (`CORS_ORIGINS` env).
- **Cookies:**
  - Local dev → `COOKIE_SECURE=false`, `COOKIE_SAMESITE=lax`.
  - Production cross-site (e.g., GH Pages) → `COOKIE_SECURE=true`, `COOKIE_SAMESITE=none`.
- **DB:** host PostgreSQL in Docker, Railway, Supabase, or managed service.
- Ensure HTTPS in production (cookies require `Secure`).

## 📂 Project Structure

```
src/
  auth/          # authentication & guards
  common/        # utils, filters, decorators
  comments/      # comments module
  posts/         # posts module
  tokens/        # refresh token store
  users/         # users module
  main.ts        # bootstrap
```

## ✅ Roadmap (done so far)

- [x] Users + roles
- [x] JWT auth (access + refresh)
- [x] Logout (device/all)
- [x] Session limits
- [x] Posts CRUD + ownership rules
- [x] Comments CRUD + ownership rules
- [x] RBAC (admin routes)
- [x] CSRF protection
- [x] Swagger docs
- [x] Postman collection
