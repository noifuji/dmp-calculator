import { Card } from "../entity/Card";

export class CloudStorage {
  constructor() {}

  async findAllCards() {
    let response = await fetch("./CardMaster.csv");
    let text = await response.text();
    let rows: string[] = text.split("\n");
    return this.csv2cards(rows);
  }

  csv2cards(csvArray: String[]) {
    let jsonArray: Card[] = [];

    // 1行目から「項目名」の配列を生成する
    let items: string[] = csvArray[0].split(",");

    // CSVデータの配列の各行をループ処理する
    //// 配列の先頭要素(行)は項目名のため処理対象外
    //// 配列の最終要素(行)は空のため処理対象外
    for (var i = 1; i < csvArray.length - 1; i++) {
      let d: string[] = csvArray[i].split(",");
      
      const id = d[0];
      const rarity = d[5];
      let generateDmp = Number(d[11]);
      let convertDmp = Number(d[12]);
      
      let tmp = new Card(
        id,
        d[1],
        d[2],
        d[3],
        d[4],
        rarity,
        Number(d[6]),
        d[7],
        Number(d[8]),
        d[9],
        d[10],
        generateDmp,
        convertDmp,
        d[13],
        d[14] == "20"
      );
      jsonArray.push(tmp);
    }
    return jsonArray;
  }
}
