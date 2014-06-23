module.exports = {
    cookieSecret: 'wedateiosgamedev',
    db: 'wedate',
    mongodbUrl: 'mongodb://localhost:27017/wedate',
    rabbitMQHost: 'localhost',
    rabbitMQPort: 5672,
    rabbitMQUser:'guest',
    rabbitMQPassword:'guest',
    maxAge: 2592000000,
    singleServer : {
        "db" : "wedate",
        "collection" : "sessions",
        "host" : "localhost",
        "port" : 27017
    },
    replicaSet:{
        "collection" : "sessions",
        "stringify": false,
        "db": {
            "name" : "wedate",
            "servers" : [
            {
                "host" : "10.0.0.51",
                "port" : 27017,
                "options" : {
                    "autoReconnect" : false,
                    "poolSize" : 200,
                    "socketOptions" : {
                        "timeout" : 0,
                        "noDelay" : true,
                        "keepAlive" : 1,
                        "encoding" : "utf8"
                    }
                }
            },
            {
                "host" : "10.0.0.52",
                "port" : 27017,
                "options" : {
                    "autoReconnect" : false,
                    "poolSize" : 200,
                    "socketOptions" : {
                        "timeout" : 0,
                        "noDelay" : true,
                        "keepAlive" : 1,
                        "encoding" : "utf8"
                    }
                }
            },
            {
                "host" : "10.0.0.53",
                "port" : 27017,
                "options" : {
                    "autoReconnect" : false,
                    "poolSize" : 200,
                    "socketOptions" : {
                        "timeout" : 0,
                        "noDelay" : true,
                        "keepAlive" : 1,
                        "encoding" : "utf8"
                    }
                }
            }
            ]
        }
    }
};