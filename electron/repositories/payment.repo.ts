import { db } from '../db';
import { getInsertColumns } from '../schemas';

export class PaymentRepo {
  private columns = getInsertColumns('payments');

  private toRow(item: any) {
    return this.columns.map(col => item[col] !== undefined ? item[col] : null);
  }

  create(payment: any) {
    const bindList = this.columns.map(() => '?').join(', ');
    const statement = db.prepare(`
      INSERT INTO payments (${this.columns.join(', ')})
      VALUES (${bindList})
    `);

    return statement.run(...this.toRow(payment));
  }

  insertMany(payments: any[]) {
    const bindList = this.columns.map(() => '?').join(', ');
    const statement = db.prepare(`
      INSERT INTO payments (${this.columns.join(', ')})
      VALUES (${bindList})
    `);

    const insertManyTx = db.transaction((rows: any[]) => {
      for (const row of rows) {
        statement.run(...this.toRow(row));
      }
      return { success: true };
    });

    try {
      const result = insertManyTx(payments);
      return {
        success: true,
        message: 'Inserted successfully',
        result
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Failed to insert payments',
      };
    }
  }

  getAll() {
    return db.prepare('SELECT * FROM payments ORDER BY id DESC').all();
  }

  getById(id: number) {
    return db.prepare('SELECT * FROM payments WHERE id = ?').get(id);
  }

  getBySubOrderNum(sub_order_num: string) {
    return db.prepare('SELECT * FROM payments WHERE sub_order_no = ?').get(sub_order_num);
  }

  update(payment: any) {
    return db.prepare(`
      UPDATE payments
      SET sub_order_no = ?, order_date = ?, dispatch_date = ?, product_name = ?, supplier_sku = ?, catalog_id = ?,
      order_source = ?, live_order_status = ?, product_gst_percent = ?, listing_price_incl_taxes = ?,
      quantity = ?, transaction_id = ?, payment_date = ?, final_settlement_amount = ?, price_type = ?,
      total_sale_amount_incl_shipping_gst = ?, total_sale_return_amount_incl_shipping_gst = ?,
      fixed_fee_incl_gst = ?, warehousing_fee_incl_gst = ?, return_premium_incl_gst = ?,
      return_premium_incl_gst_of_return = ?, meesho_commission_percentage = ?, meesho_commission_incl_gst = ?,
      meesho_gold_platform_fee_incl_gst = ?, meesho_mall_platform_fee_incl_gst = ?,
      fixed_fee_incl_gst_return = ?, warehousing_fee_incl_gst_return = ?,
      return_shipping_charge_incl_gst = ?, gst_compensation_prp_shipping = ?, shipping_charge_incl_gst = ?,
      other_support_service_charges_excl_gst = ?, waivers_excl_gst = ?,
      net_other_support_service_charges_excl_gst = ?, gst_on_net_other_support_service_charges = ?,
      tcs = ?, tds_rate_percent = ?, tds = ?, compensation = ?, claims = ?, recovery = ?,
      compensation_reason = ?, claims_reason = ?, recovery_reason = ?
      WHERE id = ?
    `).run(
      payment.sub_order_no || null,
      payment.order_date || null,
      payment.dispatch_date || null,
      payment.product_name || null,
      payment.supplier_sku || null,
      payment.catalog_id || null,
      payment.order_source || null,
      payment.live_order_status || null,
      payment.product_gst_percent || null,
      payment.listing_price_incl_taxes || null,
      payment.quantity || null,
      payment.transaction_id || null,
      payment.payment_date || null,
      payment.final_settlement_amount || null,
      payment.price_type || null,
      payment.total_sale_amount_incl_shipping_gst || null,
      payment.total_sale_return_amount_incl_shipping_gst || null,
      payment.fixed_fee_incl_gst || null,
      payment.warehousing_fee_incl_gst || null,
      payment.return_premium_incl_gst || null,
      payment.return_premium_incl_gst_of_return || null,
      payment.meesho_commission_percentage || null,
      payment.meesho_commission_incl_gst || null,
      payment.meesho_gold_platform_fee_incl_gst || null,
      payment.meesho_mall_platform_fee_incl_gst || null,
      payment.fixed_fee_incl_gst_return || null,
      payment.warehousing_fee_incl_gst_return || null,
      payment.return_shipping_charge_incl_gst || null,
      payment.gst_compensation_prp_shipping || null,
      payment.shipping_charge_incl_gst || null,
      payment.other_support_service_charges_excl_gst || null,
      payment.waivers_excl_gst || null,
      payment.net_other_support_service_charges_excl_gst || null,
      payment.gst_on_net_other_support_service_charges || null,
      payment.tcs || null,
      payment.tds_rate_percent || null,
      payment.tds || null,
      payment.compensation || null,
      payment.claims || null,
      payment.recovery || null,
      payment.compensation_reason || null,
      payment.claims_reason || null,
      payment.recovery_reason || null,
      payment.id
    );
  }

  delete(id: number) {
    return db.prepare('DELETE FROM payments WHERE id = ?').run(id);
  }

  search(keyword: string) {
    const likeKeyword = `%${keyword}%`;
    return db.prepare(`
      SELECT * FROM payments
      WHERE sub_order_no LIKE ? OR transaction_id LIKE ? OR product_name LIKE ? OR supplier_sku LIKE ?
    `).all(likeKeyword, likeKeyword, likeKeyword, likeKeyword);
  }

  filter(filters: any) {
    return db.prepare(`SELECT * FROM payments 
      WHERE strftime('%Y', order_date) = ?
      AND strftime('%m', order_date) = ?;
    `).all(filters.financial_year, filters.month_number);
  }

}
