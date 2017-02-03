// 카카오톡 기록 사이트
var express = require('express');
var mongoose = require('mongoose');
// body-parser module를 bodyPaser 변수에 담습니다.
var bodyParser = require("body-parser");
//method-override module을 methodOverride변수에 담습니다.
var methodOverride = require("method-override");
var app = express();
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

/*mongoose.Schema 함수를 사용해서 schema(data구조를 미리 정의해 놓는 것) object를 생성합니다.
사용할 Data의 형태를 object로 생성한 다음 mongoose.Schema함수에 넣습니다.
kakaomsg schema를 잠시 살펴보면 user_key, type, content 항목들을 가지고 있으며 새 항목 모두 타입은 String입니다.
나머지 사용가능한 schema type들은 mongoose  공식사이트(http://mongoosejs.com/docs/schematypes.html)에서 확인해 주세요.*/

var kakaomsgSchema = mongoose.Schema({
    user_key: {
        type: String
    },
    name: {
        type: String
    },
    type: {
        type: String
    },
    content: {
        type: String
    }
});
//mongoose.model함수를 사용하여 kakaomsg schema의 model을 생성합니다 kakaomsg에 일반적으로 s가 붙어서 테이블 생성
var Kakaomsg = mongoose.model("kakaomsg", kakaomsgSchema);

//user 관리를 위한 Schema를 생성합니다.
var kakaouserSchema = mongoose.Schema({
    user_key: {
        type: String,
        unique: true
    },
    name: {
        type: String,
    },
    password: {
        type: String
    },
    email: {
        type: String
    },
    name_flag: {
        type: String
    },
    password_flag: {
        type: String
    },
    email_flag: {
        type: String
    }
});
//KakaoUser 변수로 테이블에 접근
var KakaoUser = mongoose.model("kakaouser", kakaouserSchema);

//PORT 지정하는 부분
app.set('port', (process.env.PORT || 5000));
//ejs파일을 사용하기 위해서는 res.render 함수를 사용해야 하며, 첫번째 parameter로 ejs의 이름을,
//두번째 parameter로 ejs에서 사용될 object를 전달합니다. res.render함수는 ejs를 /views 폴더에서 찾으므로 views폴더의 이름은 변경되면 안됩니다.
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
    console.log('main come');
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
        "buttons": ["시작", "닉네임생성"]
    });
});

app.post('/message', function(req, res) {

    if (req.body.content === '시작') {}
    res.sendStatus(200);
});

app.post('/friend', function(req, res) {
    res.sendStatus(200);
});

app.delete('/friend/:user_key', function(req, res) {
    res.sendStatus(200);
});

app.delete('/chat_room/:user_key', function(req, res) {
    res.sendStatus(200);
});
