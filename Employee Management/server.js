const express = require('express'); //Importing expres library
const app = express()
const {pool} = require("./static/dbConfig");//Pulls library in from dbConfig file 
const bcrypt = require('bcrypt');//Hides password
const session = require('express-session');
const flash = require("express-flash");
app.use("/static", express.static('./static/'));
app.use("/css", express.static('./css/'));
app.use("/node_modules/jquery/dist", express.static('./node_modules/jquery/dist/'));
const passport = require("passport");
const initializePassport = require("./passportConfig.js");
initializePassport(passport);

app.use(express.json());
//Acts like the heart of the machine
const PORT = process.env.PORT || 4000; //Port that will be used for development 

function runFunctionAtSpecificTime() {
    var now = new Date();
    var timetorun = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 22, 39, 0, 0) - now;
    if (timetorun < 0) {
        timetorun += 86400000; 
    }
    setTimeout(function(){
      higherlevelupdate();
      bookingupdate();
      assignshift();
      assignshifthighercheck();
      assignmanager();
      generateshifts();
      assignshiftplanned();},timetorun
        );
  
  }



  function test()
  {
    pool.query()
  }
  function higherlevelupdate() {
    pool.query(`UPDATE public."User"
    SET rating = rating - 1
    WHERE type = 'Employee' AND level = 'higher' AND user_id NOT IN
    (
    SELECT user_id FROM public."ShiftPlanned"
    WHERE date BETWEEN CURRENT_DATE - INTERVAL '7 days' AND CURRENT_DATE + INTERVAL '7 days'
        
    );`);

    }


    function assignmanager() {
        pool.query(`UPDATE public."Manager"
        SET manager_id = u.user_id
        FROM public."User" u
        JOIN public."Shift" s ON s.department = u.department
        WHERE public."Manager".shift_id = s.shift_id AND s.date = CURRENT_DATE;`);
      }
    
      function bookingupdate() {
        pool.query(`UPDATE public."User"
        SET rating = rating - 1
        WHERE user_id  IN
        (
        SELECT DISTINCT b.user_id
        FROM public."Bookings" b
        JOIN public."Shift" s ON b.shift_id = s.shift_id AND s.date = CURRENT_DATE
        JOIN public."ShiftPlanned" sp ON b.shift_id = sp.shift_id
        WHERE b.bookstart > sp.starttime + INTERVAL '30 minutes'
        OR b.bookend - b.bookstart < sp.endtime - sp.starttime
        );`);
    
        pool.query(`UPDATE public."User"
        SET rating = rating + 1
        WHERE user_id  IN
        (
            SELECT DISTINCT b.user_id
            FROM public."Bookings" b
            JOIN public."Shift" s ON b.shift_id = s.shift_id AND s.date = CURRENT_DATE
            JOIN public."ShiftPlanned" sp ON b.shift_id = sp.shift_id
            WHERE b.bookend - b.bookstart >= sp.endtime - sp.starttime
        );`);
    
    
      }
    
    
      function assignshiftplanned (){
        pool.query(
        `INSERT INTO public."ShiftPlanned" (user_id, shift_id, date, starttime, endtime)
        SELECT user_id, shift_id, CURRENT_DATE, '09:00:00', '17:00:00'
        FROM public."Manager"
        WHERE shift_id IN (
          SELECT shift_id
          FROM public."Shift"
          WHERE date = CURRENT_DATE
        );`);
    
      }
    
    
      function generateshifts(){
        pool.query( `INSERT INTO public."Shift"(department) VALUES ('clothing'), 
            ('cosmetics'),
            ('DIY'),
            ('furniture'), 
            ('gardening'), 
            ('hardware'), 
            ('home appliances'), 
            ('houseware'), 
            ('paint'), 
            ('sporting goods'), 
            ('toiletries'),
            ('toys');`);
      }
    
      function assignshift(){
        pool.query(`SELECT shift_id FROM public."Shift" WHERE date = current_date;`,
       
        (err,shifts) =>{
            if(err){
                throw err;
            }
            
            
            var shifts_ = new Array(shifts.rows.length);
    
            for(i=0;i<shifts_.length;i++)
            {
                const shift = shifts.rows[i];
                shifts_[i]= shift.shift_id.trim();
                // console.log(shifts_[i])
               
            }
    
            for(var i =0;i<shifts.rows.length;i++)
            {
                
                pool.query(` INSERT INTO public."Manager" (shift_id, user_id)
                SELECT $1, u.user_id
                FROM public."User" u
                WHERE u.type = 'Employee' AND u.level = 'lower'
                AND u.user_id NOT IN (
                  SELECT distinct user_id
  				  FROM public."Manager" 
  				  JOIN public."Shift" ON public."Shift".Shift_id = public."Manager".Shift_id
  				 where date = current_date
                )
                LIMIT (
                  SELECT (SELECT min_needed FROM public."Shift" WHERE shift_id = $1) - (SELECT COUNT(user_id) FROM public."Manager" WHERE shift_id = $1) 
                );
                `, [shifts_[i]], (err,results) =>{
                    if(err){
                        throw err;
                    }
                });
            }

        });
  }


  function assignshifthighercheck(){
    
    pool.query(`SELECT Shift_id 
    FROM public."Shift"
    WHERE date = current_date 
    AND Shift_id NOT IN (
      SELECT public."Manager".Shift_id 
      FROM public."Shift" 
      JOIN public."Manager" ON public."Shift".Shift_id = public."Manager".Shift_id
      GROUP BY public."Manager".Shift_id 
      HAVING COUNT(*) = MIN(min_needed)
    );`,
    (err,shifts) =>{
        if(err){
            throw err;
        }
        if(shifts.rows.length>0)
        {
            
            var shifts_ = new Array(shifts.rows.length);
            
            for(i=0;i<shifts_.length;i++)
            {
                const shift = shifts.rows[i];
                shifts_[i]= shift.shift_id.trim();
               
            }

            var shifts_ = new Array(shifts.rows.length);
            for(var i =0;i<shifts.rows.length;i++)
            {
                
                pool.query(`INSERT INTO public."Manager" (shift_id, user_id)
                SELECT $1, u.user_id
                FROM public."User" u
                WHERE u.type = 'Employee' AND u.level = 'higher'
                AND u.user_id NOT IN (
                  SELECT distinct user_id
  				  FROM public."Manager" 
  				  JOIN public."Shift" ON public."Shift".Shift_id = public."Manager".Shift_id
  				 where date = current_date
                )
                LIMIT (
                  SELECT (SELECT min_needed FROM public."Shift" WHERE shift_id = $1) - (SELECT COUNT(user_id) FROM public."Manager" WHERE shift_id = $1) 
                );`,
                [shifts_[i]],
                (err,results) =>{
                    if(err){
                        throw err;
                    }
                });
            }
        }
    });
}

