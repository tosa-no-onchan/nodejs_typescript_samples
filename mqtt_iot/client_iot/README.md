# nodejs_typescript_samples/mqtt_iot/client_iot

node.js + typedcript での、クライアントプログラム  
mqtt_iot/client_iot  
mqtt で、センサーデータ(温度データの) ダミーを、定期的に送信します。

### git clone this repository  
$ git clone ....  
$ cd nodejs_typescript_samples/mqtt_iot/client_iot  
  
### package install  
  
package.json を使って、一括インストールします。  
$ npm install  
  

### build  

$ npx tsc  

#### 先に、 docker での mqtt を起動しておきます。  
  
### run  
$ node dist/client.js  

