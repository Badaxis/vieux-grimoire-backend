const fs = require("fs");
const sharp = require("sharp");

module.exports = async (req, res, next) => {
  if (req.file) {
    fs.access("./images", (error) => {
      if (error) {
        fs.mkdirSync("./images");
      }
    });
    const { buffer, originalname } = req.file;
    const name = originalname
      .substring(0, originalname.lastIndexOf("."))
      .split(/[. ]+/)
      .join("_");
    const fileName = name + "_" + Date.now() + ".webp";
    req.file.filename = fileName;
    await sharp(buffer)
      .webp({ quality: 80 })
      .toFile("./images/" + fileName);
  }
  next();
};
