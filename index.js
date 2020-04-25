'use strict';


// Imports dependencies and set up http server
const
  request = require('request'),
  express = require('express'),
  bodyParser = require('body-parser'),
  requestify = require('requestify'),
  firebase = require('firebase-admin'),
  ejs = require("ejs"),
  app = express(); // creates express http server
  
  const pageaccesstoken = process.env.PAGE_ACCESS_TOKEN;



app.set('view engine', 'ejs');
app.set('views', __dirname+'/views');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded());





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

app.get('/pagodasdetail',function(req,res){
    
    res.render('pagodasdetail.ejs');
});

app.get('/parksdetail',function(req,res){
    
    res.render('parksdetail.ejs');
});

app.get('/Customize-pagodas/:pagodascustomize/:sender_id',function(req,res){
    const sender_id = req.params.sender_id;
    const pagodascustomize = req.params.pagodascustomize;
    res.render('pagodascustomize.ejs',{title:"Customize-pagodas",sender_id:sender_id});
});

app.get('/Customize/:parks_customize/:sender_id',function(req,res){
    const sender_id = req.params.sender_id;
    const pagodascustomize = req.params.pagodascustomize;
    res.render('parks_customize.ejs',{title:"Customize",sender_id:sender_id});
});



app.get('/test/:title/:sender_id',function(req,res){
    const sender_id = req.params.sender_id;
    const title = req.params.title;
    res.render('addpackages.ejs',{title:title,sender_id:sender_id});
});

app.post('/pagodascustomize',function(req,res){
      
       console.log("FORMDATA",req.body)
      let destination= req.body.destination;
      let activities = req.body.activities;
      let guests = req.body.guests;
      let travel_mode = req.body.travel_mode;
      let travel_option = req.body.travel_option;
      let hotel = req.body.hotel;
      let restaurent= req.body.restaurent;
      let name  = req.body.name;
      let mobile = req.body.mobile;
      let sender = req.body.sender;  

     let booking_ref = generateRandom(5);    

      db.collection('Pagodas Booking').add({
           
            destination:destination,
            activities:activities,
            guests:guests,
            travel_mode:travel_mode,
            travel_option:travel_option,
            hotel:hotel,
            restaurent:restaurent,            
            name:name,
            mobile:mobile,
            booking_ref:booking_ref,
          }).then(success => {             
             ThankYouEagle(sender);    
          }).catch(error => {
            console.log(error);
      });        
});

