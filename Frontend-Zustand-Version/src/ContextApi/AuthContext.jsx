import { createContext, useContext } from "react";
 const AuthContext = createContext();

 export const useAuth = () => {
    const context = useContext(AuthContext);
    if(!context) {
        throw new Error('useAuth must be used within a AuthProvider')
        
    }
 }


export const AuthProvider = ({Children}) =>{
     


    value={
        
    }

    return (
        <AuthContext.Provider value={value}>
            {Children}
        </AuthContext.Provider>
    )
}