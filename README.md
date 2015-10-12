### YUNBI
Open source developed Nodejs API for the exchange market www.yunbi.com 
- This allow user to connect to public(unauthenticated) and private(authenticated) apis to view prices, check balance and trade from the module.
- Include most of Yunbi API except for placing multiple orders.

 ## Usage :
 
 - var Client = require('yunbi-module.js');

 - var client = new Client ( ACCESS_KEY, SECRET_KEY );

 # Public Call

 - client.getTicker( callback );
 - client.getAllTickers( callback );
 - client.getOrderBook( coinA, coinB, askLimit(*), bitLimit(*),callback );
 - client.getDepth( coinA, coinB,callback );
 - client.getMarkets( callback );
 - client.getTimeStamp( callback );
 - client.getK( coinA, coinB, limit, period, timestamp, callback );
 - client.KPendingTrades( coinA, coinB, tradeId, limit, period, timestamp,callback );

 # Private Get

 - client.getMember( callback );
 - client.getAllDeposits( coin, limit, state, callback );
 - client.getDeposit( transactionId, callback );
 - client.getDepositAddress( coin, callback );
 - client.getAllOrders( coinA, coinB, state(*), limit(*), page(*), orderBy(*), callback );
 - client.getOrder( orderId, callback );
 - client.myBalances( callback );
 - client.getRecentTrade( coinA, coinB, limit(*), timestamp(*), from(*), to(*), orderBy(*), callback );
 - client.getMyTrades( coinA, coinB,limit(*), timestamp(*), from(*), to(*), orderBy(*), callback );

 # Private Post

 - client.buy( coinA, coinB, rate, amount, callback );
 - client.sell( coinA, coinB, rate, amount, callback );
 - client.cancelAllOrders( side, callback );
 - client.cancelOrder( orderId, callback );




Buy me a cup of coffee for late night coding? Thank you for your support :)
Paypal : kbuimscd@gmail.com
Bitcoin : 1EnU64Gfa85A4XfzTzxm2ffYb1XLzvMtR3
 
  
