var dbData;
var menu = document.getElementById("menu");
var sideBtns = menu.getElementsByClassName("menu-item")
var sideBtn = document.getElementById("sideBtn");
var span = menu.getElementsByTagName("span");
var logout = document.getElementById("logout");
var modal = document.getElementById("switch");
var modalWrapper = document.getElementById("switch-wrapper");
var yesBtn = document.getElementById("yes");
var noBtn = document.getElementById("no");
var yesSwitchBtn = document.getElementById("yesSwitch");
var noSwitchBtn = document.getElementById("noSwitch");
var navImg = document.getElementById("nav-avtar");
sideBtn.addEventListener("click", function () {
	if(menu.style.width == '300px') {
		menu.style.width = '50px';
		for(var i = 0;i<span.length;i++) {
			span[i].style.display = 'none';
		}
	} else {
		menu.style.width = '300px';
		setTimeout(function () {
			for(var i = 0;i<span.length;i++) {
				span[i].style.display = 'inline';
			}
		}, 210);
	}
});

sideBtns[1].addEventListener("click", function () {
	window.location = "/home";
});
sideBtns[2].addEventListener("click", function(){
	window.location = "/userAdd";
});
sideBtns[3].addEventListener("click", function(){
	window.location = "/userList";
});

sideBtns[5].addEventListener("click", function(){
	console.log("switch userAdd");
	$.confirm({
	    title: 'Switch As User',
	    content: 'Do you really want switch state..',
	    buttons: {
	    	'YES': {
	    		btnClass: "btn btn-success",
	    		action: function () {
	    			
	    		}
	    	}, 
	    	'NO' : {
	    		btnClass: "btn btn-danger"
	    	}
	    }
	});
});
sideBtns[6].addEventListener("click", function(){
	window.location = "/tag";
});
sideBtns[7].addEventListener("click", function(){
	window.location = "/changePassword";
	// alert("chnage password")
});
navImg.addEventListener("click", function() {
	window.location = "/profile";
});
sideBtns[8].addEventListener("click", function(){
	logout.style.display = 'block';
});
noBtn.addEventListener("click", function () {
	logout.style.display = 'none';
})
noSwitchBtn.addEventListener("click", function () {
	modalWrapper.style.display = 'none';
})
yesBtn.addEventListener("click", function () {
	window.location = "/logout";
});