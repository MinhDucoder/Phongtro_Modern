import { createClient } from 'redis';

const client = createClient({
    username: 'default',
    password: 'bDH2DjmLqwl2QJZOvkhyDZz3GSiqO7qV',
    socket: {
        host: 'redis-13833.crce178.ap-east-1-1.ec2.redns.redis-cloud.com',
        port: 13833
    }
});

client.on('error', err => console.log('Redis Client Error', err));

await client.connect();