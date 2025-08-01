const express = require('express');
const router = express.Router();
const productHelpers = require('../helpers/product-helpers');

router.get('/', async (req, res) => {
  try {
    const products = await productHelpers.getAllProducts();
    res.render('view-product', { products, title: 'Products - User', isAdmin: false });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching products');
  }
});
router.get('/login',)

module.exports = router;




