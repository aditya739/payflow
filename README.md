# PayFlow

A production-grade full-stack digital payment platform built with Go (Gin) and Angular 18.

## Architecture

- **Frontend**: Angular 18 (TypeScript, SCSS, Routing, RxJS, Angular Material, Chart.js)
  - Features lazy-loading, standalone components, interceptors, and route guards.
- **Backend**: Go (using Gin framework)
  - Features Clean Architecture (Controllers, Services, Repositories).
- **Database**: PostgreSQL (using GORM)
  - Manages Users, Wallets, and Transactions with ACID guarantees.
- **Cache / Rate Limiting**: Redis
  - Optional for caching / session mgmt.
- **Security**: JWT Authentication, bcrypt password hashing, Role-Based Access Control (USER/ADMIN).

## Directory Structure
- `backend/`: Go server with Gin framework.
- `frontend/`: Angular 18 frontend code.
- `docker-compose.yml`: Infrastructure orchestration.

## How to Run Locally

### Using Docker (Recommended)
You can run the entire stack (Postgres, Redis, Backend API, Frontend Nginx) with a single command:

\`\`\`bash
docker-compose up --build
\`\`\`
- Frontend: `http://localhost:80`
- Backend API: `http://localhost:8080`

### Running Manually

1. **Start DB & Redis**
   \`\`\`bash
   docker-compose up postgres redis -d
   \`\`\`
2. **Run Backend**
   \`\`\`bash
   cd backend
   go run main.go
   \`\`\`
3. **Run Frontend**
   \`\`\`bash
   cd frontend
   npm install
   ng serve
   \`\`\`

## Features Built
1. **User Authentication**: Register, Login, JWT generation, bcrypt.
2. **Wallet System**: Automatic wallet creation, balance deposit, ACID-compliant money transfer between users (Row-level locking).
3. **Dashboards**: Dynamic user dashboard with Chart.js analytics, real-time balance.
4. **Admin Panel**: Role-based viewing of total users, full transaction ledgers, and metrics.

## Security Practices Followed
- Passwords are securely hashed using \`bcrypt\`.
- APIs are protected via `Bearer Token` passing in HTTP Interceptors.
- Database transactions use Postgres row-level locks \`FOR UPDATE\` to prevent race conditions during transfers.
- Idempotency keys prevent double charging on specific actions.
