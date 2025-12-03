const mongodb = require('mongodb')

const MongoClient = mongodb.MongoClient


let _db;

const mongoConnect = (callback) => {
    MongoClient.connect('mongodb+srv://mh711748_db_user:13851358@cluster0.kozx12z.mongodb.net/?appName=Cluster0')
        .then((client) => {
            console.log('connect');
            _db = client.db()
            callback()
        }).catch((err) => {
            console.log('err');
            console.log(err);
            throw err
        })


}

const getDb = () => {
    if (_db) {
        return _db
    }

    throw 'not found database'
}


exports.mongoConnect = mongoConnect
exports.getDb = getDb
