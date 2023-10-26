const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer", session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }));

app.use("/customer/auth/*", function auth(req, res, next) {
  // Check if a user is authenticated
  const isAuthenticated = req.session.isAuthenticated;

  // If the user is authenticated, allow them to proceed
  if (isAuthenticated) {
    next();
  } else {
    // If not authenticated, send a response or redirect to the login page
    res.status(401).json({ message: 'Authentication required' });
  }
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));
