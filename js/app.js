
var fitData
var altData = [], powerData = []

const xhr = new XMLHttpRequest();
xhr.open("GET", "http://localhost:8088/activity/2023-06-04T06:30:28+00:00_11268316944.fit");
xhr.send();
xhr.responseType = "json";
xhr.onload = () => {

    var graphs = [];

    fitData = xhr.response;

    for (var i=0; i<fitData.length; i++) {
        dt = Date.parse(fitData[i].Timestamp);
        pwr = parseInt(fitData[i].Power);
        if (pwr == 65535) pwr = 0;
        altData.push([dt, parseInt(fitData[i].Altitude)]);
        powerData.push([dt, pwr]);
    }
 
    var powergraph = new Dygraph(
        document.getElementById("powergraph"),
        powerData, // path to CSV file
        {}                  
    )
    

    var altitudegraph = new Dygraph(
        document.getElementById("altitudegraph"),
        altData, // path to CSV file
        {}                 
    );

    Dygraph.synchronize(altitudegraph, powergraph,
    {
        range: false
    });
    
}
