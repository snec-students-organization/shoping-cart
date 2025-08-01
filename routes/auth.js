const express = require('express');
const router = express.Router();
const userHelpers = require('../helpers/user-helpers'); // Make sure you have these helper functions implemented

// Registration page (GET)
router.get('/register', (req, res) => {
  res.render('auth/register', { title: 'Create Account', isAdmin: false });
});

// Handle registration form submission (POST)
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const exists = await userHelpers.findUser(username);
    if (exists) {
      // Username already exists, render with error message
      return res.render('auth/register', { 
        error: 'Username already exists!', 
        title: 'Create Account',
        isAdmin: false 
      });
    }
    
    // Create new user
    await userHelpers.createUser(username, password);
    
    // Redirect to login page after successful registration
    res.redirect('/login');
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).render('auth/register', { 
      error: 'An error occurred during registration. Please try again.', 
      title: 'Create Account',
      isAdmin: false 
    });
  }
});

// Login page (GET)
router.get('/login', (req, res) => {
  res.render('auth/login', { title: 'Login', isAdmin: false });
});

// Handle login form submission (POST)
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await userHelpers.findUser(username);

    if (user && await userHelpers.comparePassword(password, user.password)) {
      // Authentication successful, store user info in session
      req.session.user = {
        _id: user._id,
        username: user.username,
        // optionally: isAdmin: user.isAdmin  // if you have roles
      };

      return res.redirect('/'); // Redirect to homepage or dashboard
    }

    // Authentication failed, render login with error message
    res.render('auth/login', {
      error: 'Invalid username or password',
      title: 'Login',
      isAdmin: false
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).render('auth/login', {
      error: 'An error occurred during login. Please try again.',
      title: 'Login',
      isAdmin: false
    });
  }
});

// Logout route (GET)
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).send('Could not log out.');
    }
    res.redirect('/login'); // Redirect to login page after logout
  });
});

module.exports = router;

