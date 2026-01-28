// src/controllers/adminController.ts
import { Request, Response } from "express";
import path from 'path';
import * as fs from 'fs';

// ファイルロック用
import { lock, unlock } from 'proper-lockfile';
import comlib from '../slib/ComLib';

// 共通変数を取り込む
import {mySharedConfig } from '../index';
// ロック用のファイルパス
//const lock_filePath = path.join(__dirname,'..','../tmp' ,'lock.txt');

export const getAdminPage = (req: Request, res: Response) => {
  //res.sendFile(path.join(__dirname, "..","../public","admin","index.html"));

  // ミドルウェアでセットした値を取り出す
  const admin = res.locals.adminUser;
  const ad_name = admin.name;

  res.render("admin/index", {
    title: "お問い合わせフォーム管理者 メニュー",
    ad_name:ad_name
  });
};

export const getTemplate = async (req: Request, res: Response) => {
  //res.sendFile(path.join(__dirname, "..","../public","admin","index.html"));
  // ロックファイルパス
  const lock_filePath = mySharedConfig.lock_filePath;

  // 1. テンプレート ファイルパスを指定（絶対パス）
  //const templatePath = path.join(__dirname,'..','..','data', 'mail-template.txt');
  const templatePath = mySharedConfig.templatePath;

  let obj = {rec:''};
  const rc_s=await comlib.readTextFile(obj,templatePath,lock_filePath);
  if(rc_s==''){
    res.render("admin/template", {
      title: "お問い合わせフォーム テンプレート 登録",
      mail_text: obj.rec
    });
  }
  else{
    // エラーページを表示
    res.render("error", {
      title:"お問い合わせフォーム テンプレート 登録",
      error:"フォームテンプレート読み込みに、失敗しました!!"+rc_s,
    });
  }
};

export const getTemplateEnt = async (req: Request, res: Response) => {

  console.log('getTemplateEnt():#1');
  //console.log('req.body:',req.body);

  const lock_filePath = mySharedConfig.lock_filePath;

  //res.sendFile(path.join(__dirname, "..","../public","admin","index.html"));

  // 1. テンプレート ファイルパスを指定（絶対パス）
  //const templatePath = path.join(__dirname,'..','..','data', 'mail-template.txt');
  const templatePath = mySharedConfig.templatePath;

  const mail_text=req.body['mail_text'];
  //console.log('mail_text:',mail_text);

  let release;
  let send_err:boolean=false;
  const rc_s = await comlib.writeTextFile(mail_text,templatePath,lock_filePath);
  if(rc_s ==''){
    res.render("admin/template", {
      title: "お問い合わせフォーム テンプレート 更新",
      mail_text: mail_text
    });
  }
  else{
    // エラーページを表示
    res.render("error", {
      title:"お問い合わせフォーム テンプレート 更新",
      error:"フォームテンプレート書き込みに、失敗しました!!"+rc_s,
    });
  }
};

//ポイント
//    Request, Response は型付け必須
//    res.render() でテンプレートを返す
//    コントローラは 「処理」だけを書く（HTMLは書かない）