runFunctionAtSpecificTime();
// assignshift();

app.set("view engine","ejs"); 
app.use(express.urlencoded({extended: false})); //Middleware to send details from fron end to the server 

app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


app.get('/',(req,res)=>{ //Callback function that will be invoked whenever there is a HHTTP GET request with a path / relative to the site root
    res.render("index"); //Sending message 

});


app.post('/users/employee_higher', async (req,res) =>{
    let {user_id_input,shift_id_input,date_id_input,starttime,endtime} =req.body;
     
    pool.query(
        `INSERT INTO public."ShiftPlanned" (user_id,shift_id,date,starttime,endtime) VALUES($1,$2,$3,$4,$5);`,
        [user_id_input,shift_id_input,date_id_input,starttime,endtime]
        
        );





});

app.post('/users/redricttoregister', async (req,res) =>{
    res.redirect('register');
});


app.get('/users/dashboard', checkNotAuthenticated,(req,res)=>{ //Callback function that will be invoked whenever there is a HHTTP GET request with a path / relative to the site root
    
    pool.query(
        `SELECT * FROM public."User" WHERE "user_id" = $1;`,
        [req.user.user_id],
        (err,results) =>{
            if(err){
                throw err;
            }

         const user = results.rows[0];
         
         if(user.type.trim()=== "Manager")
         {
            res.locals.user = req.user.name;
            res.locals.User_id = req.user.user_id;
            res.locals.department = req.user.department;
           
            pool.query(
                `SELECT "User".name, "Manager".user_id, "Manager".shift_id ,"Shift".date FROM public."Manager" JOIN public."Shift" ON "Shift".shift_id = "Manager".shift_id JOIN public."User" ON "User".user_id = "Manager".user_id WHERE "Manager".manager_id = $1;`,
                [req.user.user_id],
                (err,results) =>{
                    if(err){
                        throw err;
                    }
                    
                    var employees = new Array(results.rows.length);// Lenght of the results of the SQL query
             
                    for(i=0;i<employees.length;i++)
                    {
                        const user = results.rows[i];
                        employees[i]=
                        {
                            name: user.name.trim(),
                            user_id: user.user_id.trim(),
                            shift_id: user.shift_id.trim(),
                            date: user.date
                        }
                        
                    }
                    

                    res.locals.employees = employees; 
                    res.render("dashboard_admin",{employees:employees}) ;
                }
            );
           
         }
         else if (user.type.trim()=== "Employee") {
            res.locals.User_id = req.user.user_id;
            res.locals.level = req.user.level;
            res.locals.rating = req.user.rating;
            var employeelevel = req.user.level;
            pool.query( //For getting every shift user has
                `select * FROM public."ShiftPlanned" WHERE "user_id"= $1;`,
                [req.user.user_id],
                (err,results) =>{
                    if(err){
                        throw err;
                    }
               
                    var shifts = new Array(results.rows.length);
                    for(i=0;i<shifts.length;i++)
                    {
                        const shift = results.rows[i];
                        shifts[i]=
                        {
                            shift_id: shift.shift_id.trim(), 
                            date: shift.date,
                            starttime: shift.starttime.trim(),
                            endtime: shift.endtime.trim(),
                        }
                        
                    }

                    // console.log(typeof shifts[0]);
                    var shifts_ = JSON.stringify(shifts);
                    res.locals.shifts = shifts_; 
                    
                    if(employeelevel.trim()==='lower')
                    {
                        res.render("dashboard_employee_lower",{ user: req.user.name}) ;   
                    }
                    else if(employeelevel.trim()==='higher')
                    {
                        pool.query(`SELECT *
                        FROM public."Shift"
                        WHERE date >= CURRENT_DATE AND date < CURRENT_DATE + INTERVAL '2 weeks';`,  
                        (err,results) =>{

                            var shifts_ava = results.rows;
                            res.locals.shifts_ava = shifts_ava; 
                            res.render("dashboard_employee_higher",{ user: req.user.name}) ;   
                        }
                        );     
            
                    }
                }
            );
         }             
    });
});

