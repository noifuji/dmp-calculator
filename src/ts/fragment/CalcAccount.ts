import { PubSub } from "../util/PubSub";
import { Account } from "../usecase/Account";
import { Utils } from "../util/Utils";

/*
・入力項目
所持ゴールド
所持DMP
所持パックチケット
所持SRチケット
ビルダーチケット
スーパーデッキチケット
カード枚数(SR)
カード枚数(VR)
カード枚数(R)
カード枚数(UC)
カード枚数(C)

・出力項目
換算DMP
*/

export class CalcAccount {
    
    private inputs = [{id:"txt_gold", label:"ゴールド"},
    {id:"txt_dmp", label:"DMポイント"},
    {id:"txt_pack", label:"パック"},
    {id:"txt_srpack", label:"SRパック"},
    {id:"txt_sr_qty", label:"SR枚数"},
    {id:"txt_vr_qty", label:"VR枚数"},
    {id:"txt_r_qty", label:"R枚数"},
    {id:"txt_uc_qty", label:"UC枚数"},
    {id:"txt_c_qty", label:"C枚数"},
    {id:"txt_builder", label:"ビルダーチケット"},
    {id:"txt_super", label:"スーパーデッキ"}];
    
    private str_main_html: string = `
    <div class="calcdeck_main">
      ${this.inputs.map((x) => `
      <div class="calcdeck_url_entry_container">
        <div class="calcaccount_entry_label"><label>${x.label}</label></div>
        <div class="calcdeck_url_entry_input">
          <input id="${x.id}" class="calcdeck_url_entry_text" type="number">
        </div>
      </div>
      `).join(``)}
      
      <div class="calcdeck_result">
        <div id="calcdeck_result_card_list"></div>
      </div>
    </div>
  `;
  
  private pubsub: PubSub;
  private container: HTMLElement;
  private visibility: boolean;
    
    constructor(document: Document, container: HTMLElement, pubsub: PubSub) {
        this.pubsub = pubsub;
   　　　this.container = container;
        this.visibility = false;
        container.innerHTML = this.str_main_html;
        
        this.container.style.display = this.visibility ? "block" : "none";
        //ヘルプ用モーダルの設定
        //イベントリスナ登録
        this.inputs.forEach((x) => {
            const tmp = this.container.querySelector("#" + x.id);
            if (!!tmp) {
                tmp.addEventListener("input", (e: Event) =>{
                    this.renderResult();
                });
                tmp.addEventListener("keydown", (e:Event) => {
                    const event = <KeyboardEvent>e;
                    if (event.isComposing || event.keyCode === 229) {
                        return;
                    }
                    
                    if(event.keyCode === 13) {
                        //現在のidを取得
                        const currentElement = <HTMLElement>e.srcElement;
                        if(!currentElement) {
                           return; 
                        }
                        //次のidを取得
                        const currentIndex = this.inputs.map(x => x.id).indexOf(currentElement.id);
                        if(currentIndex < this.inputs.length - 1) {
                            const nextElement = <HTMLElement>this.container.querySelector("#" + this.inputs[currentIndex + 1].id);
                            if(!!nextElement) {
                                nextElement.focus();
                            }
                        }
                        //次のフォーカスする。
                    }
                });
            }
        });
        
        //チュートリアル表示
    }
    
    setVisibility(visibility: boolean) {
    　　this.visibility = visibility;
    　　this.container.style.display = this.visibility ? "block" : "none";
  　}
    
    renderTutorial() {
        
    }
    
    renderResult() {
        const accountInfo = this.inputs.map((x) => {
            if(!!x) {
                return Number((<HTMLTextAreaElement>this.container.querySelector("#" + x.id)).value);
            } else {
                return 0;
            }
        });
        const account = new Account(accountInfo[0],
        accountInfo[1],
        accountInfo[2],
        accountInfo[3],
        accountInfo[4],
        accountInfo[5],
        accountInfo[6],
        accountInfo[7],
        accountInfo[8],
        accountInfo[9],
        accountInfo[10]);
        
        let dmp: number = account.getToalInDmp();
        const strDMP = `
          <section class="card">
            <div class="card-content">
              <p class="card-title">換算DMポイント</p>
              <p class="card-text">${Math.floor(dmp).toLocaleString()}</p>
            </div>
          </section>
          `;
        const requiredDMPElement = Utils.parseStringToElement(strDMP);
        const resultElement = <HTMLElement>this.container.querySelector("#calcdeck_result_card_list");
        if(!!resultElement && !!requiredDMPElement){
          Utils.removeChildren(resultElement);
          resultElement.appendChild(requiredDMPElement);
        }
    }
    
}