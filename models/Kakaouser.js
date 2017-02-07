
// models/Kakaouser.js


var mongoose = require('mongoose');

//user 관리를 위한 Schema를 생성합니다.
var kakaouserSchema = mongoose.Schema({
    user_key: {
        type: String,
        unique: true
    },
    name_flag: {
        type: String,
    },
    church_name: {
        type: String
    },
    score: {
        type: String
    },
    name: {
        type: String
    },
    date: {
        type: String
    },
    password: {
        type: String
    },
    email: {
        type: String
    },
    temp1: {
        type: String
    },
    temp2: {
        type: String
    }
});
//Kakaouser 변수로 테이블에 접근
var Kakaouser = mongoose.model("kakaouser", kakaouserSchema);

module.exports = Kakaouser;
