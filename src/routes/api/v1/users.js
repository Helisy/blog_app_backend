const { checkSchema, validationResult, param } = require('express-validator');

const express = require('express');
const router = express.Router();

const database = require('../../../database');
const db = database();

const { mySqlFilter, msySqlUpdateConstructor } = require('../../../helpers/sqlConstructors');

const { validateToken } = require("../../../middleware/authMiddleware");

const { apiServerError, apiClientError } = require('../../../helpers/apiErrorHandler');

const { removeUndefinedKeys } = require('../../../helpers/objectValidators');

router.post('/:id/likes', validateToken, param('id').isInt(), async (req, res) => {
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
        let [user_id_query] = await db.execute(`select user_id from posts where id = ? and deleted_at is null;`, [id]);
        user_id = user_id_query[0]?.user_id;
    } catch (error) {
        return apiServerError(req, res);
    }

    if(!user_id){
        return apiClientError(req, res, null, "Resource not found", 404);
    }

    let current_like;
    try {
        const [likes_query] = await db.execute(`select id from likes where father_id = ? and user_id = ? and type = "post" and deleted_at is null;`, [id, req.user.user_id]);
        current_like = likes_query;
    } catch (error) {
        return apiServerError(req, res);
    }

    if(current_like.length > 0){
        return apiClientError(req, res, null, "Post already liked by the user", 422);
    }

    let sql = `
    insert into 
    likes(user_id, father_id, type)
    values(?, ?, ?);
    `;

    try {
        await db.execute(sql, [req.user.user_id, id, "post"]);
        await db.execute(`update posts set likes = likes + 1 where id = ?`, [id]);
    } catch (error) {
        return apiServerError(req, res);
    } 

    res.status(201).json(
        {
            method: req.method,
            error: false,
            code: 201,
            message: "Like added successfully.",
            data: [],
        }
    );
});

module.exports = router;