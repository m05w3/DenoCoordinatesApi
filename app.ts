// File: app.ts

import { Drash } from "https://deno.land/x/drash/mod.ts";
import { Client } from "https://deno.land/x/mysql/mod.ts";

const client = await new Client().connect({
  hostname: "hostname",
  username: "username",
  db: "db",
  password: "password",
});

class leggi extends Drash.Http.Resource {
  static paths = ["/Positions/all"];
  public async GET() {
    const pos = await client.query(`select * from Positions`);
    this.response.headers.set("Access-Control-Allow-Origin", "*");
    this.response.body = JSON.stringify(pos);

    return this.response;
  }
}
class leggilast extends Drash.Http.Resource {
  static paths = ["/Positions/last"];
  public async GET() {
    
    const pos = await client.query(`select * from Positions p inner join ( select vehicle, max(date) as MaxDate from Positions group by vehicle ) tm on p.vehicle = tm.vehicle and p.date = tm.MaxDate inner join ( select vehicle, max(hour) as MAxhour from Positions group by vehicle ) tx on p.vehicle = tx.vehicle and p.hour = tx.Maxhour`);
    this.response.headers.set("Access-Control-Allow-Origin", "*");
    this.response.body = JSON.stringify(pos);

    return this.response;
  }
}

class leggipar extends Drash.Http.Resource {
  static paths = ["/Positions/vehicle"];
  public async GET() {
    console.log(this.request.getUrlQueryParam("vei"));
    const pos = await client.query(`select * from Positions where vehicle="`+this.request.getUrlQueryParam("vei")+`"`);
    this.response.headers.set("Access-Control-Allow-Origin", "*");
    this.response.body = JSON.stringify(pos);

    return this.response;
  }
}


class inserisci extends Drash.Http.Resource {
  static paths = ["/Positions"];
  public async POST() {
    console.log(`${this.request.getBodyParam("vehicle")}
${this.request.getBodyParam("latitude")} 
${this.request.getBodyParam("longitude")}`);
   
    let result = await client.execute(
      `INSERT INTO Positions(vehicle,date,hour,latitude,longitude) values(?,?,?,?,?)`,
      [
        this.request.getBodyParam("vehicle"),
        this.request.getBodyParam("date"),
        this.request.getBodyParam("hour"),
        this.request.getBodyParam("latitude"),
        this.request.getBodyParam("longitude"),
      ]
    );

    this.response.body = "POST request received!";
    return this.response;
  }
}

const server = new Drash.Http.Server({
  response_output: "text/html",
  resources: [leggi, inserisci,leggilast,leggipar],
});

server.runTLS({
  hostname: "192.168.1.110",
  port: 1337,
  certFile:"./x.cert",
  keyFile: "./x.key"
});

console.log("Server listening: https://192.168.1.110:1337");
