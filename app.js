const express = require('express');
const path = require('path');
const session = require('express-session');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// -------------------- DATABASE CONNECTION --------------------
require('./config/connection');

// -------------------- ROUTE IMPORTS --------------------
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');

// -------------------- MIDDLEWARE SETUP --------------------

// Security headers
app.use(helmet());

// Request logger
app.use(morgan('dev'));

// Handlebars view engine
const exphbs = require('express-handlebars');
app.engine(
  'hbs',
  exphbs.engine({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
  })
);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Static files (images, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// -------------------- SESSION CONFIG --------------------
app.use(
  session({
    secret: 'your-secret-key-here-change-this',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Set secure:true only if using HTTPS
  })
);

// Make session data available in all views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.isAdmin = req.session.isAdminLoggedIn || false;
  next();
});

// -------------------- ROUTE HANDLING --------------------

// Authentication (login/register)
app.use('/', authRoutes);

// Admin routes — all admin pages protected with session
app.use('/admin', adminRoutes);

// User routes (normal users)
app.use('/', userRoutes);

// Redirect base /admin to login if not logged in
app.get('/admin', (req, res) => {
  if (!req.session.isAdminLoggedIn) {
    return res.redirect('/admin/login');
  }
  res.redirect('/admin/dashboard');
});

// -------------------- ERROR HANDLING --------------------

// 404 Page
app.use((req, res) => {
  res.status(404).render('404', {
    title: 'Page Not Found',
    isAdmin: res.locals.isAdmin,
    user: res.locals.user,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).render('error', {
    message: err.message || 'Internal Server Error',
    error: app.get('env') === 'development' ? err : {},
    title: 'Error',
    isAdmin: res.locals.isAdmin,
    user: res.locals.user,
  });
});

// -------------------- EXPORT APP --------------------
module.exports = app;