app.post('/parks_customize',function(req,res){
      
       console.log("FORMDATA",req.body)
      let parks_trip= req.body.parks_trip;
      let transportation = req.body.transportation;
      let breakfast = req.body.breakfast;
      let lunch = req.body.lunch;
      let dinner = req.body.dinner;
      let hotel = req.body.hotel;
      let name= req.body.name;
      let mobile  = req.body.mobile;
      let sender = req.body.sender;  

     let booking_ref = generateRandom(5);    

      db.collection('Parks Booking').add({
           
            parks_trip:parks_trip,
            transportation:transportation,
            breakfast:breakfast,
            lunch:lunch,
            dinner:dinner,
            hotel:hotel,            
            name:name,
            mobile:mobile,
            booking_ref:booking_ref,
          }).then(success => {   
             console.log("DATASAVESHOWBOOKINGNUMBER");       
             showBookingNumber(sender,booking_ref); 

          }).catch(error => {
            console.log(error);
      });        
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
                "title":"I am travelling",
                "payload":"yes",
                "image_url":"http://example.com/img/red.png"
              },{
                "content_type":"text",
                "title":"Planning to travel",
                "payload":"no",
                "image_url":"http://example.com/img/green.png"
              }
              ]
            }
          } 

          send(welcomeMessage);
        }


       
          
         


      if (userInput == 'I am travelling' || quickdata == 'yes' ){
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
            }
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



       
        



      if (userInput == 'Planning to Travel' || quickdata == "no" ){
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
                            "title": "View Detail",
                            "url":"https://eyeofeagle.herokuapp.com/pagodasdetail/",
                             "webview_height_ratio": "full",
                            "messenger_extensions": true,          
                          },

                          {
                            "type": "web_url",
                            "title": "Customize",
                            "url":"https://eyeofeagle.herokuapp.com/Customize-Pagodas/Pagodas/"+webhook_event.sender.id,
                             "webview_height_ratio": "full",
                            "messenger_extensions": true,          
                          },
                          
                          
                        ],


                    },{
                      "title":"Parks",
                      "image_url":"https://yangondaytours.com/wp-content/uploads/2017/02/kandawgyi-park.jpg",
                      "subtitle":"Choose the transportation what you want",
                      "default_action": {
                        "type": "web_url",
                        "url": "https://petersfancybrownhats.com/view?item=103",
                        "webview_height_ratio": "tall",
                      },
                      "buttons": [   

                           {
                            "type": "web_url",
                            "title": "View Detail",
                            "url":"https://eyeofeagle.herokuapp.com/parksdetail/",
                             "webview_height_ratio": "full",
                            "messenger_extensions": true,          
                          },

                          {
                            "type": "web_url",
                            "title": "Customize",
                            "url":"https://eyeofeagle.herokuapp.com/Customize/Parks/"+webhook_event.sender.id,
                             "webview_height_ratio": "full",
                            "messenger_extensions": true,          
                          },
                          
                        ],
                    },{
                      "title":"Traditional",
                      "image_url":"https://www.mmtimes.com/sites/mmtimes.com/files/styles/mmtimes_ratio_c_normal_detail_image/public/news-images/music-1_3.jpg?itok=GFuo1VFo",
                      "subtitle":"Choose the transportation what you want",
                      "default_action": {
                        "type": "web_url",
                        "url": "https://petersfancybrownhats.com/view?item=103",
                        "webview_height_ratio": "tall",
                      },
                      "buttons": [              
                          {
                            "type": "web_url",
                            "title": "customize",
                            "url":"https://eyeofeagle.herokuapp.com/test/Shwedagon/"+webhook_event.sender.id,
                             "webview_height_ratio": "full",
                            "messenger_extensions": true,          
                          },
                          
                        ],
                    },{
                      "title":"Eating and Drinking",
                      "image_url":"https://coconuts.co/wp-content/uploads/2019/07/rosegarden-960x540.jpg",
                      "subtitle":"Choose the transportation what you want",
                      "default_action": {
                        "type": "web_url",
                        "url": "https://petersfancybrownhats.com/view?item=103",
                        "webview_height_ratio": "tall",
                      },
                      "buttons": [              
                          {
                            "type": "web_url",
                            "title": "Customize",
                            "url":"https://eyeofeagle.herokuapp.com/test/Shwedagon/"+webhook_event.sender.id,
                             "webview_height_ratio": "full",
                            "messenger_extensions": true,          
                          },
                          
                        ],
                    }

                    ]
                  }
                }
              }
            }
            send(welcomeMessage);
      } 
        //end of customize by pagodas in yangon

      if(userInput.includes("Change package:")){
        let ref_num = user_message.slice(15);
        ref_num = ref_num.trim();
        parks_update(sender_psid, ref_num);        
      }

     
     
         


         

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

const generateRandom = (length) => {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

const showBookingNumber = (sender_psid, ref) => { 
   
    let response = {
    "recipient":{
      "id":sender_psid,
    },           
    "message":{
      "text": `You aren't ok when you going to trip text this message (Change package:reference no) and your reference is ${ref}`,              
    }
  } 

 

  send(response);   
}

const parks_update = (sender_psid, ref_num) => {
    let response;
  response = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [{
            "title": "You are updating your booking number: " + ref_num,                       
            "buttons": [              
              {
                "type": "web_url",
                "title": "Update",
                "url":"https://fbstarterbot.herokuapp.com/updateprivatetour/"+ref_num+"/"+sender_psid,
                 "webview_height_ratio": "full",
                "messenger_extensions": true,          
              },
              
            ],
          }]
        }
      }
    }
  callSendAPI(sender_psid, response);

}