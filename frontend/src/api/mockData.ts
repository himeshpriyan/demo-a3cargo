import type {
  Chapter,
  TariffLine,
  Customer,
  Vendor,
  ItemEntry,
  Shipment,
  ImportLog,
  VendorPayment,
  PhysicalReceivingVerification,
  ShipmentPackingList,
  QuotationHistoryLog,
} from '../types';

export const STORAGE_KEYS = {
  CHAPTERS: 'a3_chapters_v1',
  TARIFF_LINES: 'a3_tariff_lines_v1',
  ITEM_ENTRIES: 'a3_item_entries_v1',
  CUSTOMERS: 'a3_customers_v1',
  VENDORS: 'a3_vendors_v1',
  SHIPMENTS: 'a3_shipments_v1',
  IMPORT_LOGS: 'a3_import_logs_v1',
  VENDOR_PAYMENTS: 'a3_vendor_payments_v1',
  RECEIVING_VERIFICATIONS: 'a3_receiving_verifications_v1',
  PACKING_LISTS: 'a3_packing_lists_v1',
  QUOTATION_HISTORY: 'a3_quotation_history_v1',
  NEXT_SHIPMENT_SEQ: 'a3_next_shipment_seq_v1',
};

// ── Initial Seed Chapters ──────────────────────────────────────────────────
export const INITIAL_CHAPTERS: Chapter[] = [
  { id: 1, chapter_number: 1, section_number: 'I', section_title: 'LIVE ANIMALS; ANIMAL PRODUCTS', chapter_title: 'Live animals', total_lines: 32, last_imported_at: '2026-03-01T09:00:00Z', source_pdf_filename: 'Tariff_Chap_01.pdf' },
  { id: 2, chapter_number: 2, section_number: 'I', section_title: 'LIVE ANIMALS; ANIMAL PRODUCTS', chapter_title: 'Meat and edible meat offal', total_lines: 54, last_imported_at: '2026-03-01T09:00:00Z', source_pdf_filename: 'Tariff_Chap_02.pdf' },
  { id: 4, chapter_number: 4, section_number: 'I', section_title: 'LIVE ANIMALS; ANIMAL PRODUCTS', chapter_title: 'Dairy produce; birds\' eggs; natural honey; edible products of animal origin', total_lines: 48, last_imported_at: '2026-03-01T09:00:00Z', source_pdf_filename: 'Tariff_Chap_04.pdf' },
  { id: 7, chapter_number: 7, section_number: 'II', section_title: 'VEGETABLE PRODUCTS', chapter_title: 'Edible vegetables and certain roots and tubers (Pulses, Grams, Dhals)', total_lines: 86, last_imported_at: '2026-03-01T09:00:00Z', source_pdf_filename: 'Tariff_Chap_07.pdf' },
  { id: 8, chapter_number: 8, section_number: 'II', section_title: 'VEGETABLE PRODUCTS', chapter_title: 'Edible fruit and nuts; peel of citrus fruit or melons', total_lines: 62, last_imported_at: '2026-03-01T09:00:00Z', source_pdf_filename: 'Tariff_Chap_08.pdf' },
  { id: 9, chapter_number: 9, section_number: 'II', section_title: 'VEGETABLE PRODUCTS', chapter_title: 'Coffee, tea, maté and spices (Cardamom, Pepper, Chillies, Turmeric)', total_lines: 110, last_imported_at: '2026-03-01T09:00:00Z', source_pdf_filename: 'Tariff_Chap_09.pdf' },
  { id: 10, chapter_number: 10, section_number: 'II', section_title: 'VEGETABLE PRODUCTS', chapter_title: 'Cereals (Basmati Rice, Ragi, Millets, Wheat)', total_lines: 75, last_imported_at: '2026-03-01T09:00:00Z', source_pdf_filename: 'Tariff_Chap_10.pdf' },
  { id: 11, chapter_number: 11, section_number: 'II', section_title: 'VEGETABLE PRODUCTS', chapter_title: 'Products of the milling industry; malt; starches; inulin; wheat gluten', total_lines: 58, last_imported_at: '2026-03-01T09:00:00Z', source_pdf_filename: 'Tariff_Chap_11.pdf' },
  { id: 15, chapter_number: 15, section_number: 'III', section_title: 'ANIMAL OR VEGETABLE FATS AND OILS', chapter_title: 'Animal, vegetable or microbial fats and oils and their cleavage products', total_lines: 64, last_imported_at: '2026-03-01T09:00:00Z', source_pdf_filename: 'Tariff_Chap_15.pdf' },
  { id: 19, chapter_number: 19, section_number: 'IV', section_title: 'PREPARED FOODSTUFFS; BEVERAGES', chapter_title: 'Preparations of cereals, flour, starch or milk; pastrycooks\' products', total_lines: 92, last_imported_at: '2026-03-01T09:00:00Z', source_pdf_filename: 'Tariff_Chap_19.pdf' },
  { id: 21, chapter_number: 21, section_number: 'IV', section_title: 'PREPARED FOODSTUFFS; BEVERAGES', chapter_title: 'Miscellaneous edible preparations (Sauces, Soups, Snacks, Namkeen)', total_lines: 104, last_imported_at: '2026-03-01T09:00:00Z', source_pdf_filename: 'Tariff_Chap_21.pdf' },
  { id: 22, chapter_number: 22, section_number: 'IV', section_title: 'PREPARED FOODSTUFFS; BEVERAGES', chapter_title: 'Beverages, spirits and vinegar', total_lines: 45, last_imported_at: '2026-03-01T09:00:00Z', source_pdf_filename: 'Tariff_Chap_22.pdf' },
];

