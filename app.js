var express = require('express')
var mongoose = require('mongoose')
var session = require('express-session')
var mailer = require('nodemailer')
var multer = require('multer')
var passport = require('passport')
var mongoDb = 'mongodb://localhost/webProject'
var app = express();
var path = require('path')
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname,'public')));
app.use(express.json())
app.use(session({secret: "webProject"}))
app.set('view engine', 'ejs')

var middleFunc = function (request, response, next) {
	if(request.session.isLogin) {
		console.log("User Already LoggedIn")
	} else {
		request.session.isLogin = 1;
		console.log("Login set by Middleware");
		response.send();
	}
}
mongoose.connect(mongoDb, function (error) {
	if(error) {
		throw error;
	}
	console.log("Db opened Successfully");
});

var userSchema = mongoose.Schema({
	name: String,
	email: String,
	password: String,
	city: String,
	phoneno: String, 
	gender: String,
	dob: String,
	role: String,
	status: String,
	flag: String,
	imgpath: String
});

var tagSchema = mongoose.Schema({
	name: String,
	creationdate: String,
	flag: String,
	creator: String 
});

var transporter = mailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ridhavrm@gmail.com',
    pass: 'modi0786'
  }
});

const storageEngine = multer.diskStorage({
	destination: '/public/files',
  	filename: function (req, file, callback) {
    	callback(null, file.fieldname + '-' + Date.now());
  }
})
const upload = multer({
	storage: storageEngine,
	limits: 20000,
}).any();


var userDetails = mongoose.model("userdetails", userSchema);
var tagObject = mongoose.model("tag", tagSchema);
app.get('/', function (request, response) {
	if(request.session.isLogin) {
		console.log("already")
		response.render('homePage', {data: request.session.data})
	}
	else {
		console.log("new")
		response.sendFile(path.join(__dirname,'public','index1.html'))	}
});

app.post('/login', function (request, response) {
	console.log("Req aagyi dost")
	userDetails.find({
		email: request.body.userName,
		password: request.body.passWord
	}).exec(function (error, data) {
		request.session.isLogin = 1;
		request.session.userName = request.body.userName;
		request.session.password = request.body.passWord;
		request.session.data = data;
		response.send(data);
	});
});
app.get('/home', function (request, response) {
	if(request.session.isLogin == undefined) {
		response.redirect("/");
	} else
		response.render('homePage', {data: request.session.data})
})
app.get("/userAdd", function (request, response) {
	if(request.session.isLogin)
		response.render('userAdd');
	else
		response.redirect("/");
})
app.post("/userAdd", function (request, response) {
	let newUser = new userDetails({
		name: request.body.name,
		email: request.body.email,
		password: request.body.password,
		city: request.body.city,
		phone: request.body.phone,
		status: request.body.status,
		flag: request.body.flag,
	});
	newUser.save().then(data => {
		console.log("User added");
	})
	var mailData = {
		from: "ridhavrm@gmail.com",
		to: request.body.email,
		subject: "code quotient confirmation mail",
		text: "Hello " + request.body.name + " this is the verification mail. Please confirm your mail id and your password is " + request.body.password,
	}
	transporter.sendMail(mailData, function (error, info) {
		if(error){
			console.log(error)
		} else {
			console.log("Mail Sent" + info.response);
		}
	})
});
app.get("/userList", function (request, response) {
	if(request.session.isLogin) {
		userDetails.find({}).exec(function(error, data) {
			response.render('userList', {data: data});
		});
	} else {
		response.redirect("/");
	}
});
app.post("/updateUser", function (request, response) {
	userDetails.updateOne(
		{"email": request.session.userName}, 
		{$set: request.body},function (error, data) {
			if(error) 
				throw error
			else {
				console.log("data updated Successfully");
			}
	});
});
app.get("/communityList", function (request, response) {
	if(request.session.isLogin)
		response.render('communityList');
	else 
		response.redirect("/");
})
app.get("/tag", function (request, response) {
	if(request.session.isLogin)
		response.render('tag');
	else 
		response.redirect("/");
});
app.post("/tag", function (request, response) {
	userDetails.findOne({email: request.session.userName}).exec((error, data) => {
		if(error)
			console.log(error)
		else {
			let newTag = new tagObject({
				name: request.body.name,
				creationdate: request.body.creationdate,
				creator: data.name,
				flag: request.body.flag,
			});
			newTag.save().then( data => {
				console.log("Tag Added");
			});
		}
	})
})
app.get("/tag/tagslist", function(request, response) {
	if(request.session.isLogin) {
		tagObject.find({}).exec(function(error, data) {
			response.render('tagslist', {data: data});
		});
	} 
	else 
		response.redirect("/");
})
app.get("/changePassword", function (request, response) {
	if(request.session.isLogin)
		response.render('changePassword');
	else 
		response.redirect("/");
})
app.post("/changePassword", function (request, response) {
	userDetails.updateOne({password: request.body.old}, {password: request.body.new}).exec(data => {
		console.log("Password changed Successfully");
	})
})
app.get("/profile", function(request, response) {
	if(request.session.isLogin)
		response.render("homePage", {data: request.session.data});
	else 
		response.redirect("/")
})
app.get("/editProfile", function(request, response) {
	if(request.session.isLogin)
		response.render("editProfile");
	else 
		response.redirect("/")
})
app.post("/editProfile", upload, function (request, response) {
	if(request.session.isLogin) {
		console.log(request.body)
	} else {
		response.redirect("/");
	}
})
app.get("/logout", function (request, response) {
	request.session.isLogin = 0;
	response.redirect("/");
})
app.post("/sendMail", function (request, response) {
	transporter.sendMail(request.body, function (error, info) {
		if(error){
			console.log("Mail errror")
			console.log(error)
		} else {
			console.log("Mail Sent" + info.response);
		}
	})
})
app.post("/updateState", function (request, response) {
	userDetails.updateOne({_id: request.body.id}, {flag: request.body.state}).exec(data => console.log("state updated"));
	response.send("state updated");
})
app.post("/deleteTag", function (request, response) {
	tagObject.deleteOne({_id: request.body.id}, function(error, result) {
		if(error) {
			response.send("not deleted");
			console.log(error);
		} else {
			response.send("deleted");
			console.log(result);
		}
	})
})
app.post("/getUserData", function (request, response) {
	userDetails.countDocuments(function(error,count){
        var start = parseInt(request.body.start);
        var len  = parseInt(request.body.length);
        userDetails.find({}).skip(start).limit(len)
        .then(data => {
            response.send({"recordsTotal" : count, "recordsFiltered" : count,data})
        })
        .catch(err=> {
            response.send(err)
        })
    })
})

app.listen(8000);


console.log("Running on port 8000");