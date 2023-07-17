
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
    document.getElementById("activity-average-power").innerHTML = fitData.AveragePower + "watt";
    document.getElementById("activity-normalized-power").innerHTML = fitData.NormalizedPower + "watt";

    var dtOld = 0;
    records = fitData.Records;

    for (var i=0; i<records.length; i++) {

        /* keep this to convert timestamp in record into data
        to display time based graph set 'dt' instead of 'distance' for the x-axis
*/
        dt = Date.parse(records[i].Timestamp);

        /*if (i==0) {
            dtOld = dt;
            dt = 0;
        } else {
            dt = dt - dtOld;
        }*/

        newDate = new Date(dt);
        //newDate.setTime(dt);
  
        //distance = records[i].Distance/100000;
        pwr = parseInt(records[i].Power);
        if (pwr == 65535) pwr = 0;
        speed = (records[i].Speed*3.6) / 1000;
        altData.push([newDate, parseInt(records[i].Altitude)]);
        powerData.push([newDate, pwr]);
        speedData.push([newDate, speed]);

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
    powerOutput = document.getElementById("selected-power");
    s.innerHTML = "<b>Zoom</b> selected minx: " + minX + " maxx: " + maxX + "<br>";

    minXDate = new Date(minX);
    maxXDate = new Date(maxX);
    minIdx = 0;
    maxIdx = 0;
    for (i=0; i<powerData.length; i++) {
        if (powerData[i][0].valueOf() >= minXDate.valueOf() && minIdx == 0) minIdx = i;
        if (powerData[i][0].valueOf() >= maxXDate.valueOf() && maxIdx == 0) maxIdx = i;
        if (minIdx != 0 && maxIdx != 0) break;
    }
    s.innerHTML += "min idx: " + minIdx + " max idx: " + maxIdx + "<br>";
    s.innerHTML += "min time: " + powerData[minIdx][0] + " max time: " + powerData[maxIdx][0] + "<br>";

    avgPwr = 0;
    for (let i=minIdx; i<maxIdx; i++) {
        avgPwr += parseFloat(powerData[i][1]);
    }
    avgPwr = Math.round(avgPwr/(maxIdx-minIdx));
    powerOutput.innerHTML = "selected avg power: " + avgPwr + "w<br>";

    // calculate normalized power of selection
    np = calulateNormalizedPower(records, minIdx, maxIdx);
    powerOutput.innerHTML += "selected normalized power: " + np + "w<br>";
    return;

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
        if (minIdx != 0 && maxIdx != 0) break;
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

    // we select everything or only the start
    if (startIdx <= 1) {
        startIdx += 30;
    }

    var s = document.getElementById("debug");
    var initialDate = new Date(records[0].Timestamp)
    var startDate = new Date(records[startIdx].Timestamp);
    var endDate = new Date(records[endIdx].Timestamp);
    var diffDate = new Date(endDate.getTime() - startDate.getTime());
    var diffSeconds = diffDate.getTime()/1000;
    var intialDiffDate = new Date(startDate.getTime() - initialDate.getTime());
    var initialDiffSeconds = intialDiffDate.getTime()/1000;

    if (initialDiffSeconds <= 30) {
        s.innerHTML += "start time difference is: " + initialDiffSeconds + "sec, can not calculate np<br>";
        return 0.0;
    }

    if (diffSeconds < 30) {
        s.innerHTML += "selected time difference is: " + diffSeconds + "sec, can not calculate np<br>";
        return 0.0;
    }

    // https://jaylocycling.com/easily-understand-cycling-normalized-power/
    // calculate rolling 30 sec power average
    // take power of 4 of the 30 sec value and add to the previouse calculated value
    // for a summary of all values to calculate the average afterwards
    var normPower = 0.0;
    for (let i=startIdx; i<endIdx; i++) {
        thirtySecAverage = calculate30SecAverage(records, i);
        normPower += Math.pow(thirtySecAverage, 4);
    }

    // calculate the average of avgPower by dividing with the number of values
    // added to avgPower and return the forth root of that average.
    // forth root is the same as power of 1/4 or 0.25
    normPower = normPower / (endIdx-startIdx);
    return Math.round(Math.pow(normPower, 0.25));
    
}

// calculate average power of the previouse 30 sec
function calculate30SecAverage(records, startIdx) {

    var s = document.getElementById("debug");
    var startDate = new Date(records[startIdx].Timestamp);
    var avgPower = records[startIdx].Power;
    var prevIdx = startIdx--;
    var loopCounter = 0;

    do {
        var prevDate = new Date(records[prevIdx].Timestamp);
        var diffDate = new Date(startDate.getTime() - prevDate.getTime());
        var diffSeconds = diffDate.getTime()/1000;

        if (records[prevIdx].Power != 65535) {
            avgPower += records[prevIdx].Power;
            //loopCounter++;
        } 

        prevIdx--;
        loopCounter++;
    } while (diffSeconds < 30 && prevIdx != 0);

    // decrease loop counter because we have increased it before exiting the while loop
    return avgPower / loopCounter--;
}

/*
pwr = parseInt(records[i].Power);
        if (pwr == 65535) pwr = 0;
        
        
            Step 1: Calculate the rolling average with a window of 30 seconds: 
            Start at 30 seconds, calculate the average power of the previous 30 seconds and to the for every second after that.

    Step 2: Calculate the 4th power of the values from the previous step.

    Step 3: Calculate the average of the values from the previous step.

    Step 4: Take the fourth root of the average from the previous step. This is your normalized power.

Or in pseudo code:

    rolling_average = 30 second rolling average

    rolling_avg_powered = rolling_average^4

    avg_powered_values = average of rolling_avg_powered

    NP = avg_powered_values^0.25
        */