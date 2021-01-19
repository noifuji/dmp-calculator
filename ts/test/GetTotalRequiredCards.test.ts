import { GetTotalRequiredCards } from '../usecase/GetTotalRequiredCards';
import { CardRepositoryImpl } from "../infla/CardRepositoryImpl";
require("fake-indexeddb/auto");


test('test', () => {
    let usecase = new GetTotalRequiredCards(new CardRepositoryImpl());
    expect("71200").toBe(usecase.convertUrl2CardId("GICH"));
});