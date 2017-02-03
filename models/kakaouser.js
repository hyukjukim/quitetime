
// models/Kakaouser.js

var mongoose = require('mongoose');

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
//Kakaouser 변수로 테이블에 접근
var Kakaouser = mongoose.model("kakaouser", kakaouserSchema);

module.exports = Kakaouser;
