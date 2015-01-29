var connectionId = "";
var dps = [{x: 1, y: 10}, {x: 2, y: 10}, {x: 3, y: 10}, {x: 4, y: 10}, {x: 5, y: 10}];   //dataPoints. 
var xVal = dps.length + 1;
var yVal = 100;	
var avgLen = 25;
var xLen = 20;
var ys = [];


var ab2str = function(buf) {
  var bufView = new Uint8Array(buf);
  var encodedString = String.fromCharCode.apply(null, bufView);
  return decodeURIComponent(escape(encodedString));
};



var updateChart = function (newY) {
		//yVal = yVal +  Math.round(5 + Math.random() *(-5-5));
		yVal = parseFloat(newY);
		dps.push({x: xVal,y: yVal,});
		ys.push(yVal);
		var runningAvg = "-";
		if(ys.length >= avgLen){
			var toty = 0;
			for ( var i = 0 ; i < ys.length - avgLen ; i++){
				ys.shift();
			}
			for ( var i = 0 ; i < ys.length ; i++){
				toty += ys[i];
			}
			runningAvg = toty/avgLen;
		} else {
			var toty = 0;
			for ( var i = 0 ; i < ys.length ; i++){
				toty += ys[i];
			}
			runningAvg = toty/ys.length;
		}
		if(runningAvg < 41.1183){
			runningAvg = -913.79+64.8664*runningAvg-1.48802*Math.pow(runningAvg,2)+0.0115276*Math.pow(runningAvg,3);
		} else if(runningAvg < 851.259){
			runningAvg =3.07505*Math.log(7782.86*runningAvg);
		} else {
			runningAvg =0.00201998*Math.pow(runningAvg,2)-2.93084*runningAvg+1079.44;
		}
		xVal++;
		if (dps.length >  xLen ){
				dps.shift();				
			}
	chart.render();
	$("#yavg").html(runningAvg);
};

$("#chartdiv").hide();
$("#chartdiv").append("<div id='ac' style='height: 60%; width: 100%;'></div>");

var chart = new CanvasJS.Chart("ac",{
	title :{
		text: "Live Load Sensor Data"
	},
	axisX: {						
		title: "Time"
	},
	axisY: {						
		title: "Weight",
		minimum: 0,
		maximum: 1100,
	},
	data: [{
		type: "line",
		dataPoints : dps
	}]
});

var onLineReceived = function(st){
	  //console.log(st);
	  updateChart(st);
}

var stringReceived = "";
var onReceiveCallback = function(info) {
    if (info.connectionId == connectionId && info.data) {
      var str = ab2str(info.data);
      if (str.charAt(str.length-1) === '\n') {
        stringReceived += str.substring(0, str.length-1);
        onLineReceived(stringReceived);
        stringReceived = '';
      } else {
        stringReceived += str;
      }
    }
  };

chrome.serial.onReceive.addListener(onReceiveCallback);


var onConnect = function(connectionInfo) {
   // The serial port has been opened. Save its id to use later.
  connectionId = connectionInfo.connectionId;
  // Do whatever you need to do with the opened port.
}

var doConnect = function(path){
	chrome.serial.connect(path, {bitrate: 9600}, onConnect);
}

var onGetDevices = function(ports) {
  for (var i=0; i<ports.length; i++) {
	var path = ports[i].path;
    console.log(path);
	$("#portlist").append('<li id="pl'+path+'" class="list-group-item btn">'+path+'</li>');
	$(document.body).on("click","#pl"+path,function(){
						$("#portdiv").slideUp("normal", function() {
							$("#portdiv").remove();
							$("#connPort").html(path);
							$("#chartdiv").slideDown('slow');
						});
						doConnect(path);
						chart.render();
					});
  }
}
$(document.body).on("click","#updateAvgLen",function(){
		avgLen = $("#avgLenForm").val();
		if (avgLen == ""){
			avgLen = 25;
			$("#avgLenForm").val(25);
		}
	});
chrome.serial.getDevices(onGetDevices);


