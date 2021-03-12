import { CalcDeck } from "./fragment/CalcDeck";
import { CalcAccount } from "./fragment/CalcAccount";
import { MenuTab } from "./fragment/MenuTab";
import { PubSub } from "./util/PubSub";
import { Constants } from "./util/Constants";

class AppShell {
  //メニューの状態
  //各機能のオブジェクト
  private calcDeck: CalcDeck;
  private calcAccount: CalcAccount;
  private menuTab: MenuTab;
  private pubsub: PubSub;

  constructor() {
    this.pubsub = new PubSub();

    const deckContentsElement = <HTMLElement>document.querySelector("#calcdeck_contents");
    this.calcDeck = new CalcDeck(document, deckContentsElement, this.pubsub);
    this.calcDeck.setVisibility(true);
    
    const accountContentsElement = <HTMLElement>document.querySelector("#calcaccount_contents");
    this.calcAccount = new CalcAccount(document, accountContentsElement, this.pubsub);
    this.calcAccount.setVisibility(false);

    const menuTabElement = <HTMLElement>document.querySelector("#menu_tab");
    this.menuTab = new MenuTab(document, menuTabElement, this.pubsub);

    this.pubsub.subscribe(Constants.MENU_TAB_CLICKED, (tab: HTMLDivElement) => {
      const menuName = tab.getAttribute("name");
      this.calcDeck.setVisibility(false);
      this.calcAccount.setVisibility(false);

      if (menuName === "CalcDeck") {
        this.calcDeck.setVisibility(true);
      } else if(menuName === "CalcAccount") {
        this.calcAccount.setVisibility(true);
      }
    });
    
    //help button
    const helpElement = <HTMLElement>document.querySelector("#icon_help");
    if(!!helpElement) {
      helpElement.addEventListener("click", (e) => this.pubsub.publish(Constants.HELP_CLICKED));
    }

    //share button
    const shareElement = <HTMLElement>document.querySelector("#icon_share");
    if (!!shareElement) {
      let nav: any = window.navigator;
      if (!!nav.share) {
        shareElement.addEventListener("click", async (e) => {
          const shareData = {
            title: "デュエプレポイント計算",
            text: "デュエプレを効率よく攻略しよう",
            url: "https://dmpcalc.link/",
          };
          try {
            await nav.share(shareData);
          } catch (err) {
            console.log(err);
          }
        });
      } else {
        shareElement.style.display = "none";
      }
    }
  }

  //メニューボタンが押されたときのコールバック
  //DOMを片付けてから、選ばれたメニューの機能を再構築
  //
}

document.addEventListener("DOMContentLoaded", () => new AppShell());
