const express = require("express")
const bcrypt = require("bcrypt")
const db = require("better-sqlite3")("ourApp.db")
db.pragma("journal_mode = WAL")

const createTables = db.transaction(() => {
    db.prepare(
        `
        CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username STRING NOT NULL UNIQUE,
        password STRING NOT NULL
        )
        `
    ).run()
})

createTables()


const app = express()

app.use(express.static("public"))
app.use(express.urlencoded({extended: false}))
app.set("view engine", "ejs")
app.use(function (req, res, next){
    res.locals.errors = []
    next()
})

app.get("/", (req, res)=> {
    res.render("homepage")
})

app.get("/login", (req, res) => {
    res.render("login.ejs")
})

app.post("/register", (req, res) =>{

    const errors = []

    if(typeof req.body.username !== "string") 
        req.body.username = ""
    if(typeof req.body.password !== "string") 
        req.body.password = ""

    req.body.username = req.body.username.trim()

    if(!req.body.password) 
        errors.push("You must provide a password")
    if(req.body.password && req.body.password.length <8)
        errors.push(" Password can't be less than 8 characters")
    if(req.body.password && req.body.password.length >30)
        errors.push("'Username can't be more than 10 characters")

    if(errors.length){
        return res.render("homepage", {errors})
    }

    const saveData = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)")
    saveData.run(req.body.username, req.body.password)
    res.send("Thank you for signing up")

})

app.listen(3000)