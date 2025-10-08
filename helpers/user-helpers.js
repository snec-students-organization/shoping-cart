const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ----------------- User Schema -----------------
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  cart: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, default: 1 }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

// ----------------- Order Schema -----------------
const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: Number
    }
  ],
  total: Number,
  address: String,
  paymentMethod: String,
  status: { type: String, default: 'Placed' },
  date: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', orderSchema);

// ----------------- Helper Functions -----------------
module.exports = {
  // Create a new user with hashed password
  createUser: async (username, password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    return await user.save();
  },

  // Find a user by username
  findUser: async (username, excludePassword = false) => {
    if (excludePassword) {
      return await User.findOne({ username }).select('-password');
    }
    return await User.findOne({ username });
  },

  // Compare plain password with hashed password
  comparePassword: async (password, hash) => {
    return await bcrypt.compare(password, hash);
  },

  // Get all users without passwords (for admin)
  getAllUsers: async () => {
    return await User.find({}, { password: 0 }).sort({ createdAt: -1 }).lean();
  },

  // ----------------- CART FUNCTIONS -----------------

  addToCart: async (userId, productId) => {
    const user = await User.findById(userId);
    const existing = user.cart.find(item => item.product.toString() === productId);
    if (existing) {
      existing.quantity += 1;
    } else {
      user.cart.push({ product: productId, quantity: 1 });
    }
    await user.save();
  },

  getCartProducts: async (userId) => {
    const user = await User.findById(userId).populate('cart.product').lean();
    return user.cart;
  },

  getCartTotal: async (userId) => {
    const cartItems = await module.exports.getCartProducts(userId);
    let total = 0;
    cartItems.forEach(item => {
      total += item.product.price * item.quantity;
    });
    return total;
  },

  removeCartItem: async (userId, productId) => {
    await User.updateOne(
      { _id: userId },
      { $pull: { cart: { product: productId } } }
    );
  },

  // ----------------- ORDER FUNCTIONS -----------------

  placeOrder: async (userId, orderData) => {
    const order = new Order({
      userId,
      items: orderData.items,
      total: orderData.total,
      address: orderData.address,
      paymentMethod: orderData.paymentMethod,
      status: 'Placed'
    });
    await order.save();

    // Clear cart after order
    await User.updateOne(
      { _id: userId },
      { $set: { cart: [] } }
    );
  },

  getUserOrders: async (userId) => {
    return await Order.find({ userId })
      .sort({ date: -1 })
      .populate('items.product')
      .lean();
  }
};
