import { ipcMain } from 'electron';
import { TcsSalesRepo } from '../repositories/tcs_sales.repo';

const tcsSalesRepo = new TcsSalesRepo();

export function registerTcsSalesIpc() {
  ipcMain.handle('tcs_sales:add', (event, sale) => tcsSalesRepo.create(sale));
  ipcMain.handle('tcs_sales:insertMany', (event, sales) => tcsSalesRepo.insertMany(sales));
  ipcMain.handle('tcs_sales:getAll', () => tcsSalesRepo.getAll());
  ipcMain.handle('tcs_sales:getById', (event, id) => tcsSalesRepo.getById(id));
  ipcMain.handle('tcs_sales:getBySubOrderNum', (event, sub_order_num) => tcsSalesRepo.getBySubOrderNum(sub_order_num));
  ipcMain.handle('tcs_sales:update', (event, data) => tcsSalesRepo.update(data));
  ipcMain.handle('tcs_sales:delete', (event, id) => tcsSalesRepo.delete(id));
  ipcMain.handle('tcs_sales:search', (event, keyword) => tcsSalesRepo.search(keyword));
  ipcMain.handle('tcs_sales:filter', (event, filters) => tcsSalesRepo.filter(filters));
  ipcMain.handle('tcs_sales:getSalesWithReturnAndPayment', (_event, filters) =>
    tcsSalesRepo.getSalesWithReturnAndPayment(filters)
  );
}