// ── Initial Seed Tariff Lines ──────────────────────────────────────────────
export const INITIAL_TARIFF_LINES: TariffLine[] = [
  {
    id: 1,
    chapter_id: 4,
    chapter_number: 4,
    section_number: 'I',
    hs_code: '0405.90.00',
    description: 'Ghee (Butter oil) and other fats and oils derived from milk',
    unit: 'KG',
    general_duty_rate: '30%',
    vat_rate: '18%',
    pal_rate: 'Ex',
    cess_rate: '10%',
    sscl_rate: '2.5%',
    scl_rate: 'Rs. 600/kg',
    indent_level: 2,
    is_verified: true,
    notes: 'Special Commodity Levy (SCL) applies with priority.'
  },
  {
    id: 2,
    chapter_id: 4,
    chapter_number: 4,
    section_number: 'I',
    hs_code: '0409.00.00',
    description: 'Natural honey',
    unit: 'KG',
    general_duty_rate: '15%',
    vat_rate: '18%',
    pal_rate: '10%',
    cess_rate: '10%',
    sscl_rate: '2.5%',
    indent_level: 1,
    is_verified: true
  },
  {
    id: 3,
    chapter_id: 7,
    chapter_number: 7,
    section_number: 'II',
    hs_code: '0713.31.19',
    description: 'Green Gram (Moong) - Other than seed quality',
    unit: 'KG',
    general_duty_rate: '20%',
    vat_rate: '18%',
    pal_rate: 'Ex',
    cess_rate: '10%',
    sscl_rate: '2.5%',
    indent_level: 2,
    is_verified: true
  },
  {
    id: 4,
    chapter_id: 7,
    chapter_number: 7,
    section_number: 'II',
    hs_code: '0713.31.29',
    description: 'Black Gram (Urad) - Other than seed quality',
    unit: 'KG',
    general_duty_rate: '20%',
    vat_rate: '18%',
    pal_rate: 'Ex',
    cess_rate: '10%',
    sscl_rate: '2.5%',
    indent_level: 2,
    is_verified: true
  },
  {
    id: 5,
    chapter_id: 7,
    chapter_number: 7,
    section_number: 'II',
    hs_code: '0713.60.10',
    description: 'Pigeon peas (Toor Dhal / Cajanus cajan)',
    unit: 'KG',
    general_duty_rate: '15%',
    vat_rate: '18%',
    pal_rate: 'Ex',
    cess_rate: '10%',
    sscl_rate: '2.5%',
    indent_level: 2,
    is_verified: true
  },
  {
    id: 6,
    chapter_id: 9,
    chapter_number: 9,
    section_number: 'II',
    hs_code: '0901.90.00',
    description: 'Coffee, roasted, not decaffeinated or decaffeinated',
    unit: 'KG',
    general_duty_rate: '30%',
    vat_rate: '18%',
    pal_rate: '10%',
    cess_rate: '15%',
    sscl_rate: '2.5%',
    indent_level: 2,
    is_verified: true
  },
  {
    id: 7,
    chapter_id: 9,
    chapter_number: 9,
    section_number: 'II',
    hs_code: '0902.30.21',
    description: 'Flavoured Black Tea in immediate packings of a content not exceeding 3 kg',
    unit: 'KG',
    general_duty_rate: '30%',
    vat_rate: '18%',
    pal_rate: '10%',
    cess_rate: '15%',
    sscl_rate: '2.5%',
    indent_level: 2,
    is_verified: true
  },
  {
    id: 8,
    chapter_id: 9,
    chapter_number: 9,
    section_number: 'II',
    hs_code: '0904.21.90',
    description: 'Dried chillies (Capsicum or Pimenta), neither crushed nor ground - Other',
    unit: 'KG',
    general_duty_rate: '25%',
    vat_rate: '18%',
    pal_rate: '10%',
    cess_rate: '10%',
    sscl_rate: '2.5%',
    indent_level: 2,
    is_verified: true
  },
  {
    id: 9,
    chapter_id: 9,
    chapter_number: 9,
    section_number: 'II',
    hs_code: '0904.22.10',
    description: 'Chillies crushed or ground (Chilli Powder)',
    unit: 'KG',
    general_duty_rate: '30%',
    vat_rate: '18%',
    pal_rate: '10%',
    cess_rate: '15%',
    sscl_rate: '2.5%',
    indent_level: 2,
    is_verified: true
  },
  {
    id: 10,
    chapter_id: 9,
    chapter_number: 9,
    section_number: 'II',
    hs_code: '0908.32.90',
    description: 'Cardamoms, crushed or ground - Other',
    unit: 'KG',
    general_duty_rate: '30%',
    vat_rate: '18%',
    pal_rate: '10%',
    cess_rate: '15%',
    sscl_rate: '2.5%',
    indent_level: 2,
    is_verified: true
  },
  {
    id: 11,
    chapter_id: 9,
    chapter_number: 9,
    section_number: 'II',
    hs_code: '0909.22.00',
    description: 'Coriander seeds, crushed or ground (Dhaniya Powder)',
    unit: 'KG',
    general_duty_rate: '20%',
    vat_rate: '18%',
    pal_rate: 'Ex',
    cess_rate: '10%',
    sscl_rate: '2.5%',
    indent_level: 2,
    is_verified: true
  },
  {
    id: 12,
    chapter_id: 9,
    chapter_number: 9,
    section_number: 'II',
    hs_code: '0910.30.10',
    description: 'Turmeric (Curcuma) - Dried / Whole / Ground',
    unit: 'KG',
    general_duty_rate: '30%',
    vat_rate: '18%',
    pal_rate: '10%',
    cess_rate: '15%',
    sscl_rate: '2.5%',
    indent_level: 2,
    is_verified: true
  },
  {
    id: 13,
    chapter_id: 9,
    chapter_number: 9,
    section_number: 'II',
    hs_code: '0910.91.90',
    description: 'Assorted Curry Powder and Masala Blends',
    unit: 'KG',
    general_duty_rate: '30%',
    vat_rate: '18%',
    pal_rate: '10%',
    cess_rate: '15%',
    sscl_rate: '2.5%',
    indent_level: 2,
    is_verified: true
  },
  {
    id: 14,
    chapter_id: 10,
    chapter_number: 10,
    section_number: 'II',
    hs_code: '1006.30.11',
    description: 'Semi-milled or wholly milled Basmati Rice, polished or glazed',
    unit: 'KG',
    general_duty_rate: '15%',
    vat_rate: '18%',
    pal_rate: 'Ex',
    cess_rate: '10%',
    sscl_rate: '2.5%',
    indent_level: 2,
    is_verified: true
  },
  {
    id: 15,
    chapter_id: 10,
    chapter_number: 10,
    section_number: 'II',
    hs_code: '1008.29.20',
    description: 'Finger Millet (Ragi / Kurakkan) - Other',
    unit: 'KG',
    general_duty_rate: '15%',
    vat_rate: '18%',
    pal_rate: 'Ex',
    cess_rate: '10%',
    sscl_rate: '2.5%',
    indent_level: 2,
    is_verified: true
  },
  {
    id: 16,
    chapter_id: 21,
    chapter_number: 21,
    section_number: 'IV',
    hs_code: '2106.90.99',
    description: 'Food preparations not elsewhere specified or included (Namkeen, Snacks, Murukku, Bhakarwadi, Haldiram items)',
    unit: 'KG',
    general_duty_rate: '30%',
    vat_rate: '18%',
    pal_rate: '10%',
    cess_rate: '15%',
    sscl_rate: '2.5%',
    indent_level: 2,
    is_verified: true
  },
  {
    id: 17,
    chapter_id: 21,
    chapter_number: 21,
    section_number: 'IV',
    hs_code: '2103.90.90',
    description: 'Sauces and preparations therefor; mixed condiments and mixed seasonings (Schezwan Chutney, Cooking Pastes)',
    unit: 'KG',
    general_duty_rate: '25%',
    vat_rate: '18%',
    pal_rate: '10%',
    cess_rate: '15%',
    sscl_rate: '2.5%',
    indent_level: 2,
    is_verified: true
  },
  {
    id: 18,
    chapter_id: 19,
    chapter_number: 19,
    section_number: 'IV',
    hs_code: '1901.90.99',
    description: 'Malted milk food preparations (Horlicks, Boost, Malt health drinks)',
    unit: 'KG',
    general_duty_rate: '20%',
    vat_rate: '18%',
    pal_rate: '10%',
    cess_rate: '10%',
    sscl_rate: '2.5%',
    indent_level: 2,
    is_verified: true
  }
];

