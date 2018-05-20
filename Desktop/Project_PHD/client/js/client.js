var socket = io.connect('http://127.0.0.1:8080/');

var form = document.getElementById("form");
var username = document.getElementById("user");
var password = document.getElementById("pass");
var avatar = document.getElementById("avatar");
var wrapper = document.getElementById("wrapper");

var submit = document.getElementById("submit");

submit.onclick = function() {
	var user = username.value;
	var pass = password.value;
	var u = CryptoJS.AES.encrypt(user,"pass");
	var p = CryptoJS.AES.encrypt(pass,"pass");
	socket.emit("login",[u.toString(),p.toString()]);
}


socket.on("lsuccess",function() {
	return window.location.href = "records.html";
});