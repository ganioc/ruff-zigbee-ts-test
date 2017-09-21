

/*

 start = 0x1
 end = 0x3
 data = [0x2, 0x44, 0xa6, 0x1, 0x1, 0x1]
 msgType = 146 = 0x92 (OnOff)
 msgLen = 0x6
 crc = 0x92 ^ 0x6 ^ 0x2 ^ 0x44 ^ 0xa6 ^ 0x1 ^ 0x1 ^ 0x1 = 0x75

 -----------------------------------------------------------------------------------
 |  0x1  |   0x92   |   0x6   |  0x75 |   0x2, 0x44, 0xa6, 0x1, 0x1, 0x1   |  0x3  |
 -----------------------------------------------------------------------------------
 | start | msgType  |  msgLen |  crc  |              Data                  |  stop |
 -----------------------------------------------------------------------------------

 0x00 0x92 -> 0x2 0x10^0x00 0x92

 ------------------------------------------------------------------------------------------------------------
 |  0x1  | 0x2 0x10 0x92 | 0x2 0x10 0x2 0x16 | 0x75 | 0x2 0x12 0x44 0xa6 0x2 0x11 0x2 0x11 0x2 0x11 |  0x3  |
 ------------------------------------------------------------------------------------------------------------
 | start |     msgType   |      msgLen       | crc  |                  Data                         |  stop |
 ------------------------------------------------------------------------------------------------------------

 */

import Events = require("events");
import { ProtocolSegment } from './zigbee_utils';
//import { Dongle } from "./dongle";

// hex to ascii
function stringifyMessage(msg: string[]): string {
    var temp = msg.map(function (e) {
        return Number('0x' + e);
    });
    var temp2 = Buffer.from(temp);
    return temp2.toString('ascii');
}
function getEntries(msg: string[], entryLength: number): string[] {
    var entries: string[];
    var entry: string;
    entries = [];
    entry = "";
    //var tempStr: string;
    for (var i = 0; i < msg.length; i += entryLength) {
        entry = msg.slice(i, i + entryLength).join('');
        entries.push('0x' + entry);

    }
    return entries;
}

export interface MessageAnnounce {
    msgType: string,
    shortAddress: string,
    IEEEAddress: string,
    macCapability: string,
    dongleSerial: string
}
export interface MessageStatusResponse {
    msgType: string,
    responseStatus: string,
    sequenceNumber: string,
    packetType: string,
    dongleSerial: string
}
export interface MessageLog {
    msgType: string,
    logLevel: string,
    logMessage: string,
    dongleSerial: string

}
export interface MessageNodeClusterAttributeList {
    msgType: string,
    sourceEndpoint: string,
    profileID: string,
    clusterID: string,
    attributeList: string[],
    dongleSerial: string
}
export interface MessageNodeCommandIDList {
    msgType: string,
    sourceEndpoint: string,
    profileID: string,
    clusterID: string,
    commandIDList: string[],
    dongleSerial: string,
}
export interface MessageNonFactoryNewReset {
    msgType: string,
    status: string,
    dongleSerial: string,
}
export interface MessageVersionList {
    msgType: string,
    majorVersionNumber: string,
    installerVersionNumber: string,
    dongleSerial: string,
}
export interface MessageDefaultResponse {
    msgType: string,
    sequenceNumber: string,
    endPoint: string,
    clusterID: string,
    commandID: string,
    statusCode: string,
    dongleSerial: string,

}
export interface MessageAttributeReport {
    msgType: string,
    sequenceNumber: string,
    shortAddress: string,
    endPoint: string,
    clusterID: string,
    attributeID: string,
    attributeStatus: string,
    responseType: string,
    responseData: string,
    attributeSize: number,
    attributeType: string,
    attributeData: string,
    status: string,
    dongleSerial: string,
}
export interface MessageReadAttributeResponse {
    msgType: string,
    sequenceNumber: string,
    shortAddress: string,
    endPoint: string,
    clusterID: string,
    attributeID: string,
    attributeStatus: string,
    attributeType: string,
    attributeSize: string,
    status: string;
    dongleSerial: string;
}
export interface MessageNetworkJoinedOrFormed {
    msgType: string,
    status: string,
    shortAddress: string,
    IEEEAddress: string,
    channel: string
    dongleSerial: string
}
export interface MessageLeaveIndication {
    msgType: string,
    IEEEAddress: string,
    rejoinStatues: string,
    dongleSerial: string
}
export class Interpreter {

    emitter: Events.EventEmitter;

    constructor() {
        this.emitter = new Events.EventEmitter();

    };

