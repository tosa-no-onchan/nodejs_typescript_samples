# nodejs_typescript_samples/chat_ai_ollama_rag  
node.js + express + typedcript + ejs サーバーサイド and クライアントプログラム  
chat_ai_ollama_rag  
chat_ai_ollama に、RAG (Retrieval-Augmented Generation / 検索拡張生成)   
を、追加しました。  

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
$ cd nodejs_typescript_samples/chat_ai_ollama_rag  
  
### package install  
  
package.json を使って、一括インストールします。  
$ npm install  
  

### build  

$ npx tsc  

  
### run  
$ node dist/index.js  

### browzer  
htp://localhost:3000/  

### RAG ファイルの変更  
docs/manual.md を、書き換えてください。  

