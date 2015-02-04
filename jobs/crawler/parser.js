var Crawler = require('crawler');
var request = require('request');
var AdmZip = require('adm-zip');
var fs = require('fs');
var path = require('path');
var async = require('async');
var XLS = require('xlsjs');

var dbUrl = 'http://www.dxfm.com/Database/FM%20USA.zip';
var fileName = 'FM USA2.xls';
//var fileName = 'FM USA.zip';
var tmpDir = path.join(__dirname, 'tmp');


// For the Excel sheets in the zip files provided previously
// Save them as CSV so it's easier to parse
// For each row in the file, using the call letter and frequency
// Find the website for the service and download the name and logo
// Also, calculate the lat/long for each station (using azimuth and distance)
// Output the name, logo, call, frequency, logo and lat/long into a JSON file
// which can easily be imported into mongodb.


var dummyGetZip = function dummyGetZip(cb) {
    console.log('get zip');    
    return cb(null, path.join(__dirname, 'FM USA.zip'));
};

//var getZip = function getZip(cb) {
//    console.log('downloading zip');
//    request(dbUrl, function(err, res, data) {
//        if (err) throw new Error('Error downloading Database ' + err);   
//        if (res.statusCode == 200) {
//            console.log('db downloaded');
//
//            fs.writeFileSync(path.join(tmpDir, fileName), data);
//                //if (err) return cb('Error saving database', null);
//            console.log('zip file is: ' + path.join(tmpDir, fileName));
//            return cb(null, path.join(tmpDir, fileName));
//        }
//    });
//};

var extractZip = function extractZip(zipFile, cb) {
    console.log('xtract zip ' + zipFile);
    var zip = new AdmZip(zipFile);
    var zipEntries = zip.getEntries();
    
    //console.log('files in zip: ' + zipEntries);
    zip.extractAllTo(tmpDir, true);
    return cb(null, tmpDir);
};


var findXls = function findXls(dir, cb) {
    console.log('find xls');    
    fs.readdir(dir, function(err, files) {
        var xlsFiles = [];
        async.each(files, function(file, callback) {
            //console.log('file in zip: ' + file);
            if (file.split('.').pop() == 'xls') {
                xlsFiles.push(path.join(tmpDir, file));
            }
            return callback(null);
        }, cb(null, xlsFiles));
    });
};


var parseXls = function parseXls(xlsFiles, cb) {
    console.log('parse xls ' + xlsFiles);
    
    var workbook = XLS.readFile(xlsFiles[0]);
    var sheetList = workbook.SheetNames;
    var sheet = workbook.Sheets[sheetList[0]];
    
    console.log('sheet A3 is: ' + sheet['A3'].v);

    return cb(null, sheet);

};


