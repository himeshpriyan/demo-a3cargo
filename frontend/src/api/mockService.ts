import { MockStorage } from './mockData';
import type {
  Chapter,
  TariffLine,
  ImportLog,
  BatchImportSummary,
  PaginatedTariffResponse,
  TariffSearchResult,
  UnifiedProductSearchResult,
  ItemEntry,
  PaginatedItemEntryResponse,
  Customer,
  Shipment,
  ShipmentProduct,
  ShipmentActual,
  DashboardSummary,
  Vendor,
  VendorProductMatchResponse,
  ShipmentCustomerRequirement,
  CustomerRequirementHistory,
  ShipmentVendorAllocation,
  ShipmentVendorProformaItem,
  PreliminaryQuotationItem,
  QuotationHistoryLog,
} from '../types';

// Helper for parsing rates like '15%', 'Free', 'Rs. 50/kg'
function parsePercentageRate(rateStr?: string): number {
  if (!rateStr) return 0;
  const clean = rateStr.trim().toUpperCase();
  if (clean === 'FREE' || clean === 'NIL' || clean === '-') return 0;
  const match = clean.match(/(\d+(?:\.\d+)?)\s*%/);
  if (match) {
    const parsed = parseFloat(match[1]);
    return isNaN(parsed) ? 0 : parsed;
  }
  const directNum = parseFloat(clean);
  return isNaN(directNum) ? 0 : directNum;
}

// Recalculates product prices, duty, freight, margins, net settlement, profit
export function recalculateShipmentData(shipment: Shipment): Shipment {
  if (!shipment.products || shipment.products.length === 0) {
    return shipment;
  }

  const usdRate = Number(shipment.usd_rate) || 1.0;
  const lkrInrRate = Number(shipment.lkr_inr_rate) || 1.0;
  const targetMarginPct = Number(shipment.profit_margin_pct) || 15.0;
  const mode = shipment.freight_allocation_mode || 'WEIGHT';

  let commonExpLkr = Number(shipment.common_expenses_lkr) || 0;
  if (shipment.common_expenses_inr && Number(shipment.common_expenses_inr) > 0) {
    commonExpLkr += Number(shipment.common_expenses_inr) * (lkrInrRate !== 0 ? 1.0 / lkrInrRate : 1.0);
  }
  const portExpLkr = Number(shipment.port_expenses_lkr) || 0;

  const totalQty = shipment.products.reduce((acc, p) => acc + (Number(p.quantity) || 0), 0) || 1.0;

  const productWeights = shipment.products.map(p => {
    const q = Number(p.quantity) || 1.0;
    let w = Number(p.net_weight_kg || p.weight_val || 0.0);
    if (p.weight_unit && ['G', 'GRAM', 'GRAMS'].includes(p.weight_unit.toUpperCase())) {
      w = w / 1000.0;
    }
    return w > 0 ? w * q : q;
  });

  const totalShipmentWeight = productWeights.reduce((acc, w) => acc + w, 0) || 1.0;
  const tariffLines = MockStorage.getTariffLines();

  shipment.products = shipment.products.map((p, idx) => {
    const curr = (p.currency || 'INR').toUpperCase();
    const pPrice = Number(p.purchase_price) || 0.0;
    const qty = Number(p.quantity) || 1.0;
    const itemWeightTotal = productWeights[idx];

    let basePriceLkr = pPrice;
    if (curr === 'LKR') {
      basePriceLkr = pPrice;
    } else if (curr === 'INR') {
      basePriceLkr = lkrInrRate !== 0 ? pPrice / lkrInrRate : pPrice;
    } else if (curr === 'USD') {
      basePriceLkr = pPrice * usdRate;
    }

    let itemFreightLkr = 0;
    let itemPortLkr = 0;
    if (mode === 'WEIGHT' && totalShipmentWeight > 0) {
      const weightRatio = itemWeightTotal / totalShipmentWeight;
      itemFreightLkr = commonExpLkr * weightRatio;
      itemPortLkr = portExpLkr * weightRatio;
    } else {
      const qtyRatio = qty / totalQty;
      itemFreightLkr = commonExpLkr * qtyRatio;
      itemPortLkr = portExpLkr * qtyRatio;
    }

    const perUnitFreightLkr = qty > 0 ? itemFreightLkr / qty : 0.0;
    const perUnitPortLkr = qty > 0 ? itemPortLkr / qty : 0.0;

    // Match Tariff Line
    let tariffLine: TariffLine | undefined;
    if (p.hsn_code) {
      const rawHsn = p.hsn_code.trim();
      const cleanHsn = rawHsn.replace(/\./g, '');
      tariffLine = tariffLines.find(t => (t.hs_code && (t.hs_code === rawHsn || t.hs_code.replace(/\./g, '') === cleanHsn)));
      if (!tariffLine) {
        tariffLine = tariffLines.find(t => t.hs_code && (t.hs_code.startsWith(rawHsn) || t.hs_code.replace(/\./g, '').startsWith(cleanHsn)));
      }
    }

    let genDutyPct = 0;
    let vatPct = 0;
    let palPct = 0;
    let cessPct = 0;
    let ssclPct = 0;

    if (tariffLine) {
      p.general_duty_rate = tariffLine.general_duty_rate || p.general_duty_rate;
      p.vat_rate = tariffLine.vat_rate || p.vat_rate;
      p.pal_rate = tariffLine.pal_rate || p.pal_rate;
      p.cess_rate = tariffLine.cess_rate || p.cess_rate;
      p.sscl_rate = tariffLine.sscl_rate || p.sscl_rate;

      genDutyPct = parsePercentageRate(tariffLine.general_duty_rate);
      vatPct = parsePercentageRate(tariffLine.vat_rate);
      palPct = parsePercentageRate(tariffLine.pal_rate);
      cessPct = parsePercentageRate(tariffLine.cess_rate);
      ssclPct = parsePercentageRate(tariffLine.sscl_rate);
    } else {
      genDutyPct = parsePercentageRate(p.general_duty_rate);
      vatPct = parsePercentageRate(p.vat_rate);
      palPct = parsePercentageRate(p.pal_rate);
      cessPct = parsePercentageRate(p.cess_rate);
      ssclPct = parsePercentageRate(p.sscl_rate);
    }

    const isScl = p.item_classification === 'SCL' || (tariffLine && !!tariffLine.scl_rate) || (p.product_name && p.product_name.toLowerCase().includes('ghee'));
    if (isScl) {
      p.item_classification = 'SCL';
    }

    let calculatedDutyLkr = 0;
    const dutyPctTotal = genDutyPct + vatPct + palPct + cessPct + ssclPct;
    calculatedDutyLkr = basePriceLkr * (dutyPctTotal / 100.0);

    const cnfPriceLkr = basePriceLkr + perUnitFreightLkr;
    const totalCostLkr = cnfPriceLkr + calculatedDutyLkr + perUnitPortLkr;

    const marginMode = shipment.margin_mode || 'MARGIN_ON_REVENUE';
    let marginDecimal = targetMarginPct / 100.0;
    let suggestedPriceLkr = 0;

    if (marginMode === 'MARKUP_ON_COST') {
      suggestedPriceLkr = totalCostLkr * (1.0 + marginDecimal);
    } else {
      if (marginDecimal >= 1.0) marginDecimal = 0.99;
      suggestedPriceLkr = totalCostLkr / (1.0 - marginDecimal);
    }

    let finalPriceLkr = Number(p.final_quotation_price) || 0.0;
    if (finalPriceLkr <= 0.0) {
      finalPriceLkr = suggestedPriceLkr;
      p.final_quotation_price = Math.round(finalPriceLkr * 100) / 100;
    }

    const discountLkr = Number(p.discount_lkr) || 0.0;
    const setPriceLkr = finalPriceLkr - discountLkr;
    p.set_price_lkr = Math.round(setPriceLkr * 100) / 100;

    const shortQty = Number(p.short_qty) || 0.0;
    const shortAmtLkr = shortQty * setPriceLkr;
    p.short_amt_lkr = Math.round(shortAmtLkr * 100) / 100;

    const grossSellAmtLkr = setPriceLkr * qty;
    const netSettlementLkr = grossSellAmtLkr - shortAmtLkr;
    p.net_settlement_lkr = Math.round(netSettlementLkr * 100) / 100;

    const totalItemCostLkr = totalCostLkr * qty;
    const predictedProfitLkr = netSettlementLkr - totalItemCostLkr;

    const indianPriceInr = curr === 'INR' ? pPrice : basePriceLkr * lkrInrRate;
    const srilankanPriceLkr = finalPriceLkr;

    return {
      ...p,
      freight_allocation_lkr: Math.round(itemFreightLkr * 100) / 100,
      port_charges_lkr: Math.round(itemPortLkr * 100) / 100,
      base_price_lkr: Math.round(basePriceLkr * 100) / 100,
      cnf_price: Math.round(cnfPriceLkr * 100) / 100,
      calculated_duty_lkr: Math.round(calculatedDutyLkr * 100) / 100,
      total_cost_lkr: Math.round(totalCostLkr * 100) / 100,
      indian_price: Math.round(indianPriceInr * 100) / 100,
      srilankan_price: Math.round(srilankanPriceLkr * 100) / 100,
      suggested_price: Math.round(suggestedPriceLkr * 100) / 100,
      predicted_profit: Math.round(predictedProfitLkr * 100) / 100,
    };
  });

  return shipment;
}

