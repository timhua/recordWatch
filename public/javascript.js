  $(function() {
    var results = {};
    var sortedResults = [];
    var snapshot = [];
    var html = '';
    var color;
    var highCount;
    var badCount = [];
    var minCount = 100;
    var date = new Date();
    $('#time').html("<h5>Last page refresh UTC time: " + date.toISOString() +"</h5>");
    $.getJSON('/api/getData', function(data){
      // console.log(data.body);
      data.body.pop();
      data.body.pop();

      data.body.forEach(function(el){
         if(el.result.rowCount in results) {
          results[el.result.rowCount][0]++;
        } else {
          results[el.result.rowCount] = [1, el.timeStamp];
        }
      })
      for(var el in results){
        sortedResults.push([el, results[el]])
      }
      sortedResults.sort(function(a,b){return b[1][0]-a[1][0];})
      highCount = sortedResults[0][0];
      console.log(highCount);
      for(var i=0; i < sortedResults.length;i++){
        $('#containertable').append("<tr><td><p>" + sortedResults[i][0] + " : " + sortedResults[i][1] + "</p></td></tr>");
      }
      if(data.body.length < minCount){
        minCount = data.body.length-1;
      }
      for(var i = data.body.length-1; i > 0; i--){
        var tsDate = new Date(data.body[i].timestamp)
        // console.log(tsDate);
        if(data.body[i].result.rowCount == highCount || data.body[i].result.rowCount > 60){
          color = "";
        } else {
          color = "red";
          badCount.push([data.body[i].timestamp, data.body[i].result.rowCount])
        }
        html += '<tr><td bgcolor="'+ color +'" name="'+ data.body[i].timestamp +'"">' + data.body[i].timestamp + ' - '+ data.body[i].result.rowCount + '</td></tr>';
      }
      if(badCount !== []){
        var badCountHTML = '';
        
        for(var i = 0; i< badCount.length; i++){
          badCountHTML += '<tr><td><p>' + badCount[i][0] + ' - ' + badCount[i][1] + '</p></td></tr>';
        }
        $('#badcounttable').html('<thead><th>Bad Records</th></thead>' + badCountHTML);
      }
      var summary = {
        total: data.body.length,
        highCount: highCount,
        badCount: badCount.length,
      }
      $('#summarytable').html('<thead><th> Summary </th></thead>' +
                              '<tr><td><p> Target Record Count: ' + highCount + '</p></td></tr>' + 
                              '<tr><td><p> Total Records: ' + data.body.length + '</p></td></tr>' +
                              '<tr><td><p> Total time: ' + Math.floor(data.body.length/60) + ' min</p></td></tr>' +
                              '<tr><td><p> Bad Record Count: ' + badCount.length + '</p></td></tr>');
      $('#snapshottable').html('<thead><th>Records</th></thead>' + html);
    });
  });

