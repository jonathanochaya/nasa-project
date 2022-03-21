const mongoose = require('mongoose');

const MONGO_URL = process.env.MONGO_URL;

mongoose.connection.on('open', () => {
    console.log('Mongo Db Connected!!!')
});

mongoose.connection.on('error', (err) => {
    console.error(err);
});

async function connectMongo() {
    await mongoose.connect(MONGO_URL, {
        useNewUrlParser: true
    })
}

async function disconnectMongo() {
    await mongoose.disconnect();
}

module.exports = {
    connectMongo,
    disconnectMongo
}