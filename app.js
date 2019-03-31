//EXpress Config
var express = require('express'),
    app = express(),
    loki = require('lokijs'),
    session = require('express-session'),
    bodyParser = require('body-parser');

//DB config
var db = new loki('trending.db', {
    autoload: true,
    autoloadCallback : databaseInitialize,
    autosave: true,
    autosaveInterval: 4000
});
var User;
var Item;

function databaseInitialize() {
    User = db.getCollection("users");
    Item = db.getCollection("items");
    if (User === null) {
        User = db.addCollection("users");
        User.insert({username:'admin',password:'admin'});
        User.insert({username:'user',password:'user'});
    }
    if (Item === null) {
        Item = db.addCollection('items');
    }
    console.log(User);
}

//EJS
var port = process.env.PORT || 7000;
app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(session({key: 'sid',secret: 'srt', resave: false, saveUninitialized: false}));
app.listen(port);

// This is example of logging message in the console (black screen)
console.log('Trending app started on http://localhost:'+port);

// function to match username and password
function userPasswordMatch (userName, password) {
    var loginUser = User.findOne({username:userName,password:password});
    if (loginUser != null) return true;
    else return false;
}

// load login page
app.get('/', function (request, response) {
    response.render('index', {message: null});
});

// click Welcome on login page
app.post('/login', function (request, response) {
    var loginName = request.body.loginName;
    var password = request.body.password;

    request.session.user = loginName;

    if (userPasswordMatch(loginName, password) == true) {
        var items = Item.find({});
        console.log(items);
        response.render('listpage', {items: items});
    } else {
        response.render('index', {message: "Invalid user name or password"});
    }

});

// delete and sort based on name
function deleteAndSort (itemName, itemValue) {
    var myItem = Item.chain().find({[itemName]:itemValue}).remove();
    var allItems = Item.chain().find().simplesort('likes').data().reverse();
    return (allItems);
}

// save all information on add page
function saveFormAndReturnAllItems (form) {
    Item.insert(form);
    var allItem = Item.find();
    console.log (allItem);
    return allItem;
}

// like and sort based on name
function likeAndSort (itemName, itemValue) {
    var myItem = Item.find({[itemName]:itemValue});
    if (myItem[0].likes == '' || myItem[0].likes == null)
        myItem[0].likes = 1;
    else
        myItem[0].likes += 1;
    Item.update(myItem);
    console.log(myItem[0]);
    var allItems = Item.chain().find().simplesort('likes').data().reverse();
    return (allItems);
}

// ---------- do not change above unless you know what you are doing :) -----------


// when the link Add New Item is clicked
app.get('/additem', function (request, response) {
    response.render('addpage',{loginName:request.session.user});
});

// when save button is clicked on add page
app.post('/saveitem', function (request, response) {

    response.render('listpage',{ items:[] });
});

