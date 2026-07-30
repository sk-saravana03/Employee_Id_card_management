# 🏢 Enterprise Employee ID Card Management System

An end-to-end, full-stack enterprise web application designed to automate and streamline the complete lifecycle of physical and digital employee ID cards, gate security verification, visitor passes, batch printing queues, multi-branch organizational structures, and compliance logging.

---

## 📋 Table of Contents
1. [System Overview](#-system-overview)
2. [User Roles & Access Control (RBAC)](#-user-roles--access-control-rbac)
3. [Core System Features & Modules](#-core-system-features--modules)
4. [ID Card Lifecycle & Theme Engine](#-id-card-lifecycle--theme-engine)
5. [Technical Architecture](#-technical-architecture)
6. [Security & Encryption Standards](#-security--encryption-standards)
7. [Installation & Getting Started](#-installation--getting-started)

---

## 🌐 System Overview

In modern enterprises, managing employee identity credentials efficiently and securely is vital. The **Employee ID Card Management System** replaces manual, disjointed processes with a centralized digital platform that spans HR onboarding, card design generation, multi-stage approval workflows, hardware print queues, front-gate QR/barcode security verification, and visitor tracking.

---

## 👑 User Roles & Access Control (RBAC)

The application implements granular Role-Based Access Control (**RBAC**) across **5 distinct system roles**:

| System Role | Primary Scope | Core Responsibilities & Permissions |
| :--- | :--- | :--- |
| **Super Admin** | Full Unrestricted System Access | Complete system governance, user account management (CRUD), system role assignments, department & branch configuration, full audit log inspection, database management. |
| **HR / Admin** | Employee Directory & ID Governance | Employee record onboarding, reviewing and approving/rejecting ID card issuance requests (HR approval level), managing department assignments, bulk employee CSV import/export. |
| **Printer Operator** | Print Production & Hardware Monitoring | Managing batch print queue, monitoring hardware diagnostics (toner, ribbon, card stock levels), executing print runs, marking physical cards as `PRINTED` / `DELIVERED`. |
| **Security Officer** | Gate Check-In & Visitor Verification | Real-time QR Code and Barcode scanner for employee card verification, registering external visitors, issuing temporary visitor passes, logging gate attendance. |
| **Employee** | Self-Service Portal | Viewing personal profile details, launching interactive digital ID badge (3D card flip with live QR code), requesting card re-issuance/replacement, tracking attendance history. |

---

## ⚡ Core System Features & Modules

### 🎴 1. ID Card Lifecycle & Generation Engine
- **Multi-Level Approval Workflow:**
  - `REQUESTED_PENDING_HR`: Card request initiated by HR or Employee self-service.
  - `APPROVED_BY_HR`: Verified by HR.
  - `APPROVED_BY_ADMIN` / `QUEUED`: Approved for physical card production.
  - `PRINTING` / `PRINTED`: Processed by Printer Operator.
  - `DELIVERED`: Physical card handed over to employee.
  - Supports `REJECTED` and `REVOKED` states with audit reasons.
- **Interactive Dual-Sided Card Preview:**
  - **Front Side:** High-res photo, unique Employee ID, name, designation, department chip, magnetic stripe / smart chip graphic, corporate branding.
  - **Back Side:** Dynamic QR code, 1D Barcode, issue/expiry dates, emergency contact info, company return address, disclaimer text.
- **Digital ID Card Portal:** Responsive digital card badge accessible on mobile or desktop for instant gate scanning.
- **Card Versioning:** Tracks history (V1, V2, etc.) for lost, stolen, damaged, or expired cards.

### 🖨️ 2. Print Queue & Hardware Management
- **Batch Print Queue:** Filter jobs by status (`QUEUED`, `IN_PROGRESS`, `COMPLETED`, `FAILED`), assign priority, and trigger bulk print runs.
- **Printer Hardware Telemetry:** Monitor physical card printers (Magicard, Fargo, Zebra, Evolis) showing:
  - Connection status (`ONLINE` / `OFFLINE`)
  - Remaining card stock count (%)
  - Ribbon & toner levels (%)
  - IP Address and diagnostic health alerts.

### 👥 3. Employee Directory & Records
- **Comprehensive Profiles:** Auto-generated Employee IDs (e.g. `EMP260000001`), contact details, emergency contacts, blood group, designation, department, branch, joining date, and active status (`ACTIVE`, `INACTIVE`, `SUSPENDED`).
- **Bulk CSV Upload & Export:** Batch import employees via CSV template with automatic field mapping and data validation. Export filtered lists to CSV/JSON/PDF.

### 🚪 4. Visitor Management & Security Verification
- **QR / Barcode Scanner:** Real-time scanner for Security Officers to verify card authenticity (`VALID`, `EXPIRED`, `REVOKED`).
- **Visitor Registration & Passes:** Register guests with host employee details, photo capture, visit purpose, and issue temporary visitor passes with auto-expiring QR codes.
- **Gate Entry / Exit Logging:** Timestamped entry and exit logging for facility security.

### 🏢 5. Multi-Branch & Department Hierarchy
- **Branch Infrastructure:** Manage multiple corporate locations (Headquarters, Regional Centers, Logistics Hubs).
- **Department Structure:** Organize teams with department codes, manager assignments, and employee headcount statistics.

### 📊 6. Analytics, Reports & Audit Logging
- **Executive Dashboard:** Live metrics for total employee headcount, active ID cards, pending print jobs, visitor counts, and attendance stats.
- **Audit Log Trail:** Immutable logs recording user actions, logins, card status changes, and IP addresses.

---

## 🎨 ID Card Theme Engine

The system automatically assigns tailored visual themes based on job designations:

| Theme Name | Target Roles / Keywords | Primary Accent & Header Styling |
| :--- | :--- | :--- |
| **Executive Gold** | CEO, CTO, CFO, Directors, Vice Presidents | Deep Navy & Gold Gradient (`#f59e0b`) |
| **Management Indigo** | Managers, Department Heads, Team Leads | Royal Indigo & Purple (`#6366f1`) |
| **Tech Teal** | Engineers, Developers, Architects, QA | Cyber Teal & Cyan (`#06b6d4`) |
| **Creative Violet** | Designers, UI/UX, Marketing | Deep Violet & Purple (`#8b5cf6`) |
| **Finance Emerald** | Financial Officers, Accountants, Auditors | Emerald Green (`#10b981`) |
| **Security Red** | Security Officers, Safety, Compliance | Crimson Security Red (`#ef4444`) |
| **HR Rose** | HR Operations, Recruiters, Talent | Rose Pink (`#f43f5e`) |
| **Ops Amber** | Operations, Logistics, Warehouse | Amber / Orange (`#f97316`) |
| **Sales Blue** | Sales Executives, BD, Client Managers | Sapphire Blue (`#3b82f6`) |
| **Staff Slate** | General Staff Default | Slate Dark (`#64748b`) |

---

## 🛠️ Technical Architecture

```
Employee ID Card Management System
├── backend/                  # Node.js & Express API Server
│   ├── src/
│   │   ├── config/           # Database & Environment Configuration
│   │   ├── controllers/      # API Controllers (Auth, Employee, ID Card, Visitor, Print)
│   │   ├── middleware/       # JWT Auth, RBAC Authorization, Rate Limiting
│   │   ├── models/           # Mongoose Data Schemas (User, Employee, IdCard, PrintQueue, Visitor)
│   │   ├── routes/           # RESTful Route Endpoints
│   │   ├── services/         # Business Logic, Email Service, Lifecycle Engine
│   │   └── utils/            # AES-256 Encryption, ID Generators, Helpers
│   └── seed.js               # Database Seeder (Roles, Branches, Departments, Users)
└── frontend/                 # React 18 + Vite Web Application
    ├── src/
    │   ├── api/              # Axios API Client
    │   ├── components/       # Reusable UI Components & Card Renderers
    │   ├── context/          # Auth & Theme Context Providers
    │   ├── layouts/          # Dashboard Layout Structure
    │   ├── pages/            # View Pages (Dashboard, Employees, ID Cards, Visitor, Print Queue)
    │   └── utils/            # Designation Theme Resolver & Helpers
```

---

## 🔒 Security & Encryption Standards

- **Field-Level Encryption:** Sensitive PII (National ID / SSN, Phone numbers) is encrypted using **AES-256-CBC** before database storage.
- **Password Hashing:** Passwords hashed using **Bcrypt** with 12 salt rounds.
- **Authentication:** Stateless **JWT** with bearer tokens and single-session enforcement options.
- **RBAC Guard Middleware:** Route protection via `authorize(...roles)` and `checkPermission('permission_name')`.

---

## 🚀 Installation & Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB instance or MongoDB Atlas URI

### 1. Backend Setup
```bash
cd backend
npm install
```
Configure `.env` file:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/enterprise_id_card_db
JWT_SECRET=your_jwt_secret_key
ENCRYPTION_KEY=32_byte_hex_encryption_key
```
Seed initial data (Roles, Branches, Departments, Demo Users):
```bash
npm run seed
```
Start backend server:
```bash
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Access the web application at `http://localhost:5173`.
