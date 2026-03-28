import Database from 'better-sqlite3';
import * as path from 'path';
import { app } from 'electron';

export let db: Database;

export function initDb() {
  // const dbPath = path.join(__dirname, 'gst-toolkit.db');
  const dbPath = path.join(process.env['PROGRAMDATA'], 'gst-toolkit.db');
  console.log('Database path:', dbPath);
  db = new Database(dbPath);

  // Create tables
  const version = db.pragma('user_version', { simple: true });

  if (version < 1) {
  }

    db.prepare(`
      CREATE TABLE IF NOT EXISTS parties (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        phone TEXT,
        email TEXT,
        address TEXT,
        gstNumber TEXT NOT NULL,
        createdDate TEXT,
        updatedDate TEXT,
        usedDate TEXT
      )
    `).run();

    db.prepare(`
      CREATE TABLE IF NOT EXISTS tcs_sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        identifier TEXT,
        sup_name TEXT,
        gstin TEXT,
        sub_order_num TEXT UNIQUE,
        order_date TEXT,
        hsn_code TEXT,
        quantity REAL,
        gst_rate REAL,
        total_taxable_sale_value REAL,
        tax_amount REAL,
        total_invoice_value REAL,
        taxable_shipping REAL,
        end_customer_state_new TEXT,
        enrollment_no TEXT,
        financial_year TEXT,
        month_number INTEGER,
        supplier_id TEXT,
        status TEXT
      )
    `).run();

  db.prepare(`
  CREATE TABLE IF NOT EXISTS tcs_sales_return (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    identifier TEXT,
    sup_name TEXT,
    gstin TEXT,
    sub_order_num TEXT UNIQUE,
    order_date TEXT,
    hsn_code TEXT,
    quantity REAL,
    gst_rate REAL,
    total_taxable_sale_value REAL,
    tax_amount REAL,
    total_invoice_value REAL,
    taxable_shipping REAL,
    end_customer_state_new TEXT,
    enrollment_no TEXT,
    cancel_return_date TEXT,
    financial_year TEXT,
    month_number INTEGER,
    supplier_id TEXT
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS tax_invoice_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT,
    order_date TEXT,
    suborder_no TEXT,
    product_description TEXT,
    hsn TEXT,
    invoice_no TEXT,
    createdDate TEXT,
    updatedDate TEXT,
    UNIQUE(suborder_no, type)
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sub_order_no TEXT UNIQUE,
    order_date TEXT,
    dispatch_date TEXT,
    product_name TEXT,
    supplier_sku TEXT,
    catalog_id TEXT,
    order_source TEXT,
    live_order_status TEXT,
    product_gst_percent REAL,
    listing_price_incl_taxes REAL,
    quantity REAL,
    transaction_id TEXT,
    payment_date TEXT,
    final_settlement_amount REAL,
    price_type TEXT,
    total_sale_amount_incl_shipping_gst REAL,
    total_sale_return_amount_incl_shipping_gst REAL,
    fixed_fee_incl_gst REAL,
    warehousing_fee_incl_gst REAL,
    return_premium_incl_gst REAL,
    return_premium_incl_gst_of_return REAL,
    meesho_commission_percentage REAL,
    meesho_commission_incl_gst REAL,
    meesho_gold_platform_fee_incl_gst REAL,
    meesho_mall_platform_fee_incl_gst REAL,
    fixed_fee_incl_gst_return REAL,
    warehousing_fee_incl_gst_return REAL,
    return_shipping_charge_incl_gst REAL,
    gst_compensation_prp_shipping REAL,
    shipping_charge_incl_gst REAL,
    other_support_service_charges_excl_gst REAL,
    waivers_excl_gst REAL,
    net_other_support_service_charges_excl_gst REAL,
    gst_on_net_other_support_service_charges REAL,
    tcs REAL,
    tds_rate_percent REAL,
    tds REAL,
    compensation REAL,
    claims REAL,
    recovery REAL,
    compensation_reason TEXT,
    claims_reason TEXT,
    recovery_reason TEXT
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS ads_cost (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    deduction_duration TEXT,
    deduction_date TEXT,
    campaign_id TEXT,
    ad_cost REAL,
    discounts REAL,
    ad_cost_incl_discounts REAL,
    gst REAL,
    total_ads_cost REAL,
    UNIQUE(deduction_duration, deduction_date, campaign_id, ad_cost)
  )
`).run();

// if (version < 2) {
  // db.prepare(`
  //   ALTER TABLE gstprofiles ADD COLUMN status TEXT
  // `).run();

  // db.pragma('user_version = 2');
// }
}