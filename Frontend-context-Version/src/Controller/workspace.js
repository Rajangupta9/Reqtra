
import api from "../Services/api";

export const workspaceController = {
  async getAllWorkspace () {
     try {
        const {data} = await api.get("/workspace/get");
        return data
     } catch (error) {
        console.error("Failed to load workspace:", error);
      throw new Error("Failed to load workspace", error);
     }
   },
   async UpdateWorkspace (body) {
     try {
        const {data} = await api.put(`/workspace/update`,body);
        return data
     } catch (error) {
        console.error("Failed to update workspace:", error);
      throw new Error("Failed to update workspace", error);
     }
   },
};
