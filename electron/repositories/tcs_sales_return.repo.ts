import { db } from '../db';
import { getInsertColumns, getColumnList, getPlaceholders } from '../schemas';

export class TcsSalesReturnRepo {

  create(tcs_sale_return: any) {
    const insertColumns = getInsertColumns('tcs_sales_return');
    const statement = db.prepare(`
      INSERT INTO tcs_sales_return (${insertColumns.join(', ')})
      VALUES (${getPlaceholders(insertColumns.length)})
    `);

    return statement.run(
      tcs_sale_return.identifier || null,
      tcs_sale_return.sup_name || null,
      tcs_sale_return.gstin || null,
      tcs_sale_return.sub_order_num || null,
      tcs_sale_return.order_date || null,
      tcs_sale_return.hsn_code || null,
      tcs_sale_return.quantity || null,
      tcs_sale_return.gst_rate || null,
      tcs_sale_return.total_taxable_sale_value || null,
      tcs_sale_return.tax_amount || null,
      tcs_sale_return.total_invoice_value || null,
      tcs_sale_return.taxable_shipping || null,
      tcs_sale_return.end_customer_state_new || null,
      tcs_sale_return.enrollment_no || null,
      tcs_sale_return.cancel_return_date || null,
      tcs_sale_return.financial_year || null,
      tcs_sale_return.month_number || null,
      tcs_sale_return.supplier_id || null
    );
  }

  insertMany(tcs_sales_return: any[]) {
    const insertColumns = getInsertColumns('tcs_sales_return');
    const statement = db.prepare(`
      INSERT INTO tcs_sales_return (${insertColumns.join(', ')})
      VALUES (${getPlaceholders(insertColumns.length)})
    `);

    const checkStmt = db.prepare(`
      SELECT sub_order_num
      FROM tcs_sales_return
      WHERE sub_order_num = ?
    `);

    const insertManyTx = db.transaction((rows: any[]) => {
      const duplicateSubOrders: string[] = [];
      const seenInFile = new Set<string>();

      for (const row of rows) {
        const subOrder = row.sub_order_num;
        if (!subOrder) continue;

        if (seenInFile.has(subOrder)) {
          duplicateSubOrders.push(subOrder);
          continue;
        }
        seenInFile.add(subOrder);

        const exists = checkStmt.get(subOrder);
        if (exists) {
          duplicateSubOrders.push(subOrder);
        }
      }

      if (duplicateSubOrders.length > 0) {
        throw new Error(JSON.stringify({
          message: 'Duplicate sub_order_num found',
          duplicates: [...new Set(duplicateSubOrders)]
        }));
      }

      for (const row of rows) {
        statement.run(
          row.identifier || null,
          row.sup_name || null,
          row.gstin || null,
          row.sub_order_num || null,
          row.order_date || null,
          row.hsn_code || null,
          row.quantity || null,
          row.gst_rate || null,
          row.total_taxable_sale_value || null,
          row.tax_amount || null,
          row.total_invoice_value || null,
          row.taxable_shipping || null,
          row.end_customer_state_new || null,
          row.enrollment_no || null,
          row.cancel_return_date || null,
          row.financial_year || null,
          row.month_number || null,
          row.supplier_id || null
        );
      }
      return { success: true };
    });

    try {
      const result = insertManyTx(tcs_sales_return);
      return {
        success: true,
        message: 'Inserted successfully',
        result
      };
    } catch (err: any) {
      const error = JSON.parse(err.message);
      return {
        success: false,
        message: error.message,
        duplicates: error.duplicates
      };
    }
  }

  getAll() {
    return db.prepare('SELECT * FROM tcs_sales_return ORDER BY id DESC').all();
  }

  getById(id: number) {
    return db.prepare('SELECT * FROM tcs_sales_return WHERE id = ?').get(id);
  }

  getBySubOrderNum(sub_order_num: string) {
    return db.prepare('SELECT * FROM tcs_sales_return WHERE sub_order_num = ?').get(sub_order_num);
  }

  sub_order_numExists(sub_order_num: string) {
    return db.prepare('SELECT 1 FROM tcs_sales_return WHERE sub_order_num = ?').get(sub_order_num) !== undefined;
  }

  update(item: any) {
    return db.prepare(`
      UPDATE tcs_sales_return
      SET identifier = ?, sup_name = ?, gstin = ?, sub_order_num = ?, order_date = ?,
      hsn_code = ?, quantity = ?, gst_rate = ?, total_taxable_sale_value = ?,
      tax_amount = ?, total_invoice_value = ?, taxable_shipping = ?,
      end_customer_state_new = ?, enrollment_no = ?, cancel_return_date = ?,
      financial_year = ?, month_number = ?, supplier_id = ?
      WHERE id = ?
    `).run(
      item.identifier || null,
      item.sup_name || null,
      item.gstin || null,
      item.sub_order_num || null,
      item.order_date || null,
      item.hsn_code || null,
      item.quantity || null,
      item.gst_rate || null,
      item.total_taxable_sale_value || null,
      item.tax_amount || null,
      item.total_invoice_value || null,
      item.taxable_shipping || null,
      item.end_customer_state_new || null,
      item.enrollment_no || null,
      item.cancel_return_date || null,
      item.financial_year || null,
      item.month_number || null,
      item.supplier_id || null,
      item.id
    );
  }

  delete(id: number) {
    return db.prepare('DELETE FROM tcs_sales_return WHERE id = ?').run(id);
  }

  search(keyword: string) {
    return db.prepare(`
      SELECT * FROM tcs_sales_return
      WHERE identifier LIKE ? OR sup_name LIKE ? OR gstin LIKE ?
    `).all(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
  }

  filter(filters: any) {
    return db.prepare('SELECT * FROM tcs_sales_return WHERE gstin=? AND financial_year=? AND month_number=?')
      .all(filters.gstin, filters.financial_year, filters.month_number);
  }
}
