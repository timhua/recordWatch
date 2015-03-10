var express = require('express');
var unirest = require('unirest');
var exec = require('child_process').exec;
var moment = require('moment');
var app = express();
var port = 3000;
var result;

app.use(express.static(__dirname + '/public'));

app.get('/', function(req,res){
  res.send('index.html');
  res.end();
});
app.get('/api/serverTime', function(req,res){
  res.send(moment.utc().toISOString());
  res.end();
});

app.get('/api/getData', function(req,res){
  var now = moment.utc().toISOString();
  var start =  moment.utc().subtract(10, 'minutes').toISOString();
  var query = { 
              "queryType": "timeseries",
              "dataSource": "points_100ms",
              "granularity": {"type": "period", "period": "PT1s"},
              "aggregations":[ {"type": "count", "name": "rowCount"} ],
              "intervals": [start + '/' + now]
            };

  unirest.post('http://192.168.20.220:2179/druid/v2/?')
    .header( { 'content-type':'application/json' })
    .send(query)
    .end(function(response){
      console.log(now, 'db called');
      result = response;
      console.log('done');
    });
  res.send(result);
  res.end();
});

app.listen(port);
console.log('listening on', port);
