/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";

import type { NumberSys } from "@/types";
import Emitter from "@/utils/Emitter";
import Utils from "@/utils/Utils";

interface NumberBoxProps {
    value: string
    type: NumberSys
}

const NumberBox: React.FC<NumberBoxProps> = (props) => {
    const [isActive, setIsActive] = useState<boolean>(false);

    const clickHandle = () => {
        Emitter.get().emit("number-sys-chose", props.type);
    };

    useEffect(() => {
        Emitter.get().on("number-sys-chose", (type: NumberSys) => {
            setIsActive(type === props.type);
        });
    }, []);

    return (
        <li className={"number-box"+ (isActive ? " active" : "")} onClick={() => clickHandle()}>
            <span className="name">{Utils.firstLetterUpperCase(props.type)}</span>
            <span className="number">{props.value}</span>
        </li>
    );
}

export default NumberBox;
