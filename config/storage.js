const multer = require("multer")
const path = require("path")

module.exports= multer({
  storage: multer.diskStorage({}),
  limits: {
    files: 4,
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: (req, file, cb) => {
    let ext = path.extname(file.originalname);
    if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
      cb(new Error("file type is not supported"), false);
    }
    cb(null, true);
  },

})