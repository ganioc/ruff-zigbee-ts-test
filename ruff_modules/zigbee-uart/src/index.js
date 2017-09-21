'use strict';

var driver = require('ruff-driver');
var ReadStreaming = require('./read-streaming');

var index = 0;

var START_STATE = 111;
var FINDING_STATE = 222;
var EMIT_STATE = 333;
var FSM = START_STATE;

var IDLE_STATE = 0;
var DATA_STATE = 1;
var END_STATE = 2;

var state = IDLE_STATE;

function logHex(buf) {
    return buf.toString("hex").match(/\w\w/g).join(" ");
}

module.exports = driver({

    attach: function (inputs, context) {
        console.log('uart attached');

        var that = this;
        this._uart = inputs['uart'];
        this.rBuffer = new Buffer(0);
        this.tempBuffer = new Buffer(512);
        this.indexBuffer = 0;

        this._uart.on('data', function (data) {
            console.log('\n--- uart RX raw data: ' + data.toString('hex'));

            for (var i = 0; i < data.length; i++) {
                switch (state) {
                    case IDLE_STATE:
                        if (data[i] == 0x01) {
                            that.tempBuffer[that.indexBuffer++] = data[i];
                            state = DATA_STATE;
                        }

                        break;
                    case DATA_STATE:
                        if (data[i] !== 0x03) {
                            that.tempBuffer[that.indexBuffer++] = data[i];
                        } else {
                            that.tempBuffer[that.indexBuffer++] = data[i];
                            // send out the message
                            var tempBuf = that.tempBuffer.slice(0, that.indexBuffer);
                            that.emit("data", tempBuf);

                            // clear the tempbuffer
                            that.indexBuffer = 0;

                            state = IDLE_STATE;
                        }
                        break;
                    default:
                        console.log("\n===Undefined Uart Handle State===\n");
                        break;
                }

            }

            /*
            // --------- slice and push to buffer -------
            while (true) {
                var start = that.rBuffer.indexOf(0x01);
                var end = that.rBuffer.indexOf(0x03);

                //senario 1: whole pack
                if ((start !== -1 && end !== -1 && start < end) || (FSM === FINDING_STATE && end !== -1)) {
                    FSM = EMIT_STATE;
                    var tempBuffer = that.rBuffer.slice(start, end + 1);
                    that.emit("data", tempBuffer);
                    that.rBuffer = that.rBuffer.slice(end + 1);
                    FSM = START_STATE;

                    // senario 2: start exist, no end, wait for end
                } else if (start !== -1 && end == -1) {
                    FSM = FINDING_STATE;
                    that.rBuffer = that.rBuffer.slice(start);
                    console.log('--- waiting for rest of the message ...');
                    break;
                } else {
                    FSM = START_STATE;
                    break;
                }
            }
            */
        });
    },

    exports: {
        write: function (data, callback) {
            console.log("\n\n---Uart0 TX RAW write:" + data.length);
            console.log('--- raw data write: ' + data.toString('hex') + '\n');

            this._uart.write(data, callback);
        }
    }

});