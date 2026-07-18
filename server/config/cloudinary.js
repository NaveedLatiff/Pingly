import {v2 as cloudinary } from 'cloudinary';

console.log("DEBUG CLOUDINARY:", {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    // Do NOT log your api_secret, it's a security risk!
});


cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
    
})

export default cloudinary;