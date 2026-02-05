const express = require('express');
const router = express.Router();
const Product = require("../Models/ProductSchema")
const multer = require("multer");
const { uploadToGridFS, getImageUrl } = require("../utility/GridFSUtility");
const { uploadToS3 } = require("../utility/S3UtilityforImageUpload");
const { authenticateToken: auth } = require('../MiddleWare/auth');
const role = require('../MiddleWare/role');
const mongoose = require('mongoose');
const AWS = require('aws-sdk');

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Function to delete image from S3
const deleteImageFromS3 = async (imageUrl) => {
  try {
    console.log('🔍 Processing S3 deletion for URL:', imageUrl);
    
    // Extract the S3 key from the full URL
    // URL format: https://bucket-name.s3.region.amazonaws.com/path/to/file.ext
    const url = new URL(imageUrl);
    const key = url.pathname.substring(1); // Remove leading slash
    
    console.log('🔑 Extracted S3 key:', key);
    console.log('🪣 Using bucket:', process.env.S3_BUCKET_NAME);
    
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key
    };
    
    console.log('⏳ Calling S3 deleteObject...');
    await s3.deleteObject(params).promise();
    console.log(`✅ Successfully deleted ${key} from S3`);
  } catch (error) {
    console.error('❌ Error deleting image from S3:', error);
    console.error('Image URL:', imageUrl);
    console.error('Error details:', error.message);
    // Don't throw the error - continue with other deletions
  }
};



const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * /:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: name
 *         type: string
 *         required: true
 *       - in: formData
 *         name: description
 *         type: string
 *         required: true
 *       - in: formData
 *         name: price
 *         type: number
 *         required: true
 *       - in: formData
 *         name: category
 *         type: string
 *         required: true
 *       - in: formData
 *         name: subCategory
 *         type: string
 *       - in: formData
 *         name: stockQuantity
 *         type: number
 *         required: true
 *       - in: formData
 *         name: size
 *         type: string
 *       - in: formData
 *         name: color
 *         type: string
 *       - in: formData
 *         name: material
 *         type: string
 *       - in: formData
 *         name: isAvailable
 *         type: boolean
 *       - in: formData
 *         name: discountPercentage
 *         type: number
 *       - in: formData
 *         name: tags
 *         type: array
 *         items:
 *           type: string
 *       - in: formData
 *         name: images
 *         type: array
 *         items:
 *           type: file
 *         collectionFormat: multi
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Error creating product
 */
