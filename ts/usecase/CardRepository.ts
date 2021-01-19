import { Card } from "../entity/Card";

export interface CardRepository{
    findById(id:string):Promise<Card|undefined>;
    insert(card: Card):void;
}