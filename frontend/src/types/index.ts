export interface Chapter {
  id: number;
  chapter_number: number;
  section_number?: string;
  section_title?: string;
  chapter_title?: string;
  source_pdf_filename?: string;
  last_imported_at?: string;
  total_lines: number;
}

export interface TariffLine {
  id: number;
  chapter_id: number;
  chapter_number?: number;
  section_number?: string;
  hs_code?: string;
  description: string;
  unit?: string;
  icl_slsi?: string;
  general_duty_rate?: string;
  preferential_rates?: Record<string, string>;
  vat_rate?: string;
  pal_rate?: string;
  cess_rate?: string;
  sscl_rate?: string;
  excise_rate?: string;
  scl_rate?: string;
  notes?: string;
  indent_level: number;
  raw_row_text?: string;
  page_number?: number;
  is_verified: boolean;
}

export interface ImportLog {
  id: number;
  filename: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  rows_extracted: number;
  errors: string[];
  imported_at: string;
}

export interface BatchImportSummary {
  total_files_processed: number;
  successful_files: number;
  failed_files: number;
  total_rows_extracted: number;
  logs: ImportLog[];
}

export interface PaginatedTariffResponse {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  items: TariffLine[];
}

export interface TariffSearchResult {
  tariff_line_id?: number;
  hs_code?: string;
  description: string;
  unit?: string;
  chapter_number?: number;
  chapter_title?: string;
  section_number?: string;
  general_duty_rate?: string;
  vat_rate?: string;
  pal_rate?: string;
  cess_rate?: string;
  sscl_rate?: string;
  excise_rate?: string;
}

export interface UnifiedProductSearchResult {
  item_category: string;
  source: 'FAVORITE' | 'TARIFF';
  id?: number;
  tariff_line_id?: number;
  item_name: string;
  hs_code?: string;
  description?: string;
  product_category?: string;
  unit?: string;
  currency?: string;
  purchase_price?: number;
  weight_val?: number;
  weight_unit?: string;
  general_duty_rate?: string;
  vat_rate?: string;
  pal_rate?: string;
  cess_rate?: string;
  sscl_rate?: string;
  excise_rate?: string;
  scl_rate?: string;
}

