// src/index.ts
import express from "express";
import router from "./routes";
import path from 'path';

// Redis 用のパッケージ
import session from "express-session"
import {createClient} from "redis"
import {RedisStore} from "connect-redis"

// 認証用 add by nishi 2026.1.27
import { Request, Response, NextFunction } from 'express';
import auth from 'basic-auth';

//import fs from 'fs';
import * as fs from 'fs';
import comlib from './slib/ComLib';

// 環境変数から読み込み用
// .env
import dotenv from 'dotenv';
dotenv.config();

const app = express();

// body-parserミドルウェアを有効にして、リクエストボディをパースできるようにする
// Express 4.16.0以降では、express.json()とexpress.urlencoded()が組み込まれています
// ボディパーサーミドルウェアの設定
// フォームデータ (urlencoded) と JSON データの両方に対応
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // フォームデータの解析用

// 'public' フォルダ内のファイルを静的ファイルとして公開
//app.use("/public", express.static(path.resolve(__dirname, "../public"))); // NG
app.use(express.static(path.join(__dirname, '../public')));

app.set('view engine', 'ejs'); // EJSを使用する設定
app.set('views', './views');   // テンプレートの場所を指定

// 画像 保存先ディレクトリの作成（存在しない場合）
const uploadDir = path.resolve(__dirname, "../public/up-images");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// tmp ディレクトリーを作成
//const tmpDir = path.resolve(__dirname, "../tmp");
// shared memory を使う。 by nishi 2026.1.19
const tmpDir = path.resolve("/dev/shm", "mail_from","tmp");
if (!fs.existsSync(tmpDir)) {
  // recursive: true で親ディレクトリも含めて作成し、既存でもエラーにしない
  fs.mkdirSync(tmpDir, { recursive: true });
}
// ロック用のファイルを作成
const lock_filePath = path.join(tmpDir,'lock.txt');
comlib.ensureFile(lock_filePath);

// maile テンプレート
const templatePath = path.join(__dirname,'..','data', 'mail-template.txt');

// 他のコントローラ参照用
export const mySharedConfig = { lock_filePath: lock_filePath,
  templatePath: templatePath
 };

// 下記ページを参考にする事
// https://www.npmjs.com/package/connect-redis
// Initialize client.
// 1. Redisクライアントの作成  --> カートの一時ファイル用(redis server を使う)
let redisClient = createClient()
redisClient.connect().catch(console.error)

// Initialize store.
let redisStore = new RedisStore({
  client: redisClient,
  prefix: "netosa_mail_form:", // 任意：キーの接頭辞
})

// Initialize session storage.
// 2. RedisStoreの初期化 (new RedisStore に client を渡す)
app.use(session({
    //secret: "keyboard cat",
    // 環境変数から読み込み。未設定の場合はエラーを投げるなどの処理が推奨
    secret: process.env.SESSION_SECRET || 'fallback-low-security-secret',
    resave: false, // required: force lightweight session keep alive (touch)
    saveUninitialized: false, // recommended: only save session when data exists
    store: redisStore,  // 作成したインスタンスを渡す
    cookie: {
      secure: process.env.NODE_ENV === 'production', // 本番(HTTPS)ではtrue
      httpOnly: true, // JavaScriptからのアクセスを禁止（セキュリティ向上）
      //maxAge: 1000 * 60 * 60 * 24 // 24時間有効
      maxAge: 1000 * 60 * 60 * 1 // 1時間有効
    }
  }),
)

// .env 
//   SESSION_SECRET をチェック
//console.log('index.ts:#1 : process.env.SESSION_SECRET:',process.env.SESSION_SECRET);


// --- 管理者向け Basic 認証ミドルウェア ---
const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  const user = auth(req);

  // ユーザー名とパスワードのチェック
  if (user && user.name === 'admin' && user.pass === 'onchan') {
    // res.locals にユーザー情報を格納
    res.locals.adminUser = {
      name: user.name,
      //role: userFromDb.role
    };
    return next(); // 認証成功：次の処理へ
  }
  if (user && user.name === 'onchan' && user.pass === 'onchan') {
    // res.locals にユーザー情報を格納
    res.locals.adminUser = {
      name: user.name,
      //role: userFromDb.role
    };
    return next(); // 認証成功：次の処理へ
  }

  // 認証失敗：ブラウザに認証ダイアログを表示させる
  res.set('WWW-Authenticate', 'Basic realm="Admin Area"');
  return res.status(401).send('Authentication required.');
};

// --- 特定のパスにのみミドルウェアを適用 ---
// これにより /admin, /admin/dashboard, /admin/settings など全てに認証がかかる
app.use('/admin', adminAuth);


// ルータを登録。 --> src/routes/xxxx.ts が、複数登録されるみたい。
app.use("/", router);

app.listen(3000, () => {
  console.log("Server started on port 3000");
});

