var dbData, flag = 1;
var str = "Switch As User";
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
		$("#table").animate({left: '50px'}, 480);
	} else {
		menu.style.width = '300px';
		setTimeout(function () {
			for(var i = 0;i<span.length;i++) {
				span[i].style.display = 'inline';
			}
		}, 210);
		$("#table").animate({left: '300px'}, 300);
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
	    title: str,
	    content: 'Do you really want switch state..',
	    buttons: {
	    	'YES': {
	    		btnClass: "btn btn-success",
	    		action: function () {
					if(flag) {
						sideBtns[2].style.display = "none";
						sideBtns[3].style.display = "none";
						sideBtns[6].style.display = "none";
						flag = 0;
						str = "Switch As Admin"
						window.location = '/communityPannel'
					} else {
						sideBtns[2].style.display = "block";
						sideBtns[3].style.display = "block";
						sideBtns[6].style.display = "block";
						flag = 1;
						str = 'Switch As User'
					}
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