var express = require('express')
var mongoose = require('mongoose')
var session = require('express-session')
var mailer = require('nodemailer')
var multer = require('multer')
var passport = require('passport')
var path = require('path')
var passportGithub = require('passport-github')
var mongoDb = 'mongodb://localhost/webProject'
var GithubStrategy = passportGithub.Strategy;
var app = express();
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname,'public')));
app.use(express.json())
app.use(session({secret: "webProject"}))
app.use(passport.initialize());
app.use(passport.session());
app.set('view engine', 'ejs')
passport.serializeUser(function(user, done) {
	done(null, user);
})
passport.deserializeUser(function(user, done) {
	done(null, user);
})
passport.use(new GithubStrategy({
		clientID: "5ab282b850e2ccabe36e",
		clientSecret: "7f2c6dcf973b21fc822832649422dcff0c63fa6d",
		callbackURL: "http://localhost:8000/auth/github/callback"
	},
	function(accessToken, refershToken, profile, callback) {
		return callback(null, profile);
	}
));

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
    pass: 'ridvmodi'
  }
});

const storageEngine = multer.diskStorage({
	destination: './public/files/',
  	filename: function (req, file, callback) {
			var filePath = req.session.data[0]._id + path.extname(file.originalname);
			req.session.data[0].imgpath = filePath;
			callback(null, filePath)
  }
})
const upload = multer({
	storage: storageEngine,
	limits: 1000000,
	fileFilter: function(req, file, callback) {
		validateFile(file, callback)
	}
}).single('files');

