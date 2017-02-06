// 카카오톡 기록 사이트
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var app = express();
var bible = require("./models/bible");
var Kakaouser = require("./models/Kakaouser");
var Kakaomsg = require("./models/Kakaomsg");
var name_flag_array = new Array("");
var name_array = new Array("");
var kakaousers = '';



//DB Setting : 환경 변수를 사용하여 MONGO_DB에 접속합니다.
mongoose.connect(process.env.MONGO_DB);
//mongoose의 DB Object를 가져와 db 변수에 넣습니다.
var db = mongoose.connection;
//DB가 성공적으로 연결 된 경우
db.once("open", function() {
    console.log("** MONGO_DB CONNECTED **");
});

//DB 연결 중 에러가 있는 경우
db.on('error', function(err) {
    console.log("** DB CONNECTION ERR : **", err);
});

//PORT 지정하는 부분
app.set('port', (process.env.PORT || 5000));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/"));
// bodyParser로 stream의 form data중  json data를 req.body에 옮겨 담습니다
app.use(bodyParser.json());
// bodyParser로 stream의 form data중  urlencoded data를 분석해서 req.body에 옮겨 담습니다
app.use(bodyParser.urlencoded({
    extended: true
}));
//method의 query로 들어오는 값으로 HTTP method를 바꿉니다.
//예를들어 http://example.com/category/id?_method=delete를 받으면 _method의 값인 delete을 읽어 해당 request의 HTTP method를 delete으로 바꿉니다.
app.use(methodOverride("_method"));

//사이트 root로 이동하는 경우 /kakaomsgs로 redirect 해준다.
app.get("/", function(req, res) {
    res.redirect("/kakaomsgs");
});
//root/kakaomsgs로 이동하는 경우. 내가 입력한 모든 Data를 찾아서 보여줍니다. kakaomsgs/index로 redirect 합니다.
app.get("/kakaomsgs", function(req, res) {
    Kakaomsg.find({}, function(err, kakaomsgs) {
        if (err) return res.json(err);
        res.render("kakaomsgs/index", {
            kakaomsgs: kakaomsgs
        });
    });
});
// kakaomsgs/new"에 get 요청이 오는 경우 : 새로운 주소록을 만드는 form이 있는 views/kakaomsgs/new.ejs를 render합니다.
app.get("/kakaomsgs/new", function(req, res) {
    res.render("kakaomsgs/new");
});
// views/kakaomsgs/new.ejs 에서 post로 접근 create는 post로만 가능하다. submit 버튼 누르면 날아옴
app.post("/kakaomsgs", function(req, res) {
    Kakaomsg.create(req.body, function(err, kakaomsg) {
        if (err) return res.json(err);
        res.redirect("/kakaomsgs");
    });
});

//req.params.id는 MONGO_DB에서 사용하는 ROWID 같은 개념이다.
// views/kakaomsgs/index.ejs 에서 herf로 접근 이름을 클릭하면 MONGO_DB _id를 return으로 날려준다.
app.get("/kakaomsgs/:id", function(req, res) {
    Kakaomsg.findOne({
        _id: req.params.id
    }, function(err, kakaomsg) {
        if (err) return res.json(err);
        res.render("kakaomsgs/show", {
            kakaomsg: kakaomsg
        });
        console.log('id' + req.params.id);
    });
});

// views/kakaomsgs/show.ejs  에서 herf로 접근. 한 개의 Data만 표출 되므로 따로 선택은 필요 없음
app.get("/kakaomsgs/:id/edit", function(req, res) {
    Kakaomsg.findOne({
        _id: req.params.id
    }, function(err, kakaomsg) {
        if (err) return res.json(err);
        res.render("kakaomsgs/edit", {
            kakaomsg: kakaomsg
        });
    });
});

// views/kakaomsgs/edit.ejs 에서
app.put("/kakaomsgs/:id", function(req, res) {
    Kakaomsg.findOneAndUpdate({
        _id: req.params.id
    }, req.body, function(err, kakaomsg) {
        if (err) return res.json(err);
        res.redirect("/kakaomsgs/" + req.params.id);
    });
});
// kakaomsgs - destroy // 7
app.delete("/kakaomsgs/:id", function(req, res) {
    Kakaomsg.remove({
        _id: req.params.id
    }, function(err, kakaomsg) {
        if (err) return res.json(err);
        res.redirect("/kakaomsgs");
    });
});
//KAKAO TALK
app.get('/keyboard', function(req, res) {
    res.send({
        "type": "buttons",
        "buttons": ["시작"]
    });
});

