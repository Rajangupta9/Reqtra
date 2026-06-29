import api from "../Services/api";

export const collectionController = {
    async loadTopLevelCollections(workspaceId) {
        try {
            const { data } = await api.get(`/collection/get?workspaceId=${workspaceId}`);
            return data || [];
        } catch (error) {
            console.error("Failed to load collections:", error);
            throw new Error("Failed to load collections");
        }
    },

    async fetchChildren(itemId) {
        try {
            const { data } = await api.get(`/collection/item/get?parentId=${itemId}`);
            return data || [];
        } catch (error) {
            console.error(`Failed to load items for ${itemId}:`, error);
            throw new Error("Failed to load content for this folder");
        }
    },

    async createCollection(formData) {
        try {
            const { data } = await api.post(`/collection/create`, formData)
            return data;
        } catch (error) {
            console.error('Failed to create collection')
            throw new Error("Faild to create collection", error)
        }
    },

    async import(id, paylod) {
        try {
            const res = await api.post(
                `/collection/import?workspaceId=${id}`,
                paylod
            );
           return res;
        } catch (error) {
           console.error("failed to import collection")
           throw new Error("failed to import collection" , error)
        }
    },

    async delete(id){
        try {
            const res = await api.delete(`/collection/delete?collectionId=${id}`)
            return res.data
        } catch (error) {
              console.error("faild to delete collection")   
              throw new Error("faild to delete Collecion", error);
        }
    }
};
