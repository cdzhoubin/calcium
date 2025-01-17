import Compute from "@/compiler/Compute";

/** @see https://www.bbsmax.com/A/qVde1Y9AdP/ */
export default class Float {
    public static add(a: number, b: number): number {
        var r1: number;
        var r2: number;
        var m: number;

        try {
            r1 = Float.eTransfer(a).split(".")[1].length;
        } catch (e) {
            r1 = 0;
        }
        try {
            r2 = Float.eTransfer(b).split(".")[1].length;
        } catch (e) {
            r2 = 0;
        }

        m = Compute.safePow(10, Math.max(r1, r2));
        return (a * m + b * m) / m;
    }

    public static sub(a: number, b: number): number {
        var r1: number;
        var r2: number;
        var m: number;
        var n: number;

        try {
            r1 = Float.eTransfer(a).split('.')[1].length;
        } catch (e) {
            r1 = 0;
        }
        try {
            r2 = Float.eTransfer(b).split('.')[1].length;
        } catch (e) {
            r2 = 0;
        }

        m = Compute.safePow(10, Math.max(r1, r2));
        n = (r1 >= r2) ? r1 : r2;
        return parseFloat(((a * m - b * m) / m).toFixed(n));
    }

    public static multiply(a: number, b: number): number {
        var m = 0;
        var s1 = Float.eTransfer(a);
        var s2 = Float.eTransfer(b);

        try {
            m += s1.split('.')[1].length;
        } catch (e) {
            //
        }
        try {
            m += s2.split('.')[1].length;
        } catch (e) {
            //
        }

        return Number(s1.replace('.', '')) * Number(s2.replace('.', '')) / Compute.safePow(10, m);
    }

    public static divide(a: number, b: number): number {
        var t1 = 0;
        var t2 = 0;
        var r1: number;
        var r2: number;

        if(b === 0) return Infinity;

        try {
            t1 = Float.eTransfer(a).split('.')[1].length;
        } catch (e) {
            //
        }
        try {
            t2 = Float.eTransfer(b).split('.')[1].length;
        } catch (e) {
            //
        }

        r1 = Number(Float.eTransfer(a).replace('.', ''));
        r2 = Number(Float.eTransfer(b).replace('.', ''));
        var intDiv = r1 / r2;
        var pow = Compute.safePow(10, t2 - t1);
        return Float.multiply(intDiv, pow);
    }

    /** @see https://www.cnblogs.com/bien94/p/12728886.html */
    public static eTransfer(n: number): string {
        if(isNaN(n)) return n.toString();
        
        n = parseFloat(n +"");
        var eformat = n.toExponential();
        var tmpArray = eformat.match(/\d(?:\.(\d*))?e([+-]\d+)/);
        if(!tmpArray) return NaN.toString();
        var number = n.toFixed(Math.max(0, (tmpArray[1] || '').length - (tmpArray[2] as any)));
        return number;
    }

    public static calibrate(n: number): number {
        // n is in [a,b]
        const a = Math.floor(n);
        const b = a + 1;
        const calibratingNum = 1e-14;

        if(Float.sub(n, a) <= calibratingNum) return a;
        if(Float.sub(b, n) <= calibratingNum) return b;

        return n;
    }
}
