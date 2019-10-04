var mysql = require('mysql');
var db_config = require('../db');

module.exports = function(app, passport, fs, upload)
{
     app.get('/',function(req,res){
       var db = mysql.createConnection(db_config);
       if(typeof req.user == 'undefined'){
         console.log('Unauthorized access-main');
         res.redirect('/login');
       } else {
         var sql = 'SELECT * FROM `post` ORDER BY `idx` DESC';
          db.query(sql,  function(err,rows){
            if(err){
              console.error('mysql connection error');
              console.error(err);
              throw err;
            }
            var posts = rows;
            res.render('index',{
                title: "insta_project",
                username: req.user.user_id,
                posts: posts
            });
          });
       }
       db.end();
     });

     app.get('/logout', function(req, res){
       req.logout();
       res.redirect('/login');
     });


     app.get('/register',function(req,res){
        res.render('register',{

        });
     });

     app.post('/register_check',function(req,res){
       var db = mysql.createConnection(db_config);
       var id = req.body.id;
       var pw = req.body.pw;
       var repw = req.body.repw;
       var sql = 'SELECT count(*) AS idCount FROM `user` WHERE `user_id`= ?';
        db.query(sql, [id], function(err,rows){
          if(err){
            console.error('mysql connection error');
            console.error(err);
            throw err;
          }
          var count = rows[0].idCount;
          if(count!==0){
            db.end();
            res.send('<script type="text/javascript">alert("아이디가 존재합니다.");location.href="/register"</script>');
          } else {
            var reg_date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
            var sql_2 = 'INSERT INTO `user`(`user_id`, `user_pw`, `reg_date`) VALUES (?, ?, ?)';
            db.query(sql_2, [id, pw, reg_date], function(err){
              if(err){
                console.error('mysql connection error');
                console.error(err);
                throw err;
              }
            });
            db.end();
            res.send('<script type="text/javascript">alert("회원가입 완료!");location.href="/"</script>');
          }
       });

     });


     app.post('/upload', upload.single('userfile'), function(req, res){
      var db = mysql.createConnection(db_config);
      var username = req.user.user_id;
      var content = req.body.write_text;
      var filename = req.file.filename;
      var reg_date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
      var sql = 'INSERT INTO `post`(`user_id`, `img_src`, `content`, `reg_date`)';
          sql += ' VALUES (?,?,?,?)';
      db.query(sql, [username, filename, content, reg_date], function(err,results){
        if(err){
          console.error('mysql connection error');
          console.error(err);
          throw err;
        }
        console.log('homework input success');
      });
      db.end();
      res.redirect('/');
  } );


  app.get('/login',function(req,res){
     res.render('login',{

     });
  });


     app.get('/delete',function(req,res){
       var db = mysql.createConnection(db_config);
       var idx = req.query.idx;
       var sql = 'DELETE FROM `post` WHERE `idx` = ?';
       db.query(sql, [idx], function(err,rows){
         if(err){
           console.error('mysql connection error');
           console.error(err);
           throw err;
         }
      });
      var filename = req.query.filename;
      var path_name = './static/img/uploads/' + filename;
      fs.unlink(path_name,
      function(err){
      if(err) throw err;
        console.log('파일을 정상적으로 삭제하였습니다.');
        }
      );
        res.send('<script type="text/javascript">alert("삭제완료");location.href="/"</script>');
        db.end();
     });

     app.post('/login',
      passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/logIn_fail',
        failureFlash: false
      })
    );

    app.get('/logIn_fail', function(req, res){
       res.send('<script type="text/javascript">alert("로그인 실패");location.href="/login"</script>');
    });
};
