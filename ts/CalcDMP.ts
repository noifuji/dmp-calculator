import { CardRepositoryImpl } from "./infla/CardRepositoryImpl";
import { GetTotalRequiredCards } from "./usecase/GetTotalRequiredCards";
import { Card } from "./entity/Card";

export class CalcDMP {
  private str_main_html: string =
    '<div class="main">' +
    '<div class="form_deck_url">' +
    '<div class="deck_url_list">' +
    '<input class="url_entry" type="text">' +
    '<input class="url_entry" type="text">' +
    '<input class="url_entry" type="text">' +
    "</div>" +
    '<button class="button_submit_deck_url">Calcurate DMP</button>' +
    "</div>" +
    '<div class="result">' +
    '<div class="result_summary"></div>' +
    '<div class="result_card_list"></div>' +
    "</div>" +
    "</div>";
  private doc: Document;
  private container: HTMLElement;

  constructor(document: Document, container: HTMLElement) {
    this.doc = document;
    container.innerHTML = this.str_main_html;
    this.container = container;
  }

  onStart() {
    let submitBtns = this.doc.getElementsByClassName("button_submit_deck_url");
    if (!!submitBtns) {
      for (let i = 0; i < submitBtns.length; i++) {
        submitBtns[i].addEventListener("click", (e: Event) =>
          this.onClickSubmitBtn(e)
        );
      }
    }
  }

  async onClickSubmitBtn(e: Event) {
    //入力されたURLのチェック
    let urlInputElements = Array.from(this.doc.getElementsByClassName("url_entry") as HTMLCollectionOf<HTMLInputElement>);
    if (!urlInputElements) {
      return;
    }
    
    let encodedCardIdLists: string[][] = [];
    for (let i=0; i <urlInputElements.length; i++) {
        try{
        let url: URL = new URL(urlInputElements[i].value);
        if(!url.search) {
            continue;
        }
        let c = new URLSearchParams(url.search).get("c");
        if(!c) {
            continue;
        }
        encodedCardIdLists.push(c.split("."));
        } catch(e) {
            //TODO:エラー処理
        }
    }

    
    //必要なカードの取得
    let cards: Card[] = await new GetTotalRequiredCards(
      new CardRepositoryImpl()
    ).execute(encodedCardIdLists);
    
    //resultのHTMLを作成
    let requiredDmp: number = cards.reduce((accu, curr) => accu + curr.generateDmp, 0);
    console.log(cards);
    let resultDivs = this.doc.getElementsByClassName("result_summary");
    if (!!resultDivs) {
      for (let i = 0; i < resultDivs.length; i++) {
        resultDivs[i].innerHTML = String(requiredDmp);
      }
    }
  }
}