// ── Initial Seed Customers ────────────────────────────────────────────────
export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 1,
    name: 'Lanka Retail Distributors',
    code: 'LRD',
    email: 'purchasing@lankaretail.lk',
    phone: '+94 11 234 5678',
    address: '45 Old Moor Street, Colombo 11, Sri Lanka',
    country: 'Sri Lanka',
    tax_id: 'VAT-112345678-0001',
    created_at: '2026-01-15T08:30:00Z'
  },
  {
    id: 2,
    name: 'Ceylon Spices & Agri Ltd',
    code: 'CSA',
    email: 'imports@ceylonspices.lk',
    phone: '+94 11 987 6543',
    address: '128 Main Street, Pettah, Colombo 11, Sri Lanka',
    country: 'Sri Lanka',
    tax_id: 'VAT-987654321-0002',
    created_at: '2026-01-20T09:15:00Z'
  },
  {
    id: 3,
    name: 'Colombo Trade Hub Ltd',
    code: 'CTH',
    email: 'trade@colombotradehub.com',
    phone: '+94 11 445 6677',
    address: '88 Sea Street, Colombo 11, Sri Lanka',
    country: 'Sri Lanka',
    tax_id: 'VAT-445667788-0003',
    created_at: '2026-02-01T10:00:00Z'
  },
  {
    id: 4,
    name: 'Serendib Consumer Goods Co.',
    code: 'SCG',
    email: 'procurement@serendibgoods.lk',
    phone: '+94 81 223 4455',
    address: '24 Dalada Veediya, Kandy, Sri Lanka',
    country: 'Sri Lanka',
    tax_id: 'VAT-223445566-0004',
    created_at: '2026-02-10T11:45:00Z'
  },
  {
    id: 5,
    name: 'Southern Spice & Provisions',
    code: 'SSP',
    email: 'orders@southernspice.lk',
    phone: '+94 91 334 5566',
    address: '12 Fort Rampart Road, Galle, Sri Lanka',
    country: 'Sri Lanka',
    tax_id: 'VAT-334556677-0005',
    created_at: '2026-02-18T14:20:00Z'
  }
];

// ── Initial Seed Vendors ──────────────────────────────────────────────────
export const INITIAL_VENDORS: Vendor[] = [
  {
    id: 1,
    name: 'India Grain Exporters Pvt Ltd',
    code: 'IGE',
    legal_name: 'India Grain Exporters Private Limited',
    trade_name: 'IGE Grains',
    company_type: 'Private Limited Company',
    contact_person: 'Rajesh Sharma',
    email: 'export@indiagrainexport.com',
    phone: '+91 98201 12345',
    address: 'Plot 45, APMC Market 2, Vashi, Navi Mumbai 400703, India',
    country: 'India',
    gstin: '27AAACI1234F1Z5',
    pan_number: 'AAACI1234F',
    bank_name: 'State Bank of India',
    bank_account_number: '30012894567',
    bank_ifsc_code: 'SBIN0001234',
    bank_branch: 'Vashi APMC Branch, Mumbai',
    main_category: 'Cereals & Grains',
    sub_categories: ['Basmati Rice', 'Millets', 'Ragi', 'Wheat Groats'],
    products_supplied: ['Basmati Rice 1121', 'Ragi (Finger Millet)', 'Kodo Millet', 'Barnyard Millet'],
    status: 'Active Supplier',
    created_at: '2026-01-10T08:00:00Z',
    mappings: [
      { id: 1, vendor_id: 1, product_category: 'Cereals & Grains', notes: 'Primary supplier for rice and millets', created_at: '2026-01-10T08:00:00Z' }
    ]
  },
  {
    id: 2,
    name: 'Apex Mills India',
    code: 'AMI',
    legal_name: 'Apex Agro Milling & Processing LLP',
    trade_name: 'Apex Pulses',
    company_type: 'LLP',
    contact_person: 'Suresh Patel',
    email: 'sales@apexmillsindia.com',
    phone: '+91 97245 67890',
    address: 'GIDC Industrial Estate, Naroda, Ahmedabad, Gujarat 382330, India',
    country: 'India',
    gstin: '24AAKFA9876P1Z3',
    pan_number: 'AAKFA9876P',
    bank_name: 'HDFC Bank',
    bank_account_number: '50200045678912',
    bank_ifsc_code: 'HDFC0000456',
    bank_branch: 'Naroda Branch, Ahmedabad',
    main_category: 'Pulses & Dhals',
    sub_categories: ['Toor Dhal', 'Moong Dhal', 'Urad Dhal', 'Black Gram'],
    products_supplied: ['Toor Dhal Premium', 'Green Gram - Whole', 'Black Gram Washed', 'Chana Dhal'],
    status: 'Active Supplier',
    created_at: '2026-01-12T09:30:00Z',
    mappings: [
      { id: 2, vendor_id: 2, product_category: 'Pulses & Dhals', notes: 'Certified FSSAI pulse milling plant', created_at: '2026-01-12T09:30:00Z' }
    ]
  },
  {
    id: 3,
    name: 'Chennai Spice Exports Co',
    code: 'CSE',
    legal_name: 'Chennai Spice & Condiments Exporters',
    trade_name: 'SouthSpice',
    company_type: 'Partnership Firm',
    contact_person: 'K. Venkatesan',
    email: 'export@chennaispices.in',
    phone: '+91 94440 98765',
    address: '14 Broadway Bazaar, George Town, Chennai, Tamil Nadu 600001, India',
    country: 'India',
    gstin: '33AABFC5544K1ZR',
    pan_number: 'AABFC5544K',
    bank_name: 'Canara Bank',
    bank_account_number: '0123101004567',
    bank_ifsc_code: 'CNRB0000123',
    bank_branch: 'George Town, Chennai',
    main_category: 'Spices & Seasonings',
    sub_categories: ['Cardamom', 'Chilli Powder', 'Turmeric', 'Coriander Powder', 'Cumin'],
    products_supplied: ['Green Cardamom 8mm', 'Guntur Sannam Chillies', 'Salem Turmeric Whole', 'Dhaniya Powder'],
    status: 'Active Supplier',
    created_at: '2026-01-15T11:00:00Z',
    mappings: [
      { id: 3, vendor_id: 3, product_category: 'Spices & Seasonings', notes: 'Spices Board registered merchant exporter', created_at: '2026-01-15T11:00:00Z' }
    ]
  },
  {
    id: 4,
    name: 'Haldiram Snacks Distributor Hub',
    code: 'HSD',
    legal_name: 'Haldiram Foods International Ltd Channel Partner',
    trade_name: 'Haldiram Export House',
    company_type: 'Public Limited',
    contact_person: 'Anil Agarwal',
    email: 'export@haldiramdisthub.com',
    phone: '+91 712 277 8899',
    address: '145 MIDC Industrial Area, Hingna Road, Nagpur, Maharashtra 440028, India',
    country: 'India',
    gstin: '27AABCH9988G1ZQ',
    pan_number: 'AABCH9988G',
    bank_name: 'ICICI Bank',
    bank_account_number: '004505012345',
    bank_ifsc_code: 'ICIC0000045',
    bank_branch: 'MIDC Nagpur',
    main_category: 'Snacks & Namkeen',
    sub_categories: ['Namkeen', 'Bhakarwadi', 'Aloo Bhujia', 'Sweets', 'Murukku'],
    products_supplied: ['Aloo Bhujia 200g', 'Mini Bhakarwadi 200g', 'Navratan Mix 200g', 'Ratlami Sev 200g', 'Murukku 200g'],
    status: 'Active Supplier',
    created_at: '2026-01-20T10:30:00Z',
    mappings: [
      { id: 4, vendor_id: 4, product_category: 'Snacks & Namkeen', notes: 'Export quality packings with multi-language labels', created_at: '2026-01-20T10:30:00Z' }
    ]
  }
];

