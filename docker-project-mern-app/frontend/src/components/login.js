import axios from 'axios';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from './contexts/UserContext';
import './login.css';
const Login = () => {
  const loggedData=useContext(UserContext)
  const [credentials, setCredentials] = useState({
    f_userName: '',
    f_Pwd: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/login', credentials);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('f_userName', response.data.f_userName);
      localStorage.setItem('userid', response.data.userid);
      loggedData.setLoggedUser(response.data.token);
      console.log(response);
      navigate('/dashboard');
    } catch (err) {
      if (err.response) {
        alert("invalid login details")
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Username:</label>
            <input
              type="text"
              name="f_userName"
              value={credentials.f_userName}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Password:</label>
            <input
              type="password"
              name="f_Pwd"
              value={credentials.f_Pwd}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit">Login</button>
        </form>
      </div>
      <p>Don't have an account? <a href="/">Register</a></p>
    </div>
  );
};

export default Login;
