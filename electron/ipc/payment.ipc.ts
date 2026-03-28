import { ipcMain } from 'electron';
import { PaymentRepo } from '../repositories/payment.repo';

const paymentsRepo = new PaymentRepo();

export function registerPaymentIpc() {
  ipcMain.handle('payment:add', (event, payment) => paymentsRepo.create(payment));
  ipcMain.handle('payment:insertMany', (event, payments) => paymentsRepo.insertMany(payments));
  ipcMain.handle('payment:getAll', () => paymentsRepo.getAll());
  ipcMain.handle('payment:getById', (event, id) => paymentsRepo.getById(id));
  ipcMain.handle('payment:getBySubOrderNum', (event, sub_order_num) => paymentsRepo.getBySubOrderNum(sub_order_num));
  ipcMain.handle('payment:update', (event, payment) => paymentsRepo.update(payment));
  ipcMain.handle('payment:delete', (event, id) => paymentsRepo.delete(id));
  ipcMain.handle('payment:search', (event, keyword) => paymentsRepo.search(keyword));
  ipcMain.handle('payment:filter', (event, filters) => paymentsRepo.filter(filters));
}
