import { ipcMain } from 'electron';
import { AdsCostRepo } from '../repositories/ads_cost.repo';

const adsCostRepo = new AdsCostRepo();

export function registerAdsCostIpc() {
  ipcMain.handle('ads_cost:add', (event, item) => {
    return adsCostRepo.create(item);
  });

  ipcMain.handle('ads_cost:insertMany', (event, items) => {
    return adsCostRepo.insertMany(items);
  });

  ipcMain.handle('ads_cost:getAll', () => {
    return adsCostRepo.getAll();
  });

  ipcMain.handle('ads_cost:getById', (event, id) => {
    return adsCostRepo.getById(id);
  });

  ipcMain.handle('ads_cost:update', (event, item) => {
    return adsCostRepo.update(item);
  });

  ipcMain.handle('ads_cost:delete', (event, id) => {
    return adsCostRepo.delete(id);
  });

  ipcMain.handle('ads_cost:search', (event, keyword) => {
    return adsCostRepo.search(keyword);
  });

  ipcMain.handle('ads_cost:filter', (event, filters) => {
    return adsCostRepo.filter(filters);
  });
}