import { CalcDMP } from "./CalcDMP";

let calcDMP : CalcDMP;

const contentsElem = document.getElementById('contents');
if(!!contentsElem && contentsElem instanceof HTMLElement) {
    calcDMP = new CalcDMP(document, contentsElem);
}

document.addEventListener("DOMContentLoaded", ()=> {
    calcDMP.onStart();
});