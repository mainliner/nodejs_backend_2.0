var mongodb = require('./db');

function Star(star){
    this.star = {
        ChineseName:"",
        EnglishName:"",
        nickName:"",
        birthday:new Date(),
        birthplace:"",
        blood:"",
        constellation:"",
        stature:0,
        voice:"None",
        description:"",
        headPortrait:"",
        portraitBig:"",
        portraitSmall:""
    };
}