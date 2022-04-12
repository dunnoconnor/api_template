const path = require('path');
const fs = require('fs').promises;
const bcrypt = require('bcrypt');
const axios = require('axios');
const {sequelize} = require('./db');
const {User, Item, School, Favorite} = require('./models');

const createUsers = async () => {

    let pw1 = await bcrypt.hash('1234', 2)
    let pw2 = await bcrypt.hash('password', 2)

    const users = [
        {name : 'Dan', password: pw1 },
        {name : 'Linda', password : pw2}
    ];

    return users
}

const createFavorites = async () => {

    console.log(favorites)
    return favorites
  }

const createSchools = async () => {
    const url = 'https://api.data.gov/ed/collegescorecard/v1/schools.json?school.minority_serving.historically_black=1&fields=id,school.name,school.state,school.city,school.school_url,latest.student.size,student.grad_students,student.demographics.women,latest.student.demographics.men,cost.attendance.academic_year,latest.cost.tuition.in_state,cost.tuition.out_of_state,latest.academics.program_reporter.programs_offered,latest.admissions.test_requirements&page=0&per_page=51&api_key=8Ajj4V22PvwDtL2ocDvut35YqCXArI2TVhvQWfvE';
  axios.get(url)
  .then(function (response) {
    //if successful 
    // console.log(response.data.results);
    const schools= createSchoolsArray1(response.data.results)
 

  })
  .catch(function (error) {
    //if error
    console.log(error);
  })

}

function createSchoolsArray1(results){
    let schoolResults = [];

    results.map(i => (
        School.create(
            {
                fafsa: i['ope6_id'],
                sid: i['id'],
                name: i['school.name'],
                city : i['school.city'],
                state : i['school.state'],
                women : i['latest.student.demographics.women'],
            })))
    // console.log(schoolResults)
    return(schoolResults)

        
        };

const items = [
    {name : 'Gold'},
    {name : 'Silver'},
    {name : 'Paladium'}
];


const seed = async (schools) => {

    await sequelize.sync({ force: true });

    const users = await createUsers(); // create users w/ encrypted passwords
    await createSchools();
    const userPromises = users.map(user => User.create(user))
    const itemPromises = items.map(item => Item.create(item))
    // const schoolPromises = schools.map(school => School.create(school))
    await Promise.all([...userPromises, ...itemPromises]);
    console.log("db populated!")
    
}

seed ();