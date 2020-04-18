var mqtt = require('mqtt')
var base64 = require('base64-arraybuffer')

var client  = mqtt.connect('mqtts://influx.itu.dk', {
  username: 'smartreader',
  password: '4mp3r3h0ur',
  port: 8883,
  rejectUnauthorized : false
})
 
client.on('connect', function () {
  console.log('CONNECTED')
  client.subscribe('IoT2020sec/meters', function (err) {
    console.log('SUBSCRIBED')
  })
})
 
client.on('message', function (topic, message) {

  const base64Message = message.toString();

  // available as array buffer
  const binaryMessage = base64.decode(base64Message);

  const meterId = binaryMessage.slice(0,1);
  const timestamp = binaryMessage.slice(1,4);
  const reading = binaryMessage.slice(4,6);

  //TODO: transform from array buffer to binary bytes ..... or find a way to transform directly base64->binary
  
  console.log("Base64: " + base64Message);
  console.dir(binaryMessage, {depth: null});
  console.log("\n");
})

client.on("error",function(error){ console.log("Can't connect"+error)});
