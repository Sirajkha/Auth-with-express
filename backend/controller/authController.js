const userModel = require("../models/userSchema.js");
const emailValidator = require("email-validator");
const bcrypt = require('bcrypt');


                       // Sign Up Logic
const signup = async(req,res,next) => {
    const {name,email,password,confirmPassword} = req.body;
    console.log(name,email,password,confirmPassword);
    console.log("Received Data:", req.body);  // Log the incoming data

    if(!name || !email || !password || !confirmPassword){
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    const validEmail = emailValidator.validate(email);
    if(!validEmail){
        return res.status(400).json({
            success: false,
            message: "Invalid email address"
        })
    }

    if (password !== confirmPassword) {
        return res.status(400).json({
            success: false,
            message: 'Passwords do not match',
        });
    }
    try {
    const  userInfo = userModel(req.body);
    const result = await userInfo.save();

    return res.status(200).json({
        success:true,
        data:result
    })
    } catch (error) {
        console.error("Error saving user:", error);  // Log the error
        if(error.code === 11000){
            return res.status(400).json({
                success:false,
                message:'Account already exists with provided email id'
            });
        }
        return res.status(400).json({
            success:false,
            error: error.message
        })
    }
    
}

                    //SignIn logic

const signin = async(req, res,next) => {
    const {email,password} = req.body;

    if(!email || !password){
        return res.status(400).json({
            success:false,
            message: "All fields are mandatory"
        })
    }

    try {
        const user = await userModel
        .findOne({email})
        .select("+password");

        if(!user || !(await bcrypt.compare(password, user.password))){
            return res.status(400).json({
                success: false,
                message: "Authentication failed : Invalid password"
            })
        }

        const token = user.jwtToken();
        user.password =undefined;

        const cookieOption = {
            maxAge:24 * 60 * 60 * 1000,
            httpOnly:true
        };
        res.cookie("token",token,cookieOption);
        res.status(200).json({
           success:true,
           data:user
        })

    } catch (e) {
        res.status(404).json({
            success:false,
            message:e.message
        })
    } 
}

               // getUser logic

const getUser =  async(req,res,next) => {
    const userId = req.user.id;

    try {
        const user = await userModel.findById(userId);
        return res.status(200).json({
            success:true,
            data:user
        })
    } catch (error) {
        return res.status(402).json({
            success:false,
            error: error.message
        });
    }
}             

              // user Logout Logic

const logout = (req,res)=>{
    try {
        const cookieOption = {
            expires:new Date(),
            httpOnly:true
        };
        res.cookie("token",null,cookieOption);
        res.status(200).json({
            success:true,
            message:"User logged out successfully"
        })
    } catch (e) {
        res.status(400).json({
            success:false,
            message:e.message
        });
    }
}              
module.exports ={
    signup,
    signin,
    getUser,
    logout
}