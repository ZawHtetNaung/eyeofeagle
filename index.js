'use strict';

// Imports dependencies and set up http server
const
  express = require('express'),
  bodyParser = require('body-parser'),
  requestify = require('requestify'),
  app = express().use(bodyParser.json()); // creates express http server

  const pageaccesstoken = 'EAAlHWK8zlGABAHFMuwu5ZAXIXZCNcSlpZBbBOYI7zg2qGx1ZB1cWRJQM1QjM5UYzTBaLpPiHt4lEpk1ZAteXOo5J1H3lhVQT2mjvzZAyNWQUYz5ShP0UsIV5E6aVuRKXlMGfSZCX5OJiIJcMstlVlpc0W4KlbaBtotEJq9XlM9QVUZBbrCNq57SE'

  /*
  requestify.post(`https://graph.facebook.com/v5.0/me/messenger_profile?access_token=${pageaccesstoken}`, 
  {
    "get_started": {
      "payload": "Hi"
    },
    "greeting": [
      {
        "locale":"default",
        "text":"Hello {{user_first_name}}!" 
      }, {
        "locale":"en_US",
        "text":"Welcome To Your Trip."
      }
    ]
  }
).then( response => {
  console.log(response)
}).fail( error => {
  console.log(error)
})*/

  // Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {

    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = "zawgyee"
      
    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];
      
    // Checks if a token and mode is in the query string of the request
    if (mode && token) {
    
      // Checks the mode and token sent is correct
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        
        // Responds with the challenge token from the request
        console.log('WEBHOOK_VERIFIED');
        res.status(200).send(challenge);
      
      } else {
        // Responds with '403 Forbidden' if verify tokens do not match
        res.sendStatus(403);      
      }
    }
  });