function getColumns(sheet, cb) {
    console.log('get columns');
        
    // get call letter and freq columns
    var range = XLS.utils.decode_range('A1:AE2');

    var callColumn;
    var freqColumn;
    var cityColumn;
    var stateColumn;
    var azColumn;
    var distColumn;
    var originLatColumn;
    var originLongColumn;    
    
    //console.dir(sheet);
    
    for(var R = range.s.r; R <= range.e.r; R++) {
        for(var C = range.s.c; C <= range.e.c; C++) {
            var cell_address = XLS.utils.encode_cell({c: C, r: R});
            // for every cell in this range, see if content is freq or letters
                        
            if (sheet[cell_address] != undefined) {
                // cell has contents
                //console.log(' cell conte? ' + sheet[cell_address].v);

                var cell_value = sheet[cell_address].v;
                //console.log(typeof cell_value);

                if (typeof cell_value != undefined) {
                    if (cell_value == 'Call') {
                        callColumn = XLS.utils.decode_cell(cell_address).c;
                        //console.log('got call');
                    }
                    else if (cell_value == 'Freq') {
                        freqColumn = XLS.utils.decode_cell(cell_address).c;
                        //console.log('got freq');
                    }
                    else if (cell_value == 'City') {
                        cityColumn = XLS.utils.decode_cell(cell_address).c;
                    }
                    else if (cell_value == 'State') {
                        stateColumn = XLS.utils.decode_cell(cell_address).c;
                    }
                    else if (cell_value == 'Azimuth') {
                        azColumn = XLS.utils.decode_cell(cell_address).c;
                        //console.log('got az');
                    }
                    else if (cell_value == 'Distance') {
                        distColumn = XLS.utils.decode_cell(cell_address).c;
                        //console.log('got dist');
                    }
                    else if (cell_value == 'YOUR LATITUDE') {
                        originLatColumn = XLS.utils.decode_cell(cell_address).c;
                        //console.log('got lat');
                    }
                    else if (cell_value == 'YOUR LONGITUDE') {
                        originLongColumn = XLS.utils.decode_cell(cell_address).c;
                        //console.log('got long');
                    }
                    if (callColumn != undefined &&
                        freqColumn != undefined &&
                        cityColumn != undefined &&
                        stateColumn != undefined &&
                        azColumn != undefined &&
                        distColumn != undefined &&
                        originLatColumn != undefined &&
                        originLongColumn != undefined) {
                        // we have found all columns. break the loop.

                        var columns = {
                            callColumn: callColumn,
                            freqColumn: freqColumn,
                            cityColumn: cityColumn,
                            stateColumn: stateColumn,
                            azColumn: azColumn,
                            distColumn: distColumn,
                            originLatColumn: originLatColumn,
                            originLongColumn: originLongColumn
                        };
                        
                        //console.log('cols saved good');
                        return cb(null, sheet, columns);
                    }
                }
            }
        }
    }
};


var calculateCoordinates = function calculateCoordinates(sheet, columns, cb) {
    
    // get origin lat/long
    // for each row
    //   get azimuth
    //   get distance
    //   
    
    
};
    