export interface ItemEntry {
  id: number;
  item_name: string;
  item_category?: string;
  unit?: string;
  notes?: string;
  currency: string;
  tariff_line_id?: number;
  hs_code?: string;
  tariff_description?: string;
  general_duty_rate?: string;
  vat_rate?: string;
  pal_rate?: string;
  cess_rate?: string;
  sscl_rate?: string;
  excise_rate?: string;
  scl_rate?: string;
  weight_val?: number;
  weight_unit?: string;
  is_favorite?: boolean;
  purchase_price?: number | string;
  price_per_kg?: number | string;
  total_quantity_kg?: number | string;
  per_month_qty_kg?: number | string;
  total_value?: number | string;
  per_month_value?: number | string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedItemEntryResponse {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  items: ItemEntry[];
}

export interface Customer {
  id: number;
  name: string;
  code: string;
  email?: string;
  phone?: string;
  address?: string;
  country?: string;
  tax_id?: string;
  created_at: string;
}

export interface ShipmentProduct {
  id: number;
  shipment_id: number;
  customer_id: number;
  customer_name?: string;
  product_name: string;
  product_category?: string;
  hsn_code?: string;
  quantity: number;
  weight_val?: number;
  weight_unit?: string;
  unit?: string;
  purchase_price: number;
  currency?: string;
  pkt_size_g?: number;
  no_bags_qty?: number;
  net_weight_kg?: number;
  gross_weight_kg?: number;
  discount_lkr?: number;
  set_price_lkr?: number;
  short_qty?: number;
  short_amt_lkr?: number;
  net_settlement_lkr?: number;
  freight_allocation_lkr?: number;
  port_charges_lkr?: number;
  base_price_lkr?: number;
  cnf_price?: number;
  general_duty_rate?: string;
  vat_rate?: string;
  pal_rate?: string;
  cess_rate?: string;
  sscl_rate?: string;
  calculated_duty_lkr?: number;
  total_cost_lkr?: number;
  indian_price?: number;
  srilankan_price?: number;
  suggested_price?: number;
  final_quotation_price?: number;
  predicted_profit?: number;
  is_active?: boolean;
  item_classification?: string;
  notes?: string;
}

export interface ShipmentActual {
  id: number;
  shipment_id: number;
  actual_duty_inr: number;
  actual_duty_lkr: number;
  actual_cost_inr: number;
  actual_cost_lkr: number;
  actual_revenue_inr: number;
  actual_revenue_lkr: number;
  actual_profit_lkr: number;
  ocr_source_file?: string;
  notes?: string;
  updated_at: string;
}

export interface VendorProductMapping {
  id: number;
  vendor_id: number;
  product_category: string;
  notes?: string;
  created_at: string;
}

export interface Vendor {
  id: number;
  name: string;
  code: string;
  legal_name?: string;
  trade_name?: string;
  company_type?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  country?: string;
  gstin?: string;
  pan_number?: string;
  bank_account_number?: string;
  bank_ifsc_code?: string;
  bank_name?: string;
  bank_branch?: string;
  main_category?: string;
  sub_categories?: string[];
  products_supplied?: string[];
  status?: 'Active Supplier' | 'Pending Review' | 'Inactive';
  created_at: string;
  mappings?: VendorProductMapping[];
}

export interface VendorProductMatchResponse {
  product_name: string;
  last_allocated_vendor?: Vendor;
  matching_vendors: Vendor[];
  all_vendors: Vendor[];
}

export interface CustomerRequirementHistory {
  id: number;
  requirement_id: number;
  shipment_id: number;
  customer_id: number;
  product_name: string;
  old_quantity?: number;
  new_quantity: number;
  unit: string;
  action_type: 'CREATED' | 'UPDATED' | 'BULK_UPLOAD' | 'ADDED_LATER';
  modified_at: string;
  customer?: Customer;
}

export interface ShipmentCustomerRequirement {
  id: number;
  shipment_id: number;
  customer_id: number;
  product_name: string;
  hsn_code?: string;
  required_quantity: number;
  unit: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  history?: CustomerRequirementHistory[];
}

export interface ShipmentVendorProformaItem {
  id: number;
  shipment_id: number;
  allocation_id?: number;
  vendor_id: number;
  product_name: string;
  sku?: string;
  hsn_code?: string;
  proforma_qty: number;
  cartons_count: number;
  units_per_carton: number;
  unit_weight_val: number;
  unit_weight_unit: string;
  net_weight_kg: number;
  gross_weight_kg: number;
  proforma_price: number;
  mrp?: number;
  discount_pct?: number;
  gst_pct?: number;
  total_payable?: number;
  currency: string;
  notes?: string;
  created_at: string;
  vendor?: Vendor;
}

export interface PreliminaryQuotationItem {
  id: number;
  shipment_id: number;
  requirement_id?: number;
  vendor_id?: number;
  vendor_name?: string;
  product_name: string;
  hsn_code?: string;
  quantity: number;
  unit: string;
  unit_price_inr: number;
  unit_cost_lkr: number;
  estimated_selling_price_lkr: number;
  customer_target_price?: number;
  approval_status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEGOTIATED';
  notes?: string;
}

export interface QuotationHistoryLog {
  id: number;
  shipment_id: number;
  quotation_item_id?: number;
  product_name: string;
  action_type: 'APPROVED' | 'REMOVED' | 'PRICE_CHANGE_REQUESTED';
  old_value?: string;
  new_value?: string;
  notes?: string;
  created_at: string;
}

export interface ShipmentVendorAllocation {
  unit?: string;
  id: number;
  shipment_id: number;
  requirement_id: number;
  vendor_id: number;
  allocated_quantity: number;
  allocated_unit: string;
  status: 'PENDING_PI' | 'PI_RECEIVED' | 'CONFIRMED';
  notes?: string;
  created_at: string;
  updated_at: string;
  requirement?: ShipmentCustomerRequirement;
  vendor?: Vendor;
  proforma_items?: ShipmentVendorProformaItem[];
}

export interface Shipment {
  id: number;
  shipment_no: string;
  sequence_number: number;
  financial_year: string;
  shipment_date?: string;
  status: 'DRAFT' | 'CONFIGURED' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';
  destination?: string;
  currency?: string;
  current_stage?: string;
  usd_rate: number;
  lkr_inr_rate: number;
  profit_margin_pct: number;
  indian_invoice_margin_pct?: number;
  colombo_invoice_margin_pct?: number;
  margin_mode?: 'MARGIN_ON_REVENUE' | 'MARKUP_ON_COST';
  common_expenses_inr: number;
  common_expenses_lkr: number;
  port_expenses_lkr?: number;
  freight_allocation_mode?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  customers: Customer[];
  products: ShipmentProduct[];
  actuals?: ShipmentActual;
  requirements?: ShipmentCustomerRequirement[];
  allocations?: ShipmentVendorAllocation[];
  proforma_items?: ShipmentVendorProformaItem[];
}

export interface CustomerProfitSummary {
  customer_id: number;
  customer_name: string;
  customer_code: string;
  total_shipments: number;
  total_sales_lkr: number;
  total_cost_lkr: number;
  total_profit_lkr: number;
  pending_amount_lkr: number;
}

export interface DashboardSummary {
  total_shipments: number;
  total_sales_lkr: number;
  total_duty_lkr: number;
  total_cost_lkr: number;
  total_profit_lkr: number;
  total_loss_lkr: number;
  customer_summaries: CustomerProfitSummary[];
  year_wise_summary: Record<string, any>;
}

// ── MODULE 2: Container Logistics & Vessel Tracking ─────────────────────────
export type MaritimeMilestoneStatus =
  | 'BOOKED'
  | 'GATED_IN'
  | 'SAILED_POL'
  | 'IN_TRANSIT'
  | 'ARRIVED_COLOMBO'
  | 'BERTHED'
  | 'CUSTOMS_EXAM'
  | 'CLEARED'
  | 'DESTUFFED'
  | 'DELIVERED';

export interface MilestoneEvent {
  step: MaritimeMilestoneStatus;
  label: string;
  location: string;
  planned_date: string;
  actual_date?: string;
  is_completed: boolean;
  notes?: string;
}

export interface ContainerTrackingRecord {
  id: number;
  shipment_id: number;
  shipment_no: string;
  container_no: string;
  container_size: '20FT_STD' | '40FT_HC' | '40FT_STD' | 'REEFER';
  seal_no: string;
  carrier_name: string; // e.g. 'Maersk Line', 'MSC', 'CMA CGM', 'Bengal Tiger Line'
  vessel_name: string;
  voyage_no: string;
  master_bl_no: string;
  house_bl_no: string;
  port_of_loading: string; // e.g. 'Tuticorin Port (IN TUC)'
  port_of_discharge: string; // e.g. 'Colombo Port (LK CMB)'
  etd: string;
  eta: string;
  berth_terminal?: string; // e.g. 'SAGT' or 'JCT' or 'CICT'
  current_milestone: MaritimeMilestoneStatus;
  gross_weight_kg: number;
  cbm_volume: number;
  milestones: MilestoneEvent[];
  updated_at: string;
}

// ── MODULE 3: Sri Lanka Customs Regulatory Desk ─────────────────────────────
export type CustomsChannel = 'GREEN' | 'YELLOW' | 'RED';
export type RegulatoryStatus = 'PENDING' | 'IN_PROGRESS' | 'CLEARED' | 'REJECTED' | 'EXEMPT';

export interface CusdecDeclaration {
  id: number;
  shipment_id: number;
  shipment_no: string;
  cusdec_office_code: string; // 'CMB-HQ'
  declaration_no: string; // e.g. 'C-2026/89412'
  assessment_notice_no: string;
  manifest_no: string;
  cpc_code: string; // '4000 (Home Consumption)'
  importer_tin_vat: string;
  declarant_cha_license: string;
  channel: CustomsChannel;
  assessed_duty_lkr: number;
  duty_payment_receipt_no?: string;
  duty_paid_date?: string;
  is_warranted: boolean;
  notes?: string;
  updated_at: string;
}

export interface SlsiInspection {
  id: number;
  shipment_id: number;
  shipment_no: string;
  sample_drawn_date?: string;
  slsi_file_ref: string;
  product_name: string;
  standards_specification: string; // e.g. 'SLS 102 (Ghee)'
  lab_test_status: 'SAMPLE_COLLECTED' | 'TESTING_IN_LAB' | 'STANDARDS_CONFORMED' | 'REJECTED';
  permit_no?: string;
  clearance_date?: string;
}

export interface QuarantineRecord {
  id: number;
  shipment_id: number;
  shipment_no: string;
  phyto_certificate_no: string;
  fumigation_cert_date: string;
  npqs_officer_name?: string;
  inspection_status: RegulatoryStatus;
  release_order_no?: string;
}

// ── MODULE 4: Port Disbursement Account & Demurrage Clock ───────────────────
export interface PortDisbursementItem {
  id: number;
  category: 'WHARFAGE' | 'THC' | 'STEVEDORING' | 'GATE_PASS' | 'EDI_ENTRY' | 'AGENCY_FEE';
  description: string;
  amount_lkr: number;
  is_billed_to_customer: boolean;
  receipt_ref?: string;
}

export interface PortDisbursementAccount {
  id: number;
  shipment_id: number;
  shipment_no: string;
  terminal_operator: 'SLPA' | 'SAGT' | 'CICT';
  items: PortDisbursementItem[];
  total_disbursement_lkr: number;
  agency_commission_lkr: number;
  sscl_tax_lkr: number;
  vat_tax_lkr: number;
  grand_total_lkr: number;
  payment_status: 'UNPAID' | 'PARTIALLY_SETTLED' | 'SETTLED';
  settled_date?: string;
}

export interface DemurrageClock {
  id: number;
  shipment_id: number;
  shipment_no: string;
  container_no: string;
  arrival_date: string;
  free_days_allowed: number;
  free_days_expiry_date: string;
  status: 'SAFE' | 'WARNING' | 'OVERDUE';
  days_remaining: number;
  penalty_per_day_usd: number;
  accrued_demurrage_usd: number;
  accrued_demurrage_lkr: number;
}

// ── MODULE 5: Centralized Document E-Vault ──────────────────────────────────
export type DocumentCategory = 'COMMERCIAL' | 'TRANSPORT' | 'CUSTOMS_REGULATORY' | 'BANKING_FINANCE';

export interface VaultDocument {
  id: number;
  shipment_id: number;
  shipment_no: string;
  category: DocumentCategory;
  doc_title: string;
  file_name: string;
  file_size_kb: number;
  mime_type: string;
  uploaded_at: string;
  uploaded_by: string;
  is_verified: boolean;
  verified_by?: string;
  preview_url?: string;
  tags: string[];
}

// ── MODULE 6: Freight Rate Card & Landing Cost ─────────────────────────────
export interface FreightRateCard {
  id: number;
  origin_port: string;
  destination_port: string;
  carrier: string;
  container_20ft_usd: number;
  container_40ft_hc_usd: number;
  lcl_per_cbm_usd: number;
  transit_days: number;
  effective_date: string;
  valid_until: string;
}

export interface LandingCostSimulation {
  product_name: string;
  hs_code: string;
  origin_port: string;
  weight_kg: number;
  quantity: number;
  buy_price_inr: number;
  cbm: number;
  exchange_usd_lkr: number;
  exchange_lkr_inr: number;
  total_cif_lkr: number;
  customs_duty_lkr: number;
  port_charges_lkr: number;
  total_landing_cost_lkr: number;
  cost_per_kg_lkr: number;
  recommended_selling_price_lkr: number;
  gross_margin_pct: number;
}