app.get('/users/register', checkAuthenticated,(req,res)=>{ //Callback function that will be invoked whenever there is a HHTTP GET request with a path / relative to the site root
    res.render("register"); //Sending message 
});

app.get('/users/login', checkAuthenticated,(req,res)=>{ //Callback function that will be invoked whenever there is a HHTTP GET request with a path / relative to the site root
    res.render("login"); //Sending message 
});

app.post('/users/dashboard_admin_logout', function(req, res, next){
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect("login");
    });
  });

app.post('/users/dashboard', async (req,res) =>{
     let {clock_button,time,user_id} =req.body;
     console.log({
        clock_button,
        time,
        user_id
    }); 
    let temp = time.split('T');
    let query = "";
    if(clock_button === 'in')
    {
      query = `INSERT INTO public."Bookings" ("bookstart","user_id","shift_id")VALUES($1,$2,(SELECT shift_id FROM public."ShiftPlanned" WHERE date = $3 AND user_id = $2));`;
      starttime = temp[1];
      pool.query(
        query,
        [temp[1],user_id,temp[0]],
        (err,results) =>{
            if(err) {
                throw err;
            }
        }
    );
     

    }
    else if (clock_button === 'out')
    {
     // `INSERT INTO public."Bookings" ("bookstart","user_id","shift_id")VALUES($1,$2,(SELECT shift_id FROM public."ShiftPlanned" WHERE date = $3 AND user_id = $2));`
        console.log("HERE"+starttime);
        query =`UPDATE public."Bookings" SET "bookend" = $1 WHERE "shift_id" = (SELECT shift_id FROM public."ShiftPlanned" WHERE date = $3 AND user_id = $2) AND "user_id" = (SELECT user_id FROM public."ShiftPlanned" WHERE date = $3 AND user_id = $2) AND "bookstart" =$4`;
        pool.query(
            query,
            [temp[1],user_id,temp[0],starttime],
            (err,results) =>{
                if(err) {
                    throw err;
                }
            }
        );

    }
    
});

