import { Card } from "./Card";

export class Deck {
    cards: Card[];
    deckUrl: string = "";
    
    constructor(cards: Card[]) {
        this.cards = cards;
    }
    
    getCardCountById(cardId: string): number {
        return this.cards.reduce((prev,card) => {
            return prev + (card.id == cardId ? 1 : 0);
        }, 0);
    }
    
    getCards():Card[] {
        return this.cards;
    }
    
    getCardsById(id: string): Card[] {
        return this.cards.filter(card => card.id === id);
    }
}