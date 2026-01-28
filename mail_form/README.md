# nodejs_typescript_samples/mail_from  
node.js + express + typedcript サーバーサイドプログラム  
mail form プログラムサンプルです。

### git clone this repository  
$ git clone ....  
$ cd nodejs_typescript_samples/mail_form  
  
### package install  
package.json を使って、一括インストールします。  
$ npm install  
  

### build  
.env を作成します。
SESSION_SECRET=  
SMTP_HOST=your-smtp-server  
SMTP_PORT=465  
SMTP_USER=your-mail-user-id  
SMTP_PASS=your-mail-passwd  
  
SESSION_SECRET の作成方法。  
$ node -e "console.log(require('cripto').randomVytes(32).toString('hex'))"  
で出てきたテキストを使う。  


src/controllers/mailFormController.ts の修正。  
line 122 を修正する。
      to: "xxxx@xxxx.com", // 管理者の受信アドレス

$ npx tsc  

### run  
$ node dist/index.js  

### brower  
htp://localhost:3000/  

管理者ページ id と パスワード 
admin/onchan
onchan/onchan


