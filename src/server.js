import fs from 'fs';
import admin from 'firebase-admin';
import express from 'express';
import { db, connectToDb } from './db.js'
import 'dotenv/config';

import { fileURLToPath } from 'url';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const credentials = JSON.parse(
    fs.readFileSync('./credentials.json')
    //note we usually don't do this for secrecy but since this is something that happens before we load our server we should be fine
);
admin.initializeApp({
    credential: admin.credential.cert(credentials),
});


const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../build')));

app.get(/^(?!\/api).+/, (req, res) => {
    res.sendFile(path.join(__dirname, '../build/index.html'))
});


app.use(async (req, res, next) => {
    const { authToken } = req.headers;
 
     if (authToken) {
         try {
             req.user = await admin.auth().verifyIdToken(authToken);
         } catch (e) {
             return res.sendStatus(400);
         }
     }

     req.user = req.user || {};
 
     next ();
 });


app.get('/api/events/:name', async (req, res) => {
    const { name } = req.params;
    const { uid } = req.user;
    const event = await db.collection('events').findOne({ name });

    if (event){
        const commentIds = event.commentIds || [];
        res.send(event);
    } else {
        // res.status(404).send('Event Not Found')
    }
});

app.use((req, res, next) => {
    if (req.user) {
        next();
    } else {
        res.sendStatus(401);
    }
})

app.post('/api/events/:name/comments', async (req, res) => {
    const { name } = req.params;
    const { uid } = req.user;
    const { text } = req.body;
    const { email } = req.user;

    await db.collection('events').updateOne({ name }, {
        $push: {comments: {postedBy: email, text} },
    });
    const event = await db.collection('events').findOne({ name });

    if (event){
        // const commentIds = event.commentIds || [];
        
        // const { postedBy, text } = req.body;
        // const updatedEvent = await db.collection('events').findOne({name});

        res.json(event);
    } else {
        res.send("That event doesn't exist");
    }
})

const PORT = process.env.PORT || 8000;

connectToDb(() => {
    console.log('Successfully connected to database')
    app.listen(PORT, () => {
        console.log('Server is listening on port ' + PORT);
    });
})

