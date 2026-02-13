
#### Docker を使って、mqtt を起動する。  

ubuntu 24.04  

$ cd mqtt_iot/mqtt  
  

#### 1. mosquitto.conf を作成します。

mqtt_iot/mqtt/mosquitto.conf

````
persistence true
allow_anonymous true
listener 1883 0.0.0.0
````

#### 2. docker run  

$ docker run -it -p 1883:1883 -v $(pwd)/mosquitto.conf:/mosquitto/config/mosquitto.conf eclipse-mosquitto

#### 3. docker 終了  
Ctl + c

#### 4. docker image の チェック  
$ docker images
REPOSITORY          TAG       IMAGE ID       CREATED      SIZE
eclipse-mosquitto   latest    f803c9aab1b4   2 days ago   22.2MB

