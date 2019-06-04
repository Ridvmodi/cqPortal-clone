var userName = document.getElementById("userName");
var passWord = document.getElementById("pass");
var btn = document.getElementById("submit");
var loginGithub = document.getElementById("loginGithub");
btn.addEventListener("click", function () {
	if(userName.value == "" || passWord.value == "") {
		alert("All Fields are required");
	} else {
		var request = new XMLHttpRequest();
		var data = new Object();
		data.userName = userName.value;
		data.passWord = passWord.value;
		request.open('POST', '/login');
		request.setRequestHeader("Content-Type", "application/json");
		request.send(JSON.stringify(data));
		request.onload = function () {
			var returnedData = JSON.parse(request.responseText);
			if(returnedData.length == 0) {
				alert("Not a Registered user")
			} else if (returnedData[0].status == 'Pending'){
				window.location = '/editProfile';
			} else {
				if(returnedData[0].flag == "0")
					window.location = '/404'
				else if(returnedData[0].role == 'community builder') 
					window.location ="/communityPannel"
				else
					window.location = '/home';
			}
		}
	}
})
loginGithub.addEventListener("click", function () {
	console.log("Hello there")
		window.location = "/auth/github";
})