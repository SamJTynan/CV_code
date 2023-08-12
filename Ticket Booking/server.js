/**********************************************************************
 * FINAL ASSIGNMENT FOR Web Development and Deployment (DT211c/TU857)
 * Server file to handle sessions and routing
 * used in one file due to bugs with using multiple controllers
 * and auth routes
 * 
 * 
 * AUTHOR: Sam O Teimhneain(C19370156)
 * DATE OF COMPLETION: 29/11/2021
 **********************************************************************/
//Set up node packages

const express = require('express');
const bodyparser = require('body-parser');
const app = express();
const mysql = require("mysql2");;
const dotenv = require('dotenv');
const bcrypt = require("bcryptjs");
const cookieParser = require('cookie-parser');
const sessions = require('express-session');
const fileUpload = require('express-fileupload');
const multer = require('multer');
const cors = require('cors');
const morgan = require('morgan');

const path = require('path');
//set express properties and public directory + .env file
const { body, validationResult } = require('express-validator');

//set var for session
var session;
//set cookie and length
//             mili   sec  min  hour
const oneDay = 1000 * 60 * 60 * 24;

app.use(fileUpload());
app.use(bodyparser.json());
app.use(cors());
app.use(morgan('dev'));
app.use(bodyparser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname + '/public')));
app.use(express.json());
app.use(cookieParser());
app.use(sessions(
  {
    secret : "tempsecretchangelaterpls",
    saveUnitialized :true,
    cookie: {maxAge: oneDay},
    resave: false
  }));

const UPLOAD_PATH = __dirname + '/public/userpfp';
const upload = multer({
  dest: UPLOAD_PATH
});


//set ejs view engine
app.engine('html', require('ejs').renderFile);
//app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


dotenv.config({path: './.env'});

//set up database connection
const db = mysql.createConnection(
{
  host: process.env.DATABASE_HOST, // assign your host name
  user: process.env.DATABASE_USER,      //  assign your database username
  password: process.env.DATABASE_PASSWORD,      // assign your database password
  database: process.env.DATABASE // assign database Name
});

//connect to database
db.connect(function(err) 
{
    if (err) throw err;
    console.log('Database Successfully connected');
});


//set server to port 3000
app.listen(3000);


//page getters

app.get("/", function(req, res) 
{
  session = req.session;

  //check session for logged in user
  if(session.useremail)
  {
    var loginmsg = "welcome " + session.useremail;
    res.render(__dirname + '/views/index', 
    {
      loggedIn: loginmsg
    });
  }
  else
  {
    res.render(__dirname + '/views/index.ejs');
  }
});


app.get("/checkout", function(req, res) 
{
  session = req.session;

  //check session for logged in user
  if(session.useremail)
  {
    //reset error message to prevent persistance after reload
    seatNoFail = "";
    res.render(__dirname + '/views/checkout.ejs',
    {
      seatNoFail: seatNoFail
    });
  }
  else
  {
    res.render(__dirname + '/views/login.ejs');
  }
});

app.get('/login', function(req, res) 
{
  res.render(__dirname + '/views/login.ejs');
});

app.get('/register', function(req, res) 
{
  res.render(__dirname + '/views/register.ejs');
});

app.get('/logout', function(req,res) 
{
  req.session.destroy();
  res.redirect('/');
});


app.get('/thank', function(req, res) 
{
  res.render(__dirname + '/views/thank.ejs');
});

app.get('/Events', function(req, res)
{
  res.render(__dirname + '/views/Events.ejs');
});


app.get('/changePassword', function(req, res)
{
  res.render(__dirname + '/views/changePassword.ejs');
})

//code to delete user account
app.get('/delete', function(req, res)
{
  session = req.session;
  if(session.useremail)
  {
    //delete the currently logged in user from the database
    db.query('DELETE FROM users WHERE email = ?', [session.useremail], function(error, rows, fields)
    {
      if(error)
      {
        console.log(error);
        res.status(400).json(error);
      }
      //delete all tickets user possessed
      db.query('DELETE FROM tickets WHERE email = ?', [session.useremail], function(error, rows, fields)
      {
        if(error)
        {
          console.log(error);
          res.status(400).json(error);
        }
        //log user out and destroy session
        return res.redirect('/logout');
      });
    });
  }
  else
  {
    res.redirect('login');
  }
});

