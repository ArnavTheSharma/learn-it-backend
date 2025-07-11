import { MongoClient } from 'mongodb';
let db;

async function connectToDb(cb){
    const client = new MongoClient(`mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.zxaj4uo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`);
    await client.connect();
    db = client.db('react-website-db'); 
    cb();
};

export {
    db,
    connectToDb,
};