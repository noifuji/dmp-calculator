import { Card } from "../entity/Card";
import { CardRepository } from "./CardRepository";

/*
setCardIds(ids : string[]):idのリストをカードのリスﾄに変換して保持する。
mergeCards(cards:Cards):2つのCardsオブジェクトをマージする。

getCardById():カードの情報をidから取得する。
getCardQty(card: Card)特定のカードの枚数を取得する。
setCardQty(card: Card, qty: number)特定のカードの枚数を登録する。
getTotalDmpPoint():トータルのDMポイントを取得する。
getDmpPointGroupByExpansion():パック名ごとに集計する。
*/

export class DMPCards {
  records: CardRecord[];
  private repo: CardRepository;

  constructor(repo: CardRepository) {
    this.repo = repo;
    this.records = [];
  }

  async init(ids: string[]) {
    let cardListPromise: Promise<Card | undefined>[] = ids.map((id) =>
      this.repo.findById(id)
    );
    const cardListWithUndefined: (Card | undefined)[] = await Promise.all(
      cardListPromise
    );
    const cardList: Card[] = cardListWithUndefined.filter(
      (x): x is Card => !!x
    );

    let distinctCardList: Card[] = cardList.filter(
      (x, i, self) => self.map((card) => card.id).indexOf(x.id) === i
    );

    this.records = distinctCardList.map((x) => {
      let qty = 0;
      cardList.forEach((card) => {
        if (card.id === x.id) {
          qty++;
        }
      });

      return { card: x, requiredQty: qty, ownedQty: 0 };
    });
  }

  merge(cards: DMPCards) {
    console.log(cards);
    const thisCardList = this.records.map((x) => x.card);
    const otherCardList = cards.records.map((x) => x.card);
    const mergedCardList = thisCardList.concat(otherCardList);

    let distinctCardList: Card[] = mergedCardList.filter(
      (x, i, self) => self.map((card) => card.id).indexOf(x.id) === i
    );

    this.records = distinctCardList.map((x) => {
      let req = 0;
      const thisReqQty = this.getRequiredQty(x);
      const otherReqQty = cards.getRequiredQty(x);
      if (otherReqQty > thisReqQty) {
        req = otherReqQty;
      } else {
        req = thisReqQty;
      }

      let owned = 0;
      const thisOwnQty = this.getOwnedQty(x.id);
      const otherOwnQty = cards.getOwnedQty(x.id);
      if (otherOwnQty > thisOwnQty) {
        owned = otherOwnQty;
      } else {
        owned = thisOwnQty;
      }

      return { card: x, requiredQty: req, ownedQty: owned };
    });
  }
  
  getCardRecordById(id: string) {
    const r = this.records.filter(x => x.card.id === id);
    if(r.length > 0) {
      return r[0];
    }
    
    return null;
  }

  getRequiredQty(card: Card) {
    const tmp: CardRecord[] = this.records.filter((x) => x.card.id === card.id);
    if (!!tmp && tmp.length == 1) {
      return tmp[0].requiredQty;
    } else {
      return 0;
    }
  }

  getOwnedQty(id: string) {
    const tmp: CardRecord[] = this.records.filter((x) => x.card.id === id);
    if (!!tmp && tmp.length == 1) {
      return tmp[0].ownedQty;
    } else {
      return 0;
    }
  }

  setCard(card: Card, requiredQty: number) {
    const tmp: CardRecord[] = this.records.filter((x) => x.card.id === card.id);
    if (!tmp || tmp.length == 0) {
      this.records.push({ card: card, requiredQty: requiredQty, ownedQty: 0 });
    } else {
      tmp[0].requiredQty = requiredQty;
    }
  }

  getTotalDmpPoint() {
    return this.records.reduce((accu, curr) => {
      //プライズなど生成不可のカードが指定されている場合は、レアリティに応じて生成ポイントを計算する。
      let gen = curr.card.generateDmp;
      if (isNaN(gen)) {
        gen = this.getDmpFromRarity(curr.card.rarity);
      }
      return accu + gen * curr.requiredQty;
    }, 0);
  }
  
  getShortageDmpPoint() {
    return this.records.reduce((accu, curr) => {
      //プライズなど生成不可のカードが指定されている場合は、レアリティに応じて生成ポイントを計算する。
      let gen = curr.card.generateDmp;
      if (isNaN(gen)) {
        gen = this.getDmpFromRarity(curr.card.rarity);
      }
      return accu + gen * ((curr.requiredQty - curr.ownedQty) < 0 ? 0 : (curr.requiredQty - curr.ownedQty));
    }, 0);
  }

  getReuiredDmpPointByPack(): Pack[] {
    //パック名ごとにdistinctな配列を作る。
    const packNames = this.records
      .map((x) => x.card.expansionCode)
      .filter((x, i, self) => self.indexOf(x) == i && x != "");

    let packs: Pack[] = packNames.map((x) => {
      const dmp = this.records.reduce((accu, curr) => {
        if (curr.card.expansionCode == x) {
          accu =
            accu + this.getDmpFromRarity(curr.card.rarity) * curr.requiredQty;
        }

        return accu;
      }, 0);
      return { pack: x, dmp: dmp };
    });

    packs.sort(function (a, b) {
      if (a.pack < b.pack) return -1;
      if (a.pack > b.pack) return 1;
      return 0;
    });

    return packs;
  }
  
  getShortageDmpPointByPack(): Pack[] {
    //パック名ごとにdistinctな配列を作る。
    const packNames = this.records
      .map((x) => x.card.expansionCode)
      .filter((x, i, self) => self.indexOf(x) == i && x != "");

    let packs: Pack[] = packNames.map((x) => {
      const dmp = this.records.reduce((accu, curr) => {
        if (curr.card.expansionCode == x) {
          accu =
            accu + this.getDmpFromRarity(curr.card.rarity) * ((curr.requiredQty - curr.ownedQty) < 0 ? 0 : (curr.requiredQty - curr.ownedQty));
        }

        return accu;
      }, 0);
      return { pack: x, dmp: dmp };
    });

    packs.sort(function (a, b) {
      if (a.pack < b.pack) return -1;
      if (a.pack > b.pack) return 1;
      return 0;
    });

    return packs;
  }

  getDmpFromRarity(rarity: string): number {
    let gen = 0;
    if (rarity == "SR") {
      gen = 2400;
    } else if (rarity == "VR") {
      gen = 800;
    } else if (rarity == "R") {
      gen = 300;
    } else if (rarity == "UC") {
      gen = 100;
    } else if (rarity == "C") {
      gen = 50;
    } else if (rarity == "-") {
      gen = 0;
    }

    return gen;
  }
}

interface CardRecord {
  card: Card;
  requiredQty: number;
  ownedQty: number;
}

interface Pack {
  pack: string;
  dmp: number;
}
