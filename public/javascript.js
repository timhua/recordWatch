  $(function() {
    var snapshot = [];
    var badCount = [];
    var minCount = 100;
    var jsonData;

    var appendTime = function(time){
      $.get('/api/serverTime', function(data){
        $('#time').html("<h5>Last page refresh SERVER UTC time: " + data +"</h5>");
      });
    };
    // Takes in JSON response from Druid, returns array sorted by most frequently occuring rowCount
    var sortResults = function(data){
      var results = {},
          sortedResults = [];
      data.forEach(function(el, index){
          //Skip first in array, contains erroneous data
          if(index === 0) { return; }
          if(el.result.rowCount in results) {
          results[el.result.rowCount][0]++;
        } else {
          results[el.result.rowCount] = [1, el.timeStamp];
        }
      });
      for(var el in results){
        sortedResults.push([el, results[el]]);
      }

      return sortedResults.sort(function(a,b){return b[1][0]-a[1][0];});
    };


    var appendRecordCount = function(data){
      var html = '';
      for(var i=0; i < data.length;i++){
        html += "<tr><td><p>" + data[i][0] + " : " + String(data[i][1]).replace(/,$/,'') + "</p></td></tr>";
      }
        $('#containertable').html('<thead><th>Records : Count</th></thead>' + html);
    };

    var appendSnapshotRecords = function(data, highCount){
      var html = '',
          color;
      if(data.length < minCount){
        minCount = data.length-1;
      }
      for(var i = data.length-1; i > 0; i--){
        // var tsDate = new Date(data[i].timestamp)
        // console.log(tsDate);
        if(data[i].result.rowCount == highCount){
          color = '';
        } else {
          color = 'red';
          badCount.push([data[i].timestamp, data[i].result.rowCount]);
        }
        html += '<tr><td bgcolor="'+ color +'" name="'+ data[i].timestamp +'"">' +
                data[i].timestamp + ' - '+ data[i].result.rowCount + '</td></tr>';
      }
      $('#snapshottable').html('<thead><th>Records</th></thead>' + html);
    };

    var appendBadCount = function(data){
        var badCountHTML = '';
        for(var i = 0; i< badCount.length; i++){
          badCountHTML += '<tr><td><p>' + badCount[i][0] + ' - ' + badCount[i][1] + '</p></td></tr>';
        }
        $('#badcounttable').html('<thead><th>Bad Records</th></thead>' + badCountHTML);
    };

    var appendSummary = function(data, highCount){
      // var totalLostRecords = badCount.reduce(function(prev, curr, i){
      //                         return (highCount - curr[i][1]) + prev;
      //                       });
      // console.log(totalLostRecords);
      $('#summarytable').html('<thead><th> Summary </th></thead>' +
                              '<tr><td><p> Target Record Count: ' + highCount + '</p></td></tr>' + 
                              '<tr><td><p> Total Records: ' + (data.body.length-1) + '</p></td></tr>' +
                              '<tr><td><p> Time Window: ' + Math.floor(data.body.length/60) + ' min</p></td></tr>' +
                              '<tr><td><p> Bad Record Count: ' + badCount.length + '</p></td></tr>');
                              // '<tr><td><p> Total lost records: ' + totalLostRecords + ' min</p></td></tr>');
    };

    var getHostInfo = function(){
      var values = {};
      $.each($('form:input').serializeArray(), function(i, field) {
          console.log(field);
          values[field.name] = field.value;
      });
      return values;
    };

    console.log(getHostInfo());

    $.getJSON('/api/getData', function(data){
        console.log(data);
      // Discarding two latest records
      data.body.pop();
      data.body.pop();

      sortedData = sortResults(data.body);
      appendRecordCount(sortedData);
      appendSnapshotRecords(data.body, sortedData[0][0]);
      appendBadCount(badCount);
      appendSummary(data, sortedData[0][0]);
      appendTime(data.serverTime);
    });

    $('button').click(function(){
      var hostInfo = getHostInfo();
      console.log(hostInfo);
    });
  });



