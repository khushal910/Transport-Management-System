import { useState } from "react";
import "./Register.css";
import { Link } from "react-router-dom";
import API from "../../Services/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
function Register() {

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: ""
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {

    const res = await API.post("/auth/register", formData);

    toast.success("Registration Successful");

    setTimeout(() => {
      navigate("/"); 
    }, 1000);

  } catch (error) {

    console.error(error);
    toast.error("Registration Failed");

  } 

 };

  return (
    <div className="register-container">
  
      <h2>FleetFlow Registration</h2>

      <form onSubmit={handleSubmit}>
        <div class="input-label">
          <h3>Full Name:</h3>
       </div>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          required
          onChange={handleChange}
        />
           <div class="input-label">
              <h3>Email:</h3>
            </div>

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          required
          onChange={handleChange}
        />
          <div class="input-label">
             <h3>Password:</h3>
          </div>

        <input
          type="password"
          name="password"
          placeholder="Password"
          minLength="6"
          required
          onChange={handleChange}
        />
        <div class="input-label">
           <h3>Role:</h3>
        </div>
        <select
          name="role"
          required
          onChange={handleChange}
        >
          <option value="">Select Role</option>
          <option value="manager">Manager</option>
          <option value="dispatcher">Dispatcher</option>
          <option value="manager">safety_officerr</option>
          <option value="dispatcher">financial_analyst</option>
          
        </select>

        <button type="submit">Register</button>

      </form>

      <p>Already have an account? <Link to="/">Login</Link></p>

    </div>
  );
}

export default Register;