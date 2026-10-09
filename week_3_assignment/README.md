# EventHorizon Backend

A secure Node.js/Express/MongoDB backend foundation for managing user accounts in the EventHorizon event management platform.

## Features

- **User Registration** with Joi validation and bcrypt password hashing
- **Email Verification** via secure, time-sensitive, hashed tokens (no OTPs)
- **Login** issuing JSON Web Tokens (JWT)
- **Protected Routes** requiring both a valid JWT and a verified email
- **Robust error handling** with correct HTTP status codes

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- Joi (validation)
- bcryptjs (password hashing)
- jsonwebtoken (JWT)
- nodemailer (email)
- crypto (secure random token generation)

## Project Structure

```
src/
├── config/db.js              # MongoDB connection
├── controllers/              # Route handlers
├── middleware/               # auth + validate middlewares
├── models/User.js            # Mongoose user schema
├── routes/                   # API route definitions
├── utils/                    # JWT, token, and email helpers
└── validations/              # Joi schemas
server.js                     # Entry point
```

## Getting Started

### 1. Clone & install

```bash
git clone <your-repo-url>
cd eventhorizon-backend
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `PORT` | Server port (default 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | JWT lifetime (e.g. `1d`) |
| `VERIFICATION_TOKEN_EXPIRES_HOURS` | Hours the verification token is valid |
| `FRONTEND_URL` | Base URL used to build the verification link |
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM` | SMTP credentials |

> **Gmail tip:** enable 2FA and create an [App Password](https://myaccount.google.com/apppasswords) for `EMAIL_PASS`.

### 3. Run MongoDB

Either use a local instance (`mongodb://localhost:27017/eventhorizon`) or a MongoDB Atlas connection string.

### 4. Start the server

```bash
npm run dev     # development with nodemon
npm start       # production
```

Server runs at `http://localhost:5000`.

## API Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create a new user and send verification email |
| POST | `/api/auth/verify-email` | Public | Verify email using the token from the email link |
| POST | `/api/auth/login` | Public | Authenticate and receive a JWT |
| GET | `/api/user/profile` | Private | Get the logged-in user's profile |

### Sample Requests

**Register**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","password":"Passw0rd123"}'
```

**Verify Email**

```bash
curl -X POST http://localhost:5000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token":"<token-from-email-link>"}'
```

**Login**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"Passw0rd123"}'
```

**Get Profile**

```bash
curl http://localhost:5000/api/user/profile \
  -H "Authorization: Bearer <your-jwt>"
```

## Security Notes

- Passwords are hashed with **bcrypt** (10 salt rounds) and never returned.
- Verification tokens are generated with `crypto.randomBytes(32)` and **only their SHA-256 hash is stored** in the DB.
- Verification tokens are **time-limited** (default 24h) and **single-use** (deleted after verification).
- Unverified users are blocked from both login and protected routes.
- Joi strips unknown fields (`stripUnknown: true`) to prevent mass-assignment.

## Postman Collection

Import `postman_collection.json` (included in the repo) into Postman to test all endpoints quickly. Set the `baseUrl` and `token` variables accordingly.