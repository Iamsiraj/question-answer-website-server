var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var q = require('q');
mongoose.connect('mongodb://localhost/knowledgeboothDB');
var db = mongoose.connection;
var app = express();
db.on('error', function (err) {
    console.log('connection error', err);
});
db.once('open', function () {
    console.log('connected.');
});

var Schema = mongoose.Schema;
var userSchema = new Schema ({
   name: { type: String,  required: true},
    email: { type: String,  required: true,   unique: true },

    password: { type: String,  required: true},
    dob: Date,
    rating : Number,
    education : String,
    img: String,
    likes:Number,
    date: Date,
    about: String
});
var queSchema = new Schema ({
    title: String,
    tags: Array,
    explanation: String,
    userId: String,
    comments: Array,
    likes: Number,
    category: String,
    numOfComments: Number,
    views:Number,
    date: Date
});

var commentSchemea = new Schema({
   text: String,
    userId:String,
    queId:String,
    likes:Number,
    date: Date
});


var User = mongoose.model('User',userSchema);
var Que = mongoose.model('Que',queSchema);
var Comment= mongoose.model('Comment',commentSchemea);


var server = app.listen('8000',function(){
    console.log('Your server is ready');
});




app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(function(req, res, next) {
    // do logging
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type','x-requested-with','origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT');
   // console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});

app.post('/register',function(request,response){
    var name = request.body.name;
    var email = request.body.email;
    var password  =request.body.password;
   var userInfo = new User({
       name:name, email:email , password:password , likes:0 , date:Date()
   });


    userInfo.save(function(err,data){
        if (err){
            response.send({msg:err});
        }else{
            response.send({msg:'Signup Successfull'});
        }
       // console.log(data);


    });
});

app.post('/editProfile',function(request,response){

  var userId= request.body.userId;
    var oldPassword = request.body.oldPassword;
    var newPassword = request.body.newPassword;
    var education = request.body.education;
    var dob = request.body.dob;
    var about = request.body.about;
    var name = request.body.name;
    var email = request.body.email;

User.update({_id:userId, password:oldPassword},{
    name:name,
    email: email,

    password:newPassword,
    dob:dob,

    education :education,


    about:about

},function(err,data){

});


});

app.get('/getUsers',function(request,response){
   User.find({},function(err,data){
     //  console.log(err);
      // console.log(data);
       response.send({msg:data});
   });

});

app.get('/test',function(request,response){
    response.send({userName:users});
});



app.post('/addComment',function(request,response){
    var text=request.body.text;
    var queId= request.body.queId;
    var userId = request.body.userId;
    //console.log(request.body);

    var commentInfo = new Comment({
        text:text, userId:userId , queId:queId , likes:0, date:Date()
    });
    commentInfo.save(function(err,data){
      //  console.log(err);
        //console.log(data);
        response.send({msg:err});

    });

});

app.post('/login',function(request,response){

    console.log(request.body);
    var uname= request.body.email;
    var pass = request.body.password;
    User.findOne({email:uname,password:pass},function(err,data){
        if (err==null){
            //console.log(data);
            response.send({
                user: data,
                message: "You are successfully logged in",
                status: 200
            })
        }
    });
    //for(var i=0; i<users.length;i++){
    //    if(uname==users[i].email ){
    //        if(pass==users[i].password){
    //            response.send({
    //                user:users[i],
    //                message: "You are successfully logged in",
    //                status: 200
    //            });
    //        }else{
    //            console.log("server incore");
    //            response.send({
    //
    //                message: "Incorrect",
    //                status: 201
    //            });
    //        }
    //    }
    //}


});

app.post('/postQues',function(request,response){
    var title;
    var tags;
    var explain;
    title=request.body.title;
    tags=request.body.tag;
    explain=request.body.explanation;
    var userId= request.body.userId;
    var queInfo = new Que({
        title:title, tags:tags , explanation:explain ,userId :userId , likes:0,numOfComments:0 ,views:0, date:Date()
    });
    queInfo.save(function(err,data){
       // console.log(err);
       // console.log(data);
        response.send({msg:'kk'});

    });
    //quesId++;

//questions.push({title:title,tags:tags,explanation:explain,id:quesId,userId:userId});

});

app.get('/questions', function (request,response) {
   // console.log(questions);
    Que.find({},function(err,data){


        response.send({quesData:data});
    });
 //   response.send({quesData:questions});

});

app.get('/topUsers', function (request,response) {
    // console.log(questions);
    User.find({likes:{$gt:2}},function(err,data){


        response.send({userData:data});
    });
    //   response.send({quesData:questions});

});
app.get('/search/:userSearch', function (request,response) {
    // console.log(questions);
    var userSearch= request.params.userSearch;
    console.log(userSearch);
  //  db.users.find()
    Que.find({'title': {'$regex': '.*'+userSearch+'.*'}},function(err,data){
      //  console.log(data);
        response.send({quesData:data});
    });

    //   response.send({quesData:questions});

});

app.get('/individualQues/:quesId',function(request,response){
    var qId= request.params.quesId;

  //  console.log(request.params.quesId + "qId");
    Que.findOne({_id:qId},function(err,data){
        data.views++;
        data.save();
        response.send({quesData:data});
    });
  //  response.send({quesData:questions[request.params.quesId]});
});

app.get('/getAuthor/:u',function(request,response){
    var u= request.params.u;
   // console.log(u);

    //  console.log(request.params.quesId + "qId");
    User.findOne({_id:u},function(err,data){

        response.send({userData:data});
    });
    //  response.send({quesData:questions[request.params.quesId]});
});

app.get('/getUserName/:u',function(request,response){
    var u= request.params.u;
    console.log(u);

    //  console.log(request.params.quesId + "qId");
    User.findOne({_id:u},function(err,data){

        response.send({userData:data});
    });
    //  response.send({quesData:questions[request.params.quesId]});
});



app.get('/getComments/:queId',function(request,response){
    var qId= request.params.queId;
    var commentsTemp;
    getComments(qId)
        .then(function(comments){
            var tempUser= [];
            commentsTemp = comments;
            for(var v=0 ; v<comments.length ; v++){
              tempUser.push(comments[v].userId);
            }

            uniqueUser(tempUser)
                .then(function(userList){

                    getUserData(userList)

                        .then(function(users){
                            response.send({commentData:commentsTemp, userName:users});



                        });

                });
        })
});

var getUserData = function(uId){

   // console.log(uId)
    return q.all(uId.map(function (uIdsingle) {
        return getUserInfo(uIdsingle);
}));

}

var getUserInfo = function (uId){
    var deferred = q.defer();
    User.findOne({_id:uId},function(err,data){
        deferred.resolve(data);

    });
    return deferred.promise;

}

var getComments = function(qId){
    var defered = q.defer();
    Comment.find({queId:qId},function(err,data){
        defered.resolve(data);
        // console.log(data);

       // commentD.push(data);
    });
    return defered.promise;
};

var uniqueUser = function(comments) {
    var deferred = q.defer();
    var newArr = [],
        origLen = comments.length,
        found, x, y;

    for (x = 0; x < origLen; x++) {
        found = undefined;
        for (y = 0; y < newArr.length; y++) {
            if (comments[x] === newArr[y]) {
                found = true;
                break;
            }
        }
        if (!found) {
            newArr.push(comments[x]);
        }
    }
     deferred.resolve(newArr);
    return deferred.promise;

}

var getBoth = function (comments,users){
    var deferred = q.defer();
    var co=comments;
    for (var c= 0 ;c <co.length ;c++){
        for (var j= 0 ; j< users.length ; j++){
            if (co[c].userId == users[j]._id ){
                co[c].userName = users[j].name;
                console.log(co[c].userName);
            }

        }
    }
    deferred.resolve(co);
    return deferred.promise;
}



app.post('/qLike/:qId',function(request,response){
    var qId = request.params.qId;

    Que.findOne({_id:qId},function(err,data){
       data.likes++;
        data.save();

    });
});
app.post('/qCommentNum/:qId',function(request,response){
    var qId = request.params.qId;

    Que.findOne({_id:qId},function(err,data){
        data.numOfComments++;
        data.save();

    });
});

app.get('/uprofile/:uid',function(request,response){
    var uid = request.params.uid;
    console.log(uid);
    User.findOne({_id:uid},function(err,data){
        response.send({userData:data});

    });
});

app.post('/qViews/:qId',function(request,response){
    var qId = request.params.qId;

    Que.findOne({_id:qId},function(err,data){
        data.views++;
        data.save();

    });
});

app.post('/cLike/:cId',function(request,response){
    var cId = request.params.cId;

    Comment.findOne({_id:cId},function(err,data){
        data.likes++;
        data.save();
       User.findOne({_id:data.userId},function(err,data){
            data.likes++;
           data.save();
           console.log(data.likes);
        });
    });
});

app.get('/userQues/:userId',function(request,response){
   // console.log("saffs");
   // console.log(request.params.userId);
    var uId=request.params.userId;
    //
    //var userQues=[];
    //for (var i=0; i < questions.length ; i++){
    //    if (uId=questions[i].userId){
    //        userQues.push(questions[i]);
    //    }
    //}
    Que.find({userId: uId},function(err,data){
        if (err==null){
            response.send({quesData:data});
        }
    });

});
// /myquestions/:id
// /questions/0
// /questions/1
//.params