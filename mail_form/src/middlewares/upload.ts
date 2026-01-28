// src/middlewares/upload.ts

import multer from "multer";
import path from "path";

//const storage = multer.diskStorage({
//  destination: (_req, _file, cb) => {
//    cb(null, "uploads/");
//  },
//  filename: (_req, file, cb) => {
//    const ext = path.extname(file.originalname);
//    cb(null, `${Date.now()}${ext}`);
//  },
//});

//export const upload = multer({ storage,
//  limits: {
//    fileSize: 5 * 1024 * 1024, // 5MB
//  },
//});

const uploadDir = path.resolve(__dirname, '..',"../public/up-images");


// Multerの設定: 保存先とファイル名の指定
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const date = new Date(Date.now());
        // 2026/01/15
        const yyyymmdd = date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        }).replaceAll('/', '-').replaceAll(':', '-').replaceAll(' ', '_'); // 2026-01-15 に置換する場合

        // 元のファイル名にタイムスタンプを付与して重複を避ける
        //const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const uniqueSuffix = yyyymmdd + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    }
});

export const upload = multer({ storage: storage, 
  fileFilter(req, file, cb) {
    console.log(file.mimetype)
    if (["video/mp4", "image/png", "image/jpeg", "audio/mpeg"].includes(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new TypeError("Invalid File Type"));
  },
});


// uploads/ フォルダは事前に作っておきます。
