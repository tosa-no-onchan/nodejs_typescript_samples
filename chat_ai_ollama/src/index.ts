//import * as express from "express";

//import express from 'express';

import express, { Request, Response } from 'express';
//import ollama from 'ollama';
import { Ollama } from 'ollama';
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
app.post('/chat', async (req: Request, res: Response) => {
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

/*
 not use
*/
app.post('/chat_not_use', async (req: Request, res: Response) => {
  //console.log("/chat req.body:",req.body);
  try {
    const { message } = req.body;

    //const response = await ollama.chat({
    //  model: 'llama3', // ダウンロードしたモデル名
    //  messages: [{ role: 'user', content: message }],
    //  stream: true // ここを true にする
    //});
    //for await (const part of response) {
    //  process.stdout.write(part.message.content); // ターミナルに一文字ずつ出るはずです
    //}
    //res.json({ reply: response.message.content });

    // レスポンスヘッダーをストリーミング用に設定
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    const response = await ollama.chat({
      model: 'llama3', // お使いのモデル名に書き換えてください
      messages: [
        { role: 'system', content: '必ず日本語のみで回答してください。翻訳や英語の解説は不要です。' }, // これを追加        
        { role: 'user', content: message }],
      stream: true,
    });

    for await (const part of response) {
      const content = part.message.content;
      if (content) {
        res.write(content); // クライアント（ブラウザ）へ逐次送信
        process.stdout.write(content); // サーバー側のログにも出力（確認用）
      }
    }
    res.end(); // 送信完了
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ollama connection failed" });
  }
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});