// ── Initial Seed Master Item Catalog (from trade list & extracted_products.json) ────
export const INITIAL_ITEM_ENTRIES: ItemEntry[] = [
  {
    id: 1,
    item_name: 'Ghee (Pure Butter Oil) 500ml',
    item_category: 'Dairy produce; birds\' eggs; natural honey',
    unit: 'TINS',
    currency: 'INR',
    tariff_line_id: 1,
    hs_code: '0405.90.00',
    tariff_description: 'Ghee (Butter oil) and other fats and oils derived from milk',
    general_duty_rate: '30%',
    vat_rate: '18%',
    pal_rate: 'Ex',
    cess_rate: '10%',
    sscl_rate: '2.5%',
    scl_rate: 'Rs. 600/kg',
    weight_val: 0.5,
    weight_unit: 'KG',
    is_favorite: true,
    purchase_price: 320.0,
    price_per_kg: 640.0,
    total_quantity_kg: 1200,
    per_month_qty_kg: 400,
    total_value: 768000,
    per_month_value: 256000,
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-01-10T10:00:00Z'
  },
  {
    id: 2,
    item_name: 'Basmati Rice Premium 1121 (5kg Bag)',
    item_category: 'Cereals (Basmati Rice, Ragi, Millets)',
    unit: 'BAGS',
    currency: 'INR',
    tariff_line_id: 14,
    hs_code: '1006.30.11',
    tariff_description: 'Semi-milled or wholly milled Basmati Rice, polished or glazed',
    general_duty_rate: '15%',
    vat_rate: '18%',
    pal_rate: 'Ex',
    cess_rate: '10%',
    sscl_rate: '2.5%',
    weight_val: 5.0,
    weight_unit: 'KG',
    is_favorite: true,
    purchase_price: 480.0,
    price_per_kg: 96.0,
    total_quantity_kg: 5000,
    per_month_qty_kg: 2500,
    total_value: 480000,
    per_month_value: 240000,
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-01-10T10:00:00Z'
  },
  {
    id: 3,
    item_name: 'Ragi (Finger Millet / Kurakkan) 1kg',
    item_category: 'Cereals (Basmati Rice, Ragi, Millets)',
    unit: 'PKTS',
    currency: 'INR',
    tariff_line_id: 15,
    hs_code: '1008.29.20',
    tariff_description: 'Finger Millet (Ragi / Kurakkan) - Other',
    general_duty_rate: '15%',
    vat_rate: '18%',
    pal_rate: 'Ex',
    cess_rate: '10%',
    sscl_rate: '2.5%',
    weight_val: 1.0,
    weight_unit: 'KG',
    is_favorite: true,
    purchase_price: 75.0,
    price_per_kg: 75.0,
    total_quantity_kg: 3000,
    per_month_qty_kg: 1000,
    total_value: 225000,
    per_month_value: 75000,
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-01-10T10:00:00Z'
  },
  {
    id: 4,
    item_name: 'Toor Dhal (Pigeon Peas) Premium 1kg',
    item_category: 'Edible vegetables and roots (Pulses, Dhals)',
    unit: 'PKTS',
    currency: 'INR',
    tariff_line_id: 5,
    hs_code: '0713.60.10',
    tariff_description: 'Pigeon peas (Toor Dhal / Cajanus cajan)',
    general_duty_rate: '15%',
    vat_rate: '18%',
    pal_rate: 'Ex',
    cess_rate: '10%',
    sscl_rate: '2.5%',
    weight_val: 1.0,
    weight_unit: 'KG',
    is_favorite: true,
    purchase_price: 135.0,
    price_per_kg: 135.0,
    total_quantity_kg: 4000,
    per_month_qty_kg: 2000,
    total_value: 540000,
    per_month_value: 270000,
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-01-10T10:00:00Z'
  },
  {
    id: 5,
    item_name: 'Green Gram (Moong Whole) 1kg',
    item_category: 'Edible vegetables and roots (Pulses, Dhals)',
    unit: 'PKTS',
    currency: 'INR',
    tariff_line_id: 3,
    hs_code: '0713.31.19',
    tariff_description: 'Green Gram (Moong) - Other than seed quality',
    general_duty_rate: '20%',
    vat_rate: '18%',
    pal_rate: 'Ex',
    cess_rate: '10%',
    sscl_rate: '2.5%',
    weight_val: 1.0,
    weight_unit: 'KG',
    is_favorite: true,
    purchase_price: 110.0,
    price_per_kg: 110.0,
    total_quantity_kg: 2500,
    per_month_qty_kg: 1250,
    total_value: 275000,
    per_month_value: 137500,
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-01-10T10:00:00Z'
  },
  {
    id: 6,
    item_name: 'Black Gram (Urad Washed) 1kg',
    item_category: 'Edible vegetables and roots (Pulses, Dhals)',
    unit: 'PKTS',
    currency: 'INR',
    tariff_line_id: 4,
    hs_code: '0713.31.29',
    tariff_description: 'Black Gram (Urad) - Other than seed quality',
    general_duty_rate: '20%',
    vat_rate: '18%',
    pal_rate: 'Ex',
    cess_rate: '10%',
    sscl_rate: '2.5%',
    weight_val: 1.0,
    weight_unit: 'KG',
    is_favorite: true,
    purchase_price: 125.0,
    price_per_kg: 125.0,
    total_quantity_kg: 2000,
    per_month_qty_kg: 1000,
    total_value: 250000,
    per_month_value: 125000,
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-01-10T10:00:00Z'
  },
  {
    id: 7,
    item_name: 'Green Cardamom (8mm Bold) 250g',
    item_category: 'Coffee, tea, maté and spices',
    unit: 'PKTS',
    currency: 'INR',
    tariff_line_id: 10,
    hs_code: '0908.32.90',
    tariff_description: 'Cardamoms, crushed or ground - Other',
    general_duty_rate: '30%',
    vat_rate: '18%',
    pal_rate: '10%',
    cess_rate: '15%',
    sscl_rate: '2.5%',
    weight_val: 0.25,
    weight_unit: 'KG',
    is_favorite: true,
    purchase_price: 650.0,
    price_per_kg: 2600.0,
    total_quantity_kg: 500,
    per_month_qty_kg: 250,
    total_value: 1300000,
    per_month_value: 650000,
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-01-10T10:00:00Z'
  },
  {
    id: 8,
    item_name: 'Salem Turmeric Powder 500g',
    item_category: 'Coffee, tea, maté and spices',
    unit: 'PKTS',
    currency: 'INR',
    tariff_line_id: 12,
    hs_code: '0910.30.10',
    tariff_description: 'Turmeric (Curcuma) - Dried / Whole / Ground',
    general_duty_rate: '30%',
    vat_rate: '18%',
    pal_rate: '10%',
    cess_rate: '15%',
    sscl_rate: '2.5%',
    weight_val: 0.5,
    weight_unit: 'KG',
    is_favorite: true,
    purchase_price: 90.0,
    price_per_kg: 180.0,
    total_quantity_kg: 1500,
    per_month_qty_kg: 750,
    total_value: 270000,
    per_month_value: 135000,
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-01-10T10:00:00Z'
  },
  {
    id: 9,
    item_name: 'Guntur Red Chilli Powder 500g',
    item_category: 'Coffee, tea, maté and spices',
    unit: 'PKTS',
    currency: 'INR',
    tariff_line_id: 9,
    hs_code: '0904.22.10',
    tariff_description: 'Chillies crushed or ground (Chilli Powder)',
    general_duty_rate: '30%',
    vat_rate: '18%',
    pal_rate: '10%',
    cess_rate: '15%',
    sscl_rate: '2.5%',
    weight_val: 0.5,
    weight_unit: 'KG',
    is_favorite: true,
    purchase_price: 140.0,
    price_per_kg: 280.0,
    total_quantity_kg: 1800,
    per_month_qty_kg: 900,
    total_value: 504000,
    per_month_value: 252000,
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-01-10T10:00:00Z'
  },
  {
    id: 10,
    item_name: 'Mini Bhakarwadi 200g (Haldiram)',
    item_category: 'Miscellaneous edible preparations (Snacks)',
    unit: 'PKTS',
    currency: 'INR',
    tariff_line_id: 16,
    hs_code: '2106.90.99',
    tariff_description: 'Food preparations not elsewhere specified (Namkeen, Snacks, Murukku)',
    general_duty_rate: '30%',
    vat_rate: '18%',
    pal_rate: '10%',
    cess_rate: '15%',
    sscl_rate: '2.5%',
    weight_val: 0.2,
    weight_unit: 'KG',
    is_favorite: true,
    purchase_price: 45.0,
    price_per_kg: 225.0,
    total_quantity_kg: 800,
    per_month_qty_kg: 400,
    total_value: 180000,
    per_month_value: 90000,
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-01-10T10:00:00Z'
  },
  {
    id: 11,
    item_name: 'Navratan Mix 200g (Haldiram)',
    item_category: 'Miscellaneous edible preparations (Snacks)',
    unit: 'PKTS',
    currency: 'INR',
    tariff_line_id: 16,
    hs_code: '2106.90.99',
    tariff_description: 'Food preparations not elsewhere specified (Namkeen, Snacks, Murukku)',
    general_duty_rate: '30%',
    vat_rate: '18%',
    pal_rate: '10%',
    cess_rate: '15%',
    sscl_rate: '2.5%',
    weight_val: 0.2,
    weight_unit: 'KG',
    is_favorite: true,
    purchase_price: 42.0,
    price_per_kg: 210.0,
    total_quantity_kg: 1000,
    per_month_qty_kg: 500,
    total_value: 210000,
    per_month_value: 105000,
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-01-10T10:00:00Z'
  },
  {
    id: 12,
    item_name: 'Chings Schezwan Chutney 590g',
    item_category: 'Miscellaneous edible preparations (Sauces & Condiments)',
    unit: 'BOTTLES',
    currency: 'INR',
    tariff_line_id: 17,
    hs_code: '2103.90.90',
    tariff_description: 'Sauces and preparations therefor (Schezwan Chutney, Cooking Pastes)',
    general_duty_rate: '25%',
    vat_rate: '18%',
    pal_rate: '10%',
    cess_rate: '15%',
    sscl_rate: '2.5%',
    weight_val: 0.59,
    weight_unit: 'KG',
    is_favorite: true,
    purchase_price: 115.0,
    price_per_kg: 194.9,
    total_quantity_kg: 600,
    per_month_qty_kg: 300,
    total_value: 116940,
    per_month_value: 58470,
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-01-10T10:00:00Z'
  }
];

