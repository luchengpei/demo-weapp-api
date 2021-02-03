/*
 * @Description: Description
 * @Author: 陆城锫
 * @Date: 2021-01-14 15:51:29
 */
const express = require('express')
const { ObjectID } = require('mongodb');
const router = express.Router()
router.post('/login', (req, res) => {
    const { session, db } = req
    if (!session) {
        return res.json({
            code: 400,
            data: null,
            msg:'登陆过期'
        })
    } else {
        res.json({
            code: 200,
            data: [],
            msg:'成功'
        })
    }
    
})

router.get('/article/list', (req, res) => {
    const { db } = req
    db.collection('taro').find({}, (error, data) => {
       return res.json({
            code: 200,
            data: data,
            msg:'成功'
        })
    })
   
})


router.post('/article/add-or-update', (req, res) => {
    const { db, body,query } = req
    if (!Object.keys(body).length) {
        return res.json({
            code: 200,
            data: null,
            msg:'缺少参数'
        })
    }   
    if (query.type == 'add') {
        db.collection('taro').insert(body, (error,data)=> {
            if (error) throw error(error)
            return res.json({
                code: 200,
                data: null,
                msg:'添加成功'
            })
        })
    } else {
        //更新
        console.log(111)
    }
})
router.get('/update/preview-num', (req, res) => {
    const { db, query } = req
    const { id } = query
    if (!id) {
        return res.json({
            code: 400,
            data: null,
            msg:'id必填'
        })
    }
    db.collection('taro').find({ _id: ObjectID(id) }, (error, data) => {
        if (error) throw new Error(error)
        if (data.length) {
            let { preViewNum } = data[0]
            db.collection('taro').update({ _id: ObjectID(id) }, { $set: { preViewNum: ++preViewNum } }, (error, data) => {
                if (error) throw new Error(error)
                return res.json({
                    code: 200,
                    data: null,
                    msg:'操作成功'
                })
            })
        }
        
    })
})
module.exports = router