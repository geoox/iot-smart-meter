const fetch = require("node-fetch");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const MeterData = require("./models/meter_data");
const ts = require('timeseries-analysis');



//connect to db
const dbPassword = 'admin'
mongoose.connect('mongodb+srv://admin:' + dbPassword + '@cluster0-igo28.mongodb.net/test?retryWrites=true&w=majority',{ useNewUrlParser: true, useUnifiedTopology: true });

let port = process.env.PORT || 8060;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.listen(port, ()=> console.log("Listening to 8060..."));

function getRealData(meter_id){ //meter_id -1 returns all data
  return new Promise(async (resolve, reject) => {
    if(meter_id != -1){
      const data = await MeterData.find({
        "type": 0,
        "meter_id":meter_id
    
      })
      .sort({ timestamp : -1 });
      resolve(data);
    }
      else{
        const data = await MeterData.find({
          "type": 0,
      
        })
        .sort({ timestamp : -1 });
        resolve(data);
      }
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

async function processData(meter_id){
  const data = await getRealData(meter_id);
  


var t     = new ts.main(ts.adapter.fromDB(data, {
  date:   'timestamp',     // Name of the property containing the Date (must be compatible with new Date(date) )
  value:  'reading'     // Name of the property containign the value. here we'll use the "close" price.
}));


// t.smoother({period:4}).save('smoothed'); //Remove noise from the data?
//get forecast array
var forecast_data     = new ts.main(ts.adapter.fromDB(data, {
  date:   'timestamp',     
  value:  'reading'     
}));
var fc_results =[]; //array that will contain the forecasted values
const forecast_batch_size=10; //desired forecasting iterations ; gets more innacurate the greater the prediction number

for(var j=0;j<forecast_batch_size;j++){
  
  var coeffs = t.ARMaxEntropy({
    data:	forecast_data.data
  

  });
  var forecast	= 0;	// Init the value at 0.
  for (var i=0;i<coeffs.length;i++) {	// Loop through the coefficients
      forecast -= forecast_data.data[forecast_data.data.length-1-i][1]*coeffs[i];
      
  }
  fc_results.push(forecast);
  forecast_data.data.push([new Date(),forecast]);
  console.log(forecast_data.data.length, "data size")
}
console.log("forecast:",fc_results)



var output=t.sliding_regression_forecast({sample:Math.round(t.data.length*3/4) , degree: 5}).output();
output.forEach(x=> {
  if(x[1]<0) x[1]= x[1]*(-1);}
  );
var chart_url = t.chart({main:true,points:[{color:'ff0000',point:t.data.length*3/4 + 1,serie:0}]});



}


processData(3);
// Constructed using NPM Package "TimeSeries Analysis" and the respective documentation. Source: https://www.npmjs.com/package/timeseries-analysis