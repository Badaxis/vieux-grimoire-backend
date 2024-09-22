const fs = require("fs");
const Book = require("../models/book");

exports.getBooks = (req, res) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

exports.getBook = (req, res) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }));
};

exports.addBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject.userId;
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  book
    .save()
    .then(() => res.status(201).json({ message: "Book created" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.updateBook = (req, res) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
  delete bookObject.userId;
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        return res.status(403).json({ message: "Unauthorized request" });
      }
      if (req.file) {
        const fileName = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${fileName}`, (err) => {
          if (err) throw err;
        });
      }
      Book.updateOne(
        { _id: req.params.id },
        { ...bookObject, _id: req.params.id }
      )
        .then(() => res.status(200).json({ message: "Book modified" }))
        .catch((error) => res.status(401).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.deleteBook = (req, res) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        return res.status(403).json({ message: "Unauthorized request" });
      }
      const fileName = book.imageUrl.split("/images/")[1];
      fs.unlink(`images/${fileName}`, () => {
        Book.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Book deleted" }))
          .catch((error) => res.status(401).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.rateBook = (req, res) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.ratings.some((rating) => rating.userId == req.auth.userId)) {
        return res
          .status(403)
          .json({ message: "User already rated this book" });
      }
      const ratingObject = { grade: req.body.rating, userId: req.auth.userId };
      let averageGrade = req.body.rating;
      for (rating of book.ratings) {
        averageGrade += rating.grade;
      }
      averageGrade /= book.ratings.length + 1;
      Book.updateOne(
        { _id: req.params.id },
        {
          $push: { ratings: ratingObject },
          $set: { averageRating: averageGrade },
        }
      )
        .then(() => {
          Book.findOne({ _id: req.params.id })
            .then((book) => res.status(200).json(book))
            .catch((error) => res.status(404).json({ error }));
        })
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(400).json({ error }));
};

exports.getBestRatedBooks = (req, res) => {
  Book.find()
    .sort({ averageRating: "desc" })
    .limit(3)
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};
