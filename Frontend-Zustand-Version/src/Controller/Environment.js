import api from "../Services/api";

export const envController = {
 
  async fetchAll(workspaceId) {
    try {
      const res = await api.get(`/api/environments?workspaceId=${workspaceId}`);
      return res.data;
    } catch (err) {
      console.error("Failed to fetch environments:", err);
      throw err;
    }
  },


  async save(workspaceId, environments) {
    try {
      const res = await api.post(`/api/environments/create?workspaceId=${workspaceId}`, {
        workspaceId,
        environments,
      });
      return res.data;
    } catch (err) {
      console.error("Failed to save environments:", err);
      throw err;
    }
  },
  async delete(workspaceId, selectedEnvId) {
    try {
      const res = await api.post(`/api/environments/delete?envId=${selectedEnvId}`);
      return res.data;
    } catch (err) {
      console.error("Failed to save environments:", err);
      throw err;
    }
  }
};
