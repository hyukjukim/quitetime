// 카카오톡 기록 사이트
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var app = express();
var Kakaouser = require("./models/Kakaouser");
var Kakaomsg = require("./models/Kakaomsg");
var hero = require("./modules/Hero");
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
        "buttons": ["게임시작"]
    });
});

app.post('/message', function(req, res) {

console.log('1');
    if (req.body.content === '게임시작'){
      Kakaouser.create({
          user_key: req.body.user_key,
          name_flag: '1',
          password_flag: '0',
          email_flag: '0',
          name: null
      },{
          new: true
      }, function(err, users) {
console.log('2');
      res.send({
        "message": {
          "text": "4차 혁명의 시작. 자동응답 머드게임의 부활. 지금, 시작합니다.\n"
        },
        "keyboard": {
          "type": "buttons",
          "buttons": [
            "처음으로"
          ]
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
          "buttons": [
            "캐릭터생성",
            "전투시작",
            "▶▶옆으로이동",
            "처음으로",
            "개발자소개"
          ]
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
                      "text": kakaousers.name+"님...반갑습니다.(흑흑)\n저는 제13지구의 천사예요..\n"+
                      "바알의 유혹에 빠져 \n지상으로 떨어졌답니다.\n저를 구해주세요..\n제발..\n다시 천국으로 가기 원해요..\n저와 여행을 떠나 주시겠어요?",
                      "photo": {
                        "url": "http://khj.heroku.com/images/start.jpg",
                        "width": 640,
                        "height": 480
                      }
                    },
                    "keyboard": {
                      "type": "buttons",
                      "buttons": [
                        "캐릭터생성",
                        "전투시작",
                        "▶▶옆으로이동",
                        "처음으로",
                        "개발자소개"
                      ]
                    }
                  });
                }
                else{
          console.log('8');
                        res.send({
                          "message": {
                            "text": "안녕하세요...아이디 생성도 안한 초 뉴비님..(흑흑)\n저는 제13지구의 천사예요..\n"+
                            "바알의 유혹에 빠져 \n지상으로 떨어졌답니다.\n저를 구해주세요..\n제발..\n다시 천국으로 가기 원해요..\n저와 여행을 떠나 주시겠어요?",
                            "photo": {
                              "url": "http://khj.heroku.com/images/start.jpg",
                              "width": 640,
                              "height": 480
                            }
                          },
                          "keyboard": {
                            "type": "buttons",
                            "buttons": [
                              "캐릭터생성",
                              "전투시작",
                              "▶▶옆으로이동",
                              "처음으로",
                              "개발자소개"
                            ]
                          }
                        });
                      }

      });

    }

    else if (req.body.content === '개발자소개') {
console.log('9');
      res.send({
        "message": {
          "text": "안녕하세요.\n 저는 현재 DB 개발자로 재직중인 Programmer 입니다. \n개발 관련 궁금한 사항 및 \n건의or제안사항 있으시면 \nnode-js@naver.com으로 메일 주세요",
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

    else if (req.body.content === '캐릭터생성') {
console.log('10');
          //hero.creatHero(req,res);
          res.send({
              "message": {
                  "text": "안녕하세요 용사님 반갑습니다."+
                          "\n전투 떠날 준비가 되셨나요? \n사용하실 닉네임을 말씀 해 주세요."
              }
          });

    }


    else if (req.body.content === '전투시작') {
console.log('11');
          res.send({
            "message": {
              "text": "용사님, 안돼요..\n이 앞은 너무 무서워요..\n어디로 가시는거죠?",
              "photo": {
                "url": "http://khj.heroku.com/images/devilsgate.jpg",
                "width": 640,
                "height": 480
              }
            },
            "keyboard": {
              "type": "buttons",
              "buttons": [
                "지상계전투",
                "천상계전투",
                "PvP",
                "처음으로"
              ]
            }
          });
      }

      else if (req.body.content === '지상계전투'){
console.log('12');
        res.send({
          "message": {
            "text": "지상계 전투 입니다. 인간들의 평균 전투력은 천사들을 따라 잡을 수 없으나, 현재 전 저주를 받아 아이템이 전혀 없어 매우 약합니다.\n캐릭터 생성이 필요합니다.",
            "photo": {
              "url": "http://khj.heroku.com/images/human.jpg",
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
      else if (req.body.content === '천상계전투'){
console.log('13');
        res.send({
          "message": {
            "text": "아직은 너무 빡세...\n캐릭터 생성이 필요합니다.",
            "photo": {
              "url": "http://khj.heroku.com/images/sky.jpg",
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
      else if (req.body.content === 'PvP'){
console.log('14');
        res.send({
          "message": {
            "text": "맘에 들지 않는 유저를 척살 가능 합니다. 이기면 해당 유저의 정보는 사라집니다. \n(닉네임 차지 가능)\n캐릭터 생성이 필요합니다.",
            "photo": {
              "url": "http://khj.heroku.com/images/pvp.jpg",
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

      else if (req.body.content === '뚜벅이전사'||req.body.content === '간지러운궁수'||req.body.content === '몸빵약한법사'||req.body.content === '마스터') {
console.log('15');
              res.send({
                "message": {
                  "text": "2017-01-31.. 구현 중 입니다.",
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
            "text": "아이디 생성을 축하드립니다. 용사님 지금부터 저와 함께 오지게 빡센 게임을 시작 해봅시다. 님 아이디는 DB에 저장될거예요. 아이디 바꾸고 싶으면 다시 생성하면 됩니다. (회사일이 더 오지게 빡세서 개발은 좀 천천히 할게요..) "
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
            "text": "아휴 왜이렇게 한번에 생성을 못하실까... 난 "+ kakaousers.name +"좋은데.. 얼른 다시 생성해봐요.. "
          },
          "keyboard": {
            "type": "buttons",
            "buttons": [
              "캐릭터생성",
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
            "text": "님이 입력하신 아이디는 " +req.body.content +"입니다. 맘에 드십니까? \n(하하)맘에 드시면 [생성완료]\n(흑흑)재 생성은  [생성취소]\n 버튼을 눌러주세요",
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
