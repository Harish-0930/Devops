import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './employee.css';
import Navbar from './navbar';

const EmployeeTable = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('http://localhost:5000/allEmployees');
      const fetchedEmployees = response.data.map((employee) => {
        let parsedCourses = [];
        try {
          parsedCourses = JSON.parse(employee.Course);
        } catch (error) {
          parsedCourses = employee.Course;  // If already an array, use as is
        }

        return {
          ...employee,
          Course: Array.isArray(parsedCourses) ? parsedCourses : [parsedCourses], // Ensure it's an array
        };
      });
      setEmployees(fetchedEmployees);
    } catch (error) {
      console.error('Error fetching employees', error);
    }
  };

  useEffect(() => {
    fetchEmployees();
    console.log(employees)
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/employees/${id}`);
      fetchEmployees();
      
    } catch (error) {
      console.error('Error deleting employee', error);
    }
  };

  const filteredEmployees = employees.filter((employee) =>
    employee.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.Designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <div className="employee-table">
        <div className="table-header">
          <h2>Employee List</h2>
          <div className="search-create">
            <div className="employee-info">
              
              <span className="employee-count">Total Count: {employees.length}</span>
              <button className="create-button" onClick={() => navigate('/create-employee')}>
                + Add New Employee
              </button>
            </div>
            <br/>
          </div>
        </div>
        <div className='search-create'>
        <input
              type="text"
              placeholder="Search by name, email, or designation"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
        </div>
        <table>
          <thead>
            <tr>
              <th>Unique Id</th>
            <th>Image</th>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile No</th>
              <th>Designation</th>
              <th>Gender</th>
              <th>Course</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee) => (
                
                <tr key={employee._id}>
                  <td>{employee._id}</td>
                  <td>
                    <img
                      src={`http://localhost:5000/uploads/${(employee.Image.filename)}`}
                      alt={employee.Name}
                      className="employee-image"
                      style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '50%' }}
                    />
                  </td>
                  
                  <td>{employee.Name}</td>
                  <td>{employee.Email}</td>
                  <td>{employee.MobileNo}</td>
                  <td>{employee.Designation}</td>
                  <td>{employee.Gender}</td>
{/*                   <td>{employee.Course.length > 0 ? employee.Course[employee.Course.length - 1] : 'N/A'}</td> */}
<td>{employee.Course.join(', ')}</td>
                  <td>{employee.Date}</td>
                  <td>
                    <Link to={`/edit-employee/${employee._id}`}>
                      <button>Edit</button>
                    </Link>
                    <button onClick={() => handleDelete(employee._id)}>Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8">No employees found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default EmployeeTable;
