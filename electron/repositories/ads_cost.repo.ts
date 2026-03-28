import { db } from '../db';
import { getInsertColumns, getColumnList, getPlaceholders } from '../schemas';

export class AdsCostRepo {

  create(record: any) {
    // Check for existing record with same unique combination
    const existing = db.prepare(`
      SELECT id FROM ads_cost
      WHERE deduction_duration = ? AND deduction_date = ? AND campaign_id = ? AND ad_cost = ?
    `).get(record.deduction_duration, record.deduction_date, record.campaign_id, record.ad_cost);

    if (existing) {
      throw new Error('Record with same deduction_duration, deduction_date, campaign_id, and ad_cost already exists');
    }

    const insertColumns = getInsertColumns('ads_cost');
    const stmt = db.prepare(`
      INSERT INTO ads_cost (${insertColumns.join(', ')})
      VALUES (${getPlaceholders(insertColumns.length)})
    `);

    return stmt.run(
      record.deduction_duration ?? null,
      record.deduction_date ?? null,
      record.campaign_id ?? null,
      record.ad_cost ?? null,
      record.discounts ?? null,
      record.ad_cost_incl_discounts ?? null,
      record.gst ?? null,
      record.total_ads_cost ?? null
    );
  }

  insertMany(records: any[]) {
    const insertColumns = getInsertColumns('ads_cost');
    const stmt = db.prepare(`
      INSERT INTO ads_cost (${insertColumns.join(', ')})
      VALUES (${getPlaceholders(insertColumns.length)})
    `);

    const checkStmt = db.prepare(`
      SELECT id
      FROM ads_cost
      WHERE deduction_duration = ? AND deduction_date = ? AND campaign_id = ? AND ad_cost = ?
    `);

    const insertTx = db.transaction((rows: any[]) => {
      const duplicateKeys: string[] = [];
      const seen = new Set<string>();

      for (const row of rows) {
        const key = `${row.deduction_duration}|${row.deduction_date}|${row.campaign_id}|${row.ad_cost}`;
        if (!row.deduction_duration || !row.deduction_date || !row.campaign_id || row.ad_cost === undefined || row.ad_cost === null) continue;

        if (seen.has(key)) {
          duplicateKeys.push(key);
          continue;
        }
        seen.add(key);

        if (checkStmt.get(row.deduction_duration, row.deduction_date, row.campaign_id, row.ad_cost)) {
          duplicateKeys.push(key);
        }
      }

      if (duplicateKeys.length > 0) {
        throw new Error(JSON.stringify({
          message: 'Duplicate (deduction_duration, deduction_date, campaign_id, ad_cost) combination found',
          duplicates: [...new Set(duplicateKeys)]
        }));
      }

      for (const row of rows) {
        stmt.run(
          row.deduction_duration ?? null,
          row.deduction_date ?? null,
          row.campaign_id ?? null,
          row.ad_cost ?? null,
          row.discounts ?? null,
          row.ad_cost_incl_discounts ?? null,
          row.gst ?? null,
          row.total_ads_cost ?? null
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
    return db.prepare('SELECT * FROM ads_cost ORDER BY id DESC').all();
  }

  getById(id: number) {
    return db.prepare('SELECT * FROM ads_cost WHERE id = ?').get(id);
  }

  update(record: any) {
    return db.prepare(`
      UPDATE ads_cost
      SET deduction_duration = ?, deduction_date = ?, campaign_id = ?,
          ad_cost = ?, discounts = ?, ad_cost_incl_discounts = ?,
          gst = ?, total_ads_cost = ?
      WHERE id = ?
    `).run(
      record.deduction_duration ?? null,
      record.deduction_date ?? null,
      record.campaign_id ?? null,
      record.ad_cost ?? null,
      record.discounts ?? null,
      record.ad_cost_incl_discounts ?? null,
      record.gst ?? null,
      record.total_ads_cost ?? null,
      record.id
    );
  }

  delete(id: number) {
    return db.prepare('DELETE FROM ads_cost WHERE id = ?').run(id);
  }

  search(keyword: string) {
    const q = `%${keyword}%`;
    return db.prepare(`
      SELECT * FROM ads_cost
      WHERE deduction_duration LIKE ? OR campaign_id LIKE ?
    `).all(q, q);
  }

  // filter(filters: any) {
  //   let query = 'SELECT * FROM ads_cost WHERE 1=1';
  //   const params: any[] = [];

  //   if (filters.deduction_date) {
  //     query += ' AND deduction_date = ?';
  //     params.push(filters.deduction_date);
  //   }
  //   if (filters.campaign_id) {
  //     query += ' AND campaign_id = ?';
  //     params.push(filters.campaign_id);
  //   }

  //   return db.prepare(query).all(...params);
  // }

  filter(filters: any) {
    return db.prepare(`SELECT * FROM payments 
      WHERE strftime('%Y', order_date) = ?
      AND strftime('%m', order_date) = ?;
    `).all(filters.financial_year, filters.month_number);
  }
}