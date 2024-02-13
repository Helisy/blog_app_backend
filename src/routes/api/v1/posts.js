const { checkSchema, validationResult, param } = require('express-validator');

const express = require('express');
const router = express.Router();

const database = require('../../../database');
const db = database();

const { mySqlFilter, msySqlUpdateConstructor } = require('../../../helpers/sqlConstructors');

const { validateToken } = require("../../../middleware/authMiddleware");

const { apiServerError, apiClientError } = require('../../../helpers/apiErrorHandler');

const getPostsValidation = require('../../../validations/v1/posts/get_posts_vl'); 
const baseFilterValidation = require('../../../validations/v1/vl_base_filter_query'); 
router.get('/', validateToken, checkSchema({...baseFilterValidation, ...getPostsValidation}), async (req, res) => {
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
        search: req.query.search,
    };

    removeUndefinedKeys(data_query)

    let data = [];

    const showDeleted = req.user.role === "admin" ? "" : "deleted_at is null";
    let sqlFilter = mySqlFilter(data_query, customSqlFilter=showDeleted,
        customSqlValidator = {
            search: {
                customKey: `MATCH (title, content)`,
                customValue: `AGAINST ('#value#' IN NATURAL LANGUAGE MODE)`,
            },
        }
    );
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
        return apiServerError(req, res);
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

    console.log(id)

    let user_id;
    try {
        let [user_id_query] = await db.execute(`select user_id from posts where id = ?;`, [id]);
        user_id = user_id_query[0]?.user_id;
    } catch (error) {
        return apiServerError(req, res);
    }

    if(!user_id){
        return apiClientError(req, res, null, "Resource not found", 404);
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

    const sqlUpdate =  msySqlUpdateConstructor("posts", id, data_body, customSqlFilter="deleted_at is null");

    let updated = {};
    try {
        await db.execute(sqlUpdate.sql, sqlUpdate.values);
        var [updated_row] = await db.execute(`select * from posts where id = ${id};`);
        updated = updated_row[0]
    } catch (error) {
        return apiServerError(req, res);
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
        user_id = user_id_query[0]?.user_id;
    } catch (error) {
        return apiServerError(req, res);
    }

    if(!user_id){
        return apiClientError(req, res, null, "Resource not found", 404);
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
        return apiServerError(req, res);
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

router.get('/:id/comments', validateToken, param('id').isInt(), checkSchema(baseFilterValidation), async (req, res) => {
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

    const data_query = 
    {
        date_from: req.query.date_from,
        date_to: req.query.date_to,
        order: req.query.order,
        limit: req.query.limit,
    };

    removeUndefinedKeys(data_query)

    let data = [];

    const showDeleted = req.user.role === "admin" ? `post_id = ${id}` : `deleted_at is null and post_id = ${id}`;
    let sqlFilter = mySqlFilter(data_query, customSqlFilter=showDeleted);

    try {
        let [rows_1] = await db.execute(
        `
        SELECT
            *
        FROM
            comments
            ${sqlFilter}
        `);
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

const postPostsCommentsValidation = require('../../../validations/v1/posts/post_posts_comments_vl'); 
router.post('/:id/comments', validateToken, param('id').isInt(), checkSchema(postPostsCommentsValidation), async (req, res) => {
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
        let [user_id_query] = await db.execute(`select user_id from posts where id = ?;`, [id]);
        user_id = user_id_query[0]?.user_id;
    } catch (error) {
        return apiServerError(req, res);
    }

    if(!user_id){
        return apiClientError(req, res, null, "Resource not found", 404);
    }

    const { content } = req.body;

    let data = [];

    let sql = `
    insert into 
    comments(user_id, post_id, content)
    values(?, ?, ?);
    `;

    try {
        const [row] = await db.execute(sql, [req.user.user_id, id, content]);
        await db.execute(`update posts set comments = comments + 1`);

        const [last_insert] = await db.execute(`select * from comments where id = ? and deleted_at is null`, [row.insertId]);
        data = last_insert[0];
    } catch (error) {
        return apiServerError(req, res);
    } 

    res.status(201).json(
        {
            method: req.method,
            error: false,
            code: 201,
            message: "Comment created successfully.",
            data: data,
        }
    );
});

router.delete('/:post_id/comments/:id', validateToken, param('id').isInt(), async (req, res) => {
    const post_id = req.params.id;
    const id = req.params.id;

    let user_id;
    try {
        let [user_id_query] = await db.execute(`select user_id from comments where id = ?;`, [id]);
        user_id = user_id_query[0]?.user_id;
        
    } catch (error) {
        return apiServerError(req, res, error);
    }

    if(!user_id){
        return apiClientError(req, res, null, "Resource not found", 404);
    }

    if(user_id !== req.user.user_id && req.user.role !== "admin"){
        return apiClientError(req, res, null, "Unauthorized", 401);
    }
    
    let data = [];

    const newDate = new Date();
    newDate.setHours(newDate.getHours() - 3);

    sql = `update comments set deleted_at = STR_TO_DATE(?, '%Y-%m-%dT%H:%i:%s.%fZ') where id = ? and deleted_at is null;`
    try {
        await db.execute(sql, [newDate.toISOString(), id]);

        await db.execute(`update posts set comments = comments - 1 where id = ?`, [post_id]);

        let [rows_2] = await db.execute(`select * from comments where id = ?;`, [id]);
        data = rows_2;
    } catch (error) {
        console.log(error)
        return apiServerError(req, res);
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
        let [user_id_query] = await db.execute(`select user_id from posts where id = ?;`, [id]);
        user_id = user_id_query[0]?.user_id;
    } catch (error) {
        return apiServerError(req, res);
    }

    if(!user_id){
        return apiClientError(req, res, null, "Resource not found", 404);
    }

    let current_like;
    try {
        let [likes_query] = await db.execute(`select id from likes where father_id = ? and type = "post" and deleted_at is null;`, [id]);
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

router.delete('/:id/likes', validateToken, param('id').isInt(), async (req, res) => {
    const id = req.params.id;

    let user_id;
    try {
        let [user_id_query] = await db.execute(`select user_id from likes where father_id = ?;`, [id]);
        user_id = user_id_query[0]?.user_id;
        
    } catch (error) {
        return apiServerError(req, res);
    }

    if(!user_id){
        return apiClientError(req, res, null, "Resource not found", 404);
    }

    if(user_id !== req.user.user_id){
        return apiClientError(req, res, null, "Unauthorized", 401);
    }

    let current_like;
    try {
        let [likes_query] = await db.execute(`select id from likes where father_id = ? and type = "post" and deleted_at is null;`, [id]);
        current_like = likes_query;
    } catch (error) {
        return apiServerError(req, res);
    }
    
    if(current_like.length < 1){
        return apiClientError(req, res, null, "Post have no likes to remove", 422);
    }

    const newDate = new Date();
    newDate.setHours(newDate.getHours() - 3);

    sql = `update likes set deleted_at = STR_TO_DATE(?, '%Y-%m-%dT%H:%i:%s.%fZ') where deleted_at is null;`
    try {
        await db.execute(sql, [newDate.toISOString()]);

        await db.execute(`update posts set likes = likes - 1 where id = ?`, [id]);
    } catch (error) {
        return apiServerError(req, res);
    }

    res.status(200).json(
        {
            method: req.method,
            error: false,
            code: 200,
            message: "Posts deleted successfully.",
            data: [],
        }
    );
});


module.exports = router;