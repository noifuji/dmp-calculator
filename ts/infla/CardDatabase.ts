import Dexie from 'dexie';
import { Card } from "../entity/Card";

export class CardDatabase  extends Dexie {
    cardmaster!: Dexie.Table<Card,string>;
    
    constructor(){
        super('cardmaster-database');
        this.version(1).stores({
            cardmaster: "id,name"
        });
    }
    
}