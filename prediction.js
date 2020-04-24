const fetch = require("node-fetch");
const express = require("express");

const ts = require("timeseries-analysis");
const mongoose = require("mongoose");
const MeterData = require("./models/meter_data");

var dictionary =[]
var trueYs=[];

function processData(){
  MeterData.find({
      "type": 0
    })
    .sort({ timestamp : -1 })
    .then(data => {
       console.log(data);
    })

}
 

function getFakeData(){
    return new Promise(async (resolve, reject) => {
      const elements = await fetch('https://iot-smart-meter.herokuapp.com/fake_data?size=100');
     
      const resp = await elements.json();
      const readings = resp.data;
    
      readings.forEach(reading => {
        trueYs.push(reading.reading);
        dictionary.push([reading.timestamp,reading.reading]);
        dictionary=dictionary.reverse();
        if(reading == readings[readings.length-1]){
        
          // last element 
          resolve();
        }
    });
  });
}

/*async function processData(){
  
  
// var t     = new ts.main(ts.adapter.fromArray(trueYs));

var t     = new ts.main(ts.adapter.fromDB(data, {
  date:   'timestamp',     // Name of the property containing the Date (must be compatible with new Date(date) )
  value:  'reading'     // Name of the property containign the value. here we'll use the "close" price.
}));
// The sin wave
//t     	= new ts.main(ts.adapter.sin({cycles:4}));


var coeffs = t.ARMaxEntropy({
    data:	t.data
});
console.log(t.data);

// Output the coefficients to the console
console.log(coeffs);


var forecast	= 0;	// Init the value at 0.
for (var i=0;i<coeffs.length;i++) {	// Loop through the coefficients
    forecast -= t.data[t.data.length-1-i][1]*coeffs[i];
    // Explanation for that line:
    // t.data contains the current dataset, which is in the format [ [date, value], [date,value], ... ]
    // For each coefficient, we substract from "forecast" the value of the "N - x" datapoint's value, multiplicated by the coefficient, where N is the last known datapoint value, and x is the coefficient's index.
}
}
*/

processData();
// Constructed using NPM Package "TimeSeries Analysis" and the respective documentation. Source: https://www.npmjs.com/package/timeseries-analysis