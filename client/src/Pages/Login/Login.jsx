import {useState } from "react"; 
import "./Login.css"
import { Link } from "react-router-dom";
import API from "../../Services/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setemail] = useState("")
  const [password, setpassword] = useState("")
  const navigate = useNavigate();
  const handleSubmit =  async (e)=>{
       e.preventDefault();
       const loginData = {
      email,
      password
    };
    try {

    const res = await API.post("/auth/login", loginData);

    toast.success("Login Successful");

    setTimeout(() => {
      navigate("/dashboard"); 
    }, 1000);

  } catch (error) {

    console.error(error);
    toast.error("Login Failed");

  }
 }
  return (
   <div className="login-container">
      
     <h2>Login FleetFlow</h2>
   <form onSubmit={handleSubmit}>
    <div class="email-label">
  <h3>Email:</h3>
</div>
     <input 
        type="email"
        placeholder="Enter Email"
        onChange={(e)=>{setemail(e.target.value)}}
      >

      </input>
      <div class="input-label">
  <h3>Password:</h3>
</div>
      <input
          type="password"
          placeholder="Enter Password"
           minLength="8"
           required
          onChange={(e) => {setpassword(e.target.value)}}
        />
        <button type="submit">Login</button>
   </form>
    <p>
      Don't have an account? <Link to="/register">Register</Link>
    </p>
   </div>
  )
}

export default Login