import { DMPCards } from "./DMPCards";
import { Card } from "../entity/Card";
import { CardRepository } from "./CardRepository";
import { Utils } from "../util/Utils";

export class DMPDeck extends DMPCards {
    private deckURL : string;
    
    constructor(repo: CardRepository, url: string) {
        super(repo);
        this.deckURL = url;
    }
    
    async initDeck() {
        const ids = Utils.getCardIdsFromURL(this.deckURL);
        if(ids.length > 0) {
            await this.init(ids);
        }
    }
    
    getDeckURL() {
        return this.deckURL;
    }
    
    getDeckName() {
        const id =  Utils.getKeyCardIdFromURL(this.deckURL)
        const r = this.getCardRecordById(id);
        if(!!r) {
            return r.card.name + " 他";
        }
        
        
        return "新しいデッキ";
    }
    
}