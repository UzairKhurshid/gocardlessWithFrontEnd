const express=require('express')
const mongoose=require('mongoose')
const jwt=require('jsonwebtoken')
const User=require('../models/user')
const router=new express.Router()
const mySecretKey="secretKeyToHashJWT"


router.get('/login',async(req,res)=>{
    res.render('auth/login',{
        title:"login"
    })
})
router.post('/login',async(req,res)=>{
    try{
        var username=req.body.username
        var password=req.body.password
        const user=await User.findOne({name:username,password:password})
 
        if(!user){
            console.log("login failed")
            return res.redirect('/login')
        }
        
        const token=jwt.sign({
            userID:user._id,
            email:user.email,
            isLoggedIn:"true"
        },mySecretKey,{
            expiresIn: '7h'
        })

        console.log("login Successfull")
        res.cookie('auth',token);
        res.redirect('/')
    }catch(e){
        console.log(e.message)
        res.redirect('signup')
    }
})

router.get('/signup',async(req,res)=>{
    res.render('auth/signup',{
        title:"Signup"
    })
}) 
router.post('/signup',async(req,res)=>{
    try{
        console.log(req.body)
        var user=new User(req.body)
        await user.save()
        console.log("Signup Complete")
        res.redirect('/login')
    }catch(e){
        console.log(e.message)
        res.redirect('/signup')
    }
})


router.get('/logout',async(req,res)=>{
    await jwt.destroy()
    res.render('auth/login',{
        title:"login"
    })
}) 

module.exports=router