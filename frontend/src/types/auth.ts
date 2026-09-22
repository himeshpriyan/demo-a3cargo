export type UserRole =
  | 'SUPER_ADMIN'
  | 'OPS_MANAGER'
  | 'CUSTOMS_OFFICER'
  | 'PROCUREMENT_OFFICER'
  | 'SALES_EXECUTIVE'
  | 'FINANCE_CONTROLLER'
  | 'WAREHOUSE_OFFICER';

export type Permission =
  | 'shipment:create'
  | 'shipment:edit_rates'
  | 'shipment:edit_margins'
  | 'shipment:delete'
  | 'quotation:override_price'
  | 'quotation:approve'
  | 'quotation:view_buy_price'
  | 'tariff:upload'
  | 'tariff:verify'
  | 'finance:view_pnl'
  | 'finance:record_payment'
  | 'finance:edit_disbursement'
  | 'warehouse:record_shortage'
  | 'vendor:manage'
  | 'customer:manage'
  | 'customs:manage_cusdec'
  | 'logistics:manage_containers'
  | 'documents:upload';

export interface UserPersona {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  avatar: string;
  badgeColor: string;
  description: string;
  permissions: Permission[];
}

export const USER_PERSONAS: Record<UserRole, UserPersona> = {
  SUPER_ADMIN: {
    id: 'user-admin',
    name: 'Ananda Senanayake',
    email: 'ananda.s@a3cargo.lk',
    role: 'SUPER_ADMIN',
    title: 'Managing Director & IT Administrator',
    avatar: 'AS',
    badgeColor: 'bg-purple-600 text-white',
    description: 'Full unrestricted system access, global margin ceilings, financial year closing, and administrative controls.',
    permissions: [
      'shipment:create',
      'shipment:edit_rates',
      'shipment:edit_margins',
      'shipment:delete',
      'quotation:override_price',
      'quotation:approve',
      'quotation:view_buy_price',
      'tariff:upload',
      'tariff:verify',
      'finance:view_pnl',
      'finance:record_payment',
      'finance:edit_disbursement',
      'warehouse:record_shortage',
      'vendor:manage',
      'customer:manage',
      'customs:manage_cusdec',
      'logistics:manage_containers',
      'documents:upload'
    ]
  },
  OPS_MANAGER: {
    id: 'user-ops',
    name: 'Kasun Jayawardena',
    email: 'kasun.j@a3cargo.lk',
    role: 'OPS_MANAGER',
    title: 'Head of Freight Operations',
    avatar: 'KJ',
    badgeColor: 'bg-blue-600 text-white',
    description: 'Oversees container movements, vessel schedules, multi-stage shipment dispatch, and customer delivery orders.',
    permissions: [
      'shipment:create',
      'quotation:override_price',
      'quotation:approve',
      'quotation:view_buy_price',
      'vendor:manage',
      'customer:manage',
      'logistics:manage_containers',
      'customs:manage_cusdec',
      'documents:upload'
    ]
  },
  CUSTOMS_OFFICER: {
    id: 'user-cha',
    name: 'Rohan Perera',
    email: 'rohan.p@a3cargo.lk',
    role: 'CUSTOMS_OFFICER',
    title: 'Senior Customs House Agent (CHA)',
    avatar: 'RP',
    badgeColor: 'bg-emerald-600 text-white',
    description: 'Manages Sri Lanka Customs CUSDEC declarations, HS Tariff code verification (Chapters 01-97), SLSI testing, and quarantine approvals.',
    permissions: [
      'tariff:upload',
      'tariff:verify',
      'customs:manage_cusdec',
      'documents:upload'
    ]
  },
  PROCUREMENT_OFFICER: {
    id: 'user-procure',
    name: 'Vigneshwaran Ram',
    email: 'vignesh.r@a3cargo.in',
    role: 'PROCUREMENT_OFFICER',
    title: 'India Sourcing & Vendor Coordinator',
    avatar: 'VR',
    badgeColor: 'bg-amber-600 text-white',
    description: 'Manages Indian exporter profiles, vendor RFQs, Proforma Invoices (PI), carton packing calculations, and supplier payments.',
    permissions: [
      'vendor:manage',
      'quotation:view_buy_price',
      'documents:upload'
    ]
  },
  SALES_EXECUTIVE: {
    id: 'user-sales',
    name: 'Dilshan Silva',
    email: 'dilshan.s@a3cargo.lk',
    role: 'SALES_EXECUTIVE',
    title: 'Customer Account Manager',
    avatar: 'DS',
    badgeColor: 'bg-pink-600 text-white',
    description: 'Captures customer indents and submits target prices. Note: Raw Indian buy prices and confidential margin formulas are masked.',
    permissions: [
      'customer:manage',
      'documents:upload'
    ]
  },
  FINANCE_CONTROLLER: {
    id: 'user-finance',
    name: 'Nimali Fernando',
    email: 'nimali.f@a3cargo.lk',
    role: 'FINANCE_CONTROLLER',
    title: 'Chief Financial Officer & Billing Controller',
    avatar: 'NF',
    badgeColor: 'bg-teal-600 text-white',
    description: 'Locks USD/LKR/INR forex rates, audits port disbursement accounts, tracks demurrage, reconciles actual duty OCR bills, and reviews P&L analytics.',
    permissions: [
      'shipment:edit_rates',
      'shipment:edit_margins',
      'quotation:override_price',
      'quotation:approve',
      'quotation:view_buy_price',
      'finance:view_pnl',
      'finance:record_payment',
      'finance:edit_disbursement',
      'documents:upload'
    ]
  },
  WAREHOUSE_OFFICER: {
    id: 'user-warehouse',
    name: 'Samantha Gunasekera',
    email: 'samantha.g@a3cargo.lk',
    role: 'WAREHOUSE_OFFICER',
    title: 'Colombo Port Receiving & Cargo Inspector',
    avatar: 'SG',
    badgeColor: 'bg-orange-600 text-white',
    description: 'Conducts physical cargo inspections at Colombo CFS, records short quantities/damaged cartons, and tallies packing lists.',
    permissions: [
      'warehouse:record_shortage',
      'logistics:manage_containers',
      'documents:upload'
    ]
  }
};
