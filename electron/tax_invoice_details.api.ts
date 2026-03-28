import { ipcRenderer } from 'electron';

export const taxInvoiceDetailsAPI = {
  add: (item: any) => ipcRenderer.invoke('tax_invoice_details:add', item),
  insertMany: (items: any[]) => ipcRenderer.invoke('tax_invoice_details:insertMany', items),
  getAll: () => ipcRenderer.invoke('tax_invoice_details:getAll'),
  getById: (id: number) => ipcRenderer.invoke('tax_invoice_details:getById', id),
  update: (item: any) => ipcRenderer.invoke('tax_invoice_details:update', item),
  delete: (id: number) => ipcRenderer.invoke('tax_invoice_details:delete', id),
  search: (keyword: string) => ipcRenderer.invoke('tax_invoice_details:search', keyword),
  filter: (filters: any) => ipcRenderer.invoke('tax_invoice_details:filter', filters)
};