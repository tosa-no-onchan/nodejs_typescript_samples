// ~/www/nodejs/typescript/mqtt_iot/server_iot/src/index.ts
//import express from 'express';
import express, { Request, Response } from 'express';

import { createServer } from 'http';
import { Server } from 'socket.io';

import mqtt from 'mqtt';
import path from 'path';

const app = express();

// html からの、/socket.io/socket.io.js の受信の為、今回は、app をラッパーして使います。
// express のみの利用であれば、本来は、不要です!!
const httpServer = createServer(app);
const io = new Server(httpServer); // ブラウザ通信用

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

// 1. MQTTの接続と受信設定
//const client = mqtt.connect('mqtt://broker.example.com');
const client = mqtt.connect('mqtt://localhost:1883');

client.on('connect', () => {
  //client.subscribe('sensors/temp'); // トピックを購読
  client.subscribe('home/living/temp');
});

client.on('message', (topic, message) => {
  //console.log(`Received: ${message.toString()} from ${topic}`);

  // 届いたバイナリデータを JSON オブジェクトに変換
  const payload = JSON.parse(message.toString());
  console.log(`Received from ${topic}:`, payload);

  // 2. ブラウザへリアルタイム転送
  io.emit('sensor-update', payload); 

  // 3. ここでデータベースに保存したり、メモリ上の変数を更新したりする

});

// ここは、静的 html ファイルの出力
app.get("/", (req, res) => {
  //res.sendFile(path.join(__dirname, "..","../public","index.html"));
  // ejs テンプレートを出力します。
  res.render("index", {
    title: "",
    response:'',
  });
});

// 2. Expressのエンドポイント（データの閲覧用など）
app.get('/api/status', (req, res) => {
  res.json({ message: "Backend is running and listening to MQTT" });
});

io.on('connection', (socket) => {
  console.log('ユーザーが接続しました');
});


//app.listen(3000, () => console.log('Express app listening on port 3000'));
// 今回は、こちらを使います!!
httpServer.listen(3000, () => console.log('httpServer listening on port 3000'));
