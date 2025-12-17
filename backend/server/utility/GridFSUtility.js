const { GridFSBucket } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');

// Function to upload image to GridFS
const uploadToGridFS = async (file, productId) => {
  try {
    const db = mongoose.connection.db;
    const bucket = new GridFSBucket(db, { bucketName: 'productImages' });
    
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}-${productId}.${fileExtension}`;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Invalid file type. Only JPEG, PNG, and WEBP are allowed.');
    }
    
    const uploadStream = bucket.openUploadStream(fileName, {
      contentType: file.mimetype,
      metadata: {
        productId,
        originalName: file.originalname,
        uploadDate: new Date()
      }
    });
    
    // Convert buffer to stream
    const bufferStream = require('stream').Readable.from(file.buffer);
    bufferStream.pipe(uploadStream);
    
    // Wait for upload to complete
    await new Promise((resolve, reject) => {
      uploadStream.on('finish', resolve);
      uploadStream.on('error', reject);
    });
    
    // Return the file ID for reference
    return {
      fileId: uploadStream.id,
      filename: fileName
    };
  } catch (error) {
    console.error('Error uploading to GridFS:', error);
    throw error;
  }
};

// Function to get image URL from GridFS
const getImageUrl = (fileId) => {
  return `/api/products/image/${fileId}`;
};

// Function to serve image from GridFS
const serveImageFromGridFS = async (req, res) => {
  try {
    const fileId = req.params.fileId;
    
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({ message: 'Invalid file ID' });
    }
    
    const db = mongoose.connection.db;
    const bucket = new GridFSBucket(db, { bucketName: 'productImages' });
    
    // Check if file exists
    const files = await bucket.find({ _id: mongoose.Types.ObjectId(fileId) }).toArray();
    if (files.length === 0) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    const file = files[0];
    
    // Set appropriate content type
    res.set('Content-Type', file.contentType);
    res.set('Content-Disposition', `inline; filename="${file.filename}"`);
    
    // Stream the file
    const downloadStream = bucket.openDownloadStream(mongoose.Types.ObjectId(fileId));
    downloadStream.pipe(res);
    
    downloadStream.on('error', (error) => {
      console.error('Error streaming file:', error);
      res.status(500).json({ message: 'Error streaming file' });
    });
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({ message: 'Error serving image' });
  }
};

module.exports = { uploadToGridFS, getImageUrl, serveImageFromGridFS };