router.post('/' , auth, role.check('admin'), upload.array('images[]', 7), async (req, res, next) => {
  try {
    let {
      name,
      description,
      price,
      category,
      subCategory,
      stockQuantity,
      isAvailable,
      discountPercentage,
      tags,
      availableSizesColors,
      ...otherDetails
    } = JSON.parse(req.body.data);


   
    

    if (!name || !price || !category) {
      return res.status(400).json({ message: 'Missing required fields: name, price, and category' });
    }

    if (typeof availableSizesColors === 'string') {
      try {
        availableSizesColors = JSON.parse(availableSizesColors);
      } catch (error) {
        return res.status(400).json({ message: 'Invalid availableSizesColors format' });
      }
    }
    console.log('Received parsedavailableSizesColors:', availableSizesColors);

    if (!Array.isArray(availableSizesColors)) {
      return res.status(400).json({ message: 'availableSizesColors must be an array' });
    }

    let imageUrls = [];
    let thumbnail
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(async(file) => {
        try {
          if(file.originalname !== 'thumbnail'){
            const result = await uploadToS3(file);
            return result;
          } else {
            const result = await uploadToS3(file);
            thumbnail = result;
            return null;
          }
        } catch (error) {
          console.error('Error uploading file:', error);
          throw error;
        }
      });
      imageUrls = await Promise.all(uploadPromises)
      imageUrls = imageUrls.filter((item) => item !== null);
    }

    // console.log('THUMBNAIL',thumbnail)
    // console.log('IMG URL',imageUrls)

    if (typeof tags === 'string') {
      try {
        tags = JSON.parse(tags);
      } catch (error) {
        tags = tags.split(',').map(tag => tag.trim());
      }
    }

    // Debug log: print the final product payload before saving
    const productPayload = {
      name,
      description,
      price: Number(price),
      category,
      subCategory,
      images: imageUrls,
      thumbnail: thumbnail,
      stockQuantity: Number(stockQuantity),
      isAvailable: isAvailable === true,
      discountPercentage: Number(discountPercentage),
      tags: Array.isArray(tags) ? tags : [],
      availableSizesColors,
      ...otherDetails
    };
    console.log('Product payload to be saved:', JSON.stringify(productPayload, null, 2));
    // Create a new product instance
    const newProduct = new Product(productPayload);

    const savedProduct = await newProduct.save();

    res.status(201).json({
      message: 'Product created successfully',
      product: savedProduct,
      category: savedProduct.category
    });
  } catch (error) {
    // Always return JSON for Unauthorized/Forbidden errors, including string errors from middleware
    if (error && (error.status === 401 || error.status === 403)) {
      return res.status(error.status).json({ message: error.message || 'Unauthorized' });
    }
    // Handle plain string errors (e.g., 'Unauthorized')
    if (typeof error === 'string' && (error === 'Unauthorized' || error === 'Forbidden')) {
      return res.status(401).json({ message: error });
    }
    // Handle error objects with message 'Unauthorized' or 'Forbidden'
    if (error && error.message && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return res.status(401).json({ message: error.message });
    }
    console.error('Error creating product:', error);
    // If it's a Mongoose validation error, send detailed info
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation Error',
        errors: error.errors,
        error: error.message
      });
    }
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { category, query, page = 1, limit = 10 } = req.query;
    let filter = {};

    if (category) {
      filter.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (query) {
      filter.$text = { $search: query };
    }

    if (!category && !query) {
      return res.status(400).json({ message: 'Please provide either category or query parameter' });
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 } 
    };

    const result = await Product.paginate(filter, options);

    res.json({
      products: result.docs,
      currentPage: result.page,
      totalPages: result.totalPages,
      totalProducts: result.totalDocs
    });
  } catch (error) {
    console.error('Error in product search:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/'    ,    async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; 
    const limit = parseInt(req.query.limit) || 10; 
    const sortBy = req.query.sortBy || 'createdAt'; 
    const order = req.query.order === 'asc' ? 1 : -1; 
    const search = req.query.search || ''; 
    const category = req.query.category;
    const subCategory = req.query.subCategory;

    let query = {};
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (category) {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }
    
    if (subCategory) {
      query.subCategory = { $regex: new RegExp(`^${subCategory}$`, 'i') };
    }

    const options = {
      page: page,
      limit: limit,
      sort: { [sortBy]: order },
      collation: { locale: 'en' } 
    };

    const result = await Product.paginate(query, options);

    res.json({
      products: result.docs,
      currentPage: result.page,
      totalPages: result.totalPages,
      totalProducts: result.totalDocs,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

// Get all available categories - must be before /:id route to avoid conflicts
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
});

router.get('/:id' ,  async (req, res) => {
  try {
    const id = req.params.id;
    
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
});


router.get('/category/:category' ,  async (req, res) => {
    try {
      const { category } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const sortBy = req.query.sortBy || 'createdAt';
      const order = req.query.order === 'asc' ? 1 : -1;
      const subCategory = req.query.subCategory;
  
      let query = { category: { $regex: new RegExp(`^${category}$`, 'i') } };
  
     
      if (subCategory) {
        query.subCategory = subCategory;
      }
  
      const options = {
        page: page,
        limit: limit,
        sort: { [sortBy]: order },
        collation: { locale: 'en' } 
      };
  
      const result = await Product.paginate(query, options);
  
      if (result.docs.length === 0) {
        return res.status(404).json({ message: 'No products found in this category' });
      }
  
      res.json({
        products: result.docs,
        currentPage: result.page,
        totalPages: result.totalPages,
        totalProducts: result.totalDocs,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage
      });
    } catch (error) {
      console.error('Error fetching products by category:', error);
      res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
  });



  router.put('/update/:id', auth, role.check('admin'), upload.array('images[]', 7), async (req, res) => {
    try {
      const { id } = req.params;
      const {  ...updateData } = JSON.parse(req.body.data);

      let availableSizesColors=updateData.availableSizesColors
  
      // console.log(309,updateData)
  
      if (!id) {
        return res.status(400).json({ message: 'Product ID is required for updating' });
      }

      if (typeof availableSizesColors === 'string') {
        try {
          availableSizesColors = JSON.parse(availableSizesColors);
        } catch (error) {
          return res.status(400).json({ message: 'Invalid availableSizesColors format' });
        }
      }
      // console.log('Received parsedavailableSizesColors:', availableSizesColors);
  
      if (!Array.isArray(availableSizesColors)) {
        return res.status(400).json({ message: 'availableSizesColors must be an array' });
      }

      updateData.availableSizesColors=availableSizesColors
  
      let imageUrls = [];
      let thumbnail;
      if (req.files && req.files.length > 0) {
        const uploadPromises = req.files.map(async (file) => {
          try {
            if (file.originalname !== 'thumbnail') {
              const result = await uploadToS3(file);
              return result;
            } else {
              const result = await uploadToS3(file);
              thumbnail = result;
              return null;
            }
          } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
          }
        });
        imageUrls = await Promise.all(uploadPromises);
        imageUrls = imageUrls.filter((item) => item !== null);
      }
      
      // Handle image updates properly
      if (imageUrls.length > 0) {
        // If new images are uploaded, combine with existing images from prevImgs
        updateData.images = [...(updateData.prevImgs || []), ...imageUrls];
      } else if (updateData.prevImgs) {
        // If no new images but prevImgs exists, use prevImgs
        updateData.images = updateData.prevImgs;
      }
      
      if(thumbnail){
        updateData.thumbnail = thumbnail;
      }
      
      // Remove prevImgs from updateData as it's not needed in the database
      delete updateData.prevImgs;
  
      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );
  
      if (!updatedProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      res.json({
        message: 'Product updated successfully',
        product: updatedProduct
      });
    } catch (error) {
      console.error('Error updating product:', error);
      if (error.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation Error', errors: error.errors });
      }
      res.status(500).json({ message: 'Error updating product', error: error.message });
    }
  });
  

  router.patch('/deactivate/:id' , auth, role.check('admin'), async (req, res) => {
    try {
      const { id } = req.params;
  
      if (!id) {
        return res.status(400).json({ message: 'Product ID is required' });
      }
  
      // Find the product by ID and update its availability
      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        { $set: { isAvailable: false } },
        { new: true, runValidators: true }
      );
  
      if (!updatedProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      res.json({
        message: 'Product deactivated successfully',
        product: updatedProduct
      });
    } catch (error) {
      console.error('Error deactivating product:', error);
      res.status(500).json({ message: 'Error deactivating product', error: error.message });
    }
  });

  router.get('/tags/:tag' ,  async (req, res) => {
    try {
      const { tag } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
  
      const products = await Product.find({ tags: tag })
                                    .skip((page - 1) * limit)
                                    .limit(limit);
  
      res.json({ products });
    } catch (error) {
      console.error('Error fetching products by tag:', error);
      res.status(500).json({ message: 'Error fetching products by tag', error: error.message });
    }
  });

  router.patch('/bulk-update' , auth, role.check('admin'), async (req, res) => {
    try {
      const updates = req.body; // Expecting an array of update objects with product ID and fields to update
  
      if (!Array.isArray(updates)) {
        return res.status(400).json({ message: 'Updates should be an array' });
      }
  
      const bulkOps = updates.map(update => ({
        updateOne: {
          filter: { _id: update.id },
          update: { $set: update.data },
          upsert: false
        }
      }));
  
      const result = await Product.bulkWrite(bulkOps);
  
      res.json({
        message: 'Products updated successfully',
        result
      });
    } catch (error) {
      console.error('Error bulk updating products:', error);
      res.status(500).json({ message: 'Error bulk updating products', error: error.message });
    }
  });
  



  router.get('/new-arrivals' ,  async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
  
      const products = await Product.find()
                                    .sort({ createdAt: -1 })
                                    .limit(limit);
  
      res.json({ products });
    } catch (error) {
      console.error('Error fetching new arrivals:', error);
      res.status(500).json({ message: 'Error fetching new arrivals', error: error.message });
    }
  });

  router.get('/carousel' ,  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1; 
      const limit = parseInt(req.query.limit) || 10; 
      const sortBy = req.query.sortBy || 'createdAt'; 
      const order = req.query.order === 'asc' ? 1 : -1; 
      const search = req.query.search || ''; 
  
      const query = { carousel: true };
      if (search) {
        query.$text = { $search: search };
      }
  
      const options = {
        page: page,
        limit: limit,
        sort: { [sortBy]: order },
        collation: { locale: 'en' }
      };
  
      const result = await Product.paginate(query, options);
  
      res.json({
        products: result.docs,
        currentPage: result.page,
        totalPages: result.totalPages,
        totalProducts: result.totalDocs,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage
      });
    } catch (error) {
      console.error('Error fetching carousel products:', error);
      res.status(500).json({ message: 'Error fetching carousel products', error: error.message });
    }
  });

  router.get('/most-selling' ,  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1; 
      const limit = parseInt(req.query.limit) || 10; 
      const sortBy = req.query.sortBy || 'createdAt'; 
      const order = req.query.order === 'asc' ? 1 : -1; 
      const search = req.query.search || ''; 
  
      const query = { most_selling_product: true };
      if (search) {
        query.$text = { $search: search };
      }
  
      const options = {
        page: page,
        limit: limit,
        sort: { [sortBy]: order },
        collation: { locale: 'en' }
      };
  
      const result = await Product.paginate(query, options);
  
      res.json({
        products: result.docs,
        currentPage: result.page,
        totalPages: result.totalPages,
        totalProducts: result.totalDocs,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage
      });
    } catch (error) {
      console.error('Error fetching most selling products:', error);
      res.status(500).json({ message: 'Error fetching most selling products', error: error.message });
    }
  });

  router.delete(
    '/delete/:id',
    auth, role.check('admin'),
    async (req, res) => {
      try {
        console.log('🗑️ DELETE request received for product ID:', req.params.id);
        const { id } = req.params;
        
        // First, get the product to access image URLs
        console.log('🔍 Finding product in database...');
        const product = await Product.findById(id);
        if (!product) {
          console.log('❌ Product not found');
          return res.status(404).json({ message: 'Product not found' });
        }
        
        console.log('✅ Product found:', product.name);
        console.log('📸 Images to delete:', product.images?.length || 0);
        
        // Delete images from S3
        if (product.images && product.images.length > 0) {
          console.log('🗑️ Starting S3 image deletion...');
          for (const imageUrl of product.images) {
            console.log('Deleting image:', imageUrl);
            await deleteImageFromS3(imageUrl);
          }
        }
        
        // Delete thumbnail from S3 if exists
        if (product.thumbnail) {
          console.log('🗑️ Deleting thumbnail from S3...');
          await deleteImageFromS3(product.thumbnail);
        }
        
        // Delete the product from database
        console.log('🗑️ Deleting product from database...');
        await Product.findByIdAndDelete(id);
        
        console.log('✅ Product deleted successfully');
        res.status(200).json({
          success: true,
          message: 'Product and associated images deleted successfully from both database and S3'
        });
      } catch (error) {
        console.error('❌ Error deleting product:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
          error: 'Your request could not be processed. Please try again.',
          message: error.message
        });
      }
    }
  );



// Serve product images from GridFS
router.get('/image/:fileId', async (req, res) => {
  try {
    const { serveImageFromGridFS } = require('../utility/GridFSUtility');
    await serveImageFromGridFS(req, res);
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({ message: 'Error serving image' });
  }
});

module.exports = router;