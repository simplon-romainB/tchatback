var express = require('express');
var router = express.Router();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const mailgun = require("mailgun-js");

const DOMAIN = process.env.MAILGUN_DOMAIN;
const mg = mailgun({apiKey: process.env.MAILGUN_API_KEY, domain: DOMAIN});
var mailVerified;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

/* GET users listing. */


router.post('/', async(req,res, next) =>{
  var salt = bcrypt.genSaltSync(10);
  var hash = bcrypt.hashSync(req.body.password, salt);
  bcrypt.genSalt(10, function(err,salt) {
    bcrypt.hash(req.body.password, salt, function(err, hash){

    })
  })
  const text = "INSERT INTO users (user_name, user_email, user_password, user_authorities, user_id) VALUES ($1,$2,$3, DEFAULT)";
  const values = [req.body.name,req.body.email, hash, "member"]
  try {
   const client2 = await pool.connect()
   const requete = await client2.query(text,values,(err,result) => client2.end())
  }
  catch(err) {
    console.error(err);
    res.send("Error " + err);
  }
  rand=Math.floor((Math.random() * 100) + (Math.random()*100));
  try {
  const queryActivate = "INSERT INTO users (user_activationlink) VALUES ($1)";
  const values2 = [rand.toString()]
  const client3 = await pool.connect()
  const activeQuery = await client3.query(queryActivate,values2, (err,result2) => client3.end())
  const verif = "SELECT user_activationlink FROM users (user_activationlink)  WHERE user_email = $1";
  const values3 = [req.body.email]
  const client4 = await pool.connect()
  const fetchActivationLink = await client4.query(verif, values3, (err,result3) => {
    const activeLink = result3.rows[0]
    client4.end()
  });
 }
 catch(err) {
  console.error(err);
  res.send("Error " + err);
}
  link= process.env.APP_URL + "/register/verify?id="+ activeLink;
  const data = {
    from: "Mailgun Sandbox <postmaster@" + process.env.MAILGUN_DOMAIN + ".mailgun.org>",
    to: req.body.email,
    subject: "email verification",
    html: "<p>please click this<a href = "+ activeLink+ ">link</a></p>"
  };
  
  
  mg.messages().send(data, function (error, body) {
    console.log(body);
    });
  mailVerified = req.body.email
  });
  

router.get('/verify', async(req,res,next) =>{
  const verifyActive = "SELECT user_activationlink FROM users WHERE user_email =  $1"
  const values4 = [mailVerified]
  const client4 = pool.connect()
  const verifyQuery = client4.query(verifyActive, values4, (err,result) =>{
    activeLink = result.rows[0]
    client4.end()

  if (req.query.id == activeLink ) {
    console.log("compte activé")
    res.render('index', { title: 'Hey', message: 'compte activé'});
  
    try {
      
  const update = "UPDATE users SET user_activation = true WHERE user_email = $1"
  const optionQuery = [mailVerified]
  const client2 = await pool.connect()
  const requete = await client2.query(update,optionQuery, (err,result) => client2.end())
  

    }
     catch(err) {
       console.error(err);
       res.send("Error " + err);
     }
    }
  else {
    res.render('index', { title: 'Hey', message: 'compte non activé'})
  }
  res.end();
});




module.exports = router;