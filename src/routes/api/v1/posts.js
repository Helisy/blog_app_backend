const { checkSchema, validationResult, param } = require('express-validator');

const express = require('express');
const router = express.Router();

const database = require('../../../database');
const db = database();

const { mySqlFilter, msySqlUpdateConstructor } = require('../../../helpers/sqlConstructors');

const { validateToken } = require("../../../middleware/authMiddleware");

const { apiServerError, apiClientError } = require('../../../helpers/apiErrorHandler');

const baseFilterValidation = require('../../../validations/v1/vl_base_filter_query'); 
router.get('/', validateToken, checkSchema(baseFilterValidation), async (req, res) => {
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

    const data_query = 
    {
        date_from: req.query.date_from,
        date_to: req.query.date_to,
        order: req.query.order,
        limit: req.query.limit,
    };

    removeUndefinedKeys(data_query)

    let data = [];

    const showDeleted = req.user.role === "admin" ? "" : "deleted_at is null";
    let sqlFilter = mySqlFilter(data_query, customSqlFilter=showDeleted);
    try {
        let [rows_1] = await db.execute(
        `
        SELECT
            *
        FROM
            posts
            ${sqlFilter}
        `);
        data = rows_1;
    } catch (error) {
        return apiServerError(req, res)
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

    let data = [];

    try {
        let [rows_1] = await db.execute(
        `
        SELECT
            *
        FROM
            posts
        where 
            id = ?
        `, [id]);
        data = rows_1;
    } catch (error) {
        return apiServerError(req, res)
    }

    res.status(200).json(
        {
            method: req.method,
            error: false,
            code: 200,
            message: "",
            data: data,
        }
    );
});

const postPostsValidation = require('../../../validations/v1/posts/post_posts_vl'); 
router.post('/', validateToken, checkSchema(postPostsValidation), async (req, res) => {
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

    const { title, content } = req.body;

    let data = [];

    let sql = `
    insert into 
    posts(user_id, title, content)
    values(?, ?, ?);
    `;

    try {
        const [row] = await db.execute(sql, [req.user.user_id, title, content]);
        const [last_insert] =  await db.execute(`select * from posts where id = ? and deleted_at is null`, [row.insertId]);
        data = last_insert[0];
    } catch (error) {
        return apiServerError(req, res)
    } 

    res.status(201).json(
        {
            method: req.method,
            error: false,
            code: 201,
            message: "Post created successfully.",
            data: data,
        }
    );
});

const putPostsValidation = require('../../../validations/v1/posts/put_posts_vl'); 
router.put('/:id', validateToken, param('id').isInt(), checkSchema(putPostsValidation), async (req, res) => {
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

    let user_id;
    try {
        let [user_id_query] = await db.execute(`select user_id from posts where id = ?;`, [id]);
        user_id = user_id_query[0].user_id;
    } catch (error) {
        return apiServerError(req, res)
    }

    if(user_id !== req.user.user_id){
        return apiClientError(req, res, null, "Unauthorized", 401);
    }

    const data_body = 
    {
        title: req.body.title,
        content: req.body.content,
    };

    removeUndefinedKeys(data_body)

    if(Object.keys(data_body).length < 1) return apiClientError(req, res, {
        "name": "ValidationError",
        "detail": "The body is empty."
    }, "Validation Error" , 400);

    const id = req.params.id;

    const sqlUpdate =  msySqlUpdateConstructor("posts", id, data_body, customSqlFilter="deleted_at is null");

    let updated = {};
    try {
        await db.execute(sqlUpdate.sql, sqlUpdate.values);
        var [updated_row] = await db.execute(`select * from posts where id = ${id};`);
        updated = updated_row[0]
    } catch (error) {
        return apiServerError(req, res)
    }

    res.status(200).json(
        {
            method: req.method,
            error: false,
            code: 200,
            message: "Post updated successfully.",
            data: updated,
        }
    );
});

function removeUndefinedKeys(obj) {
    for (const key in obj) {
      if (obj[key] === undefined || obj[key] === null) {
        delete obj[key];
      }
    }
    return obj;
}
 
router.delete('/:id', validateToken, param('id').isInt(), async (req, res) => {
    const id = req.params.id;

    let user_id;
    try {
        let [user_id_query] = await db.execute(`select user_id from posts where id = ?;`, [id]);
        user_id = user_id_query[0].user_id;
    } catch (error) {
        return apiServerError(req, res)
    }

    if(user_id !== req.user.user_id && req.user.role !== "admin"){
        return apiClientError(req, res, null, "Unauthorized", 401);
    }
    
    let data = [];

    const newDate = new Date();
    newDate.setHours(newDate.getHours() - 3);

    sql = `update posts set deleted_at = STR_TO_DATE(?, '%Y-%m-%dT%H:%i:%s.%fZ') where id = ? and deleted_at is null;`
    try {
        await db.execute(sql, [newDate.toISOString(), id]);
        let [rows_2] = await db.execute(`select * from posts where id = ?;`, [id]);
        data = rows_2;
    } catch (error) {
        console.log(error)
        return apiServerError(req, res)
    }

    res.status(200).json(
        {
            method: req.method,
            error: false,
            code: 200,
            message: "Posts deleted successfully.",
            data: data,
        }
    );
});

module.exports = router;