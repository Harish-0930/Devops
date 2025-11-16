import { useEffect, useState } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import { UserContext } from './components/contexts/UserContext';
import CreateEmployee from './components/createemployee';
import Dashboard from './components/dashboard';
import EditEmployee from './components/editemployee';
import EmployeeTable from './components/employee';
import Login from './components/login';
import Private from './components/private';
import Register from "./components/Register";

function App() {
  const [loggedUser,setLoggedUser]=useState(localStorage.getItem('token'));
  useEffect(()=>{
    console.log(loggedUser)

  })
  return (
    <UserContext.Provider value={{loggedUser,setLoggedUser}}>
    <Router>
      <div className="App">
        <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Register />} />
          <Route path="/dashboard" element={<Private Component={ Dashboard} />} />
          <Route path="/employees" element={<Private Component={EmployeeTable} />} />
          <Route path="/edit-employee/:id" element={<Private Component= {EditEmployee} />} />
          <Route path="/create-employee" element={<Private Component ={CreateEmployee} />} />
        </Routes>
      </div>
    </Router>
    </UserContext.Provider>
  );
}

export default App;
