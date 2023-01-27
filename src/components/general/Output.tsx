/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useEffect } from "react";
import { BlockMath, InlineMath } from "react-katex";

import Emitter from "../../utils/Emitter";
import Utils from "../../utils/Utils";
import Compiler from "../../utils/Compiler";

import InputBox, { specialSymbols, cursor } from "../InputBox";
import Dialog from "../Dialog";

const Output: React.FC = () => {
    const [outputContent, setOutputContent] = useState<string>("");
    const variableRef = useRef<Map<string, string>>(new Map<string, string>());
    const inputRef = useRef<InputBox>(null);
    const varsDialogRef = useRef<Dialog>(null);
    const funcsDialogRef = useRef<Dialog>(null);

    const handleInput = (symbol: string) => {
        if(!inputRef.current) return;
        const inputBox = inputRef.current;
        const currentContent = inputBox.state.displayContent;

        var contentArray = currentContent.split(" ");
        var cursorIndex = inputBox.getCursorIndex();

        switch(symbol) {
            case "\\text{Clear}":
                inputBox.reset();
                setOutputContent("");
                break;
            case "Backspace":
            case "\\text{Del}":
                var target = cursorIndex;
                if(contentArray[target] === cursor) {
                    target--;
                    if(target < 0) return;
                }

                contentArray = Utils.arrayRemove(contentArray, target);

                setOutputContent("");
                return contentArray.join(" ");
            case "\\text{CH}":
                /** @todo */
                // Emitter.get().emit("add-record", undefined, undefined);
                break;
            case "ArrowLeft":
            case "\\leftarrow":
                if(cursorIndex === 0) return;

                return inputBox.moveCursorTo(cursorIndex - 1);
            case "ArrowRight":
            case "\\rightarrow":
                if(cursorIndex === contentArray.length - 1) return;

                return inputBox.moveCursorTo(cursorIndex + 1);
            case "Enter":
            case "\\text{Result}":
                if(contentArray.length > 1) handleResult(currentContent);
                return;
            case "\\text{Vars}":
                varsDialogRef.current?.open();
                break;
            case "\\text{Funcs}":
                funcsDialogRef.current?.open();
                break;
            case "i": // Pi
                if(contentArray[cursorIndex - 1] === "p") {
                    contentArray[cursorIndex - 1] = "\\pi";
                    return contentArray.join(" ");
                } else {
                    setOutputContent("");
                    return currentContent.replace(cursor, symbol +" "+ cursor);
                }
            default:
                // Function auto complete
                for(let i = 0; i < specialSymbols.length; i++) {
                    var specialSymbol = specialSymbols[i];
                    if(symbol === specialSymbol[specialSymbol.length - 1]) {
                        var splited = specialSymbol.split("");
                        var passed = true;
                        for(let j = splited.length - 2; j >= 0; j--) {
                            if(contentArray[cursorIndex - (splited.length - j) + 1] !== splited[j]) {
                                passed = false;
                            }
                        }
                        if(passed) {
                            var begin = cursorIndex - splited.length + 1;
                            contentArray[begin] = "\\"+ specialSymbol +"(";
                            for(let j = 0; j < splited.length - 2; j++) {
                                contentArray = Utils.arrayRemove(contentArray, begin + 1);
                            }

                            return contentArray.join(" ");
                        }
                    }
                }
                
                setOutputContent("");
                return currentContent.replace(cursor, symbol +" "+ cursor);
        }
    };

    const handleResult = (currentContent: string) => {
        if(currentContent.split(" ").length <= 1) return;

        // Remove cursor from raw text
        var rawText = InputBox.removeCursor(currentContent);
        var raw = rawText.split(" ");

        if(rawText === "2 . 5") {
            setOutputContent("2.5c^{trl}"); // Chicken is beautiful
            return;
        }

        if(Compiler.isVariable(raw[0]) && raw[1] === "=") { // variable declaring or setting
            const varName = raw[0];

            raw = Utils.arrayRemove(raw, 0);
            raw = Utils.arrayRemove(raw, 0);

            variableRef.current.set(varName, new Compiler(raw, variableRef.current).run());
            setOutputContent(varName +"="+ variableRef.current.get(varName));
            return;
        }

        var compiler = new Compiler(raw, variableRef.current);

        var result = compiler.run();
        if(result.indexOf("NaN") > -1 || result === "") result = "\\text{Error}";

        // Display the result
        setOutputContent("="+ result);

        // Add the result to history list
        Emitter.get().emit("add-record", rawText, result);
    };

    useEffect(() => {
        document.body.addEventListener("keydown", (e: KeyboardEvent) => {
            if(e.ctrlKey && e.key === "m") { // ctrl + m
                setOutputContent("c^{xk}+c^{trl}"); // I'm iKun
                return;
            }
        });
    }, []);

    return (
        <div className="output-container">
            <span className="output-tag">Output</span>
            <InputBox
                ref={inputRef}
                ltr={true}
                onInput={(symbol) => handleInput(symbol)}/>
            <div className="output-box">
                <span className="display">
                    {outputContent.split(" ").map((symbol, index) => <BlockMath key={index}>{symbol}</BlockMath>)}
                </span>
            </div>

            {/* Dialogs */}
            <Dialog title="Variables" id="vars-dialog" ref={varsDialogRef}>
                <table>
                    <thead>
                        <tr>
                            <th>Variable Name</th>
                            <th>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <InlineMath>\pi</InlineMath>
                            </td>
                            <td>{Math.PI}</td>
                        </tr>
                        <tr>
                            <td>
                                <InlineMath>e</InlineMath>
                            </td>
                            <td>{Math.E}</td>
                        </tr>
                        {
                            Array.from(variableRef.current).map(([varName, value], index) => {
                                return (
                                    <tr key={index}>
                                        <td>
                                            <InlineMath>{varName}</InlineMath>
                                        </td>
                                        <td>{value}</td>
                                    </tr>
                                );
                            })
                        }
                    </tbody>
                </table>
            </Dialog>
            <Dialog title="Functions" id="funcs-dialog" ref={funcsDialogRef}>
                <table>
                    <thead>
                        <tr>
                            <th>Function Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            Array.from(Compiler.functions).map(([funcName, value], index) => {
                                if(funcName === "%") funcName = "\\%"; // "%" won't display in KaTeX

                                return (
                                    <tr key={index}>
                                        <td>
                                            <InlineMath>
                                                {
                                                    funcName.indexOf("text{") > -1
                                                    ? funcName.replace("text{", "").replace("}", "")
                                                    : funcName
                                                }
                                            </InlineMath>
                                        </td>
                                    </tr>
                                );
                            })
                        }
                    </tbody>
                </table>
            </Dialog>
        </div>
    );
}

export default Output;