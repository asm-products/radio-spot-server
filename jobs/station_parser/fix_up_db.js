conn = new Mongo();
db = conn.getDB("radio-spot");
db.stations.find().forEach(function(d) {
	db.stations.update(
		{_id: d._id},
		{
			loc: {
				lat: d.Lat,
				lon: d.Lon
			},
			freq: d.Freq,
			letters: d.Letters,
			city: d.City,
			state: d.State,
			channel: d.Svc
		}
	);
});