var row = require("../views/user.dust");
var users = $("#users");
var stubRow = users.find("tr:last-child");
var parser = new DOMParser();

stubRow.on("click", function(e) {
	row(function(err, out) {
		var table = document.createElement("table");
		table.innerHTML = out;
		users.insertBefore(stubRow);
	});
});
