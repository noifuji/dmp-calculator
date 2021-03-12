import { Card } from "../entity/Card";
import { Deck } from "../entity/Deck";
import { CardRepository } from "./CardRepository";

/**
 * CardMaster
 * 
 * -getCardById(id)
 * カードidからカードオブジェクトを取得する。
 * 
 * -getCardsById(ids)
 * カードidのリストすらカードオブジェクトのリストを取得する。
 */
export class GetTotalRequiredCards {
  private repo: CardRepository;

  constructor(repo: CardRepository) {
    this.repo = repo;
  }

  async execute(encodedCardIdLists: string[][]) {
    let decks: Deck[] = [];
    let cards: Card[] = [];

    

    let decodedCardIdLists: string[][] = encodedCardIdLists.map((cardIds) => {
      return cardIds.map((cardId) => this.convertUrl2CardId(cardId));
    });

    for (let i = 0; i < decodedCardIdLists.length; i++) {
      let cardListPromise: Promise<Card|undefined>[] = decodedCardIdLists[i].map((cardId) => this.repo.findById(cardId));
      const cardListWithUndefined: (Card|undefined)[] = await Promise.all(cardListPromise);
      const cardList: Card[] = cardListWithUndefined.filter((x): x is Card => !!x);
      
      decks.push(
        new Deck(cardList)
      );
    }

    let allCardList: Card[] = decks.reduce(
      (acc, val) => acc.concat(val.getCards()),
      [] as Card[]
    );
    let distinctCardList: Card[] = allCardList.filter(
      (x, i, self) => self.map((card) => card.id).indexOf(x.id) === i
    );

    //各デッキの中で最も多く含まれている枚数分カードを取得する。

    cards = distinctCardList.reduce((prev, card) => {
      let maxIndex = 0;
      let maxCount = 0;
      for (let i = 0; i < decks.length; i++) {
        if (maxCount < decks[i].getCardCountById(card.id)) {
          maxIndex = i;
          maxCount = decks[i].getCardCountById(card.id);
        }
      }
      return prev.concat(decks[maxIndex].getCardsById(card.id));
    }, [] as Card[]);

    return cards;
  }

  convertUrl2CardId(txt: string) {
    let map: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567=";
    let padds: string[] = ["1", "8", "9", "0"];
    padds.forEach((x) => {
      let reg = new RegExp(x, "g");
      txt = txt.replace(reg, "");
    });
    var ret = "";
    var length = txt.length;
    for (var j = 0; j < length; j = j + 2) {
      var val1 = txt.substring(j, j + 1);
      var val2 = txt.substring(j + 1, j + 2);
      var num1 = map.search(val1);
      var num2 = map.search(val2);
      if (num1 == 0) {
        if (String(num2).length == 1) {
          ret = "00" + String(num2) + ret;
        } else if (String(num2).length == 2) {
          ret = "0" + String(num2) + ret;
        }
      } else {
        ret = String(num1 * 32 + num2) + ret;
      }
    }
    let retInt: number = parseInt(ret, 10);
    if (retInt) {
      return retInt.toString();
    } else {
      return "";
    }
  }
}
