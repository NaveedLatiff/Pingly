import jwt from "jsonwebtoken";
import User from "../models/auth.js";
import bcrypt from 'bcryptjs'
import cloudinary from "../config/cloudinary.js";
import { authAttempts, imageUploads, imageUploadDuration } from '../metrics.js';

export const register = async (req, res) => {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
        authAttempts.inc({ action: 'register', outcome: 'invalid' });
        return res.json({ success: false, message: "Please Fill In All The Fields" });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            authAttempts.inc({ action: 'register', outcome: 'rejected' });
            return res.json({ success: false, message: "User Already Exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            fullName,
            email,
            password: hashedPassword,

        });
        authAttempts.inc({ action: 'register', outcome: 'success' });

        const token = jwt.sign({ id: user._id }, process.env.SESSION_SECRET, { expiresIn: '7d' });

        res.cookie("token", token, {
            httpOnly: true,
            secure: false, 
            sameSite: "lax", 
            maxAge: 7 * 24 * 60 * 60 * 1000, 
        });

        return res.json({
            success: true,
            message: "User Registered Successfully",
            user
        });

    } catch (err) {
        authAttempts.inc({ action: 'register', outcome: 'error' });
        res.json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        authAttempts.inc({ action: 'login', outcome: 'invalid' });
        return res.json({
            success: false,
            message: "Please Fill In All The Fields"
        })
    }
    try {
        const user = await User.findOne({ email })
        if (!user) {
            authAttempts.inc({ action: 'login', outcome: 'rejected' });
            return res.json({
                success: false,
                message: "Invalid Email"
            })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            authAttempts.inc({ action: 'login', outcome: 'rejected' });
            return res.json({
                success: false,
                message: "Invalid Password"
            })
        }

        const token = jwt.sign({ id: user._id }, process.env.SESSION_SECRET, { expiresIn: '7d' })
        authAttempts.inc({ action: 'login', outcome: 'success' });

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax", 
            maxAge: 7 * 24 * 60 * 60 * 1000, 
        });

        return res.json({
            success: true,
            message: "Login Successfully",
            user
        })

    } catch (err) {
        authAttempts.inc({ action: 'login', outcome: 'error' });
        res.json({
            success: false,
            message: "Internal Server Error"
        })
    }

}


export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            httpOnly: true,
            secure: false,
            sameSite: "lax", 

        })
        return res.json({
            success: true,
            message: "Logout Successfully"
        })

    } catch (err) {
        return res.json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

export const isAuthenticated = async (req, res) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.json({
                success: false,
                message: "User ID not found"
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        return res.json({
            success: true,
            message: "You are Authorized",
            user
        });
    } catch (err) {
        return res.json({
            success: false,
            message: `Internal Server Error: ${err.message}`
        });
    }
}

export const updateProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const { profilePic, fullName, bio } = req.body;

        let updateData = { fullName, bio };

        if (profilePic) {
            const endUploadTimer = imageUploadDuration.startTimer({ context: 'profile' });
            try {
                const uploadResponse = await cloudinary.uploader.upload(profilePic, {
                    folder: "chatapp-profileImages",
                });
                imageUploads.inc({ context: 'profile', outcome: 'success' });
                endUploadTimer({ outcome: 'success' });
                updateData.profilePic = uploadResponse.secure_url;
            } catch (error) {
                imageUploads.inc({ context: 'profile', outcome: 'error' });
                endUploadTimer({ outcome: 'error' });
                throw error;
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.json({
            success: true,
            user: updatedUser
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: `Internal Server Error: ${err.message}`
        });
    }
};
