//Express 
const express = require('express');
const app = express();
const PORT = 3000;

//import bcrypt for encrypted password storage
const bcrypt = require('bcrypt')
//set the number of saltrounds
const saltRounds = 10;

//cors
const cors = require('cors');
app.use(cors());

//import express-session and cookie-parser for session data
const session = require('express-session');
const cookieParser = require('cookie-parser')

//Handlebars
const Handlebars = require('handlebars');
const expressHandlebars = require('express-handlebars');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access') 

//Import our database and model
const {sequelize} = require('./db');
const {Sauce} = require('./models/sauce');

const seed = require('./seed');
const { User } = require('./models/user');

//Set up our templating engine with handlebars
const handlebars = expressHandlebars({
    handlebars: allowInsecurePrototypeAccess(Handlebars)
})
app.engine('handlebars', handlebars);
app.set('view engine', 'handlebars'); // To render template files, set the following application setting properties, set in app.js in the default app created by the generator:

//serve static assets from public folder
app.use(express.static('public')) //

//allow express to read json request bodies
app.use(express.json())
app.use(express.urlencoded({extended:false}))

//configure app to use session and cookie parser
app.use(cookieParser())
app.use(session({
    secret: 'secretkeyfornow',
    resave: false,
    saveUninitialized: true,
}))

//seed our database
seed();

//*************** ROUTES ******************//
//index redirects to sauces
// app.get('/', (req,res)=>{
//     res.redirect('/sauces')
// })

//get all sauces
app.get('/sauces', async (req, res) => {
    const sauces = await Sauce.findAll();
    let user = 'Guest'
    if(req.session.username){
        user = req.session.username
    }
    res.json(sauces)
})

//get sauce by id
app.get('/sauces/:id', async (req, res) => {
    const sauce = await Sauce.findByPk(req.params.id);
    let admin = false
    if (req.session.username == 'michael'){
        admin = true
    }
    console.log(req.session.username,admin)
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
    //Create a sauceAlert to pass to the template
    let sauceAlert = `${newSauce.name} added to your database`
    //Find newSauce in db by id
    const foundSauce = await Sauce.findByPk(newSauce.id)
    if(foundSauce){
        res.render('newSauceForm',{sauceAlert})
    } else {
        sauceAlert = 'Failed to add Sauce'
        res.render('newSauceForm',{sauceAlert})
    }
})

//DELETE method, sauces/:id path => Deletes a sauce from db.sqlite
app.delete('/sauces/:id', async (req,res)=>{
    const deletedSauce = await Sauce.destroy({
        where: {id:req.params.id}
    })
    res.send(deletedSauce ? 'Deleted' : 'Deletion Failed')
})

//get route to render signup form
app.get('/signup', (req,res) => {
    let alert = ""
    res.render('signup', {alert})
})

//post route for user signup action
app.post('/signup', async (req,res) => {
    //access username, password, and password confirmation from an html form
    const username = req.body.username
    const password = req.body.password
    const confirm = req.body.confirm

    //search for duplicate username
    const findDupe = await User.findOne({where: {username: username}})

    //check that passwords match
    //if not, signup fails
    if (password !== confirm){
        let alert = "passwords must match"
        res.render('signup', {alert})
        //if username taken, signup fails
    } else if (findDupe) {
        let alert = "username taken"
        res.render('signup', {alert})
    } else {
        bcrypt.hash(password, saltRounds, async function (err,hash){
            const newUser = await User.create({'username':username, 'password':hash})
            //render form again
            //storing user id and username in session data
            req.session.userid = newUser.id
            req.session.username = newUser.username
            let alert = `Welcome ${username}!`
            res.render('signup', {alert})
        })

    }
})


//render the signin form
app.get('/signin', (req,res) => {
    let alert = ""
    res.render('signin', {alert})
})

//post new user signin
app.post('/signin', async (req,res) => {
    //find one username where username in bd matches the form username
    const thisUser = await User.findOne({where : {username: req.body.username}})
    //if that user doesn't exist, signin fails
    if (!thisUser){
        let alert = 'user not found'
        res.render('signin', {alert})
    } else {
        //compare form password to hashed password in bcrypt
        bcrypt.compare(req.body.password, thisUser.password, async function (err,result){
            if (result){
                req.session.userid = thisUser.id
                req.session.username = thisUser.username
                let alert = `Welcome back ${thisUser.username}!`
                res.render('signin', {alert})
                //if passwords dont match, signin fails
            } else {
                let alert = 'wrong password'
                res.render('signin', {alert})
            }
        })
    }
})

//get route to logout user
app.get('/logout', (req,res)=>{
    req.session.destroy(function(err) {
        res.redirect('/sauces')
    })
})

//serving is now listening to PORT
app.listen(PORT, () => {
    console.log(`Your server is now listening to port ${PORT}`)
})