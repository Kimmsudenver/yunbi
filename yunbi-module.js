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
            var parameters = {
                market: joinCurrencies(A, B)
            };
            var url ='/tickers/'+joinCurrencies(A,B) + '.json'

            return this._public(url,parameters, callback);
        },
        getDepth: function(currencyA,currencyB,callback){
            var parameters = {
                market: joinCurrencies(currencyA, currencyB)            };

            return this._public('/depth.json',parameters, callback);
        },
        getOrderBook: function(currencyA, currencyB, callback){
            var parameters = {
                market: joinCurrencies(currencyA, currencyB)
            };

            return this._public('/order_book.json', parameters, callback);
        },


        /////


        // PRIVATE METHODS

        myBalances: function(key,secret,callback){
            return this._privateGet('/members/me.json',key,secret, callback);
        },

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
        }


    };

    return Yunbi;
})();