// Creates the endpoint for our webhook 
app.post('/webhook', (req, res) => {  
 
    let body = req.body;
  
    // Checks this is an event from a page subscription
    if (body.object === 'page') {
  
      // Iterates over each entry - there may be multiple if batched
      body.entry.forEach(function(entry) {
  
        // Gets the message. entry.messaging is an array, but 
        // will only ever contain one message, so we get index 0
        let webhook_event = entry.messaging[0];
        console.log(webhook_event);

        if(webhook_event.message){
          if(webhook_event.message.quick_reply){
          var quickdata = webhook_event.message.quick_reply.payload;
          console.log("quickdata:", quickdata);
          }else{
            var userInput = webhook_event.message.text;
          }         
        
        }
        
        if(webhook_event.postback){
          var userButton = webhook_event.postback.payload
        }
        
        if (userInput == 'Hi' || userButton == 'Hi' ){
          let welcomeMessage = {
            "recipient":{
              "id":webhook_event.sender.id
            },
            "messaging_type": "RESPONSE",
            "message":{
              "text": "Are you on trip?",
              "quick_replies":[
              {
                "content_type":"text",
                "title":"Yes",
                "payload":"yes",
                "image_url":"http://example.com/img/red.png"
              },{
                "content_type":"text",
                "title":"No",
                "payload":"no",
                "image_url":"http://example.com/img/green.png"
              },{
                "content_type":"text",
                "title":"Just Check It",
                "payload":"cya",
                "image_url":"http://example.com/img/green.png"
              },{
                "content_type":"text",
                "title":"Want to know about your tour?",
                "payload":"wakayt",
                "image_url":"http://example.com/img/green.png"
              }
              ]
            }
          } 

          send(welcomeMessage);
        }
        //end of question
        if (userInput == 'Packages' || userButton == 'packages' ){
          let welcomeMessage = {
            "recipient":{
              "id":webhook_event.sender.id
            },
            "messaging_type": "RESPONSE",
            "message":{
              "text": "Packages:",
              "quick_replies":[
              {
                "content_type":"text",
                "title":"Choose your packages",
                "payload":"cyp",
                "image_url":"http://example.com/img/red.png"
              },{
                "content_type":"text",
                "title":"Customize Your Package",
                "payload":"cuyp",
                "image_url":"http://example.com/img/green.png"
              },{
                "content_type":"text",
                "title":"Choose your activity",
                "payload":"cya",
                "image_url":"http://example.com/img/green.png"
              },{
                "content_type":"text",
                "title":"detail",
                "payload":"detail",
                "image_url":"http://example.com/img/green.png"
              }
              ]
            }
          } 

          send(welcomeMessage);
        }
        //end of started
        
         if (userInput == 'Choose Your Package' || quickdata =='cyp' ){
          let welcomeMessage = {
           "recipient":{
            "id":webhook_event.sender.id
          },
          "message":{
            "attachment":{
              "type":"template",
              "payload":{
                "template_type":"generic",
                "elements":[
                {
                  "title":"Pagodas",
                  "image_url":"https://cdn.getyourguide.com/img/tour_img-1174626-148.jpg",
                  "subtitle":"package",
                  "default_action": {
                    "type": "web_url",
                    "url": "https://petersfancybrownhats.com/view?item=103",
                    "webview_height_ratio": "tall",
                  },
                  "buttons":[
                  {
                    "type":"postback",
                    "title":"Book",
                    "payload":"book"
                  }

                  ]      
                },{
                  "title":"Beaches",
                  "image_url":"https://www.sonicstartravel.com/car_rental/uploads/article/article_17102805421002.jpg",
                  "subtitle":"package",
                  "default_action": {
                    "type": "web_url",
                    "url": "https://petersfancybrownhats.com/view?item=103",
                    "webview_height_ratio": "tall",
                  },
                  "buttons":[
                  {
                    "type":"postback",
                    "title":"Book",
                    "payload":"book"
                  }

                  ]      
                },{
                  "title":"Each of state",
                  "image_url":"https://www.uncharted-horizons-myanmar.com/sites/uncharted-horizons-myanmar.com/files/styles/tour/public/tour-images/chinstate-48.jpg?itok=cfo4S4q0",
                  "subtitle":"package",
                  "default_action": {
                    "type": "web_url",
                    "url": "https://petersfancybrownhats.com/view?item=103",
                    "webview_height_ratio": "tall",
                  },
                  "buttons":[
                  {
                    "type":"postback",
                    "title":"Book",
                    "payload":"book"
                  }

                  ]      
                }
                ]
              }
            }
          }
        }
        send(welcomeMessage);
          
        } 
        //end of Choose your packages
        if (userInput == 'Customize Your package' || quickdata =='cuyp' ){
          let welcomeMessage = {
           "recipient":{
            "id":webhook_event.sender.id
          },
          "message":{
            "attachment":{
              "type":"template",
              "payload":{
                "template_type":"generic",
                "elements":[
                {
                  "title":"Pagodas",
                  "image_url":"https://cdn.getyourguide.com/img/tour_img-1174626-148.jpg",
                  "subtitle":"package",
                  "default_action": {
                    "type": "web_url",
                    "url": "https://petersfancybrownhats.com/view?item=103",
                    "webview_height_ratio": "tall",
                  },
                  "buttons":[
                  {
                    "type":"postback",
                    "title":"Customize Your Packages",
                    "payload":"cuyppagodas"
                  }

                  ]      
                },{
                  "title":"Beaches",
                  "image_url":"https://www.sonicstartravel.com/car_rental/uploads/article/article_17102805421002.jpg",
                  "subtitle":"package",
                  "default_action": {
                    "type": "web_url",
                    "url": "https://petersfancybrownhats.com/view?item=103",
                    "webview_height_ratio": "tall",
                  },
                  "buttons":[
                  {
                    "type":"postback",
                    "title":"Customize Your Packages",
                    "payload":"cuypbeaches"
                  }

                  ]      
                },{
                  "title":"Each of state",
                  "image_url":"https://www.uncharted-horizons-myanmar.com/sites/uncharted-horizons-myanmar.com/files/styles/tour/public/tour-images/chinstate-48.jpg?itok=cfo4S4q0",
                  "subtitle":"package",
                  "default_action": {
                    "type": "web_url",
                    "url": "https://petersfancybrownhats.com/view?item=103",
                    "webview_height_ratio": "tall",
                  },
                  "buttons":[
                  {
                    "type":"postback",
                    "title":"Customize Your Packages",
                    "payload":"cuypeachofstate"
                  }

                  ]      
                }
                ]
              }
            }
          }
        }
        send(welcomeMessage);
          
        } 
        //end of Customize your packages
        if (userInput == 'Customize My packages in Pagodas' || userButton =='cuyppagodas' ){
          let welcomeMessage = {
           "recipient":{
            "id":webhook_event.sender.id
          },
          "message":{
            "attachment":{
              "type":"template",
              "payload":{
                "template_type":"generic",
                "elements":[
                {
                  "title":"Pagodas in Yangon",
                  "image_url":"https://cdn.getyourguide.com/img/tour_img-1174626-148.jpg",
                  "subtitle":"package",
                  "default_action": {
                    "type": "web_url",
                    "url": "https://petersfancybrownhats.com/view?item=103",
                    "webview_height_ratio": "tall",
                  },
                  "buttons":[
                  {
                    "type":"postback",
                    "title":"Customize Your Packages",
                    "payload":"cuyppagodasinyangon"
                  }

                  ]      
                },{
                  "title":"Pagodas in Bago",
                  "image_url":"https://imageofmyanmartravel.com/wp-content/uploads/2019/04/Imageofmyanmar_four-buddha-images.jpg",
                  "subtitle":"package",
                  "default_action": {
                    "type": "web_url",
                    "url": "https://petersfancybrownhats.com/view?item=103",
                    "webview_height_ratio": "tall",
                  },
                  "buttons":[
                  {
                    "type":"postback",
                    "title":"Customize Your Packages",
                    "payload":"cyppagodasinbago"
                  }

                  ]      
                },{
                  "title":"Pagodas in Mandalay",
                  "image_url":"https://upload.wikimedia.org/wikipedia/commons/3/3d/Mahamuni_Image.JPG",
                  "subtitle":"package",
                  "default_action": {
                    "type": "web_url",
                    "url": "https://petersfancybrownhats.com/view?item=103",
                    "webview_height_ratio": "tall",
                  },
                  "buttons":[
                  {
                    "type":"postback",
                    "title":"Customize Your Packages",
                    "payload":"cuyppagodasinmandalay"
                  }

                  ]      
                }
                ]
              }
            }
          }
        }
        send(welcomeMessage);
          
        } 
        //end of show your packages
        if (userInput == 'Customize My package Pagoda in Yangon' || userButton == 'cuyppagodasinyangon' ){
          let welcomeMessage = {
            "recipient":{
              "id":webhook_event.sender.id
            },
            "messaging_type": "RESPONSE",
            "message":{
              "text": " Customize Your Packages:",
              "quick_replies":[
               {
                "content_type":"text",
                "title":"Pagodas in Yangon",
                "payload":"pagodasinyangon",
                "image_url":"http://example.com/img/red.png"
              },
              {
                "content_type":"text",
                "title":"Hotel in Yangon",
                "payload":"hotelinyangon",
                "image_url":"http://example.com/img/red.png"
              },{
                "content_type":"text",
                "title":"Transportation in Yangon",
                "payload":"transportationinyangon",
                "image_url":"http://example.com/img/green.png"
              },{
                "content_type":"text",
                "title":"Guides in Yangon",
                "payload":"guidesinyangon",
                "image_url":"http://example.com/img/green.png"
              },{
                "content_type":"text",
                "title":"Restaurants in Yangon",
                "payload":"restaurantsinyangon",
                "image_url":"http://example.com/img/green.png"
              }
              ]
            }
          } 

          send(welcomeMessage);
        }
        //end of customize package by pagodas 
         if (userInput == 'Hotel' || quickdata == "hotel" ){
          let welcomeMessage = {
           "recipient":{
            "id":webhook_event.sender.id
          },
          "message":{
            "attachment":{
              "type":"template",
              "payload":{
                "template_type":"generic",
                "elements":[
                {
                  "title":"Hotel",
                  "image_url":"https://homepages.cae.wisc.edu/~ece533/images/boat.png",
                  "subtitle":"Choose the hotel what you want",
                  "default_action": {
                    "type": "web_url",
                    "url": "https://petersfancybrownhats.com/view?item=103",
                    "webview_height_ratio": "tall",
                  },
                  "buttons":[
                  {
                    "type":"postback",
                    "title":"High Class",
                    "payload":"height class hotel"
                  },{
                    "type":"postback",
                    "title":"Medium",
                    "payload":"medium hotel"
                  },{
                    "type":"postback",
                    "title":"Low Budget",
                    "payload":"low budget hotel"
                  }

                  ]      
                }
                ]
              }
            }
          }
        }
        send(welcomeMessage);
        
      } 
      //end of customize by hotel
       if (userInput == 'Transportation' || quickdata == "transportation" ){
          let welcomeMessage = {
           "recipient":{
            "id":webhook_event.sender.id
          },
          "message":{
            "attachment":{
              "type":"template",
              "payload":{
                "template_type":"generic",
                "elements":[
                {
                  "title":"Car",
                  "image_url":"https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcS9_6xLJh2OhELLHP-msYiU3Rzuyxb9Pv9HHyAF1LVg9NUu5TE2",
                  "subtitle":"Choose the transportation what you want",
                  "default_action": {
                    "type": "web_url",
                    "url": "https://petersfancybrownhats.com/view?item=103",
                    "webview_height_ratio": "tall",
                  },
                  "buttons":[
                  {
                    "type":"postback",
                    "title":"Customize",
                    "payload":"customizecar"
                  }

                  ]      
                },{
                  "title":"Train",
                  "image_url":"https://static01.nyt.com/images/2017/05/20/world/01myanmar-train-2/01myanmar-train-2-jumbo.jpg",
                  "subtitle":"Choose the transportation what you want",
                  "default_action": {
                    "type": "web_url",
                    "url": "https://petersfancybrownhats.com/view?item=103",
                    "webview_height_ratio": "tall",
                  },
                  "buttons":[
                  {
                    "type":"postback",
                    "title":"Customize",
                    "payload":"customizetrain"
                  }

                  ]      
                },{
                  "title":"Ship",
                  "image_url":"https://d23n7ahjfnjotp.cloudfront.net/imgs/mobileheaderipad/ship_521_myanmar_1024x416_mobhdr.jpg",
                  "subtitle":"Choose the transportation what you want",
                  "default_action": {
                    "type": "web_url",
                    "url": "https://petersfancybrownhats.com/view?item=103",
                    "webview_height_ratio": "tall",
                  },
                  "buttons":[
                  {
                    "type":"postback",
                    "title":"Customize",
                    "payload":"customizeship"
                  }

                  ]      
                },{
                  "title":"Flight",
                  "image_url":"https://static.tripzilla.com/thumb/7/6/65398_700x.jpg",
                  "subtitle":"Choose the transportation what you want",
                  "default_action": {
                    "type": "web_url",
                    "url": "https://petersfancybrownhats.com/view?item=103",
                    "webview_height_ratio": "tall",
                  },
                  "buttons":[
                  {
                    "type":"postback",
                    "title":"Customize",
                    "payload":"customizeflight"
                  }

                  ]      
                }

                ]
              }
            }
          }
        }
        send(welcomeMessage);
        
      } 
     // end of customize by transportation
     

       if (userInput == 'Height Class' || userButton == "height class hotel" ){
          let welcomeMessage = {
           "recipient":{
            "id":webhook_event.sender.id
          },
          "message":{
            "attachment":{
              "type":"template",
              "payload":{
                "template_type":"generic",
                "elements":[
                    {
                      "title":"Hotel in Inle",
                      "image_url":"https://homepages.cae.wisc.edu/~ece533/images/boat.png",
                      "subtitle":"You can book here",
                      "default_action": {
                        "type": "web_url",
                        "url": "https://petersfancybrownhats.com/view?item=103",
                        "webview_height_ratio": "tall",
                      },
                      "buttons":[
                      {
                        "type":"postback",
                        "title":"Book",
                        "payload":"book hotel"
                      }

                      ]      
                    },
                    {
                      "title":"Hotel in Kalaw",
                      "image_url":"https://homepages.cae.wisc.edu/~ece533/images/boat.png",
                      "subtitle":"You can book here",
                      "default_action": {
                        "type": "web_url",
                        "url": "https://petersfancybrownhats.com/view?item=103",
                        "webview_height_ratio": "tall",
                      },
                      "buttons":[
                      {
                        "type":"postback",
                        "title":"Book",
                        "payload":"book hotel"
                      }

                      ]      
                    },
                    {
                      "title":"Hotel in Taung Gyi",
                      "image_url":"https://homepages.cae.wisc.edu/~ece533/images/boat.png",
                      "subtitle":"You can book here",
                      "default_action": {
                        "type": "web_url",
                        "url": "https://petersfancybrownhats.com/view?item=103",
                        "webview_height_ratio": "tall",
                      },
                      "buttons":[
                      {
                        "type":"postback",
                        "title":"Book",
                        "payload":"book hotel"
                      }

                      ]      
                    }
                ]
              }
            }
          }
        }
        send(welcomeMessage);
        
      } 
      //end of customize by hotel booking
       if (userInput == 'Book' || userButton == "book hotel" ){
          let welcomeMessage = {
           "recipient":{
            "id":webhook_event.sender.id
          },
          "message":{
            "attachment":{
              "type":"template",
              "payload":{
                "template_type":"generic",
                "elements":[
                {
                  "title":"Payment",
                  
                  "subtitle":"Choose your payment",
                  "default_action": {
                    "type": "web_url",
                    "url": "https://petersfancybrownhats.com/view?item=103",
                    "webview_height_ratio": "tall",
                  },
                  "buttons":[
                  {
                    "type":"postback",
                    "title":"Pay Deposit",
                    "payload":"part of payment"
                  },{
                    "type":"postback",
                    "title":"All of the Payment",
                    "payload":"all payment"
                  },{
                    "type":"postback",
                    "title":"Cancel",
                    "payload":"cancel"
                  }

                  ]      
                }
                ]
              }
            }
          }
        }
        send(welcomeMessage);
        
      } 
      //end of payment by book hotel
        
         
        
         if (userInput == 'Choose my activity' || quickdata == 'cya' ){
          let welcomeMessage = {
            "recipient":{
              "id":webhook_event.sender.id
            },
            "messaging_type": "RESPONSE",
            "message":{
              "text": " Choose Your Activity:",
              "quick_replies":[
              {
                "content_type":"text",
                "title":"Pagodas",
                "payload":"activity of pagoda",
                "image_url":"http://example.com/img/red.png"
              },{
                "content_type":"text",
                "title":"Hiking",
                "payload":"activity of hiking",
                "image_url":"http://example.com/img/green.png"
              },{
                "content_type":"text",
                "title":"Adventures",
                "payload":"activity of adventures",
                "image_url":"http://example.com/img/green.png"
              },{
                "content_type":"text",
                "title":"Waterfall",
                "payload":"activity of waterfall",
                "image_url":"http://example.com/img/green.png"
              }
              ]
            }
          } 

          send(welcomeMessage);
        }
        //end of qucik reply for activity
        if (userInput == 'Pagodas' || quickdata == "activity of pagoda" ){
          let welcomeMessage = {
           "recipient":{
            "id":webhook_event.sender.id
          },
          "message":{
            "attachment":{
              "type":"template",
              "payload":{
                "template_type":"generic",
                "elements":[
                {
                  "title":"Bagan",
                  "image_url":"https://www.nickkembel.com/wp-content/uploads/2019/09/shwesandaw-pagoda-bagan.jpg",
                  "subtitle":"Activity",
                  "default_action": {
                    "type": "web_url",
                    "url": "https://petersfancybrownhats.com/view?item=103",
                    "webview_height_ratio": "tall",
                  },
                  "buttons":[
                  {
                    "type":"postback",
                    "title":"Choose your packages",
                    "payload":"cypbagan"
                  }

                  ]      
                },  {
                  "title":"Inle",
                  "image_url":"https://www.tripsavvy.com/thmb/F_jVBYfJVJCVMiuNp-zsq43Adog=/3865x2576/filters:no_upscale():max_bytes(150000):strip_icc()/phaung-daw-oo-pagoda--inle-lake--myanmar--836634414-5b0a3bbe8023b9003678f8c7.jpg",
                  "subtitle":"Activity",
                  "default_action": {
                    "type": "web_url",
                    "url": "https://petersfancybrownhats.com/view?item=103",
                    "webview_height_ratio": "tall",
                  },
                  "buttons":[
                  {
                    "type":"postback",
                    "title":"Choose your packages",
                    "payload":"cypinle"
                  }

                  ]      
                },{
                  "title":"Bago",
                  "image_url":"https://previews.123rf.com/images/sepavo/sepavo1601/sepavo160100017/50218055-bago-myanmar-at-kambawzathardi-golden-palace-.jpg",
                  "subtitle":"Activity",
                  "default_action": {
                    "type": "web_url",
                    "url": "https://petersfancybrownhats.com/view?item=103",
                    "webview_height_ratio": "tall",
                  },
                  "buttons":[
                  {
                    "type":"postback",
                    "title":"Choose your packages",
                    "payload":"cypbago"
                  }

                  ]      
                }
                ]
              }
            }
          }
        }
        send(welcomeMessage);
        
      } 
        //end of customize activity for pagodas
        if (userInput == 'Hiking' || quickdata == "activity of hiking" ){
          let welcomeMessage = {
           "recipient":{
            "id":webhook_event.sender.id
          },
          "message":{
            "attachment":{
              "type":"template",
              "payload":{
                "template_type":"generic",
                "elements":[
                {
                  "title":"Kalaw",
                  "image_url":"https://images.squarespace-cdn.com/content/v1/5005c43024ac90096800ff2d/1490436625536-EM1L7N08PT62B5JK98WS/ke17ZwdGBToddI8pDm48kDFd-zkWuSQbD2rhL7rk6Kh7gQa3H78H3Y0txjaiv_0fDoOvxcdMmMKkDsyUqMSsMWxHk725yiiHCCLfrh8O1z5QPOohDIaIeljMHgDF5CVlOqpeNLcJ80NK65_fV7S1UcR2Y7LpJqS8RvbDfsBcx_lQtT37MY1GbJzzrnia8tQKV1D9ytEOYPF5EokCoVRdEg/viewpoint+kalaw+trek+Ywar+Thit",
                  "subtitle":"Activity",
                  "default_action": {
                    "type": "web_url",
                    "url": "https://petersfancybrownhats.com/view?item=103",
                    "webview_height_ratio": "tall",
                  },
                  "buttons":[
                  {
                    "type":"postback",
                    "title":"Choose your packages",
                    "payload":"cypkalaw"
                  }

                  ]      
                },{
                  "title":"Tan Taung Gyi",
                  "image_url":"https://upload.wikimedia.org/wikipedia/commons/7/77/Than_Daung_Gyi%2C_Myanmar_%28Burma%29_-_panoramio_%284%29.jpg",
                  "subtitle":"Activity",
                  "default_action": {
                    "type": "web_url",
                    "url": "https://petersfancybrownhats.com/view?item=103",
                    "webview_height_ratio": "tall",
                  },
                  "buttons":[
                  {
                    "type":"postback",
                    "title":"Choose your packages",
                    "payload":"cyptantaunggyi"
                  }

                  ]      
                },{
                  "title":"Chin Mountains",
                  "image_url":"https://media2.trover.com/T/5afac155025f622c7001c77b/fixedw_large_4x.jpg",
                  "subtitle":"Activity",
                  "default_action": {
                    "type": "web_url",
                    "url": "https://petersfancybrownhats.com/view?item=103",
                    "webview_height_ratio": "tall",
                  },
                  "buttons":[
                  {
                    "type":"postback",
                    "title":"Choose your packages",
                    "payload":"cypchinmountain"
                  }

                  ]      
                }
                ]
              }
            }
          }
        }
        send(welcomeMessage);
        
      } 
      //end of customize activity for hiking

        
        if (quickdata == 'detail' ){
          let welcomeMessage = {
           "recipient":{
            "id":webhook_event.sender.id
          },
          "message":{
            "attachment":{
              "type":"template",
              "payload":{
                "template_type":"generic",
                "elements":[
                {
                  "title":"About",
                  "image_url":"https://homepages.cae.wisc.edu/~ece533/images/boat.png",
                  "subtitle":"You can choose your favourite package and activity and then other best way is you can customize your package",
                  "default_action": {
                    "type": "web_url",
                    "url": "https://petersfancybrownhats.com/view?item=103",
                    "webview_height_ratio": "tall",
                  },
                 
                }
                ]
              }
            }
          }
        }
        send(welcomeMessage) ;
          
        } 
        //end of detil
         


         

      });
  
      // Returns a '200 OK' response to all requests
      res.status(200).send('EVENT_RECEIVED');
    } else {
      // Returns a '404 Not Found' if event is not from a page subscription
      res.sendStatus(404);
    }
  
  });

function send(welcomeMessage){
  requestify.post(`https://graph.facebook.com/v5.0/me/messages?access_token=${pageaccesstoken}`, 
          welcomeMessage
          ).then(response=>{
            console.log(response)
          }).fail(error=> {
            console.log(error)
          })
}