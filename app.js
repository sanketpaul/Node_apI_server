const express = require('express')
const app = express()
const dotenv = require('dotenv')
dotenv.config()
const Port = process.env.PORT || 3000
const morgan = require('morgan')
const fs = require('fs')
const cors = require('cors')

const mongo = require('mongodb')
const { isReadable } = require('stream')
const { query } = require('express')
let MongoClient = mongo.MongoClient
let mongoUrl = process.env.MongoLive
const bodyparser = require('body-parser')

let db;



// MIddleware

app.use(morgan('short', { stream: fs.createWriteStream('./app.logs') }))
app.use(cors())
app.use(bodyparser.urlencoded({ extended: true }))
app.use(bodyparser.json())


// routing
app.get('/maincat', (req, res) => {


    db.collection('maincat').find().toArray((err, result) => {
        if (err) throw err
        res.send(result)
    })
})
app.get('/categories', (req, res) => {
    db.collection('category').find().toArray((err, result) => {
        if (err) throw err
        res.send(result)
    })
})

// Products wrt categoryid
app.get('/products', (req, res) => {
    query = {}
    categoryId = Number(req.query.categoryId);

    if (categoryId) {
        query = { category_id: categoryId }
    }

    db.collection('products').find(query).toArray((err, result) => {
        if (err) throw err
        res.send(result)
    })
})





// subcategory filter wrt category

app.get('/filter/:categoryId', (req, res) => {
    let query = {}
    let categoryId = Number(req.params.categoryId)
    let subcategoryId = Number(req.query.subcategoryId)
    let lprice = Number(req.query.lprice)
    let hprice = Number(req.query.hprice)
    let sortprice = req.query.sortprice
    let sratings = req.query.sratings
    let sort = {}
    if (sortprice) {
        sort = {
            new_price: sortprice
        }
    }
    else if (sratings) {
        sort = { ratings: sratings }

    }



    if (subcategoryId && lprice && hprice) {
        query = {
            category_id: categoryId,
            subcategory_id: subcategoryId,
            $and: [{ new_price: { $gt: lprice, $lt: hprice } }]
        }
    }



    else if (subcategoryId) {
        query = {
            category_id: categoryId,
            subcategory_id: subcategoryId
        }
    }
    else if (lprice && hprice) {
        query = {
            category_id: categoryId,

            $and: [{ new_price: { $gt: lprice, $lt: hprice } }]
        }
    }

    db.collection('products').find(query).sort(sort).toArray((err, result) => {
        if (err) throw err
        res.send(result)
    })
})
// For details of product

app.get('/details/:id', (req, res) => {
    let id = Number(req.params.id)
    db.collection('products').find({ product_id: id }).toArray((err, result) => {

        if (err) throw err
        res.send(result)
    })
})

// orders

app.get('/orders', (req, res) => {
    let query = {}
    let email = req.query.email

    if (email) {
        query = { email: email }
    }
    db.collection('orders').find(query).toArray((err, result) => {
        if (err) throw err
        res.send(result)
    })
})

// Post requesst
app.post('/items', (req, res) => {
    if (Array.isArray(req.body.productId)) {
        db.collection('products').find({ product_id: { $in: req.body.productId } }).toArray((err, result) => {
            if (err) throw err
            res.send(result)

        })
    }
    else {
        res.send("invalid input")
    }
})

// Place order
app.post('/placeorder', (req, res) => {
    console.log(req.body)

    db.collection('orders').insertOne(req.body, (err, result) => {
        if (err) throw err
        res.send('Order Placed')
    })
})
// update the order

app.put('/updateOrder/:Id', (req,res) => {
    let Id = Number(req.params.Id)
    db.collection('orders').updateOne({ "order_id": Id }, {
        $set: {
            "status": req.body.status,
            "bank_name": req.body.bank_name,
            "date": req.body.date
        }
    }, (err, result) => {
        if (err) throw err
            res.send("order updated")
    })
})
// delet the order
app.delete('/deleteOrder/:id',(req,res)=>{
    _id=mongo.ObjectId(req.params.id)
    db.collection('orders').deleteOne({_id},(err,result)=>{
        if(err) throw err
        res.send("order Deleted")
    })
})






// connect with mongodb

MongoClient.connect(mongoUrl, (err, client) => {
    if (err) console.log('error while connecting')
    db = client.db('pharmeasy')
    app.listen(Port, () => {
        console.log(`the server is currently on ${Port}`)
    })

})


