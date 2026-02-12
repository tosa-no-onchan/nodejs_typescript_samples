### nodejs_typescript_samples  
node.js + express + typescript サーバーサイド プログラムを書いてみました。  

### mail_form  
このプログラムで、確認できる事。  
1) typescript での、mail の送信  
   nodemailer を使ってみた。  
2) カートのような一時ファイルが使えるかの確認  
   Redis を使ったセッション管理で、行うことにした。  
3) TEXT ファイルのアクセスと、ファイルロックの機能
4) メール文面のテンプレートの作成と、それを使った、メール本文の作成。  
   mustache を使ってみた。  
5) /admin(認証) ページ下 へのアクセスの、一括 認証処理。  
   オープンページとクローズページの切り分け。  
   認証ミドルウエアを、index.ts の中に組み入れた。  
6) 認証処理で得た、管理者 id の、サブコントローラへの引き継ぎ。
7) router + controller による、複数 コントローラプログラムの勉強。  

### chat_ai_ollama  
ローカルPC で、Ollama を使った、Ai チャットプログラム。  
node.js + express + typescript で、PC のブラウザーから、テストできます。  

### chat_ai_ollama_rag  
上記、 chat_ai_ollama に、RAG (Retrieval-Augmented Generation / 検索拡張生成) を  
追加しました。  
node.js + express + typescript で、PC のブラウザーから、テストできます。

### mqtt_iot  
mqtt での、センサーデータ(温度データの乱数値)の、送信(クライアント) と、サブスクライバーのサンプルアプリケーションです。  
サブスクライバー は、 node.js + express + typescript で、 mqtt から、センサーデータを、サブスクライブして、  
HTML の、非同期受信で、ブラウザーから、確認できます。  
ubuntu 24.04 で、docker から、 mosquitto を動かして、データの中継をさせています。  
docker が使えれば、簡単にテストできるぞね!!  
