const mongoose = require('mongoose');
require('dotenv').config();

// Product model
const productSchema = new mongoose.Schema({
  name: String,
  category: String,
  subCategory: String,
  // ... other fields
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

async function migrateCategories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Categories to migrate to HOUSEHOLD
    const oldCategories = ['BED SHEETS', 'CURTAINS', 'BLANKETS', 'MOSQUITO NETS'];
    
    for (const oldCategory of oldCategories) {
      console.log(`\nMigrating products from "${oldCategory}" to "HOUSEHOLD"...`);
      
      // Find products with the old category
      const products = await Product.find({ category: oldCategory });
      console.log(`Found ${products.length} products in "${oldCategory}" category`);
      
      if (products.length > 0) {
        // Update products: set category to HOUSEHOLD and subCategory to the old category
        const result = await Product.updateMany(
          { category: oldCategory },
          { 
            $set: { 
              category: 'HOUSEHOLD',
              subCategory: oldCategory 
            }
          }
        );
        
        console.log(`✅ Updated ${result.modifiedCount} products from "${oldCategory}" to "HOUSEHOLD"`);
        
        // Log some examples
        const updatedProducts = await Product.find({ 
          category: 'HOUSEHOLD', 
          subCategory: oldCategory 
        }).limit(3);
        
        console.log('Sample updated products:');
        updatedProducts.forEach(product => {
          console.log(`  - ${product.name} (Category: ${product.category}, SubCategory: ${product.subCategory})`);
        });
      }
    }

    // Summary
    console.log('\n=== MIGRATION SUMMARY ===');
    const householdCount = await Product.countDocuments({ category: 'HOUSEHOLD' });
    console.log(`Total products in HOUSEHOLD category: ${householdCount}`);
    
    // Count by subcategory
    for (const subCat of oldCategories) {
      const count = await Product.countDocuments({ 
        category: 'HOUSEHOLD', 
        subCategory: subCat 
      });
      console.log(`  - ${subCat}: ${count} products`);
    }

    await mongoose.disconnect();
    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateCategories();