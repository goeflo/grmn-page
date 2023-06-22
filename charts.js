function drawCharts(data) {

    var powerDataPoints = [], hmDataPoints = [];

    var charts = [];
    var toolTip = {
        shared: true
    },
    legend = {
        cursor: "pointer",
        itemclick: function (e) {
            if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                e.dataSeries.visible = false;
            } else {
                e.dataSeries.visible = true;
            }
            e.chart.render();
        }
    };  

    var powerChartOptions = {
    animationEnabled: true,
    theme: "light2", // "light1", "light2", "dark1", "dark2"
    title:{
      text: "Power"
    },
    toolTip: toolTip,
    axisY: {
      valueFormatString: "#0.#",
    },
    legend: legend,
    data: [{
      type: "splineArea", 
      showInLegend: "true",
      name: "Watt",
      yValueFormatString: "#0.#",
      color: "#64b5f6",
      xValueType: "int",
      xValueFormatString: "#0.#",
      legendMarkerType: "square",
      dataPoints: powerDataPoints
    }]
  };

  var altitudeChartOptions = {
    animationEnabled: true,
    theme: "light2",
    title:{
      text: "Altitude"
    },
    axisY: {
      suffix: " hm"
    },
    toolTip: toolTip,
    legend: legend,
    data: [{
      type: "splineArea", 
      showInLegend: "true",
      name: "hm",
      color: "#e57373",
      xValueType: "int",
      xValueFormatString: "#0.#",
      yValueFormatString: "#0.#",
      legendMarkerType: "square",
      dataPoints: hmDataPoints
    }]
  };

  charts.push(new CanvasJS.Chart("powerChart", powerChartOptions));
  charts.push(new CanvasJS.Chart("altitudeChart", altitudeChartOptions));

  for (var i=0; i<data.length; i++) {
    hmDataPoints.push({x: parseInt(i), y: parseInt(data[i].Altitude)});
    if (parseInt(data[i].Power) == 65535)
        powerDataPoints.push({x: parseInt(i), y: 0});
    else
        powerDataPoints.push({x: parseInt(i), y: parseInt(data[i].Power)});
  }

  syncCharts(charts, true, true, true);

  for( var i = 0; i < charts.length; i++){
    charts[i].render();
  }

}

function syncCharts(charts, syncToolTip, syncCrosshair, syncAxisXRange) {

    if(!this.onToolTipUpdated){
        this.onToolTipUpdated = function(e) {
          for (var j = 0; j < charts.length; j++) {
            if (charts[j] != e.chart)
              charts[j].toolTip.showAtX(e.entries[0].xValue);
          }
        }
      }
  
      if(!this.onToolTipHidden){
        this.onToolTipHidden = function(e) {
          for( var j = 0; j < charts.length; j++){
            if(charts[j] != e.chart)
              charts[j].toolTip.hide();
          }
        }
      }
  
      if(!this.onCrosshairUpdated){
        this.onCrosshairUpdated = function(e) {
          for(var j = 0; j < charts.length; j++){
            if(charts[j] != e.chart)
              charts[j].axisX[0].crosshair.showAt(e.value);
          }
        }
      }
  
      if(!this.onCrosshairHidden){
        this.onCrosshairHidden =  function(e) {
          for( var j = 0; j < charts.length; j++){
            if(charts[j] != e.chart)
              charts[j].axisX[0].crosshair.hide();
          }
        }
      }

    if(!this.onRangeChanged){
        this.onRangeChanged = function(e) {
          for (var j = 0; j < charts.length; j++) {
            if (e.trigger === "reset") {
              charts[j].options.axisX.viewportMinimum = charts[j].options.axisX.viewportMaximum = null;
              charts[j].options.axisY.viewportMinimum = charts[j].options.axisY.viewportMaximum = null;
              charts[j].render();
            } else if (charts[j] !== e.chart) {
              charts[j].options.axisX.viewportMinimum = e.axisX[0].viewportMinimum;
              charts[j].options.axisX.viewportMaximum = e.axisX[0].viewportMaximum;
              charts[j].render();
            }
          }
        }
      }

      for(var i = 0; i < charts.length; i++) { 

        //Sync ToolTip
        if(syncToolTip) {
          if(!charts[i].options.toolTip)
            charts[i].options.toolTip = {};
  
          charts[i].options.toolTip.updated = this.onToolTipUpdated;
          charts[i].options.toolTip.hidden = this.onToolTipHidden;
        }
  
        //Sync Crosshair
        if(syncCrosshair) {
          if(!charts[i].options.axisX)
            charts[i].options.axisX = { crosshair: { enabled: true }};
          
          charts[i].options.axisX.crosshair.updated = this.onCrosshairUpdated; 
          charts[i].options.axisX.crosshair.hidden = this.onCrosshairHidden; 
        }
  
        //Sync Zoom / Pan
        if(syncAxisXRange) {
          charts[i].options.zoomEnabled = true;
          charts[i].options.rangeChanged = this.onRangeChanged;
        }
      }

}