    handleMessage(dongleSerial: string, message: ProtocolSegment) {
        if (message.valid) {
            switch (message.MsgType) {
                case '0x004d':
                    this.emitter.emit('handleDeviceAnnounce',
                        this.handleDeviceAnnounce(dongleSerial, message.MsgContent));
                    break;
                case '0x8000':
                    this.emitter.emit('handleStatusResponse',
                        this.handleStatusResponse(dongleSerial, message.MsgContent));
                    break;
                case '0x8001':
                    this.emitter.emit('handleLogMessage',
                        this.handleLogMessage(dongleSerial, message.MsgContent));
                    break;
                case '0x8004':
                    this.emitter.emit('handleNodeClusterAttributeList',
                        this.handleNodeClusterAttributeList(dongleSerial, message.MsgContent));
                    break;
                case '0x8005':
                    this.emitter.emit('handleNodeCommandIDList',
                        this.handleNodeCommandIDList(dongleSerial, message.MsgContent));
                    break;
                case '0x8006':
                    this.emitter.emit('handleNonFactoryNewReset',
                        this.handleNonFactoryNewReset(dongleSerial, message.MsgContent));
                    break;
                case '0x8010':
                    this.emitter.emit('handleVersionList',
                        this.handleVersionList(dongleSerial, message.MsgContent));
                    break;
                case '0x8101':
                    this.emitter.emit('handleDefaultResponse',
                        this.handleDefaultResponse(dongleSerial, message.MsgContent));
                    break;
                case '0x8102':
                    this.emitter.emit('handleAttributeReport',
                        this.handleAttributeReport(dongleSerial, message.MsgContent));
                    break;
                case '0x8100':
                    this.emitter.emit('handleReadAttributeResponse',
                        this.handleReadAttributeResponse(dongleSerial, message.MsgContent));
                    //return handleReadAttributeResponse(message.MsgContent);
                    break;
                case '0x8024':
                    this.emitter.emit('handleNetworkJoinedOrFormed',
                        this.handleNetworkJoinedOrFormed(dongleSerial, message.MsgContent));
                    break;
                case '0x8048':
                    this.emitter.emit('handleLeaveIndication',
                        this.handleLeaveIndication(dongleSerial, message.MsgContent));
                    break;
                default:
                    console.log("\nUnhandled message type:" + message.MsgType);
                    console.log(message + "\n\n");

                    break;
            }

        }
    }
    handleDeviceAnnounce(dongleSerial: string, msg: string[]): MessageAnnounce {
        let result;
        result = new Object();
        result.msgType = 'Device Announce';
        result.shortAddress = ('0x' + msg[0] + msg[1]);
        result.IEEEAddress = ('0x' + msg.slice(2, 2 + 8).join(''));
        result.macCapability = Number('0x' + msg[10]).toString(2);
        result.dongleSerial = dongleSerial;
        console.log("deviceAnnounce\n")
        console.log(result);
        console.log("\n")
        return <MessageAnnounce>result;

    }
    handleStatusResponse(dongleSerial: string, msg: string[]): MessageStatusResponse {
        let statusList = ['Success', 'Incorrect parameters', 'Unhandled command',
            'Command failed', 'Busy', 'Stack already started', 'Failed'
        ];
        let result;
        result = new Object();
        result.msgType = 'Status Response';
        let status = Number('0x' + msg[0]);
        result.responseStatus = statusList[status < 6 ? status : 6];
        result.sequenceNumber = ('0x' + msg[1]);
        result.packetType = ('0x' + msg[2] + msg[3]);
        result.dongleSerial = dongleSerial;
        console.log("\n")
        console.log(result);
        console.log("\n")
        return <MessageStatusResponse>result;
    }
    handleLogMessage(dongleSerial: string, msg: string[]): MessageLog {
        let logLevel = ['Emergency', 'Alert', 'Critical', 'Error', 'Warning',
            'Notice', 'Information', 'Debug'
        ];
        let result;
        result = new Object();
        result.msgType = 'Log Message';
        result.logLevel = logLevel[Number('0x' + msg[0])];
        result.logMessage = stringifyMessage(msg.slice(1));
        result.dongleSerial = dongleSerial;
        console.log("\n")
        console.log(result);
        console.log("\n")
        return <MessageLog>result;
    }
    handleNodeClusterAttributeList(dongleSerial: string, msg: string[]): MessageNodeClusterAttributeList {
        var result;
        result = new Object();
        result.msgType = 'Node Cluster Attribute List';
        result.sourceEndpoint = ('0x' + msg[0]);
        result.profileID = ('0x' + msg[1] + msg[2]);
        result.clusterID = ('0x' + msg[3] + msg[4]);
        result.attributeList = getEntries(msg.slice(5), 2);
        result.dongleSerial = dongleSerial;
        console.log("\n")
        console.log(result);
        console.log("\n")
        return <MessageNodeClusterAttributeList>result;
    }
    handleNodeCommandIDList(dongleSerial: string, msg: string[]): MessageNodeCommandIDList {
        let result;
        result = new Object();
        result.msgType = 'Node Command ID List';
        result.sourceEndpoint = ('0x' + msg[0]);
        result.profileID = ('0x' + msg[1] + msg[2]);
        result.clusterID = ('0x' + msg[3] + msg[4]);
        result.commandIDList = getEntries(msg.slice(5), 1);
        result.dongleSerial = dongleSerial;
        console.log("\n")
        console.log(result);
        console.log("\n")
        return <MessageNodeCommandIDList>result;
    }
    handleNonFactoryNewReset(dongleSerial: string, msg: string[]): MessageNonFactoryNewReset {
        let statusList = ['STARTUP', 'WAIT_START', 'NFN_START', 'DISCOVERY',
            'NETWORK_INIT', 'RESCAN', 'RUNNING'
        ];
        let result;
        result = new Object();
        result.msgType = 'Non "Factory New" Reset';
        result.status = statusList[Number('0x' + msg[0])];
        result.dongleSerial = dongleSerial;
        console.log("\n")
        console.log(result);
        console.log("\n")
        return <MessageNonFactoryNewReset>result;
    }
    handleVersionList(dongleSerial: string, msg: string[]): MessageVersionList {
        let result;
        result = new Object();
        result.msgType = 'Version List';
        result.majorVersionNumber = ('0x' + msg[0] + msg[1]);
        result.installerVersionNumber = ('0x' + msg[2] + msg[3]);
        result.dongleSerial = dongleSerial;
        console.log(result);

        return <MessageVersionList>result;
    }
    handleDefaultResponse(dongleSerial: string, msg: string[]): MessageDefaultResponse {
        let result;
        result = new Object();
        result.msgType = 'Default Response';
        result.sequenceNumber = ('0x' + msg[0]);
        result.endPoint = ('0x' + msg[1]);
        result.clusterID = ('0x' + msg[2] + msg[3]);
        result.commandID = ('0x' + msg[4]);
        result.statusCode = ('0x' + msg[5]);
        result.dongleSerial = dongleSerial;
        console.log("\n")
        console.log(result);
        console.log("\n")
        return <MessageDefaultResponse>result;
    }
    handleAttributeReport(dongleSerial: string, msg: string[]): MessageAttributeReport {
        let result;
        result = new Object();
        console.log('attribute handle: ' + msg);

        result.msgType = 'Attribute Report';
        result.sequenceNumber = ('0x' + msg[0]);
        result.shortAddress = ('0x' + msg[1] + msg[2]);
        result.endPoint = ('0x' + msg[3]);
        result.clusterID = ('0x' + msg[4] + msg[5]);
        result.attributeID = ('0x' + msg[6] + msg[7]);

        if (msg.length < 13) {
            result.attributeStatus = ('0x' + msg[8]);
            result.responseType = ('0x' + msg[9]);
            result.responseData = ('0x' + msg.slice(10).join(''));
        } else {
            result.attributeSize = Number('0x' + msg[8] + msg[9]);
            result.attributeType = '0x' + msg[10];
            result.attributeData = '0x' + msg.slice(11, -1).join('');
            result.status = '0x' + msg[msg.length - 1];
        }
        result.dongleSerial = dongleSerial;
        console.log("\n")
        console.log(result);
        console.log("\n")
        return <MessageAttributeReport>result;
    }
    handleReadAttributeResponse(dongleSerial: string, msg: string[]): MessageReadAttributeResponse {
        var result;
        result = new Object();
        console.log('read attribute response triggered');
        //console.log('attribute resp handle: ' + msg);

        result.msgType = 'Read Attribute Report';
        result.sequenceNumber = ('0x' + msg[0]);
        result.shortAddress = ('0x' + msg[1] + msg[2]);
        result.endPoint = ('0x' + msg[3]);
        result.clusterID = ('0x' + msg[4] + msg[5]);
        result.attributeID = ('0x' + msg[6] + msg[7]);
        result.attributeStatus = ('0x' + msg[8]);
        result.attributeType = ('0x' + msg[9]);
        result.attributeSize = ('0x' + msg[10] + msg[11]);
        result.status = ('0x' + msg[12]);
        result.dongleSerial = dongleSerial;
        console.log("\n")
        console.log(result);
        console.log("\n")
        return <MessageReadAttributeResponse>result;
    }
    handleNetworkJoinedOrFormed(dongleSerial: string, msg: string[]): MessageNetworkJoinedOrFormed {
        var statusList = ['Joined existing network', 'Formed new network', 'Failed'];
        var result;
        result = new Object();
        result.msgType = 'Network Joined / Formed';
        var status = Number('0x' + msg[0]);
        result.status = statusList[status < 2 ? status : 2];
        result.shortAddress = ('0x' + msg[1] + msg[2]);
        result.IEEEAddress = ('0x' + msg.slice(3, 3 + 8).join(''));
        result.channel = ('0x' + msg[11]);
        result.dongleSerial = dongleSerial;
        console.log("\n")
        console.log(result);
        console.log("\n")
        return <MessageNetworkJoinedOrFormed>result;
    }
    handleLeaveIndication(dongleSerial: string, msg: string[]): MessageLeaveIndication {
        var result;
        result = new Object();

        result.msgType = 'Leave Indication';
        result.IEEEAddress = ('0x' + msg.slice(0, 8).join(''));
        result.rejoinStatues = ('0x' + msg[8]);
        result.dongleSerial = dongleSerial;

        console.log("leaveIndication\n")
        console.log(result);
        console.log("\n")
        return <MessageLeaveIndication>result;
    }

}