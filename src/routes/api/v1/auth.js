require('dotenv').config();

const { checkSchema, validationResult } = require('express-validator');

const express = require('express');
const router = express.Router();

const database = require('../../../database');
const db = database();

const bcrypt = require('bcrypt');

const { apiServerError } = require('../../../helpers/apiErrorHandler');

const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../../../helpers/jwt_helper');

const postAuthLoginValidaiton = require('../../../validations/v1/auth/post_auth_login_vl');
router.post('/login', checkSchema(postAuthLoginValidaiton), async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({
            method: req.method,
            error: true,
            code: 400,
            message: "Incorrect entry.",
            data: result.array()
        })
    }

    const {email, password} = req.body;

    let user;
    try {
        const [user_query] = await db.execute(`SELECT * FROM users WHERE email = ? AND deleted_at IS NULL`, [email])
        user = user_query;
    } catch (error) {
        apiServerError(req, res);
    }

    if(!user.length){
        return res.status(401).json({
            method: req.method,
            error: true,
            code: 401,
            message: "Invalid credentials",
            data: []
        })
	}

    const match = await bcrypt.compare(password, user[0]['password']);

    if(!match){
        return res.status(401).json({
            method: req.method,
            error: true,
            code: 401,
            message: "Invalid credentials",
            data: []
        })
    }

    try {
        const accessToken = await signAccessToken(user[0].id, 
            {
                first_name: user[0].first_name,
                last_name: user[0].last_name,
                user_id: user[0].id,
                email: user[0].email,
                is_verified: user[0].is_verified,
            }
        );

        const refreshToken = await signRefreshToken(user[0].id);

        res.status(200)
        .cookie('accessToken', accessToken, {httpOnly: true})
        .cookie('refreshToken', refreshToken, {httpOnly: true})
        .json(
            {
                method: req.method,
                error: false,
                code: 201,
                message: "Login was sucessfully.",
                data: [],
            }
        );
    } catch (error) {
        apiServerError(req, res);
    }
});

const postAuthRegisterValidaiton = require('../../../validations/v1/auth/post_auth_register_vl');
router.post('/register', checkSchema(postAuthRegisterValidaiton), async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({
            method: "POST",
            error: true,
            code: 400,
            message: "Incorrect field entry.",
            details: result.array()
        })
    }

    const {first_name, last_name, email, password} = req.body;

    const [user] = await db.execute(`SELECT * FROM users WHERE email = ? AND deleted_at IS NULL`, [email])

    if(user.length){
        return res.status(400).json({
            method: req.method,
            error: true,
            code: 400,
            message: "The given email is already registred",
            data: []
        })
	}

    const hash = await bcrypt.hash(password, 10);

    let sql = `INSERT INTO users (first_name, last_name, email, password) VALUES(?, ?, ?, ?);`;
    await db.execute(sql, [first_name, last_name, email, hash])

    res.status(201).json(
        {
            method: "POST",
            error: false,
            code: 201,
            message: "Register new user has been successfully.",
        }
    );
});

router.post('/refresh-token', async (req, res) => {
    const { refresh_token } = req.body;

    if(!refresh_token){
        return res.status(400).json({
            method: req.method,
            error: true,
            code: 400,
            message: "The field refresh_token is required",
            data: []
        })
	}

    try {
        user_id = await verifyRefreshToken(refresh_token);

        const [user] = await db.execute(`SELECT * FROM users WHERE id = ? AND deleted_at IS NULL`, [user_id])

        const accessToken = await signAccessToken(user[0].id, 
            {
                first_name: user[0].first_name,
                last_name: user[0].last_name,
                user_id: user[0].id,
                email: user[0].email,
                is_verified: user[0].is_verified,
            }
        );

        const refreshToken = await signRefreshToken(user[0].id);

        res.status(200)
        .cookie('accessToken', accessToken, {httpOnly: true})
        .cookie('refreshToken', refreshToken, {httpOnly: true})
        .json(
            {
                method: req.method,
                error: false,
                code: 201,
                message: "Login was sucessfully.",
                data: [],
            }
        );
    } catch (error) {
        apiServerError(req, res);
    }
});

router.get('/logout', async (req, res) => {
    res.status(200)
    .cookie('accessToken', '', {maxAge: 1, httpOnly: true})
    .cookie('refreshToken', '', {maxAge: 1, httpOnly: true})
    .json(
        {
            method: "GET",
            error: false,
            code: 200,
            message: "Log out was successfully.",
        }
    );
});


module.exports = router;