app.post('/message', function(req, res) {

console.log('1');
    if (req.body.content === '시작'){
      Kakaouser.create({
          user_key: req.body.user_key,
          name_flag: '1',
          password_flag: '0',
          email_flag: '0',
          name: ''
      },{
          new: true
      }, function(err, users) {
console.log('2');
      res.send({
        "message": {
          "text": "샬롬. 자동응답 QT 프로그램에 오신 것을 환영합니다. \n본 프로그램은 2017년 2월 3일 최초 개발 되었으며 다양한 방법으로 서비스가 발전되어 나갈 예정입니다.\n오늘은 시간이 없어, 차주 월요일부터 본격적으로 개발해 나갈 생각이니 기다려주세요."
        },
        "keyboard": {
          "type": "buttons",
          "buttons": ["닉네임설정","처음으로","▶▶옆으로이동","신약QT(랜덤)","구약QT(랜덤)","개발자소개"]
        }
      });
      });
    }
    else if(req.body.content === '▶▶옆으로이동'){
      res.send({
        "message": {
          "text": "옆으로 이동은 누르는 버튼이 아니라 옆으로 넘겨보라는 뜻이예요.",
        },
        "keyboard": {
          "type": "buttons",
          "buttons": ["닉네임설정","처음으로","▶▶옆으로이동","신약QT(랜덤)","구약QT(랜덤)","개발자소개"]
        }
      });
    }
    else if(req.body.content === '처음으로'){
console.log('4');
      Kakaouser.findOne({
          'user_key': req.body.user_key
      }, function(err, users) {
console.log('5');
          if (err) return res.json(err);
          obj = JSON.stringify(users); //객체 또는 배열을 인자로 받아 string을 json 형식으로 변경
          kakaousers = JSON.parse(obj); //json 파싱하기 위해 변수에 배정
          console.log('6');
                if(kakaousers.name_flag === '3'){
          console.log('7');
                  res.send({
                    "message": {
                      "text": kakaousers.name+"님!!!\n반갑습니다. 닉네임은 계속 바꿀 수 있으세요. (추후 변경 안되도록 막을 예정이니 선점하시는 것도 좋겠죠?) \n\n 바쁜 일이 많아서 2/7일부터 추가 개발이 있을 예정입니다."},
                    "keyboard": {
                      "type": "buttons",
                      "buttons": ["닉네임설정","처음으로","▶▶옆으로이동","신약QT(랜덤)","구약QT(랜덤)","개발자소개"]
                    }
                  });
                }
                else{
          console.log('8');
                        res.send({
                          "message": {
                            "text": "안녕하세요...아직 닉네임 생성을 안하셨네요? ㅎㅎ 괜찮아요 아직은 닉네임이 꼭 필요한 것이 아니거든요..^^",
                          },
                          "keyboard": {
                            "type": "buttons",
                            "buttons": ["닉네임설정","처음으로","▶▶옆으로이동","신약QT(랜덤)","구약QT(랜덤)","개발자소개"]
                          }
                        });
                      }

      });

    }

    else if (req.body.content === '개발자소개') {
console.log('9');
      res.send({
        "message": {
          "text": "안녕하세요.\n 저는 ERP DB, Node.js Programmer 입니다. \n컴퓨터과학 전공을 하였으며, \nAI 와 Chatbot 개발을 연구 중입니다. \n개발 관련 궁금한 사항 및 \n건의 or 사업 제안사항 있으시면 \nnode-js@naver.com으로 메일 주세요",
          "photo": {
            "url": "http://khj.heroku.com/images/master.jpg",
            "width": 640,
            "height": 480
          }
        },
        "keyboard": {
          "type": "buttons",
          "buttons": [
            "처음으로"
          ]
        }
      });
    }

    else if (req.body.content === '닉네임설정') {
console.log('10');
          //hero.creatHero(req,res);
          res.send({
              "message": {
                  "text": "안녕하세요 \n사용하실 닉네임을 말씀 해 주세요."
              }
          });

    }

    else if (req.body.content === '구약QT(랜덤)'){
console.log('16');

    bible.findOne({
        'seq':'1'
    }, function(err, users) {
        if (err) return res.json(err);
        obj = JSON.stringify(users); //객체 또는 배열을 인자로 받아 string을 json 형식으로 변경
        bibles = JSON.parse(obj); //json 파싱하기 위해 변수에 배정
                res.send({
                  "message": {
                    "text": "["+bibles.name+" "+bibles.jang+"장 "+bibles.jul+"절]\n" +bibles.content},
                  "keyboard": {
                    "type": "buttons",
                    "buttons": ["닉네임설정","처음으로","▶▶옆으로이동","신약QT(랜덤)","구약QT(랜덤)","개발자소개"]
                  }
                });

    });

    }

    else if (req.body.content === '신약QT(랜덤)'){
console.log('16');
      res.send({
        "message": {
          "text": "[신6:5]\n 너는 마음을 다하고 성품을 다하고 힘을 다하여 네 하나님 여호와를 사랑하라\n\n"+
          "추가 기능은 구현 중에 있습니다. 아직은 랜덤 설정이 되지 않습니다. 모든 성경을 랜덤으로 나오게 구현 할 예정입니다."
        },
        "keyboard": {
          "type": "buttons",
          "buttons": [
            "처음으로"
          ]
        }
      });
    }

      else if (req.body.content === '생성완료'){
console.log('16');
        res.send({
          "message": {
            "text": "닉네임 생성을 축하드립니다. \n 앞으로 방을 나갔다가 다시 들어오셔도, 님의 이름을 항상 기억할 것 입니다. 해당 기능을 사용하여 추후 많은 컨텐츠를 제작 할 예정이니, 기대하셔도 좋습니다. ^^"
          },
          "keyboard": {
            "type": "buttons",
            "buttons": [
              "처음으로"
            ]
          }
        });
      }
      else if (req.body.content === '생성취소'){
console.log('17');
        res.send({
          "message": {
            "text": "앗 맘에 안드신다구요? 난 "+ kakaousers.name +"좋은데.. 얼른 다시 생성해봐요.. "
          },
          "keyboard": {
            "type": "buttons",
            "buttons": [
              "닉네임설정",
              "처음으로"
            ]
          }
        });

        Kakaouser.findOneAndUpdate({
            'user_key': req.body.user_key
        }, {
            'name': '',
            'name_flag': '1'
        }, {
            new: true
        }, function(err, users) {
console.log('18');
            if (err) {
                console.log("Something wrong when updating data!");
            }
            obj = JSON.stringify(users); //객체 또는 배열을 인자로 받아 string을 json 형식으로 변경
            kakaousers = JSON.parse(obj); //json 파싱하기 위해 변수에 배정
        });

      }
      else {

console.log('19');
        Kakaouser.findOneAndUpdate({
            'user_key': req.body.user_key
        }, {
            'name': req.body.content,
            'name_flag': '3'
        }, {
            new: true
        }, function(err, users) {
console.log('20');
            if (err) {
                console.log("Something wrong when updating data!");
            }
            obj = JSON.stringify(users); //객체 또는 배열을 인자로 받아 string을 json 형식으로 변경
            kakaousers = JSON.parse(obj); //json 파싱하기 위해 변수에 배정
        });

        res.send({
          "message": {
            "text": "입력하신 닉네임은 " +req.body.content +"입니다. 맘에 드십니까? \n(하하)맘에 드시면 [생성완료]\n(흑흑)재 생성은   [생성취소]\n 버튼을 눌러주세요",
          },
          "keyboard": {
            "type": "buttons",
            "buttons": [
              "생성완료",
              "생성취소"
            ]
          }
        });
      }





});

app.post('/friend', function(req, res) {
    res.sendStatus(200);
});

app.delete('/friend/:user_key', function(req, res) {
    res.sendStatus(200);
});

app.delete('/chat_room/:user_key', function(req, res) {
    console.log('바이바이 잘 바이야~');
    res.sendStatus(200);
});

app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'));
});
