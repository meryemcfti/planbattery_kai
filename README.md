<div align="center">

# 🌍 PlanBattery (Kai) — Enterprise Carbon Footprint & ESG Reporting Platform

**End-to-end corporate greenhouse gas (GHG) accounting, automated $CO_2e$ emission calculation, and sustainability reporting system.**  
*Kurumsal sera gazı (GHG) muhasebesi, otomatik $CO_2e$ emisyon hesaplama ve sürdürülebilirlik raporlama sistemi.*

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma_ORM-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![React](https://img.shields.io/badge/React-Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)

</div>

---
### 🎯 1. Why Use This Platform?
With evolving regulations such as the **European Green Deal** and the **Carbon Border Adjustment Mechanism (CBAM)**, organizations are increasingly required to measure, verify, and report their greenhouse gas emissions transparently. However, many companies still rely on fragmented spreadsheets and error-prone manual calculations.

**PlanBattery (Kai)** solves this challenge by providing a centralized, auditable platform:
* **Eliminates Calculation Errors:** Replaces manual spreadsheet formulas with a centralized engine backed by configurable emission factors.
* **Audit & Compliance Readiness:** Tracks **Scope 1, Scope 2, and Scope 3** emissions systematically in alignment with international GHG accounting standards.
* **Operational Efficiency:** Consolidates electricity, fuel, and operational consumption data across departments, reducing reporting cycles from days to minutes.
* **Data-Driven Sustainability Strategy:** Gives leadership clear visibility into high-emission activities to prioritize carbon reduction initiatives.

---

### 🛠️ 2. Tech Stack & Engineering Approach
This platform was engineered with a focus on **type safety, modular architecture, and scalability**:

* **Backend & API:** Node.js, Express, TypeScript, Swagger UI / OpenAPI 3.0
* **Database & ORM:** PostgreSQL (Cloud/Neon & Docker support), Prisma ORM
* **Frontend:** React, TypeScript, Vite
* **Security, Validation & Testing:** JWT Authentication, Role-Based Access Control (RBAC), Zod Schema Validation, Vitest, ESLint

#### Development Roadmap
1. **Relational Data Modeling:** Designed a strict PostgreSQL schema via Prisma linking organizations, user roles, emission categories, configurable emission factors, and periodic activity records.
2. **Modular Backend & RBAC:** Separated routing, validation, business logic (`services`), and request handling (`controllers`), implementing dedicated authorization layers for **Company Admins** and **Carbon Specialists**.
3. **Emission Calculation Engine & OpenAPI:** Built an automated service to convert raw activity inputs into standardized **$CO_2e$** metrics, fully documented via interactive Swagger endpoints.
4. **Role-Tailored Client Interface:** Developed a responsive React + TypeScript frontend focused on clean data entry and clear analytical visibility.

---

### 🚀 3. Getting Started

#### Prerequisites
* **Node.js** (v18+)
* **PostgreSQL** instance (Local, Docker, or Cloud PostgreSQL such as Neon)

#### Step 1: Clone & Configure Environment
    git clone https://github.com/meryemcfti/planbattery_kai.git
    cd planbattery_kai
    cp .env.example .env

> Update `DATABASE_URL` and `JWT_SECRET` inside `.env` with your PostgreSQL connection string.

#### Step 2: Start Backend & Sync Database
    npm install
    npm run db:generate
    npm run db:push
    npm run dev

* **API Base URL:** `http://localhost:3000`
* **Interactive Swagger UI:** `http://localhost:3000/api/docs`
* **OpenAPI JSON:** `http://localhost:3000/api/openapi.json`

#### Step 3: Start Frontend Client
Open a second terminal window:

    cd frontend
    npm install
    npm run dev

* **Web Application:** `http://localhost:5173`
