"use strict";
/**
 * Relation
 * emitterIEEEAddress-EP  ==> receiverIEEEAddress-EP
 *
 * Action must be provided for
 * Turning on the light
 * or Turning off the light
 * or something else
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
var Relation = (function () {
    function Relation(option) {
        this.name = option.name;
        this.emitterIEEEAddress = option.emitterIEEEAddress;
        this.receiverIEEEAddress = option.receiverIEEEAddress;
        this.eEP = option.eEP; // emitter end point
        this.rEP = option.rEP; // receiver end point
    }
    return Relation;
}());
exports.Relation = Relation;
