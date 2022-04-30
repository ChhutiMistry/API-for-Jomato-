let express = require('express');
let app = express();
const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
const mongoUrl = "mongodb+srv://chhutimistry:testChhuti@cluster0.qmuiy.mongodb.net/Jomato?retryWrites=true&w=majority"
const dotenv = require('dotenv');
dotenv.config()
let port = process.env.PORT || 1600;
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cors());

// Welcome page
app.get('/',(req,res) => {
     res.send("<h1>Welcome to server of Jomato</h1>")
})

// City details
app.get('/city',(req,res) => {
     db.collection(`location`).find().toArray((err, result) => {
          if(err) throw err;
          res.send(result)
     })
})

// Restaurant details
app.get('/restaurant',(req,res) => {
     db.collection(`restaurant`).find().toArray((err, result) => {
          if(err) throw err;
          res.send(result)
     })
})

// Restaurant details on the basis of city and meal
app.get('/restaurants',(req,res) => {
     let query = {};
     let stateId = Number(req.query.state_id)
     let mealId = Number(req.query.meal_id)
     if(stateId){
          query = {state_id:stateId}
     }else if(mealId){
          query = {'mealTypes.mealtype_id':mealId}
     }
     db.collection('restaurant').find(query).toArray((err,result) => {
          if(err) throw err;
          res.send(result)
     })
})

// Meal details
app.get('/mealtype',(req,res) => {
     db.collection(`mealtype`).find().toArray((err, result) => {
          if(err) throw err;
          res.send(result)
     })
})

// Filters on the basis of cost, cuisine and mealtype
app.get('/filters/:mealId',(req,res) => {
     let sort = {cost:1}
     let mealId = Number(req.params.mealId)
     let cuisineId = Number(req.query.cuisineId)
     let lcost = Number(req.query.lcost)
     let hcost = Number(req.query.hcost)
     let query = {}
     if(req.query.sort){
          sort={cost:Number(req.query.sort)}
     }
     if(cuisineId){
          query = {
               "mealTypes.mealtype_id":mealId,
               "cuisines.cuisine_id":cuisineId
          }
     }else if(lcost && hcost){
          query = {
               "mealTypes.mealtype_id":mealId,
               $and:[{cost:{$gt:lcost,$lt:hcost}}]
          }
     }
     else{
          query = {
               "mealTypes.mealtype_id":mealId
          }
     }
     db.collection('restaurant').find(query).sort(sort).toArray((err,result) => {
          if(err) throw err;
          res.send(result)
     })
})

// Details of restaurants
app.get('/restaurantdetails/:id',(req,res) => {
     let restaurantId = Number(req.params.id);
     db.collection(`restaurant`).find({restaurant_id:restaurantId}).toArray((err, result) => {
          if(err) throw err;
          res.send(result)
     })
})

// Menu on the basis of restaurants
app.get('/menu', (req,res) => {
     let query = {}
     let restaurantId = Number(req.query.restaurantId)
     if(restaurantId){
          query = {restaurant_id:restaurantId}
     }
     db.collection('restaurantmenu').find(query).toArray((err,result) => {
          if(err) throw err;
          res.send(result)
     })
})

// Menu details of item selected on the basis of id
app.post('/menuItem',(req, res) => {
     console.log(req.body);
     if(Array.isArray(req.body)){
          db.collection('restaurantmenu').find({menu_id:{$in:req.body}}).toArray((err, result) => {
               res.send(result)
          })
     }else{
          res.send('Invalid Input')
     }
})

// Place Order
app.post('/placeOrder',(req, res) => {
     db.collection('orders').insert(req.body,(err, result) => {
          if(err) throw err;
          res.send('Order Placed')
     })
})

// View Order
app.get('/viewOrder',(req, res) => {
     let email = req.query.email;
     let query = {};
     if(email){
          query = {"email": email}
     }
     db.collection('orders').find(query).toArray((err, result) => {
          if(err) throw err;
          res.send(result)
     })
})

// Connection with db
MongoClient.connect(mongoUrl, (err, client) => {
     if(err) console.log(`Error while connecting`);
     db = client.db('Jomato');
     app.listen(port,() => {
          console.log(`Server is running on port ${port}`)
     })
})





     app.get('/filter/:mealType',(req,res) => {
     var sort = {cost:1}
     var skip = 0;
     var limit = 1000000000000;
     var mealType = Number(req.params.mealType);
     var query = {"mealTypes.mealtype_id":Number(mealType)};
     if(req.query.sortkey){
          sort = {cost:req.query.sortkey}
     }
     if(req.query.skip && req.query.limit){
          skip = Number(req.query.skip);
          limit = Number(req.query.limit)
     }
     if(req.query.cuisine && req.query.lcost && req.query.hcost){
          query={
               $and:[{cost:{$gt:Number(req.query.lcost),$lt:Number(req.query.hcost)}}],
               "cuisines.cuisine_id":Number(req.query.cuisine),
               "mealTypes.mealtype_id":Number(mealType)
          }
     }
     else if(req.query.cuisine){
          query = {"mealTypes.mealtype_id":mealType,"cuisines.cuisine_id":Number(req.query.cuisine) }
          //query = {"type.mealtype":mealType,"Cuisine.cuisine":{$in:["1","5"]}}
     }
     else if(req.query.lcost && req.query.hcost){
          var lcost = Number(req.query.lcost);
          var hcost = Number(req.query.hcost);
          query={$and:[{cost:{$gt:lcost,$lt:hcost}}],"mealTypes.mealtype_id":Number(mealType)}
     }
     db.collection('restaurant').find(query).sort(sort).skip(skip).limit(limit).toArray((err,result)=>{
          if(err) throw err;
          res.send(result)
     })
     })