// ── Initial Seed Import Logs ──────────────────────────────────────────────
export const INITIAL_IMPORT_LOGS: ImportLog[] = [
  {
    id: 1,
    filename: 'Tariff_Chap_01_Live_Animals.pdf',
    status: 'SUCCESS',
    rows_extracted: 32,
    errors: [],
    imported_at: '2026-03-01T09:00:00Z'
  },
  {
    id: 2,
    filename: 'Tariff_Chap_04_Dairy_Honey.pdf',
    status: 'SUCCESS',
    rows_extracted: 48,
    errors: [],
    imported_at: '2026-03-01T09:05:00Z'
  },
  {
    id: 3,
    filename: 'Tariff_Chap_07_Edible_Vegetables.pdf',
    status: 'SUCCESS',
    rows_extracted: 86,
    errors: [],
    imported_at: '2026-03-01T09:10:00Z'
  },
  {
    id: 4,
    filename: 'Tariff_Chap_09_Coffee_Tea_Spices.pdf',
    status: 'SUCCESS',
    rows_extracted: 110,
    errors: [],
    imported_at: '2026-03-01T09:15:00Z'
  },
  {
    id: 5,
    filename: 'Tariff_Chap_10_Cereals_Rice.pdf',
    status: 'SUCCESS',
    rows_extracted: 75,
    errors: [],
    imported_at: '2026-03-01T09:20:00Z'
  }
];

