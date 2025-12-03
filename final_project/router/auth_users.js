const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{
    return users.some(user => user.username === username);
}


const authenticatedUser = (username,password)=>{
    return users.some(user => user.username === username && user.password === password);
}


//only registered users can login
regd_users.post("/login", (req,res) => {
 const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({message: "Username and password are required"});
    }

    if (authenticatedUser(username,password)) {
        let accessToken = jwt.sign({username: username}, "access", {expiresIn: "1h"});

        req.session.authorization = {
            accessToken, username
        };

        return res.status(200).json({message: "Login successful!", token: accessToken});
    } else {
        return res.status(401).json({message: "Invalid username or password"});
    }
  // return res.status(300).json({message: "Yet to be implemented"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
   const isbn = req.params.isbn;
  const review = req.query.review;

  // Validate review content
  if (!review) {
    return res.status(400).json({ message: "Review is required" });
  }

  // Check if user is logged in
  const username = req.session.authorization?.username;
  if (!username) {
    return res.status(401).json({ message: "User not logged in" });
  }

  // Check if book exists
  let book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Add or modify user's review
  book.reviews[username] = review;

  return res.status(200).json({
    message: "Review added/updated successfully",
    reviews: book.reviews
  });
  // return res.status(300).json({message: "Yet to be implemented"});
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.username; // Session username of logged-in user

    // Check if book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Check if there are reviews for this book
    let reviews = books[isbn].reviews;

    if (!reviews || !reviews[username]) {
        return res.status(404).json({
            message: "No review found for this user to delete"
        });
    }

    // Delete only this user's review
    delete reviews[username];

    return res.status(200).json({
        message: "Review deleted successfully",
        reviews: books[isbn].reviews
    });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
