var http = require('http');
var url = require('url');
var fs = require('fs');
var apiai = require('apiai');

// Dialogflow testing
const client = new apiai("50af121b5c0440038f66ec6f3dacb0e9");
// const promise = client.textRequest(query);
// // deals with the response from Dialogflow
// promise
//   .then(handleResponse)
//   .catch(handleError);

function handleResponse(serverResponse) {
  console.log(serverResonse);
}
function handleError(serverError) {
  console.log(serverError);
}

//run java files
function runFile() {
    var jre = require('node-jre');
    var output = jre.spawnSync(
        ['./webdir'],   //directory file
        'Test',     //file  name
        [''],   //command line parameters
        { encoding: 'utf8'}
    ).stdout.trim();
    return output;  // System.out.println() is outputted from the java program and stored in this variable
}

// Host the server
var app = http.createServer(function (req, res) {

    var filePath = "";
    var urlRequest = url.parse(req.url).pathname;
    var temp = urlRequest.lastIndexOf(".");
    var extension = urlRequest.substring((temp + 1));

    filePath = urlRequest.replace("/", "");
    if (filePath === "") filePath = 'index.html';

    fs.readFile(filePath, function(error, data) {      // Reads file and stores data
        if (error) {
            res.writeHead(404);
            res.write(error.toString());
            res.end();
        }
        else {
            if (extension === 'html') res.writeHead(200, {'Content-Type': 'text/html'});    // Writes the header
            else if (extension === 'css') res.writeHead(200, {'Content-Type': 'text/css'});
            else if (extension === 'js') res.writeHead(200, {'Content-Type': 'text/javascript'});
            else if (extension === 'woff') res.writeHead(200, {'Content-Type': 'application/font-woff'});
            else if (extension === 'woff2') res.writeHead(200, {'Content-Type': 'application/font-woff2'});
            else { 
                console.log("NO CORRECT EXTENSION");
            }
            console.log(extension);
            res.write(data.toString());
            //res.write(runFile());   // Execute function and returns html
            res.end();
        }
    });
});

// Listens to the web server to respond to client requests
var io = require('socket.io').listen(app);

// function to be called which sends the client the current time.
function sendTime() {
    io.emit('time', {time: new Date().toJSON() });
}

setInterval(sendTime, 10000);

// Responds to a client connection
io.on('connection', function(socket) {
    socket.emit('welcome', { message: 'Welcome!', id: socket.id }); // Sends to the client

    socket.on('i am client', console.log);  // Recieves from the client

    // Recieves the text the user has inputted as a query, and then sends the response to Dialogflow
    socket.on('send query', function(data) {
      var query = client.textRequest(data.query, {sessionId: '10010110'});  // Sending the response
      // If a response is recieved, then perform the function
      query.on('response', function(response) {
        console.log(response);
      })
      // If an error is recieved, run this function
      query.on('error', function(error) {
        console.log(error);
      })
      query.end();
    })
});

app.listen(8080);  //the server object listens on port 8080
