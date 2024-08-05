import express from 'express';
import { db, connectToDb } from './db.js'
const app = express();
app.use(express.json());


app.get('/api/events/:name', async (req, res) => {
    const { name } = req.params;
    const event = await db.collection('events').findOne({ name });

    if (event){
        res.send(event);
    } else {
        res.status(404).send('Event Not Found')
    }
});

app.post('/api/events/:name/comments', async (req, res) => {
    const { name } = req.params;
    const { postedBy, text } = req.body;

    await db.collection('events').updateOne({ name }, {
        $push: {comments: {postedBy, text} },
    });
    const event = await db.collection('events').findOne({name});

    if (event) {
        res.json(event);
    }
    else {
        res.send("That event doesn't exist");
    }
})

connectToDb(() => {
    console.log('Successfully connected to database')
    app.listen(8000, () => {
        console.log('Server is listening on port 8000');
    });
})

