import multer from "multer";
import path from "path";

// save files on disk, not memory

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Date.now() + extension 
    },
});

export const upload = multer({ storage: storage });