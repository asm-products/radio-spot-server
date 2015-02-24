var fs = require('fs');
var request = require('request');
var parse = require('csv-parse');

// Convert the CSV to JSON objects
var csvToJSON = function(file, success, error) {
    var parser = parse({delimiter: ',', columns:true}, function(err, data){
        if (err) {
            error(err);
        } else {
            success(data);
        }
    });

    fs.createReadStream(file).pipe(parser);
};

// Process the data
var processData = function(data) {
    var i;
    for (i = 0; i < data.length; i++) {
        console.log(data[i]);
        // console.log(data[i]['Letters']);
        // request('http://api.duckduckgo.com/?q=' + data[i]['Letters'] +'&format=json&pretty=1',
        //     function(error, response, body) {
        //         if (!error && response.statusCode == 200) {
        //             console.log(body) // Show the HTML for the Google homepage.
        //         } else {
        //             console.log(response);
        //             console.log(error);
        //         }
        //     });
    }
}

csvToJSON(__dirname+'/fm_usa.csv', function(data) {
    processData(data);
}, function(err) {
    console.log("ERROR PROCESSING THE CSV FILE");
    console.log(err);
});



