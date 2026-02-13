# mqtt_iot  
mqtt での、センサーデータ(温度データの乱数値)の、送信(クライアント) と、サブスクライバーのサンプルアプリケーションです。  

## server_iot  
node.js + express + typescript mgtt サーバー API  

## client_iot  
node.js + typescript mqtt クライアン API  

## mqtt  
docker での mosquite の起動パラメータ と、起動のしかた!!  

## ビルド  
1. server_iot の ビルド  
   $ cd server_iot  
   $ npm install  
   $ npx tsc  
2. client_iot の ビルド  
   $ cd client_iot  
   $ npm install  
   $ npx tsc  

## 起動手順  
1. mosquitto の起動  
   $ cd mqtt  
   $ docker run -it -p 1883:1883 -v $(pwd)/mosquitto.conf:/mosquitto/config/mosquitto.conf eclipse-mosquitto  

2. client_iot の起動  
   $ cd client_iot  
   $ node dist/client.js  

3. server_iot の起動  
   $ cd server_iot  
   $ node dist/inde.js  
