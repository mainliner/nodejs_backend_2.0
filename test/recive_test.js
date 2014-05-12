var amqp = require('amqp');

var connection = amqp.createConnection({ host: "localhost", port: 5672 });

connection.on('ready',function(){
    console.log('connect to the APNS Queue');
    connection.exchange('router', {type: 'direct',autoDelete: false,confirm: true}, function(exchange){
        connection.queue('APNS',{exclusive: false} ,function(queue){
        queue.bind('router','A');
        queue.subscribe(function(msg){
            var encoded_payload = unescape(msg.data);
            var payload = JSON.parse(encoded_payload);
            console.log('Recieved a message:');
            console.log(payload);
        });
    });
    });
});