app.get('/ProfilePage', function(req, res)
{
  session = req.session;
  //check if there is a user logged in
  if(session.useremail)
  {
    curr_user = session.useremail;
    profilemsg = curr_user;
    const seatnum = req.body.seatnum;
    //reset messages so messages dont persist on refresh
    successpswd = "";
    failpswd = "";
    //find current user and their tickets
    db.query('SELECT ticketID, email, event, seatNo FROM tickets WHERE email = ?', [curr_user], function(error, results) 
    {
      console.log(results.length);
      if(typeof results !== 'undefined')
      {
        //create an array to store ticket information and pass it to the front
        usrTickets = [];
        for(var i=0; i < results.length; i++)
        {
          //cycle through all results and add data to array
          usrTickets.push(results[i].ticketID);
          usrTickets.push(results[i].event);
          usrTickets.push(results[i].email);
          usrTickets.push(results[i].seatNo);
        }
        console.log(usrTickets);
        
        //set current users values, and pass to the profile
        curr_userpfp = session.user_pfp;
        console.log(session.user_pfp);
          res.render(__dirname + '/views/ProfilePage', {
          profilemsg: profilemsg,
          usrTickets: usrTickets,
          curr_userpfp: curr_userpfp
        });
      }
      //redirect to user if no one is logged in
      else
      {
        res.render(__dirname + '/views/login.ejs')
      }
    });
  }
  else{
    return res.redirect('login');
  }
});

//function to register user
app.post('/register', function(req,res)
{
  //get input from page
  const email = req.body.email;
  const password = req.body.password;
  //callback is async to allow for bcrypt
  db.query('SELECT email FROM users WHERE email = ?', [email], async (error, results) => 
  {
    //encrypt password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hashSync(password, salt)
    console.log(results);

    //check if user already exists
    if(results.length > 0)
    {
      console.log(results.length);
      console.log("found match");
      return res.render('register', 
      {
        Message: 'This email is already in use'
      });
    }

    else
    {
      //add user to database
      db.query('INSERT INTO users (email, user_password) VALUES (?, ?);', [email, hashedPassword],function(error, rows, fields) 
      {
        if (error) 
        {
          console.log(error);
          res.status(400).json(error);
        }

        //set session values and pass to frontend
        loginmsg = "welcome " + email;
        session = req.session;
        session.useremail = email;
        session.passCheck = hashedPassword;
        console.log(req.session);
        return res.render('index', 
        {
          loggedIn: loginmsg
        });
      });
    }
  });
});


