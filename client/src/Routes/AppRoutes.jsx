import { Routes, Route } from "react-router-dom";
import Login from "../Pages/Login/Login.jsx";
import Register from "../Pages/Register/Register";
import Dashbord from "../Pages/Dashboard/Dashboard.jsx";

export const AppRoutes = () => {
  return (
    <Routes>
       <Route path="/" element={<Login />} />

      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashbord />} />
    </Routes>  
  )
}
