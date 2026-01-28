// src/routes/mail_from.ts
import { Router } from "express";
// ここの、ルータに対する、実処理部分( Controller ) は、別ファイルにする。
import { getFormInput,getFormConfirm,getFormSend } from "../controllers/mailFormController";

const router = Router();
// ルーティングの記述 と、コントローラの結合
router.get("/form/input", getFormInput);
router.post("/form/confirm", getFormConfirm);
router.get("/form/send", getFormSend);

export default router;

