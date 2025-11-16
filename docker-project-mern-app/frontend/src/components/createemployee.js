import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './createemployee.css';

const CreateEmployee = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [designation, setDesignation] = useState('');
  const [gender, setGender] = useState('');
  const [course, setCourse] = useState([]);
  const [image, setImage] = useState();

  const navigate = useNavigate();

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
    console.log(e.target.files[0])
  };

  console.log(image)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('Name', name);
    formData.append('Email', email);
    formData.append('MobileNo', mobileNo);
    formData.append('Designation', designation);
    formData.append('Gender', gender);
    formData.append('Course', JSON.stringify(course));
    if (image) {
      formData.append('Image', image);
    }

    try {
      await axios.post('http://localhost:5000/createEmployee', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      navigate('/employees');
    } catch (error) {
      console.error('Error creating employee:', error);
    }
  };

  return (
    <div className="create-employee">
      <h2>Create New Employee</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Mobile No:
          <input
            type="text"
            value={mobileNo}
            onChange={(e) => setMobileNo(e.target.value)}
            required
          />
        </label>
        <label>
          Designation:
          <select
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            required
          >
            <option value="">Select Designation</option>
            <option value="HR">HR</option>
            <option value="Manager">Manager</option>
            <option value="Sales">Sales</option>
          </select>
        </label>
        <label>
          Gender:
          <div>
            <label>
              <input
                type="radio"
                value="Male"
                checked={gender === 'Male'}
                onChange={() => setGender('Male')}
              />
              Male
            </label>
            <label>
              <input
                type="radio"
                value="Female"
                checked={gender === 'Female'}
                onChange={() => setGender('Female')}
              />
              Female
            </label>
          </div>
        </label>
        <label>
          Course:
          <div>
            <label>
              <input
                type="checkbox"
                value="BCA"
                checked={course.includes('BCA')}
                onChange={(e) => {
                  const value = e.target.value;
                  setCourse((prev) =>
                    prev.includes(value)
                      ? prev.filter((item) => item !== value)
                      : [...prev, value]
                  );
                }}
              />
              BCA
            </label>
            <label>
              <input
                type="checkbox"
                value="MCA"
                checked={course.includes('MCA')}
                onChange={(e) => {
                  const value = e.target.value;
                  setCourse((prev) =>
                    prev.includes(value)
                      ? prev.filter((item) => item !== value)
                      : [...prev, value]
                  );
                }}
              />
              MCA
            </label>
            <label>
              <input
                type="checkbox"
                value="BSC"
                checked={course.includes('BSC')}
                onChange={(e) => {
                  const value = e.target.value;
                  setCourse((prev) =>
                    prev.includes(value)
                      ? prev.filter((item) => item !== value)
                      : [...prev, value]
                  );
                }}
              />
              BSC
            </label>
          </div>
        </label>
        <label>
          Image:
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
        </label>
        <button type="submit">Create Employee</button>
      </form>
    </div>
  );
};

export default CreateEmployee;
