# Universal Authentication System

A production-ready, secure, full-stack authentication system built with modern web technologies.

## Features

### Security

- **JWT-based authentication** with short-lived access tokens (15 minutes) and long-lived refresh tokens (7 days)
- **HttpOnly cookies** for refresh token storage (XSS-safe)
- **Token rotation** on every refresh (prevents replay attacks)
- **Database-backed token revocation** (instant session invalidation)
- **Bcrypt password hashing** (cost factor 12)
- **SHA-256 OTP hashing** for fast verification
- **Rate limiting** on all auth endpoints (protects against brute force)
- **User enumeration protection** on password reset flows
- **CSRF protection** via `sameSite: strict` cookies
- **Helmet.js** security headers
- **Session limit enforcement** (5 concurrent sessions per user)

### User Workflows

- User registration with email verification (OTP-based)
- Email verification with 6-digit numeric code
- Login with email and password
- Forgot password → OTP verification → password reset
- Logout (single session)
- Logout all devices (revokes all sessions)
- Protected dashboard displaying user profile

### Frontend

- **React 19** with functional components and hooks
- **React Router v6** for navigation
- **Vite** for fast builds and HMR
- **Axios** with automatic token refresh interceptor
- **Dark mode** with `prefers-color-scheme` detection
- **Accessible UI** with ARIA labels, live regions, semantic HTML
- **Responsive design** optimized for mobile and desktop
- **OTP input** with auto-focus, paste support, backspace navigation
- **Password strength meter** with real-time feedback
- **Toast notifications** for user feedback

### Backend

- **Express.js** REST API
- **Prisma ORM** with PostgreSQL
- **Nodemailer** for transactional emails (SMTP configurable)
- **express-validator** for input validation
- **Comprehensive error handling** with centralized middleware
- **Database migrations** tracked in version control
- **Automatic expired OTP cleanup** to prevent table bloat

---

## Tech Stack

### Backend

- Node.js >= 18
- Express.js
- Prisma (PostgreSQL)
- JWT (jsonwebtoken)
- Bcrypt
- Nodemailer
- Helmet.js
- express-rate-limit
- express-validator

### Frontend

- React 19
- Vite 8
- React Router v6
- Axios
- oxlint (for code quality)

---

## Project Structure

```
auth/
├── backend/
│   ├── src/
│   │   ├── config/           # Database and email transporter setup
│   │   ├── controllers/      # Route handlers (thin layer)
│   │   ├── middleware/       # Auth, error handling, rate limiting
│   │   ├── routes/           # Express route definitions
│   │   ├── services/         # Business logic (auth, email, tokens)
│   │   ├── validators/       # Input validation rules
│   │   ├── utils/            # Hashing, response formatting
│   │   ├── emails/           # Email templates (HTML)
│   │   ├── prisma/           # Schema, migrations, seed
│   │   ├── app.js            # Express app setup
│   │   └── server.js         # HTTP server entry point
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # React Context (Auth)
│   │   ├── hooks/            # Custom hooks (useAuth, useOtpInput)
│   │   ├── pages/            # Route pages (Login, Signup, etc.)
│   │   ├── services/         # API client (axios)
│   │   ├── styles/           # CSS modules (theme, global, auth, components)
│   │   ├── App.jsx           # Root component
│   │   └── main.jsx          # React entry point
│   ├── public/               # Static assets
│   ├── index.html
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## Setup Instructions

### Prerequisites

- Node.js >= 18
- PostgreSQL (local or hosted, e.g., Supabase)
- SMTP credentials (or use Mailtrap for testing)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd auth
```

### 2. Backend Setup

#### Install Dependencies

```bash
cd backend
npm install
```

#### Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
PORT=5000

# PostgreSQL connection strings
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
DIRECT_URL="postgresql://user:password@host:port/database"

# JWT secrets (generate strong random strings)
JWT_SECRET="your-super-secret-access-token-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-token-key"

# Token expiration durations
ACCESS_TOKEN_EXPIRES="15m"
REFRESH_TOKEN_EXPIRES="7d"

# OTP expiration in minutes
OTP_EXPIRES=10

# SMTP configuration (Mailtrap for dev, SendGrid/AWS SES for production)
EMAIL_HOST="smtp.mailtrap.io"
EMAIL_PORT=2525
EMAIL_USER="your-smtp-username"
EMAIL_PASS="your-smtp-password"
EMAIL_FROM="Universal Auth <noreply@yourdomain.com>"

# Frontend URL (for CORS)
CLIENT_URL="http://localhost:5173"
```

**IMPORTANT**: Never commit the `.env` file or use the fallback secrets in production.

#### Run Database Migrations

```bash
npm run prisma:generate
npm run prisma:migrate
```

#### (Optional) Seed Database

```bash
npm run prisma:seed
```

This creates a test user:

- Email: `john.doe@example.com`
- Password: `Password123!`

#### Start the Backend Server

```bash
npm run dev
```

Backend will run on `http://localhost:5000`

---

### 3. Frontend Setup

#### Install Dependencies

```bash
cd ../frontend
npm install
```

#### Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL="http://localhost:5000/api"
```

#### Start the Frontend Dev Server

```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

---

## Usage

