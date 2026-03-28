import { ipcMain } from 'electron';
import { PartyRepo } from '../repositories/party.repo';

const partyRepo = new PartyRepo();

export function registerPartyIpc() {
  ipcMain.handle('party:add', (event, party) => partyRepo.create(party));
  ipcMain.handle('party:getAll', () => partyRepo.getAll());
  ipcMain.handle('party:getById', (event, id) => partyRepo.getById(id));
  ipcMain.handle('party:existsByGSTNumber', (event, gstNumber) => partyRepo.existsByGSTNumber(gstNumber));
  ipcMain.handle('party:update', (event, data) => partyRepo.update(data));
  ipcMain.handle('party:delete', (event, id) => partyRepo.delete(id));
  ipcMain.handle('party:search', (event, keyword) => partyRepo.search(keyword));
}
