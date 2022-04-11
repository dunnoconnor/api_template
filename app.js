const express = require("express");
//require basicAuth
const basicAuth = require('express-basic-auth');
//require bcrypt
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const bcrypt = require('bcrypt');
// set salt
const saltRounds = 2;

const apiKey = process.env.API_KEY;
const jwt = require('express-jwt');
const jwks = require('jwks-rsa');

// //import axios
const axios = require('axios');

const {User, Item, School, Favorites, Favorite} = require('./models');
const { use } = require("bcrypt/promises");
const { application } = require("express");
const { sequelize } = require("./db");

// initialise Express
const app = express();

// Allow express to read json request bodies
app.use(express.json());

const jwtCheck = jwt({
  secret: jwks.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: 'https://dev-bl8uap80.us.auth0.com/.well-known/jwks.json'
}),
audience: 'http://localhost:3000',
issuer: 'https://dev-bl8uap80.us.auth0.com/',
algorithms: ['RS256']
});

// app.use(jwtCheck);


// // configure basicAuth
// app.use(basicAuth({
//   authorizer : dbAuthorizer,
//   authorizeAsync : true,
//   unauthorizedResponse : () => "You do not have access to this content"
// }))

// compare username and password with db content
// return boolean indicating password match
async function dbAuthorizer(username, password, callbak){
  try {
    // get matching user from db
    const user = await User.findOne({where: {name:username}})
    // if username is valid compare passwords
    let isValid = (user != null ) ? await bcrypt.compare(password, user.password) : false;
    callbak(null, isValid)
  } catch(err) {
    //if authorize fails, log error
    console.log("Error: ", err)
    callbak(null, false)
  }
}


// routes go here
app.get('/', (req, res) => {
  res.send('<h1>App Running</h1>')
})

app.get(`/items`, async (req,res) => {
  const items = await Item.findAll();
  res.json({items});
})

app.get(`/users/:userid/favorites`, async (req,res) => {
  const favorites = await User.findAll({ 
    where: {id: req.params.userid}, 
      attributes: { exclude: ['password']}, 
        include: { model: School }
      });
   
  res.json({favorites});
 }); 

app.get(`/items/:id`, async (req,res) => {
  const singleitems = await Item.findByPk(req.params.id);
  res.json({singleitems});
})

app.get(`/users`, jwtCheck, async (req,res) => {
  const users = await User.findAll();
  res.json({users});
})

app.get(`/users/:id`, jwtCheck, async (req,res) => {
  const users = await User.findOne(
    {where: {id: req.params.id}});
  res.json({users});
})

app.get(`/school`, jwtCheck, async (req,res) => {
  const schools = await School.findAll();
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

app.put(`/items/:id`, async (req,res) => {
  const updatedItem = await Item.update(req.body, 
    {where: {id: req.params.id}});
  res.send(`Item ${updatedItem.id} has been updated`);
})
app.post(`/items`, async (req,res) => {
   const newitem = await Item.create(req.body)
   res.send( `${newitem.name} has been created!`);
 })

app.post(`/users/:userid/favorites`, async (req,res) => {
  const favorites = await Favorite.create({
    'UserId': req.params.userid,
    'SchoolId': req.body.schoolid
  })
    res.send(`${favorites.SchoolId} has been added to your favorites`)
})

app.post(`/users`, async (req,res) => {
bcrypt.hash(req.body.password,saltRounds, async function(err,hash){
  let newUser = await User.create({'name':req.body.name, 'password':hash});
  console.log(hash)
  res.json({newUser})
})

app.delete(`/items/:id`, async (req,res) => {
  const deleteItem = await Item.destroy({
    where: {id: req.params.id}
  });
  res.send( `Oh no...item number ${req.params.id} has been deleted!!!`)
})

// app.delete(`/favorites/:userid`, async (req,res) => {
//   const deletefave = await Favorites.this.destroy({
//     where: {userid: req.params.userid} & {schoolid: req.params.schoolid}
//   });
//   console.log(deletefave)
  // res.send( `Oh no...item number ${Favorites.schoolname} has been deleted!!!`)
})
})

// app.post('/sessions', async(req,res) => {
//   const thisUser = await User.findOne({
//     where: {name: req.body.name}
//   });
//   if(!thisUser){
//     res.send('User not found')
//   } else {
//     bcrypt.compare(req.body.password, thisUser.password, async function (err, result){
//     if(result){
//       res.json(thisUser)
//     } else {
//       res.send("Passwords do not match")
//     }
//   })
//   }    
//   })


  app.listen(3000, () => {
    console.log("Server running on port 3000");
  });  