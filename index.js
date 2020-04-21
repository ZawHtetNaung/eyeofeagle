'use strict';


// Imports dependencies and set up http server
const
  request = require('request'),
  express = require('express'),
  bodyParser = require('body-parser'),
  requestify = require('requestify'),
  firebase = require('firebase-admin'),
  ejs = require("ejs"),
  app = express().use(bodyParser.json()); // creates express http server

  const pageaccesstoken = process.env.PAGE_ACCESS_TOKEN;

app.set('view engine', 'ejs');
app.set('views', __dirname+'/views');



//firebase initialize
firebase.initializeApp({
  credential: firebase.credential.cert({
    "private_key": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    "client_email": process.env.FIREBASE_CLIENT_EMAIL,
    "project_id": process.env.FIREBASE_PROJECT_ID,
  }),
  databaseURL: "https://fir-b7a51.firebaseio.com"
});

let askUserName = false;
let askHotelName = false;
let askTransportationName = false;
let db = firebase.firestore();  

let user = {};
let orderRef;



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

//whitelist domains
//eg https://fbstarterbot.herokuapp.com/whitelists
app.get('/whitelists',function(req,res){    
    whitelistDomains(res);
});

  // Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

app.get('/test',function(req,res){
    //const sender_id = req.params.sender_id;
    res.render('test.ejs',{title:"Hi!! Eye of Eagle"});
});


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
              "text": "Mingalar bar. Welcome to Eye of Eagle travel and tour. Are you on trip?",
              "quick_replies":[
              {
                "content_type":"text",
                "title":"Yes, I am travel",
                "payload":"yes",
                "image_url":"http://example.com/img/red.png"
              },{
                "content_type":"text",
                "title":"No, plan to travel",
                "payload":"no",
                "image_url":"http://example.com/img/green.png"
              }/*,{
                "content_type":"text",
                "title":"Packages",
                "payload":"packages",
                "image_url":"http://example.com/img/green.png"
              },{
                "content_type":"text",
                "title":"extra functions",
                "payload":"extrafunctions",
                "image_url":"http://example.com/img/green.png"
              }*/
              ]
            }
          } 

          send(welcomeMessage);
        }


        if ( (userInput || userButton) && askHotelName == true ){

          let message = userInput || userButton;

          let n = message.indexOf("bookhotel:"); 

          if(n => 0){
            let hotelName = message.slice(10);
            
            /*
            let data = {
                "hotel": hotelName,          
             };

        
            let docRef = db.collection('orders').doc(orderRef);

               docRef.set(data, {merge:true});
        

            }    */        

          askHotelName = false;

          YangonPackage(webhook_event.sender.id);
        }
      }

        if ( (userInput || userButton) && askTransportationName == true ){

          let message = userInput || userButton;

          let n = message.indexOf("booktransportation:"); 

          if(n => 0){
            let transportationName = message.slice(n+1);

            user.transportation = transportationName;
            
            /*
            let data = {
                "transportation": transportationName,          
             };

        
            let docRef = db.collection('orders').doc(orderRef);

               docRef.set(data, {merge:true});
        
*/ 
            }           

          askTransportationName = false;

          YangonPackage(webhook_event.sender.id);
          console.log("yangon package function called");
        }

        if(userInput  && askUserName == true){

           user.name = userInput;
            /*
           let data = {
            "name": userInput,
          
            };

         

            db.collection('orders').add(data).then((ref)=>{
              orderRef = ref.id;
            });
            */
            askUserName = false;
        }

        if(userInput == "name" || quickdata == "name"){
           let askName = {
                "recipient":{
                  "id":webhook_event.sender.id
                },           
                "message":{
                  "text": "enter your name"              
                }
              } 

              askUserName = true;

              send(askName);   
        }


        if(userInput == "userinfo" ){
          console.log("USER INFO", user);
      }


      if(userInput == "hotel" || quickdata == "hotel"){
        let askHotel = {
          "recipient":{
            "id":webhook_event.sender.id
          },           
          "message":{
            "text": "enter hotel name"              
          }
        } 

        askHotelName = true;

        send(askHotel);
      }

      if(userInput == "transportation" || quickdata == "booktransportation"){
        let askTransportation = {
          "recipient":{
            "id":webhook_event.sender.id
          },           
          "message":{
            "text": "enter transportation name"              
          }
        } 

        askTransportationName = true;

        send(askTransportation);
      }
      //end of question
      


      if (userInput == 'Yes, I am travel' || quickdata == 'yes' ){
        let welcomeMessage = {
          "recipient":{
            "id":webhook_event.sender.id
          },
          "messaging_type": "RESPONSE",
          "message":{
            "text": "Are you ok with that trip?",
            "quick_replies":[
            {
              "content_type":"text",
              "title":"Ok",
              "payload":"ok",
              "image_url":"http://example.com/img/red.png"
            },{
              "content_type":"text",
              "title":"Not Ok",
              "payload":"notok",
              "image_url":"http://example.com/img/green.png"
            }/*,{
              "content_type":"text",
              "title":"more functions ",
              "payload":"morefunctions",
              "image_url":"http://example.com/img/green.png"
            },{
              "content_type":"text",
              "title":"about tour?",
              "payload":"abouttour",
              "image_url":"http://example.com/img/green.png"
            }*/
            ]
          }
        } 

        send(welcomeMessage);
      }
      //end of yes answer
        

      if (userInput == 'Ok' || quickdata == 'ok' ){
        let welcomeMessage = {
          "recipient":{
            "id":webhook_event.sender.id
          },
          "messaging_type": "RESPONSE",
          "message":{
            "text": "If you aren't ok you can create package by your self, you can choose youractivity by your self and then I will suggest and you don't know your place where you are. So you can send your location and I will be show the package and you can choose each package. ",
            "quick_replies":[
           {
              "content_type":"text",
              "title":"Show  packages",
              "payload":"sp",
              "image_url":"http://example.com/img/red.png"
            },{
              "content_type":"text",
              "title":"Customize Package",
              "payload":"cp",
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
      //end of ok by yes answer



      if (userInput == 'Not ok' || quickdata == 'notok' ){
        let welcomeMessage = {
          "recipient":{
            "id":webhook_event.sender.id
          },
          "messaging_type": "RESPONSE",
          "message":{
            "text": "Sorry to hear that. Is there anything you want to change during your trip",
            "quick_replies":[
            {
              "content_type":"text",
              "title":"Hotel option",
              "payload":"hp",
              "image_url":"http://example.com/img/red.png"
            },{
              "content_type":"text",
              "title":"Transportation option",
              "payload":"tp",
              "image_url":"http://example.com/img/green.png"
            },{
              "content_type":"text",
              "title":"Restaurants option",
              "payload":"rp",
              "image_url":"http://example.com/img/green.png"
            }
            ]
          }
        } 

        send(welcomeMessage);
      }
      //end of not ok by yes answer



        if (userInput == 'Hotel option' || quickdata == 'hp' ){
          let welcomeMessage = {
           "recipient":{
              "id":webhook_event.sender.id
           },
            "messaging_type": "RESPONSE",
            "message":{
             "text": "May I know your current city?",
              "quick_replies":[
             {
              "content_type":"text",
              "title":"Yangon",
              "payload":"yangon",
              "image_url":"http://example.com/img/red.png"
            },{
              "content_type":"text",
              "title":"Mandalay",
              "payload":"mandalay",
              "image_url":"http://example.com/img/green.png"
            },{
              "content_type":"text",
              "title":"Inlay ",
              "payload":"inlay",
              "image_url":"http://example.com/img/green.png"
            },{
              "content_type":"text",
              "title":"Taunggyi",
              "payload":"taunggyi",
              "image_url":"http://example.com/img/green.png"
            }
            ]
          }
        } 

        send(welcomeMessage);
      }
      //end of current city


       if (userInput == 'Yangon' || quickdata == "yangon" ){
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
                  "title":"Here are your hotel options",
                  "image_url":"https://r-cf.bstatic.com/images/hotel/max1024x768/181/181775739.jpg",
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
                        "payload":"height class hotel in yangon"
                      },{
                        "type":"postback",
                        "title":"Medium",
                        "payload":"medium hotel in yangon"
                      },{
                          "type":"postback",
                          "title":"Low Budget",
                          "payload":"low budget hotel in yangon"
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
      //end of hotel in yangon by yes answer


       if (userInput == 'No,  plan to travel' || quickdata == 'no' ){
            let welcomeMessage = {
              "recipient":{
                "id":webhook_event.sender.id
              },
              "messaging_type": "RESPONSE",
              "message":{
                "text": " May I know what kind of activity packages you want to do?",
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
                  "title":"Beaches",
                  "payload":"activity of beaches",
                  "image_url":"http://example.com/img/green.png"
                }
                ]
              }
            } 

            send(welcomeMessage);
      }
        //end of qucik reply for activity



      /*if (userInput == 'More functions' || quickdata == 'morefunctions' ){
        let welcomeMessage = {
          "recipient":{
            "id":webhook_event.sender.id
          },
          "messaging_type": "RESPONSE",
          "message":{
            "text": "I can do whatever you want about the tour packages. I can show the packages, you can create your own packages, you can choose your activity and I will suggest this.",
            "quick_replies":[
           {
              "content_type":"text",
              "title":"Show your packages",
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
      }*/
      //end of more functions by yes answe r
        


      /*if (userInput == 'About tour' || quickdata == 'abouttour' ){
        let welcomeMessage = {
          "recipient":{
            "id":webhook_event.sender.id
          },
          "messaging_type": "RESPONSE",
          "message":{
            "text": "Our tour isn't just like other packages because our tours and packages can create the new one by yourself, you can choose your activity and I will suggest this. ",
            "quick_replies":[
           {
              "content_type":"text",
              "title":"Show your packages",
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
      //end of about tour by yes answer*/
        



      if (userInput == 'Due to my package' || quickdata == 'duetomypackage' ){
        let welcomeMessage = {
          "recipient":{
            "id":webhook_event.sender.id
          },
          "messaging_type": "RESPONSE",
          "message":{
            "text": "What wrong with your package?",
            "quick_replies":[
            {
              "content_type":"text",
              "title":" create new one",
              "payload":"createnewone",
              "image_url":"http://example.com/img/red.png"
            },{
              "content_type":"text",
              "title":" Customize package",
              "payload":"cp",
              "image_url":"http://example.com/img/green.png"
            }/*,{
              "content_type":"text",
              "title":"want to join your package ",
              "payload":"wanttojoinyourpackage",
              "image_url":"http://example.com/img/green.png"
            },{
              "content_type":"text",
              "title":"want to change my package",
              "payload":"wantochangemypackage",
              "image_url":"http://example.com/img/green.png"
            }*/
            ]
          }
        } 

        send(welcomeMessage);
      }
      //end of due to my package by yes answer
        


     /* if (userInput == 'create new one' || quickdata == 'createnewone' ){
        let welcomeMessage = {
          "recipient":{
            "id":webhook_event.sender.id
          },
          "messaging_type": "RESPONSE",
          "message":{
            "text": "want to create new packages by yourself",
            "quick_replies":[
            {
              "content_type":"text",
              "title":"want to create",
              "payload":"wanttocreate",
              "image_url":"http://example.com/img/red.png"
            },{
              "content_type":"text",
              "title":"do not want",
              "payload":"donotwant",
              "image_url":"http://example.com/img/green.png"
            },{
              "content_type":"text",
              "title":"Choose another plan ",
              "payload":"chooseanotherplan",
              "image_url":"http://example.com/img/green.png"
            }
            ]
          }
        } 

        send(welcomeMessage);
      }*/
      //end of  create new one by yes answer
        



      if (userInput == 'Pagodas' || quickdata == 'activity of pagoda' ){
        let welcomeMessage = {
          "recipient":{
            "id":webhook_event.sender.id
          },
          "messaging_type": "RESPONSE",
          "message":{
            "text": "Which city do you want to go the pagodas?",
            "quick_replies":[
            {
              "content_type":"text",
              "title":"Pagodas in Yangon",
              "payload":"pagodasinyangon",
              "image_url":"http://example.com/img/red.png"
            },{
              "content_type":"text",
              "title":"Pagodas in Bago",
              "payload":"pagodasinbago",
              "image_url":"http://example.com/img/green.png"
            }
            ]
          }
        } 

        send(welcomeMessage); 
      }
      //end of pagodad in activity





     /* if (userInput == 'Create New One' || quickdata == 'createnewone' ){
        let welcomeMessage = {
          "recipient":{
            "id":webhook_event.sender.id
          },
          "messaging_type": "RESPONSE",
          "message":{
            "text": "Here It is! This is our packages and you whatever what you create that can create what you want! There is you can choose and buy the whole packags, you can create or customize your packages and final is you can choose your activity and then I will suggest you",
            "quick_replies":[
            {
              "content_type":"text",
              "title":"Choose your packages",
              "payload":"cyp",
              "image_url":"http://example.com/img/red.png"
            },{
              "content_type":"text",
              "title":"Customize Package",
              "payload":"cp",
              "image_url":"http://example.com/img/green.png"
            },{
              "content_type":"text",
              "title":"Choose activity",
              "payload":"ca",
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
      }*/
      //end of packages
        
     /* if (userInput == 'Show Packages' || quickdata =='sp' ){
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
      } */
      //end of Show packages



      /*if (userInput == 'Customize package' || quickdata =='cp' ){
        let welcomeMessage = {
          "recipient":{
            "id":webhook_event.sender.id
          },
          "messaging_type": "RESPONSE",
          "message":{
            "text": "Choose Your Location:",
          }
        } 


        let genericMessage = {
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
                    "title":"Yangon",
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
                      "title":"Choose",
                      "payload":"yg"
                    }

                    ]      
                  },{
                    "title":"Mandalay",
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
                      "title":"Choose",
                      "payload":"md"
                    }

                    ]      
                  }
                  ]
                }
              }
            }
          }

          //request

          requestify.post(`https://graph.facebook.com/v5.0/me/messages?access_token=${pageaccesstoken}`, 
          welcomeMessage
          ).then(response=>{
            console.log("ok welcome") //
          }).fail(error=> {
            console.log(error)
          })

          requestify.post(`https://graph.facebook.com/v5.0/me/messages?access_token=${pageaccesstoken}`, 
          genericMessage
          ).then(response=>{
            console.log("ok welcome") //
          }).fail(error=> {
            console.log(error)
          })




          //send(welcomeMessage);
      } */
      //end of Choose location


      /* if (userInput == 'Packages' || quickdata =='packages' ){
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
                      "payload":"pagodas"
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
                      "payload":"beaches"
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
                      "payload":"eachofstate"
                    }

                    ]      
                  }
                  ]
                }
              }
            }
          }
          send(welcomeMessage);
      } */
      //end of Customize your packages



     /* if (userInput == 'Customize My packages in Pagodas' || userButton =='cuyppagodas' ){
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
      } */
      //end of show your packages



      if (userInput == 'Yangon' || userButton == 'yg' ){
        //YangonPackage(webhook_event.sender.id);

        
        let welcomeMessage = {
          "recipient":{
            "id":webhook_event.sender.id
          },
          "messaging_type": "RESPONSE",
              "message":{
                "text": " Customize Your Packages: Yangon",
                "quick_replies":[
                 {
                  "content_type":"text",
                  "title":"Package",
                  "payload":"packages",
                  "image_url":"http://example.com/img/red.png"
                },
                {
                  "content_type":"text",
                  "title":"Hotel",
                  "payload":"hotelinyangon",
                  "image_url":"http://example.com/img/red.png"
                },{
                  "content_type":"text",
                  "title":"Transportation",
                  "payload":"transportationinyangon",
                  "image_url":"http://example.com/img/green.png"
                },{
                  "content_type":"text",
                  "title":"Guides",
                  "payload":"guidesinyangon",
                  "image_url":"http://example.com/img/green.png"
                },{
                  "content_type":"text",
                  "title":"Restaurants",
                  "payload":"restaurantsinyangon",
                  "image_url":"http://example.com/img/green.png"
                }
                ]
              }
            } 

            send(welcomeMessage);
      }
      //end of customize package by pagodas 
        



      if (userInput == 'Pagodas in Yangon' || quickdata == "pagodasinyangon" ){
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
                      "title":"Shwedagon",
                      "image_url":"https://osugamyanmartravels.com/wp-content/uploads/2018/04/shwedagon-pagoda-yangon-burma-myanmar.jpg",
                      "subtitle":"Choose the transportation what you want",
                      "default_action": {
                        "type": "web_url",
                        "url": "https://eyeofeagle.herokuapp.com",
                        "webview_height_ratio": "tall",
                      },
                      "buttons": [              
                          {
                            "type": "web_url",
                            "title": "create",
                            "url":"https://eyeofeagle.herokuapp.com/test",
                             "webview_height_ratio": "full",
                            "messenger_extensions": true,          
                          },
                          
                        ],
                    },{
                      "title":"Sule",
                      "image_url":"https://res.cloudinary.com/fleetnation/image/private/c_fit,w_1120/g_south,l_text:style_gothic2:%C2%A9%20Frank%20Bienewald%20,o_20,y_10/g_center,l_watermark4,o_25,y_50/v1545300898/svhcrxyne1pgny6hcy41.jpg",
                      "subtitle":"Choose the transportation what you want",
                      "default_action": {
                        "type": "web_url",
                        "url": "https://petersfancybrownhats.com/view?item=103",
                        "webview_height_ratio": "tall",
                      },
                      "buttons":[
                      {
                        "type":"postback",
                        "title":"Book",
                        "payload":"booksule"
                      }

                      ]      
                    },{
                      "title":"Kyauk Taw Gyi",
                      "image_url":"https://yangonlife.com.mm/sites/yangonlife.com.mm/files/styles/detail_page_main_image/public/article_images/IMG_6800.jpg?itok=xuQuCJ-l",
                      "subtitle":"Choose the transportation what you want",
                      "default_action": {
                        "type": "web_url",
                        "url": "https://petersfancybrownhats.com/view?item=103",
                        "webview_height_ratio": "tall",
                      },
                      "buttons":[
                      {
                        "type":"postback",
                        "title":"Book",
                        "payload":"bookkyauktawgyi"
                      }

                      ]      
                    },{
                      "title":"Yay ll Kyauk Tan",
                      "image_url":"https://yangonlife.com.mm/sites/yangonlife.com.mm/files/article_images/IMG_1381.JPG",
                      "subtitle":"Choose the transportation what you want",
                      "default_action": {
                        "type": "web_url",
                        "url": "https://petersfancybrownhats.com/view?item=103",
                        "webview_height_ratio": "tall",
                      },
                      "buttons":[
                      {
                        "type":"postback",
                        "title":"Book",
                        "payload":"bookyayllkyauktan"
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
        //end of customize by pagodas in yangon



     
      if (userInput == 'Hotel in yangon' || quickdata == "hotelinyangon" ){
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
                  "image_url":"https://r-cf.bstatic.com/images/hotel/max1024x768/181/181775739.jpg",
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
                        "payload":"height class hotel in yangon"
                      },{
                        "type":"postback",
                        "title":"Medium",
                        "payload":"medium hotel in yangon"
                      },{
                          "type":"postback",
                          "title":"Low Budget",
                          "payload":"low budget hotel in yangon"
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
    //end of customize by hotel in yangon
        
      
     

      if (userInput == 'Height Class in Yangon' || userButton == "height class hotel in yangon" ){
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
                        "title":"Sedona",
                        "image_url":"https://pix10.agoda.net/hotelImages/104/10489/10489_16102610240048128541.jpg?s=1024x768",
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
                          "payload":"bookhotel:sedona"
                        }

                        ]      
                      },
                      {
                        "title":"Lotte",
                        "image_url":"https://media-cdn.tripadvisor.com/media/photo-m/1280/18/2d/24/2a/lotte-hotel-yangon.jpg",
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
                          "payload":"bookhotel:lotte"
                        }

                        ]      
                      },
                      {
                        "title":"Inya Lake",
                        "image_url":"https://pix10.agoda.net/hotelImages/7459165/0/719512cfb65fdc4a659f8484edb9b921.jpg?s=1024x768",
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
                          "payload":"bookhotel:inyalake"
                        }

                        ]      
                      }
                  ]
                }
              }
            }
          }
          askHotelName = true;
          send(welcomeMessage);
      } 
        //end of customize by hotel booking in yangon
      



     /* if (userInput == 'Hotel' || quickdata == "hotel" ){
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
      } */
      //end of customize by hotel



      /*if (userInput == 'Book hotel' || userButton == "book hotel" ){
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
      } */
      //end of payment by book hotel
      

      if (userInput == 'Transportation' || quickdata == "transportationinyangon" ){
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
                          "payload":"carinyangon"
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
      

      if (userInput == 'Car' || userButton == "carinyangon" ){
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
                  "title":"Saloon",
                  "image_url":"https://3.bp.blogspot.com/-bEWPhIB3BeM/Tt4ufiYqVCI/AAAAAAAAAR8/71rXETMFZwQ/s1600/mazda6.jpg",
                  "subtitle":"4seats",
                  "default_action": {
                    "type": "web_url",
                    "url": "https://petersfancybrownhats.com/view?item=103",
                    "webview_height_ratio": "tall",
                  },
                  "buttons":[
                  {
                    "type":"postback",
                    "title":"Book",
                    "payload":"booktransportation:saloon"
                  }

                  ]      
                },  {
                  "title":"Alphat",
                  "image_url":"https://s1.cdn.autoevolution.com/images/gallery/TOYOTA-Alphard-697_17.jpg",
                  "subtitle":"6seats",
                  "default_action": {
                    "type": "web_url",
                    "url": "https://petersfancybrownhats.com/view?item=103",
                    "webview_height_ratio": "tall",
                  },
                  "buttons":[
                  {
                    "type":"postback",
                    "title":"Book",
                    "payload":"booktransportation:alphat"
                  }

                  ]      
                },{
                  "title":"Express",
                  "image_url":"https://www.thiwamontravel.com/wp-content/uploads/2019/01/highway-express-bus.png",
                  "subtitle":"30seats",
                  "default_action": {
                    "type": "web_url",
                    "url": "https://petersfancybrownhats.com/view?item=103",
                    "webview_height_ratio": "tall",
                  },
                  "buttons":[
                  {
                    "type":"postback",
                    "title":"Book",
                    "payload":"booktransportation:express"
                  }

                      ]      
                    }
                    ]
                  }
                }
              }
            }
            askTransportationName = true;
            send(welcomeMessage);
        //askTransportationName = true;
      } 
      //end of customize car by transportation in yangon
        
         
        
     



      /*if (userInput == 'Activity of Pagodas' || quickdata == "activity of pagoda" ){
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
      } */
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
            console.log("ok welcome") //
          }).fail(error=> {
            console.log(error)
          })
}

