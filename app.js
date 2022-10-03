const http = require("http");
const PORT = 8080;

// a function which handles requests and sends response
// request.url stores the PATH, not the full URL
const requestHandler = function(request, response) {
  if (request.url === "/") {
    response.end("Welcome!");
  } else if (request.url === "/urls") {
    response.end("www.lighthouselabs.ca\nwww.google.com")
  } else {
    response.statusCode = 404;
    response.end("404 page not found")
  }
};

const server = http.createServer(requestHandler);

server.listen(PORT, () => {
  console.log(`Server listening on: http://localhost:${PORT}`);
});