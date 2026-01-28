// src/routes/admin.ts
import { Router } from "express";
// ここの、ルータに対する、実処理部分( Controller ) は、別ファイルにする。
import { getAdminPage,getTemplate,getTemplateEnt } from "../controllers/adminController";

const router = Router();
// ルーティングの記述 と、コントローラの結合
router.get("/admin", getAdminPage);
router.get("/admin/template", getTemplate);
router.post("/admin/template_ent", getTemplateEnt);
export default router;

