const express = require("express")
const cors = require("cors")
const app = express()
const port = process.env.PORT || 5000;
app.use(cors())
app.use(express.json())
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');


app.get('/', (req,res)=>{
    res.send('news server is running')
})



const uri = `mongodb+srv://${process.env.USER_ID}:${process.env.USER_PASSWORD}@cluster0.q1fcrjh.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();
    const database = client.db('enigmaExpressNews')
    const allNews = database.collection('allNews')

    // get all of news data from mongodb
    app.get('/allNews', async(req,res)=>{
      const cursor = allNews.find();
      const result = await cursor.toArray();
      res.send(result);
    })



    // add news from add news form to mongodb
    app.post('/allNews', async (req,res)=>{
        const news = req.body;
        const result = await allNews.insertOne(news);
        res.send(result)
    })




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, ()=>{
    console.log(`the server is running at ${port}`)
})