const express = require("express");
//require basicAuth
const basicAuth = require('express-basic-auth');
//require bcrypt
const bcrypt = require('bcrypt');
// set salt
const saltRounds = 2;

const {User, Item} = require('./models');
const { use } = require("bcrypt/promises");
const { application } = require("express");

// initialise Express
const app = express();

// specify out request bodies are json
app.use(express.json());

// routes go here
app.get('/', (req, res) => {
  res.send('<h1>App Running</h1>')
})

app.get(`/items`, async (req,res) => {
  const items = await Item.findAll();
  res.json({items});
})

app.get(`/items/:id`, async (req,res) => {
  const singleitems = await Item.findByPk(req.params.id);
  res.json({singleitems});
})
app.get(`/users`, async (req,res) => {
  const users = await User.findAll();
  res.json({users});
})

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

app.post('/sessions', async(req,res) => {
  const thisUser = await User.findOne({
    where: {name: req.body.name}
  });
  if(!thisUser){
    res.send('User not found')
  } else {
    bcrypt.compare(req.body.password, thisUser.password, async function (err, result){
    if(result){
      res.json(thisUser)
    } else {
      res.send("Passwords do not match")
    }
  })
  }    
  })
})

  app.listen(3000, () => {
    console.log("Server running on port 3000");
  })