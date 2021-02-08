import { Card } from "../entity/Card";

export interface CardRepository{
    initRepo(): void;
    findById(id:string):Promise<Card>;
    insert(card: Card):void;
    insertBulk(cards: Card[]):void;
}