// src/controllers/mailFormController.ts
import { Request, Response } from "express";
import 'express-session';
import path from 'path';

import nodemailer from 'nodemailer';

import * as Mustache from 'mustache';

// ファイルロック用
import { lock, unlock } from 'proper-lockfile';
import comlib from '../slib/ComLib';

// 共通変数を取り込む
import { mySharedConfig } from '../index';
// ロック用のファイルパス
//const lock_filePath = mySharedConfig.lock_Path;

declare module 'express-session' {
  interface SessionData {
    // フォームの一時保存用
    mailFormData?: {
      yname: string;
      ymail: string;
      ycomments: string;
    };
  }
}

//------
// Form 入力
//------
export const getFormInput = (req: Request, res: Response) => {
  //console.log("getFormInput():#1 __dirname:",__dirname);
  // セッションから、回復
  const formData = req.session.mailFormData;
  // 入力ページを表示
  res.render("form_input", {
    title: "お問い合わせフォーム 入力",
    yname:formData?.yname,
    ymail:formData?.ymail,
    ycomments:formData?.ycomments
  });
};

//------
// Form 確認
//------
export const getFormConfirm = (req: Request, res: Response) => {
  //console.log("getFormConfirm():#1 __dirname:",__dirname);
  //console.log('getFormConfirm():#1 : req:',req);

  const yname = req.body["yname"];
  const ymail = req.body["ymail"];
  const ycomments = req.body["ycomments"];

  //console.log('getMailConfirm():#2 : yname:',yname);
  //console.log(' ymail:',ymail);
  //console.log(' ycomments:',ycomments);

  // セッションに一時保存
  req.session.mailFormData = { yname, ymail, ycomments };

  // 確認ページを表示
  res.render("form_confirm", {
    title: "お問い合わせフォーム 確認",
    yname:yname,
    ymail:ymail,
    ycomments:ycomments
  });
};

//---------
// Form 送信 & 完了
//---------
export const getFormSend = async (req: Request, res: Response) => {
  //console.log("getFormSend():#1 __dirname:",__dirname);
  //console.log('getFormSend():#1 : req:',req);

  console.log('getFormSend():#1');
  // セッションから、回復
  const formData = req.session.mailFormData;
  if (!formData) {
    //return res.redirect('/form/input'); // データがなければ入力画面へ
    //return res.status(400).send("セッションタイムアウトです");
    // エラーページを表示
    res.render("error", {
      title: "エラー",
      error:"セッションタイムアウトです",
    });
  }
  else{
    const lock_filePath = mySharedConfig.lock_filePath;
    // 1. テンプレート ファイルパスを指定（絶対パス）
    const templatePath = mySharedConfig.templatePath;

    let obj = {rec:''};
    const rc_s=await comlib.readTextFile(obj,templatePath,lock_filePath);
    
    const view={yname:formData.yname,
      ymail:formData.ymail,
      ycomments:formData.ycomments
    }
    const output = Mustache.render(obj.rec, view);
    //console.log("getFormSend():#2 output:",output);

    // 送信設定の作成
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 465,
      secure: true, // 587番ポートの場合はfalse
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    try {
      // ここでメール送信ロジック（nodemailer等）を実行
      // メールの内容設定
      const mailOptions = {
      from: `"${formData.yname}" <${process.env.SMTP_USER}>`, // 送信元
      to: "xxxxe@xxxxx.com", // 管理者の受信アドレス
      replyTo: formData.ymail, // ユーザーのアドレス（返信用）
      subject: "お問い合わせフォームからのメッセージ",
      //text: `
//名前: ${formData.yname}
//メール: ${formData.ymail}
//内容:
//${formData.ycomments}
//      `,
      text:output
      };
      console.log("process.env.SMTP_HOST:",process.env.SMTP_HOST);
      console.log("process.env.SMTP_USER:",process.env.SMTP_USER);

      // 送信実行
      await transporter.sendMail(mailOptions);
      console.log(`${formData.ymail} 宛に送信しました`);

      // 送信が成功したらセッションからフォームデータを削除
      delete req.session.mailFormData;
      // または req.session.destroy(() => {}); // セッション全体を破棄する場合

      // 完了ページを表示
      res.render("form_complete", {
        title: "お問い合わせフォーム 完了",
        yname:formData?.yname,
      });
    } 
    catch (error) {
      //res.status(500).send("送信失敗");
      // エラーページを表示
      res.render("error", {
        title: "送信失敗",
        error:"メール送信に、失敗しました!!"+error,
      });
    }
  }
};

//ポイント
//    Request, Response は型付け必須
//    res.render() でテンプレートを返す
//    コントローラは 「処理」だけを書く（HTMLは書かない）
