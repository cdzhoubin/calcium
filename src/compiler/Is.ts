import { constants } from "@/global";

export default class Is {
    public static number(symbol: string, isProgrammingMode: boolean): boolean {
        const number = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "e", "\\pi", "."];
        if(!symbol) return false;
        
        if(isProgrammingMode) {
            return (number.indexOf(symbol) > -1 || (symbol.charCodeAt(0) >= 97 && symbol.charCodeAt(0) <= 122) /* a~z */) && symbol.length === 1;
        } else {
            return number.indexOf(symbol) > -1;
        }
    }
    
    public static operator(symbol: string): boolean {
        const operator = [
            "+", "-", "×", "/",
            "and", "or", "nand", "nor", "xor",
            "lsh", "rsh"
        ];
        return operator.indexOf(symbol) > -1;
    }
    
    public static leftBracket(symbol: string): boolean {
        const leftBracket = ["(", "["];
        return leftBracket.indexOf(symbol) > -1;
    }
    
    public static rightBracket(symbol: string): boolean {
        const rightBracket = [")", "]"];
        return rightBracket.indexOf(symbol) > -1;
    }
    
    public static mathFunction(symbol: string): boolean {
        const specialFunction = ["√(", "^3√("];
        return (symbol[0] === "\\" && symbol[symbol.length - 1] === "(") || specialFunction.indexOf(symbol) > -1;
    }
    
    public static variable(symbol: string): boolean {
        const variableSymbol = [
            "a", "b", "c", "d", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
            "\\alpha", "\\beta", "\\gamma", "\\delta", "\\epsilon", "\\zeta", "\\eta", "\\theta", "\\iota", "\\kappa", "\\lambda",
            "\\mu", "\\nu", "\\xi", "\\omicron", "\\rho", "\\sigma", "\\tau", "\\upsilon", "\\phi", "\\chi", "\\psi", "\\omega",
            "\\Delta", "dx", "\\text{坤}"
        ];
        return variableSymbol.indexOf(symbol) > -1;
    }

    public static constant(symbol: string): boolean {
        return constants.has(symbol);
    }

    public static float(number: number): boolean {
        return Math.floor(number) !== number;
    }
}
