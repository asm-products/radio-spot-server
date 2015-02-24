var express = require('express'),
    MongoClient = require('mongodb').MongoClient,
    assert = require('assert');

var app = express();

// API for getting stations nearby
app.get('/api/v1/stations/:lat/:lon', function(req, res) {
    var lat = Number(req.params.lat);
    var lon = Number(req.params.lon);
    console.log("CALL TO /api/v1/stations/" + lat + '/' + lon);
    if (lat && lon) {
        getStations(res, lat, lon);
    } else {
        res.send(400, {
            'status': 'error',
            'message': 'Error getting list of stations',
            'info': ''
        });
    }
})

// Connect to the database & return the nearby stations
var getStations = function(res, lat, lon) {
    var url = 'mongodb://localhost:27017/radio-spot';
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        var collection = db.collection('stations');
        collection.find({
            loc: {
                $near: [lat, lon],
                $maxDistance: 0.30
            }
        }).toArray(function(err, docs) {
            assert.equal(err, null);
            res.send(200, {
                'status': 'success',
                'message': 'Got nearby stations',
                'info': {
                    'count': docs.length,
                    'stations': docs
                }
            })
            db.close();
        });
    });
}

var server = app.listen(3000, function() {
    var host = server.address().address
    var port = server.address().port
    console.log('Radio Spot server listening at http://%s:%s', host, port)
});
