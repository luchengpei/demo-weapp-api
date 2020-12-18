// const Database = require('./Database')
// const db = new Database({
//     database: 'lemon'
// })
const Database = require('../lib/dataBase.js')
module.exports = (options) => {
    return (req, res, next) => {
        req.db = new Database(options)
        next()
    }
}