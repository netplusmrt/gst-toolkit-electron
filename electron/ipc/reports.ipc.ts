import { ipcMain } from 'electron';
import { ReportsRepo } from '../repositories/reports.repo';

const reportsRepo = new ReportsRepo();

export function registerReportsIpc() {
  ipcMain.handle('reports:getTcsSalesWithReturnAndPayment', (_event, filters) =>
    reportsRepo.getTcsSalesWithReturnAndPayment(filters)
  );

  ipcMain.handle('reports:getTaxInvoiceDetailsReport', (_event, filters) =>
    reportsRepo.getTaxInvoiceDetailsReport(filters)
  );

  ipcMain.handle('reports:getPaymentsReport', (_event, filters) =>
    reportsRepo.getPaymentsReport(filters)
  );

  ipcMain.handle('reports:getDateWiseSalesReport', (_event, filters) =>
    reportsRepo.getDateWiseSalesReport(filters)
  );

  ipcMain.handle('reports:getMonthlySalesReport', (_event, filters) =>
    reportsRepo.getMonthlySalesReport(filters)
  );
}
