// requires
const express = require("express");
const bcrypt = require('bcrypt');

const basicAuth = require('express-basic-auth');
const Sequelize = require("sequelize");
const Op = Sequelize.Op;


// set salt
const saltRounds = 2;

//get api key from env
const apiKey = process.env.API_KEY;

//dependencies for jwt Auth0
const jwt = require('express-jwt');
const jwks = require('jwks-rsa');
const cors = require('cors'); 
var request = require("request");

//import axios
const axios = require('axios');

require('dotenv').config('.env');

const {User, Item, School, Favorites, Favorite} = require('./models');
const { use } = require("bcrypt/promises");
const { application } = require("express");
const { sequelize } = require("./db");

// initialise Express
const app = express();

//allow cross-origin resource sharing
app.use(cors());

// allow express to read json request bodies
app.use(express.json());

//configure jwTs OAuth
const jwtCheck = jwt({
  secret: jwks.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: 'https://dev-52yany8j.us.auth0.com/.well-known/jwks.json'
     
}),
audience: 'http://localhost:3000',
issuer: 'https://dev-52yany8j.us.auth0.com/',
algorithms: ['RS256']
});


// configure basicAuth
app.use(basicAuth({
  authorizer : dbAuthorizer,
  authorizeAsync : true,
  unauthorizedResponse : () => "You do not have access to this content."
}))

//get Auth0
app.get('/tokens', async(req,res) =>{
  const options = { method: 'POST',
    url: `${process.env.AUTH0_URL}`,
    headers: { 'content-type': 'application/json' },
    body: `{"client_id":${process.env.CLIENT_ID},"client_secret":${process.env.CLIENT_SECRET},"audience":${process.env.AUDIENCE},"grant_type":"client_credentials"}`
  };
  console.log(process.env.CLIENT_ID,process.env.CLIENT_SECRET,process.env.AUDIENCE,process.env.AUTH0_URL) 
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    const jsonBody = JSON.parse(body)
    const token = jsonBody.access_token
    console.log("New JWT sent to authenticated user")
    res.json(token)
  });
})



//function to compare username and password with db content
//return boolean indicating a passwor match
async function dbAuthorizer(username,password, callback){
  try{
    //get matching user from db
    const user = await User.findOne({where: {name:username}})
    //if user is valid, compare passwords
    let isValid = (user !=null) ? await bcrypt.compare(password, user.password): false;
    console.log(isValid)
    callback(null, isValid)
  } catch(err) {
    //if authorize fails, log error
    console.log("Error:", err)
    callback(null, false)
  }
}


// routes go here
// Method GET
app.get('/', jwtCheck, (req, res) => {
  res.send('<h1>App Running</h1>')
})

// returns all items
app.get('/items', jwtCheck, async(req, res) =>{
    let items = await Item.findAll();
    res.json({items});
  })
// returns one item by id
app.get(`/items/:id`, jwtCheck, async (req,res) => {
    const singleitems = await Item.findByPk(req.params.id);
    res.json({singleitems});
  })
 
// returns all users
app.get('/users', jwtCheck, async(req, res) =>{
    let users = await User.findAll();
    res.json({users});
  })
// returns one user by id
  app.get(`/users/:id`, jwtCheck, async (req,res) => {
    const singleusers = await User.findByPk(req.params.id);
    res.json({singleusers});
  })

  app.get(`/users/:userid/favorites`, async (req,res) => {
    const favorites = await User.findAll({ 
      where: {id: req.params.userid}, 
        attributes: { exclude: ['password']}, 
          include: { model: School }
        });
     
    res.json({favorites});
   }); 

   app.get('/schools', jwtCheck, async(req, res) =>{
    let schools = await School.findAll();
    res.json({schools});
  })
  
  app.get(`/school/:id`, async (req,res) => {
    const singleschool = await School.findByPk(req.params.id);
    res.json({singleschool});
  })
  
  app.get(`/schoolname/:name`, async (req,res) => {
    const searchTerm = req.params.name;
      const schoolsname = await School.findAll(
      {where : {name: {[Op.like] : `%${searchTerm}%`}}});
     res.json({schoolsname});  
  
  })  
  app.get(`/schoolstate/:state`, async (req,res) => {
    const schoolsbyst = await School.findAll(
      {where : {state: req.params.state}});
    res.json({schoolsbyst});  
  })
  
  app.get(`/schoolcity/:city`, async (req,res) => {
    const schoolscity = await School.findAll(
      {where : {city: req.params.city}});
    res.json({schoolscity});  
  })
  
  // app.get(`/schoolowner/:ownership`, async (req,res) => {
  //   const schoolsowner = await School.findOne(req.body,
  //     {where : {ownership: req.params.ownership}});
  //   res.json({schoolsowner});  
  // })



// Method POST
// creates one new item
app.post('/items',async(req,res) =>{
  let newItem = await Item.create(req.body);
  res.json({newItem})
})

// creates one new user Signup and Signin
app.post('/users', async(req,res) =>{
  
  bcrypt.hash(req.body.password,saltRounds, async function(err,hash){
    let newUser = await User.create({'name':req.body.name, 'password':hash});
    console.log(hash)
    res.json({newUser})
  })

})

app.post(`/users/:userid/favorites`, async (req,res) => {
  const favorites = await Favorite.create({
    'UserId': req.params.userid,
    'SchoolId': req.body.SchoolId
  })
    res.send(`${favorites.SchoolId} has been added to your favorites`)
})



// app.post('/sessions', async(req,res) =>{
//   const thisUser = await User.findOne({
//     where: {name:req.body.name}
//   });
//   if(!thisUser){
//     res.send('User not found')
//   } else {
//     bcrypt.compare(req.body.password, thisUser.password, async function (err, result){
//       if(result){
//         res.json(thisUser)
//       } else {
//         res.send("Passwords do not match")
//       }
//     })
//   }
// })

// Method PUT
//update one item by id
app.put('/items/:id', async (req,res) => {
  let updatedItem = await Item.update(req.body, {
      where : {id: req.params.id}
  })
  res.send(updatedItem ? "Item Updated" : "update Failed")
})
//update one user by id
app.put('/users/:id', async (req,res) => {
  let updatedUser = await User.update(req.body, {
      where : {id: req.params.id}
  })
  res.send(updatedUser ? "User Updated" : "update Failed")
})


// Method DELETE
//DELETE method, items/:id path => Deletes an item from db.sqlite
app.delete("/items/:id", async (req, res) => {
  const deletedItem = await Item.destroy({
    where: { id: req.params.id },
  });
  res.send(deletedItem ? "Deleted" : "Deletion Failed");
});

app.delete("/users/:id", async (req, res) => {
  const deletedUser = await User.destroy({
    where: { id: req.params.id },
  });
  res.send(deletedUser ? "Deleted" : "Deletion Failed");
});



app.listen(3000, () => {
  console.log("Server running on port 3000");
});