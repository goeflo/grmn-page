
var fitData
var altData = [], powerData = [], speedData = []

const xhr = new XMLHttpRequest();
xhr.open("GET", "http://localhost:8088/activity/2023-06-04T06:30:28+00:00_11268316944.fit");
xhr.send();
xhr.responseType = "json";
xhr.onload = () => {

    var graphs = [];

    fitData = xhr.response;

    movingTime = new Date();
    movingTime.setTime(fitData.MovingTime);

    document.getElementById("activity-date").innerHTML = fitData.Date;
    document.getElementById("activity-product-name").innerHTML = fitData.Product;
    document.getElementById("activity-moving-time").innerHTML = movingTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12:false});
    document.getElementById("activity-distance").innerHTML = fitData.Distance/100000 + "km";
    document.getElementById("activity-normalized-power").innerHTML = fitData.NormalizedPower + "watt";

    var dtOld = 0;
    var records = fitData.Records;

    for (var i=0; i<records.length; i++) {

        /* keep this to convert timestamp in record into data
        to display time based graph set 'dt' instead of 'distance' for the x-axis

        dt = Date.parse(records[i].Timestamp);

        if (i==0) {
            dtOld = dt;
            dt = 0;
        } else {
            dt = dt - dtOld;
        }

        newDate = new Date();
        newDate.setTime(dt);
        */
        distance = records[i].Distance/100000;
        pwr = parseInt(records[i].Power);
        if (pwr == 65535) pwr = 0;
        speed = (records[i].Speed*3.6) / 1000;
        altData.push([distance, parseInt(records[i].Altitude)]);
        powerData.push([distance, pwr]);
        speedData.push([distance, speed]);

    }
 
    var powergraph = new Dygraph(
        document.getElementById("powergraph"),
        powerData,
        {
            title: "power",
            ylabel: 'power (w)',
            labels: [ 'km', 'Watt' ],
            animatedZooms: true,
            zoomCallback: graphZoomCallback
        }
    );
    

    var altitudegraph = new Dygraph(
        document.getElementById("altitudegraph"),
        altData, 
        {
            title: "elevation",
            ylabel: "elevation (m)",
            labels: [ 'km', 'hm'],
            animatedZooms: true,
            zoomCallback: graphZoomCallback
        }
    );

    var speedgraph = new Dygraph(
        document.getElementById("speedgraph"),
        speedData, 
        {
            title: "speed",
            ylabel: "speed (km/h)",
            labels: [ 'km', 'km/h'],
            animatedZooms: true,
            zoomCallback: graphZoomCallback
        }
    );

    Dygraph.synchronize(altitudegraph, powergraph, speedgraph,
    {
        range: false
    }); 
}

function graphZoomCallback(minX, maxX, yRanges) {
    s = document.getElementById("debug");
    s.innerHTML = "<b>Zoom</b> selected distance: " + (maxX-minX) + "km<br>";
    //s.innerHTML += "<b>Zoom</b> [" + minX + ", " + maxX + ", [" + yRanges + "]]<br />";
}