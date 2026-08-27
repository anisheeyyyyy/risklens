import { ThreatModel, Threat } from '../models/threat.model';
import { AssetModel } from '../models/asset.model';

export const ThreatService = {
  async getThreats(filters: any) {
    return await ThreatModel.findAll(filters);
  },

  async getThreatById(id: string) {
    return await ThreatModel.findById(id);
  },

  async createThreat(data: any) {
    return await ThreatModel.create(data);
  },

  async updateThreat(id: string, data: any) {
    return await ThreatModel.update(id, data);
  }
};
