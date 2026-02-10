# nodejs_typescript_samples/chat_ai_ollama  
node.js + express + typedcript + ejs サーバーサイド and クライアントプログラム  
chat_ai_ollama  

### Ollama のインストール  
  
  ollama.com/download/linux  
  Download  
  $ curl -fsSL https://ollama.com/install.sh | sh  
  
  $ ollama run llama3  
  &gt;&gt;&gt; /bye  

  $ sudo systemctl [status | start | stop] ollama  

  browzer からチェック  
  http://127.0.0.1:11434  
  

### git clone this repository  
$ git clone ....  
$ cd nodejs_typescript_samples/chat_ai_ollama  
  
### package install  
  
package.json を使って、一括インストールします。  
$ npm install  
  

### build  

$ npx tsc  

  
### run  
$ node dist/index.js  

### browzer  
htp://localhost:3000/  



