const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Check if both 'username' and 'password' are provided in the request body
  if (!username || !password) {
    return res.status(400).json({ message: "Both username and password are required for registration." });
  }

  // Check if the username already exists
  if (isValid(username, users)) {
    return res.status(409).json({ message: "Username already exists. Please choose a different one." });
  }

  // If all checks pass, add the new user to the 'users' array
  users.push({ username, password });

  return res.status(201).json({ message: "customer successfully register.now you can login" });
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  return res.status(200).json(books);
});

public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn; // Get the ISBN from the URL parameters

  // Check if the book with the given ISBN exists in your 'books' object
  if (books[isbn]) {
    // If the book is found, send it as a JSON response
    res.status(200).json(books[isbn]);
  } else {
    // If the book is not found, return a 404 Not Found response
    res.status(404).json({ message: "Book not found" });
  }
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const authorParam = req.params.author; // Get the author from the URL parameters

  // Iterate through the keys of the 'books' object
  const matchingBooks = [];
  for (const isbn of Object.keys(books)) {
    const book = books[isbn];
    if (book.author === authorParam) {
      matchingBooks.push(book);
    }
  }

  if (matchingBooks.length > 0) {
    // If books by the given author are found, send them as a JSON response
    res.status(200).json(matchingBooks);
  } else {
    // If no books by the author are found, return a 404 Not Found response
    res.status(404).json({ message: "Books by author not found" });
  }
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const titleParam = req.params.title; // Get the title from the URL parameters

  // Iterate through the keys of the 'books' object
  const matchingBooks = [];
  for (const isbn of Object.keys(books)) {
    const book = books[isbn];
    if (book.title.toLowerCase() === titleParam.toLowerCase()) {
      matchingBooks.push(book);
    }
  }

  if (matchingBooks.length > 0) {
    // If books with the given title are found, send them as a JSON response
    res.status(200).json(matchingBooks);
  } else {
    // If no books with the title are found, return a 404 Not Found response
    res.status(404).json({ message: "Books with title not found" });
  }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbnParam = req.params.isbn; // Get the ISBN from the URL parameters

  // Check if the book with the given ISBN exists in your 'books' object
  if (books[isbnParam]) {
    const book = books[isbnParam];

    if (book.reviews) {
      // If the book has reviews, send them as a JSON response
      res.status(200).json(book.reviews);
    } else {
      // If the book has no reviews, return an empty object as a review
      res.status(200).json({});
    }
  } else {
    // If the book is not found, return a 404 Not Found response
    res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
