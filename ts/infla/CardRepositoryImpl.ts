import { Card } from "../entity/Card";
import { CardRepository } from "../usecase/CardRepository";
import { LocalDatabase } from "./LocalDatabase";
import { CloudStorage } from "./CloudStorage";

export class CardRepositoryImpl implements CardRepository {
  db: LocalDatabase;
  web: CloudStorage;
  
  constructor() {
    this.db = new LocalDatabase();
    this.web = new CloudStorage();
    
  }
  
  async initRepo() {
      await this.insertBulk(await this.web.findAllCards());
  }

  async findById(id: string){
    let card = await this.db.cardmaster.get({id: id});
    if(!card) {
      throw new Error("No id : " + id);
    }
    return card;
  }

  async insert(card: Card) {
    await this.db.cardmaster.add(card);
  }
  
  async insertBulk(cards: Card[]) {
    const lastkey = await this.db.cardmaster.bulkPut(cards);
    console.log("Last card's id was: " + lastkey);
  }
}
