import { db } from '../db';

export class ReportsRepo {
  /**
   * Combined TCS sales, return, and payment information for reporting.
   * Filters are optional: gstin, financial_year, month_number, fromDate, toDate
   */
  getTcsSalesWithReturnAndPayment(filters: any = {}) {
    const conditions: string[] = [];
    const params: any[] = [];

    if (filters.gstin) {
      conditions.push('s.gstin = ?');
      params.push(filters.gstin);
    }
    if (filters.financial_year) {
      conditions.push('s.financial_year = ?');
      params.push(filters.financial_year);
    }
    if (filters.month_number != null) {
      conditions.push('s.month_number = ?');
      params.push(filters.month_number);
    }
    if (filters.fromDate) {
      conditions.push('DATE(s.order_date) >= DATE(?)');
      params.push(filters.fromDate);
    }
    if (filters.toDate) {
      conditions.push('DATE(s.order_date) <= DATE(?)');
      params.push(filters.toDate);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT
        s.*, 
        r.total_invoice_value AS return_total_value,
        r.cancel_return_date,
        CASE WHEN r.total_invoice_value IS NOT NULL THEN 'Returned' ELSE 'Not Returned' END AS return_status,
        p.product_name,
        p.final_settlement_amount AS payment_amount,
        p.payment_date,
        p.live_order_status,
        p.total_sale_amount_incl_shipping_gst,
        p.total_sale_return_amount_incl_shipping_gst,
        CASE WHEN p.final_settlement_amount IS NOT NULL THEN 'Paid' ELSE 'Pending' END AS payment_status
      FROM tcs_sales s
      LEFT JOIN tcs_sales_return r ON r.sub_order_num = s.sub_order_num
      LEFT JOIN payments p ON p.sub_order_no = s.sub_order_num
      ${where}
      ORDER BY s.order_date DESC
    `;

    return db.prepare(sql).all(...params);
  }

  getDateWiseSalesReport(filters: any) {
    const sql = `
      WITH sales_by_date AS (
        SELECT
          DATE(order_date) AS order_date,
          COUNT(DISTINCT sub_order_num) AS total_orders,
          SUM(total_invoice_value) AS total_sales_value
        FROM tcs_sales
        WHERE gstin = ?
          AND financial_year = ?
          AND month_number = ?
        GROUP BY DATE(order_date)
      ),
      returns_by_date AS (
        SELECT
          DATE(r.cancel_return_date) AS return_date,
          SUM(COALESCE(r.total_invoice_value, 0)) AS total_return_value,
          SUM(COALESCE(r.quantity, 0)) AS total_return_quantity
        FROM tcs_sales_return r
        WHERE r.gstin = ?
          AND r.financial_year = ?
          AND r.month_number = ?
          AND r.cancel_return_date IS NOT NULL
        GROUP BY DATE(r.cancel_return_date)
      ),
      payments_by_date AS (
        SELECT
          DATE(p.payment_date) AS payment_date,
          SUM(COALESCE(p.final_settlement_amount, 0)) AS total_payment_received,
          SUM(COALESCE(p.meesho_commission_incl_gst, 0) +
              COALESCE(p.meesho_gold_platform_fee_incl_gst, 0) +
              COALESCE(p.meesho_mall_platform_fee_incl_gst, 0) +
              COALESCE(p.fixed_fee_incl_gst, 0) +
              COALESCE(p.warehousing_fee_incl_gst, 0) +
              COALESCE(p.return_shipping_charge_incl_gst, 0) +
              COALESCE(p.gst_compensation_prp_shipping, 0) +
              COALESCE(p.shipping_charge_incl_gst, 0)) AS total_deductions,
          SUM(COALESCE(p.other_support_service_charges_excl_gst, 0) +
              COALESCE(p.waivers_excl_gst, 0) +
              COALESCE(p.net_other_support_service_charges_excl_gst, 0) +
              COALESCE(p.gst_on_net_other_support_service_charges, 0)) AS total_other_charges
        FROM payments p
        WHERE strftime('%Y', payment_date) = ? /** financial_year */
        AND strftime('%m', payment_date) = ?
        AND p.payment_date IS NOT NULL
        GROUP BY DATE(p.payment_date)
      ),
      ads_by_date AS (
        SELECT
          DATE(deduction_date) AS order_date,
          SUM(COALESCE(total_ads_cost, 0)) AS total_ads_cost
        FROM ads_cost
        GROUP BY DATE(deduction_date)
      )
      SELECT
        sd.order_date,
        sd.total_orders,
        sd.total_sales_value,
        COALESCE(rb.total_return_value, 0) AS total_return_value,
        COALESCE(rb.total_return_quantity, 0) AS total_return_quantity,
        COALESCE(pb.total_payment_received, 0) AS total_payment_received,
        COALESCE(pb.total_deductions, 0) AS total_deductions,
        COALESCE(pb.total_other_charges, 0) AS total_other_charges,
        COALESCE(ab.total_ads_cost, 0) AS total_ads_cost,
        sd.total_sales_value - COALESCE(rb.total_return_value, 0) AS net_sales,
        COALESCE(pb.total_payment_received, 0) + COALESCE(ab.total_ads_cost, 0) + COALESCE(pb.total_deductions, 0) + COALESCE(pb.total_other_charges, 0) AS net_collection
      FROM sales_by_date sd
      LEFT JOIN returns_by_date rb ON rb.return_date = sd.order_date
      LEFT JOIN payments_by_date pb ON pb.payment_date = sd.order_date
      LEFT JOIN ads_by_date ab ON ab.order_date = sd.order_date
      ORDER BY sd.order_date ASC;
    `;

    return db.prepare(sql).all(
      filters.gstin,
      filters.financial_year,
      filters.month_number,
      filters.gstin,
      filters.financial_year,
      filters.month_number,
      filters.financial_year,
      filters.month_number
    );
  }

  getMonthlySalesReport(filters: any) {
    const sql = `
      SELECT 
        s.financial_year,
        s.month_number,

        COUNT(DISTINCT s.sub_order_num) AS total_orders,
        SUM(s.total_invoice_value) AS total_sales_value,
        SUM(COALESCE(r.total_invoice_value, 0)) AS total_return_value,
        SUM(COALESCE(r.quantity, 0)) AS total_return_quantity,
        SUM(COALESCE(p.payment_amount, 0)) AS total_payment_received,

        SUM(s.total_invoice_value)
          - SUM(COALESCE(r.total_invoice_value, 0)) AS net_sales,

        SUM(COALESCE(p.payment_amount, 0))
          - SUM(COALESCE(r.total_invoice_value, 0)) AS net_collection

      FROM tcs_sales s

      LEFT JOIN tcs_sales_return r 
        ON r.sub_order_num = s.sub_order_num

      LEFT JOIN (
        SELECT 
          sub_order_no,
          SUM(final_settlement_amount) AS payment_amount
        FROM payments
        GROUP BY sub_order_no
      ) p 
        ON p.sub_order_no = s.sub_order_num

      WHERE 
        s.gstin = ?
        AND s.financial_year = ?

      GROUP BY 
        s.financial_year, 
        s.month_number

      ORDER BY 
        s.month_number ASC;
    `;

    return db.prepare(sql).all(
      filters.gstin,
      filters.financial_year
    );
  }

  getTaxInvoiceDetailsReport(filters: any = {}) {
    const conditions: string[] = [];
    const params: any[] = [];

    if (filters.type) {
      conditions.push('type = ?');
      params.push(filters.type);
    }
    if (filters.fromDate) {
      conditions.push('DATE(order_date) >= DATE(?)');
      params.push(filters.fromDate);
    }
    if (filters.toDate) {
      conditions.push('DATE(order_date) <= DATE(?)');
      params.push(filters.toDate);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `SELECT * FROM tax_invoice_details ${where} ORDER BY order_date DESC`;

    return db.prepare(sql).all(...params);
  }

  getPaymentsReport(filters: any = {}) {
    const conditions: string[] = [];
    const params: any[] = [];

    if (filters.fromDate) {
      conditions.push('DATE(payment_date) >= DATE(?)');
      params.push(filters.fromDate);
    }
    if (filters.toDate) {
      conditions.push('DATE(payment_date) <= DATE(?)');
      params.push(filters.toDate);
    }
    if (filters.order_source) {
      conditions.push('order_source = ?');
      params.push(filters.order_source);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `SELECT * FROM payments ${where} ORDER BY payment_date DESC`;

    return db.prepare(sql).all(...params);
  }
}
