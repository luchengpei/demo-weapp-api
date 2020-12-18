const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();
const fs = require('fs')
const path = require('path')
const image = require('imageinfo')
function readFileList(path, filesList) {
    let files = fs.readdirSync(path)
    files.forEach(item => {
        let stat = fs.statSync(path + item)
        if (stat.isDirectory()) {
            readFileList(path + item + '/', filesList)
        } else {
            let obj = {}
            obj.path = path
            obj.filename = item
            filesList.push(obj)
        }
    })
}
let getFiles = {
    getFileList: function (path) {
        let fileList = []
        readFileList(path, fileList)
        return fileList
    },

    getImageFiles: function (path) {
        let imageList = []
        this.getFileList(path).forEach(item => {
            let ms = image(fs.readFileSync(item.path + item.filename))
            ms.mimeType && (imageList.push(item.filename))
        })
        return imageList
    }
}
//注册
router.post('/register', (req, res, next) => {
    const { body, db } = req
    const { userName, password, rePassword, email } = body
    if (!userName || !password || !rePassword || !email) {
        res.send({
            code: 400,
            msg: '缺少参数',
            data: null
        })
        return false
    }
    db.collection('api').find({
        $or: [{ userName }, { email }]
    }, (err, data) => {
        if (err) throw err
        if (data.length) {
            res.send({
                code: 400,
                msg: '该账号已注册',
                data: null
            })
        } else {
            db.collection('api').insert(body, (err, data) => {
                if (err) throw err
                if (data.result.n) {
                    res.send({
                        code: 200,
                        msg: '注册成功',
                        data: null
                    })
                }
            })
        }
    })
})

//登陆
router.post('/login', (req, res) => {
    const { body, db } = req
    const { userName, password } = body
    if (!userName || !password) {
        res.send({
            code: 400,
            msg: '参数不正确',
            data: null
        })
        return false
    }
    db.collection('api').find({ userName }, (err, data) => {
        if (err) throw err
        if (data.length) {
            if (data[0].password !== password) {
                res.send({
                    code: 400,
                    msg: '密码错误',
                    data: null
                })
            } else {
                res.send({
                    code: 200,
                    msg: '登陆成功',
                    data: null
                })
            }

        } else {
            res.send({
                code: 400,
                msg: '账号不存在',
                data: null
            })
        }
    })
})
router.get('/file', (req, res) => {
    let p = path.join(__dirname, '../public/images/')
    console.log(getFiles.getImageFiles(p), 'xxx')
    res.send({
        code: 1
    })
})
module.exports = router