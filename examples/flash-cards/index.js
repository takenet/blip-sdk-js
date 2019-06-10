import * as BlipSdk from 'blip-sdk';
import WebSocketTransport from 'lime-transport-websocket'

let Lime = require('lime-js');

// Put your identifier and access key here
let IDENTIFIER = 'caracrachabotsdk';
let ACCESS_KEY = 'bjJOYnp6Z3Z3eHVyNTNGNW4zUHo=';

// Create a client instance passing the identifier and accessKey of your chatbot
let client = new BlipSdk.ClientBuilder()
    .withIdentifier(IDENTIFIER)
    .withAccessKey(ACCESS_KEY)
    .withTransportFactory(() => new WebSocketTransport())
    .build();

// Connect with server asynchronously
// Connection will occurr via websocket on 8081 port.
client.connect() // This method return a 'promise'.
    .then(function(session) {
        // Connection success. Now is possible send and receive envelopes from server. */
    })
    .catch(function(err) { /* Connection failed. */ });

var fs = require("fs");
var jsonData = fs.readFileSync("people.json");
var jsonContent = JSON.parse(jsonData);
var qtyPeople = Object.keys(jsonContent.peoples).length;
var states = []; 
var name = []; 
var qtyQuestions = []; 
var hits = []; 
var answer = []; 
var question = [];
var wrongs = [];
var selectedNumbers = [];
var messageCarousel = [];
selectedNumbers.fill(false);

client.addMessageReceiver((m) => m.type != 'application/vnd.lime.chatstate+json', function(message) {
    if (states[message.from] == "qtyQuestions"){
        name[message.from] = message.content; 
        stateMachine(states[message.from], message.from); 
    
    }else if (states[message.from] == "questions"){
        if ((typeof qtyQuestions[message.from] == 'undefined') || qtyQuestions[message.from] == -1){
            if (isNaN(Number(message.content)) || message.content > qtyPeople || message.content < 0 ){ 
                client.sendMessage({
                    id: Lime.Guid(),
                    to: message.from, 
                    type: "text/plain", 
                    content: "Iiiih, tenho paciência pra esse tanto de gente não. Tenta outro número!"
                })
                states[message.from] = "qtyQuestions";
                stateMachine(states[message.from], message.from);
            }else{
                qtyQuestions[message.from] = message.content;
                messageCarousel[message.from] =  {
                    id: Lime.Guid(),
                    type: "application/vnd.lime.collection+json",
                    to: message.from,
                    content: {
                        itemType: "application/vnd.lime.document-select+json",
                        items: [ ] 
                    } 
                  }; 
                hits[message.from] = 0;
                stateMachine(states[message.from], message.from);
            }
           
        }else{ 
            answer[message.from] = message.content.toLowerCase();
            var patt = new RegExp(answer[message.from]);
            var res = patt.test(question[message.from].Name.toLowerCase());
                if (res){
                    hits[message.from]++;
                    wrongs[message.from].pop();
                }
            if (qtyQuestions[message.from] == 0){
               states[message.from] = "result";
            } 
            stateMachine(states[message.from], message.from);
        }
   
    }else if (typeof states[message.from] === 'undefined'){
        selectedNumbers[message.from] = new Array(qtyPeople);
        wrongs[message.from] = new Array();
        states[message.from] = "new"; 
        stateMachine("new", message.from);

    
    }else if (states[message.from] == 'new'){ 
        stateMachine("new", message.from);
    
    }else if (states[message.from] == 'result'){ 
        if (message.content == "sim" || message.content == "Sim"){
            hits[message.from] = 0;
            selectedNumbers[message.from].fill(false);
            states[message.from] = "qtyQuestions";
            stateMachine(states[message.from], message.from);
        }else{
            states[message.from] = "exceptions"; 
            stateMachine(states[message.from], message.from);
        }
    
    }else{ 
        states[message.from] = "exceptions"; 
        stateMachine(states[message.from], message.from);
    }
   
});