// Generates downloadable CSV Data URI
function generateCsvDataUri(headers: string[], rows: (string | number)[][]): string {
  const csvContent = [
    headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(','),
    ...rows.map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
  ].join('\r\n');
  return 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
}

export const mockService = {
  // ── Sections & Chapters ──────────────────────────────────────────────────
  getSections: async (): Promise<Chapter[]> => {
    return MockStorage.getChapters();
  },

  // ── Tariff Lines ────────────────────────────────────────────────────────
  getTariffLines: async (params: {
    query?: string;
    chapter_id?: number;
    section_number?: string;
    is_verified?: boolean;
    duty_type?: string;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedTariffResponse> => {
    let lines = MockStorage.getTariffLines();

    if (params.query) {
      const q = params.query.toLowerCase().trim();
      lines = lines.filter(
        l => (l.hs_code && l.hs_code.toLowerCase().includes(q)) ||
             (l.description && l.description.toLowerCase().includes(q))
      );
    }
    if (params.chapter_id) {
      lines = lines.filter(l => l.chapter_id === Number(params.chapter_id));
    }
    if (params.section_number) {
      lines = lines.filter(l => l.section_number === params.section_number);
    }
    if (params.is_verified !== undefined) {
      lines = lines.filter(l => l.is_verified === params.is_verified);
    }

    const total = lines.length;
    const page = params.page || 1;
    const pageSize = params.page_size || 50;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const start = (page - 1) * pageSize;
    const items = lines.slice(start, start + pageSize);

    return {
      total,
      page,
      page_size: pageSize,
      total_pages: totalPages,
      items,
    };
  },

  updateTariffLine: async (lineId: number, data: Partial<TariffLine>): Promise<TariffLine> => {
    const lines = MockStorage.getTariffLines();
    const idx = lines.findIndex(l => l.id === lineId);
    if (idx === -1) throw new Error(`Tariff line ${lineId} not found`);
    lines[idx] = { ...lines[idx], ...data };
    MockStorage.setTariffLines(lines);
    return lines[idx];
  },

  verifyTariffLine: async (lineId: number): Promise<TariffLine> => {
    const lines = MockStorage.getTariffLines();
    const idx = lines.findIndex(l => l.id === lineId);
    if (idx === -1) throw new Error(`Tariff line ${lineId} not found`);
    lines[idx].is_verified = true;
    MockStorage.setTariffLines(lines);
    return lines[idx];
  },

  triggerBatchImport: async (): Promise<BatchImportSummary> => {
    const logs = MockStorage.getImportLogs();
    const newLog: ImportLog = {
      id: logs.length + 1,
      filename: 'Batch_Tariff_Schedule_Import.pdf',
      status: 'SUCCESS',
      rows_extracted: 120,
      errors: [],
      imported_at: new Date().toISOString(),
    };
    logs.unshift(newLog);
    MockStorage.setImportLogs(logs);

    return {
      total_files_processed: logs.length,
      successful_files: logs.filter(l => l.status === 'SUCCESS').length,
      failed_files: logs.filter(l => l.status === 'FAILED').length,
      total_rows_extracted: logs.reduce((acc, l) => acc + l.rows_extracted, 0),
      logs,
    };
  },

  uploadSinglePdf: async (file: File): Promise<ImportLog> => {
    const logs = MockStorage.getImportLogs();
    const newLog: ImportLog = {
      id: logs.length + 1,
      filename: file.name || 'Uploaded_Tariff_Chapter.pdf',
      status: 'SUCCESS',
      rows_extracted: 45,
      errors: [],
      imported_at: new Date().toISOString(),
    };
    logs.unshift(newLog);
    MockStorage.setImportLogs(logs);
    return newLog;
  },

  getImportLogs: async (): Promise<ImportLog[]> => {
    return MockStorage.getImportLogs();
  },

  resetDatabase: async (): Promise<{ status: string; message: string }> => {
    MockStorage.resetToDefaults();
    return { status: 'SUCCESS', message: 'Database reset to initial demonstration state successfully.' };
  },

  getExportCsvUrl: (chapterId?: number, query?: string): string => {
    let lines = MockStorage.getTariffLines();
    if (chapterId) lines = lines.filter(l => l.chapter_id === chapterId);
    if (query) {
      const q = query.toLowerCase();
      lines = lines.filter(l => (l.hs_code && l.hs_code.toLowerCase().includes(q)) || (l.description && l.description.toLowerCase().includes(q)));
    }
    const headers = ['HS Code', 'Description', 'Unit', 'Gen Duty', 'VAT', 'PAL', 'CESS', 'SSCL', 'SCL'];
    const rows = lines.map(l => [
      l.hs_code || '',
      l.description || '',
      l.unit || '',
      l.general_duty_rate || '',
      l.vat_rate || '',
      l.pal_rate || '',
      l.cess_rate || '',
      l.sscl_rate || '',
      l.scl_rate || ''
    ]);
    return generateCsvDataUri(headers, rows);
  },

  getExportExcelUrl: (chapterId?: number, query?: string): string => {
    return mockService.getExportCsvUrl(chapterId, query);
  },

  // ── Item Entry & Unified Search ──────────────────────────────────────────
  searchAllProducts: async (q: string, limit = 15): Promise<UnifiedProductSearchResult[]> => {
    const query = (q || '').toLowerCase().trim();
    const items = MockStorage.getItemEntries();
    const tariffLines = MockStorage.getTariffLines();

    const results: UnifiedProductSearchResult[] = [];

    // Search Favorites / Master catalog first
    items.forEach(item => {
      if (!query || item.item_name.toLowerCase().includes(query) || (item.hs_code && item.hs_code.toLowerCase().includes(query))) {
        results.push({
          source: 'FAVORITE',
          id: item.id,
          tariff_line_id: item.tariff_line_id,
          item_name: item.item_name,
          item_category: item.item_category || 'General',
          product_category: item.item_category || 'General',
          hs_code: item.hs_code,
          description: item.tariff_description || item.item_name,
          unit: item.unit || 'KG',
          currency: item.currency || 'INR',
          purchase_price: Number(item.purchase_price) || 0,
          weight_val: item.weight_val,
          weight_unit: item.weight_unit || 'KG',
          general_duty_rate: item.general_duty_rate,
          vat_rate: item.vat_rate,
          pal_rate: item.pal_rate,
          cess_rate: item.cess_rate,
          sscl_rate: item.sscl_rate,
          excise_rate: item.excise_rate,
          scl_rate: item.scl_rate,
        });
      }
    });

    // Also match Tariff Schedule Lines
    if (query) {
      tariffLines.forEach(t => {
        if ((t.hs_code && t.hs_code.toLowerCase().includes(query)) || (t.description && t.description.toLowerCase().includes(query))) {
          if (!results.some(r => r.hs_code === t.hs_code)) {
            results.push({
              source: 'TARIFF',
              tariff_line_id: t.id,
              item_name: t.description,
              item_category: `Chapter ${t.chapter_number || ''}`,
              product_category: `Chapter ${t.chapter_number || ''}`,
              hs_code: t.hs_code,
              description: t.description,
              unit: t.unit || 'KG',
              currency: 'INR',
              general_duty_rate: t.general_duty_rate,
              vat_rate: t.vat_rate,
              pal_rate: t.pal_rate,
              cess_rate: t.cess_rate,
              sscl_rate: t.sscl_rate,
              excise_rate: t.excise_rate,
              scl_rate: t.scl_rate,
            });
          }
        }
      });
    }

    return results.slice(0, limit);
  },

  searchTariffByName: async (q: string, limit = 10): Promise<TariffSearchResult[]> => {
    const query = (q || '').toLowerCase().trim();
    const tariffLines = MockStorage.getTariffLines();
    const matched = tariffLines.filter(t =>
      !query ||
      (t.hs_code && t.hs_code.toLowerCase().includes(query)) ||
      (t.description && t.description.toLowerCase().includes(query))
    );

    return matched.slice(0, limit).map(t => ({
      tariff_line_id: t.id,
      hs_code: t.hs_code,
      description: t.description,
      unit: t.unit,
      chapter_number: t.chapter_number,
      general_duty_rate: t.general_duty_rate,
      vat_rate: t.vat_rate,
      pal_rate: t.pal_rate,
      cess_rate: t.cess_rate,
      sscl_rate: t.sscl_rate,
      excise_rate: t.excise_rate,
    }));
  },

  upsertFavoriteItem: async (data: Partial<ItemEntry>): Promise<ItemEntry> => {
    const items = MockStorage.getItemEntries();
    let item: ItemEntry;
    if (data.id) {
      const idx = items.findIndex(i => i.id === data.id);
      if (idx !== -1) {
        items[idx] = { ...items[idx], ...data, updated_at: new Date().toISOString() };
        item = items[idx];
      } else {
        item = {
          id: data.id,
          item_name: data.item_name || 'New Item',
          currency: data.currency || 'INR',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...data,
        };
        items.push(item);
      }
    } else {
      const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
      item = {
        id: newId,
        item_name: data.item_name || 'New Item',
        currency: data.currency || 'INR',
        is_favorite: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...data,
      };
      items.push(item);
    }
    MockStorage.setItemEntries(items);
    return item;
  },

  bulkUploadFavoriteProducts: async (_file: File) => {
    return { status: 'SUCCESS', inserted: 12, updated: 4, total_processed: 16, errors: [] };
  },

  createItemEntry: async (data: Partial<ItemEntry>): Promise<ItemEntry> => {
    return mockService.upsertFavoriteItem(data);
  },

  getItemEntries: async (params?: { query?: string; page?: number; page_size?: number }): Promise<PaginatedItemEntryResponse> => {
    let items = MockStorage.getItemEntries();
    if (params?.query) {
      const q = params.query.toLowerCase().trim();
      items = items.filter(i => i.item_name.toLowerCase().includes(q) || (i.hs_code && i.hs_code.toLowerCase().includes(q)));
    }
    const total = items.length;
    const page = params?.page || 1;
    const pageSize = params?.page_size || 50;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const start = (page - 1) * pageSize;

    return {
      total,
      page,
      page_size: pageSize,
      total_pages: totalPages,
      items: items.slice(start, start + pageSize),
    };
  },

  updateItemEntry: async (id: number, data: Partial<ItemEntry>): Promise<ItemEntry> => {
    const items = MockStorage.getItemEntries();
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) throw new Error(`Item ${id} not found`);
    items[idx] = { ...items[idx], ...data, updated_at: new Date().toISOString() };
    MockStorage.setItemEntries(items);
    return items[idx];
  },

  deleteItemEntry: async (id: number): Promise<void> => {
    let items = MockStorage.getItemEntries();
    items = items.filter(i => i.id !== id);
    MockStorage.setItemEntries(items);
  },

  // ── Customer Master ──────────────────────────────────────────────────────
  getCustomers: async (): Promise<Customer[]> => {
    return MockStorage.getCustomers();
  },

  createCustomer: async (data: Partial<Customer>): Promise<Customer> => {
    const customers = MockStorage.getCustomers();
    const newId = customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1;
    const newCustomer: Customer = {
      id: newId,
      name: data.name || 'New Customer',
      code: data.code || `CUST${newId}`,
      email: data.email,
      phone: data.phone,
      address: data.address,
      country: data.country || 'Sri Lanka',
      tax_id: data.tax_id,
      created_at: new Date().toISOString(),
    };
    customers.push(newCustomer);
    MockStorage.setCustomers(customers);
    return newCustomer;
  },

  updateCustomer: async (id: number, data: Partial<Customer>): Promise<Customer> => {
    const customers = MockStorage.getCustomers();
    const idx = customers.findIndex(c => c.id === id);
    if (idx === -1) throw new Error(`Customer ${id} not found`);
    customers[idx] = { ...customers[idx], ...data };
    MockStorage.setCustomers(customers);
    return customers[idx];
  },

  deleteCustomer: async (id: number): Promise<void> => {
    let customers = MockStorage.getCustomers();
    customers = customers.filter(c => c.id !== id);
    MockStorage.setCustomers(customers);
  },

  // ── Shipment Master & Configuration ─────────────────────────────────────
  getNextShipmentNumber: async (fy?: string): Promise<{ financial_year: string; next_sequence: number; shipment_no: string }> => {
    const shipments = MockStorage.getShipments();
    const currentFy = fy || '2026-27';
    const existingForFy = shipments.filter(s => s.financial_year === currentFy);
    const maxSeq = existingForFy.length > 0 ? Math.max(...existingForFy.map(s => s.sequence_number || 1000)) : 1000;
    const nextSeq = maxSeq + 1;
    return {
      financial_year: currentFy,
      next_sequence: nextSeq,
      shipment_no: `AEC/${nextSeq}/${currentFy}`,
    };
  },

  getShipments: async (): Promise<Shipment[]> => {
    return MockStorage.getShipments();
  },

  createShipment: async (data: any): Promise<Shipment> => {
    const shipments = MockStorage.getShipments();
    const nextInfo = await mockService.getNextShipmentNumber(data.financial_year);
    const newId = shipments.length > 0 ? Math.max(...shipments.map(s => s.id)) + 1 : 1;

    const allCustomers = MockStorage.getCustomers();
    const selectedCustomers: Customer[] = (data.customer_ids || [])
      .map((cid: number) => allCustomers.find(c => c.id === cid))
      .filter(Boolean);

    const newShipment: Shipment = {
      id: newId,
      shipment_no: data.shipment_no || nextInfo.shipment_no,
      sequence_number: nextInfo.next_sequence,
      financial_year: nextInfo.financial_year,
      shipment_date: data.shipment_date || new Date().toISOString().split('T')[0],
      status: 'DRAFT',
      current_stage: '1_CUSTOMER_REQUIREMENTS',
      destination: data.destination || 'Colombo Port, Sri Lanka',
      currency: data.currency || 'LKR',
      usd_rate: data.usd_rate || 305.0,
      lkr_inr_rate: data.lkr_inr_rate || 3.65,
      profit_margin_pct: data.profit_margin_pct || 15.0,
      indian_invoice_margin_pct: data.indian_invoice_margin_pct || 5.0,
      colombo_invoice_margin_pct: data.colombo_invoice_margin_pct || 12.0,
      margin_mode: data.margin_mode || 'MARGIN_ON_REVENUE',
      common_expenses_inr: data.common_expenses_inr || 0,
      common_expenses_lkr: data.common_expenses_lkr || 0,
      port_expenses_lkr: data.port_expenses_lkr || 0,
      freight_allocation_mode: data.freight_allocation_mode || 'WEIGHT',
      notes: data.notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      customers: selectedCustomers,
      products: [],
      requirements: [],
      allocations: [],
      proforma_items: [],
    };

    shipments.unshift(newShipment);
    MockStorage.setShipments(shipments);
    return newShipment;
  },

  getShipmentDetails: async (id: number): Promise<Shipment> => {
    const shipments = MockStorage.getShipments();
    const shipment = shipments.find(s => s.id === Number(id));
    if (!shipment) throw new Error(`Shipment ${id} not found`);
    return recalculateShipmentData(shipment);
  },

  updateShipmentConfig: async (id: number, data: any): Promise<Shipment> => {
    const shipments = MockStorage.getShipments();
    const idx = shipments.findIndex(s => s.id === Number(id));
    if (idx === -1) throw new Error(`Shipment ${id} not found`);

    if (data.customer_ids) {
      const allCustomers = MockStorage.getCustomers();
      data.customers = data.customer_ids.map((cid: number) => allCustomers.find(c => c.id === cid)).filter(Boolean);
    }

    shipments[idx] = recalculateShipmentData({
      ...shipments[idx],
      ...data,
      updated_at: new Date().toISOString(),
    });

    MockStorage.setShipments(shipments);
    return shipments[idx];
  },

  // ── Products ─────────────────────────────────────────────────────────────
  addProduct: async (shipmentId: number, data: any): Promise<Shipment> => {
    const shipments = MockStorage.getShipments();
    const idx = shipments.findIndex(s => s.id === Number(shipmentId));
    if (idx === -1) throw new Error(`Shipment ${shipmentId} not found`);

    const existingProducts = shipments[idx].products || [];
    const newProdId = existingProducts.length > 0 ? Math.max(...existingProducts.map(p => p.id)) + 1 : 1;

    const allCustomers = MockStorage.getCustomers();
    const cust = allCustomers.find(c => c.id === Number(data.customer_id));

    const newProd: ShipmentProduct = {
      id: newProdId,
      shipment_id: Number(shipmentId),
      customer_id: Number(data.customer_id),
      customer_name: cust?.name || 'Customer',
      product_name: data.product_name || 'Item',
      product_category: data.product_category,
      hsn_code: data.hsn_code,
      quantity: Number(data.quantity) || 1,
      unit: data.unit || 'KG',
      weight_val: data.weight_val || 1,
      weight_unit: data.weight_unit || 'KG',
      purchase_price: Number(data.purchase_price) || 0,
      currency: data.currency || 'INR',
      general_duty_rate: data.general_duty_rate,
      vat_rate: data.vat_rate,
      pal_rate: data.pal_rate,
      cess_rate: data.cess_rate,
      sscl_rate: data.sscl_rate,
      is_active: true,
      ...data,
    };

    existingProducts.push(newProd);
    shipments[idx].products = existingProducts;
    shipments[idx] = recalculateShipmentData(shipments[idx]);
    MockStorage.setShipments(shipments);
    return shipments[idx];
  },

  updateProduct: async (shipmentId: number, productId: number, data: any): Promise<Shipment> => {
    const shipments = MockStorage.getShipments();
    const sIdx = shipments.findIndex(s => s.id === Number(shipmentId));
    if (sIdx === -1) throw new Error(`Shipment ${shipmentId} not found`);

    const pIdx = shipments[sIdx].products.findIndex(p => p.id === Number(productId));
    if (pIdx === -1) throw new Error(`Product ${productId} not found`);

    shipments[sIdx].products[pIdx] = {
      ...shipments[sIdx].products[pIdx],
      ...data,
    };

    shipments[sIdx] = recalculateShipmentData(shipments[sIdx]);
    MockStorage.setShipments(shipments);
    return shipments[sIdx];
  },

  deleteProduct: async (shipmentId: number, productId: number): Promise<Shipment> => {
    const shipments = MockStorage.getShipments();
    const sIdx = shipments.findIndex(s => s.id === Number(shipmentId));
    if (sIdx === -1) throw new Error(`Shipment ${shipmentId} not found`);

    shipments[sIdx].products = shipments[sIdx].products.filter(p => p.id !== Number(productId));
    shipments[sIdx] = recalculateShipmentData(shipments[sIdx]);
    MockStorage.setShipments(shipments);
    return shipments[sIdx];
  },

  uploadExcelProducts: async (shipmentId: number, _file: File): Promise<Shipment> => {
    const shipment = await mockService.getShipmentDetails(shipmentId);
    return shipment;
  },

  // ── Predicted vs Actual & OCR ────────────────────────────────────────────
  updateActuals: async (shipmentId: number, data: any): Promise<ShipmentActual> => {
    const shipments = MockStorage.getShipments();
    const sIdx = shipments.findIndex(s => s.id === Number(shipmentId));
    if (sIdx === -1) throw new Error(`Shipment ${shipmentId} not found`);

    const actual: ShipmentActual = {
      id: shipments[sIdx].actuals?.id || 1,
      shipment_id: Number(shipmentId),
      actual_duty_inr: Number(data.actual_duty_inr) || 0,
      actual_duty_lkr: Number(data.actual_duty_lkr) || 0,
      actual_cost_inr: Number(data.actual_cost_inr) || 0,
      actual_cost_lkr: Number(data.actual_cost_lkr) || 0,
      actual_revenue_inr: Number(data.actual_revenue_inr) || 0,
      actual_revenue_lkr: Number(data.actual_revenue_lkr) || 0,
      actual_profit_lkr: (Number(data.actual_revenue_lkr) || 0) - (Number(data.actual_cost_lkr) || 0),
      ocr_source_file: data.ocr_source_file,
      notes: data.notes,
      updated_at: new Date().toISOString(),
    };

    shipments[sIdx].actuals = actual;
    MockStorage.setShipments(shipments);
    return actual;
  },

  ocrDutyInvoice: async (shipmentId: number, file: File): Promise<any> => {
    return {
      status: 'SUCCESS',
      filename: file.name,
      extracted_actuals: {
        actual_duty_inr: 215000,
        actual_duty_lkr: 784750,
        actual_cost_lkr: 2540000,
        actual_revenue_lkr: 3100000,
        notes: `Extracted from ${file.name} via simulated OCR engine.`,
      },
    };
  },

  ingestExcelWorkbook: async (file: File): Promise<any> => {
    return {
      status: 'SUCCESS',
      message: `Parsed workbook ${file.name} successfully. Found 3 customer sheets and 142 items.`,
      sheet_names: ['A3EXPRESS', 'DUTY_2025', 'LRD_CMB', 'CSA_CMB'],
    };
  },

  // ── Document Export URLs ──────────────────────────────────────────────────
  getQuotationUrl: (shipmentId: number, customerId: number): string => {
    const shipments = MockStorage.getShipments();
    const shipment = shipments.find(s => s.id === Number(shipmentId));
    const customer = MockStorage.getCustomers().find(c => c.id === Number(customerId));
    const products = (shipment?.products || []).filter(p => p.customer_id === Number(customerId));

    const headers = ['Item No', 'Product Name', 'HSN Code', 'Quantity', 'Unit', 'Final Quotation Price (LKR)', 'Discount (LKR)', 'Set Price (LKR)', 'Total (LKR)'];
    const rows = products.map((p, i) => [
      i + 1,
      p.product_name,
      p.hsn_code || '',
      p.quantity,
      p.unit || 'KG',
      p.final_quotation_price || 0,
      p.discount_lkr || 0,
      p.set_price_lkr || 0,
      (Number(p.quantity) || 0) * (Number(p.set_price_lkr) || 0)
    ]);
    return generateCsvDataUri(headers, rows);
  },

  getIndianInvoiceUrl: (shipmentId: number): string => {
    const shipments = MockStorage.getShipments();
    const shipment = shipments.find(s => s.id === Number(shipmentId));
    const headers = ['Item No', 'Description of Goods', 'HSN Code', 'Qty', 'Unit', 'Rate (INR)', 'Amount (INR)'];
    const rows = (shipment?.products || []).map((p, i) => [
      i + 1,
      p.product_name,
      p.hsn_code || '',
      p.quantity,
      p.unit || 'KG',
      p.indian_price || p.purchase_price || 0,
      (Number(p.quantity) || 0) * (Number(p.indian_price || p.purchase_price) || 0)
    ]);
    return generateCsvDataUri(headers, rows);
  },

  getColomboInvoiceUrl: (shipmentId: number): string => {
    const shipments = MockStorage.getShipments();
    const shipment = shipments.find(s => s.id === Number(shipmentId));
    const headers = ['Item No', 'Product Name', 'HSN Code', 'Qty', 'Unit', 'Unit Price (LKR)', 'Total (LKR)'];
    const rows = (shipment?.products || []).map((p, i) => [
      i + 1,
      p.product_name,
      p.hsn_code || '',
      p.quantity,
      p.unit || 'KG',
      p.srilankan_price || p.final_quotation_price || 0,
      (Number(p.quantity) || 0) * (Number(p.srilankan_price || p.final_quotation_price) || 0)
    ]);
    return generateCsvDataUri(headers, rows);
  },

  getPackingListUrl: (shipmentId: number): string => {
    const shipments = MockStorage.getShipments();
    const shipment = shipments.find(s => s.id === Number(shipmentId));
    const headers = ['Pkg No', 'Description of Goods', 'HSN Code', 'Packages / Cartons', 'Net Wt (KG)', 'Gross Wt (KG)'];
    const rows = (shipment?.products || []).map((p, i) => [
      `PKG-${String(i + 1).padStart(3, '0')}`,
      p.product_name,
      p.hsn_code || '',
      p.quantity,
      p.net_weight_kg || (Number(p.weight_val || 1) * Number(p.quantity)),
      p.gross_weight_kg || (Number(p.weight_val || 1) * Number(p.quantity) * 1.03)
    ]);
    return generateCsvDataUri(headers, rows);
  },

  getDutyReportUrl: (shipmentId: number): string => {
    const shipments = MockStorage.getShipments();
    const shipment = shipments.find(s => s.id === Number(shipmentId));
    const headers = ['HSN Code', 'Product Name', 'Base Price (LKR)', 'Gen Duty %', 'VAT %', 'PAL %', 'CESS %', 'Calculated Duty (LKR)', 'Total Cost (LKR)'];
    const rows = (shipment?.products || []).map(p => [
      p.hsn_code || '',
      p.product_name,
      p.base_price_lkr || 0,
      p.general_duty_rate || '0%',
      p.vat_rate || '0%',
      p.pal_rate || '0%',
      p.cess_rate || '0%',
      p.calculated_duty_lkr || 0,
      p.total_cost_lkr || 0
    ]);
    return generateCsvDataUri(headers, rows);
  },

  getCmbBankExcelUrl: (shipmentId: number): string => {
    return mockService.getColomboInvoiceUrl(shipmentId);
  },

  getIndianExcelUrl: (shipmentId: number): string => {
    return mockService.getIndianInvoiceUrl(shipmentId);
  },

  getFullWorkbookExcelUrl: (shipmentId: number): string => {
    return mockService.getColomboInvoiceUrl(shipmentId);
  },

  getCooExcelUrl: (shipmentId: number): string => {
    return mockService.getIndianInvoiceUrl(shipmentId);
  },

  getCooPdfUrl: (shipmentId: number): string => {
    return mockService.getIndianInvoiceUrl(shipmentId);
  },

  // ── Soft Remove Product with Audit Trail ─────────────────────────────────
  softRemoveProduct: async (shipmentId: number, productId: number, reason: string): Promise<Shipment> => {
    return mockService.bulkSoftRemoveProducts(shipmentId, [productId], reason);
  },

  bulkSoftRemoveProducts: async (shipmentId: number, productIds: number[], reason?: string, _removedBy?: string): Promise<Shipment> => {
    const shipments = MockStorage.getShipments();
    const sIdx = shipments.findIndex(s => s.id === Number(shipmentId));
    if (sIdx === -1) throw new Error(`Shipment ${shipmentId} not found`);

    shipments[sIdx].products = shipments[sIdx].products.map(p => {
      if (productIds.includes(p.id)) {
        return { ...p, is_active: false, notes: reason || 'Soft removed' };
      }
      return p;
    });

    shipments[sIdx] = recalculateShipmentData(shipments[sIdx]);
    MockStorage.setShipments(shipments);
    return shipments[sIdx];
  },

  getShipmentRemovalHistory: async (_shipmentId: number): Promise<any[]> => {
    return [];
  },

  // ── Customer Approval & PO ───────────────────────────────────────────────
  approveQuotationAndCreatePo: async (shipmentId: number, _approvedBy?: string, _notes?: string): Promise<Shipment> => {
    const shipments = MockStorage.getShipments();
    const sIdx = shipments.findIndex(s => s.id === Number(shipmentId));
    if (sIdx === -1) throw new Error(`Shipment ${shipmentId} not found`);
    shipments[sIdx].current_stage = '4_PRICING_CALCULATION';
    shipments[sIdx].status = 'CONFIGURED';
    MockStorage.setShipments(shipments);
    return shipments[sIdx];
  },

  // ── Vendor Payments ──────────────────────────────────────────────────────
  recordVendorPayment: async (shipmentId: number, payload: any): Promise<any> => {
    const payments = MockStorage.getVendorPayments();
    const newPayment = {
      id: payments.length + 1,
      shipment_id: Number(shipmentId),
      vendor_id: Number(payload.vendor_id),
      amount_paid: Number(payload.amount_paid) || 0,
      currency: payload.currency || 'INR',
      payment_date: payload.payment_date || new Date().toISOString().split('T')[0],
      payment_mode: payload.payment_mode || 'BANK_TRANSFER',
      reference_number: payload.reference_number || `TXN${Date.now()}`,
      notes: payload.notes,
      created_at: new Date().toISOString(),
    };
    payments.push(newPayment);
    MockStorage.setVendorPayments(payments);
    return newPayment;
  },

  getVendorPayments: async (shipmentId: number): Promise<any[]> => {
    return MockStorage.getVendorPayments().filter(p => p.shipment_id === Number(shipmentId));
  },

  getVendorPaymentSummary: async (shipmentId: number): Promise<any[]> => {
    const payments = MockStorage.getVendorPayments().filter(p => p.shipment_id === Number(shipmentId));
    const vendors = MockStorage.getVendors();
    return vendors.map(v => {
      const vPayments = payments.filter(p => p.vendor_id === v.id);
      const totalPaid = vPayments.reduce((acc, p) => acc + Number(p.amount_paid), 0);
      return {
        vendor_id: v.id,
        vendor_name: v.name,
        total_invoiced_inr: 500000,
        total_paid_inr: totalPaid,
        pending_inr: Math.max(0, 500000 - totalPaid),
      };
    });
  },

  // ── Proforma vs Actual Comparison ────────────────────────────────────────
  compareProformaActualInvoice: async (shipmentId: number, vendorId: number, actualItems: any[]): Promise<any> => {
    return {
      shipment_id: shipmentId,
      vendor_id: vendorId,
      status: 'VERIFIED',
      discrepancy_count: 0,
      items: actualItems,
    };
  },

  getProformaActualComparison: async (_shipmentId: number, _vendorId?: number): Promise<any[]> => {
    return [];
  },

  // ── Physical Receiving Verification ──────────────────────────────────────
  recordReceivingVerification: async (shipmentId: number, payload: any): Promise<any> => {
    const list = MockStorage.getReceivingVerifications();
    const newRecord = {
      id: list.length + 1,
      shipment_id: Number(shipmentId),
      product_name: payload.product_name,
      verified_qty: Number(payload.verified_qty) || 0,
      damage_qty: Number(payload.damage_qty) || 0,
      verified_at: new Date().toISOString(),
      verified_by: payload.verified_by || 'Warehouse Manager',
      notes: payload.notes,
    };
    list.push(newRecord);
    MockStorage.setReceivingVerifications(list);
    return newRecord;
  },

  // ── Packing List Generation ──────────────────────────────────────────────
  getNextPackingListNumber: async (_shipmentId: number, _vendorId?: number): Promise<any> => {
    return { packing_list_no: `PL-${Date.now().toString().slice(-6)}` };
  },

  generatePackingListFromReceiving: async (shipmentId: number, vendorId?: number, notes?: string): Promise<any> => {
    const lists = MockStorage.getPackingLists();
    const newPl = {
      id: lists.length + 1,
      shipment_id: Number(shipmentId),
      vendor_id: vendorId,
      packing_list_no: `PL-AEC-${shipmentId}-${lists.length + 1}`,
      generated_at: new Date().toISOString(),
      notes,
    };
    lists.push(newPl);
    MockStorage.setPackingLists(lists);
    return newPl;
  },

  getShipmentPackingLists: async (shipmentId: number): Promise<any[]> => {
    return MockStorage.getPackingLists().filter(p => p.shipment_id === Number(shipmentId));
  },

  // ── Dashboard Summary ────────────────────────────────────────────────────
  getDashboardSummary: async (): Promise<DashboardSummary> => {
    const shipments = MockStorage.getShipments();
    const customers = MockStorage.getCustomers();

    let totalSalesLkr = 0;
    let totalDutyLkr = 0;
    let totalCostLkr = 0;
    let totalProfitLkr = 0;

    const customerSummaries = customers.map(c => {
      let custSales = 0;
      let custCost = 0;
      let custProfit = 0;
      let custShipments = 0;

      shipments.forEach(s => {
        const matchingProds = (s.products || []).filter(p => p.customer_id === c.id);
        if (matchingProds.length > 0) {
          custShipments++;
          matchingProds.forEach(p => {
            const sale = Number(p.net_settlement_lkr) || 0;
            const cost = (Number(p.total_cost_lkr) || 0) * (Number(p.quantity) || 1);
            const profit = Number(p.predicted_profit) || (sale - cost);
            const duty = (Number(p.calculated_duty_lkr) || 0) * (Number(p.quantity) || 1);

            custSales += sale;
            custCost += cost;
            custProfit += profit;
            totalDutyLkr += duty;
          });
        }
      });

      totalSalesLkr += custSales;
      totalCostLkr += custCost;
      totalProfitLkr += custProfit;

      return {
        customer_id: c.id,
        customer_name: c.name,
        customer_code: c.code,
        total_shipments: custShipments,
        total_sales_lkr: custSales,
        total_cost_lkr: custCost,
        total_profit_lkr: custProfit,
        pending_amount_lkr: Math.round(custSales * 0.2),
      };
    });

    return {
      total_shipments: shipments.length,
      total_sales_lkr: totalSalesLkr || 3184240,
      total_duty_lkr: totalDutyLkr || 832200,
      total_cost_lkr: totalCostLkr || 2628000,
      total_profit_lkr: totalProfitLkr || 556240,
      total_loss_lkr: 0,
      customer_summaries: customerSummaries,
      year_wise_summary: {
        '2026-27': {
          total_shipments: shipments.length,
          total_sales: totalSalesLkr || 3184240,
          total_profit: totalProfitLkr || 556240,
        },
      },
    };
  },

  // ── Vendors ──────────────────────────────────────────────────────────────
  getVendors: async (q?: string): Promise<Vendor[]> => {
    let vendors = MockStorage.getVendors();
    if (q) {
      const query = q.toLowerCase().trim();
      vendors = vendors.filter(v =>
        v.name.toLowerCase().includes(query) ||
        (v.code && v.code.toLowerCase().includes(query)) ||
        (v.main_category && v.main_category.toLowerCase().includes(query))
      );
    }
    return vendors;
  },

  getMatchingVendorsForProduct: async (productName: string): Promise<VendorProductMatchResponse> => {
    const vendors = MockStorage.getVendors();
    const pName = (productName || '').toLowerCase();
    const matching = vendors.filter(v =>
      (v.products_supplied && v.products_supplied.some(p => p.toLowerCase().includes(pName))) ||
      (v.sub_categories && v.sub_categories.some(c => pName.includes(c.toLowerCase()))) ||
      (v.main_category && pName.includes(v.main_category.toLowerCase()))
    );

    return {
      product_name: productName,
      last_allocated_vendor: matching[0] || vendors[0],
      matching_vendors: matching.length > 0 ? matching : vendors,
      all_vendors: vendors,
    };
  },

  getAllProductsCatalog: async (q?: string): Promise<string[]> => {
    const items = MockStorage.getItemEntries();
    const query = (q || '').toLowerCase();
    return items
      .map(i => i.item_name)
      .filter(name => !query || name.toLowerCase().includes(query));
  },

  createVendor: async (data: Partial<Vendor>): Promise<Vendor> => {
    const vendors = MockStorage.getVendors();
    const newId = vendors.length > 0 ? Math.max(...vendors.map(v => v.id)) + 1 : 1;
    const newVendor: Vendor = {
      id: newId,
      name: data.name || 'New Vendor',
      code: data.code || `VEN${newId}`,
      legal_name: data.legal_name,
      trade_name: data.trade_name,
      company_type: data.company_type,
      contact_person: data.contact_person,
      email: data.email,
      phone: data.phone,
      address: data.address,
      country: data.country || 'India',
      gstin: data.gstin,
      pan_number: data.pan_number,
      bank_name: data.bank_name,
      bank_account_number: data.bank_account_number,
      bank_ifsc_code: data.bank_ifsc_code,
      bank_branch: data.bank_branch,
      main_category: data.main_category || 'General Cargo',
      sub_categories: data.sub_categories || [],
      products_supplied: data.products_supplied || [],
      status: data.status || 'Active Supplier',
      created_at: new Date().toISOString(),
      mappings: [],
    };
    vendors.push(newVendor);
    MockStorage.setVendors(vendors);
    return newVendor;
  },

  updateVendor: async (vendorId: number, data: Partial<Vendor>): Promise<Vendor> => {
    const vendors = MockStorage.getVendors();
    const idx = vendors.findIndex(v => v.id === Number(vendorId));
    if (idx === -1) throw new Error(`Vendor ${vendorId} not found`);
    vendors[idx] = { ...vendors[idx], ...data };
    MockStorage.setVendors(vendors);
    return vendors[idx];
  },

  deleteVendor: async (vendorId: number): Promise<{ message: string }> => {
    let vendors = MockStorage.getVendors();
    vendors = vendors.filter(v => v.id !== Number(vendorId));
    MockStorage.setVendors(vendors);
    return { message: `Vendor ${vendorId} deleted successfully.` };
  },

  addVendorMapping: async (vendorId: number, productCategory: string, notes?: string): Promise<any> => {
    const vendors = MockStorage.getVendors();
    const v = vendors.find(item => item.id === Number(vendorId));
    if (!v) throw new Error(`Vendor ${vendorId} not found`);
    const newMapping = {
      id: Date.now(),
      vendor_id: Number(vendorId),
      product_category: productCategory,
      notes,
      created_at: new Date().toISOString(),
    };
    v.mappings = v.mappings || [];
    v.mappings.push(newMapping);
    MockStorage.setVendors(vendors);
    return newMapping;
  },

  // ── Customer Requirements ──────────────────────────────────────────────────
  getCustomerRequirements: async (shipmentId: number): Promise<ShipmentCustomerRequirement[]> => {
    const shipments = MockStorage.getShipments();
    const s = shipments.find(item => item.id === Number(shipmentId));
    return s?.requirements || [];
  },

  addCustomerRequirement: async (shipmentId: number, data: { customer_id: number; product_name: string; hsn_code?: string; required_quantity: number; unit: string; notes?: string }): Promise<ShipmentCustomerRequirement> => {
    const shipments = MockStorage.getShipments();
    const sIdx = shipments.findIndex(item => item.id === Number(shipmentId));
    if (sIdx === -1) throw new Error(`Shipment ${shipmentId} not found`);

    const cust = MockStorage.getCustomers().find(c => c.id === Number(data.customer_id));
    const reqs = shipments[sIdx].requirements || [];
    const newId = reqs.length > 0 ? Math.max(...reqs.map(r => r.id)) + 1 : 1;

    const newReq: ShipmentCustomerRequirement = {
      id: newId,
      shipment_id: Number(shipmentId),
      customer_id: Number(data.customer_id),
      product_name: data.product_name,
      hsn_code: data.hsn_code,
      required_quantity: Number(data.required_quantity) || 1,
      unit: data.unit || 'CTNS',
      notes: data.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      customer: cust,
    };

    reqs.push(newReq);
    shipments[sIdx].requirements = reqs;
    MockStorage.setShipments(shipments);
    return newReq;
  },

  updateCustomerRequirement: async (shipmentId: number, reqId: number, data: any): Promise<ShipmentCustomerRequirement> => {
    const shipments = MockStorage.getShipments();
    const sIdx = shipments.findIndex(item => item.id === Number(shipmentId));
    if (sIdx === -1) throw new Error(`Shipment ${shipmentId} not found`);

    const reqs = shipments[sIdx].requirements || [];
    const rIdx = reqs.findIndex(r => r.id === Number(reqId));
    if (rIdx === -1) throw new Error(`Requirement ${reqId} not found`);

    reqs[rIdx] = {
      ...reqs[rIdx],
      ...data,
      updated_at: new Date().toISOString(),
    };

    shipments[sIdx].requirements = reqs;
    MockStorage.setShipments(shipments);
    return reqs[rIdx];
  },

  updateRequirement: async (shipmentId: number, reqId: number, data: Partial<ShipmentCustomerRequirement>): Promise<ShipmentCustomerRequirement> => {
    return mockService.updateCustomerRequirement(shipmentId, reqId, data);
  },

  deleteCustomerRequirement: async (shipmentId: number, reqId: number): Promise<{ message: string }> => {
    const shipments = MockStorage.getShipments();
    const sIdx = shipments.findIndex(item => item.id === Number(shipmentId));
    if (sIdx === -1) throw new Error(`Shipment ${shipmentId} not found`);

    shipments[sIdx].requirements = (shipments[sIdx].requirements || []).filter(r => r.id !== Number(reqId));
    MockStorage.setShipments(shipments);
    return { message: `Requirement ${reqId} deleted.` };
  },

  deleteRequirement: async (shipmentId: number, reqId: number): Promise<void> => {
    await mockService.deleteCustomerRequirement(shipmentId, reqId);
  },

  bulkDeleteRequirements: async (shipmentId: number, reqIds: number[]): Promise<void> => {
    const shipments = MockStorage.getShipments();
    const sIdx = shipments.findIndex(item => item.id === Number(shipmentId));
    if (sIdx === -1) throw new Error(`Shipment ${shipmentId} not found`);

    shipments[sIdx].requirements = (shipments[sIdx].requirements || []).filter(r => !reqIds.includes(r.id));
    MockStorage.setShipments(shipments);
  },

  clearAllRequirements: async (shipmentId: number): Promise<void> => {
    const shipments = MockStorage.getShipments();
    const sIdx = shipments.findIndex(item => item.id === Number(shipmentId));
    if (sIdx === -1) throw new Error(`Shipment ${shipmentId} not found`);

    shipments[sIdx].requirements = [];
    MockStorage.setShipments(shipments);
  },

  uploadExcelRequirements: async (shipmentId: number, _file: File): Promise<ShipmentCustomerRequirement[]> => {
    return mockService.getCustomerRequirements(shipmentId);
  },

  getRequirementsExportExcelUrl: (shipmentId: number): string => {
    const shipments = MockStorage.getShipments();
    const s = shipments.find(item => item.id === Number(shipmentId));
    const reqs = s?.requirements || [];
    const headers = ['Requirement ID', 'Customer Name', 'Product Name', 'HSN Code', 'Required Qty', 'Unit', 'Notes'];
    const rows = reqs.map(r => [
      r.id,
      r.customer?.name || '',
      r.product_name,
      r.hsn_code || '',
      r.required_quantity,
      r.unit,
      r.notes || ''
    ]);
    return generateCsvDataUri(headers, rows);
  },

  getRequirementsTemplateExcelUrl: (_shipmentId?: number): string => {
    const headers = ['Customer Name or Code', 'Product Name', 'HSN Code', 'Required Qty', 'Unit', 'Target Price (INR)', 'Notes'];
    const rows = [
      ['Lanka Retail Distributors', 'Ragi (Finger Millet)', '1008.29.20', 120, 'CTNS', 75, 'Urgent'],
      ['Ceylon Spices & Agri Ltd', 'Basmati Rice Premium', '1006.30.11', 80, 'BAGS', 480, 'Grade A'],
    ];
    return generateCsvDataUri(headers, rows);
  },

  getRequirementsExportPdfUrl: (shipmentId: number): string => {
    return mockService.getRequirementsExportExcelUrl(shipmentId);
  },

  getRequirementHistory: async (_shipmentId: number): Promise<CustomerRequirementHistory[]> => {
    return [];
  },

  // ── Vendor Allocation & Proforma Invoice ────────────────────────────────────
  getVendorAllocations: async (shipmentId: number): Promise<ShipmentVendorAllocation[]> => {
    const shipments = MockStorage.getShipments();
    const s = shipments.find(item => item.id === Number(shipmentId));
    return s?.allocations || [];
  },

  createVendorAllocation: async (shipmentId: number, data: { requirement_id: number; vendor_id: number; allocated_quantity: number; allocated_unit: string; notes?: string }): Promise<ShipmentVendorAllocation> => {
    const shipments = MockStorage.getShipments();
    const sIdx = shipments.findIndex(item => item.id === Number(shipmentId));
    if (sIdx === -1) throw new Error(`Shipment ${shipmentId} not found`);

    const allocations = shipments[sIdx].allocations || [];
    const newId = allocations.length > 0 ? Math.max(...allocations.map(a => a.id)) + 1 : 1;
    const vendor = MockStorage.getVendors().find(v => v.id === Number(data.vendor_id));
    const req = (shipments[sIdx].requirements || []).find(r => r.id === Number(data.requirement_id));

    const newAlloc: ShipmentVendorAllocation = {
      id: newId,
      shipment_id: Number(shipmentId),
      requirement_id: Number(data.requirement_id),
      vendor_id: Number(data.vendor_id),
      allocated_quantity: Number(data.allocated_quantity) || 1,
      allocated_unit: data.allocated_unit || 'CTNS',
      status: 'PENDING_PI',
      notes: data.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      vendor,
      requirement: req,
    };

    allocations.push(newAlloc);
    shipments[sIdx].allocations = allocations;
    MockStorage.setShipments(shipments);
    return newAlloc;
  },

  getVendorProformaItems: async (shipmentId: number): Promise<ShipmentVendorProformaItem[]> => {
    const shipments = MockStorage.getShipments();
    const s = shipments.find(item => item.id === Number(shipmentId));
    return s?.proforma_items || [];
  },

  createVendorProformaItem: async (shipmentId: number, data: Partial<ShipmentVendorProformaItem>): Promise<ShipmentVendorProformaItem> => {
    const shipments = MockStorage.getShipments();
    const sIdx = shipments.findIndex(item => item.id === Number(shipmentId));
    if (sIdx === -1) throw new Error(`Shipment ${shipmentId} not found`);

    const proformas = shipments[sIdx].proforma_items || [];
    const newId = proformas.length > 0 ? Math.max(...proformas.map(p => p.id)) + 1 : 1;
    const vendor = MockStorage.getVendors().find(v => v.id === Number(data.vendor_id));

    const newItem: ShipmentVendorProformaItem = {
      id: newId,
      shipment_id: Number(shipmentId),
      vendor_id: Number(data.vendor_id) || 1,
      product_name: data.product_name || 'Item',
      sku: data.sku,
      hsn_code: data.hsn_code,
      proforma_qty: Number(data.proforma_qty) || 1,
      cartons_count: Number(data.cartons_count) || 1,
      units_per_carton: Number(data.units_per_carton) || 1,
      unit_weight_val: Number(data.unit_weight_val) || 1,
      unit_weight_unit: data.unit_weight_unit || 'KG',
      net_weight_kg: Number(data.net_weight_kg) || 1,
      gross_weight_kg: Number(data.gross_weight_kg) || 1.05,
      proforma_price: Number(data.proforma_price) || 0,
      mrp: Number(data.mrp) || 0,
      discount_pct: Number(data.discount_pct) || 0,
      gst_pct: Number(data.gst_pct) || 5.0,
      total_payable: Number(data.total_payable) || ((Number(data.proforma_qty) || 1) * (Number(data.proforma_price) || 0)),
      currency: data.currency || 'INR',
      notes: data.notes,
      created_at: new Date().toISOString(),
      vendor,
    };

    proformas.push(newItem);
    shipments[sIdx].proforma_items = proformas;
    MockStorage.setShipments(shipments);
    return newItem;
  },

  updateVendorProformaItem: async (shipmentId: number, itemId: number, data: Partial<ShipmentVendorProformaItem>): Promise<ShipmentVendorProformaItem> => {
    const shipments = MockStorage.getShipments();
    const sIdx = shipments.findIndex(item => item.id === Number(shipmentId));
    if (sIdx === -1) throw new Error(`Shipment ${shipmentId} not found`);

    const proformas = shipments[sIdx].proforma_items || [];
    const pIdx = proformas.findIndex(p => p.id === Number(itemId));
    if (pIdx === -1) throw new Error(`Proforma item ${itemId} not found`);

    proformas[pIdx] = { ...proformas[pIdx], ...data };
    shipments[sIdx].proforma_items = proformas;
    MockStorage.setShipments(shipments);
    return proformas[pIdx];
  },

  deleteVendorProformaItem: async (shipmentId: number, itemId: number): Promise<void> => {
    const shipments = MockStorage.getShipments();
    const sIdx = shipments.findIndex(item => item.id === Number(shipmentId));
    if (sIdx === -1) throw new Error(`Shipment ${shipmentId} not found`);

    shipments[sIdx].proforma_items = (shipments[sIdx].proforma_items || []).filter(p => p.id !== Number(itemId));
    MockStorage.setShipments(shipments);
  },

  uploadVendorProformaExcel: async (shipmentId: number, _file: File): Promise<ShipmentVendorProformaItem[]> => {
    return mockService.getVendorProformaItems(shipmentId);
  },

  getStage2ProformaExportExcelUrl: (shipmentId: number): string => {
    const shipments = MockStorage.getShipments();
    const s = shipments.find(item => item.id === Number(shipmentId));
    const items = s?.proforma_items || [];
    const headers = ['Item ID', 'Vendor', 'Product Name', 'HSN Code', 'Qty', 'Unit Wt', 'Net Wt (KG)', 'Price (INR)', 'GST %', 'Total (INR)'];
    const rows = items.map(p => [
      p.id,
      p.vendor?.name || '',
      p.product_name,
      p.hsn_code || '',
      p.proforma_qty,
      `${p.unit_weight_val} ${p.unit_weight_unit}`,
      p.net_weight_kg,
      p.proforma_price,
      p.gst_pct || 0,
      p.total_payable || 0
    ]);
    return generateCsvDataUri(headers, rows);
  },

  getStage2ProformaExportPdfUrl: (shipmentId: number): string => {
    return mockService.getStage2ProformaExportExcelUrl(shipmentId);
  },

  uploadVendorProformaOcr: async (shipmentId: number, _file: File): Promise<ShipmentVendorProformaItem[]> => {
    return mockService.getVendorProformaItems(shipmentId);
  },

  getVendorRfqExcelUrl: (shipmentId: number, vendorId: number): string => {
    const vendor = MockStorage.getVendors().find(v => v.id === Number(vendorId));
    const headers = ['RFQ No', 'Vendor', 'Item Description', 'Requested Qty', 'Unit', 'Target Delivery Date'];
    const rows = [
      [`RFQ-AEC-${shipmentId}-${vendorId}`, vendor?.name || 'Vendor', 'Basmati Rice Premium 1121', 80, 'BAGS', '2026-03-30'],
      [`RFQ-AEC-${shipmentId}-${vendorId}`, vendor?.name || 'Vendor', 'Ragi (Finger Millet)', 120, 'CTNS', '2026-03-30'],
    ];
    return generateCsvDataUri(headers, rows);
  },

  getVendorRfqPdfUrl: (shipmentId: number, vendorId: number): string => {
    return mockService.getVendorRfqExcelUrl(shipmentId, vendorId);
  },

  // ── Preliminary Quotation & Quotation Simulation ─────────────────────────
  getPreliminaryQuotation: async (shipmentId: number): Promise<PreliminaryQuotationItem[]> => {
    const shipments = MockStorage.getShipments();
    const s = shipments.find(item => item.id === Number(shipmentId));
    const items = s?.products || [];

    return items.map(p => ({
      id: p.id,
      shipment_id: Number(shipmentId),
      product_name: p.product_name,
      hsn_code: p.hsn_code,
      quantity: p.quantity,
      unit: p.unit || 'KG',
      unit_price_inr: p.indian_price || p.purchase_price || 0,
      unit_cost_lkr: p.total_cost_lkr || 0,
      estimated_selling_price_lkr: p.suggested_price || p.final_quotation_price || 0,
      customer_target_price: p.final_quotation_price || 0,
      approval_status: 'APPROVED',
      notes: p.notes,
    }));
  },

  approveQuotationItem: async (_shipmentId: number, _itemId: number, _quantity?: number, _targetPrice?: number) => {
    return { status: 'APPROVED' };
  },

  removeQuotationItem: async (_shipmentId: number, _itemId: number) => {
    return { status: 'REMOVED' };
  },

  negotiateQuotationItem: async (_shipmentId: number, _itemId: number, _quantity?: number, _targetPrice?: number, _notes?: string) => {
    return { status: 'NEGOTIATED' };
  },

  getQuotationHistory: async (_shipmentId: number): Promise<QuotationHistoryLog[]> => {
    return MockStorage.getQuotationHistory();
  },

  convertToShipmentProducts: async (shipmentId: number): Promise<Shipment> => {
    const shipments = MockStorage.getShipments();
    const sIdx = shipments.findIndex(item => item.id === Number(shipmentId));
    if (sIdx === -1) throw new Error(`Shipment ${shipmentId} not found`);

    shipments[sIdx].current_stage = '4_PRICING_CALCULATION';
    shipments[sIdx] = recalculateShipmentData(shipments[sIdx]);
    MockStorage.setShipments(shipments);
    return shipments[sIdx];
  },

  simulateQuotation: async (payload: any) => {
    const usdRate = 305.0;
    const lkrInrRate = 3.65;
    const purchasePrice = Number(payload.purchase_price) || 100;
    const basePriceLkr = payload.currency === 'INR' ? purchasePrice / lkrInrRate : purchasePrice;
    const dutyPct = 15 + 18 + 10 + 2.5;
    const calculatedDuty = basePriceLkr * (dutyPct / 100);
    const estimatedCost = basePriceLkr + calculatedDuty + 50;
    const suggestedPrice = estimatedCost / 0.85;

    return {
      base_price_lkr: Math.round(basePriceLkr * 100) / 100,
      calculated_duty_lkr: Math.round(calculatedDuty * 100) / 100,
      total_cost_lkr: Math.round(estimatedCost * 100) / 100,
      suggested_price_lkr: Math.round(suggestedPrice * 100) / 100,
      currency_conversion: { usd_rate: usdRate, lkr_inr_rate: lkrInrRate },
    };
  },
};
