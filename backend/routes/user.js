const express = require('express');
const zod = require('zod');
const { User , Account } = require('../db')
const JWT_SECRET = require('../config');
const jwt = require('jsonwebtoken');
const { authMiddleware } = require('../middleware');

const router = express.Router();

const signupSchema = zod.object({
    username : zod.string().email(),
    first_name : zod.string(),
    last_name : zod.string(),
    password : zod.string()
    
})

router.post("/signup" , async (req,res) => {
    const { success } = signupSchema.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            message: "Email already taken / Incorrect inputs"
        })
    }

    const existingUser = await User.findOne({
        username: req.body.username
    })

    if (existingUser) {
        return res.status(411).json({
            message: "Email already taken/Incorrect inputs"
        })
    }

    const user = await User.create({
        username: req.body.username,
        password: req.body.password,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
    })
    const userId = user._id;

    await Account.create({
        userId,
        balance: 1 + Math.random() * 10000
    })

    const token = jwt.sign({
        userId
    }, JWT_SECRET);

    res.json({
        message: "User created successfully",
        token: token
    })

})

const signinSchema = zod.object({
    username: zod.string().email(),
    password: zod.string()
})

router.post("/signin" , async(req,res) => {
    const {success} = signinSchema.safeParse(req.body);

    if(!success){
        res.json({
            message: "Incorrect token"
        })
    }

    const user = await User.findOne({
        username: req.body.username,
        password: req.body.password
    });

    if(user){
        const token = jwt.sign({
            userId: user._id
        },JWT_SECRET);

        res.json({
            token: token
        })
        return;
    }
    res.status(411).json({
        message: "Error while logging in"
    })
})

const updateBody = zod.object({
    password: zod.string().optional(),
    first_name: zod.string().optional(),
    last_name: zod.string().optional()
})

router.put("/" , authMiddleware , async(req,res) =>{
    const {success} = updateBody.safeParse(req.body)

    if(!success){
        res.json({
            message: "Error while updating"
        })
    }

    await User.updateOne(req.body, {
        id: trq.userId
    })

    res.json({
        message: "Update successfully"
    })
})

router.get("/bulk" , async(req,res) =>{
    const filter = req.query.filter || "";

    const users = await User.find({
        $or: [{
            first_name: {
                "$regex": filter
            }
        },{
            last_name: {
                "$regex": filter
            }
        }]
    })

    res.json({
        user:users.map(user => ({
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            id: user._id
        }))
    })
})

module.exports = router;
