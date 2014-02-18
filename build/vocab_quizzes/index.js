var mongoose = require("mongoose");
var Subject = mongoose.model("Subject");
var vocabQuizList = require("../quizzes/index.dust");
var vocabQuizPage = require("./quiz.dust");
var uu = require("underscore");

var index = function(req, res) {
    Subject.findById(req.param("subject")).populate("teacher").exec(function(err, doc) {
	if(err) {
	    res.error(err);
	} else {
	    res.dust(vocabQuizList, {subject: doc, quizzes: doc.vocab_quizzes, title: "Vocabulary Quizzes", route: "vocab_quizzes"});
	}
    });
};

var get = function(req, res) {
    Subject.findById(req.param("subject")).select({name: true, subject_name: true, teacher: true, vocab_quizzes: {$elemMatch: {_id: req.param("quiz")}}}).populate("teacher").exec(function(err, doc) {
	if(err) {
	    res.error(err);
	} else {
	    res.dust(vocabQuizPage, {subject: doc, quiz: doc.vocab_quizzes});
	}
    });
};

exports.index = index;
exports.get = get;