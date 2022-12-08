import express from "express";
import path from "path";
import bodyParser from "body-parser"
import {conn} from "./db.js";

const app = express();

const __dirname = path.resolve();
// var jsonParser = bodyParser.json()
app.use(bodyParser.urlencoded({extended:false}))

// app.use(express.json());
app.set("view engine", "ejs");

app.get('/', function(req, res){
    res.sendFile(__dirname + "/views/home.html");
})

app.get('/admin',function(req, res){
    var quer = "select * from data";
    conn.query(quer, function (err, result){
        console.log(result)
        res.render("admin.ejs", {result : result});
    })
})

app.get('/register', function(req, res){
    // res.sendFile(__dirname + "/views/register/register.ejs");
    let er = {
        msg : "",
        username : "",
        signup : false,
        detail : ""
    };
    res.render("register/register.ejs", {er});
})

app.post('/signin', function(req, res){
    // var conn = mysql.createConnection({host:"localhost", user:"root", password:"", database:"student"})
    console.log(req.body);
    var username = req.body.username;
    var password = req.body.password;

    

    conn.connect(function(err){
        // if(err)throw err;
        var quer = "select * from data where username=?";
        conn.query(quer, username, function(err, result){
            console.log(result);
            if(result.length>0 && result[0].password === password){
                console.log("signed in sucessfully");
                var link = "/show?username="+username;
                res.redirect(link)
            }else{
                let er = {
                    msg: "Invalid username or Password",
                    username:username,
                    signup : false,
                    signupmsg : "",
                    detail : {
                        password : "",
                        fname : "",
                        gender : "",
                        phno : ""
                    }
                };
                res.render("register/register",{er})
            }
        })
    })
})


app.post('/signup', function(req, res){
    // console.log(req.body);
    var username = req.body.username;
    var password = req.body.password;
    var confirmpassword = req.body.confirmpassword;
    var fname = req.body.fname;
    var gender = req.body.gender;
    var phno = req.body.phno;
    let er = {
        msg: "",
        username:username,
        signup : false,
        signupmsg : "",
        detail : {
            password : password,
            fname : fname,
            gender : gender,
            phno : phno
        }
    };

    if(password.toString().trim()!==confirmpassword.toString().trim()){
        er.signup = true;
        er.signupmsg = "Password should match for further processing..."
        res.render("register/register",{er})
    }else{
        conn.connect(function(err){
            // if(err)throw err;
            var query = " insert into data(username, password ,fname, gender, phno) values('"+username+"', '"+password+"', '"+fname+"', '"+gender+"', '"+phno+"') ";
            conn.query(query, function(err){
                if(err && err.errno==1062){
                    // throw err;
                    // res.send(err.sqlMessage)
                    er.signup = true;
                    er.signupmsg = "User already exist with that email id"
                    res.render("register/register",{er})
                }else{
                    console.log("Data saved succesfully");
                    var link = "/show?username="+username;
                    er.signup = false;
                    er.signupmsg = ""
                    res.redirect(link)
                }
            })
        })
    }  
})


app.get("/show", function(req, res){
    var quer = "select * from data where username=?";
    conn.query(quer, [req.query.username], function (err, result){
        console.log(result)
        res.render("detail/home.ejs", {result : result});
    })
})


app.get("/myprofile", function(req, res){
    var quer = "select * from data where username=?";
    conn.query(quer, [req.query.username], function (err, result){
        console.log(result)
        res.render("detail/myprofile", {result : result});
    })
})


app.get("/changepassword", function(req, res){
    let er = {
        msg : ""
    }
    res.render("password/password", {username:[req.query.username], er});
})


app.post("/changepasswordfinal", async (req, res)=>{

    var oldpassword = req.body.oldpassword;
    var newpassword = req.body.newpassword;
    var username = req.body.username;
    console.log(username);

    let er = {
        msg : ""
    }

    var quer = "select * from data where username=?";
    conn.query(quer, username, function (err, result){
        var oldpass = result[0].password;
        if(oldpass === oldpassword){
            var quer = "update data set password=? where username=?";
            conn.query(quer, [newpassword, username], function (err, result){
                // if(err) throw err;
                console.log("password Updated succesfully");
                
                er.msg = "Pass updated";
                res.render("password/password", {username, er});
                // res.send("Pass updated");
            })
        }else{
            er.msg = "enter correct old password";
            res.render("password/password", {username, er});
            // res.send("enter correct old password")
        }
    })
})

 
app.get("/logout", function(req, res){
    res.redirect("/");
})


app.listen(3000, function(err){
    if (err) console.log("Error in server setup")
    console.log("Server listening on Port " + 3000);
})