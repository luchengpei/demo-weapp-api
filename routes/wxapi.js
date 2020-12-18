const express = require('express')
const router = express.Router()
const { ObjectID } = require('mongodb');
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './public/images')
        },
        filename: function (req, file, cb) {
            let changeName = (new Date().getTime()) + '-' + file.originalname
            cb(null, changeName)
        }
    })
})


//删除指定文件 dir目录  fileName目录下面的文件名
let nods = (dir, fileName) => {
    fs.readdir(dir, (err, files) => {
        files.forEach(filename => {
            let src = path.join(dir, filename);
            fs.stat(src, (err, st) => {
                if (err) { throw err; }
                // 判断是否为文件
                if (st.isFile()) {
                    if (filename == fileName) {
                        fs.unlink(src, (err) => {
                            if (err) throw err;
                            console.log('成功删除' + src);
                        });
                    }
                } else {
                    // 递归作为文件夹处理
                    nods(src);
                }
            });
        });
    });
};

//发布动态  临时参数
let saveImg = []

//发布动态时,用户上传了图片，删除
router.post('/dele-img', (req, res) => {
    nods('./public/images', req.body.filename)
    let index = saveImg.findIndex(row => row.filename == req.body.filename)
    saveImg.splice(index, 1)
    res.json({
        code: 200,
        data: null,
        msg: ''
    })
})
//图片上传   single('img) img为参数
router.post('/imgUplaod', upload.single('img'), (req, res) => {
    const { userId } = req.body
    // let path = []   类型为array时
    // req.files.forEach(row => {
    //     path.push({
    //         imgUrl:'http://127.0.0.1:3000/' + row.path.replace('public\\', '').replace('\\', '/')
    //     })
    // })
    // res.send({})
    // res.send({
    //     code: 200,
    //     path: 'http://127.0.0.1:3000/' + req.file.path.replace('public\\', '').replace('\\', '/')
    // })
    saveImg.push({
        userId: userId,
        url: 'http://127.0.0.1:3000/' + req.file.path.replace('public\\', '').replace('\\', '/'),
        filename: req.file.filename
    })
    res.send({
        img: 'http://127.0.0.1:3000/' + req.file.path.replace('public\\', '').replace('\\', '/'),
        filename: req.file.filename,
    })
})


//删除图片      TODO
router.post('/delete-img', (req, res) => {
    const { db } = req
    const { userId, url, filename } = req.body
    console.log(userId, url)
    //根据添加时候的那条数据  临时id查找
    db.collection('wxapi').find({ userId: Number(userId) }, (err, data) => {
        if (err) throw err
        if (data.length) {
            let list = data[0]
            let index = list.imgList.findIndex(row => row == url)
            let res = list.imgList.splice(index, 1)
            dele(res)
        } else {
            res.json({
                code: 400,
                data: null,
                msg: '删除失败'
            })
            return false
        }
    })
    function dele(res) {
        db.collection('wxapi').update({ userId: Number(userId) }, { $set: { imgList: res } }, (err, data) => {
            if (err) throw err
            if (data.result.nModified) {
                nods('./public/images', filename)
                res.json({
                    code: 200,
                    data: null,
                    msg: '删除成功'
                })
            } else {
                res.json({
                    code: 400,
                    data: null,
                    msg: '删除失败'
                })
                return false
            }
        })
    }
})
//登陆
router.post('/login', (req, res) => {
    res.json({})
})
//获取列表
router.get('/list', (req, res) => {
    const { db } = req
    db.collection('wxapi').find({}, (err, data) => {
        if (err) throw err
        console.log(data, 'data111')
        res.json({
            code: 200,
            data,
            msg: ''
        })
    })
})

//查找单条详情
router.get('/life-detail', (req, res) => {
    const { db, query } = req
    const { id } = query
    if (!id) {
        res.json({
            code: 400,
            data: null,
            msg: 'id不能为空'
        })
        return false
    }
    db.collection('wxapi').find({ _id: ObjectID(id) }, (err, data) => {
        if (err) throw err
        if (data.length) {
            res.json({
                code: 200,
                data: data[0],
                msg: ''
            })
        } else {
            res.json({
                code: 400,
                data: null,
                msg: '查询失败'
            })
        }
    })
})
//发布
router.post('/add-list', (req, res) => {
    const { db, body } = req
    if (!Object.keys(body).length) {
        res.json({
            code: 400,
            data: null,
            msg: '内容必填'
        })
        return false
    }
    let addObj = {
        ...body,
        ... {
            createTime: Date.now(),
            follow: false,
            isLike: false,
            commentNum: 0,
            likeNum: 0,
            status: 0,
            imgList: saveImg
        }
    }
    db.collection('wxapi').insert(addObj, (err, data) => {
        if (err) throw err
        if (data.ops.length) {
            res.json({
                code: 200,
                data: saveImg,
                msg: '发布成功'
            })
            saveImg = []
        }
    })
})

//收藏&&取消收藏
router.get('/collection', (req, res) => {
    const { db, query } = req
    const { id } = query
    if (!id) {
        res.json({
            code: 400,
            data: null,
            msg: 'id不能为空'
        })
        return false
    }
    function toggleAction({ id, isCollection, status, msg, isLike, likeNum }) {
        db.collection('wxapi').update({ _id: ObjectID(id) }, { $set: { likeNum: isCollection ? ++likeNum : --likeNum, status, isLike: !isLike } }, (err, data) => {
            if (err) throw err
            if (data.result.nModified) {
                res.json({
                    code: 200,
                    data: null,
                    msg
                })
            }
        })
    }
    db.collection('wxapi').find({ _id: ObjectID(id) }, (err, data) => {
        if (err) throw err
        let { likeNum, status, isLike } = data[0]
        if (data.length) {
            if (!status) {//收藏
                toggleAction({
                    id, isLike, status: 1, likeNum,
                    isCollection: true,
                    msg: '收藏成功'
                })
            } else {//取消收藏
                toggleAction({
                    id, isLike, status: 0, likeNum,
                    isCollection: false,
                    msg: '取消收藏'
                })
            }
        } else {
            res.json({
                code: 400,
                data: null,
                msg: '查询不到'
            })
        }
    })
})
//发布留言和评论
router.post('/issue', (req, res) => {
    const { db, body } = req
    const { id, commentList, type } = body
    db.collection('wxapi').update({ _id: ObjectID(id) }, { $set: { commentList } }, err => {
        if (err) throw err
        return res.json({
            code: 200,
            data: null,
            msg: type == 'send' ? '发布成功' : type == 'response' ? '评论成功' : '删除成功'
        })
    })
})
//更新个人信息  TODO
router.post('/update-userInfo', (req, res) => {
    const { db, body } = req
    const { nickName } = body
    db.collection('api').update({ nickName }, { $set: {} })
})
//删除list
router.get('/remove', (req, res) => {
    const { db } = req
    db.collection('wxapi').remove({}, (err, data) => {
        res.json({
            data
        })
    })
})

router.post('/remove/one', (req, res) => {
    const { db } = req
    const {id} = req.body
    db.collection('wxapi').remove({ _id: ObjectID(id) }, (err, data) => {
        res.json({
            data
        })
    })
})
module.exports = router