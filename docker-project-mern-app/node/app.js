const express = require('express');
const bodyParser = require('body-parser');
const cors=require('cors')
const connectDB = require('./config/db');
const User = require('./models/user');
const Employee = require('./models/employee');
const app = express();
const bcrypt= require('bcryptjs')
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path=require('path')

connectDB();

app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cors())
app.use(express.urlencoded({ extended: true }));


//endpoint for registering user
app.post('/register', async (req, res) => {
    const user = req.body;
  
    try {
      const existingUser = await User.findOne({ f_userName:user.f_userName });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      bcrypt.genSalt(10,(err,salt)=>{
        bcrypt.hash(user.f_Pwd,salt,async (err,hpass)=>{
            if(!err){
                user.f_Pwd=hpass
                try{
                const employee = new User({ f_userName:user.f_userName, f_Pwd:user.f_Pwd });
                await employee.save();
            
                res.status(201).json({ message: 'User registered successfully' });

                }catch(err){
                    console.log(err)
                    res.status(500).send({message:"Some internal server error occur"})

                }
            }
        })
      })
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });


//endpoint for login
app.post("/login",async(req,res)=>{
    let userCred=req.body
    const user = await User.findOne({f_userName:userCred.f_userName})
    
    try{
        if(user!==null){
            bcrypt.compare(userCred.f_Pwd,user.f_Pwd,(err,success)=>{
                if(success==true){
                    jwt.sign({f_userName:userCred.f_userName},"dealsdray",(err,token)=>{ //here dealsdray is our secret key
                        if(!err){
                            res.status(200).send({message:"Login Success",token:token,f_userName:user.f_userName,userid:user._id})
                        }else{
                            res.status(500).send({message:"Some internal server occur"})
                        }
                    })
                }else{
                    res.status(401).send({message:'Incorrect password'})
                }
            })
        }else{
            res.status(404).send({message:"Email not found"})
        }
    }catch(err){
        console.log(err)
        res.status(500).send({message:"some internal server occur"})
    }
})

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// endpoint for creating employee
app.post('/createEmployee', upload.single('Image'), async (req, res) => {
 
    const { Name, Email, MobileNo, Designation, Gender, Course } = req.body;
    // const filePath = image.path.replace(/\\/g, '/');
    const image=req.file?req.file.filename:null;
    try {
      const employee = new Employee({
        Name,
        Email,
        MobileNo,
        Designation,
        Gender,
        Course,
        Image: { filename: image, path: `uploads/${image}` }
        
      });
  
      await employee.save();
      res.status(201).json({
        message: 'Employee created successfully',
        employee,
      });
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Server error', error });
    }
  });


// endpoint to fetch all employess
app.get('/allEmployees', async (req, res) => {
    try {
      const employees = await Employee.find();
      res.status(200).json(employees);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  });

  app.get('/uploads/:filename', (req, res) => {
    const filename = req.params.filename;
    console.log(`Requested file: ${filename}`);
    res.sendFile(path.join(__dirname, './uploads', filename), (err) => {
      if (err) {
        console.error('File not found:', err);
        res.status(404).send('File not found');
      }
    });
  });

// endpoint to fetch employee by ID
app.get('/employee/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const employee = await Employee.findById(id);
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }
      res.status(200).json(employee);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  });
  app.use(bodyParser.urlencoded({ extended: true }));
// Endpoint to update an employee by ID
app.put('/updateEmployee/:id',upload.single('Image'), async (req, res) => {
    try {
      const { id } = req.params;
      //const image=req.file?req.file.filename:null;
      const { Name, Email, MobileNo, Designation, Gender, Course,Image } = req.body;
      
      const image=req.file?req.file.filename:Image;
      const savingupdatedEmployee = {
        Name,
        Email,
        MobileNo,
        Designation,
        Gender,
        Course: JSON.parse(Course),
        Image: { filename: image, path: `uploads/${image}` },
      };
      const updatedEmployee = await Employee.findByIdAndUpdate(id, savingupdatedEmployee) // { new: true } returns the updated document
  
      if (!updatedEmployee) {
        return res.status(404).json({ message: 'Employee not found' });
      }
  
      res.status(200).json(updatedEmployee);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  });

  //endpoint for delete employee
  app.delete('/employees/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        await Employee.findByIdAndDelete(id);
        res.status(200).json({ message: 'Employee deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
