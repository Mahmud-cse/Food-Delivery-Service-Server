const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config()
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;

const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ehrxz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("delivery");
        const servicesCollection = database.collection("services");
        const ordersCollection = database.collection("orders");

        // GET API
        // Load all data in server site from services collection
        app.get('/services', async (req, res) => {
            const cursor = servicesCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        });

        // Load all data in server site from order collection
        app.get('/orders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        });

        // Update API
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            // const updatedProduct = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: "approved"
                },
            };
            const result = await ordersCollection.updateOne(filter, updateDoc, options);
            console.log("updating Products ", id);
            res.json(result);
        })

        //POST API
        // Add data to service collection
        app.post('/addService', async (req, res) => {
            const service = req.body;
            // console.log('Hit the post API with data',service);
            const result = await servicesCollection.insertOne(service);
            console.log(result);
            res.json(result);
        });

        // Add data to orders collection
        app.post('/addOrder', async (req, res) => {
            const order = req.body;
            // console.log('Hit the post API with data',service);
            const result = await ordersCollection.insertOne(order);
            console.log(result);
            res.json(result);
        });

        // use POST to get data by email
        // app.post('/myOrder', async (req, res) => {
        //     const keys = req.body;
        //     console.log(keys);
        //     res.send('value');
        //     const query = { email: { $in: keys } };
        //     const result = await ordersCollection.find(query).toArray();
        //     res.json(result);
        // });

        // DELETE API
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.json(result);
        });

    } finally {
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Running Delivery Server');
});

app.listen(port, () => {
    console.log('Running Delivery Server on Port', port);
});