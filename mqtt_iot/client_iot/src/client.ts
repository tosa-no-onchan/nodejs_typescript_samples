import mqtt from 'mqtt';

// ローカルの Docker ブローカーに接続
const client = mqtt.connect('mqtt://localhost:1883');

client.on('connect', () => {
  console.log('Device connected to broker');
  
  // 3秒ごとにランダムな温度を送信
  setInterval(() => {
    const data = {
      temp: (Math.random() * 10 + 20).toFixed(2),
      time: new Date().toISOString()
    };
    client.publish('home/living/temp', JSON.stringify(data));
    console.log('Sent:', data);
  }, 3000);
});

