require('dotenv').config();
const SECRET = process.env.SECRET;
const API_KEY = process.env.API_KEY;
const CLOUD_NAME = process.env.CLOUD_NAME;

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({ 
    cloud_name: CLOUD_NAME, 
    api_key: API_KEY, 
    api_secret: SECRET // Click 'View API Keys' above to copy your API secret
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'StaYNJoy_Dev',
      allowedformats: ['png', 'jpg', 'jpeg'], // supports promises as well
    },
  });

  module.exports = {
    cloudinary,
    storage
  }