// ── Initial Seed Shipments (Demonstration multi-stage shipments) ───────────
export const INITIAL_SHIPMENTS: Shipment[] = [
  {
    id: 1,
    shipment_no: 'AEC/1001/2026-27',
    sequence_number: 1001,
    financial_year: '2026-27',
    shipment_date: '2026-03-10',
    status: 'CONFIGURED',
    current_stage: '4_PRICING_CALCULATION',
    destination: 'Colombo Port, Sri Lanka',
    currency: 'LKR',
    usd_rate: 305.0,
    lkr_inr_rate: 3.65,
    profit_margin_pct: 15.0,
    indian_invoice_margin_pct: 5.0,
    colombo_invoice_margin_pct: 12.0,
    margin_mode: 'MARGIN_ON_REVENUE',
    common_expenses_inr: 25000,
    common_expenses_lkr: 91250,
    port_expenses_lkr: 45000,
    freight_allocation_mode: 'WEIGHT',
    notes: 'Primary consolidation container for Lanka Retail and Ceylon Spices covering Basmati rice, Ghee, and Dhal.',
    created_at: '2026-03-01T10:00:00Z',
    updated_at: '2026-03-10T15:30:00Z',
    customers: [
      INITIAL_CUSTOMERS[0], // Lanka Retail Distributors
      INITIAL_CUSTOMERS[1], // Ceylon Spices & Agri Ltd
    ],
    requirements: [
      {
        id: 1,
        shipment_id: 1,
        customer_id: 1,
        product_name: 'Ragi (Finger Millet)',
        hsn_code: '1008.29.20',
        required_quantity: 120,
        unit: 'CTNS',
        notes: 'Target delivery before end of month',
        created_at: '2026-03-01T10:15:00Z',
        updated_at: '2026-03-01T10:15:00Z',
        customer: INITIAL_CUSTOMERS[0]
      },
      {
        id: 2,
        shipment_id: 1,
        customer_id: 2,
        product_name: 'Basmati Rice Premium',
        hsn_code: '1006.30.11',
        required_quantity: 80,
        unit: 'BAGS',
        notes: 'Long grain 1121 steam quality',
        created_at: '2026-03-01T10:20:00Z',
        updated_at: '2026-03-01T10:20:00Z',
        customer: INITIAL_CUSTOMERS[1]
      },
      {
        id: 3,
        shipment_id: 1,
        customer_id: 1,
        product_name: 'Toor Dhal Premium',
        hsn_code: '0713.60.10',
        required_quantity: 150,
        unit: 'BAGS',
        notes: 'Double polished fatka dhal',
        created_at: '2026-03-01T10:30:00Z',
        updated_at: '2026-03-01T10:30:00Z',
        customer: INITIAL_CUSTOMERS[0]
      }
    ],
    allocations: [
      {
        id: 1,
        shipment_id: 1,
        requirement_id: 1,
        vendor_id: 1, // India Grain Exporters
        allocated_quantity: 120,
        allocated_unit: 'CTNS',
        status: 'PI_RECEIVED',
        notes: 'Allocated to IGE Mumbai',
        created_at: '2026-03-02T11:00:00Z',
        updated_at: '2026-03-02T11:00:00Z',
        vendor: INITIAL_VENDORS[0]
      },
      {
        id: 2,
        shipment_id: 1,
        requirement_id: 2,
        vendor_id: 1, // India Grain Exporters
        allocated_quantity: 80,
        allocated_unit: 'BAGS',
        status: 'PI_RECEIVED',
        notes: 'Allocated to IGE Mumbai',
        created_at: '2026-03-02T11:05:00Z',
        updated_at: '2026-03-02T11:05:00Z',
        vendor: INITIAL_VENDORS[0]
      },
      {
        id: 3,
        shipment_id: 1,
        requirement_id: 3,
        vendor_id: 2, // Apex Mills India
        allocated_quantity: 150,
        allocated_unit: 'BAGS',
        status: 'PI_RECEIVED',
        notes: 'Allocated to Apex Ahmedabad',
        created_at: '2026-03-02T11:10:00Z',
        updated_at: '2026-03-02T11:10:00Z',
        vendor: INITIAL_VENDORS[1]
      }
    ],
    proforma_items: [
      {
        id: 1,
        shipment_id: 1,
        allocation_id: 1,
        vendor_id: 1,
        product_name: 'Ragi (Finger Millet)',
        sku: 'IGE-RAGI-01',
        hsn_code: '1008.29.20',
        proforma_qty: 120,
        cartons_count: 120,
        units_per_carton: 10,
        unit_weight_val: 1.0,
        unit_weight_unit: 'KG',
        net_weight_kg: 1200,
        gross_weight_kg: 1250,
        proforma_price: 75.0,
        mrp: 95.0,
        discount_pct: 0,
        gst_pct: 5.0,
        total_payable: 94500,
        currency: 'INR',
        created_at: '2026-03-03T09:00:00Z',
        vendor: INITIAL_VENDORS[0]
      },
      {
        id: 2,
        shipment_id: 1,
        allocation_id: 2,
        vendor_id: 1,
        product_name: 'Basmati Rice Premium 1121',
        sku: 'IGE-BAS-1121',
        hsn_code: '1006.30.11',
        proforma_qty: 80,
        cartons_count: 80,
        units_per_carton: 5,
        unit_weight_val: 5.0,
        unit_weight_unit: 'KG',
        net_weight_kg: 2000,
        gross_weight_kg: 2040,
        proforma_price: 480.0,
        mrp: 600.0,
        discount_pct: 2.0,
        gst_pct: 5.0,
        total_payable: 399168,
        currency: 'INR',
        created_at: '2026-03-03T09:15:00Z',
        vendor: INITIAL_VENDORS[0]
      },
      {
        id: 3,
        shipment_id: 1,
        allocation_id: 3,
        vendor_id: 2,
        product_name: 'Toor Dhal Premium (Double Polished)',
        sku: 'AMI-TOOR-01',
        hsn_code: '0713.60.10',
        proforma_qty: 150,
        cartons_count: 150,
        units_per_carton: 10,
        unit_weight_val: 1.0,
        unit_weight_unit: 'KG',
        net_weight_kg: 1500,
        gross_weight_kg: 1530,
        proforma_price: 135.0,
        mrp: 160.0,
        discount_pct: 0,
        gst_pct: 5.0,
        total_payable: 212625,
        currency: 'INR',
        created_at: '2026-03-03T09:30:00Z',
        vendor: INITIAL_VENDORS[1]
      }
    ],
    products: [
      {
        id: 1,
        shipment_id: 1,
        customer_id: 1,
        customer_name: 'Lanka Retail Distributors',
        product_name: 'Ragi (Finger Millet)',
        product_category: 'Cereals & Grains',
        hsn_code: '1008.29.20',
        quantity: 120,
        unit: 'CTNS',
        weight_val: 10,
        weight_unit: 'KG',
        net_weight_kg: 1200,
        gross_weight_kg: 1250,
        purchase_price: 750.0,
        currency: 'INR',
        base_price_lkr: 2737.5,
        freight_allocation_lkr: 23297.87,
        port_charges_lkr: 11489.36,
        cnf_price: 2931.65,
        general_duty_rate: '15%',
        vat_rate: '18%',
        pal_rate: 'Ex',
        cess_rate: '10%',
        sscl_rate: '2.5%',
        calculated_duty_lkr: 1245.56,
        total_cost_lkr: 4272.95,
        suggested_price: 5027.0,
        final_quotation_price: 5027.0,
        discount_lkr: 0,
        set_price_lkr: 5027.0,
        short_qty: 0,
        short_amt_lkr: 0,
        net_settlement_lkr: 603240.0,
        predicted_profit: 90486.0,
        indian_price: 750.0,
        srilankan_price: 5027.0,
        is_active: true
      },
      {
        id: 2,
        shipment_id: 1,
        customer_id: 2,
        customer_name: 'Ceylon Spices & Agri Ltd',
        product_name: 'Basmati Rice Premium 1121',
        product_category: 'Cereals & Grains',
        hsn_code: '1006.30.11',
        quantity: 80,
        unit: 'BAGS',
        weight_val: 25,
        weight_unit: 'KG',
        net_weight_kg: 2000,
        gross_weight_kg: 2040,
        purchase_price: 2400.0,
        currency: 'INR',
        base_price_lkr: 8760.0,
        freight_allocation_lkr: 38829.79,
        port_charges_lkr: 19148.94,
        cnf_price: 9245.37,
        general_duty_rate: '15%',
        vat_rate: '18%',
        pal_rate: 'Ex',
        cess_rate: '10%',
        sscl_rate: '2.5%',
        calculated_duty_lkr: 3985.8,
        total_cost_lkr: 13470.53,
        suggested_price: 15847.68,
        final_quotation_price: 15850.0,
        discount_lkr: 50.0,
        set_price_lkr: 15800.0,
        short_qty: 0,
        short_amt_lkr: 0,
        net_settlement_lkr: 1264000.0,
        predicted_profit: 186357.6,
        indian_price: 2400.0,
        srilankan_price: 15850.0,
        is_active: true
      },
      {
        id: 3,
        shipment_id: 1,
        customer_id: 1,
        customer_name: 'Lanka Retail Distributors',
        product_name: 'Toor Dhal Premium',
        product_category: 'Pulses & Dhals',
        hsn_code: '0713.60.10',
        quantity: 150,
        unit: 'BAGS',
        weight_val: 10,
        weight_unit: 'KG',
        net_weight_kg: 1500,
        gross_weight_kg: 1530,
        purchase_price: 1350.0,
        currency: 'INR',
        base_price_lkr: 4927.5,
        freight_allocation_lkr: 29122.34,
        port_charges_lkr: 14361.70,
        cnf_price: 5121.65,
        general_duty_rate: '15%',
        vat_rate: '18%',
        pal_rate: 'Ex',
        cess_rate: '10%',
        sscl_rate: '2.5%',
        calculated_duty_lkr: 2242.01,
        total_cost_lkr: 7459.41,
        suggested_price: 8775.78,
        final_quotation_price: 8780.0,
        discount_lkr: 0,
        set_price_lkr: 8780.0,
        short_qty: 0,
        short_amt_lkr: 0,
        net_settlement_lkr: 1317000.0,
        predicted_profit: 198088.5,
        indian_price: 1350.0,
        srilankan_price: 8780.0,
        is_active: true
      }
    ],
    actuals: {
      id: 1,
      shipment_id: 1,
      actual_duty_inr: 228000,
      actual_duty_lkr: 832200,
      actual_cost_inr: 720000,
      actual_cost_lkr: 2628000,
      actual_revenue_inr: 872000,
      actual_revenue_lkr: 3184240,
      actual_profit_lkr: 474932.1,
      ocr_source_file: 'SriLanka_Customs_CusDec_AEC1001.pdf',
      notes: 'Customs clearance processed smoothly through green channel at Colombo Port.',
      updated_at: '2026-03-12T16:00:00Z'
    }
  },
  {
    id: 2,
    shipment_no: 'AEC/1002/2026-27',
    sequence_number: 1002,
    financial_year: '2026-27',
    shipment_date: '2026-03-18',
    status: 'DRAFT',
    current_stage: '1_CUSTOMER_REQUIREMENTS',
    destination: 'Colombo Port, Sri Lanka',
    currency: 'LKR',
    usd_rate: 305.0,
    lkr_inr_rate: 3.65,
    profit_margin_pct: 18.0,
    indian_invoice_margin_pct: 5.0,
    colombo_invoice_margin_pct: 12.0,
    margin_mode: 'MARGIN_ON_REVENUE',
    common_expenses_inr: 18000,
    common_expenses_lkr: 65700,
    port_expenses_lkr: 38000,
    freight_allocation_mode: 'WEIGHT',
    notes: 'Spice and Snacks consignment for Colombo Trade Hub and Southern Spice.',
    created_at: '2026-03-15T11:00:00Z',
    updated_at: '2026-03-18T10:00:00Z',
    customers: [
      INITIAL_CUSTOMERS[2], // Colombo Trade Hub Ltd
      INITIAL_CUSTOMERS[4], // Southern Spice & Provisions
    ],
    requirements: [
      {
        id: 4,
        shipment_id: 2,
        customer_id: 3,
        product_name: 'Green Cardamom 8mm Bold',
        hsn_code: '0908.32.90',
        required_quantity: 200,
        unit: 'PKTS',
        notes: 'Top grade export cardamom in airtight foil packs',
        created_at: '2026-03-15T11:15:00Z',
        updated_at: '2026-03-15T11:15:00Z',
        customer: INITIAL_CUSTOMERS[2]
      },
      {
        id: 5,
        shipment_id: 2,
        customer_id: 5,
        product_name: 'Mini Bhakarwadi 200g (Haldiram)',
        hsn_code: '2106.90.99',
        required_quantity: 500,
        unit: 'PKTS',
        notes: 'Crispy snacks, 6 months expiry',
        created_at: '2026-03-15T11:30:00Z',
        updated_at: '2026-03-15T11:30:00Z',
        customer: INITIAL_CUSTOMERS[4]
      }
    ],
    allocations: [],
    proforma_items: [],
    products: []
  }
];


