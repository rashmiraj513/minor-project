const express = require("express")
const bcrypt = require("bcrypt")
const dotenv = require("dotenv")
const app = express()

// Database Configuration

const {Client} = require("pg")
const client = new Client({
    user: 'postgres',
    database: 'minorproject',
    host: 'localhost',
    port: 5432,
    password: 'Rashmi@123'
})
client.connect();

app.use(express.urlencoded())
app.use(express.static("public"))

app.set('view engine', 'ejs')

let registerMessage = "";
let roomMessage = "";

app.get("/", function(req, res) {
    res.render("index", {roomErrorMessage: roomMessage})
})

app.post("/", function(req, res) {
    const roomData = {
        checkIn: req.body.userCheckIn,
        checkOut: req.body.userCheckOut,
        totalRooms: req.body.userRooms,
        totalGuests: req.body.userGuests
    };
    console.log(roomData);
    if(roomData.checkIn < roomData.checkOut) {
        roomMessage = "Please enter check out date carefully."
        res.render("index", {roomErrorMessage: roomMessage});
        roomMessage = "";
    } else {
        roomMessage = "Rooms are available. Book Now."
        res.render("index", {roomErrorMessage :roomMessage});
        roomMessage = "";
    } 
})

app.get("/users/login", function(req, res) {
    res.render("login")
})

app.get("/users/signup", function(req, res) {
    res.render("signup", {signUpMessage: registerMessage})
})

app.post("/users/signup", async function(req, res) {
    const userName = req.body.name;
    const userEmail = req.body.email;
    const userPassword = req.body.password;
    console.log(userName, userEmail, userPassword);
    if(userPassword.length < 6) {
        registerMessage = "Password should be at least 6 characters long!"
        res.render("signup", {signUpMessage: registerMessage});
        registerMessage = "";
    } else {
        let hashedUserPassword = await bcrypt.hash(userPassword, 10);
        client.query('SELECT * FROM users WHERE email = $1', [userEmail], (err, results) => {
            if(err) {
                throw err;
            }
            console.table(results.rows);
            if(results.rows.length > 0) {
                registerMessage = "Email already registered.";
                res.render("signup", {signUpMessage: registerMessage});
                registerMessage = "";
            } else {
                client.query('INSERT INTO users (name, email, password) values ($1, $2, $3)', [userName, userEmail, hashedUserPassword], (err) => {
                    if(err) {
                        throw err;
                    }
                    registerMessage = "You are now registered. Please login."
                    res.render("signup", {signUpMessage: registerMessage});
                    registerMessage = "";
                })
            }
        })
    }
});

app.get("/rooms", function(req, res) {
    res.render("rooms", {roomErrorMessage: roomMessage})
})

app.get("/contact", function(req, res) {
    res.render("contact")
})

app.get("/about", function(req, res) {
    res.render("about")
})

app.listen(process.env.PORT || 3000, () => {
    console.log("Server is running at port 3000.");
})