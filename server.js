//Express 
const express = require('express');
const app = express();
const PORT = 3000;

//cors
const cors = require('cors');
app.use(cors());

//Import our database and model
const {sequelize} = require('./db');
const {Sauce} = require('./models/sauce');

const seed = require('./seed');

//serve static assets from public folder
app.use(express.static('public')) //

//allow express to read json request bodies
app.use(express.json())
app.use(express.urlencoded({extended:false}))

//seed our database
seed();

//*************** ROUTES ******************//

//get all sauces
app.get('/sauces', async (req, res) => {
    const sauces = await Sauce.findAll();
    res.json(sauces)
})

//get sauce by id
app.get('/sauces/:id', async (req, res) => {
    const sauce = await Sauce.findByPk(req.params.id);
    res.json({sauce}); //sauce json
})

//update sauce by id
app.put('/sauces/:id', async (req,res) => {
    let updatedSauce = await Sauce.update(req.body, {
        where: {id: req.params.id}
    })
    res.send(updatedSauce ? 'Updated' : 'Update Failed')
})

//render new-sauce form
app.get('/new-sauce', async (req, res) => {
    res.render('newSauceForm')
})

//render edit-sauce form
app.get('/edit-sauce/:id', async (req, res) => {
    const sauce = await Sauce.findByPk(req.params.id)
    res.render('editSauceForm', {sauce})
})

//Post Route triggered by form submit action
app.post('/new-sauce', async (req,res) =>{
    //Add sauce to db based on html form data
    const newSauce = await Sauce.create(req.body)
    //Find newSauce in db by id
    const foundSauce = await Sauce.findByPk(newSauce.id)
    if(foundSauce){
        res.send('succeess')
    } else {
        res.send('failed')
    }
})

//DELETE method, sauces/:id path => Deletes a sauce from db.sqlite
app.delete('/sauces/:id', async (req,res)=>{
    const deletedSauce = await Sauce.destroy({
        where: {id:req.params.id}
    })
    res.send(deletedSauce ? 'Deleted' : 'Deletion Failed')
})

//serving is now listening to PORT
app.listen(PORT, () => {
    console.log(`Your server is now listening to port ${PORT}`)
})