function stateMachine(currentState, from){ 
    switch(currentState){
        case "new": 
            client.sendMessage({
                id: Lime.Guid(),
                to: from, 
                type: "text/plain", 
                content: "Olá, meu nome é Severino, o porteiro da Take 💁"
            })

            setTimeout(function() {client.sendMessage({
                id: Lime.Guid(),
                type: "application/vnd.lime.media-link+json",
                to: from,
                content: {
                  type: "image/jpeg",
                  uri: "https://cdn.revistaw3.com.br/base/7ce/8ee/dd7/986-545-severino.jpg",
                  aspectRatio: "1:1",
                  size: 227791,
                  previewUri: "https://cdn.revistaw3.com.br/base/7ce/8ee/dd7/986-545-severino.jpg",
                  previewType: "image/jpeg"
                }
              })}, 1000);

              setTimeout(function () {client.sendMessage({
                id: Lime.Guid(),
                to: from, 
                type: "text/plain", 
                content: "Eu tava ali no portão só no..."
            })}, 2000);

            setTimeout(function (){client.sendMessage({
                id: Lime.Guid(),
                type: "application/vnd.lime.media-link+json",
                to: from,
                content: {
                  type: "image/gif",
                  uri: "https://media1.tenor.com/images/33779e237e09cac95e79eea654f8743b/tenor.gif?itemid=9107145",
                  aspectRatio: "1:1",
                  size: 227791,
                  previewUri: "https://media1.tenor.com/images/33779e237e09cac95e79eea654f8743b/tenor.gif?itemid=9107145",
                  previewType: "image/gif"
                }
              })}, 3000);

            setTimeout(function(){client.sendMessage({
                id: Lime.Guid(),
                to: from, 
                type: "text/plain", 
                content: "... Quando o Dr. começou a gritar: SEVERINOOOO, SEVERINOOO"
            })}, 4000);  

            setTimeout(function(){client.sendMessage({
                id: Lime.Guid(),
                to: from, 
                type: "text/plain", 
                content: "Pedindo pra eu vir aqui e ajudar esse povo a fazer o meu trabalho, cê acredita? "
            })}, 5000);

            setTimeout(function(){client.sendMessage({
                id: Lime.Guid(),
                to: from, 
                type: "text/plain", 
                content: "Vou te testar aqui. Vou te mostrar uns crachás e você me fala o nome."
            })
            }, 6000); 

            setTimeout(function(){client.sendMessage({
                id: Lime.Guid(),
                to: from, 
                type: "text/plain", 
                content: "Primeiro, me fala o seu nome"
            })}, 7000); 
            states[from] = "qtyQuestions";
            break;
            
        case "qtyQuestions":
            setTimeout(function(){client.sendMessage({
                id: Lime.Guid(),
                to: from, 
                type: "text/plain", 
                content: "Olá " + name[from] + " , quantas pessoas você acha que consegue acertar?"
            })}, 1000);
            states[from] = "questions";  
            break; 
        
        case "questions":
                question[from] = getPersonByRandomNumber(from);
                client.sendMessage({
                    id: Lime.Guid(),
                    type: "application/vnd.lime.media-link+json",
                    to: from,
                    content: {
                      type: "image/jpeg",
                      uri: question[from].Uri,
                      aspectRatio: "1:1",
                      size: 227791,
                      previewUri: question[from].Uri,
                      previewType: "image/jpeg"
                    }
                  });

                client.sendMessage({
                    id: Lime.Guid(),
                    to: from, 
                    type: "text/plain", 
                    content: "Quem é essa pessoa?"
                })
                if(qtyQuestions[from] > 0){
                    qtyQuestions[from]--;
                    break;
                }else{
                    states[from] = "result";
                    stateMachine(states[from], from);
                }
                break; 
                
        case "result":
                setTimeout(function(){client.sendMessage({
                    id: Lime.Guid(),
                    to: from, 
                    type: "text/plain", 
                    content: name[from] +  " você acertou " + hits[from] + " !!! "
                })}, 1000); 

                if (wrongs[from].length > 0){
                    getPeopleByNumbers(from, wrongs);
                    sendCarousel(from);
                }

                setTimeout(function(){client.sendMessage({
                    id: Lime.Guid(),
                    to: from, 
                    type: "text/plain", 
                    content: "Gostaria de recomeçar? 😝"
                })}, 8000); 
                
                
                qtyQuestions[from] = -1;
                selectedNumbers[from].fill(false);
                wrongs[from] = [];
                messageCarousel[from] = [];
                break; 
                

        case "exceptions": 
            client.sendMessage({
                id: Lime.Guid(), 
                type: "application/vnd.lime.media-link+json",
                to: from,
                content: {
                    type: "image/gif",
                    uri: "https://media1.tenor.com/images/ac6eb2f3121b1de4eceb54c3595d96d9/tenor.gif?itemid=12336648",
                    aspectRatio: "1:1",
                    size: 227791,
                    previewUri: "https://media1.tenor.com/images/ac6eb2f3121b1de4eceb54c3595d96d9/tenor.gif",
                    previewType: "image/gif"
                }
          });
            states[from] = "new";
            break; 
                    
    }
}

function getPersonByRandomNumber(from){ 
        var number = Math.floor((Math.random() * qtyPeople));
        while(selectedNumbers[from][number] == true){
            var number = Math.floor((Math.random() * qtyPeople));
        }
       selectedNumbers[from][number] = true;
       wrongs[from].push(number);
       return jsonContent.peoples[number];
       
}

function getPeopleByNumbers(from, wrongs){
    wrongs[from].forEach(function(value){
        generateJsonCarousel(from, jsonContent.peoples[value].Name, jsonContent.peoples[value].Uri);
    });
}

function generateJsonCarousel(from, Name, Uri){
    messageCarousel[from].content.items.push({ 
        header: { 
            type: "application/vnd.lime.media-link+json", 
            value: { 
                title: Name,  
                type: "image/jpeg", 
                uri: Uri 
            }
        },
        options: [
            {
                label: {
                    type: "application/vnd.lime.web-link+json",
                    value: {
                        title: "Procurar no Workplace",
                        uri: "https://take.facebook.com/search/top/?q=" + Name
                    }
                }
            }
        ]
    });
    return messageCarousel[from];
}

function sendCarousel(from){
    setTimeout(function(){
        client.sendMessage({
        id: Lime.Guid(),
        to: from, 
        type: "text/plain", 
        content: "Desanima não! Toma aqui os nomes da galera que você errou! 😁"
        }); 
    }, 2000);
    client.sendMessage(messageCarousel[from]);
}