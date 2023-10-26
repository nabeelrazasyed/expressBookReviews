const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session"); // Import the session module
const books = require("./booksdb.js");
const regd_users = express.Router();

let users = []; // Define and initialize the 'users' array
// Create a session middleware
regd_users.use(
  session({
    secret: "210d1ef17540f893b8fb14cb657a6ffac96e2bf18fc0b9338a279636e4bf1e1d", // Set a secret key for session data
    resave: false,
    saveUninitialized: true,
  })
);

// Check if the username is valid
const isValid = (username) => {
  // Check if the username is not empty and does not contain any special characters
  // You can define your own criteria for a valid username
  // For example, in this case, we're checking if the username consists of only alphanumeric characters
  const usernamePattern = /^[a-zA-Z0-9]+$/;
  return usernamePattern.test(username);
};

// Check if the username and password match the records
const authenticatedUser = (username, password) => {
  // Find the user in the 'users' array based on the provided username
  const user = users.find((user) => user.username === username);

  if (user && user.password === password) {
    return true; // Username and password match
  } else {
    return false; // Username and password do not match
  }
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Both username and password are required for login." });
  }

  // Check if the provided username and password match any user in the 'users' array
  const user = users.find(
    (user) => user.username === username && user.password === password
  );

  if (!user) {
    return res
      .status(401)
      .json({
        message:
          "Invalid credentials. Please check your username and password.",
      });
  }

  // Create a session and store the username
  req.session.username = username;

  return res.status(200).json({ message: "Login successful" });
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { review } = req.query; // Get the review from the query string
  const { isbn } = req.params;

  const username = req.session.username; // Retrieve the username from the session

  if (!username) {
    return res
      .status(401)
      .json({ message: "Unauthorized. Please log in to post a review." });
  }

  if (!review) {
    return res.status(400).json({ message: "Review is required." });
  }

  // Check if the provided ISBN exists in your 'books' data
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Initialize the reviews object if it doesn't exist
  if (!book.reviews) {
    book.reviews = {};
  }

  // Add or modify the review based on the username
  book.reviews[username] = review;

  return res
    .status(200)
    .json({ message: "Review added or modified successfully" });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const username = req.session.username;

  if (!username) {
    return res
      .status(401)
      .json({ message: "Unauthorized. Please log in to delete a review." });
  }

  // Check if the provided ISBN exists in your 'books' data
  const book = books[isbn];
  if (!book || !book.reviews || !book.reviews[username]) {
    return res.status(404).json({ message: "Review not found" });
  }

  // Delete the user's review
  delete book.reviews[username];

  return res.status(200).json({ message: "Review deleted successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
