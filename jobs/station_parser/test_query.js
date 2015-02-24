db.stations.find(
   { loc : { $near : [ 37.368889, -122.083889 ], $maxDistance: 0.10 } }
)