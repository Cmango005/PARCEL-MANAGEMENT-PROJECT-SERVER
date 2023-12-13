const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.h0tacow.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const menuCollection = client.db('parcel-management-db').collection('menu');
        const userCollection = client.db('parcel-management-db').collection('users');
        const orderCollection = client.db('parcel-management-db').collection('order');

        app.get('/dashboard/menu', async (req, res) => {
            const result = await menuCollection.find().toArray();
            res.send(result);
        })
        app.get('/users', async (req, res) => {
            const result = await userCollection.find().toArray();
            res.send(result);
        })
        app.get('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await userCollection.findOne(query);
            res.send(result);
        })
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;

            const query = { email: email };
            const user = await userCollection.findOne(query);
            let admin = false;
            if (user) {
                admin = user?.role === "Admin"
            }
            res.send({ admin });
        })
        app.get('/users/delivery-man/:email', async (req, res) => {
            const email = req.params.email;

            const query = { email: email };
            const user = await userCollection.findOne(query);
            let deliveryMan = false;
            if (user) {
                deliveryMan = user?.role === "Delivery-Man"
            }
            res.send({ deliveryMan });
        })
        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email };
            const existingUser = await userCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: 'User already exist', insertedId: null })
            }

            const result = await userCollection.insertOne(user);
            res.send(result);

        })
        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedDoc = {
                $set: {
                    role: "Admin"
                }
            }
            const result = await userCollection.updateOne(filter, updatedDoc);
            res.send(result)
        })
        app.patch('/users/delivery-man/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedDoc = {
                $set: {
                    role: "Delivery-Man"
                }
            }
            const result = await userCollection.updateOne(filter, updatedDoc);
            res.send(result)
        })
        app.get('/order', async (req, res) => {
            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await orderCollection.find(query).toArray();
            res.send(result);
        })
        app.post('/order', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result);
        })
        app.get('/order/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await orderCollection.findOne(query);
            res.send(result);
        })
        app.patch('/order/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const newUpdate = req.body;
            const updatedDoc = {
                $set: {
                    status: newUpdate.status ,
                    deliveryMan :newUpdate.deliveryMan,
                    deliveryDate : newUpdate.deliveryDate,
                    review : newUpdate.review
                }
            }

            const result = await orderCollection.updateOne(filter, updatedDoc);
            res.send(result);
        })
        app.put('/order/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const newUpdate = req.body;
            const updatedDoc = {
                $set: {
                    phoneNumber: newUpdate.phoneNumber,
                    itemName: newUpdate.itemName,
                    parcelWeight: newUpdate.parcelWeight,
                    receiverName: newUpdate.receiverName,
                    receiverPhoneNumber: newUpdate.receiverPhoneNumber,
                    parcelDeliveryAddress: newUpdate.parcelDeliveryAddress,
                    requestedDeliveryDate: newUpdate.requestedDeliveryDate,
                    deliveryAddressLatitude: newUpdate.deliveryAddressLatitude,
                    deliveryAddressLongitude: newUpdate.deliveryAddressLongitude,
                    price: newUpdate.price,
                }
            }

            const result = await orderCollection.updateOne(filter, updatedDoc);
            res.send(result);
        })
        app.delete('/order/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await orderCollection.deleteOne(query);
            res.send(result)
        })
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        //await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('parcel on the way');
})
app.listen(port, () => {
    console.log(`parcel server is running at port ${port}`)
})