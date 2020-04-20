const tf = require('@tensorflow/tfjs');
const fetch = require("node-fetch");

const trainX = []; //timestamp
const trainY = []; // readings

function getFakeData(){
    return new Promise(async (resolve, reject) => {
      const elements = await fetch('https://iot-smart-meter.herokuapp.com/fake_data?size=100');
      const resp = await elements.json();
      const readings = resp.data;
    
      readings.forEach(reading => {
        trainX.push(reading.timestamp);
        trainY.push(reading.reading);
        if(reading == readings[readings.length-1]){
          // last element 
          resolve();
        }
    });
  });
}

// const trainX = [3.3, 4.4, 5.5, 6.71, 6.93, 4.168, 9.779, 6.182, 7.59, 2.167, 7.042, 10.791, 5.313, 7.997, 5.654, 9.27, 3.1]; //timestamp
// const trainY = [1.7, 2.76, 2.09, 3.19, 1.694, 1.573, 3.366, 2.596, 2.53, 1.221, 2.827, 3.465, 1.65, 2.904, 2.42, 2.94, 1.3]; //reading
const m = tf.variable(tf.scalar(Math.random()));
const b = tf.variable(tf.scalar(Math.random()));

function predict(x) {
  return tf.tidy(function() {
    return m.mul(x).add(b);
  });
}

function loss(prediction, labels) {
  //subtracts the two arrays & squares each element of the tensor then finds the mean.
  const error = prediction
    .sub(labels)
    .square()
    .mean();
  return error;
}
function train() {
  const learningRate = 0.005;
  const optimizer = tf.train.sgd(learningRate);

  optimizer.minimize(function() {
    const predsYs = predict(tf.tensor1d(trainX));
    console.log(predsYs);
    stepLoss = loss(predsYs, tf.tensor1d(trainY));
    console.log(stepLoss.dataSync()[0]);
    return stepLoss;
  });
  //plot();
}

async function processData(){
  await getFakeData();
  console.log('trainX', trainX);
  console.log('trainY', trainY);
  for (i = 0; i < 7; i++) {
    train();    //train multiple times
  }
}

const predictionsBefore = predict(tf.tensor1d(trainX));
processData();

