import { Card } from "../entity/Card";
import { CardRepository } from "../usecase/CardRepository";
import { CardDatabase } from "./CardDatabase";

export class CardRepositoryImpl implements CardRepository {
  db: CardDatabase;
  
  constructor() {
    this.db = new CardDatabase();
  }

  async findById(id: string) {
    const card = await this.db.cardmaster.get(id);
    return card;
  }

  insert(card: Card) {
    this.db.cardmaster.add(card);
  }
}
