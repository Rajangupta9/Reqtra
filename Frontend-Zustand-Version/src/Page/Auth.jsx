import { Route, Routes } from "react-router-dom"
import { Login } from "../Components/Auth/Login"
import { Signup } from "../Components/Auth/Signup"
import { AuthWrapper } from "../Components/Auth/AuthWrapper/AuthWrapper"

export const Auth = () => {
  return (
    <Routes>
      <Route
        path="login"
        element={
          <AuthWrapper>
            <Login />
          </AuthWrapper>
        }
      />
      <Route
        path="signup"
        element={
          <AuthWrapper>
            <Signup />
          </AuthWrapper>
        }
      />
      
    </Routes>
  )
}
