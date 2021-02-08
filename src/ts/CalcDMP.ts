import { CardRepositoryImpl } from "./infla/CardRepositoryImpl";
import { CardRepository } from "./usecase/CardRepository";
import { GetTotalRequiredCards } from "./usecase/GetTotalRequiredCards";
import { Card } from "./entity/Card";

export class CalcDMP {
  private str_main_html: string =
    '<div class="calcdeck_main">' +
    '<div class="calcdeck_form_deck_url">' +
    '<div class="calcdeck_deck_url_list">' +
    '<div>' +
    '<input class="calcdeck_url_entry" type="text">' +
    "</div>" +
    "</div>" +
    '<div>' +
    '<button class="calcdeck_add_url_entry">+</button>' +
    '</div>' +
    '<div>' +
    '<button class="calcdeck_button_submit_deck_url">Calcurate DMP</button>' +
    '</div>' +
    "</div>" +
    '<div class="calcdeck_result">' +
    '<div id="calcdeck_result_summary"></div>' +
    '<div id="calcdeck_result_card_list"></div>' +
    "</div>" +
    "</div>";

  private doc: Document;
  private container: HTMLElement;

  private repo: CardRepository;

  constructor(document: Document, container: HTMLElement) {
    this.doc = document;
    container.innerHTML = this.str_main_html;
    this.container = container;
    this.repo = new CardRepositoryImpl();
  }

  onStart() {
    const submitBtns = this.doc.querySelector(".calcdeck_button_submit_deck_url");
    if (!!submitBtns) {
        submitBtns.addEventListener("click", (e: Event) =>
          this.onClickSubmitBtn(e)
        );
    }
    
    const addUrlEntryBtn = this.doc.querySelector(".calcdeck_add_url_entry");
    if (!!addUrlEntryBtn) {
        addUrlEntryBtn.addEventListener("click", (e: Event) =>
          this.onAddUrlEntryBtn(e)
        );
    }

    this.repo.initRepo();
  }
  
  onAddUrlEntryBtn(e: Event) {
    const urlList = this.doc.querySelector(".calcdeck_deck_url_list");
    if(!!urlList) {
    const div = this.doc.createElement("div");
    const urlEntry = this.doc.createElement("input");
    urlEntry.classList.add("calcdeck_url_entry");
    urlEntry.setAttribute("type", "text");
    const delUrlEntry = this.doc.createElement("button");
    delUrlEntry.classList.add("calcdeck_del_url_entry");
    delUrlEntry.textContent = "-";
    delUrlEntry.addEventListener("click", (e:Event)=> {
      this.onClickDelUrlEntry(e);
    });
    div.appendChild(urlEntry);
    div.appendChild(delUrlEntry);
    urlList.appendChild(div);
    }
  }
  
  onClickDelUrlEntry(e:Event) {
    if(!e.target) {
      return;
    }
    
    const urlEntry = (<HTMLElement>e.target).parentElement;
    if(!urlEntry) {
      return;
    }
    
    urlEntry.remove();
  }

  async onClickSubmitBtn(e: Event) {
    //入力されたURLのチェック
    let urlInputElements = Array.from(
      this.doc.getElementsByClassName(
        "calcdeck_url_entry"
      ) as HTMLCollectionOf<HTMLInputElement>
    );
    if (!urlInputElements) {
      return;
    }

    let encodedCardIdLists: string[][] = [];
    for (let i = 0; i < urlInputElements.length; i++) {
      try {
        let url: URL = new URL(urlInputElements[i].value);
        if (!url.search) {
          continue;
        }
        let c = new URLSearchParams(url.search).get("c");
        if (!c) {
          continue;
        }
        encodedCardIdLists.push(c.split("."));
      } catch (e) {
        //TODO:エラー処理
      }
    }

    //必要なカードの取得
    let cards: Card[] = await new GetTotalRequiredCards(this.repo).execute(
      encodedCardIdLists
    );

    //distinctな配列を作る。
    const distinctIds = cards
      .map((x) => x.id)
      .filter((x, i, self) => self.indexOf(x) == i);
    const distinctCards: Card[] = distinctIds.map((x) => {
      for (let i = 0; cards.length; i++) {
        if (x == cards[i].id) {
          return cards[i];
        }
      }
    }) as Card[];
    const cardsForDisplay: CardForDisplay[] = distinctCards.map((x) => {
      const num = cards.reduce(
        (accu, curr) => accu + (curr.id == x.id ? 1 : 0),
        0
      );
      return { card: x, num: num };
    });
    //それぞれの個数を取得する。
    //ソートする。
    cardsForDisplay.sort(function (a, b) {
      if (a.card.cost < b.card.cost) return -1;
      if (a.card.cost > b.card.cost) return 1;
      return 0;
    });

    //resultのHTMLを作成
    let requiredDmp: number = cardsForDisplay.reduce((accu, curr) => {
      //プライズなど生成不可のカードが指定されている場合は、レアリティに応じて生成ポイントを計算する。
      let gen = curr.card.generateDmp;
      if (isNaN(gen)) {
        if (curr.card.rarity == "SR") {
          gen = 2400;
        } else if (curr.card.rarity == "VR") {
          gen = 800;
        }
        else if (curr.card.rarity == "R") {
          gen = 300;
        }
        else if (curr.card.rarity == "UC") {
          gen = 100;
        }
        else if (curr.card.rarity == "C") {
          gen = 50;
        }
        else  if (curr.card.rarity == "-") {
          gen = 0;
        }
      }
      return accu + gen * curr.num;
    }, 0);

    let resultDivs = this.doc.getElementById("calcdeck_result_summary");
    if (!!resultDivs) {
      resultDivs.innerHTML = String(requiredDmp);
    }

    this.renderResult(cardsForDisplay);
  }

  renderResult(cardsForDisplay: CardForDisplay[]) {
    let str_table =
      "<table>" +
      "<thread>" +
      "<tr>" +
      "<th>cost</th>" +
      "<th>name</th>" +
      "<th>rarity</th>" +
      "<th>num</th>" +
      "</tr>" +
      "</thread>" +
      "<tbody>" +
      "</tbody>" +
      "</table>";

    const tableElement = new DOMParser().parseFromString(
      str_table,
      "text/html"
    );
    for (let i = 0; i < cardsForDisplay.length; i++) {
      let str_row =
        "<table><tr><td>" +
        cardsForDisplay[i].card.cost +
        "</td><td>" +
        cardsForDisplay[i].card.name +
        "</td><td>" +
        cardsForDisplay[i].card.rarity +
        "</td><td>" +
        cardsForDisplay[i].num +
        "</td></tr></table>";
      const rowElement = new DOMParser().parseFromString(str_row, "text/html");
      const tbodyElement = tableElement.getElementsByTagName("tbody")[0];
      tbodyElement.appendChild(rowElement.getElementsByTagName("tr")[0]);
    }

    const resultElement = this.doc.getElementById("calcdeck_result_card_list");
    if (!!resultElement) {
      //一旦消す
      while (resultElement.firstChild) {
        resultElement.removeChild(resultElement.firstChild);
      }
      resultElement.appendChild(tableElement.getElementsByTagName("table")[0]);
    }
  }
}

interface CardForDisplay {
  card: Card;
  num: number;
}
