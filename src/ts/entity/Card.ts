export class Card {
  id: string;
  name: string;
  race: string;
  type: string;
  rarity: string;
  cost: number;
  power: string;
  mana: number;
  text: string;
  flavor: string;
  generateDmp: number;
  convertDmp: number;
  secretFlag: boolean;

  constructor(
    id: string,
    name: string,
    race: string,
    type: string,
    rarity: string,
    cost: number,
    power: string,
    mana: number,
    text: string,
    flavor: string,
    generateDmp: number,
    convertDmp: number,
    secretFlag: boolean
  ) {
    this.id = id;
    this.name = name;
    this.race = race;
    this.type = type;
    this.rarity = rarity;
    this.cost = cost;
    this.power = power;
    this.mana = mana;
    this.text = text;
    this.flavor = flavor;
    this.generateDmp = generateDmp;
    this.convertDmp = convertDmp;
    this.secretFlag = secretFlag;
  }
}
