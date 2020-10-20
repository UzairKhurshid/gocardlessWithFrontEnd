require('./db/mongoose')
const express=require('express')
const path=require('path')
const hbs=require('hbs')
const csrf=require('csurf')
const bodyParser=require('body-parser')
var cookieParser = require('cookie-parser')
const app=express()



app.use(cookieParser())




const publicDirectory=path.join(__dirname,'../public')
const viewsDirectory=path.join(__dirname,'../views')


const authRouter=require('./routes/auth')
const stripeRoute=require('./routes/Stripe')
const goCardlessRoute=require('./routes/goCardless')


app.set('view engine', 'hbs');
app.set('views',viewsDirectory)
app.use(express.static(publicDirectory))
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))



// const csrfProtection=csrf()
// app.use(csrfProtection)

app.use(authRouter)
app.use(stripeRoute)
app.use(goCardlessRoute)


//express application level middlewares
// app.use((req,res,next)=>{
//     res.locals.csrfToken=req.csrfToken(),
//     next()
// })

app.get("*",(req,res)=>{
    res.send("404 : page Not Found")
})

const port = process.env.PORT || 3000
//starting the server
app.listen(port,()=>{
    console.log("server is up and running on PORT "+port)
})