const express = require("express");
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");
const sharp = require("../middleware/sharp-config");
const bookCtrl = require("../controllers/book");

const router = express.Router();

router.get("/", bookCtrl.getBooks);
router.get("/bestrating", bookCtrl.getBestRatedBooks);
router.get("/:id", bookCtrl.getBook);
router.post("/", auth, multer, sharp, bookCtrl.addBook);
router.post("/:id/rating", auth, bookCtrl.rateBook);
router.put("/:id", auth, multer, sharp, bookCtrl.updateBook);
router.delete("/:id", auth, bookCtrl.deleteBook);

module.exports = router;
