# SurplusSync

A hyper-local food waste redistribution platform built as a distributed microservices backend. Restaurants post surplus food listings, and NGOs or individuals can claim them. The system enforces transactional safety using optimistic locking to prevent double-booking under concurrent load.

## Architecture

```
React Frontend (port 5173)
  │
  ▼
API Gateway (port 8080)  ←── JWT validation on every request
  │
  ├──▶ auth-service (port 8083)        — token generation
  ├──▶ inventory-service (port 8081)   ──▶ inventory_db (MySQL)
  └──▶ transaction-service (port 8082) ──▶ transaction_db (MySQL)
           │
           └──▶ [Feign] inventory-service (via Eureka)

Discovery Server / Eureka (port 8761)
```

| Service              | Port | Database       |
|----------------------|------|----------------|
| discovery-server     | 8761 | —              |
| api-gateway          | 8080 | —              |
| auth-service         | 8083 | —              |
| inventory-service    | 8081 | inventory_db   |
| transaction-service  | 8082 | transaction_db |

## Tech Stack

**Backend**
- Java 21
- Spring Boot 3.2.4
- Spring Cloud 2023.0.1 (Eureka, Gateway, OpenFeign)
- Spring Data JPA with Optimistic Locking (`@Version`)
- MySQL 8.x
- JJWT 0.12.6 (JWT generation and validation)
- SpringDoc OpenAPI 2.3.0 (Swagger UI)
- Maven (multi-module)

**Frontend**
- React 19 + Vite
- Tailwind CSS 3
- Axios (HTTP client)
- React Router DOM (client-side routing)
- jwt-decode (token parsing)

## Prerequisites

- Java 21+
- Maven 3.9+
- MySQL 8.x running locally on port 3306
- Node.js 18+ and npm

## Database Setup

Create the two databases in MySQL before starting the services:

```sql
CREATE DATABASE inventory_db;
CREATE DATABASE transaction_db;
```

The tables are created automatically by Hibernate (`ddl-auto: update`) on first startup.

## Running Locally

Start the services **in this order**:

**1. Discovery Server**
```bash
cd discovery-server
mvn spring-boot:run
```
Wait for: `Started DiscoveryServerApplication` on port 8761.

**2. API Gateway**
```bash
cd api-gateway
mvn spring-boot:run
```

**3. Auth Service**
```bash
cd auth-service
mvn spring-boot:run
```

**4. Inventory Service**
```bash
cd inventory-service
mvn spring-boot:run
```

**5. Transaction Service**
```bash
cd transaction-service
mvn spring-boot:run
```

Once all services are running, open [http://localhost:8761](http://localhost:8761) — you should see all four services registered with status UP.

**6. Frontend**
```bash
cd frontend
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

## Authentication

All API requests through the gateway require a valid JWT token in the `Authorization` header.

**Step 1 — Get a token:**

```http
POST http://localhost:8083/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

**Step 2 — Use the token on every subsequent request:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

Routes that bypass JWT: `/auth/**`, `/swagger-ui/**`, `/v3/api-docs/**`

## API Reference

All endpoints are reachable directly or via the gateway (`localhost:8080/{service-name}/...`).

### Inventory Service — `localhost:8081`

| Method | Endpoint                            | Description                         |
|--------|-------------------------------------|-------------------------------------|
| POST   | `/listings`                         | Create a food listing               |
| GET    | `/listings`                         | Get all listings                    |
| GET    | `/listings/available`               | Get listings with status AVAILABLE  |
| GET    | `/listings/{id}`                    | Get a listing by ID                 |
| PUT    | `/listings/{id}/decrement?amount=X` | Decrement quantity (internal use)   |

**Create listing — request body:**
```json
{
  "restaurantName": "Green Bowl Cafe",
  "itemDescription": "Surplus pasta boxes",
  "quantity": 10
}
```

### Transaction Service — `localhost:8082`

| Method | Endpoint                       | Description                      |
|--------|--------------------------------|----------------------------------|
| POST   | `/claims`                      | Submit a claim for a listing     |
| GET    | `/claims`                      | Get all claims                   |
| GET    | `/claims/{id}`                 | Get a claim by ID                |
| GET    | `/claims/listing/{listingId}`  | Get all claims for a listing     |

**Submit claim — request body:**
```json
{
  "listingId": 1,
  "claimerName": "City Food Bank",
  "amount": 3
}
```

## Swagger UI

Interactive API documentation is available directly on each service. No token required.

| Service             | Swagger URL                                  |
|---------------------|----------------------------------------------|
| inventory-service   | http://localhost:8081/swagger-ui/index.html  |
| transaction-service | http://localhost:8082/swagger-ui/index.html  |

## How Concurrency Safety Works

When a claim is submitted:

1. `transaction-service` calls `inventory-service` via **Feign** (resolved through Eureka by service name, not hardcoded URL)
2. `inventory-service` decrements the quantity inside a `@Transactional` method
3. The `FoodListing` entity carries a `@Version` field — JPA throws `ObjectOptimisticLockingFailureException` if two transactions attempt to update the same row simultaneously
4. If inventory is insufficient or the listing is already claimed, `transaction-service` catches the Feign error and returns `409 Conflict` instead of saving the claim

This prevents two simultaneous claimants from both successfully claiming the last unit of food.

## Project Structure

```
surplus-sync/                        ← parent Maven module
├── discovery-server/                ← Eureka service registry
├── api-gateway/                     ← Spring Cloud Gateway + JWT filter
├── auth-service/                    ← JWT token generation
├── inventory-service/               ← Food listings domain
│   └── src/main/java/.../inventory/
│       ├── entity/FoodListing.java
│       ├── repository/
│       ├── service/
│       └── controller/
├── transaction-service/             ← Claims domain
│   └── src/main/java/.../transaction/
│       ├── entity/Claim.java
│       ├── repository/
│       ├── service/
│       ├── controller/
│       └── client/InventoryClient.java  ← Feign client
└── frontend/                        ← React + Vite + Tailwind
    └── src/
```

## Configuration

Each service has its own `application.yml` under `src/main/resources/`. Update the MySQL credentials if yours differ from the defaults:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/inventory_db
    username: root
    password: root
```
