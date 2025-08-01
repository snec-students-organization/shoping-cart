const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');
// Multer config for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/product-images/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename
  },
});
const upload = multer({ storage: storage });

// GET add product form
router.get('/add-product', (req, res) => {
  res.render('admin/add-product', { title: 'Add Product - Admin', isAdmin: true });
});

// POST add product form submission
router.post('/add-product', upload.single('image'), async (req, res) => {
  try {
    const productData = {
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      image: req.file.filename,
    };
    await productHelpers.addProduct(productData);
    res.redirect('/admin/view-products');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error adding product');
  }
});

// GET view all products (admin)
router.get('/view-products', async (req, res) => {
  try {
    const products = await productHelpers.getAllProducts();
    res.render('admin/view-products', { products, title: 'All Products - Admin', isAdmin: true });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving products');
  }
});
// Route: GET /admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await userHelpers.getAllUsers();
    res.render('admin/user-list', { users, title: 'Users List', isAdmin: true });
  } catch (error) {
    res.status(500).send('Error fetching users');
  }
});

module.exports = router;








