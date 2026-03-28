import { db } from '../db';
import { getInsertColumns, getColumnList, getPlaceholders } from '../schemas';

export class TaxInvoiceDetailsRepo {

  create(record: any) {
    const insertColumns = ['type', 'order_date', 'suborder_no', 'product_description', 'hsn', 'invoice_no'];
    const stmt = db.prepare(`
      INSERT INTO tax_invoice_details (${insertColumns.join(', ')})
      VALUES (${getPlaceholders(insertColumns.length)})
    `);

    return stmt.run(
      record.type || null,
      record.order_date || null,
      record.suborder_no || null,
      record.product_description || null,
      record.hsn || null,
      record.invoice_no || null
    );
  }

  insertMany(records: any[]) {
    const insertColumns = ['type', 'order_date', 'suborder_no', 'product_description', 'hsn', 'invoice_no'];
    const stmt = db.prepare(`
      INSERT INTO tax_invoice_details (${insertColumns.join(', ')})
      VALUES (${getPlaceholders(insertColumns.length)})
    `);

    const checkStmt = db.prepare(`
      SELECT id
      FROM tax_invoice_details
      WHERE suborder_no = ? AND type = ?
    `);

    const insertTx = db.transaction((rows: any[]) => {
      const duplicates: string[] = [];
      const seen = new Set<string>();

      for (const row of rows) {
        const key = `${row.suborder_no}|${row.type}`;
        if (!row.suborder_no || !row.type) continue;

        if (seen.has(key)) {
          duplicates.push(key);
          continue;
        }
        seen.add(key);

        if (checkStmt.get(row.suborder_no, row.type)) {
          duplicates.push(key);
        }
      }

      if (duplicates.length > 0) {
        throw new Error(JSON.stringify({
          message: 'Duplicate (suborder_no, type) combination found',
          duplicates: [...new Set(duplicates)]
        }));
      }

      for (const row of rows) {
        stmt.run(
          row.type || null,
          row.order_date || null,
          row.suborder_no || null,
          row.product_description || null,
          row.hsn || null,
          row.invoice_no || null
        );
      }

      return { success: true };
    });

    try {
      const result = insertTx(records);
      return {
        success: true,
        message: 'Inserted successfully',
        result
      };
    } catch (err: any) {
      const parsed = JSON.parse(err.message);
      return {
        success: false,
        message: parsed.message,
        duplicates: parsed.duplicates
      };
    }
  }

  getAll() {
    return db.prepare('SELECT * FROM tax_invoice_details ORDER BY id DESC').all();
  }

  getById(id: number) {
    return db.prepare('SELECT * FROM tax_invoice_details WHERE id = ?').get(id);
  }

  getBySubOrderNum(sub_order_num: string) {
    return db.prepare('SELECT * FROM tax_invoice_details WHERE suborder_no = ?').all(sub_order_num);
  }

  update(record: any) {
    return db.prepare(`
      UPDATE tax_invoice_details
      SET type = ?, order_date = ?, suborder_no = ?,
          product_description = ?, hsn = ?, invoice_no = ?,
          updatedDate = ?
      WHERE id = ?
    `).run(
      record.type || null,
      record.order_date || null,
      record.suborder_no || null,
      record.product_description || null,
      record.hsn || null,
      record.invoice_no || null,
      record.updatedDate,
      record.id
    );
  }

  delete(id: number) {
    return db.prepare('DELETE FROM tax_invoice_details WHERE id = ?').run(id);
  }

  search(keyword: string) {
    const q = `%${keyword}%`;
    return db.prepare(`
      SELECT * FROM tax_invoice_details
      WHERE type LIKE ? OR suborder_no LIKE ? OR product_description LIKE ? OR invoice_no LIKE ?
    `).all(q, q, q, q);
  }

  filter(filters: any) {
    let query = 'SELECT * FROM tax_invoice_details WHERE 1=1';
    const params: any[] = [];

    if (filters.type) {
      query += ' AND type = ?';
      params.push(filters.type);
    }
    if (filters.order_date) {
      query += ' AND order_date = ?';
      params.push(filters.order_date);
    }

    return db.prepare(query).all(...params);
  }
}