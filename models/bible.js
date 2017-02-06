
// models/bible.js
var mongoose = require('mongoose');

//bible 관리를 위한 Schema를 생성합니다.
var bibleSchema = mongoose.Schema({
    seq: {
        type: String,
    },
    singu: {
        type: String,
    },
    name: {
        type: String,
    },
    content: {
        type: String
    }
});

//bible 변수로 테이블에 접근
var bible = mongoose.model("bible", bibleSchema);

module.exports = bible;
