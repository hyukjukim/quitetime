
// models/bible.js
var mongoose = require('mongoose');

//bible 관리를 위한 Schema를 생성합니다.
var bibleSchema = mongoose.Schema({
    singu: {
        type: String,
    },
    name: {
        type: String,
    },
    name_short: {
        type: String,
    },
    jang: {
        type: String
    },
    jul: {
        type: String
    }
});
//bible 변수로 테이블에 접근
var bible = mongoose.model("kakaouser", bibleSchema);

module.exports = bible;