1. Open `http://localhost:5173` in your browser
2. **Sign Up**: Create a new account (you'll receive a 6-digit OTP)
3. **Verify Email**: Enter the OTP sent to your email (check console logs if SMTP is not configured)
4. **Login**: Use your email and password
5. **Dashboard**: View your profile, logout, or logout all devices
6. **Forgot Password**: Reset your password using OTP verification

---

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/verify-email` - Verify email with OTP
- `POST /api/auth/resend-verification` - Resend verification OTP
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/forgot-password` - Request password reset OTP
- `POST /api/auth/verify-password-reset` - Verify password reset OTP
- `POST /api/auth/reset-password` - Reset password with OTP
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Revoke current session
- `POST /api/auth/logout-all` - Revoke all user sessions (protected)
- `GET /api/auth/me` - Get current user profile (protected)

### Health Check

- `GET /health` - Server health status

---

## Database Schema

### User

- `id` (UUID, PK)
- `firstName`, `lastName`
- `email` (unique, indexed)
- `age` (calculated from DOB)
- `password` (bcrypt hashed)
- `isVerified` (boolean)
- `createdAt`, `updatedAt`

### Otp

- `id` (UUID, PK)
- `userId` (FK → User, cascade delete)
- `otp` (SHA-256 hashed)
- `type` ("VERIFICATION" | "PASSWORD_RESET")
- `expiresAt` (DateTime, indexed)
- `isUsed` (boolean, indexed)
- `createdAt`
- **Composite index**: `[userId, type, isUsed, expiresAt]` for fast OTP lookups

### RefreshToken

- `id` (UUID, PK)
- `token` (unique, indexed)
- `userId` (FK → User, cascade delete, indexed)
- `expiresAt` (DateTime)
- `createdAt`

---

## Security Best Practices

1. **Never commit `.env` files** — they contain secrets
2. **Use strong, random JWT secrets** — generate with `openssl rand -base64 32`
3. **Enable HTTPS in production** — set `secure: true` in cookie options
4. **Configure CSP headers** — add a strict Content-Security-Policy
5. **Use a managed secret store** — AWS Secrets Manager, Vault, etc.
6. **Monitor rate limit hits** — detect brute force attempts
7. **Rotate secrets regularly** — especially JWT secrets
8. **Validate all user inputs** — on both frontend and backend
9. **Log security events** — failed logins, token revocations, etc.
10. **Run `npm audit`** regularly — fix vulnerabilities in dependencies

---

## Testing

### Backend

```bash
cd backend
# Add test scripts and run
npm test
```

### Frontend

```bash
cd frontend
npm run lint  # oxlint for code quality
```

---

## Deployment

### Backend (Node.js hosting: Heroku, Render, Railway, AWS Elastic Beanstalk)

1. Set environment variables (never commit `.env`)
2. Run `npm run prisma:deploy` to apply migrations
3. Start with `npm start`

### Frontend (Static hosting: Vercel, Netlify, AWS S3 + CloudFront)

1. Build with `npm run build`
2. Deploy the `dist/` folder
3. Configure environment variables for `VITE_API_URL`

### Database (PostgreSQL)

- Use a managed service: Supabase, Neon, AWS RDS, Google Cloud SQL
- Enable connection pooling (PgBouncer) for high traffic
- Configure automatic backups
- Use read replicas for scaling reads

---

## Environment Variables Reference

### Backend

| Variable                | Description                                    | Example                     |
| ----------------------- | ---------------------------------------------- | --------------------------- |
| `PORT`                  | Server port                                    | `5000`                      |
| `DATABASE_URL`          | PostgreSQL connection (with pooling)           | `postgresql://...`          |
| `DIRECT_URL`            | PostgreSQL connection (direct, for migrations) | `postgresql://...`          |
| `JWT_SECRET`            | Secret for access token signing                | Random 32+ char string      |
| `JWT_REFRESH_SECRET`    | Secret for refresh token signing               | Random 32+ char string      |
| `ACCESS_TOKEN_EXPIRES`  | Access token lifespan                          | `15m`, `1h`                 |
| `REFRESH_TOKEN_EXPIRES` | Refresh token lifespan                         | `7d`, `30d`                 |
| `OTP_EXPIRES`           | OTP validity in minutes                        | `10`                        |
| `EMAIL_HOST`            | SMTP server hostname                           | `smtp.mailtrap.io`          |
| `EMAIL_PORT`            | SMTP port                                      | `2525`, `587`, `465`        |
| `EMAIL_USER`            | SMTP username                                  | `abc123`                    |
| `EMAIL_PASS`            | SMTP password                                  | `xyz789`                    |
| `EMAIL_FROM`            | Sender email address                           | `noreply@yourdomain.com`    |
| `CLIENT_URL`            | Frontend origin (for CORS)                     | `https://yourdomain.com`    |
| `NODE_ENV`              | Environment mode                               | `development`, `production` |

### Frontend

| Variable       | Description          | Example                          |
| -------------- | -------------------- | -------------------------------- |
| `VITE_API_URL` | Backend API base URL | `https://api.yourdomain.com/api` |

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the ISC License.

---

## Support

For issues and questions, please open an issue on the GitHub repository.

---

## Acknowledgments

- Built with React, Express, Prisma, and PostgreSQL
- Styled with custom CSS (glassmorphism design)
- Email templates inspired by modern transactional email design
- Security patterns based on OWASP recommendations
