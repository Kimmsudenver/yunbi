/**
 * Created by kim on 2/25/15.
 */

//Create module for Yunbi exchange to call the APIs
/*
Trading and deposit are free until 04/01/2015 So get fee will be 0 until then
 */
module.exports = (function() {
    'use strict';

    // Module dependencies
    var crypto  = require('crypto'),
        request = require('request'),
        nonce   = require('nonce')();
     var  Gkey=''
    var Gsign='' //global var, FIXME should use one from constructor

    // Constants
    var version         = '0.0.6',
        API_URL  = 'https://yunbi.com:443//api/v2',
        HASH_URL = '/api/v2',
        USER_AGENT      = 'yunbi.js ' + version;
    var errorMsg = "Missing Params";
    //USER_AGENT    = 'Mozilla/5.0 (Windows NT 6.3; WOW64; rv:26.0) Gecko/20100101 Firefox/26.0'


    // Helper methods
    function joinCurrencies(currencyA, currencyB){
        // If only one arg, then return the first
        if (typeof currencyB !== 'string'){
            return currencyA;
        }

        return currencyA.toLowerCase()  + currencyB.toLowerCase();
    }

    function sortParameters(a, b){return 0;
        // Sort `nonce` parameter last, and the rest alphabetically
        return a === 'nonce' || a > b ? 1 : -1;
    }

    function cleanUpParam(param){
        for (var key in param){
            if(param[key] == null)
                delete param[key];
        }
    }


    // Constructor
    function Yunbi(key, secret){
        // Generate headers signed by this user's key and secret.
        // The secret is encapsulated and never exposed
        this._getPrivateHeaders = function(parameters,link){
            var paramString, signature;
            var url = "POST|"+HASH_URL+link+"|"
            if (!key || !secret){
                throw 'Yunbi: Error. API key and secret required';
            }

            // Sort parameters alphabetically and convert to `arg1=foo&arg2=bar`
            paramString = Object.keys(parameters).sort(parameters).map(function(param){
                return encodeURIComponent(param) + '=' + encodeURIComponent(parameters[param]);
            }).join('&');
            var signature = crypto.createHmac('SHA256', secret).update(url+paramString).digest('hex');
            parameters.signature = signature

            signature = crypto.createHmac('sha256', secret).update(paramString).digest('hex');
           //console.log("SIGNATURE " +signature)

            Gkey = key
            Gsign = signature
            return {
                Key: key,
                Sign: signature
            };
        };
    }

    // Currently, this fails with `Error: CERT_UNTRUSTED`
    // Yunbi.STRICT_SSL can be set to `false` to avoid this. Use with caution.
    // Will be removed in future, once this is resolved.
    //Yunbi.STRICT_SSL = false;

    // Customisable user agent string
    Yunbi.USER_AGENT = USER_AGENT;

    // Prototype
    Yunbi.prototype = {
        constructor: Yunbi,

        // Make an API request
        _request: function(options, callback){
            request(options, function(err, response, body) {
                // Empty response
                if (!err && (typeof body === 'undefined' || body === null)){
                    err = 'Empty response';
                }

                callback(err, body);
            });

            return this;
        },

        // Make a public API request
        _public: function(link, parameters, callback){
            var options;

            if (typeof parameters === 'function'){
                callback = parameters;
                parameters = {};
            }

            parameters || (parameters = {});
            options = {
                method: 'GET',
                url: API_URL+link,
                qs: parameters
            };
            return this._request(options, callback);
        },

        // Make a private API request POST
        _privatePost: function(link, parameters,key,secret, callback){
            var options;

            if (typeof parameters === 'function'){
                callback = parameters;
                parameters = {};
            }

            parameters || (parameters = {});
            parameters.tonce = nonce()/100;
            parameters.access_key = key
            var  paramString = Object.keys(parameters).sort(parameters).map(function(param){
                return encodeURIComponent(param) + '=' + encodeURIComponent(parameters[param]);
            }).join('&');


           // var signature = (crypto.createHmac('sha256', secret).update(url+paramString).digest('hex')).toString();
           // parameters.signature = signature
           //// console.log(signature + " tonce " + parameters.tonce)


            options = {
                method: "POST",
                url: API_URL+link,
                form: parameters,
                headers: this._getPrivateHeaders(parameters,link)
            };
            options.headers['User-Agent'] = "Yunbi API Client/0.0.1"
            return this._request(options, callback);
        },
/////
        // Make a private API request GET
        _privateGet: function(link,key,secret ,callback){
            var options;
            var url = "GET|"+HASH_URL+link+"|"

           var parameters= {}
            parameters.access_key = key
            parameters.tonce = parseInt(nonce()/100 );

           var  paramString = Object.keys(parameters).sort(parameters).map(function(param){
                   return encodeURIComponent(param) + '=' + encodeURIComponent(parameters[param]);
               }).join('&');

            var signature = crypto.createHmac('sha256', secret).update(url+paramString).digest('hex');
            parameters.signature=signature
            paramString = paramString +"&"+encodeURIComponent('signature') + "=" + encodeURIComponent(signature)
            options = {
                method: 'GET',
                url: API_URL+link+"?"+paramString
            };
            return this._request(options, callback);
        },


        /////


        // PUBLIC METHODS

        getTicker: function(A,B,callback){
            if(!A  || !B)
                callback (errorMsg, null);
            else {
                var parameters = {
                    market: joinCurrencies(A, B)
                };
                var url = '/tickers/' + joinCurrencies(A, B) + '.json'

                return this._public(url, parameters, callback);
            }
        },
        getAllTickers : function(callback){
            return this._public("/tickers.json",{},callback);
        },
        getDepth: function(currencyA,currencyB,mLimit,callback) {
            if (!currencyA || !currencyB)
                callback(errorMsg, null);
            else {
                var parameters = {
                    market: joinCurrencies(currencyA, currencyB),
                    limit: mLimit ? mLimit : 300
                };

            return this._public('/depth.json', parameters, callback);
            }
        },
        getOrderBook: function(currencyA, currencyB,askLimit, bidLimit, callback){
            if(!currencyA  || !currencyB)
                callback(errorMsg,null);
            else {
                var parameters = {
                    market: joinCurrencies(currencyA, currencyB),
                    asks_limit: askLimit ? askLimit : 20,
                    bids_limit: bidLimit ? bidLimit : 20
                };

                return this._public('/order_book.json', parameters, callback);
            }
        },
        getMarkets : function(callback){
            return this._public("/markets.json",{},callback);
        },
        getTimeStamp : function(callback){
            return this._public("/timestamp.json",{},callback);
        },
        getK : function(currencyA,currencyB,Limit, Period,Timestamp,callback){
            if(!currencyA || !currencyB)
                callback(errorMsg,null);
            else {
                var param = {
                    market: joinCurrencies(currencyA, currencyB),
                    limit: Limit ? Limit : null,
                    period: Period ? Period : null,
                    timestamp: Timestamp ? Timestamp : null
                }
                cleanUpParam(param);
                return this._public("/k.json", param, callback);
            }
        },
        KPendingTrades : function (currencyA,currencyB, tradeId, Limit,Period,Timestamp,callback){
            if(!currencyA || !currencyB || !tradeId)
                callback(errorMsg,null);
            else {
                var param = {
                    market: joinCurrencies(currencyA, currencyB),
                    trade_id: tradeId,
                    period: Period ? Period : null,
                    timestamp: Timestamp ? Timestamp : null
                }
                cleanUpParam(param);
                return this._public("/k_with_pending_trades.json", param, callback);
            }
        },





        //// PRIVATE GET


        getMember : function(callback){
            var url = "/members/me.json";
            return this._privateGet(url,{},callback);
        },
         getAllDeposits : function(InCurrency,InLimit, InState,callback){
             if(!InCurrency)
                callback(errorMsg,null)
             else {
                 var param = {
                     currency: InCurrency,
                     limit: InLimit ? InLimit : 100,
                     state: InState ? InState : "wait"
                 }
                 return this._privateGet("/deposits.json", param, callback);
             }
        },
        getDeposit : function(transaction, callback){
            if(!transaction)
                callback(errorMsg,null)
            else {
                var param = {
                    txid: transaction
                }
                return this._privateGet("/deposit.json", param, callback);
            }
        },
        getDepositAddress : function(InCurrency, callback){
            if(!InCurrency){
                callback(errorMsg,null)
            }
            else {
                var param = {
                    currency: InCurrency
                }
                return this._privateGet("/deposit_address.json", param, callback);
            }
        },
        getAllOrders : function(currencyA, currencyB, mState, mLimit, mPage, mOrderBy, callback){
            var param = {
                state : mState ? mState : "wait",
                limit : mLimit ? mLimit : 100,
                page : mPage,
                order_by : mOrderBy? mOrderBy : 'asc',
                market : joinCurrencies(currencyA,currencyB)
            }

            return this._privateGet("/orders.json",param,callback);

        },
        getOrder : function(orderId,callback){
            var param = { id : orderId}
            return this._privateGet("/orders.json",param, callback);
        },

        myBalances: function(key,secret,callback){
            return this._privateGet('/members/me.json',key,secret, callback);
        },

        getRecentTrade : function(currencyA, currencyB, mLimit, Timestamp, From, To, Orderby,callback){
            var param = {
                market : joinCurrencies(currencyA,currencyB),
                limit : mLimit ? mLimit : 50,
                timestamp : Timestamp ? Timestamp : null,
                from : From ? From : null,
                to : To ? To : null,
                order_by : Orderby  ? Orderby : "desc"
            }
            cleanUpParam(param);
            return this._privateGet("/trades.json",param,callback);
        },
        getMyTrades :  function(currencyA, currencyB, mLimit, Timestamp, From, To, Orderby,callback){
            var param = {
                market : joinCurrencies(currencyA,currencyB),
                limit : mLimit ? mLimit : 50,
                timestamp : Timestamp ? Timestamp : null,
                from : From ? From : null,
                to : To ? To : null,
                order_by : Orderby  ? Orderby : "desc"
            }
            cleanUpParam(param)
            return this._privateGet("/trades/my.json",param,callback);
        },





        /////PRIVATE POST

        buy: function(currencyA, currencyB, rate, amount,key,secret, callback){
            var parameters = {
                market: joinCurrencies(currencyA, currencyB),
                price: rate,
                volume: amount,
                side : 'buy'
            };

            return this._privatePost('/orders.json', parameters,key,secret, callback);
        },

        sell: function(currencyA, currencyB, rate, amount, key,secret, callback){
            var parameters = {
                market: joinCurrencies(currencyA, currencyB),
                price: rate,
                volume: amount,
                side : 'sell'
            };

            return this._privatePost('/orders.json', parameters,key,secret, callback);
        },

        cancelAllOrder : function(mSide, callback){
            if(side){
                var param = {
                    side : mSide
                }
                return this._privatePost("orders/clear.json",param,callback);
            }
            else{
                return this._privatePost("orders/clear.json",{},callback);
            }
        },

        cancelOrder : function(orderId,callback){
            var param = { id : orderId}
            return this._privatePost("/order/delete.json",param,callback);
        }


    };

    return Yunbi;
})();

