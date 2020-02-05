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
              "text": " Packages:",
              "quick_replies":[
              {
                "content_type":"text",
                "title":"Choose your packages",
                "payload":"cyp",
                "image_url":"http://example.com/img/red.png"
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
        //end of packages
        
         if (userInput == 'cyp' || quickdata =='cyp' ){
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
                  "title":"Pagoda",
                  "image_url":"https://homepages.cae.wisc.edu/~ece533/images/boat.png",
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
                    "payload":"cyps"
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
         
         if (userInput == 'cya' || quickdata == "cya" ){
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
                  "title":"Pagoda",
                  "image_url":"https://homepages.cae.wisc.edu/~ece533/images/boat.png",
                  "subtitle":"Activity",
                  "default_action": {
                    "type": "web_url",
                    "url": "https://petersfancybrownhats.com/view?item=103",
                    "webview_height_ratio": "tall",
                  },
                  "buttons":[
                  {
                    "type":"postback",
                    "title":"Pagoda",
                    "payload":"choose your activity"
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
        //end of choose your activity
        
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
        send(welcomeMessage);
          
        } 
        //end of detil
         if (userInput == 'Customize Your Packages' || userButton == 'cyps' ){
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
                "title":"Hotel",
                "payload":"hotel",
                "image_url":"http://example.com/img/red.png"
              },{
                "content_type":"text",
                "title":"Transportation",
                "payload":"transportation",
                "image_url":"http://example.com/img/green.png"
              },{
                "content_type":"text",
                "title":"Guides",
                "payload":"guide",
                "image_url":"http://example.com/img/green.png"
              },{
                "content_type":"text",
                "title":"Restaurants",
                "payload":"restaurants",
                "image_url":"http://example.com/img/green.png"
              }
              ]
            }
          } 

          send(welcomeMessage);
        }
        //end of customize 
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
                    "title":"Height Class",
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
                }
                ]
              }
            }
          }
        }
        send(welcomeMessage);
        
      } 
      //end of customize by hotel booking


         

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