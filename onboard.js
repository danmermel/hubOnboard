var request = require('request');

var onboard = function(onboardURL, json, token, callback) {
  var auth = "Bearer "+ token;
  // console.log(auth);

  var options = {
      url: onboardURL,
      method: "POST",
      headers : {
        "Content-Type": "application/json; charset=utf-8",
        "Accept": "application/json",
        "Authorization": auth
      },
      json: true,   // <--Very important!!!
      body: json
  };

  // console.log(options);

  request(options, function (error, response, body){
      if (error){
        console.log("Error", error);
        callback(error, null);
      } else {
         // console.log(JSON.stringify(body));
         callback(null,JSON.stringify(body));
      }
  });

};

module.exports = {
  onboard : onboard
}
