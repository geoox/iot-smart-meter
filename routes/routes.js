const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const checkAuth = require('../middleware/check-auth');

const MeterData = require("../models/meter_data");
const User = require("../models/user");

router.get("/hello", (req, res, next) => {
  return res.status(200).json({
    message: "hello",
  });
});

router.post("/new_recording", (req, res, next) => {

  //TODO: add security key before post

  const newRecording = new MeterData({
    reading: req.body.reading,
    meter_id: req.body.meter_id,
    timestamp: req.body.timestamp,
    type: req.body.type,
  });

  newRecording
    .save()
    .then((result) => {
      return res.status(200).json({ result });
    })
    .catch((err) => res.status(500).json(err));
});

router.get("/data", checkAuth, async (req, res, next) => {

    const pageSize = req.query.size ? parseInt(req.query.size) : 10;

    const dataCount = await MeterData.countDocuments();
    const pageCount = Math.ceil(dataCount / pageSize);
  
    let page = parseInt(req.query.p);
    if (!page) { page = 1;}
    if (page > pageCount) {
        page = pageCount
    }
  
    MeterData.find()
      .sort({ timestamp : -1 })
      .skip(pageSize*(page-1))
      .limit(pageSize)
      .then((data) => {
        res.status(200).json({
          "page": page,
          "pageCount": pageCount,
          "data": data
        });
      })
      .catch((err) => res.status(500).json(err));

});

router.get("/real_data/:house_id", async (req, res, next) => {

  const pageSize = req.query.size ? parseInt(req.query.size) : 10;

  const dataCount = await MeterData.countDocuments({
    type: 0,
    meter_id: req.params.house_id
  });
  const pageCount = Math.ceil(dataCount / pageSize);

  let page = parseInt(req.query.p);
  if (!page) { page = 1;}
  if (page > pageCount) {
      page = pageCount
  }

  MeterData.find(
    {
      "meter_id": req.params.house_id,
      "type": 0
    }
  )
    .sort({ timestamp : -1 })
    .skip(pageSize*(page-1))
    .limit(pageSize)
    .then((data) => {
      res.status(200).json({
        "page": page,
        "pageCount": pageCount,
        "data": data
      });
    })
    .catch((err) => res.status(500).json(err));
});

router.get("/fake_data/:house_id", async (req, res, next) => {

  const pageSize = req.query.size ? parseInt(req.query.size) : 10;

  const dataCount = await MeterData.countDocuments({
    type: 1,
    meter_id: req.params.house_id
  });
  const pageCount = Math.ceil(dataCount / pageSize);

  let page = parseInt(req.query.p);
  if (!page) { page = 1;}
  if (page > pageCount) {
      page = pageCount
  }

  MeterData.find(
    {
      "meter_id": req.params.house_id,
      "type": 1
    }
  )
    .sort({ timestamp : -1 })
    .skip(pageSize*(page-1))
    .limit(pageSize)
    .then((data) => {
      res.status(200).json({
        "page": page,
        "pageCount": pageCount,
        "data": data
      });
    })
    .catch((err) => res.status(500).json(err));
});

