import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./register.css"; // optional CSS

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    f_userName: "",
    f_Pwd: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:5000/register", formData);
      alert("Registration successful! You can now login.");
      navigate("/login"); // redirect to login page
    } catch (err) {
      if (err.response && err.response.status === 400) {
        alert("User already exists");
      } else {
        alert("Server error. Try again.");
      }
    }
  };

  return (
    <div className="register-container">
      <div className="register-form">
        <h2>Create Account</h2>

        <form onSubmit={handleSubmit}>
          <div>
            <label>Username:</label>
            <input
              type="text"
              name="f_userName"
              value={formData.f_userName}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Password:</label>
            <input
              type="password"
              name="f_Pwd"
              value={formData.f_Pwd}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit">Register</button>
        </form>

        <p>
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