app.post('/users/dashboard_admin', async (req,res) =>{
    
    
    let{rating,user_id_input,manager_id_input,shift_id_input} = req.body;
    console.log("Here");
    console.log( 
        rating,
        user_id_input,
        manager_id_input,
    
    );
    var type = 'Feedback';
    shift_id_input = shift_id_input.trim();

    pool.query(
        `INSERT INTO public."Reports" (user_id, rating,shift_id,manager_id,report_type) VALUES ($1,$2,$3,$4,$5);`,
        [user_id_input,rating,shift_id_input, manager_id_input,type],
        (err, results) => {
            if (err) {
                throw err;
            }
        }
    );


});



app.post('/users/register', async (req,res) =>{
    let{User_id,Name,password,accounttype,department} = req.body;

console.log({
    User_id,
    Name,
    password,
    department
}); 
    let errors = [];
    // Checks for errors 
    if(!User_id||!Name||!password||!accounttype)
    {
        errors.push({message:"Enter all fields"});
    }

    if(password.length<6)
    {
        errors.push({message:"Password needs to be longer"});
    }

    
    if(errors.length > 0)
    {
        res.render("register",{errors}); //If any errors are found then information is sent to the register page
    }
    else
    { //Form validation has been passed
        let hashedPassword = await bcrypt.hash(password, 10); //Hashes the password
        pool.query(
            `SELECT * FROM public."User" WHERE "user_id" = $1;`,
            [User_id],
            (err,results) =>{
                if(err) {
                    throw err;
                }
            console.log("HERE:");
            console.log(results.rows);
            if(results.rows.length > 0)
            {
                errors.push({message: "User already registered"});
                res.render('register',{errors});
            }
            else
            {
                if(accounttype.trim()==='Employee')
                {
                    pool.query(
                        `INSERT INTO public."User" ("user_id","password","name","type") VALUES ($1,$2,$3,$4);`,
                        [User_id,hashedPassword,Name,accounttype],
                        (err,results) =>{
                            if(err) {
                                throw err;
                            }
                            console.log(results.rows);
                            req.flash('success_msg',"Created User");
                            res.redirect("/users/login");
                        }
                    );
                }
                else if (accounttype.trim()==='Manager')
                {
                    pool.query(
                        `INSERT INTO public."User" ("user_id","password","name","type","department") VALUES ($1,$2,$3,$4,$5);`,
                        [User_id,hashedPassword,Name,accounttype,department],
                        (err,results) =>{
                            if(err) {
                                throw err;
                            }
                            console.log(results.rows);
                            req.flash('success_msg',"Created User");
                            res.redirect("/users/login");
                        }
                    );
                }
                
            }
        }     
        );
    }
});

app.post(
"/users/login",
    passport.authenticate("local", {
      successRedirect: "/users/dashboard",
      failureRedirect: "/users/login",
      failureFlash: true
    })
    
  );
    
  function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect("/users/dashboard");
    }
    next();
  }
  
  function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
         
        return next();
    }
    res.redirect("/users/login");
  } 

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});