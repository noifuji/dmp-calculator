import { CardRepositoryImpl } from "../infla/CardRepositoryImpl";
import { CardRepository } from "../usecase/CardRepository";
import { DMPCards } from "../usecase/DMPCards";
import { DMPDeck } from "../usecase/DMPDeck";
import { GetTotalRequiredCards } from "../usecase/GetTotalRequiredCards";
import { Card } from "../entity/Card";
import { PubSub } from "../util/PubSub";
import { Constants } from "../util/Constants";
import { Utils } from "../util/Utils";

/*
deckUrls デッキのURL
visibility デッキ計算機能の表示非表示フラグ

setVisibility
onChangeUrlEntryTextarea
calcurate
renderResult
getManaColorClass

*/
export class CalcDeck {
  private str_main_html: string = `
  <div class="calcdeck_main">
    <div class="calcdeck_url_entry_container">
      <div class="calcdeck_url_entry_label"><label>デッキURL</label></div>
      <div id="text_deckurl" class="calcdeck_url_entry_input">
        <textarea class="calcdeck_url_entry_text" type="text"></textarea>
      </div>
    </div>
    <div class="calcdeck_result">
      <div id="calcdeck_result_card_list"></div>
    </div>
  </div>
  `;

  private doc: Document;
  private container: HTMLElement;
  private repo: CardRepository;
  private stock: DMPCards;
  private pubsub: PubSub;
  private visibility: boolean;

  constructor(document: Document, container: HTMLElement, pubsub: PubSub) {
    this.pubsub = pubsub;
    this.doc = document;
    this.repo = new CardRepositoryImpl();
    this.container = container;
    this.container.innerHTML = this.str_main_html;
    this.visibility = false;
    this.stock = new DMPCards(this.repo);

    this.container.style.display = this.visibility ? "block" : "none";

    const urlEntryTextarea = <HTMLElement>(
      this.container.querySelector(".calcdeck_url_entry_text")
    );
    if (!!urlEntryTextarea) {
      urlEntryTextarea.addEventListener("input", (e: Event) =>
        this.onChangeUrlEntryTextarea(e)
      );
    }

    this.repo.initRepo();

    this.pubsub.subscribe(Constants.HELP_CLICKED, () => {
      if (this.visibility) {
        //モーダル表示
        const sampleUrl =
          "https://dmps.takaratomy.co.jp/deckbuilder/deck/?c=AADK.AADK.GIDM.GIDM.GIDN.GIDN.GIDN.GIDN.4EBE.4EBE.4EBE.4EBE.MQBY.MQBY.4EBZ.4EBZ.4EBZ.AADE.AADE.AADE.DEB4.DEB4.DEB4.DEB4.ZAAP.ZAAP.SYAY.SYAY.JMDK.JMDK.JMDK.JMBY.JMBY.JMBY.GIBY.GIAP.GIAP.DECC.DECC.DECC&k=DECC";
        const strModal = `
        <div class="dialogContainer">
    			<!-- Dialog title and body -->
    			<div class="dialogContent">
    				<div class="dialogContentTitle">デッキ計算の使い方</div>
    				<div class="dialogContentBody">
    				作成したいデッキに必要なDMポイントを算出します。
    				<br><br>
    				<p>-STEP1-</p>
    				<a href="${sampleUrl}" style="color:#f44336;" target="_blank" rel="noopener noreferrer">デュエプレ公式サイト</a>にてデッキを作成。
    				<br><br>
    				<p>-STEP2-</p>
    				[URLをコピー]ボタンをタップしてURLをコピーし、本サイトのデッキURL入力欄にペーストする。゜
    				</div>
    				<div class="img_copy_url" style="text-align:center;">
    				  <img src="copy_url_button.png">
    				</div>
    			</div>
   		 		<!-- Dialog action bar -->
   		 		<div class="dialogActionBar">
					<!-- Buttons -->
					  <a class="buttonTouchTarget" id="button_close">
					    <div class="buttonFlat">CLOSE</div>
					  </a>
    			</div>
			  </div>
        `;

        const modalTarget = <HTMLElement>this.doc.querySelector("#modal");
        const modalElement = <HTMLElement>Utils.parseStringToElement(strModal);
        modalElement!
          .querySelector("#button_close")!
          .addEventListener("click", (e) => {
            modalTarget.style.display = "none";
          });
        Utils.removeChildren(modalTarget!);
        modalTarget.style.display = "block";
        modalTarget!.appendChild(modalElement!);
      }
    });

    this.renderTutorial();
  }

