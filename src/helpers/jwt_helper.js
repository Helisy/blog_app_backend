const { sign, verify } = require('jsonwebtoken')
require('dotenv').config();

module.exports = {
  signAccessToken: (userId, payload) => {
    return new Promise((resolve, reject) => {
      const secret = process.env.ACCESS_TOKEN_SECRET
      const options = {
        expiresIn: '1h',
        audience: userId.toString(),
      }
      sign(payload, secret, options, (err, token) => {
        if (err) {
            console.log(err.message)
            reject()
            return
        }
        resolve(token)
      })
    })
  },
  signRefreshToken: (userId) => {
    return new Promise((resolve, reject) => {
      const payload = {}
      const secret = process.env.REFRESH_TOKEN_SECRET
      const options = {
        expiresIn: '1y',
        audience: userId.toString(),
      }
      sign(payload, secret, options, (err, token) => {
        if (err) {
          console.log(err.message)
          // reject(err)
          reject()
        }

        resolve(token);
      })
    })
  },

  verifyRefreshToken: (refreshToken) => {
    return new Promise((resolve, reject) => {
      verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, payload) => {
          if (err) return reject()
          const userId = payload.aud
          resolve(userId);
        }
      )
    })
  },
}