const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: String,
  image: String,
});

const Product = mongoose.model('Product', productSchema);

module.exports = {
  addProduct: async (productData) => {
    const product = new Product(productData);
    return await product.save();
  },

  getAllProducts: async () => {
    return await Product.find({}).lean();
  },
};







