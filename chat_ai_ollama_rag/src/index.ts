//import * as express from "express";

//import express from 'express';

import express, { Request, Response } from 'express';
//import ollama from 'ollama';
import { Ollama } from 'ollama';
import * as fs from 'fs';
import path from 'path';

const app = express();

// --- ここから追加 ---
// HTMLフォームからのデータを解析するための設定
app.use(express.urlencoded({ extended: true }));

// JSON形式のデータを解析するための設定（fetch等を使う場合に必要）
app.use(express.json());
// --- ここまで追加 ---

// 'public' フォルダ内のファイルを静的ファイルとして公開
app.use(express.static(path.join(__dirname, '../public')));

app.set('view engine', 'ejs'); // EJSを使用する設定
app.set('views', './views');   // テンプレートの場所を指定

// .md ファイルをテキストとして読み込むだけ
const mdPath = path.join(__dirname, '../docs', 'manual.md');
const extractedKnowledge = fs.readFileSync(mdPath, 'utf-8');


//console.log("extractedKnowledge:",extractedKnowledge);

const ollama = new Ollama({ host: 'http://127.0.0.1:11434' });

//app.get("/", (req, res) => {
//  res.send("Hello World!");
//});

// ここは、静的 html ファイルの出力
app.get("/", (req, res) => {
  //res.sendFile(path.join(__dirname, "..","../public","index.html"));
  // ejs テンプレートを出力します。
  res.render("index", {
    title: "",
    response:'',
  });

});

/*
* Ubuntu 24.04 PC
* llama3
* 12G memory
* GTX 1070 8GB で、テストしました。
*/
app.post('/chat_not_use', async (req: Request, res: Response) => {
  const { message } = req.body;

  // ストリーミング用のヘッダー
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const response = await ollama.chat({
    model: 'llama3',
    messages: [
      { role: 'system', content: '必ず日本語のみで回答してください。翻訳や英語の解説は不要です。' }, // これを追加        
      { role: 'user', content: message }],
    stream: true,
  });

  for await (const part of response) {
    res.write(part.message.content);
  }
  res.end();
});

app.post('/chat', async (req: Request, res: Response) => {
  const { message } = req.body;

  // ストリーミング用のヘッダー
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const response = await ollama.chat({
    model: 'llama3',
    messages: [
      { role: 'system', 
        content: `必ず日本語のみで回答してください。翻訳や英語の解説は不要です。そして、以下の資料に基づいて回答してください。\n\n【資料】\n${extractedKnowledge}` }, // これを追加        
      { role: 'user', 
        content: message }],
    stream: true,
  });

  for await (const part of response) {
    res.write(part.message.content);
  }
  res.end();
});


app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});