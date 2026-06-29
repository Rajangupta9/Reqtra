import api from "../Services/api";

export const historyController = {

    async createHistory(payload) {
        try {
            const { data } = await api.post(`/api/history/create`, payload);
            return data;
        } catch (error) {
            console.error("Failed to create request history:", error);
            throw new Error("Failed to create request history");
        }
    },


    async getUserHistory(userId, workspaceId, page = 1, limit = 20) {
        try {
            const params = new URLSearchParams();
            params.append("userId", userId);
            if (workspaceId) params.append("workspaceId", workspaceId);
            params.append("page", page);
            params.append("limit", limit);

            const res = await api.get(`/api/history/user?${params.toString()}`);
            // return {
            //     histories: data.histories || [],
            //     hasMore: data.hasMore || false,
            // };
            return res.data;
        } catch (error) {
            console.error(" Failed to fetch user request history:", error);
            throw new Error("Failed to fetch user request history");
        }
    },


    async deleteHistory(historyId) {
        try {
            const { data } = await api.delete(`/api/history/delete?historyId=${historyId}`);
            return data;
        } catch (error) {
            console.error("Failed to delete history record:", error);
            throw new Error("Failed to delete history record");
        }
    },


    async clearUserHistory(userId, workspaceId) {
        try {
            const { data } = await api.delete(`/api/history/clear?userId=${userId}&workspaceId=${workspaceId}`);
            return data;
        } catch (error) {
            console.error("Failed to clear user history:", error);
            throw new Error("Failed to clear user history");
        }
    },
};
