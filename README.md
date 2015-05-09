# Yunbi
Open source developed Nodejs API for the exchange market www.yunbi.com 
- This allow user to connect to public(unauthenticated) and private(authenticated) apis to view prices, check balance and trade from the module. 
 # Usage : 
  var client = require('yunbi-module.js')
  client.myBalances(ACCESS_KEY,SECRET_KEY,function(err, result){}
  client.buy(yunbiPair[0],yunbiPair[1], rate, amount,ACCESS_KEY,SECRET_KEY, function (error, result) {)
 client.sell(yunbiPair[0],yunbiPair[1], rate, amount,ACCESS_KEY,SECRET_KEY, function (err1, result) {}
 client.getDepth(prime, second,function(err, result){}
 
  
