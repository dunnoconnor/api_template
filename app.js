const express = require("express");
//require basicAuth
const basicAuth = require('express-basic-auth');
//require bcrypt
const bcrypt = require('bcrypt');
// set salt
const saltRounds = 2;

const apiKey = process.env.API_KEY;
const jwt = require('express-jwt');
const jwks = require('jwks-rsa');

// //import axios
const axios = require('axios');

const {User, Item, School, Favorites} = require('./models');
const { use } = require("bcrypt/promises");
const { application } = require("express");

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
app.get(`/favorites`, async (req,res) => {
  const favorites = await Item.findAll();
  res.json({favorites});
})

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
  const schoolsname = await School.findOne(
    {where : {name: req.params.name}});
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
 //res.json({newitem})
})

// app.post(`/favorites`, async (req,res) => {
//   const favorite = await Favorites.create(req.body)
//   console.log(favorite)
//   //res.json({newitem})
// })

app.delete(`/items/:id`, async (req,res) => {
  const deleteItem = await Item.destroy({
    where: {id: req.params.id}
  });
  res.send( `Oh no...item number ${req.params.id} has been deleted!!!`)
})
app.post(`/users`, async (req,res) => {
bcrypt.hash(req.body.password,saltRounds, async function(err,hash){
  let newUser = await User.create({'name':req.body.name, 'password':hash});
  console.log(hash)
  res.json({newUser})
})
})
// app.get(`/schools`, async(req, res) => {
//   const url = `https://api.data.gov/ed/collegescorecard/v1/schools.json?school.minority_serving.historically_black=1&fields=id,school.name,school.state,school.city,school.school_url,latest.student.size,student.grad_students,student.demographics.women,latest.student.demographics.men,cost.attendance.academic_year,latest.cost.tuition.in_state,cost.tuition.out_of_state,latest.academics.program_reporter.programs_offered,latest.admissions.test_requirements&page=0&per_page=51&api_key=8Ajj4V22PvwDtL2ocDvut35YqCXArI2TVhvQWfvE`;
//   axios.get(url)
//   .then(function (response) {
//     //if successful 
//     console.log(response.data.results.latest);
//     res.json(response.data.results)
//   })
//   .catch(function (error) {
//     //if error
//     console.log(error);
//   })
// });


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