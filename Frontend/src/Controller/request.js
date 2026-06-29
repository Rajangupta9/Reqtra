import api from "../Services/api";

export const requestController = {
  async createItemWithCollectionId (id ,payload) {
     try {
        const res = await api.post(`/request/create?collectionId=${id}`, payload);
        return res.data
     } catch (error) {

        console.error("Failed to create request:", error);
      throw new Error("Failed to create request", error);
     }
  },
  async createItemWithItemId (id ,payload) {
     try {
        const res = await api.post(`/request/create?itemId=${id}`, payload);
        return res.data
     } catch (error) {

        console.error("Failed to create request:", error);
      throw new Error("Failed to create request", error);
     }
  }, 
  async updateRequstwithId (id, payload){
     try {
        const res = await api.post(`/request/update?requestId=${id}`, payload);
        return res.data
     } catch (error) {

        console.error("Failed to update request:", error);
      throw new Error("Failed to update request", error);
     }
  }
};