var getData = function getData(sheet, columns, cb) {
    console.log('get data');
    
    // get lat1, lon1
    // for each row
    //   get freq
    //   get call
    //   get city
    //   get state
    //   get azimuth
    //   get distance
    //   calculate lat2, lon2
    
//    function getColumnData(row, callback) {
//        console.log('row: ');
//        console.dir(row);
//        
//        callback(null, sheet);
//        
//    };    
//    
    // get origin lat & long
    var originLatColumn = XLS.utils.encode_col(columns.originLatColumn);
    var originLongColumn = XLS.utils.encode_col(columns.originLongColumn);
    var lat1 = sheet[originLatColumn+'2'].v;
    var long1 = sheet[originLongColumn+'2'].v;
    //if (long1 == 84.4667) long1 = -84.4667; // fix a bug in the spreadsheet that put longitude in europe instead of usa
    //console.dir(sheet[originLongColumn+'2']);
    
    console.log('lat1: ' + lat1 + ' long1: ' + long1);

    //console.dir(sheet);
    //fs.writeFileSync('sheetBlob.json', JSON.stringify(sheet));
    //async.map(sheet, getColumnData, cb);
    
    // start at row 2
    // for row 2
    //   get freq cell
    //   get call cell
    //   get city cell
    //   get state cell
    //   get az cell
    //   get dist cell
    //   calculate lat2/long2
    
    // prep the json that will be output
    var data = [];
    
    // prep lat/lng calculation
    var earthRadius = 6378137; // meters. WGS84 derived.
    
    var testCell = XLS.utils.encode_cell({c: 3, r: 5});
    console.log('testcell ' + testCell);
    console.log('3, 5 is: ' + testCell);
    console.log('typof testcell: ' + typeof testCell);
    //console.dir(sheet);
    console.log(sheet[XLS.utils.encode_cell({c: 3, r: 5})]);
    var rowStart = 2;
    for(var row = rowStart; sheet[XLS.utils.encode_cell({c: 0, r: row})] != undefined; row++) {
        // iterate through all rows until end of spreadsheet reached
        //console.log(row);
        
        var freq;
        var call;
        var city;
        var state;
        var az;
        var dist;
        var lat2;
        var long2;
        
        freq = sheet[XLS.utils.encode_cell({c: columns.freqColumn, r: row})].v;
        call = sheet[XLS.utils.encode_cell({c: columns.callColumn, r: row})].v;
        city = sheet[XLS.utils.encode_cell({c: columns.cityColumn, r: row})].v;
        state = sheet[XLS.utils.encode_cell({c: columns.stateColumn, r: row})].v;
        az = sheet[XLS.utils.encode_cell({c: columns.azColumn, r: row})].v;
        dist = sheet[XLS.utils.encode_cell({c: columns.distColumn, r: row})].v;
        // convert distance unit of measure from miles to meters        
        // 1 metre is equal to 0.000621371192237 miles        
        dist /= 0.0006213711922373339;
        console.log('new -------------');

        console.log('distance in meters: ' + dist);
        
        //console.log('azimuth: ' + az);
        
//        =69.04676688*degrees(acos(sin(radians(Y$2))*sin(radians(K6))+(cos(radians(Y$2))*cos(radians(K6))*cos(radians(Z$2)-(radians(L6))))))
        
        // create a triangle
        //   line a from north pole to lat2,lon2
        //   line b from lat2,lon2 to lat1,lon1
        //   line c from lat1,lon1 to north pole
        //   angle B at north pole between lines a and c
        
        //console.log('distance in mi: ' + dist);
        
        //console.log('distance in meters: ' + dist);
        
        var b = dist / earthRadius; // radians of line b
        console.log('radians of line b: ' + b);
        
        var c = 90 - lat1;
        console.log('angle of c: ' + c);
        
        var a = Math.acos(Math.cos(b) * Math.cos(c) + Math.sin(c) * Math.sin(b) * Math.cos(az)); // arc cosine of the law of cosines
        console.log('arc cosine of law of cosines: ' + a);
        
        var angB = Math.asin(Math.sin(b) * Math.sin(az) / Math.sin(a)); // angle of B
        console.log('angle of B: ' + angB);
        
        var lat2 = 90 - a;
        var long2 = angB + long1;

        data.push({
            freq: freq,
            call: call,
            city: city,
            state: state,
            az: az,
            dist: dist,
            lat2: lat2,
            long2: long2
        });
        
        console.dir(data);
        
        return cb(null);
    }
               
    return cb(null, data);
};


var getStations = function getStations(sheet, columns, cb) {
    
    var crawlDirectoryPage = function crawlDirectoryPage(err, res) {
        $('a').each(function(index, a) {
            if ($(a).value.match(/[A-Z-]{3,}/)) {
                // if link name name is something like
                // KISC or KBRT-FM, add link to crawler queue
                crawler.queue($(a).attr('href'));
            }
        });
    };
    
    var crawler = new Crawler({
        maxConnections: 10,
        callback: function(err, res, $) {
            $('a').each(function(index, a) {
                var toQueueUrl = $(a).attr('href');
                crawler.queue(toQueueUrl);
            });
        }
    });
    
    crawler.queue([{
        uri: 'https://en.wikipedia.org/wiki/List_of_radio_stations_in_Florida',
        callback: crawlDirectoryPage
    }]);
    
    crawler.queue([{
        uri: 'http://www.laalmanac.com/media/me10.htm',
        callback: crawlDirectoryPage
    }]);
    
};


var exportData = function displayData(data, cb) {
    fs.writeFileSync('dataTest.json', JSON.stringify(data));
};


// get the spreadsheet and the data we need
async.waterfall([
    //downloadZip
    // @todo
    
    // download the zip
    //getZip,
    dummyGetZip,
    
    // extract zip
    extractZip,
    
    // get a list of the xls files
    findXls,
    
    // parse xls
    parseXls,
    
    // get freq, callsign, azimuth and distance columns.
    getColumns,
    
    // get the freq, callsign, azimuth and distance values
    getData,
    
    exportData
    
    // get stations (crawler needs to do this)
    //getStations

], function (err) {
    if (err) {
        console.log('there was an error: ' + err);
    }
    else {
        console.log('no errs');
    }
});
    


    
    
    



