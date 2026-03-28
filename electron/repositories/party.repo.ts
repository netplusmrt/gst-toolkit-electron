import { db } from '../db';
import { getInsertColumns, getColumnList, getPlaceholders } from '../schemas';

export class PartyRepo {

  private insertColumns = ['gstNumber', 'name', 'phone', 'email', 'address', 'createdDate', 'updatedDate', 'usedDate'];

  create(party: any) {
    const bindList = this.insertColumns.map(() => '?').join(', ');
    const statement = db.prepare(`
      INSERT INTO parties (${this.insertColumns.join(', ')})
      VALUES (${bindList})
    `);

    return statement.run(
      party.gstNumber,
      party.name || null,
      party.phone || null,
      party.email || null,
      party.address || null,
      party.createdDate || null,
      party.updatedDate || null,
      party.usedDate || null
    );
  }

  getAll() {
    return db.prepare('SELECT * FROM parties ORDER BY id DESC').all();
  }

  getById(id: number) {
    return db.prepare('SELECT * FROM parties WHERE id = ?').get(id);
  }

  existsByGSTNumber(gstNumber: string) {
    const result = db.prepare('SELECT id FROM parties WHERE gstNumber = ?').get(gstNumber);
    return !!result;
  }

  update(party: any) {
    return db.prepare(`
      UPDATE parties
      SET name = ?, phone = ?, email = ?, address = ?, 
      gstNumber = ?, updatedDate = ?
      WHERE id = ?
    `).run(
      party.name,
      party.phone,
      party.email,
      party.address,
      party.gstNumber,
      party.updatedDate,
      party.id
    );
  }

  delete(id: number) {
    return db.prepare('DELETE FROM parties WHERE id = ?').run(id);
  }

  search(keyword: string) {
    return db.prepare(`
      SELECT * FROM parties
      WHERE name LIKE ? OR phone LIKE ? OR gstNumber LIKE ?
    `).all(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
  }
}