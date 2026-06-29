import api from "../Services/api"


export const Proxy = async(paylod , activeTabId, envId) =>{
    try{
        const response = await api.post(`/proxy?activeTabId=${activeTabId}&envId=${envId}`, paylod)
        return response.data
    }catch(err){
        console.error("proxy error:", err);
        throw err;
    }
}