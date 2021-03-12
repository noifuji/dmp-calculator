import { CardRepositoryImpl } from "../infla/CardRepositoryImpl";
import { Card } from "../entity/Card";
require("fake-indexeddb/auto");

test('test', async () => {
    let repo = new CardRepositoryImpl();
    repo.insert(newFunction());
    
    let card:Card|undefined = await repo.findById("1000");
    
    
    expect("test").toBe(card!.name);
});

function newFunction(): Card {
    return new Card("1000", "test", "race", "type", "闇", "rarity", 0, "power", 0, "text", "flavor", 0, 0, "DMPP8",true);
}
