var sender = require('./amqp.js');

sender.sendMessageToRabbitMQ('this is a test message',function(){
  console.log('send message');
  return 0;
})
