const express=require('express');
const cors=require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app=express();
const port=process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.m5uzxbx.mongodb.net/?retryWrites=true&w=majority`;

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

    const toyCollection=client.db('toyPlace').collection('toys');

    const indexKeys={title:1,category:1};
    const indexOptions={name:"titleCategory"};

    const result=await toyCollection.createIndex(indexKeys,indexOptions);

    app.get('/toys/:text',async(req,res)=>{
      const searchText=req.params.text;
      const result=await toyCollection.find({
   $or:[
    {name:{$regex:searchText,$options:"i"}},
    {subCategory:{$regex:searchText,$options:"i"}},
   ],
      }).toArray();
      res.send(result);
    })

    app.post('/addtoy',async(req,res)=>{
      const body=req.body;
      body.createdAt=new Date();
      const result=await toyCollection.insertOne(body);
      res.send(result)
    
    })  

    app.get('/toys',async(req,res)=>{
        console.log(req.query.email);  
        let query={};
        if(req.query?.email){
          query={selleremail:req.query.email}
        } 
      const result=await toyCollection.find(query).sort({createdAt: -1}).toArray();
      res.send(result)
    })

  

    app.get('/toys',async(req,res)=>{
      const result=await toyCollection.find().toArray()
      res.send(result)
     
    })



  app.get('/toys/:_id', (req, res) => {
  const toyName = req.params.name;
  const toy = toys.find(toy => toy.name === toyName);
  if (toy) {
    res.json(toy);
  } else {
    res.status(404).json({ error: 'Toy not found' });
  }
});


   
    
  

       
    app.patch('/toys/:id',async(req,res)=>{
      const id=req.params.id;
      const filter={_id:new ObjectId(id)};
      const options={upsert:true};

      const updatedToy=req.body;
      // console.log(updatedToy);
      const toy={
        $set:{
         price:updatedToy.price,
        quantity:updatedToy.quantity,
        description:updatedToy.description 

        },
      };
      const result=await toyCollection.updateOne(filter,toy,options);
      res.send(result)
    })
     
    app.delete('/toys/:id',async(req,res)=>{
      const id=req.params.id;
      const query={_id:new ObjectId(id)}
      const result=await toyCollection.deleteOne(query);
      res.send(result);

    })

  
    app.get('/toys/:category',async(req,res)=>{
      console.log(req.params.category)
      if(req.params.category=='avengers'||req.params.category=='marvel'||req.params.category=='transformers'){
        const result=await toyCollection.find({ subCategory: req.params.category}).toArray();
        console.log(result);
        return res.send(result);
      }
      else{
        const result=await toyCollection.find().toArray();
        res.send(result);
      }
   
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


app.get('/',(req,res)=>{
    res.send('toy is running')
})

app.listen(port,()=>{
    console.log(`Toy server is running on port:${port}`)
})