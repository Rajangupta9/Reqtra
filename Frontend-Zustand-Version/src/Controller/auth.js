import api  from "../Services/api";

export const signup = async (userData) => {
    try {
        const response = await api.post("/register", userData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || "Signup Failed");
    }
};

export const login = async (userData) => {
    try {
        const response = await api.post("/login", userData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || "Login Failed");
    }
};


export const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user")
};


export const microsoftLogin = async(userData) =>{
     try {
        const response = await api.post("/microsoft/login", userData);
        return response.data
     } catch (error) {
        throw new Error(error.response?.data?.error || "failed")
     }
}

export const googleLoginAPI = async(userData) =>{
     try {
        const response = await api.post("/google/login", userData);
        return response.data
     } catch (error) {
        throw new Error(error.response?.data?.error || "failed")
     }
}