/**
 * Created by kimbui on 10/9/15.
 */
var yunbi = require("./yunbi-module");
//TODO insert access and key to test
var access = "";
var key = "";
var client = new yunbi(access,key);


//client.getAllTickers(function(err,result){
//    console.log(err,result)
//})

client.getTicker("ethcny","btccny",function(err,result){
    console.log(err,result)
})

