
// src/routes/index.ts
import { Router } from "express";
import path from 'path';

import userRouter from "./user";
import mail_fromRouter from "./mail_form";
import adminRouter from "./admin";

const router = Router();

router.use(userRouter);
router.use(mail_fromRouter);
router.use(adminRouter);

//router.get('/', (req, res) => {
//  res.send('Hello World!');
//});

// ここは、静的 html ファイルの出力
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..","../public","index.html"));
});

export default router;