function getStored<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultVal;
    return JSON.parse(raw);
  } catch {
    return defaultVal;
  }
}

function setStored<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.warn(`Failed to persist key ${key} to localStorage:`, err);
  }
}

export class MockStorage {
  static getChapters(): Chapter[] {
    return getStored<Chapter[]>(STORAGE_KEYS.CHAPTERS, INITIAL_CHAPTERS);
  }
  static setChapters(val: Chapter[]) {
    setStored(STORAGE_KEYS.CHAPTERS, val);
  }

  static getTariffLines(): TariffLine[] {
    return getStored<TariffLine[]>(STORAGE_KEYS.TARIFF_LINES, INITIAL_TARIFF_LINES);
  }
  static setTariffLines(val: TariffLine[]) {
    setStored(STORAGE_KEYS.TARIFF_LINES, val);
  }

  static getItemEntries(): ItemEntry[] {
    return getStored<ItemEntry[]>(STORAGE_KEYS.ITEM_ENTRIES, INITIAL_ITEM_ENTRIES);
  }
  static setItemEntries(val: ItemEntry[]) {
    setStored(STORAGE_KEYS.ITEM_ENTRIES, val);
  }

  static getCustomers(): Customer[] {
    return getStored<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
  }
  static setCustomers(val: Customer[]) {
    setStored(STORAGE_KEYS.CUSTOMERS, val);
  }

