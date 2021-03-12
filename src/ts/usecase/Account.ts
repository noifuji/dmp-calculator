import { Constants } from "../util/Constants";

export class Account {
  gold: number;
  dmp: number;
  packTicketQty: number;
  srPackTicketQty: number;
  builderTicketQty: number;
  superDeckTicketQty: number;
  srCardQty: number;
  vrCardQty: number;
  rCardQty: number;
  ucCardQty: number;
  cCardQty: number;

  constructor(
    gold: number,
    dmp: number,
    packTicketQty: number,
    srPackTicketQty: number,
    srCardQty: number,
    vrCardQty: number,
    rCardQty: number,
    ucCardQty: number,
    cCardQty: number,
    builderTicketQty: number,
    superDeckTicketQty: number,
  ) {
    this.gold = gold;
    this.dmp = dmp;
    this.packTicketQty = packTicketQty;
    this.srPackTicketQty = srPackTicketQty;
    this.srCardQty = srCardQty;
    this.vrCardQty = vrCardQty;
    this.rCardQty = rCardQty;
    this.ucCardQty = ucCardQty;
    this.cCardQty = cCardQty;
    this.builderTicketQty = builderTicketQty;
    this.superDeckTicketQty = superDeckTicketQty;
  }
  
  /**
   *各値を変換し、トータルをDMポイントで返却する。 
   */
  getToalInDmp() {
      const DMP_PER_GOLD = Constants.DMP_PER_PACK/Constants.GOLD_PER_PACK;
      
      return this.gold * DMP_PER_GOLD +
      this.dmp +
      this.packTicketQty * Constants.DMP_PER_PACK +
      this.srPackTicketQty * Constants.DMP_PER_SR_TICKET +
      this.builderTicketQty * Constants.DMP_PER_BUILDER +
      this.superDeckTicketQty * Constants.DMP_PER_SUPERDECK +
      this.srCardQty * Constants.DMP_PER_SR_CARD +
      this.vrCardQty * Constants.DMP_PER_VR_CARD +
      this.rCardQty * Constants.DMP_PER_R_CARD +
      this.ucCardQty * Constants.DMP_PER_UC_CARD +
      this.cCardQty * Constants.DMP_PER_C_CARD;
  }
}
