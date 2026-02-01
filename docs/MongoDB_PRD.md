# Product Requirements Document (PRD) - MongoDB Integration

## Overview
This document outlines the requirements for integrating MongoDB into the Metis project. The integration focuses on high security, data encryption, and strict isolation of data between different users.

## Goals
1. Add a MongoDB service to the existing Docker Compose setup.
2. Implement strict user data isolation.
3. Ensure data is encrypted at rest and in transit.
4. Provide a secure method for developers to access data for debugging.

## Technical Requirements

### 1. Storage & Encryption
- **Database Engine**: MongoDB (Community or Enterprise).
- **Encryption at Rest**:
  - Since MongoDB Community Edition lacks native encryption at rest, we will recommend using a **LUKS-encrypted volume** or **application-level encryption (FLE - Field Level Encryption)** for highly sensitive data.
  - For the PRD, we will focus on configuring MongoDB with **Internal Authentication (Keyfiles)** and **TLS/SSL**.
- **Encryption in Transit**: Force all connections to use TLS/SSL.

### 2. User Data Isolation
- **Strategy**: **Database-per-user** isolation.
- **Access Control**:
  - Implement MongoDB's Role-Based Access Control (RBAC).
  - Each application user will correspond to a unique MongoDB user with `readWrite` permissions limited to their specific database.
  - A master `admin` user will exist only for orchestration and maintenance.

### 3. Docker Orchestration
- **Service Name**: `mongodb`
- **Image**: `mongo:latest` (or specific stable version).
- **Persistence**: Named volume with proper host permissions.
- **Security**:
  - Dedicated network for the server-to-database communication.
  - MongoDB port (27017) should **not** be exposed to the public internet.

### 4. Secure Debugging Access
- **Option A (Recommended)**: Expose MongoDB port only to `127.0.0.1` on the host machine. requires the developer to use a MongoDB client (like Compass) with the admin credentials.
- **Option B**: Deploy a `mongo-express` container (web-based GUI) behind strong Basic Auth, only accessible via a configuration flag.

## Security Checklist
- [ ] Initialize MongoDB with `--auth`.
- [ ] Use a strong `MONGO_INITDB_ROOT_PASSWORD` via environment variables.
- [ ] Configure keyfile-based internal authentication for replica sets (even if single node) to enable advanced security.
- [ ] Implement TLS for all client-server communication.
- [ ] Automate the creation of user-specific databases and credentials.

## Implementation Steps (Phased)
1. **Phase 1**: Update `docker-compose.yml` with a secure MongoDB service.
2. **Phase 2**: Configure FastAPI to handle multi-tenant database connections.
3. **Phase 3**: Implement encryption strategies (TLS + Field Level Encryption for sensitive fields).
4. **Phase 4**: Setup debugging access via localized port binding.