router.get("/real_data", checkAuth, async (req, res, next) => {

  console.log("User data", req.userData);

  if(req.userData.user_role == 'customer'){

    const pageSize = req.query.size ? parseInt(req.query.size) : 10;

    const dataCount = await MeterData.countDocuments({
      type: 0,
      meter_id: req.userData.houses_id[0]
    });

    const pageCount = Math.ceil(dataCount / pageSize);
    let page = parseInt(req.query.p);
    if (!page) { page = 1;}
    if (page > pageCount) {
        page = pageCount
    }

    MeterData.find({
      "type": 0,
      "meter_id": req.userData.houses_id[0]
    })
    .sort({ timestamp : -1 })
    .skip(pageSize*(page-1))
    .limit(pageSize)
    .then((data) => {
      res.status(200).json({
        "page": page,
        "pageCount": pageCount,
        "data": data
      });
    })
    .catch((err) => res.status(500).json(err));

  } else if(req.userData.user_role == 'admin'){

    const pageSize = req.query.size ? parseInt(req.query.size) : 10;

    const dataCount = await MeterData.countDocuments({
      type: 0,
      meter_id:{
        $in: req.userData.houses_id
      }
    });

    const pageCount = Math.ceil(dataCount / pageSize);
    let page = parseInt(req.query.p);
    if (!page) { page = 1;}
    if (page > pageCount) {
        page = pageCount
    }

    MeterData.find({
      type: 0,
      meter_id:{
        $in: req.userData.houses_id
      }
    })
    .sort({ timestamp : -1 })
    .skip(pageSize*(page-1))
    .limit(pageSize)
    .then((data) => {
      res.status(200).json({
        "page": page,
        "pageCount": pageCount,
        "data": data
      });
    })
    .catch((err) => res.status(500).json(err));

  } else if(req.userData.user_role == 'supplier'){

    const dataCount = await MeterData.countDocuments({
      type: 0
    });
    const pageCount = Math.ceil(dataCount / pageSize);
  
    let page = parseInt(req.query.p);
    if (!page) { page = 1;}
    if (page > pageCount) {
        page = pageCount
    }

    MeterData.find({
      "type": 0
    })
    .sort({ timestamp : -1 })
    .skip(pageSize*(page-1))
    .limit(pageSize)
    .then((data) => {
      res.status(200).json({
        "page": page,
        "pageCount": pageCount,
        "data": data
      });
    })
    .catch((err) => res.status(500).json(err));
  } else {
    return res.status(401).json({message: "Unauthorized"})
  }
  
})

router.get("/fake_data", async (req,res,next) => {
  const pageSize = req.query.size ? parseInt(req.query.size) : 10;

  const dataCount = await MeterData.countDocuments({
    type: 1
  });
  const pageCount = Math.ceil(dataCount / pageSize);

  let page = parseInt(req.query.p);
  if (!page) { page = 1;}
  if (page > pageCount) {
      page = pageCount
  }

  MeterData.find({
    "type": 0
  })
  .sort({ timestamp : -1 })
  .skip(pageSize*(page-1))
  .limit(pageSize)
  .then((data) => {
    res.status(200).json({
      "page": page,
      "pageCount": pageCount,
      "data": data
    });
  })
  .catch((err) => res.status(500).json(err));
})

// Users handling

router.post('/register', (req, res, next) => {
  User.find({
      'username': req.body.username
  })
  .then(user => {
      if(user.length>=1){
          return res.status(409).json({
              message: "username already exists"
          })
      } else {
          bcrypt.hash(req.body.password, 10, (err, hash) => {
              if(err){
                  return res.status(500).json({
                      error: err
                  })
              } else {
                  const newUser = new User({
                      _id: new mongoose.Types.ObjectId(),
                      username: req.body.username,
                      password: hash,
                      user_role: req.body.user_role,
                      houses_id: req.body.houses_id
                  })
                  newUser.save()
                  .then(result => {
                      res.status(200).json(
                          {
                              'result': result
                          }
                      );
                  })
                  .catch(err => res.status(500).json({
                      error: err
                  }));
              }
          });
      }
  })
})

router.post('/login', (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  User.findOne({
      'username': username
  })
      .then(user => {
          if (user.length<1) {    
              res.status(401).json({ 
                "message": "Auth failed" 
              })
          } else {
              bcrypt.compare(password, user.password, (err, result) => {
                  if(err || !result){
                      return res.status(401).json({
                          "message": "Auth failed"
                      })
                  }
                  if(result){
                      const token = jwt.sign({
                          _id: user._id,
                          username: user.username,
                          user_role: user.user_role,
                          houses_id: user.houses_id
                      }, "jwt_pw", {
                          expiresIn:"1h"
                      })
                      return res.status(200).json({
                          message:"Auth successful",
                          token: token
                      })
                  }
              })
          }
      })
      .catch(err => {
          console.log(err);
          res.status(500).json({ error: err })
      })
})

module.exports = router;
