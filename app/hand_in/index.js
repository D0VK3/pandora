var mongoose = require("mongoose");
var gfs = require("../../models/gfs");
var Busboy = require("busboy");
var Subject = mongoose.model("Subject");
var listView = require("./list.dust");
var detailView = require("./detail.dust");
var uu = require("underscore");
var async = require("async");

module.exports.index = function(req, res) {
    Subject.findById(req.param("subject")).exec(function(err, doc) {
	if(err) {
	    res.error(err);
	} else {
	    res.dust(listView, {subject: doc});
	}
    });
};

module.exports.post = function(req, res) {
    Subject.findByIdAndUpdate(req.param("subject"), {$push: {hand_in: {name: req.body.name, files: []}}}, function(err, doc) {
	if(err) {
	    res.error(err);
	} else {
	    res.dust(listView, {subject: doc});
	}
    });
};

module.exports.upload = function(req, res) {
    var busboy = new Busboy({
	headers: req.headers,
	limits: {
	    files: 1,
	    fileSize: 1024 * 1024 * 5
	}
    });
    Subject.findById(req.param("subject"), function(err, doc) {
	if(err) {
	    res.error(err);
	} else {
	    var previousFile;
	    var handInSlot;
	    for(var i = 0; i < doc.hand_in.length; i++) {
		if(doc.hand_in[i]._id.equals(req.param("hand_in_slot"))) {
		    handInSlot = doc.hand_in[i];
		}
	    }
	    if(!handInSlot) {
		res.error("An attempt was made to upload a file to a hand in slot which is non-existant");
	    } else {
		for(i = 0; i < handInSlot.files.length; i++) {
		    if(handInSlot.files[i].user.equals(req.session.user._id)) {
			previousFile = handInSlot.files[i]._id;
		    }
		}
		var fileRefs = [];
		busboy.on("file", function(fieldname, file, filename, encoding, mime) {
		    var store = gfs.createWriteStream(filename, {
			content_type: mime
		    });
		    store.on("id", fileRefs.push);
		    file.pipe(store);
		});
		busboy.on("end", function() {
		    if(previousFile) {
			handInSlot.files.pull(previousFile);
		    }
		    handInSlot.files.push({user: req.session.user._id, file: fileRefs[0]});
		    doc.save(function(err, doc) {
			if(err) {
			    res.error(err);
			} else {
			    res.end();
			}
		    });
		});
		req.pipe(busboy);
	    }
	}
    });
};

module.exports.get = function(req, res) {
    Subject.findById(req.param("subject")).select({hand_in: { $elemMatch: {_id: req.param("hand_in_slot")}}}).populate("hand_in.files.user").exec(function(err, docs) {
	res.dust(detailView, {subject: docs, hand_in_slot: docs.hand_in[0]});
    });
};

module.exports.download = function(req, res) {
    var store = gfs.createReadStream(req.param("file"));
    store.on("filename", res.attachment);
    store.pipe(res);
};

module.exports.del = function(req, res) {
    Subject.findById(req.param("subject")).exec(function(err, doc) {
	if(err) {
	    return res.error(err);
	}
	var hand_in_slot = uu.findWhere(doc.hand_in, {id: req.param("hand_in_slot")});
	if(!hand_in_slot) {
	    return res.error("Hand in slot doesn't exist");
	}
	async.each(uu.pluck(hand_in_slot.files, "file"), gfs.unlink, function(err) {
	    if(err) {
		return res.error(err);
	    }
	    doc.hand_in.pull(hand_in_slot);
	    doc.save(function(err) {
		if(err) {
		    res.error(err);
		} else {
		    res.dust(listView, {subject:doc});
		}
	    });
	});
    });
};