//function for checkout
app.post('/Event', function(req, res)
{
  session = req.session;
  //ensure the current user dosent have more than 3 tickets in their account
  db.query('SELECT email FROM tickets WHERE email = ?', [session.useremail], function (error, rows, fields)
  {
    if (error)
    {
      console.log(error);
      res.status(400).json(error);
    }
    //max 3 tickets; if rows is greater than or equal to
    if(rows.length >= 3)
    {
      ticketFail = "Sorry, this account already has the maximum ammount of tickets";
      return res.render('checkout', 
      {
      ticketFail: ticketFail
      });
    }
    else
    {
      //reset error to prevent persistance on refresh
      seatNoFail = "";
      //if user selected comedy event
      if(req.body.comedy)
      {
        //create array to get all taken seats for this event
        takenseat = [];
        curr_event = req.body.comedy;
        console.log(curr_event);
        db.query('SELECT seatNo FROM tickets WHERE event = ?', [curr_event], function(err, results)
        {
          console.log(results.length);
          if(typeof results !== 'undefined')
          {
            for(var i = 0; i < results.length; i++)
            {
              tempseat = parseInt(results[i].seatNo);
              takenseat.push(tempseat);
            }

            //pass taken seats to front end
            return res.render(__dirname + '/views/checkout.ejs', 
            {
              curr_event: curr_event,
              takenseat: takenseat
            });
          } 
        });
      }

      //if user selected Football event
      else if(req.body.Football)
      {
        takenseat = [];
        curr_event = req.body.Football;
        db.query('SELECT seatNo FROM tickets WHERE event = ?', [curr_event], function(err, results) 
        {
          console.log(results.length);
          if(typeof results !== 'undefined')
          {
            for(var i = 0; i < results.length; i++)
            {
              tempseat = parseInt(results[i].seatNo);
              takenseat.push(tempseat);
            } 
            return res.render(__dirname + '/views/checkout.ejs', 
            {
              curr_event: curr_event,
              takenseat: takenseat
            });
          }
        });
      }

      //if user selected hurling event
      else if(req.body.Hurling)
      {
        takenseat = [];
        curr_event = req.body.Hurling;
        db.query('SELECT seatNo FROM tickets WHERE event = ?', [curr_event], function(err, results) 
        {
          console.log(results.length);
          if(typeof results !== 'undefined')
          {
            for(var i = 0; i < results.length; i++)
            {
              tempseat = parseInt(results[i].seatNo);
              takenseat.push(tempseat);
            }
            return res.render(__dirname + '/views/checkout.ejs', 
            {
              curr_event: curr_event,
              takenseat: takenseat
            });
          }
        });
      }

      //if user selected drama event
	   else if(req.body.Play)
     {
       takenseat = [];
       curr_event = req.body.Play;
       db.query('SELECT seatNo FROM tickets WHERE event = ?', [curr_event], function(err, results) 
       {
         console.log(results.length);
         if(typeof results !== 'undefined')
         {
           for(var i = 0; i < results.length; i++)
           {
             tempseat = parseInt(results[i].seatNo);
             takenseat.push(tempseat);
           }
           return res.render(__dirname + '/views/checkout.ejs', 
           {
             curr_event: curr_event,
             takenseat: takenseat
           });
         }
       });
     }
   
   //if user selected concert event
   else if(req.body.Concert)
     {
       takenseat = [];
       curr_event = req.body.Concert;
       db.query('SELECT seatNo FROM tickets WHERE event = ?', [curr_event], function(err, results) 
       {
         console.log(results.length);
         if(typeof results !== 'undefined')
         {
           for(var i = 0; i < results.length; i++)
           {
             tempseat = parseInt(results[i].seatNo);
             takenseat.push(tempseat);
           }
           return res.render(__dirname + '/views/checkout.ejs', 
           {
             curr_event: curr_event,
             takenseat: takenseat
           });
         }
       });
     }
    }
  });
});

//function to log user in
app.post('/login', function(req, res)
{
  //get info from user
  const email = req.body.email;
  const password = req.body.password;
  db.query('SELECT userID, email, pfp, user_password FROM users WHERE email = ?' ,email, function(error, rows, fields)
  {
    //check if email is correct
    if(rows.length < 1)
    {
      return res.render('login', 
      {
        Message: 'Incorrect email/password'
      });
    }

    //get the encrypted password from the database
    passCheck = rows[0].user_password;
    console.log(passCheck);

    //check input plaintext against encrypted password
    bcrypt.compare(password, passCheck, function(err, result) 
    {
      console.log("result is " + result)
      if(result)
      {
        session = req.session;
        session.useremail = email;
        session.user_pfp = rows[0].pfp;
        session.passCheck = passCheck;

        var loginmsg = "welcome " + rows[0].email;
        return res.render('index', 
        {
          loggedIn: loginmsg
        });
      }
              
      else
      {
        return res.render('login', 
        {
          Message: 'Incorrect password'
        });
      }
    });
  });
});


//function to add users tickets to database 
app.post('/checkout', function(req, res)
{
  session = req.session;
  curr_user = session.useremail;
  //check if user is logged in
  if(curr_user)
  {
    const seatnum = req.body.seatnum;
    db.query('SELECT seatNo from tickets WHERE event = ?',[curr_event], function(error, rows, fields)
    {
      if (error) 
      {
        console.log(error);
        res.status(400).json(error);
      }
      
      //check if seat is taken
      for(i=0; i< rows.length; i++)
      {
        console.log(parseInt(rows[i].seatNo));
        if(seatnum == parseInt(rows[i].seatNo))
        {
          seatNoFail = "Sorry, this seat is taken. Please select another seat";
          return res.render('checkout', 
          {
            seatNoFail: seatNoFail
          });
        }
      }
      

      db.query('INSERT INTO tickets (email, event, seatNo) VALUES (?,?,?)', [curr_user, curr_event, seatnum], function(error, rows, fields) 
      {
        if (error) 
        {
          console.log(error);
          res.status(400).json(error);
        }
            
        thankmsg = "Thank you for purchasing your ticket for " + curr_event + ", Your Seat is: " + seatnum;
        return res.render('thank', 
        {
          thankmsg: thankmsg
        });
      });
        
    });
  }     
  else
  {
    return res.redirect('login');
  }
});

