//Reads parameters from command line and from config file depending on environment
// then requests an authorisation token from the Hub
// if that is successful, it then reads a tab separated file, each line of the format
// source_id_types (~ separated) / source_ids (~ separated)/ offer_ids (~ separated)/ description
// for each line it  prepares a JSON object
// which then gets onboarded to the Hub repository
// If that is successful it writes the onboarded line to a results file


var fs = require("fs");
var request = require("request");
var lineReader = require('line-reader');
var onboard = require('./onboard.js');   //module for onboarding


// get command line arguments and put them into a params object

var args = process.argv;
var params = {};

for (var i = 2; i < args.length ; i++) {
  var x= args[i].split("=");
  params[x[0]] = x[1];
}

// if you don't pass in the env, then it assumes staging, to be on the safe side

if (params.env == "prod") {
  var config = require ('./configProd.json');
  var repo = config.repo;
  var url = 'https://auth.copyrighthub.org/v1/auth/token';
  var scope = 'delegate[https://on.copyrighthub.org]:write[' + repo + ']';
  var onboardURL = 'https://on.copyrighthub.org/v1/onboarding/repositories/' + repo + '/assets';
  

} else  {
  var config = require ('./configStage.json');
  var repo = config.repo;
  var url = 'https://auth-stage.copyrighthub.org/v1/auth/token';
  var scope = 'delegate[https://on-stage.copyrighthub.org]:write[' + repo + ']';
  var onboardURL = 'https://on-stage.copyrighthub.org/v1/onboarding/repositories/' + repo + '/assets';

}

var clientID = config.clientID;
var clientSecret = config.clientSecret;
var sourceFile=params.source;
var filename = params.results;


//now check you need everything before you start

if (!clientID){
  console.log("No ClientID configured. Review your config document");
  process.exit();
}
if (!clientSecret){
  console.log("No clientSecret configured. Review your config document");
  process.exit();
}
if (!repo){
  console.log("No repo configured. Review your config document");
  process.exit();
}
if (!sourceFile){
  console.log("No source file to onboard. Pass in a source file in command line parameters (source=xxx)");
  process.exit();
}
if (!filename){
  console.log("No file to write results to. Pass in a results file in command line parameters (results=xxx)");
  process.exit();
}

// console.log(filename, clientID, clientSecret, repo, sourceFile, url, scope);

var prepare_json = function(line) {

  // console.log("here is my line", line);
  var json = {};
  var arr = line.split("\t");
  var idtypes = arr[0].split("~");
  var ids = arr[1].split("~");
  var offers = arr[2].split("~");
  var descr = arr[3];
  var source_ids = [];

  //sanity check first
  if (idtypes.length != ids.length || idtypes.length == 0) {    //badness
    console.log("bad line");
    return null;
  }

  for(var i=0; i< idtypes.length; i++) {
    var srcjson = {"source_id_type": idtypes[i] , "source_id":ids[i]};
    source_ids.push(srcjson);
  };
  json.source_ids = source_ids;
  json.offer_ids = offers;
  json.description = descr;

  console.log(json);
  return json;

};

var write = function (filename, line, callback){
  fs.appendFile(filename, line, function(err) {
    if(err) {
        callback(err, null);
    }
    callback(null,"file saved");
  }); 
};

var options = { 
  method: 'POST',
  url: url,
  auth: {
    user: clientID,
    pass: clientSecret,
    sendImmediately: true
  },
  form: {
    grant_type: 'client_credentials',
    scope: scope
  }
};

request(options, function (error, response, body) {
  if (error) throw new Error(error);
  // console.log(body);
  body = JSON.parse(body);
  var token = body.access_token;
  // console.log("token is ", token);
  lineReader.eachLine(sourceFile, function(line, last, callback) {
    var json = prepare_json(line);
    if(json == null) {
      callback(); //get next line because this one is bad
    } else {
      onboard.onboard(onboardURL, json, token,  function (err, data) {
        if(err){ 
          console.log("Error onboarding", err);
          callback(err);
        } else {
          // console.log("Onboard successful", data);
          data = JSON.parse(data);
          line += '\t ';
 	        line += data.data[0].hub_key;
   	      line += '\n';
          write(filename, line, function(err, data) {
            if(err) {
              console.log("Error writing to file... continuing");
            } 
          });
          callback();
        }
      })
    };
    
    if(last){
      console.log("last line reached")
    // or check if it's the last one
    }
  });
});
