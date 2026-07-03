const { createClient } = require('redis');

const clientOptions = {};

if (process.env.REDIS_URL) {
    clientOptions.url = process.env.REDIS_URL;
} else {
    clientOptions.username = 'default';
    clientOptions.password = process.env.REDIS_PASSWORD;
    clientOptions.socket = {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT || '12236')
    };
}

const redisClient = createClient(clientOptions);

module.exports = redisClient;