  setVisibility(visibility: boolean) {
    this.visibility = visibility;
    this.container.style.display = this.visibility ? "block" : "none";
  }

  async onChangeUrlEntryTextarea(e: Event) {
    if (!e.srcElement) {
      return;
    }
    const inputText: string = (<HTMLTextAreaElement>e.srcElement).value;
    (<HTMLTextAreaElement>e.srcElement).value = "";

    let deckName: string = "新しいデッキ";
    let url: string = "";

    try {
      const deck = new DMPDeck(this.repo, inputText);
      await deck.initDeck();
      deckName = deck.getDeckName();
      url = deck.getDeckURL();
    } catch (e) {
      return;
    }

    //Create Chips
    const input = this.doc.createElement("input");
    input.setAttribute("type", "hidden");
    input.value = url;

    const str_url_chips: string = `
      <div class="md-chip">
        <span class="deckname">${deckName}</span>
        <button type="button" class="md-chip-remove"></button>
      </div>
      `;
    const chipsDoument = new DOMParser().parseFromString(
      str_url_chips,
      "text/html"
    );
    const chips = chipsDoument.querySelector("div");
    chips!.classList.add("calcdeck_url_entry_chips");
    chips!.appendChild(input);
    const remove = chips!.querySelector(".md-chip-remove");
    remove!.addEventListener("click", (e: Event) => {
      (<HTMLButtonElement>e.srcElement!).parentElement!.remove();
      this.renderURLList();
    });

    (<HTMLTextAreaElement>e.srcElement).replaceWith(chips!);

    const urlEntryInput = this.doc.querySelector(".calcdeck_url_entry_input");
    if (!!urlEntryInput) {
      const textAreaElement = this.doc.createElement("textarea");
      textAreaElement.setAttribute("type", "text");
      textAreaElement.classList.add("calcdeck_url_entry_text");
      textAreaElement.addEventListener("input", (e: Event) =>
        this.onChangeUrlEntryTextarea(e)
      );
      urlEntryInput.appendChild(textAreaElement);
    }
    
    this.renderURLList();
  }
  
  async renderURLList() {
    let urlInputElements = Array.from(
      this.doc.querySelectorAll(
        "#text_deckurl input"
      ) as NodeListOf<HTMLInputElement>
    );
    if (!urlInputElements) {
      return;
    }

    const deckList = await Promise.all(
      urlInputElements.map(async (x) => {
        const c = new DMPDeck(this.repo, x.value);
        await c.initDeck();
        return c;
      })
    );

    this.stock = deckList.reduce((prev, curr, i) => {
      prev.merge(curr);
      return prev;
    }, new DMPCards(this.repo));

    this.renderResult();
  }

  renderTutorial() {
    const sampleUrl =
      "https://dmps.takaratomy.co.jp/deckbuilder/deck/?c=AADK.AADK.GIDM.GIDM.GIDN.GIDN.GIDN.GIDN.4EBE.4EBE.4EBE.4EBE.MQBY.MQBY.4EBZ.4EBZ.4EBZ.AADE.AADE.AADE.DEB4.DEB4.DEB4.DEB4.ZAAP.ZAAP.SYAY.SYAY.JMDK.JMDK.JMDK.JMBY.JMBY.JMBY.GIBY.GIAP.GIAP.DECC.DECC.DECC&k=DECC";
    const strTutorialCardComponent = `
      <section class="card">
        <div class="card-content">
          <p class="card-title">デッキ計算の使い方</p>
          <p class="card-text">
    				<div>
    				  作成したいデッキに必要なDMポイントを算出できます。
    				  <br><br>
    				  <p>-STEP1-</p>
    				  <a href="${sampleUrl}" style="color:#f44336;" target="_blank" rel="noopener noreferrer">デュエプレ公式サイト</a>にてデッキを作成してください。
    				  <br><br>
    				  <p>-STEP2-</p>
    				  [URLをコピー]ボタンをタップしてURLをコピーし、本サイトのデッキURL入力欄にペーストしてください。
    			  </div>
          </p>
      </section>
      `;
    const tutorialCardComponentElement = Utils.parseStringToElement(
      strTutorialCardComponent
    );
    const resultElement = this.doc.getElementById("calcdeck_result_card_list");
    if (!!resultElement && !!tutorialCardComponentElement) {
      Utils.removeChildren(resultElement);
      resultElement.appendChild(tutorialCardComponentElement);
    }
  }

