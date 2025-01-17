import React, {
    useState,
    useEffect,
    useRef,
    useCallback
} from "react";
import { BlockMath, InlineMath } from "react-katex";
import { useContextMenu, ContextMenuItem } from "use-context-menu";

import { HistoryItemInfo } from "@/components/sidebar/History";

import { errorText, acTable } from "@/global";
import Emitter from "@/utils/Emitter";
import Utils from "@/utils/Utils";
import Compiler from "@/compiler/Compiler";
import Compute from "@/compiler/Compute";
import Is from "@/compiler/Is";
import Logger from "@/utils/Logger";
import { NumberSys, RecordType } from "@/types";

import useEmitter from "@/hooks/useEmitter";
import useEaster from "@/hooks/useEaster";

import InputBox, { cursor } from "@/components/InputBox";
import SidebarOpener from "@/components/SidebarOpener";
import type Dialog from "@/components/Dialog";
import VariableDialog from "@/dialogs/VariableDialog";
import FunctionDialog from "@/dialogs/FunctionDialog";
import SumDialog from "@/dialogs/SumDialog";
import IntDialog from "@/dialogs/IntDialog";
import ProdDialog from "@/dialogs/ProdDialog";

const Output: React.FC = () => {
    const [outputContent, setOutputContent] = useState<string>("");
    const [isTofrac, setIsTofrac] = useState<boolean>(false);
    const variableRef = useRef<Map<string, string>>(new Map<string, string>());
    const inputRef = useRef<InputBox>(null);
    const varsDialogRef = useRef<Dialog>(null);
    const funcsDialogRef = useRef<Dialog>(null);
    const sumDialogRef = useRef<Dialog>(null);
    const intDialogRef = useRef<Dialog>(null);
    const prodDialogRef = useRef<Dialog>(null);

    const handleTofracSwitch = () => {
        setIsTofrac((current) => !current);
    };

    const handleResult = useCallback((currentContent: string) => {
        if(currentContent.split(" ").length <= 1) return;

        // Remove cursor from raw text
        var rawText = InputBox.removeCursor(currentContent);
        var raw = rawText.split(" ");

        if(rawText === "2 . 5") {
            setOutputContent("2.5c^{trl}"); // Chicken is beautiful
            return;
        }

        if(Is.variable(raw[0]) && raw[1] === "=") { // variable declaring or setting
            const varName = raw[0];

            // Remove variableName and `=`
            raw = Utils.arrayRemove(raw, 0);
            raw = Utils.arrayRemove(raw, 0);

            var variableCompiler = new Compiler(raw, variableRef.current);
            var variableValue = variableCompiler.compile();
            var variableError = false;

            if(variableValue.indexOf("NaN") > -1 || variableValue === "") variableError = true;

            if(!variableError) {
                variableRef.current.set(varName, variableValue);
                setOutputContent(varName +"="+ variableRef.current.get(varName));
            } else {
                setOutputContent(varName +"=\\text{"+ errorText +"}");
            }

            return;
        }

        var compiler = new Compiler(raw, variableRef.current);
        var result = compiler.compile();
        var error = false;

        if(result.indexOf("NaN") > -1 || result === "") error = true;

        // tofrac
        if(isTofrac && result.indexOf(".") > -1 && result.split(".")[1].length <= 7) {
            const [a, b] = Compute.toFrac(parseFloat(result));
            result = "\\frac{"+ a +"}{"+ b +"}";
        }

        // Display the result
        if(result.indexOf("Infinity") > -1) result = result.replace("Infinity", "\\infty");
        if(!error) {
            setOutputContent("="+ result);
            Logger.info("Calculated: "+ rawText.replaceAll(" ", "") +"="+ result);
        } else {
            setOutputContent("=\\text{"+ errorText +"}");
            Logger.error("Error");
        }

        if(error) return;

        // Add the result to history list
        Emitter.get().emit("add-record", rawText, result, RecordType.GENERAL, NumberSys.DEC);
    }, [isTofrac]);

    const handleInput = useCallback((symbol: string) => {
        if(!inputRef.current) return;
        const inputBox = inputRef.current;
        const currentContent = inputBox.state.displayContent;

        var contentArray = currentContent.split(" ");
        var cursorIndex = inputBox.getCursorIndex();

        switch(symbol) {
            case "\\text{Clear}":
                setOutputContent("");
                return cursor;
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
                Emitter.get().emit("clear-record");
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
            case "^":
                if(contentArray[cursorIndex - 1].indexOf("^") > -1) {
                    const currentExponentialStr = contentArray[cursorIndex - 1].replace("^", "");
                    const newExponential = parseInt(currentExponentialStr) + 1;
                    if(newExponential > 9) return;

                    contentArray[cursorIndex - 1] = "^"+ newExponential;
                    return contentArray.join(" ");
                }

                return currentContent.replace(cursor, "^2 "+ cursor);
            case "\\sum":
                sumDialogRef.current?.open();
                return;
            case "\\int":
                intDialogRef.current?.open();
                return;
            case "\\prod":
                prodDialogRef.current?.open();
                return;
            default:
                // Auto complete
                tableLoop: for(let [key, value] of acTable) {
                    if(symbol !== key[key.length - 1]) continue;

                    const lastCharIndex = cursorIndex;
                    for(let i = lastCharIndex - 1; i > lastCharIndex - key.length; i--) {
                        if(i < 0) continue tableLoop;

                        const j = i - (lastCharIndex - key.length + 1);
                        if(contentArray[i] !== key[j]) continue tableLoop;
                    }

                    key.length !== 1
                    ? contentArray[lastCharIndex - (key.length - 1)] = value
                    : contentArray = Utils.arrayPut(contentArray, lastCharIndex, value);
                    for(let i = lastCharIndex - 1; i >= lastCharIndex - key.length + 2; i--) {
                        contentArray = Utils.arrayRemove(contentArray, i);
                    }

                    if(Is.mathFunction(value)) { // Add right bracket automatically
                        setOutputContent("");
                        return contentArray.join(" ").replace(cursor, cursor +" )");
                    }

                    return contentArray.join(" ");
                }

                if(symbol === "(" || Is.mathFunction(symbol)) { // Add right bracket automatically
                    setOutputContent("");
                    return currentContent.replace(cursor, symbol +" "+ cursor +" )");
                }

                // Default (normal) Input
                setOutputContent("");
                return currentContent.replace(cursor, symbol +" "+ cursor);
        }
    }, [inputRef, handleResult]);

    useEffect(() => {
        var pureContent = outputContent.replace("=", "");
        if(pureContent === "\\text{"+ errorText +"}") return;
        if(pureContent === "\\infty") return;

        if(isTofrac && pureContent.indexOf(".") > -1 && pureContent.split(".")[1].length <= 7) {
            setOutputContent("="+ Utils.strToFrac(pureContent));
            return;
        }

        if(!isTofrac && pureContent.indexOf("\\frac{") > -1) {
            setOutputContent("="+ Utils.fracToStr(pureContent));
        }
    }, [isTofrac, outputContent]);

    useEmitter([
        ["clear-input", () => setOutputContent("")],
        ["switch-tofrac", () => handleTofracSwitch()],
        ["history-item-click", (itemInfo: HistoryItemInfo) => {
            if(itemInfo.type !== RecordType.GENERAL) return;
            if(!inputRef.current) return;

            inputRef.current.value = itemInfo.input +" "+ cursor;
            setOutputContent("="+ itemInfo.output);
        }],
        ["open-vars-dialog", () => varsDialogRef.current?.open()],
        ["open-funcs-dialog", () => funcsDialogRef.current?.open()],
        ["do-input", (symbol: string) => inputRef.current?.handleInput(symbol)],
        ["set-content", (inputContent: string, outputContent: string = "") => {
            if(!inputRef.current) return;

            if(inputContent.replaceAll(" ", "").indexOf("\\frac{") > -1) {
                inputContent = Utils.fracToStr(inputContent).split("").join(" ");
            }

            inputRef.current.value = inputContent +" "+ cursor;
            setOutputContent((outputContent.length !== 0 ? "=" : "")+ outputContent);
        }]
    ]);

    useEaster(setOutputContent); // K U N

    const { contextMenu, onContextMenu } = useContextMenu(
        <>
            <ContextMenuItem onSelect={() => Emitter.get().emit("clear-input")}>清空</ContextMenuItem>
            <ContextMenuItem onSelect={() => Utils.writeClipboard(outputContent.substring(1))}>复制结果</ContextMenuItem>
        </>
    );

    return (
        <>
            <div
                className="output-container"
                onContextMenu={onContextMenu}>
                {/* Mobile only */}
                {Utils.isMobile() && <SidebarOpener />}

                <span className="output-tag">Output</span>
                <button className={"tofrac-switcher"+ (isTofrac ? " active" : "")} onClick={() => handleTofracSwitch()}>
                    <InlineMath math="\frac{a}{b}"/>
                </button>
                <InputBox
                    ref={inputRef}
                    ltr={false}
                    onInputSymbol={(symbol) => handleInput(symbol)}/>
                <div className="output-box">
                    <span className="display">
                        {outputContent.split(" ").map((symbol, index) => <BlockMath key={index}>{symbol}</BlockMath>)}
                    </span>
                </div>

                {/* Dialogs */}
                <VariableDialog variableList={variableRef.current} ref={varsDialogRef}/>
                <FunctionDialog ref={funcsDialogRef}/>
                <SumDialog ref={sumDialogRef}/>
                <IntDialog ref={intDialogRef}/>
                <ProdDialog ref={prodDialogRef}/>
            </div>
            {contextMenu}
        </>
    );
}

export default Output;
