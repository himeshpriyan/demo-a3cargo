# A3 Cargo — Sri Lanka Customs Import Tariff & Freight Management System

A modern React + TypeScript single-page application for customs tariff digitizing, product pricing calculation, customer requirement tracking, vendor proforma management, quotation approvals, and multi-stage shipment operations.

## Architecture: Fully Client-Side with In-Browser Data & Calculation Engine

This application runs **100% client-side** — no backend server or external database needed:
- **Client-Side Data Store**: Persistent state across sessions via browser `localStorage`, pre-seeded with realistic demonstration data.
- **Customs Calculation Engine**: Full client-side implementation of duty calculations (General Duty, VAT, PAL, CESS, SSCL, SCL), freight allocations (by weight/quantity), margin rules (margin on revenue vs markup on cost), net settlements, and profit predictions.
- **Client-Side Document Exporters**: Real-time generation of CSV spreadsheets and printable document previews directly from browser memory.
- **Mock Datasets**: Pre-seeded with Sri Lanka Customs Tariff chapters (01–97), master product catalog (Ghee, Rice, Dhal, Millets, Spices, FMCG items), customer profiles, Indian vendor profiles, and sample multi-stage shipments (`AEC/1001/2026-27`).

---

## Quick Start Instructions

### Prerequisites
- Node.js v18+ and npm

### Run the Application

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start the Vite development server
npm run dev
```

Open `http://localhost:5173` (or the port shown in the terminal) in your browser.

---

## Key Modules & Features

1. **Shipments & Multi-Stage Operations**:
   - **Stage 1**: Customer Requirements (Product items, quantities, HSN codes, target pricing).
   - **Stage 2**: Vendor Allocations & Proforma Invoices (RFQ documents, carton & weight calculations).
   - **Stage 3**: Customer Quotation Review, Negotiation & Purchase Order confirmation.
   - **Stage 4**: Pricing & Duty Calculation Engine (Auto HS matching, C&F price, duty levies, profit simulation).
   - **Stage 5**: Predicted vs Actual Duty & OCR Invoicing analysis.
   - **Stage 6**: Document Generation (Commercial Invoices, Colombo Bank Invoices, Packing Lists, Duty Reports, COO, Full Workbooks).
   - **Stage 7**: Vendor Payments & Payment Summaries.
   - **Stage 8**: Proforma vs Actual Invoicing Comparison.
   - **Stage 9**: Physical Receiving & Verification.
   - **Stage 10**: Packing List Generation.

2. **Customer Master**:
   - Importer profiles, VAT / Tax IDs, addresses, and contacts.

3. **Vendor Management**:
   - Exporter / supplier profiles, bank details, GSTIN, category mappings, and matching supplier lookups.

4. **Item Master / Catalog**:
   - Trade favorites, unit price benchmarks, weight definitions, and unified search.

5. **Tariff Schedule Search & Verification**:
   - 97 Chapters, HS Code search, rate breakdown, and human verification studio.

6. **Dashboard Analytics**:
   - Revenue, duty, cost, and profit KPIs with customer-by-customer financial summaries.
