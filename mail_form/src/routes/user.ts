// src/routes/user.ts
import { Router } from "express";
// ここの、ルータに対する、実処理部分( Controller ) は、別ファイルにする。
import { getUserPage } from "../controllers/userController";

const router = Router();
// ルーティングの記述 と、コントローラの結合
router.get("/user", getUserPage);

export default router;