function YangonPackage(senderID){
    let welcomeMessage = {
            "recipient":{
              "id":senderID
            },
            "messaging_type": "RESPONSE",
            "message":{
              "text": " Customize Your Packages: Yangon",
              "quick_replies":[
               {
                "content_type":"text",
                "title":"Pagodas",
                "payload":"pagodasinyangon",
                "image_url":"http://example.com/img/red.png"
              },
              {
                "content_type":"text",
                "title":"Hotel",
                "payload":"hotelinyangon",
                "image_url":"http://example.com/img/red.png"
              },{
                "content_type":"text",
                "title":"Transportation",
                "payload":"transportationinyangon",
                "image_url":"http://example.com/img/green.png"
              },{
                "content_type":"text",
                "title":"Guides",
                "payload":"guidesinyangon",
                "image_url":"http://example.com/img/green.png"
              },{
                "content_type":"text",
                "title":"Restaurants",
                "payload":"restaurantsinyangon",
                "image_url":"http://example.com/img/green.png"
              }
              ]
            }
          } 

          send(welcomeMessage);

}

const whitelistDomains = (res) => {
  var messageData = {
          "whitelisted_domains": [
             "https://eyeofeagle.herokuapp.com" , 
             "https://herokuapp.com"                           
          ]               
  };  
  request({
      url: 'https://graph.facebook.com/v2.6/me/messenger_profile?access_token='+ pageaccesstoken,
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      form: messageData
  },
  function (error, response, body) {
      if (!error && response.statusCode == 200) {          
          res.send(body);
      } else {           
          res.send(body);
      }
  });
} 