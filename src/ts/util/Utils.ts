import { Constants } from "../util/Constants";

export class Utils {
  public static parseStringToElement(str: string) {
    const doc = new DOMParser().parseFromString(str, "text/html");
    const body = doc.querySelector("body");
    if (body!.children.length == 1) {
      return body!.firstChild;
    } else {
      throw new Error("The entered string must have only 1 element.");
    }
  }

  public static removeChildren(element: HTMLElement) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }
  
  public static getManaColorClass(manaColor: string) {
    let classname = "mana_color";
    if (manaColor.indexOf(Constants.MANA_COLOR_WHITE) != -1) {
      classname = classname + "_white";
    }
    if (manaColor.indexOf(Constants.MANA_COLOR_BLUE) != -1) {
      classname = classname + "_blue";
    }
    if (manaColor.indexOf(Constants.MANA_COLOR_BLACK) != -1) {
      classname = classname + "_black";
    }
    if (manaColor.indexOf(Constants.MANA_COLOR_RED) != -1) {
      classname = classname + "_red";
    }
    if (manaColor.indexOf(Constants.MANA_COLOR_GREEN) != -1) {
      classname = classname + "_green";
    }

    return classname;
  }
  
  public static getCardIdsFromURL(strUrl: string) {
    let validUrl = true;
    let url: URL | null = null;
    try {
      url = new URL(strUrl);
    } catch (e) {
      validUrl = false;
    }
    
    let result: string[] = [];
    
    if (validUrl && !!url && url.host === "dmps.takaratomy.co.jp" && url.pathname === "/deckbuilder/deck/") {
      const c = new URLSearchParams(url.search).get("c");
      if(!!c) {
        result = c.split(".").map(x => Utils.convertUrl2CardId(x));
      }
    } else {
      throw new Error("Invalid URL");
    }
    
    return result;
  }
  
  public static getKeyCardIdFromURL(strUrl: string) {
    let validUrl = true;
    let url: URL | null = null;
    try {
      url = new URL(strUrl);
    } catch (e) {
      validUrl = false;
    }
    
    let result: string[] = [];
    
    if (validUrl && !!url && url.host === "dmps.takaratomy.co.jp" && url.pathname === "/deckbuilder/deck/") {
      const c = new URLSearchParams(url.search).get("k");
      if(!!c) {
        result = c.split(".").map(x => Utils.convertUrl2CardId(x));
      }
    } else {
      throw new Error("Invalid URL");
    }
    
    return result[0];
  }
  
  public static convertUrl2CardId(txt: string) {
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
