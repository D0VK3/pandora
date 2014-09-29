var util = require("util");
var achilles = require("achilles");
var Post = require("./Post");
var Quiz = require("./Quiz");
var Content = require("./Content");
var VocabQuiz = require("./VocabQuiz");

function Page(title) {
	achilles.Model.call(this);
	this.define("title", String);
	this.define("content", Content);

	this.title = title;
}

util.inherits(Page, achilles.Model);

function Link(title, url) {
	achilles.Model.call(this);
	this.define("title", String);
	this.define("url", String);

	this.title = title;
	this.url = url;
}

util.inherits(Link, achilles.Model);

function Course(title) {
	achilles.Model.call(this);

	this.define("name", String); // E.g. "10a/Fr1"
	this.define("icon", String); // E.g. "French"
	this.define("posts", [Post]); // I.e. Blog
	this.define("quizzes", [Quiz]);
	this.define("vocabQuizzes", [VocabQuiz]);
	this.define("links", [Link]);
	this.define("pages", [Page]);

	this.title = title;
}

util.inherits(Course, achilles.Model);

module.exports = Course;
