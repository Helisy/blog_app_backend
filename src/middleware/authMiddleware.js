require('dotenv').config();

const { verify } = require('jsonwebtoken');

//Verifies if the the acessToken in the cookies is valid.
const validateToken = (req, res, next) => {
    let acessToken = req.cookies.accessToken || req.headers['Authorization'] ;

    if(!acessToken) return res.redirect('/auth/login');

    if(acessToken.includes("Bearer")) acessToken = acessToken.split(" ")[1];

    verify(acessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) =>{

        if(err){
            console.log(err)
            const message = err.name === 'JsonWebTokenError' ? 'Unauthorized' : err.message;
            return res.status(401).json({
                method: req.method,
                error: true,
                code: 401,
                message: message,
                data: []
            })
        }

        req.user = user;
        return next();
    });
}

//Verifies is the user is already logged.
// const isAuthenticated = (req, res, next) => {
//     const acessToken = req.cookies.acessToken;

//     if(!acessToken) return next();

//         verify(acessToken, process.env.TOKEN_SECRETE, (err, user) =>{
//         if (err) return res.sendStatus(403);
//         req.user = user;
//         res.redirect('/');
//     });
// }

module.exports = { validateToken };