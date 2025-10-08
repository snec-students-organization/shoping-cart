const express = require('express');
const router = express.Router();
const userHelpers = require('../helpers/user-helpers');

// Middleware to check login
function verifyLogin(req, res, next) {
  if (req.session.user) next();
  else res.redirect('/login');
}

// --------- HOME / PRODUCTS ---------
router.get('/', async (req, res) => {
  const products = await require('../helpers/product-helpers').getAllProducts();
  res.render('view-product', { products, title: 'Products', isAdmin: false, user: req.session.user });
});

// --------- ADD TO CART ---------
router.get('/add-to-cart/:id', verifyLogin, async (req, res) => {
  try {
    const userId = req.session.user._id;
    const productId = req.params.id;

    await userHelpers.addToCart(userId, productId);
    res.redirect('/cart');
  } catch (err) {
    console.error('Add to cart error:', err.message);
    res.status(500).send('Error adding product to cart');
  }
});

// --------- VIEW CART ---------
router.get('/cart', verifyLogin, async (req, res) => {
  try {
    const userId = req.session.user._id;
    const cartItems = await userHelpers.getCartProducts(userId);
    const total = await userHelpers.getCartTotal(userId);

    res.render('user/cart', { cartItems, total, title: 'Your Cart', isAdmin: false, user: req.session.user });
  } catch (err) {
    console.error('View cart error:', err.message);
    res.status(500).send('Error fetching cart');
  }
});

// --------- REMOVE FROM CART ---------
router.get('/cart/remove/:id', verifyLogin, async (req, res) => {
  const userId = req.session.user._id;
  const productId = req.params.id;

  await userHelpers.removeCartItem(userId, productId);
  res.redirect('/cart');
});

// --------- CHECKOUT PAGE ---------
router.get('/checkout', verifyLogin, async (req, res) => {
  const userId = req.session.user._id;
  const cartItems = await userHelpers.getCartProducts(userId);
  const total = await userHelpers.getCartTotal(userId);

  res.render('user/checkout', { cartItems, total, title: 'Checkout', isAdmin: false, user: req.session.user });
});

// --------- PLACE ORDER ---------
router.post('/checkout', verifyLogin, async (req, res) => {
  const userId = req.session.user._id;
  const cartItems = await userHelpers.getCartProducts(userId);
  const total = await userHelpers.getCartTotal(userId);

  const orderData = {
    items: cartItems,
    total,
    address: req.body.address,
    paymentMethod: req.body.paymentMethod
  };

  await userHelpers.placeOrder(userId, orderData);
  res.redirect('/orders');
});

// --------- VIEW ORDERS ---------
router.get('/orders', verifyLogin, async (req, res) => {
  const userId = req.session.user._id;
  const orders = await userHelpers.getUserOrders(userId);
  res.render('user/orders', { orders, title: 'My Orders', isAdmin: false, user: req.session.user });
});

module.exports = router;
