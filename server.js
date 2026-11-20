// obs-ingest: synthetic station-observation ingester for the GSL deployment POC (no real data).
const http = require("http");
const RELEASE = process.env.RELEASE || "v1";
const STATIONS = ["KBOU", "KDEN", "KSLC", "KSEA", "KMIA"];
const recent = [];

function ingestOnce() {
  const s = STATIONS[Math.floor(Math.random() * STATIONS.length)];
  recent.unshift({
    station: s,
    observed: new Date().toISOString(),
    temp_c: +(Math.random() * 35 - 5).toFixed(1),
    pressure_hpa: +(990 + Math.random() * 40).toFixed(1),
    synthetic: true,
  });
  if (recent.length > 50) recent.pop();
}
setInterval(ingestOnce, 10000);
ingestOnce();

http.createServer((req, res) => {
  const send = (code, body) => {
    res.writeHead(code, { "Content-Type": "application/json" });
    res.end(JSON.stringify(body));
  };
  if (req.url === "/healthz") return send(200, { status: "ok" });
  if (req.url === "/latest") return send(200, recent.slice(0, 10));
  return send(200, { service: "obs-ingest", release: RELEASE, ingested: recent.length, endpoints: ["/latest", "/healthz"] });
}).listen(8080, () => console.log(`obs-ingest ${RELEASE} listening on 8080`));
