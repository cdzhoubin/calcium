import React, { useState, useEffect } from "react";
import { AliveScope } from "react-activation";

import { shortcuts } from "@/global";
import { Mode, RenderedFunction } from "@/types";
import Utils from "@/utils/Utils";

// Layout
import "katex/dist/katex.min.css";
import "use-context-menu/styles.css";
import "react-tooltip/dist/react-tooltip.css";
import "@nocp/toggle/dist/toggle.css";
import "@/style/layout.less";

// Components
import Calculator from "@/views/Calculator";
import Sidebar from "@/components/sidebar";
import StatusBar from "@/components/statusbar";

// Contexts
import MainContext from "@/contexts/MainContext";

const App: React.FC = () => {
	const [mode, setMode] = useState<Mode>(Mode.GENERAL);
	const [functionList, setFunctionList] = useState<RenderedFunction[]>([]);

	useEffect(() => {
		document.body.addEventListener("keydown", (e: KeyboardEvent) => {
			shortcuts.forEach((shortcut, key) => {
				if(
					key.includes(e.key) &&
					(
						(e.ctrlKey && key.includes("ctrl")) ||
						(e.shiftKey && key.includes("shift")) ||
						(e.altKey && key.includes("alt")) ||
						(key.length === 1)
					)
				) {
					e.preventDefault();
					shortcut.action();
				}
			});
		});

		document.body.addEventListener("contextmenu", (e: MouseEvent) => {
			e.preventDefault();
		});

		// To prevent some part of the page being covered by the bottom toolbar of mobile browsers
		if(Utils.isMobile()) {
			const { height } = Utils.getWindowConfig();
			document.body.style.height = height +"px";
			Utils.getElem("calcium-main").style.height = height +"px";
		}
	}, []);

	return (
		<main className="calcium" id="calcium-main">
			<MainContext.Provider value={{ mode, setMode, functionList, setFunctionList }}>
				<AliveScope>
					<div className="app">
						<Sidebar />
						<Calculator />
					</div>
					<StatusBar />
				</AliveScope>
			</MainContext.Provider>
		</main>
	);
}

export default App;
