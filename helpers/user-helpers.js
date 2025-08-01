const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // Optionally add fields like roles, email, createdAt, etc.
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

module.exports = {
  // Create a new user with hashed password
  createUser: async (username, password) => {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ username, password: hashedPassword });
      return await user.save();
    } catch (error) {
      throw new Error('Error creating user: ' + error.message);
    }
  },

  // Find a user by username, optionally exclude password field
  findUser: async (username, excludePassword = false) => {
    try {
      if (excludePassword) {
        return await User.findOne({ username }).select('-password');
      }
      return await User.findOne({ username });
    } catch (error) {
      throw new Error('Error finding user: ' + error.message);
    }
  },

  // Compare plain password with hashed password
  comparePassword: async (password, hash) => {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      throw new Error('Error comparing passwords: ' + error.message);
    }
  },

  // Get all users without passwords (for admin listing)
  getAllUsers: async () => {
    try {
      return await User.find({}, { password: 0 }).sort({ createdAt: -1 }).lean();
    } catch (error) {
      throw new Error('Error fetching users: ' + error.message);
    }
  }
};

