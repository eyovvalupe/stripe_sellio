import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, res, cb) {
    cb(null, path.join(path.resolve(), "/upload"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = file.originalname.split(".")[0];
    const fileExtension = path.extname(file.originalname);
    cb(null, filename + "-" + uniqueSuffix + fileExtension);
  },
});


export default multer({ 
  limits: { fileSize: 50 * 1024 * 1024 }, 
  storage,
 });
