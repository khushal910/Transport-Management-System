import { Routes, Route } from "react-router-dom";
import Login from "../Pages/Login/Login.jsx";
import Dashboard from "../Pages/Dashboard/Dashboard.jsx";
import Register from "../Pages/Register/Register.jsx";




export const AppRoutes = () => {
  return (
    <Routes>
       <Route path="/" element={<Login />} />

      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />}/>
    </Routes>  
  )
}
