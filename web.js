let http = require("http");
let https = require("https");
let server = http.createServer();

server.on("request", function (req, res) {
  console.log(
    "HTTP",
    req.httpVersion,
    req.method,
    req.url,
    req.headers["user-agent"]
  );
  console.log("header: ", req.headers);

  // CORS全許可
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  // ignore url
  if (req.url.indexOf("/favicon.ico") === 0) {
    let response = {};
    res.writeHead(404, { "Content-Type": "application/json" });
    res.write(JSON.stringify(response));
    res.end();
    return;
  }

  // OPTIONSメソッドは無条件で正常応答(エラー応答時のCORSエラーを防ぐため)
  if (req.method === "OPTIONS") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end();
    return;
  }

  body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });
  req.on("end", () => {
    console.log("body: ", body);

    // スタブ応答
    if (req.url.indexOf("/api") === 0) {
      console.log("[API] Called ", req.url);
      let response = {};
      res.writeHead(200, { "Content-Type": "application/json" });
      res.write(JSON.stringify(response));
      res.end();
      return;
    }
    host = "127.0.0.1";
    port = 3000;
    method = req.method;
    path = "/api/";
    content = "json";
    protocol = port == 443 ? https : http;

    let options = {
      host: host,
      port: port,
      method: method,
      path: path,
    };

    let payload = body ? body : null;
    options.headers = {
      "Content-Type": "application/json",
    };

    options.headers["user-agent"] = "API Test Client";
    if (req.headers["authorization"]) {
      options.headers["authorization"] = req.headers["authorization"];
    }

    const reqApi = protocol.request(options, function (resApi) {
      var body = "";
      resApi.on("data", (chunk) => {
        body += chunk;
      });
      resApi.on("end", () => {
        console.log("StatusCode: ", resApi.statusCode);
        console.log("Response Headers: ", resApi.headers);
        console.log("Response Body: ", body);
        res.writeHead(resApi.statusCode, resApi.headers);
        res.write(body);
        res.end();
      });
    });
    reqApi.on("error", function (e) {
      console.log("[ERROR][API]" + e.message);
      let response = {};
      res.writeHead(500, { "Content-Type": "application/json" });
      res.write(JSON.stringify(response));
      res.end();
    });
    if (payload) {
      reqApi.write(payload);
    }
    reqApi.end();
  });
});

console.log("http://127.0.0.1:3000/");
server.listen(3000, "127.0.0.1");
