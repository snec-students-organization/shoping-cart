const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const verifyAdminLogin = require('../middleware/verifyAdmin'); // Middleware to protect admin routes
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');

// -------------------- MULTER CONFIG --------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/product-images/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});
const upload = multer({ storage: storage });

// -------------------- ADMIN LOGIN --------------------

// GET: Admin Login Page
router.get('/login', (req, res) => {
  if (req.session.isAdminLoggedIn) return res.redirect('/admin');
  res.render('admin/login', { title: 'Admin Login' });
});

// POST: Handle Admin Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Static admin credentials (replace with DB check later)
  const ADMIN_CREDENTIALS = { username: 'admin', password: '1234' };

  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    req.session.isAdminLoggedIn = true;
    req.session.adminUser = { username };
    res.redirect('/admin');
  } else {
    res.render('admin/login', {
      title: 'Admin Login',
      error: 'Invalid username or password',
    });
  }
});

// GET: Admin Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
});

// -------------------- ADMIN DASHBOARD --------------------

router.get('/', verifyAdminLogin, async (req, res) => {
  try {
    const products = await productHelpers.getAllProducts();
    const users = await userHelpers.getAllUsers();

    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      isAdmin: true,
      productCount: products.length,
      userCount: users.length,
      adminUser: req.session.adminUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error loading admin dashboard');
  }
});

// -------------------- ADD PRODUCT --------------------

// GET: Add Product Form
router.get('/add-product', verifyAdminLogin, (req, res) => {
  res.render('admin/add-product', { title: 'Add Product - Admin', isAdmin: true });
});

// POST: Add Product
router.post('/add-product', verifyAdminLogin, upload.single('image'), async (req, res) => {
  try {
    const productData = {
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      image: req.file ? req.file.filename : 'default.png',
    };
    await productHelpers.addProduct(productData);
    res.redirect('/admin/view-products');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error adding product');
  }
});

// -------------------- VIEW PRODUCTS --------------------
router.get('/view-products', verifyAdminLogin, async (req, res) => {
  try {
    const products = await productHelpers.getAllProducts();
    res.render('admin/view-products', { products, title: 'All Products - Admin', isAdmin: true });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving products');
  }
});

// -------------------- EDIT PRODUCT --------------------

// GET: Edit Product Form
router.get('/edit-product/:id', verifyAdminLogin, async (req, res) => {
  try {
    const product = await productHelpers.getProductById(req.params.id);
    res.render('admin/edit-product', {
      product,
      title: 'Edit Product',
      isAdmin: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error loading edit product form');
  }
});

// POST: Update Product
router.post('/edit-product/:id', verifyAdminLogin, upload.single('image'), async (req, res) => {
  try {
    const productData = {
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
    };

    if (req.file) {
      productData.image = req.file.filename;
    }

    await productHelpers.updateProduct(req.params.id, productData);
    res.redirect('/admin/view-products');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating product');
  }
});

// -------------------- DELETE PRODUCT --------------------
router.get('/delete-product/:id', verifyAdminLogin, async (req, res) => {
  try {
    await productHelpers.deleteProduct(req.params.id);
    res.redirect('/admin/view-products');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error deleting product');
  }
});

// -------------------- VIEW USERS --------------------
router.get('/users', verifyAdminLogin, async (req, res) => {
  try {
    const users = await userHelpers.getAllUsers();
    res.render('admin/user-list', { users, title: 'Users List', isAdmin: true });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching users');
  }
});

module.exports = router;
