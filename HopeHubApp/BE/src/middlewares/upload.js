import multer from "multer";
import path from "path";
import fs from "fs";
import { profile } from "console";

const uploadDir = "uploads"

//Create upload folder
if(!fs.existsSync(uploadDir))
{
  fs.existsSync(uploadDir);
}

//Configuring Multer Storage
const storage = multer.diskStorage({
  destination(req, file, cb){
    cb(null, uploadDir)
  },
  filename(req, file, cb){
    const ext = path.extname(file.originalname)
    const userId = req.body.userId || Date.now();
    cb(null, `profile_${userId}${ext}`);
  } 
})

const upload = multer({storage})

export default upload