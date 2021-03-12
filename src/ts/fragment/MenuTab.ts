import { PubSub } from "../util/PubSub";
import { Constants } from "../util/Constants";

export class MenuTab {
  private strTabHtml: string = `
    <div class="menu_box">
      <div class="menu_tab selected" name="CalcDeck">デッキ計算</div>
      <div class="menu_tab" name="CalcAccount">アカウント計算</div>
      <div class="slide"></div>
    </div>
    `;

  private doc: Document;
  private container: HTMLElement;
  private pubsub: PubSub;
  private visibility: boolean;
  constructor(document: Document, container: HTMLElement, pubsub: PubSub) {
    this.pubsub = pubsub;
    this.doc = document;
    container.innerHTML = this.strTabHtml;
    this.container = container;
    this.visibility = false;

    //リスナ登録
    const tabs = this.doc.querySelectorAll<HTMLDivElement>(".menu_tab");
    if (!!tabs) {
      tabs.forEach((x) =>
        x.addEventListener("click", (e: Event) => {
          //タブの色をすべて白にする。
          tabs.forEach((y) => {
            y.classList.remove("selected");
          });
          //クリックされたタブの色を黒にする。
            x.classList.add("selected");
          //クリックされたタブ情報をpublish
          pubsub.publish(Constants.MENU_TAB_CLICKED, x);
        })
      );
    }
  }

  setVisibility(visibility: boolean) {
    this.visibility = visibility;
    this.container.style.display = this.visibility ? "block" : "none";
  }
}