function validateFile(file, callback) {
	let extensions = ['jpg', 'png', 'gif', 'jpeg'];
	let isAllowed = extensions.includes(file.originalname.split('.')[1].toLowerCase());
	let isAllowedMimeType = file.mimetype.startsWith("image/")
	if(isAllowed && isAllowedMimeType) {
		return callback(null, true);
	} else { 
		callback("Erorr: File Type not allowed");
	}
}

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
	console.log("Login Request recieved");
	userDetails.find({
		email: request.body.userName,
		password: request.body.passWord
	}).exec(function (error, data) {
		request.session.isLogin = 1;
		request.session.userName = request.body.userName;
		request.session.password = request.body.passWord;
		request.session.data = data;
		request.session.data.imgpath = "avtar.png"
		response.send(data);
	});
});
app.get('/auth/github', passport.authenticate('github'))
app.get('/auth/github/callback',passport.authenticate('github', { failureRedirect: '/' }),
	function(req, res) {
		// Successful authentication, redirect home.
		userDetails.find({
			email: req.session.passport.user._json.email
		}).exec(function (error, data) {
			if(data.length != 0) {
				req.session.isLogin = 1;
				req.session.userName = data.username;
				req.session.password = data.password;
				req.session.data = data;
				req.session.data.imgpath = "avtar.png"
				res.redirect('/home');
			} else {
				var data = new Object({
					name : req.session.passport.user._json.name,
					email : req.session.passport.user._json.email,
					city : req.session.passport.user._json.location,
					status : "pending",
					dob : "31/12/1999",
					phoneno : "1234567890",
					gender : "male",
					imgpath: "avtar.png",
					role: "user",
					flag : "1",
					password: "qwerty123"
				});
				req.session.isLogin = 1;
				let newUser = new userDetails(data);
				newUser.save().then(result => {
				req.session.data = [result];
				console.log("User added");
				var mailData = {
					from: "ridhavrm@gmail.com",
					to: req.session.data[0].email,
					subject: "code quotient confirmation mail",
					text: "Hello " + req.session.data[0].name + " this is the verification mail. Please confirm your mail id and your password is " + req.session.data[0].password,
				}
				transporter.sendMail(mailData, function (error, info) {
					if(error){
						console.log(mailData.to)
						console.log(error)
					} else {
						console.log("Mail Sent" + info.response);
					}
				})
					res.redirect('/editProfile');
				});			
			}
		});
	}
);
app.get('/home', function (request, response) {
	if(request.session.isLogin) {
		response.render('homePage', {data: request.session.data})
	} else {
			response.redirect("/");
	}
})
app.get('/')
app.get("/userAdd", function (request, response) {
	if(request.session.isLogin)
		response.render('userAdd', {data: request.session.data});
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
	console.log(request.body)
	userDetails.updateOne(
		{"email": request.body.email}, 
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
		response.render('communityList', {data: request.session.data});
	else 
		response.redirect("/");
})
app.get('/communityPannel', function(request, response) {
	if(request.session.isLogin)
		response.render('communityPannel', {data: request.session.data});
	else 
		response.redirect("/");
})
app.get("/community/addCommunity", function(request, response) {
	if(request.session.isLogin)
		response.render('addCommunity', {data: request.session.data});
	else 
		response.redirect("/");
})
app.get("/tag", function (request, response) {
	if(request.session.isLogin)
		response.render('tag', {data: request.session.data});
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
				response.send("1");
			});
		}
	});
})
app.get("/tag/tagslist", function(request, response) {
	if(request.session.isLogin) {
		tagObject.find({}).exec(function(error, data) {
			response.render('tagslist', {tagdata: data, data: request.session.data});
		});
	} 
	else 
		response.redirect("/");
})
app.get("/changePassword", function (request, response) {
	if(request.session.isLogin)
		response.render('changePassword', {data: request.session.data});
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
	if(request.session.isLogin) {
		console.log(request.url)
		response.render("editProfile", {data: request.session.data});
	}
	else 
		response.redirect("/")
})
app.post("/editProfile", function (request, response) {
	if(request.session.isLogin) {
		if(request.session.data[0].imgpath == 'avtar.png') {
			response.send("img not uploaded");
		} else {
				request.body.imgpath = request.session.data[0].imgpath;
				userDetails.findOneAndUpdate({_id: request.session.data[0]._id},  {
					name: request.body.name,
					dob : request.body.dob,
					gender: request.body.gender,
					phoneno: request.body.phoneno,
					city: request.body.city,
					email :request.body.email,
					imgpath: request.body.imgpath,
					status: request.body.status,
			},
			{
					new: true,
					runValidators: true
			}).then(data => {
				request.session.data = [data];
				response.send(data)
			})
			} 
	} else {
		response.redirect("/");
	} 
})
app.post("/uploadImg", function(request, response) {
	console.log("image req rec");
	upload(request, response, (error) => {
		console.log(request.file);
		if(error) {
			console.log("error page ");
			response.render('editProfile', {msg: error});
		} else if(request.file == undefined) {
			console.log("file undefined")
			response.render('editProfile',  {msg: "No file selected"});
		} else {
			console.log("new page rendered");
			console.log(request.session.data)
			response.render("editProfile", {data: request.session.data});
		}
	});
});
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
app.post("/getUserData", function (req, res) {
	var flag;
	if(req.body.role === 'All' && req.body.status === 'All') {
      userDetails.countDocuments(function(e,count){
      var start = parseInt(req.body.start);
      var len = parseInt(req.body.length);
      userDetails.find({
      }).skip(start).limit(len).then(data=> {
      	if(req.body.search.value) {
					data = data.filter((value) => {
						flag = value.email.includes(req.body.search.value) || value.phoneno.includes(req.body.search.value)
						 || value.city.includes(req.body.search.value) || value.status.includes(req.body.search.value) 
						 || value.role.includes(req.body.search.value);
						return flag;
					})
				}
      res.send({"recordsTotal": count, "recordsFiltered" : count, data})
     }).catch(err => {
      	res.send(err)
     	})
   });
}

else if(req.body.role === 'All' && req.body.status !== 'All')
{
  console.log(req.body);
  var length;
      userDetails.countDocuments(function(e,count){
      var start=parseInt(req.body.start);
      var len=parseInt(req.body.length);

      userDetails.find({status: req.body.status}).then(data => length = data.length);

      userDetails.find({ status: req.body.status }).skip(start).limit(len)
	    .then(data=> {
      if (req.body.search.value){
				data = data.filter((value) => {
					flag = value.email.includes(req.body.search.value) || value.phoneno.includes(req.body.search.value)
						 || value.city.includes(req.body.search.value) || value.status.includes(req.body.search.value) 
						 || value.role.includes(req.body.search.value);
						return flag;
					});
			}
      res.send({"recordsTotal": count, "recordsFiltered" : length, data})
     	}).catch(err => {
      	res.send(err)
     })
   });  
}

else if(req.body.role !== 'All' && req.body.status === 'All')
{
	console.log(req.body);
	var length;
	userDetails.countDocuments(function(e,count){
		var start=parseInt(req.body.start);
		var len=parseInt(req.body.length);

		userDetails.find({role: req.body.role}).then(data => length = data.length);
	  userDetails.find({ role: req.body.role }).skip(start).limit(len).then(data=> {
      if (req.body.search.value) {
				data = data.filter((value) => {
					flag = value.email.includes(req.body.search.value) || value.phoneno.includes(req.body.search.value)
						 || value.city.includes(req.body.search.value) || value.status.includes(req.body.search.value) 
						 || value.role.includes(req.body.search.value);
						return flag;
				})
			}
      res.send({"recordsTotal": count, "recordsFiltered" : length, data})
     }).catch(err => {
      	res.send(err)
     })
   }); 
}
	else {
		var length;
		userDetails.countDocuments(function(e,count){
			var start=parseInt(req.body.start);
			var len=parseInt(req.body.length);
			userDetails.find({role: req.body.role, status: req.body.status}).then(data => length = data.length);

      userDetails.find({role: req.body.role, status: req.body.status}).skip(start).limit(len).then(data=> {
			if(req.body.search.value) {
				data = data.filter((value) => {
					flag = value.email.includes(req.body.search.value) || value.phoneno.includes(req.body.search.value)
						 || value.city.includes(req.body.search.value) || value.status.includes(req.body.search.value) 
						 || value.role.includes(req.body.search.value);
						return flag;
					})
				}
			res.send({"recordsTotal": count, "recordsFiltered" : length, data})
     }).catch(err => {
      	res.send(err)
     })
   }); 
	}
})
app.get('/404', function(request, response) {
	if(request.session.isLogin) {
		request.session.isLogin = 0;
		response.sendFile(path.join(__dirname,'public','404.html'))
	} else {
		response.redirect('/');
	}
})
app.listen(8000);


console.log("Running on port 8000");