  async renderResult() {
    const cards = this.stock;
    //トータル
    let requiredDmp: number = cards.getShortageDmpPoint();
    const strRequiredDMP = `
      <section class="card">
        <div class="card-content">
          <p class="card-title">必要なDMポイント</p>
          <p class="card-text">${requiredDmp.toLocaleString()}</p>
        </div>
      </section>
      `;
    const requiredDMPElement = Utils.parseStringToElement(strRequiredDMP);
    const resultElement = this.doc.getElementById("calcdeck_result_card_list");
    if (!!resultElement && !!requiredDMPElement) {
      Utils.removeChildren(resultElement);
      resultElement.appendChild(requiredDMPElement);
    }

    //パック別
    const packs: Pack[] = cards.getShortageDmpPointByPack();
    const strPacksCard = `
      <section class="card">
        <div class="card-content">
          <p class="card-title">エキスパンション別集計</p>
          <ul></ul>
        </div>
      </section>
    `;
    const packElement = <HTMLElement>Utils.parseStringToElement(strPacksCard);
    const packUl = packElement!.querySelector("ul");
    for (let i = 0; i < packs.length; i++) {
      let str_row = `
           <li>
             <div class="calcdeck_result_text">
               <div class="calcdeck_result_name">${packs[i].pack}</div>
             </div>
             <div class="calcdeck_result_dmp">${packs[
               i
             ].dmp.toLocaleString()}ポイント</div>
           </li>
         `;
      const rowElement = <HTMLElement>Utils.parseStringToElement(str_row);
      packUl!.appendChild(rowElement);
    }

    if (!!resultElement) {
      resultElement.appendChild(packElement);
    }

    //カード別
    const strCard = `
      <section class="card">
        <div class="card-content">
          <p class="card-title">カードリスト</p>
          <ul>
          <li>
             <div class="calcdeck_result_icon cardlist_header">
               コスト
             </div>
             <div class="calcdeck_result_text cardlist_header">
               カード名
             </div>
             <div class="calcdeck_result_qty cardlist_header">
               必要
             </div>
             <div class="calcdeck_result_qty cardlist_header">
               所持
             </div>
           </li>
          
          </ul>
        </div>
      </section>
    `;
    const cardDocument = new DOMParser().parseFromString(strCard, "text/html");
    const tableElement = cardDocument.querySelector("ul");
    for (let i = 0; i < cards.records.length; i++) {
      let str_row = `
           <li>
             <div class="calcdeck_result_icon">
               <div class="calcdeck_result_cost ${Utils.getManaColorClass(
                 cards.records[i].card.manaColor
               )}">
                 <span>${cards.records[i].card.cost}</span>
               </div>
             </div>
             <div class="calcdeck_result_text">
               <div class="calcdeck_result_name">${
                 cards.records[i].card.name
               }</div>
             </div>
             <div class="calcdeck_result_qty">${
               cards.records[i].requiredQty
             }</div>
             <div class="calcdeck_result_qty button_stock" name="${
               cards.records[i].card.id
             }">${cards.records[i].ownedQty}</div>
           </li>
         `;
      const rowElement = new DOMParser().parseFromString(str_row, "text/html");
      rowElement.querySelector(".button_stock")!.addEventListener("click", (e) => {
        console.log((<HTMLElement>e.srcElement!).getAttribute("name"));
        console.log(cards.records[i].ownedQty);
        //カードの数量を変更する。
        if (cards.records[i].ownedQty >= cards.records[i].requiredQty) {
          cards.records[i].ownedQty = 0;
        } else {
          cards.records[i].ownedQty++;
        }
        
        this.renderResult();
      });
      tableElement!.appendChild(rowElement.querySelector("li")!);
    }

    if (!!resultElement) {
      resultElement.appendChild(cardDocument.querySelector("section")!);
    }
  }
}

interface Pack {
  pack: string;
  dmp: number;
}
