# Road Sign Learning App

An interactive educational platform for teaching road signs to school-age children, featuring courses and quizzes.

## Project Members

Mateusz Michałowski
Cyprian Hałas
Krzysztof Przewoźny
Szymon Kula

## Tech Stack

- **Backend:** Java 17, Spring Boot 3.x, Maven
- **Frontend:** Angular 17+
- **Database:** PostgreSQL
- **Migrations:** Flyway
- **Containerization:** Docker & Docker Compose

## Project Structure

```
road-sign-app-pg/
├── backend/
│   ├── gateway/          # API Gateway service
│   ├── sign-service/     # Road signs management service
│   └── user-service/     # User management service
├── frontend/             # Angular application
├── assets/               # Static assets (images, sounds)
└── docs/                 # Documentation
```

## Prerequisites

- Java 17+
- Node.js 18+
- Docker & Docker Compose
- Maven 3.8+
- Angular CLI

## Quick Start

### Using Docker Compose (Recommended)

```bash
docker-compose up --build
```

The application will be available at:
- Frontend: http://localhost:4200
- Gateway: http://localhost:8080
- Sign Service: http://localhost:8081
- User Service: http://localhost:8082

### Demo HTTPS Proxy (Let's Encrypt)

This repository includes a very simple Dockerized reverse proxy using Caddy with automatic Let's Encrypt certificates.

- Keeps local frontend access on `http://localhost:4200`
- Exposes public HTTP/HTTPS on ports `80` and `443`
- Forwards traffic to the `frontend` service

Run helper (domain/email are optional because defaults are pre-filled):

```bash
./scripts/setup-proxy.sh roadsigns.ftp.sh mati1mich@gmail.com false
```

Arguments:

1. domain (default: `roadsigns.ftp.sh`)
2. email (default: `mati1mich@gmail.com`)
3. staging ACME (`true|false`, default: `false`)

Use staging certificates while testing DNS to avoid rate limits:

```bash
./scripts/setup-proxy.sh roadsigns.ftp.sh mati1mich@gmail.com true
```

Requirements:

- DNS A/AAAA record for your domain must point to this host public IP.
- Ports 80 and 443 must be open and routed to this machine.

### Manual Setup

#### Backend Services

```bash
# Build all services
cd backend
mvn clean install

# Run Gateway
cd gateway && mvn spring-boot:run

# Run Sign Service (new terminal)
cd sign-service && mvn spring-boot:run

# Run User Service (new terminal)
cd user-service && mvn spring-boot:run
```

#### Frontend

```bash
cd frontend
npm install
ng serve
```

## Development

- Open `backend/` folder in IntelliJ IDEA for Java development
- Open `frontend/` folder in VS Code for Angular development

## License

See [LICENSE](LICENSE) file.
