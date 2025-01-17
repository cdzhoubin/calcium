import Compute from "@/compiler/Compute";

import Emitter from "@/utils/Emitter";
import { FunctionInfo, Shortcut, RollbackToward } from "@/types";

export const version = "1.3.3";
export const errorText = "\\text{Error}";

export const functions: Map<string, FunctionInfo> = new Map([
    ["sin",          [(x) => Math.sin(x),                                    1]],
    ["cos",          [(x) => Math.cos(x),                                    1]],
    ["tan",          [(x) => Compute.safeTan(x),                             1]],
    ["cot",          [(x) => 1 / Compute.safeTan(x),                         1]],
    ["sec",          [(x) => 1 / Math.cos(x),                                1]],
    ["csc",          [(x) => 1 / Math.sin(x),                                1]],
    ["sin^{-1}",     [(x) => Math.asin(x),                                   1]],
    ["cos^{-1}",     [(x) => Math.acos(x),                                   1]],
    ["tan^{-1}",     [(x) => Math.atan(x),                                   1]],
    ["sinh",         [(x) => Math.sinh(x),                                   1]],
    ["cosh",         [(x) => Math.cosh(x),                                   1]],
    ["tanh",         [(x) => Math.tanh(x),                                   1]],
    ["coth",         [(x) => 1 / Math.tanh(x),                               1]],
    ["text{sech}",   [(x) => 1 / Math.cosh(x),                               1]],
    ["text{csch}",   [(x) => 1 / Math.sinh(x),                               1]],
    ["ln",           [(x) => Math.log(x),                                    1]],
    ["lg",           [(x) => Math.log10(x),                                  1]],
    ["log",          [(n, x) => Math.log(x) / Math.log(n),                   2]],
    ["deg",          [(x) => x * (Math.PI / 180),                            1]],
    ["text{rad}",    [(x) => x * (180 / Math.PI),                            1]],
    ["√",            [(x) => Math.sqrt(x),                                   1]],
    ["^3√",          [(x) => Math.cbrt(x),                                   1]],
    ["%",            [(x) => x / 100,                                        1]],
    ["text{not}",    [(x) => ~x,                                             1]],
    ["text{mean}",   [(...n) => Compute.mean(...n),                         -1]],
    ["text{median}", [(...n) => Compute.median(...n),                       -1]],
    ["text{stdev}",  [(...n) => Compute.stdev(...n),                        -1]],
    ["text{stdevp}", [(...n) => Compute.stdevp(...n),                       -1]],
    ["text{var}",    [(...n) => Compute.safePow(Compute.stdev(...n), 2),    -1]],
    ["text{count}",  [(...n) => n.length,                                   -1]],
    ["text{total}",  [(...n) => Compute.total(...n),                        -1]],
    ["text{min}",    [(...n) => Math.min(...n),                             -1]],
    ["text{max}",    [(...n) => Math.max(...n),                             -1]],
    ["text{nPr}",    [(n, r) => Compute.nPr(n, r),                           2]],
    ["text{nCr}",    [(n, r) => Compute.nCr(n, r),                           2]],
    ["text{xPx}",    [(x) => Compute.safePow(x, x),                          1]],
    ["exp",          [(x) => Compute.safePow(Math.E, x),                     1]],
    ["text{floor}",  [(x) => Math.floor(x),                                  1]],
    ["text{round}",  [(x) => Math.round(x),                                  1]],
    ["text{rand}",   [(a, b) => Math.floor(Math.random() * (b - a + 1) + a), 2]],
]);

export const constants: Map<string, number> = new Map([
    ["\\pi",      Math.PI],
    ["e",         Math.E],
    ["\\phi",     (Math.sqrt(5) - 1) / 2],
    ["\\text{坤}", Math.sqrt(2 * Math.PI)],
]);

/**
 * Auto Complete symbols Table (AC Table)
 */
export const acTable: Map<string, string> = new Map([
    ["alpha",  "\\alpha"],
    ["beta",   "\\beta"],
    ["gamma",  "\\gamma"],
    ["delta",  "\\delta"],
    ["epsi",   "\\epsilon"],
    ["zeta",   "\\zeta"],
    ["theta",  "\\theta"],
    ["iota",   "\\iota"],
    ["kappa",  "\\kappa"],
    ["lambda", "\\lambda"],
    ["mu",     "\\mu"],
    ["nu",     "\\nu"],
    ["xi",     "\\xi"],
    ["omic",   "\\omicron"],
    ["pi",     "\\pi"],
    ["rho",    "\\rho"],
    ["sigma",  "\\sigma"],
    ["tau",    "\\tau"],
    ["upsi",   "\\upsilon"],
    ["phi",    "\\phi"],
    ["chi",    "\\chi"],
    ["omega",  "\\omega"],
    ["psi",    "\\psi"],
    ["eta",    "\\eta"],
    ["dx",     "dx"],

    ["sin",    "\\sin("],
    ["cos",    "\\cos("],
    ["tan",    "\\tan("],
    ["cot",    "\\cot("],
    ["sec",    "\\sec("],
    ["csc",    "\\csc("],
    ["ln",     "\\ln("],
    ["lg",     "\\lg("],
    ["log",    "\\log("],
    ["deg",    "\\deg("],
    ["rad",    "\\text{rad}("],
    ["sqrt",   "√("],
    ["cbrt",   "^3√("],
    ["%",      "\\%("],
    ["mean",   "\\text{mean}("],
    ["median", "\\text{median}("],
    ["stdev",  "\\text{stdev}("],
    ["var",    "\\text{var}("],
    ["count",  "\\text{count}("],
    ["total",  "\\text{total}("],
    ["min",    "\\text{min}("],
    ["max",    "\\text{max}("],
    ["npr",    "\\text{nPr}("],
    ["ncr",    "\\text{nCr}("],
    ["xpx",    "\\text{xPx}("],
    ["exp",    "\\exp("],
    ["floor",  "\\text{floor}("],
    ["round",  "\\text{round}("],
    ["rand",   "\\text{rand}("],

    ["kun",    "\\text{坤}"],
]);

export const shortcuts: Map<string[], Shortcut> = new Map([
    [["ctrl", "x"], {
        description: "清空输入框",
        action: () => {
            Emitter.get().emit("clear-input");
        }
    }],
    [["ctrl", "d"], {
        description: "清空历史记录",
        action: () => {
            Emitter.get().emit("clear-record");
        }
    }],
    [["ctrl", "r"], {
        description: "清空输入框、历史记录以及函数图像列表",
        action: () => {
            Emitter.get().emit("clear-record");
            Emitter.get().emit("clear-input");
            Emitter.get().emit("clear-function");
        }
    }],
    [["ctrl", "e"], {
        description: "打开或关闭分数模式",
        action: () => {
            Emitter.get().emit("switch-tofrac");
        }
    }],
    [["shift", "ArrowLeft"], {
        description: "将光标移到前部",
        action: () => {
            Emitter.get().emit("move-front");
        }
    }],
    [["shift", "ArrowRight"], {
        description: "将光标移到尾部",
        action: () => {
            Emitter.get().emit("move-back");
        }
    }],
    [["ctrl", "f"], {
        description: "输入上一次的计算结果",
        action: () => {
            Emitter.get().emit("input-last-result");
        }
    }],
    [["ArrowUp"], {
        description: "输入上一个算式",
        action: () => {
            Emitter.get().emit("record-rollback", RollbackToward.PREV);
        }
    }],
    [["ArrowDown"], {
        description: "输入下一个算式",
        action: () => {
            Emitter.get().emit("record-rollback", RollbackToward.NEXT);
        }
    }],
]);
