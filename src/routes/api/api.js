require('dotenv').config();

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json(
        {
            method: "GET",
            error: false,
            code: 200,
            message: "Welcome to DeliSystem API.",
        }
    );
});

const v1Router = require('./v1/v1');
router.use("/v1", v1Router);

router.use((req, res) => {
    res.status(404).json(
        {
            method: req.method,
            error: true,
            code: 404,
            message: "'" + req.originalUrl + "'" + " was not found.",
            data: [],
            hints: [
                "Can not request " + req.method.toLocaleLowerCase() + " to " + "'" + req.originalUrl + "'."
            ],
        }
    );
});

module.exports = router;