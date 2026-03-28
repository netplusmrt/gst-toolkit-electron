import { ipcMain } from 'electron';
import { TcsSalesReturnRepo } from '../repositories/tcs_sales_return.repo';

const tcsSalesReturnRepo = new TcsSalesReturnRepo();

export function registerTcsSalesReturnIpc() {
  ipcMain.handle('tcs_sales_return:add', (event, sale) => tcsSalesReturnRepo.create(sale));
  ipcMain.handle('tcs_sales_return:insertMany', (event, sales) => tcsSalesReturnRepo.insertMany(sales));
  ipcMain.handle('tcs_sales_return:getAll', () => tcsSalesReturnRepo.getAll());
  ipcMain.handle('tcs_sales_return:getById', (event, id) => tcsSalesReturnRepo.getById(id));
  ipcMain.handle('tcs_sales_return:getBySubOrderNum', (event, sub_order_num) => tcsSalesReturnRepo.getBySubOrderNum(sub_order_num));
  ipcMain.handle('tcs_sales_return:sub_order_numExists', (event, sub_order_num) => tcsSalesReturnRepo.sub_order_numExists(sub_order_num));
  ipcMain.handle('tcs_sales_return:update', (event, sale) => tcsSalesReturnRepo.update(sale));
  ipcMain.handle('tcs_sales_return:delete', (event, id) => tcsSalesReturnRepo.delete(id));
  ipcMain.handle('tcs_sales_return:search', (event, keyword) => tcsSalesReturnRepo.search(keyword));
  ipcMain.handle('tcs_sales_return:filter', (event, filters) => tcsSalesReturnRepo.filter(filters));
}
