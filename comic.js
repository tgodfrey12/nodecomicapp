'use strict';

//Require Section
var http = require("http"); //http for get method to connect to API
var crypto = require('crypto'); //crypto for md5 hash
var config = require('./config/config'); //config  for API keys 
var print = require('./print');  //print for user message print functions

//Variables
var key_pub = config.key_pub;
var key_priv = config.key_priv;
var time_stamp = Math.floor(new Date() / 1000);
var md5String = time_stamp + key_priv + key_pub;
var hash = crypto.createHash('md5').update(md5String).digest('hex');

//Function to get character data from Marvel API
function get(character) {
    //Connect to the API URL
    var request = http.get("http://gateway.marvel.com:80/v1/public/characters?name=" + character + "&ts=" + time_stamp + "&apikey=" + key_pub + "&hash=" + hash,
      function (response) {
        var body = "";

        //Read the data
        response.on('data', function (chunk) {
            body += chunk;
        });

        response.on('end', function () {
            if (response.statusCode === 200) {
                try {
                    //Parse the data (description is in results object array)
                    var characterData = JSON.parse(body);
                    if (characterData["data"].results[0].description !== "") {
                        print.printMessage(characterData.data.results[0].name, characterData.data.results[0].description);
                    } else {
                        print.printBlankDes(characterData.data.results[0].name);
                    }
                } catch (error) {
                    //Parse error
                    print.printError(error);
                }
            } else {
                //Status code error
                print.printError({message: "There was an error getting the profile for " + character + ". (" + http.STATUS_CODES[response.statusCode] + ")"})
            }
        });
    });
    //Connection error
    request.on('error', print.printError);
}

function attr(character) {
    //Connect to the API URL
    var attribution = http.get("http://gateway.marvel.com:80/v1/public/characters?name=" + character + "&ts=" + time_stamp + "&apikey=" + key_pub + "&hash=" + hash,
                           function (response) {
                var body = "";

                //Read the data
                response.on('data', function (chunk) {
                    body += chunk;
                });

                response.on('end', function () {
                            var characterData = JSON.parse(body);
                            print.printAttribution(characterData.attributionText);
                });
            });}

//Use module.exports to export function to get comic character info
module.exports.get = get;
module.exports.attr = attr;
