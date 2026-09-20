# 🏛️ Labour Mitra Enterprise OS
### Multi-Tenant Industrial Manpower Supply, Statutory Compliance & Payout Gateway

---

## 1. Project Purpose & Multi-Tenant SaaS Overview

Labour Mitra Enterprise OS is an enterprise-grade, multi-tenant Software-as-a-Service (SaaS) platform engineered for industrial manpower contractors, site supervisors, and principal employers (Plant HR / Operations Management).

The system centralizes and automates:
* Daily shift muster registration, biometric punching reconciliation, and overtime (OT) accounting.
* A configurable statutory wage and social security calculation engine (EPF, ESIC, etc.) adaptable to changing labor regulatory laws.
* Site advance disbursements, petty cash tracking, and automated internal payroll recovery ledgers.
* Direct banking channel payroll execution (Bilingual bank authority letters and bulk NEFT payment advice).
* Client commercial billing, B2B GST tax invoicing (SAC 998519), and unified statutory returns preparation (Form XXIV, ECR, GSTR-1, GSTR-3B).

### Target Scale & Deployment Horizon
The platform architecture is designed and partitioned to support a baseline deployment of at least 100 independent contractor tenant accounts, along with their associated supervisor pools, worker master records, live attendance rosters, and financial audit trails, with horizontal scaling across partitioned cloud databases.

---

## 2. Multi-Tenant Architecture & Data Isolation

Multi-tenancy in Labour Mitra is enforced via isolated tenant data trees and backed by strict server-side authorization:

### Tenant Isolation Flow
```text
Authenticated Firebase UID (auth.uid)
               ↓
           Users Tree (/users/$uid)
               ↓
      Verified Role & Contractor ID
               ↓
Tenant-Scoped Node (/tenants/$contractorId/*)
               ↓
[Sites | Workers | Attendance | Payroll | Advances | Invoices | Audit Logs]
