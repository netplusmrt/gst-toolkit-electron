import { ipcMain } from 'electron';
import { TaxInvoiceDetailsRepo } from '../repositories/tax_invoice_details.repo';

const taxInvoiceRepo = new TaxInvoiceDetailsRepo();

export function registerTaxInvoiceDetailsIpc() {
  ipcMain.handle('tax_invoice_details:add', (event, item) => {
    return taxInvoiceRepo.create(item);
  });

  ipcMain.handle('tax_invoice_details:insertMany', (event, items) => {
    return taxInvoiceRepo.insertMany(items);
  });

  ipcMain.handle('tax_invoice_details:getAll', () => {
    return taxInvoiceRepo.getAll();
  });

  ipcMain.handle('tax_invoice_details:getById', (event, id) => {
    return taxInvoiceRepo.getById(id);
  });

  ipcMain.handle('tax_invoice_details:getBySubOrderNum', (event, sub_order_num) => {
    return taxInvoiceRepo.getBySubOrderNum(sub_order_num);
  });

  ipcMain.handle('tax_invoice_details:update', (event, item) => {
    return taxInvoiceRepo.update(item);
  });

  ipcMain.handle('tax_invoice_details:delete', (event, id) => {
    return taxInvoiceRepo.delete(id);
  });

  ipcMain.handle('tax_invoice_details:search', (event, keyword) => {
    return taxInvoiceRepo.search(keyword);
  });

  ipcMain.handle('tax_invoice_details:filter', (event, filters) => {
    return taxInvoiceRepo.filter(filters);
  });
}