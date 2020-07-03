var express = require('express')
var bodyParser = require('body-parser')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var mongoose = require('mongoose')

app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

mongoose.Promise =Promise 

var dbUrl = 'mongodb://test:shukla01@cluster0-shard-00-00.2xrdw.mongodb.net:27017,cluster0-shard-00-01.2xrdw.mongodb.net:27017,cluster0-shard-00-02.2xrdw.mongodb.net:27017/learning-node?ssl=true&replicaSet=atlas-8h88g9-shard-0&authSource=admin&retryWrites=true&w=majority'

var Message = mongoose.model('Message', {
    name: String,
    message: String
})

app.get('/messages', (req, res) => {
    Message.find({}, (err, messages) =>{
        res.send(messages)
    })
})

app.post('/messages',async (req, res) => {

    try {

    var message = new Message(req.body)

    var savedMessage= await message.save()
    
    console.log('saved')

    var censored = await Message.findOne({message:'badword'})
    
    if(censored)
        await Message.deleteOne({ _id:censored.id })
    else
        io.emit('message', req.body)
    
    res.sendStatus(200)
    } catch (error) {
        res.sendStatus(500)
        return console.error(error)
    } finally {
       // console.log("will execute no matter what")
    }
})

io.on('connection', (socket) => {
    console.log('a user connected')
})

mongoose.connect(dbUrl, { useNewUrlParser: true , useUnifiedTopology: true}, (err) => {
    console.log('mongo db connection', err)
})

var server = http.listen(3000, () => {
    console.log('server is listening on port', server.address().port)
})