const express = require("express");
//require basicAuth
const basicAuth = require('express-basic-auth');
//require bcrypt
const bcrypt = require('bcrypt');
// set salt
const saltRounds = 2;

//get api key from env
const apiKey = process.env.API_KEY;
//import axios
const axios = require('axios');


const {User, Item,} = require('./models');
const { use } = require("bcrypt/promises");

// initialise Express
const app = express();

// specify out request bodies are json
app.use(express.json());

//configure basicAuth
app.use(basicAuth({
  authorizer : dbAuthorizer,
  authorizeAsync : true,
  unauthorizedResponse : () => "You do not have access to this content."
}))

//function to compare username and password
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
app.get('/', (req, res) => {
  res.send('<h1>App Running</h1>')
})

// returns all items
app.get('/items', async(req, res) =>{
    let items = await Item.findAll();
    res.json({items});
  })
// returns one item by id
app.get(`/items/:id`, async (req,res) => {
    const singleitems = await Item.findByPk(req.params.id);
    res.json({singleitems});
  })

 
//return one item by name
// app.get('/item-name/:name', async(req,res)=>{   
//   const thisItem = await Item.findOne({where:{name: req.params.name}})
//   res.json(thisItem)

// returns all users
app.get('/users', async(req, res) =>{
    let users = await User.findAll();
    res.json({users});
  })
// returns one user by id
  app.get(`/users/:id`, async (req,res) => {
    const singleusers = await User.findByPk(req.params.id);
    res.json({singleusers});
  })
// creates one new item
app.post('/items', async(req,res) =>{
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

app.get('/schools', async(req, res) =>{
  let schools = await School.findAll();
  res.json({schools});
})

// app.get('user/schools', async(req, res) =>{
//   let schools = await School.findAll();
//   res.json({schools});
// })

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
// })


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