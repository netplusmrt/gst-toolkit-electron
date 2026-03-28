import { db } from '../db';
import { getInsertColumns, getColumnList, getPlaceholders } from '../schemas';

export class TcsSalesRepo {

  create(tcs_sale: any) {
    const insertColumns = getInsertColumns('tcs_sales').filter(col => col !== 'status');
    const statement = db.prepare(`
      INSERT INTO tcs_sales (${insertColumns.join(', ')})
      VALUES (${getPlaceholders(insertColumns.length)})
    `);

    return statement.run(
      tcs_sale.identifier || null,
      tcs_sale.sup_name || null,
      tcs_sale.gstin || null,
      tcs_sale.sub_order_num || null,
      tcs_sale.order_date || null,
      tcs_sale.hsn_code || null,
      tcs_sale.quantity || null,
      tcs_sale.gst_rate || null,
      tcs_sale.total_taxable_sale_value || null,
      tcs_sale.tax_amount || null,
      tcs_sale.total_invoice_value || null,
      tcs_sale.taxable_shipping || null,
      tcs_sale.end_customer_state_new || null,
      tcs_sale.enrollment_no || null,
      tcs_sale.financial_year || null,
      tcs_sale.month_number || null,
      tcs_sale.supplier_id || null
    );
  }

  insertMany(tcs_sales: any[]) {
    const insertColumns = getInsertColumns('tcs_sales').filter(col => col !== 'status');
    const statement = db.prepare(`
      INSERT INTO tcs_sales (${insertColumns.join(', ')})
      VALUES (${getPlaceholders(insertColumns.length)})
    `);

    const checkStmt = db.prepare(`
      SELECT sub_order_num
      FROM tcs_sales
      WHERE sub_order_num = ?
    `);

    const insertMany = db.transaction((tcs_sales: any[]) => {
      const duplicateSubOrders: string[] = [];
      const seenInFile = new Set<string>();

      // 🔹 Step 1: Check duplicates (DB + File)
      for (const row of tcs_sales) {

        const subOrder = row.sub_order_num;

        if (!subOrder) continue;

        // ✅ Check duplicate inside Excel file itself
        if (seenInFile.has(subOrder)) {
          duplicateSubOrders.push(subOrder);
          continue;
        }
        seenInFile.add(subOrder);

        // ✅ Check duplicate in DB
        const exists = checkStmt.get(subOrder);
        if (exists) {
          duplicateSubOrders.push(subOrder);
        }
      }

      // 🔴 If duplicates found → rollback
      if (duplicateSubOrders.length > 0) {
        throw new Error(JSON.stringify({
          message: 'Duplicate sub_order_num found',
          duplicates: [...new Set(duplicateSubOrders)]
        }));
      }

      for (const tcs_sale of tcs_sales) {
        statement.run(
          tcs_sale.identifier || null,
          tcs_sale.sup_name || null,
          tcs_sale.gstin || null,
          tcs_sale.sub_order_num || null,
          tcs_sale.order_date || null,
          tcs_sale.hsn_code || null,
          tcs_sale.quantity || null,
          tcs_sale.gst_rate || null,
          tcs_sale.total_taxable_sale_value || null,
          tcs_sale.tax_amount || null,
          tcs_sale.total_invoice_value || null,
          tcs_sale.taxable_shipping || null,
          tcs_sale.end_customer_state_new || null,
          tcs_sale.enrollment_no || null,
          tcs_sale.financial_year || null,
          tcs_sale.month_number || null,
          tcs_sale.supplier_id || null
        );
      }
    });

    try {
      const result = insertMany(tcs_sales);
      console.log('Inserted successfully:', result);
      return {
        success: true,
        message: "Inserted successfully"
      };
    } catch (err: any) {

      const error = JSON.parse(err.message);

      console.error('Duplicates found:', error.duplicates);

      return {
        success: false,
        message: error.message,
        duplicates: error.duplicates
      };
    }
  }

  getAll() {
    return db.prepare('SELECT * FROM tcs_sales ORDER BY id DESC').all();
  }

  getById(id: number) {
    return db.prepare('SELECT * FROM tcs_sales WHERE id = ?').get(id);
  }

  getBySubOrderNum(sub_order_num: string) {
    return db.prepare('SELECT * FROM tcs_sales WHERE sub_order_num = ?').get(sub_order_num);
  }

  update(sale: any) {
    return db.prepare(`
      UPDATE tcs_sales
      SET identifier = ?, sup_name = ?, gstin = ?, sub_order_num = ?, order_date = ?,
      hsn_code = ?, quantity = ?, gst_rate = ?, total_taxable_sale_value = ?,
      tax_amount = ?, total_invoice_value = ?, taxable_shipping = ?,
      end_customer_state_new = ?, enrollment_no = ?,
      financial_year = ?, month_number = ?, supplier_id = ?
      WHERE id = ?
    `).run(
      sale.identifier || null,
      sale.sup_name || null,
      sale.gstin || null,
      sale.sub_order_num || null,
      sale.order_date || null,
      sale.hsn_code || null,
      sale.quantity || null,
      sale.gst_rate || null,
      sale.total_taxable_sale_value || null,
      sale.tax_amount || null,
      sale.total_invoice_value || null,
      sale.taxable_shipping || null,
      sale.end_customer_state_new || null,
      sale.enrollment_no || null,
      sale.financial_year || null,
      sale.month_number || null,
      sale.supplier_id || null,
      sale.id
    );
  }

  delete(id: number) {
    return db.prepare('DELETE FROM tcs_sales WHERE id = ?').run(id);
  }

  search(keyword: string) {
    return db.prepare(`
      SELECT * FROM tcs_sales
      WHERE identifier LIKE ? OR sup_name LIKE ? OR gstin LIKE ?
    `).all(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
  }

  filter(filters: any) {
    let query = 'SELECT * FROM tcs_sales WHERE gstin=? and financial_year=? and month_number=?';
    const params: any[] = [
      filters.gstin,
      filters.financial_year,
      filters.month_number
    ];

    return db.prepare(query).all(...params);
  }

  getSalesWithReturnAndPayment(filters: any) {
    const sql = `
      SELECT s.*,
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
      LEFT JOIN
        tcs_sales_return r ON r.sub_order_num = s.sub_order_num
      LEFT JOIN
        payments p ON p.sub_order_no = s.sub_order_num
      WHERE s.gstin = ? AND
        s.financial_year = ? AND
        s.month_number = ?
      ORDER BY s.order_date DESC;
    `;
    return db.prepare(sql).all(filters.gstin, filters.financial_year, filters.month_number);
  }
}