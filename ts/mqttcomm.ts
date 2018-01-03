import * as Mqtt from "mqtt";
import { ConfigJSON } from './donglebundle';
import { triggerAsyncId } from "async_hooks";

var HOST = '139.219.184.44';
var PORT = '1884';
var CLIENT_ID = 'light-GW-';
const CODE = "server1234";

// mqtt client setting
var SETTINGS = {
    keepalive: 1000,
    protocolId: 'MQIsdp',
    protocolVersion: 3,
    clientId: CLIENT_ID,
    username: 'client3',
    password: 'ruff5678'
};


export class MqttComm {
    public client;
    public bOnline: boolean;
    private username: string;


    constructor(objConfig: ConfigJSON) {
        console.log("mqttcomm init");
        this.username = objConfig.Servername;
        this.bOnline = false;
    }
    public start() {
        this.client = Mqtt.connect(
            HOST + ":" + PORT,
            {
                keepalive: 1000,
                protocolId: "MQIsdp",
                protocolVersion: 3,
                clientId: CLIENT_ID + this.username,
                username: this.username,
                password: CODE,
            },
        );
        this.client.on("close", () => {
            console.log("MQTT to server closed:" + HOST);
            this.bOnline = false;

            setTimeout(() => {
                this.start();
            }, 100000);
        });
        this.client.on("error", (err) => {
            console.log("MQTT server, error");
            console.log(err);

        });
        this.client.on("connect", () => {
            console.log("\nMQTT server Connected" + HOST + "\n");
            this.bOnline = true;
        });
    }
}
