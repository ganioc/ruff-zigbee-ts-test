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

export interface RelationOptions {
    name: string;
    emitterIEEEAddress: string;
    receiverIEEEAddress: string;
    eEP: string;
    rEP: string;

}
export class Relation {
    name: string;
    emitterIEEEAddress: string; // 0x23424321432342134123
    receiverIEEEAddress: string;
    // It seems in relationList it's 'left' 
    eEP: string; // left(0x02), right(0x03), single (0x02)
    rEP: string; // left(0x02), right(0x03), single(0x02)


    constructor(option: RelationOptions) {
        this.name = option.name;
        this.emitterIEEEAddress = option.emitterIEEEAddress;
        this.receiverIEEEAddress = option.receiverIEEEAddress;
        this.eEP = option.eEP; // emitter end point
        this.rEP = option.rEP; // receiver end point
    }
}





