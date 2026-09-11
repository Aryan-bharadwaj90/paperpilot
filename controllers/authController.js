const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required"
      });
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists"
      });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    // 5. Return response
    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      message: "Server error"
    });
  }
};

const loginUser=async(req,res)=>{
  try {
    const{email,password}=req.body;

    if(!email||!password)
    {
      return res.status(400).json({
        message:"Email and password are required"
      });
    }

    const user=await User.findOne({email});

    if(!user){
      return res.status(401).json({
        message:"invalid email or password"
      });
    }

    const isPasswordRight=await bcrypt.compare(password,user.password);
    if(!isPasswordRight)
    {
      return res.status(401).json({
        message:"invalid email or password"
      });
    }

    const token=generateToken(user._id);

    return res.status(200).json({
      message:"login successful",
      token,
      user:
      {
        id:user._id,
        name:user.name,
        email:user.email
      }
    });
  } catch (error) {
    console.log("Login error",error);
    return res.status(500).json({
      message:"server error"
    });
  }
};


const getMe=async(req,res)=>{
  return res.status(200).json(
    {
      user:req.user
    }
  );
};

module.exports = {registerUser,loginUser,getMe};  