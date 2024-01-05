const express = require("express")
const cors = require("cors")
const cookieParser = require('cookie-parser')
const app = express()
const jwt = require('jsonwebtoken')
const port = process.env.PORT || 5000;

app.use(cookieParser())
// middleware
app.use(cors())

app.use(express.json())
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


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
    const users = database.collection('user')
    const coverData = database.collection('coverData')

    // jwt related api
    app.post('/jwt', async(req,res)=>{
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN, {expiresIn: '1h'}) 
      res.send({ token });
    })

    // middle ware
    const verifyToken = (req, res, next) =>{
      // console.log(req.headers)
      if(!req.headers.authorization){
        return res.status(401).send ({message: 'unauthorize access' })
      }
      const token = req.headers.authorization.split(' ')[1]
      jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded)=>{
        if(err){
          return res.status(401).send({message: 'unauthorize access'})
        }
        req.decoded = decoded;
        next()
      })
    }

    // verify admin 
    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await users.findOne(query);
      const isAdmin = user?.role === 'admin';
      if (!isAdmin) {
        return res.status(403).send({ message: 'forbidden access' });
      }
      next();
    }

    // server related api
    // get all of news data from mongodb
    app.get('/allNews', async(req,res)=>{
      const cursor = allNews.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    // app.get('/coverData', async(req,res)=>{
    //   const cursor = coverData.find()
    //   const result = await cursor.toArray()
    //   res.send(result)
    // })

    app.get('/user', async(req,res)=>{
      const cursor = users.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    // verify admin
    // app.get('/user/admin/:email', verifyToken, async(req,res) =>{
    //   const email = req.params.email;
    //   if(email !== req.decoded.email){
    //     return res.status(403).send({message : 'forbidden access'})
    //   }
    //   const query = {email: email};
    //   const user = await users.findOne(query)
    //   const admin = false;
    //   if(user){
    //     admin = user?.role === 'admin';
    //   }
    //   res.send({admin});
    // })

    // post user
    app.post('/user', async(req,res)=>{
      const user = req.body;
      const query = {email : user.email}
      const existingUser = await users.findOne(query)
      if(existingUser){
        return res.send({message: 'user already exists', insertedId: null})
      }
      const result = await users.insertOne(user);
      res.send(result)
    })


    // add news from add news form to mongodb
    app.post('/allNews', async (req,res)=>{
        const news = req.body;
        const result = await allNews.insertOne(news);
        res.send(result)
    })

    // delete news
    app.delete('/allNews/:id', async(req,res)=>{
      const id = req.params.id
      const query = {_id: new ObjectId(id)}
      const result = await allNews.deleteOne(query)
      res.send(result)
    })

    // delete user
    app.delete('/user/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await users.deleteOne(query)
      res.send(result)
    })

    // Make admin
    app.patch('/user/admin/:id', async(req,res)=>{
      const id = req.params.id;
      const filter = {_id : new ObjectId(id)}
      const updateDoc = {
        $set: {
          role: 'admin' 
        }
      }
      const result = await users.updateOne(filter, updateDoc)
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