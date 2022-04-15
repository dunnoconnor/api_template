const path = require('path');
const fs = require('fs').promises;
const bcrypt = require('bcrypt');
const axios = require('axios');
const {sequelize} = require('./db');
const {User, Item, School, Favorite, Major} = require('./models');

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

const createSchools = async (page) => {
    const url = `https://api.data.gov/ed/collegescorecard/v1/schools.json?school.minority_serving.historically_black=1&fields=id,ope6_id,school.name,school.state,school.city,school.zip,location.lat,location.lon,school.ownership,school.school_url,school.carnegie_size_setting,latest.student.size,latest.student.demographics.women,latest.student.demographics.men,school.institutional_characteristics.level,school.open_admissions_policy,latest.cost.tuition.in_state,latest.cost.tuition.out_of_state,academics.program_reporter.programs_offered,latest.cost.booksupply,latest.cost.roomboard.oncampus,latest.cost.roomboard.offcampus,latest.admissions.test_requirements,latest.earnings.6_yrs_after_entry.median_earnings_independent,latest.programs.cip_4_digit.title&page=${page}&per_page=99&api_key=8Ajj4V22PvwDtL2ocDvut35YqCXArI2TVhvQWfvE`;
  axios.get(url)
  .then(function (response) {
   
    const schools= createSchoolsArray1(response.data.results)
 

  })
  .catch(function (error) {
    //if error
    console.log(error);
  })

}

function createSchoolsArray1(results){
    
    for (i of results){
        // console.log(i)
        let majorList = (i['latest.programs.cip_4_digit'])
        School.create(
            {
                id: i['id'],
                fafsa: i['ope6_id'],
                name: i['school.name'],
                city : i['school.city'],
                state : i['school.state'],
                zip: i['school.zip'],
                latitude: i['location.lat'],
                longitude: i['location.lon'],
                ownership: i['school.ownership'],
                website: i['school.school_url'],
                school_size: i['school.carnegie_size_setting'],
                total_students: i['latest.student.size'],
                women : i['latest.student.demographics.women'],
                men: i['latest.student.demographics.men'],
                school_category: i['school.institutional_characteristics.level'],
                instate_tuition: i['latest.cost.tuition.in_state'],
                outofstate_tuition: i['latest.cost.tuition.out_of_state'],
                num_programs_offered: i['academics.program_reporter.programs_offered'],
                cost_books: i['latest.cost.booksupply'],
                cost_roomboard_oncampus: i['latest.cost.roomboard.oncampus'],
                cost_roomboard_offcampus: i['latest.cost.roomboard.offcampus'],
                open_admissions: i['school.open_admissions_policy'],
                admin_test_reqs: i['latest.admissions.test_requirements'],
                grad_earnings: i['latest.earnings.6_yrs_after_entry.median_earnings_independent'],
                    
            })
    
            
            for (m of majorList){
              // console.log(m)
              Major.create({
                major : m.title,
                SchoolId: i['id'],
              }
              )}  
              
            }    
  };

const items = [
    {name : 'Gold'},
    {name : 'Silver'},
    {name : 'Paladium'}
];


const seed = async (schools) => {

    await sequelize.sync({ force: true });

    const users = await createUsers(); // create users w/ encrypted passwords
    await createSchools(0);
    await createSchools(1);
    const userPromises = users.map(user => User.create(user))
    const itemPromises = items.map(item => Item.create(item))
    await Promise.all([...userPromises, ...itemPromises]);
    console.log("db populated!")
    
}

seed ();