  static getVendors(): Vendor[] {
    return getStored<Vendor[]>(STORAGE_KEYS.VENDORS, INITIAL_VENDORS);
  }
  static setVendors(val: Vendor[]) {
    setStored(STORAGE_KEYS.VENDORS, val);
  }

  static getShipments(): Shipment[] {
    return getStored<Shipment[]>(STORAGE_KEYS.SHIPMENTS, INITIAL_SHIPMENTS);
  }
  static setShipments(val: Shipment[]) {
    setStored(STORAGE_KEYS.SHIPMENTS, val);
  }

  static getImportLogs(): ImportLog[] {
    return getStored<ImportLog[]>(STORAGE_KEYS.IMPORT_LOGS, INITIAL_IMPORT_LOGS);
  }
  static setImportLogs(val: ImportLog[]) {
    setStored(STORAGE_KEYS.IMPORT_LOGS, val);
  }

  static getVendorPayments(): VendorPayment[] {
    return getStored<VendorPayment[]>(STORAGE_KEYS.VENDOR_PAYMENTS, []);
  }
  static setVendorPayments(val: VendorPayment[]) {
    setStored(STORAGE_KEYS.VENDOR_PAYMENTS, val);
  }

  static getReceivingVerifications(): PhysicalReceivingVerification[] {
    return getStored<PhysicalReceivingVerification[]>(STORAGE_KEYS.RECEIVING_VERIFICATIONS, []);
  }
  static setReceivingVerifications(val: PhysicalReceivingVerification[]) {
    setStored(STORAGE_KEYS.RECEIVING_VERIFICATIONS, val);
  }

  static getPackingLists(): ShipmentPackingList[] {
    return getStored<ShipmentPackingList[]>(STORAGE_KEYS.PACKING_LISTS, []);
  }
  static setPackingLists(val: ShipmentPackingList[]) {
    setStored(STORAGE_KEYS.PACKING_LISTS, val);
  }

  static getQuotationHistory(): QuotationHistoryLog[] {
    return getStored<QuotationHistoryLog[]>(STORAGE_KEYS.QUOTATION_HISTORY, []);
  }
  static setQuotationHistory(val: QuotationHistoryLog[]) {
    setStored(STORAGE_KEYS.QUOTATION_HISTORY, val);
  }

  static resetToDefaults() {
    localStorage.removeItem(STORAGE_KEYS.CHAPTERS);
    localStorage.removeItem(STORAGE_KEYS.TARIFF_LINES);
    localStorage.removeItem(STORAGE_KEYS.ITEM_ENTRIES);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
    localStorage.removeItem(STORAGE_KEYS.VENDORS);
    localStorage.removeItem(STORAGE_KEYS.SHIPMENTS);
    localStorage.removeItem(STORAGE_KEYS.IMPORT_LOGS);
    localStorage.removeItem(STORAGE_KEYS.VENDOR_PAYMENTS);
    localStorage.removeItem(STORAGE_KEYS.RECEIVING_VERIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.PACKING_LISTS);
    localStorage.removeItem(STORAGE_KEYS.QUOTATION_HISTORY);
    localStorage.removeItem(STORAGE_KEYS.NEXT_SHIPMENT_SEQ);

    setStored(STORAGE_KEYS.CHAPTERS, INITIAL_CHAPTERS);
    setStored(STORAGE_KEYS.TARIFF_LINES, INITIAL_TARIFF_LINES);
    setStored(STORAGE_KEYS.ITEM_ENTRIES, INITIAL_ITEM_ENTRIES);
    setStored(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    setStored(STORAGE_KEYS.VENDORS, INITIAL_VENDORS);
    setStored(STORAGE_KEYS.SHIPMENTS, INITIAL_SHIPMENTS);
    setStored(STORAGE_KEYS.IMPORT_LOGS, INITIAL_IMPORT_LOGS);
  }
}
