const Product = require('../models/product');

module.exports = {
  // Add a new product
  addProduct: async (productData) => {
    try {
      const product = new Product(productData);
      return await product.save();
    } catch (error) {
      throw new Error('Error adding product: ' + error.message);
    }
  },

  // Get all products
  getAllProducts: async () => {
    try {
      return await Product.find({}).sort({ createdAt: -1 }).lean();
    } catch (error) {
      throw new Error('Error fetching products: ' + error.message);
    }
  },

  // Get a single product by ID
  getProductById: async (id) => {
    try {
      return await Product.findById(id).lean();
    } catch (error) {
      throw new Error('Error fetching product: ' + error.message);
    }
  },

  // Update product by ID
  updateProduct: async (id, productData) => {
    try {
      return await Product.findByIdAndUpdate(id, productData, { new: true });
    } catch (error) {
      throw new Error('Error updating product: ' + error.message);
    }
  },

  // Delete product by ID
  deleteProduct: async (id) => {
    try {
      return await Product.findByIdAndDelete(id);
    } catch (error) {
      throw new Error('Error deleting product: ' + error.message);
    }
  },
};
