export class PubSub {
    private registry:{ [key: string]: any };
    
    constructor() {
        this.registry = {};
    }
    
    public publish(name: string, ...args: any) {
        if (!this.registry[name]) return;

        this.registry[name].forEach((x: { apply: (arg0: null, arg1: any) => void; }) => {
            x.apply(null, args);
        });
    }
    public subscribe(name: string, fn: any) {
        if (!this.registry[name]) {
            this.registry[name] = [fn];
        } else {
            this.registry[name].push(fn);
        }
    };
}