const { validationResult, param } = require('express-validator');

const express = require('express');
const router = express.Router();

const database = require('../../../database');
const db = database();

const { validateToken } = require("../../../middleware/authMiddleware");

const { apiServerError, apiClientError } = require('../../../helpers/apiErrorHandler');


router.get('/:id', validateToken, param('id').isInt(), async (req, res) => {
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

    const id = req.params.id;

    let user_id;
    try {
        let [user_id_query] = await db.execute(`select id from users where id = ? and deleted_at is null;`, [id]);
        user_id = user_id_query[0]?.id;
    } catch (error) {
        return apiServerError(req, res);
    }

    if(!user_id){
        return apiClientError(req, res, null, "Resource not found", 404);
    }

    let data = {};

    try {
        let [rows_1] = await db.execute(
        `
        SELECT
            first_name,
            last_name,
            followers,
            following
        FROM
            users
        where 
            id = ?
        `, [id]);

        data = rows_1[0]
    } catch (error) {
        return apiServerError(req, res);
    }

    res.status(200).json(
        {
            method: req.method,
            error: false,
            code: 200,
            message: "Success",
            data: data,
        }
    );
});

router.get('/:id/followers', validateToken, param('id').isInt(), async (req, res) => {
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

    const id = req.params.id;

    let user_id;
    try {
        let [user_id_query] = await db.execute(`select id from users where id = ? and deleted_at is null;`, [id]);
        user_id = user_id_query[0]?.id;
    } catch (error) {
        return apiServerError(req, res);
    }

    if(!user_id){
        return apiClientError(req, res, null, "Resource not found", 404);
    }

    let data = {};

    try {
        let [rows_1] = await db.execute(
        `
        select 
            followers.*,
            users.first_name,
            users.last_name
        from 
            followers 
        join
            users on users.id = followers.user_id
        where 
            followers.followed_user_id = ?;
        `, [id]);

        data = rows_1;
    } catch (error) {
        return apiServerError(req, res);
    }

    res.status(200).json(
        {
            method: req.method,
            error: false,
            code: 200,
            message: "Success",
            data: data,
        }
    );
});

router.get('/:id/following', validateToken, param('id').isInt(), async (req, res) => {
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

    const id = req.params.id;

    let user_id;
    try {
        let [user_id_query] = await db.execute(`select id from users where id = ? and deleted_at is null;`, [id]);
        user_id = user_id_query[0]?.id;
    } catch (error) {
        return apiServerError(req, res);
    }

    if(!user_id){
        return apiClientError(req, res, null, "Resource not found", 404);
    }

    let data = {};

    try {
        let [rows_1] = await db.execute(
        `
        select 
            followers.*,
            users.first_name,
            users.last_name
        from 
            followers 
        join
            users on users.id = followers.followed_user_id
        where 
            followers.user_id = ?;
        `, [id]);

        data = rows_1;
    } catch (error) {
        return apiServerError(req, res);
    }

    res.status(200).json(
        {
            method: req.method,
            error: false,
            code: 200,
            message: "Success",
            data: data,
        }
    );
});

router.post('/:id/follow', validateToken, param('id').isInt(), async (req, res) => {
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

    const id = req.params.id;

    let user_id;
    try {
        let [user_id_query] = await db.execute(`select id from users where id = ? and deleted_at is null;`, [id]);
        user_id = user_id_query[0]?.id;
    } catch (error) {
        return apiServerError(req, res);
    }

    if(!user_id){
        return apiClientError(req, res, null, "Resource not found", 404);
    }

    if(user_id == req.user.user_id){
        return apiClientError(req, res, null, "User cannot follow themselves", 400);
    }

    let current_followers;
    try {
        const [followers_query] = await db.execute(`select * from followers where followed_user_id = ? and user_id = ? and deleted_at is null;`, [id, req.user.user_id]);
        current_followers = followers_query;
    } catch (error) {
        return apiServerError(req, res);
    }

    if(current_followers.length > 0){
        return apiClientError(req, res, null, "Current user has already follwed the user", 422);
    }

    let sql = `
    insert into 
    followers(user_id, followed_user_id)
    values(?, ?);
    `;

    try {
        await db.execute(sql, [req.user.user_id, id]);
        await db.execute(`update users set following = following + 1 where id = ?`, [req.user.user_id]);
        await db.execute(`update users set followers = followers + 1 where id = ?`, [id]);
    } catch (error) {
        return apiServerError(req, res);
    } 

    res.status(201).json(
        {
            method: req.method,
            error: false,
            code: 201,
            message: "User followed successfully.",
            data: [],
        }
    );
});

router.delete('/:id/follow', validateToken, param('id').isInt(), async (req, res) => {
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

    const id = req.params.id;

    let user_id;
    try {
        let [user_id_query] = await db.execute(`select id from users where id = ? and deleted_at is null;`, [id]);
        user_id = user_id_query[0]?.id;
    } catch (error) {
        return apiServerError(req, res);
    }

    if(!user_id){
        return apiClientError(req, res, null, "Resource not found", 404);
    }

    if(user_id == req.user.user_id){
        return apiClientError(req, res, null, "User cannot unfollow themselves", 400);
    }

    let current_followers;
    try {
        const [followers_query] = await db.execute(`select * from followers where followed_user_id = ? and user_id = ? and deleted_at is null;`, [id, req.user.user_id]);
        current_followers = followers_query;
    } catch (error) {
        return apiServerError(req, res);
    }

    if(current_followers.length < 1){
        return apiClientError(req, res, null, "Current user has not followed this user", 422);
    }

    const newDate = new Date();
    newDate.setHours(newDate.getHours() - 3);

    sql = `update likes set deleted_at = STR_TO_DATE(?, '%Y-%m-%dT%H:%i:%s.%fZ') where user_id = ? and deleted_at is null;`
    try {
        await db.execute(sql, [newDate.toISOString(), req.user.user_id]);
        await db.execute(`update users set following = following - 1 where id = ?`, [req.user.user_id]);
        await db.execute(`update users set followers = followers - 1 where id = ?`, [id]);
    } catch (error) {
        return apiServerError(req, res);
    } 

    res.status(201).json(
        {
            method: req.method,
            error: false,
            code: 201,
            message: "User unfollowed successfully.",
            data: [],
        }
    );
});

module.exports = router;