//function to upload and add a profile picture for the user
app.post('/pfp', upload.single('user_pfp'),  function(req, res) 
{
  session = req.session;
  curr_user = session.useremail;
  //check if user is logged in
  if(curr_user)
  {
    //check if file was uploaded
    if (!req.files)
    {
      return res.redirect('ProfilePage');
    }
    else
    {
      const user_pfp = req.files.user_pfp;
      const pfp_name = user_pfp.name;
      console.log(user_pfp);
      console.log(pfp_name);
      const validErrors = validationResult(req);
      
      //move file to directory. Kept in public due to issues with static directory.
      user_pfp.mv(__dirname + '/public/userpfp/' + pfp_name, function(error)
        {
        
        //reload the page if there is an error
        if(error)
          {
            res.render('ProfilePage');
          }
        else
        {
          db.query('UPDATE users SET pfp = ? WHERE email = ?', [user_pfp.name, curr_user], function(error, rows, fields) 
          {
            if (error) 
            {
              console.log(error);
              res.status(400).json(error);
            }
            
            //add profile picture to session
            session.user_pfp = pfp_name;
            curr_user = session.user_pfp;
            return res.redirect("ProfilePage")
          });
        }
      });  
    }
  }
  else
  {
    res.redirect('login');
  }
});

//function to change password 
app.post('/changePassword', function(req, res)
{
  session = req.session;
  curr_user = session.useremail;
  //check if user is logged in
  if(curr_user)
  {
    //get old and new password. New password checked on page
    const old_password = req.body.password;
    const new_password = req.body.new_password;
    //compare old password to new password. passCheck variable saved in session
    bcrypt.compare(old_password, session.passCheck, async function(err, result) 
    {
      console.log("result is " + result)
          
      if(result)
      {
        //encrypt new password and update database
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hashSync(new_password, salt);
        db.query('UPDATE users SET user_password = ? WHERE email = ?', [hashedPassword, curr_user], function(error, rows, fields)
        {
          if (error) 
          {
            console.log(error);
            res.status(400).json(error);
          }
          
          //load page with success message
          failpswd = ""
          successpswd = "Your password was changed successfully";
          return res.render('changePassword', 
          {
            successpswd: successpswd,
            failpswd: failpswd
          });
        });
      }

      //old password is incorrect
      else
      {
        successpswd = ""
        failpswd = "Incorret Password";
        return res.render('changePassword', 
        {
          successpswd: successpswd,
          failpswd: failpswd
        });
      }
    });
  }
  else
  {
    res.redirect('login');
  }
});

//function to refund tickets 
app.post('/refund', function(req, res)
{
  session = req.session;
  curr_user = session.useremail;
  //check if user is logged in
  if(curr_user)
  {
    //get ticket number and current user to refund 
    curr_ticket = req.body.refundtic;
    //ensure user has ticket to refund
    db.query('SELECT ticketID, email FROM tickets WHERE ticketID = ? AND email = ?', [curr_ticket, curr_user], function(error, rows, fields)
    {
      if(error)
      {
        console.log(error);
        res.status(400).json(error);
      }
      if(rows.length > 0)
      {
        //delete ticket from database
        db.query('DELETE FROM tickets WHERE ticketID = ? AND email = ?', [curr_ticket, curr_user], function(error, rows, fields)
        {
          if(error)
          {
            console.log(error);
            res.status(400).json(error);
          }
          //reload profile page with success message
          refundmsg = "Your ticket was sucessfully refunded"
          return res.render(__dirname + '/views/ProfilePage',
          {
            refundmsg: refundmsg,
          });
        });
      }
        //if user does not have ticket
      else
      {
        refundmsg = "Sorry, there was an error refunding your ticket"
        return res.render(__dirname + '/views/ProfilePage',
        {
        refundmsg: refundmsg
        });
      }
    });
  }
  else
  {
    return res.redirect('login');
  }
});