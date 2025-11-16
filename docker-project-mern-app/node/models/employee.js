const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
  },
  Email: {
    type: String,
    required: true,
    unique: true,
  },
  MobileNo: {
    type: Number,
    required: true,
  },
  Designation: {
    type: String,
    required: true,
  },
  Gender: {
    type: String,
    required: true,
  },
  Course: {
    type: [String],
    required: true,
  },
  Image: {
    filename: { type: String, required: true },
    path: { type: String, required: true }
  },
  Date:{
    type:String,
    default:new Date().toLocaleDateString()
  }
},{timestamps:true});

const Employee = mongoose.model('Employee', employeeSchema);
module.exports = Employee;
