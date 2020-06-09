module.exports = function(){
    var express = require('express');
    var router = express.Router();

    function getComments( res, mysql, context, complete){
//        console.log("You asked me for some COMMENTS?")
        var query = "SELECT * FROM Comment_of F INNER JOIN Comments C on F.comment_id = C.comment_id WHERE F.battle = (SELECT battle_id FROM Battle ORDER BY battle_id DESC LIMIT 1)";
          mysql.pool.query(query, function(error, results, fields){
          if(error){
            res.write(JSON.stringify(error))
            res.end();
          }
          context.comment = results;
          //console.log(context)
          complete();
      });
    }

    function getCrit(res,mysql,context, complete){
      var query = "SELECT B.battle_id, B.Quantity_one, B.Quantity_two, B.Size_one, B.Size_two, B.votes_one, B.votes_two, (SELECT species FROM Critter C WHERE  C.critter_id = T.critter_one) AS Name1, (SELECT species FROM Critter C WHERE  C.critter_id = T.critter_two) AS Name2 FROM Takes_part_in T, Battle B WHERE T.battle = (SELECT D.battle_id FROM Battle D ORDER BY D.battle_id DESC LIMIT 1) ORDER BY B.battle_id DESC LIMIT 1"
      mysql.pool.query(query, function(error, results, fields){
      if(error){
        res.write(JSON.stringify(error))
        res.end();
      }
      context.critter = results;
      //console.log(context)
      complete();
      });
    }

    function getImage(res,mysql,context,complete){
      var query = "SELECT (SELECT image_location FROM Avatar WHERE av_id = (SELECT av_id FROM Critter_has_a H WHERE T.critter_one = H.critter)) AS img1, (SELECT image_location FROM Avatar WHERE av_id = (SELECT av_id FROM Critter_has_a H WHERE  T.critter_two = H.critter)) AS img2 FROM Takes_part_in T, Battle B WHERE T.battle = (SELECT D.battle_id FROM Battle D ORDER BY D.battle_id DESC LIMIT 1) ORDER BY B.battle_id DESC LIMIT 1"
      mysql.pool.query(query, function(error, results, fields){
      if(error){
        res.write(JSON.stringify(error))
        res.end();
      }
      context.link = results;
    //  console.log(context)
      complete();
      });
    }

    function getCritter(res, mysql, context, id, complete){
      //var query = "SELECT B.battle_id, B.Quantity_one, B.Quantity_two, B.Size_one, B.Size_two, B.votes_one, B.votes_two, (SELECT species FROM Critter C WHERE  C.critter_id = T.critter_one) AS Name1, (SELECT species FROM Critter C WHERE  C.critter_id = T.critter_two) AS Name2 FROM Takes_part_in T, Battle B WHERE T.battle = (SELECT D.battle_id FROM Battle D ORDER BY D.battle_id DESC LIMIT 1) ORDER BY B.battle_id DESC LIMIT 1"
      var sql = "SELECT B.battle_id, B.Quantity_one, B.Quantity_two, B.Size_one, B.Size_two, B.votes_one, B.votes_two, (SELECT species FROM Critter C WHERE  C.critter_id = T.critter_one) AS Name1, (SELECT species FROM Critter C WHERE  C.critter_id = T.critter_two) AS Name2 FROM Takes_part_in T INNER JOIN Battle B ON T.battle = B.battle_id WHERE T.battle = ?"
      var inserts = [id];
      mysql.pool.query(sql, inserts, function(error, results, fields){
      if(error){
        res.write(JSON.stringify(error))
        res.end();
      }
      context.critter = results;
    //  console.log(results)
      complete();
      });
    }

    function getCom(res, mysql, context, id, complete){
      var query = "SELECT * FROM Comment_of F INNER JOIN Comments C on F.comment_id = C.comment_id WHERE F.battle = ?";
      var inserts = [id];
        mysql.pool.query(query, inserts, function(error, results, fields){
        if(error){
          res.write(JSON.stringify(error))
          res.end();
        }
        context.comment = results;
        //console.log(results)
        complete();
      });

    }

    function getImg(res, mysql, context, id, complete){
      //var query = "SELECT (SELECT image_location FROM Avatar WHERE av_id = (SELECT av_id FROM Critter_has_a H WHERE T.critter_one = H.critter)) AS img1, (SELECT image_location FROM Avatar WHERE av_id = (SELECT av_id FROM Critter_has_a H WHERE  T.critter_two = H.critter)) AS img2 FROM Takes_part_in T, Battle B WHERE T.battle = (SELECT D.battle_id FROM Battle D ORDER BY D.battle_id DESC LIMIT 1) ORDER BY B.battle_id DESC LIMIT 1"
      var query = "SELECT (SELECT image_location FROM Avatar WHERE av_id = (SELECT av_id FROM Critter_has_a H WHERE T.critter_one = H.critter)) AS img1, (SELECT image_location FROM Avatar WHERE av_id = (SELECT av_id FROM Critter_has_a H WHERE  T.critter_two = H.critter)) AS img2 FROM Takes_part_in T, Battle B WHERE T.battle = ? ORDER BY B.battle_id DESC LIMIT 1"
      var inserts = [id];
      mysql.pool.query(query, inserts, function(error, results, fields){
      if(error){
        res.write(JSON.stringify(error))
        res.end();
      }
      context.link = results;
    //  console.log(results)
      complete();
      });
    }

    router.get('/:id', function(req,res){
      callbackCount= 0;
      var context = {};
      var mysql = req.app.get('mysql');
      getCritter(res, mysql, context, req.params.id, complete);
      getCom(res, mysql, context, req.params.id, complete);
      getImg(res, mysql, context, req.params.id, complete);
      function complete(){
        callbackCount++;
        if (callbackCount == 3){
          res.render('battle_display', context);
        }
      }
    });

    router.delete('/:comment_id', function (req, res) {
      var mysql = req.app.get('mysql');
      var sql = "DELETE FROM Comments WHERE comment_id = ?";
      var inserts = [req.params.comment_id];
      sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
        if (error) {
          res.write(JSON.stringify(error));
          res.status(400);
          res.end();

        } else {
          res.status(202).end();
          console.log("success");
        }
      })
    });



    router.get('/', function (req, res) {
      callbackCount = 0;
      var context = {};
      var mysql = req.app.get('mysql');
      context.jsscripts = ["deletecomment.js"];
      getComments(res, mysql, context, complete);
      getCrit(res, mysql, context, complete);
      getImage(res, mysql, context, complete);
      function complete() {
        callbackCount++;
        if (callbackCount == 3) {
          res.render('battle_display', context);
        }
      }
    });

     //The deleteComment.js ajax call works properly
    //It is getting the correct comment_id passed into it, it console logs the comment_id that's meant to be deleted
    //but this does not delete from the database yet for some reason

    router.delete('/:comment_id', function (req, res) {
      var mysql = req.app.get('mysql');
      var sql = "DELETE FROM Comments WHERE comment_id = ?";
      var inserts = [req.params.comment_id];
      console.log("deleting comment : ", inserts);
      sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
        if (error) {
          res.write(JSON.stringify(error));
          res.status(400);
          res.end();

        } else {
          res.status(202).end();
          console.log("success");
        }
      })
    });

    router.post('/', function (req, res) {
      var mysql = req.app.get('mysql');
      console.log(req.body.comment_text);
      var sql = "INSERT INTO Comments (comment_id, comment_text, likes, dislikes) VALUES (?, ?, 0, 0)";
      var inserts = [req.body.comment_id, req.body.comment_text, 0, 0];
      sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
        if (error) {
          res.write(JSON.stringify(error));
          console.log("error");
          res.end();
          console.log("error");
        } else {
          res.redirect('/battle/display/');
        }
      })
    });

    router.post('/vote',function(req,res){
      //var creds = [req.body.UID];
      //console.log(creds)
      //console.log([req.body.vouch])
      //console.log([req.body.BID])
      callbackCount = 0;
      var context = {};
      var mysql = req.app.get('mysql');

      if (req.body.UID == '' || req.body.UID == -1){
        req.flash('error', 'Please login first to vote');
        getCritter(res, mysql, context, req.body.BID, complete);
        getCom(res, mysql, context, req.body.BID, complete);
        getImg(res, mysql, context, req.body.BID, complete);
        function complete(){
          callbackCount++;
          if (callbackCount == 3){
            res.render('battle_display', context);
          }
        }
      }
      else {
        var query = "SELECT usr FROM Votes_for WHERE usr = ? AND battle = ?"
        var inserts = [req.body.UID, req.body.BID];
        mysql.pool.query(query, inserts, function(error, results, fields){
          if(error){
            res.write(JSON.stringify(error))
            res.end();
          }
          if (results.length > 0){
            req.flash('error', 'You already voted for this battle');
            getCritter(res, mysql, context, req.body.BID, complete);
            getCom(res, mysql, context, req.body.BID, complete);
            getImg(res, mysql, context, req.body.BID, complete);
            function complete(){
              callbackCount++;
              if (callbackCount == 3){
                res.render('battle_display', context);
              }
            }
          }
          else{
            var query = "INSERT INTO Votes_for (liked, battle, usr) VALUES (?,?,?)";
            var inserts = [req.body.vouch, req.body.BID, req.body.UID];
            mysql.pool.query(query, inserts, function(error, results, fields){
              if(error){
                res.write(JSON.stringify(error))
                res.end();
              }
            });
            res.redirect('/battle/display/' + req.body.BID);
          }
        });
      }
    });

    return router;
}();
