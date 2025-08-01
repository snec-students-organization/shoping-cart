const express = require('express');
const path = require('path');
const session = require('express-session');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// Connect to MongoDB
require('./config/connection');

// Import routes
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth'); // Assuming you created auth routes for login/register

// Security middleware - set various HTTP headers
app.use(helmet());

// HTTP request logger middleware
app.use(morgan('dev'));

// Set up Handlebars as the view engine, with layout support
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

// Serve static files like images, css, js from /public
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse URL-encoded form data (for forms)
app.use(express.urlencoded({ extended: true }));

// Session configuration — replace secret with environment var in production!
app.use(
  session({
    secret: 'your-secret-key-here-change-this',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Set true if HTTPS
  })
);

// Make session user info available to all views for navbars etc.
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  // Optionally, set isAdmin flag from session user info
  res.locals.isAdmin = req.session.user?.isAdmin || false;
  next();
});

// Mount auth routes (login/register) before user routes to catch those paths
app.use('/', authRoutes);

// Mount admin and user routes
app.use('/admin', adminRoutes);
app.use('/', userRoutes);

// 404 handler - for any route not matched above
app.use((req, res, next) => {
  res.status(404).render('404', {
    title: 'Page Not Found',
    isAdmin: res.locals.isAdmin,
    user: res.locals.user,
  });
});

// General error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500);
  res.render('error', {
    message: err.message || 'Internal Server Error',
    error: app.get('env') === 'development' ? err : {},
    title: 'Error',
    isAdmin: res.locals.isAdmin,
    user: res.locals.user,
  });
});

module.exports = app;










