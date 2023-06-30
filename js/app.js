
var altData = [], powerData = [], powerDataTimeBased = [], speedData = [];
var records = [];

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
    records = fitData.Records;

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
            //showRoller: true,
            //rollPeriod: 14,
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
    
    // given min and max x values are distance based because y axsis is distance.
    // get the indices into the data record array for the distance values
    minIdx = 0;
    maxIdx = 0;
    for (i=0; i<powerData.length; i++) {
        if (parseFloat(powerData[i][0]) >= minX && minIdx == 0) {
            minIdx = i;
        }
        if (parseFloat(powerData[i][0]) >= maxX && maxIdx == 0) {
            maxIdx = i;
        }
    }

    avgPwr = 0;
    for (let i=minIdx; i<maxIdx; i++) {
        avgPwr += parseFloat(powerData[i][1]);
    }
    avgPwr = avgPwr/(maxIdx-minIdx);

    selectedDistance = parseFloat(powerData[maxIdx][0]) - parseFloat(powerData[minIdx][0]);
    s.innerHTML = "<b>Zoom</b> selected distance: " + (maxX-minX) + "km" +
    " average power: " + avgPwr + "watt" +
    " selected distance: " + selectedDistance + "<br>" +
    " min idx: " + minIdx + " max idx: " + maxIdx + 
    " selected min km: " + powerData[minIdx][0] + 
    " selected max km: " + powerData[maxIdx][0] + "<br>";

    // calculate normalized power of selection
    np = calulateNormalizedPower(records, minIdx, maxIdx);
    s.innerHTML += "records lenth: " + records.length + " np: " + np + "watt<br>";
    
}

function calulateNormalizedPower(records, startIdx, endIdx) {
    var s = document.getElementById("debug");
    var startDate = new Date(records[startIdx].Timestamp);
    var endDate = new Date(records[endIdx].Timestamp);
    var diffDate = new Date(endDate.getTime() - startDate.getTime());
    var diffSeconds = diffDate.getTime()/1000;

    if (diffSeconds < 30) {
        s.innerHTML += "selected time difference is: " + diffSeconds + "sec, can not calculate np<br>";
        return 0.0;
    }

    // calculate rolling 30 sec power average
    var secAvgPower = [];
    for (let i=startIdx; i<endIdx; i++) {
        secAvgPower.push(calculate30SecAverage(records, i));
    }
    s.innerHTML += "30 sec avg power: " + secAvgPower + "<br>";

    // take power of 4 for each 30 sec value
    // and calculate the average of all power values
    avgPower = 0.0;
    for (i in secAvgPower) {
        avgPower += Math.pow(secAvgPower[i], 4)
    }
    avgPower = avgPower / secAvgPower.length;

    // the forth root of the new avg value is the np
    // forth root is the same as power of 1/4 or 0.25
    return Math.pow(avgPower, 0.25);
    
}

function calculate30SecAverage(records, startIdx) {
    var s = document.getElementById("debug");
    var startDate = new Date(records[startIdx].Timestamp);
    var avgPower = records[startIdx].Power;
    var nextIdx = startIdx + 1;
    var loopCounter = 0;

    do {
        var endDate = new Date(records[nextIdx].Timestamp);
        var diffDate = new Date(endDate.getTime() - startDate.getTime());
        var diffSeconds = diffDate.getTime()/1000;

        if (records[nextIdx].Power != 65535) {
            avgPower += records[nextIdx].Power;
        }

        nextIdx++;
        loopCounter++;
    } while (diffSeconds < 30 && nextIdx != records.length);

    if (nextIdx == records.length && diffSeconds < 30) {
        return 0.0;
    }

    return avgPower / loopCounter;
}

/*
pwr = parseInt(records[i].Power);
        if (pwr == 65535) pwr = 0;
        
        
            Step 1: Calculate the rolling average with a window of 30 seconds: Start at 30 seconds, calculate the average power of the previous 30 seconds and to the for every second after that.

    Step 2: Calculate the 4th power of the values from the previous step.

    Step 3: Calculate the average of the values from the previous step.

    Step 4: Take the fourth root of the average from the previous step. This is your normalized power.

Or in pseudo code:

    rolling_average = 30 second rolling average

    rolling_avg_powered = rolling_average^4

    avg_powered_values = average of rolling_avg_powered

    NP = avg_powered_values^0.25
        */