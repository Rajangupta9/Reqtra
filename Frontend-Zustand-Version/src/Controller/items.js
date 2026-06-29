import api from "../Services/api";

export const itemController = {
  async createItem (fromdata) {
     try {
        const res = await api.post("/item/create", fromdata);
        return res.data
     } catch (error) {

        console.error("Failed to create item:", error);
      throw new Error("Failed to create Folder", error);
     }
  },

  async deleteItem (id) {
     try {
        const res = await api.delete(`/item/delete?itemId=${id}`);
        return res.data
     } catch (error) {

        console.error("Failed to delete item:", error);
      throw new Error("Failed to delete Folder", error);
     }
  },

  async getAllItemRequest (parentId){
   try {
      const res = await api.get(`/item/retrieveAllRequest?parentId=${parentId}`)
      return res.data
   } catch (error) {
      console.error("Failed to get request item:", error);
      throw new Error("Failed to get request item", error);
   }
  }
};
