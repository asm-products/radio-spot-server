var conn=new Mongo();
var twyst=conn.getDB("radio-spot");
twyst.stations.ensureIndex({'loc':'2d'})
