// src/controllers/userController.ts
import { Request, Response } from "express";

export const getUserPage = (req: Request, res: Response) => {
  // 本来はDBから取得
  const user = {
    id: 1,
    name: "Taro Yamada",
    email: "taro@example.com",
  };

  res.render("user", {
    title: "ユーザー詳細",
    user,
  });
};

//ポイント
//    Request, Response は型付け必須
//    res.render() でテンプレートを返す
//    コントローラは 「処理」だけを書く（HTMLは書かない）
