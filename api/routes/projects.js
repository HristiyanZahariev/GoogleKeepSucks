var models  = require('./../models');
var express = require('express');
var router  = express.Router();
var project = require('../models/project');
var Note = require('../models/note');
var User = require('../models/user')
var auth = require('./../config/auth')();


router.post('/create', auth.authenticate(), function(req, res) {  
  	project.create({
    name: req.body.name,
    color: req.body.color,
    description: req.body.description,
    type: req.body.type
 	}).then(function(project) {
  		project.getUsers().then(function(users) {
  			User.findById(req.user.id).then(function(user) {
  				users.push(user)
  				project.setUsers(users);
  			});
  			res.redirect("/projects/" + project.id)
  		});
  	});
});


router.post('/:project_id/addNote', auth.authenticate(), function(req, res) {
  project.findById(
    req.params.project_id, 
    {include: [{model: Note, as: "notes"}]})
  .then(function(project){
    project.getNotes();
    var note = Note.create({
      title: req.body.title,
      createdAt: req.body.createdAt,
      reminder: req.body.reminder,
      content: req.body.content,
      contentType: req.body.contentType,
      projectId: req.body.projectId
    }).then(function() {
      res.redirect('/projects/' + req.params.project_id);
    });
    // res.send(project);
  });
});

router.post('/:project_id/addUser/:user_id',auth.authenticate(), function(req, res) {
  project.findById(
    req.params.project_id,
    {include: [{model: User, as: "users"}, {model: Note, as: "notes"}]})
  .then(function(project){
    project.getUsers().then(function(users){
    
      User.findById(req.params.user_id).then(function(user){
        users.push(user);
        project.setUsers(users);
      });

    });

    res.reminder('projects/' + req.params.project_id);
  });
});

router.get('/:project_id', function(req, res){
  project.findById(
    req.params.project_id, 
    {include: [{model: Note, as: "notes"},{model: User, as: "users"}]})
  .then(function(project){
    res.send(project);
  });
});

module.exports = router;