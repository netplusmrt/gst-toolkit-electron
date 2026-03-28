import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('partyApi', {
  add: (p: any) => ipcRenderer.invoke('party:add', p),
  getAll: () => ipcRenderer.invoke('party:getAll'),
  getById: (id: number) => ipcRenderer.invoke('party:getById', id),
  existsByGSTNumber: (gstNumber: string) => ipcRenderer.invoke('party:existsByGSTNumber', gstNumber),
  update: (p: any) => ipcRenderer.invoke('party:update', p),
  delete: (id: number) => ipcRenderer.invoke('party:delete', id),
  search: (k: string) => ipcRenderer.invoke('party:search', k)
});

contextBridge.exposeInMainWorld('salesApi', {
  add: (s: any) => ipcRenderer.invoke('tcs_sales:add', s),
  insertMany: (sales: any[]) => ipcRenderer.invoke('tcs_sales:insertMany', sales),
  getAll: () => ipcRenderer.invoke('tcs_sales:getAll'),
  getById: (id: number) => ipcRenderer.invoke('tcs_sales:getById', id),
  getBySubOrderNum: (sub_order_num: string) => ipcRenderer.invoke('tcs_sales:getBySubOrderNum', sub_order_num),
  getSalesWithReturnAndPayment: (filters: any) => ipcRenderer.invoke('tcs_sales:getSalesWithReturnAndPayment', filters),
  update: (s: any) => ipcRenderer.invoke('tcs_sales:update', s),
  delete: (id: number) => ipcRenderer.invoke('tcs_sales:delete', id),
  search: (k: string) => ipcRenderer.invoke('tcs_sales:search', k),
  filter: (filters: any) => ipcRenderer.invoke('tcs_sales:filter', filters)
});

contextBridge.exposeInMainWorld('salesReturnApi', {
  add: (s: any) => ipcRenderer.invoke('tcs_sales_return:add', s),
  insertMany: (sales: any[]) => ipcRenderer.invoke('tcs_sales_return:insertMany', sales),
  getAll: () => ipcRenderer.invoke('tcs_sales_return:getAll'),
  getById: (id: number) => ipcRenderer.invoke('tcs_sales_return:getById', id),
  getBySubOrderNum: (sub_order_num: string) => ipcRenderer.invoke('tcs_sales_return:getBySubOrderNum', sub_order_num),
  sub_order_numExists: (sub_order_num: string) => ipcRenderer.invoke('tcs_sales_return:sub_order_numExists', sub_order_num),
  update: (s: any) => ipcRenderer.invoke('tcs_sales_return:update', s),
  delete: (id: number) => ipcRenderer.invoke('tcs_sales_return:delete', id),
  search: (k: string) => ipcRenderer.invoke('tcs_sales_return:search', k),
  filter: (filters: any) => ipcRenderer.invoke('tcs_sales_return:filter', filters)
});

contextBridge.exposeInMainWorld('taxInvoiceDetailsApi', {
  add: (item: any) => ipcRenderer.invoke('tax_invoice_details:add', item),
  insertMany: (items: any[]) => ipcRenderer.invoke('tax_invoice_details:insertMany', items),
  getAll: () => ipcRenderer.invoke('tax_invoice_details:getAll'),
  getById: (id: number) => ipcRenderer.invoke('tax_invoice_details:getById', id),
  getBySubOrderNum: (sub_order_num: string) => ipcRenderer.invoke('tax_invoice_details:getBySubOrderNum', sub_order_num),
  update: (item: any) => ipcRenderer.invoke('tax_invoice_details:update', item),
  delete: (id: number) => ipcRenderer.invoke('tax_invoice_details:delete', id),
  search: (k: string) => ipcRenderer.invoke('tax_invoice_details:search', k),
  filter: (filters: any) => ipcRenderer.invoke('tax_invoice_details:filter', filters)
});

contextBridge.exposeInMainWorld('paymentApi', {
  add: (payment: any) => ipcRenderer.invoke('payment:add', payment),
  insertMany: (payments: any[]) => ipcRenderer.invoke('payment:insertMany', payments),
  getAll: () => ipcRenderer.invoke('payment:getAll'),
  getById: (id: number) => ipcRenderer.invoke('payment:getById', id),
  getBySubOrderNum: (sub_order_num: string) => ipcRenderer.invoke('payment:getBySubOrderNum', sub_order_num),
  update: (payment: any) => ipcRenderer.invoke('payment:update', payment),
  delete: (id: number) => ipcRenderer.invoke('payment:delete', id),
  search: (k: string) => ipcRenderer.invoke('payment:search', k),
  filter: (filters: any) => ipcRenderer.invoke('payment:filter', filters)
});

contextBridge.exposeInMainWorld('adsCostApi', {
  add: (item: any) => ipcRenderer.invoke('ads_cost:add', item),
  insertMany: (items: any[]) => ipcRenderer.invoke('ads_cost:insertMany', items),
  getAll: () => ipcRenderer.invoke('ads_cost:getAll'),
  getById: (id: number) => ipcRenderer.invoke('ads_cost:getById', id),
  update: (item: any) => ipcRenderer.invoke('ads_cost:update', item),
  delete: (id: number) => ipcRenderer.invoke('ads_cost:delete', id),
  search: (keyword: string) => ipcRenderer.invoke('ads_cost:search', keyword),
  filter: (filters: any) => ipcRenderer.invoke('ads_cost:filter', filters)
});

contextBridge.exposeInMainWorld('reportApi', {
  getTcsSalesWithReturnAndPayment: (filters: any) => ipcRenderer.invoke('reports:getTcsSalesWithReturnAndPayment', filters),
  getTaxInvoiceDetailsReport: (filters: any) => ipcRenderer.invoke('reports:getTaxInvoiceDetailsReport', filters),
  getPaymentsReport: (filters: any) => ipcRenderer.invoke('reports:getPaymentsReport', filters),
  getDateWiseSalesReport: (filters: any) => ipcRenderer.invoke('reports:getDateWiseSalesReport', filters),
  getMonthlySalesReport: (filters: any) => ipcRenderer.invoke('reports:getMonthlySalesReport', filters)
});

contextBridge.exposeInMainWorld('autoUpdater', {
  checkForUpdates: () => ipcRenderer.invoke('autoUpdater:checkForUpdates'),
  restartAndInstall: () => ipcRenderer.invoke('autoUpdater:restartAndInstall'),
  onStatus: (listener: (event: any, payload: any) => void) => ipcRenderer.on('autoUpdater:status', listener),
  removeStatusListener: (listener: (event: any, payload: any) => void) => ipcRenderer.removeListener('autoUpdater:status', listener)
});