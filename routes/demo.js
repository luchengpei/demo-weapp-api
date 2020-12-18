const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();
router.get('/test', (req, res) => {
    const { db, query } = req
    const { id } = query
    db.collection('api').find({ id }, (err, data) => {
        if (err) throw err
        if (!data.length) {
            res.send({
                code: 400,
                msg: '暂无数据',
                data: []
            })
        } else {
            res.send({
                code: 200,
                msg: '查询成功',
                data
            })
        }
    })
})
router.post('/test/update', (req, res) => {
    const { body, db } = req
    const { id, data } = body
    console.log(body, 'body')
    if (!id || !data) {
        res.send({
            code: '缺少参数'
        })
    } else {
        db.collection('api').find({ id }, (err, data) => {
            if (err) throw err
            if (data.length) {
                db.collection('api').update({ id }, { id: 2 }, (err, data) => {
                    if (err) throw err
                    if (data.length) {
                        res.send({
                            code: 200,
                            msg: '插入成功',
                            data
                        })
                    }
                })
            } else {
                res.send({
                    code: 400,
                    msg: '查询不到数据'
                })
            }
        })
    }
})
router.delete('/test/delete', (req, res) => {
    const { db, body } = req
    const { id } = body
    if (!id) {
        res.send({
            code: 400,
            msg: '查询条件不能为空'
        })
        return false
    }
    db.collection('api').find({ _id: ObjectId(id) }, (err, data) => {
        if (err) throw err
        if (!data.length) {
            res.send({
                code: 400,
                msg: '查询不到数据'
            })
        } else {
            db.collection('api').remove({ _id: ObjectId(id) }, (err, data) => {
                if (err) throw err
                res.send({
                    code: 200,
                    msg: '删除成功'
                })
            })
        }
    })
})
module.exports = router;