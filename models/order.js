const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const orderSchema = new mongoose.Schema({
  userId: { type: ObjectId, ref: 'User' },
  items: [{ product: { type: ObjectId, ref: 'Product' }, quantity: Number }],
  total: Number,
  address: String,
  paymentMethod: String,
  status: { type: String, default: 'Placed' },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
