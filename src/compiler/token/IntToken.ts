import DynamicToken from "@/compiler/token/DynamicToken";
import { TokenType } from "@/compiler/token/Token";
import Compiler from "@/compiler/Compiler";
import { NumberSys } from "@/types";

export default class IntToken extends DynamicToken {
    public type: TokenType = TokenType.INT;

    public a: number;
    public b: number;

    public constructor(a: number, b: number, raw: string[], variables: Map<string, string>) {
        super(raw, variables);

        this.a = a;
        this.b = b;
    }

    public evaluate(): number {
        if(!this.raw.includes("dx")) return NaN;
        
        const dx = .0001;
        const n = (this.b - this.a) / dx;

        const f = (x: number): number => {
            var compiler = new Compiler(this.raw, this.variables.set("dx", dx.toString()).set("x", x.toString()), false, NumberSys.DEC);
            return parseFloat(compiler.compile());
        }

        /**
         * By Bing AI
         */

        var sum = f(this.a) + f(this.b);
        for(let i = 1; i < n; i++) {
            var x = this.a + i * dx;
            sum += f(x) * (i % 2 ? 4 : 2);
        }
        return (sum * dx / 3) * 10000;
    }
}
