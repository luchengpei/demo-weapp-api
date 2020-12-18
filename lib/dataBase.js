const MongoClient = require('mongodb').MongoClient

const url = "mongodb://localhost:27017"

class Database {
    constructor(ops) {
        // 默认配置
        this.config = {
            host: ops.host || 'mongodb://localhost',
            port: ops.port || '27017',
            // server: this.host + ':' + this.port,
            database: ops.database || 'test'
        }

        // 存查询时候的一些条件
        this.query = {}
    }
    //外部调用 db.collection.xxx  collection返回一些数据库的增删查改的方法 insert  update remove find
    collection(collection) {

        this.query.collection = collection
        let obj = {
            insert: (data, callback) => {
                const { collection } = this.query
                this._query(function (err, db) {
                    db.collection(collection).insert(data, function () {
                        callback(...arguments)
                        db.close()
                    })
                })
            },
            update: (where, data, ops = {}, callback) => {
                if (typeof ops == 'function') {
                    callback = ops
                    ops = {}
                }
                const { collection } = this.query
                this._query(function (err, db) {
                    db.collection(collection).update(where, data, ops, function () {
                        callback(...arguments)
                        db.close()
                    })
                })
            },
            remove: (where, callback) => {
                const { collection } = this.query
                this._query(function (err, db) {
                    db.collection(collection).remove(where, function () {
                        callback(...arguments)
                        db.close()
                    })
                })
            },
            find: (where, callback) => {
                const { collection } = this.query
                let query = {}
                if (callback) {
                    this._query(function (err, db) {
                        db.collection(collection).find(where).toArray(function () {
                            callback(...arguments)
                            db.close()
                        })
                    })
                    return;
                }

                let find = (callback) => {
                    let keys = Object.keys(query)
                    if (keys.length == 3) {
                        this._query(function (err, db) {
                            db.
                                collection(collection)
                                .find(where)[keys[0]](query[keys[0]])[keys[1]](query[keys[1]])[keys[2]](query[keys[2]])
                                .toArray(function () {
                                    callback(...arguments)
                                    db.close()
                                })
                        })
                    }
                    if (keys.length == 2) {
                        this._query(function (err, db) {
                            db.
                                collection(collection)
                                .find(where)[keys[0]](query[keys[0]])[keys[1]](query[keys[1]])
                                .toArray(function () {
                                    callback(...arguments)
                                    db.close()
                                })
                        })
                    }

                    if (keys.length == 1) {
                        this._query(function (err, db) {
                            db.
                                collection(collection)
                                .find(where)[keys[0]](query[keys[0]])
                                .toArray(function () {
                                    callback(...arguments)
                                    db.close()
                                })
                        })
                    }
                }

                let finds = {
                    skip: (skip, callback) => {
                        query.skip = skip
                        if (callback) {
                            find(callback)
                            return;
                        }
                        return finds
                    },
                    limit: (limit, callback) => {
                        query.limit = limit
                        if (callback) {
                            find(callback)
                            return;
                        }
                        return finds
                    },
                    sort: (sort, callback) => {
                        query.sort = sort
                        if (callback) {
                            find(callback)
                            return;
                        }
                        return finds
                    }
                }

                return finds
            }
        }

        return obj;
    }
    //统一连接数据库
    _query(callback) {
        MongoClient.connect(`${this.config.host}:${this.config.port}`, { useUnifiedTopology: true }, (err, client) => {
            let db = client.db(this.config.database)
            db.close = client.close
            callback(err, db)
        })
    }


}


module.exports = Database