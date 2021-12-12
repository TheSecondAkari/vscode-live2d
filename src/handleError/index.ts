
import * as vscode from 'vscode';
import { writeFileSync } from 'fs';


const handleError = (str: string) => {
	writeFileSync('D:\\myProject\\vscode-live2d\\eee.txt', str + '\n\n' + str.match(/\[31m(.*)\[m/g)?.map(i => i.replace(/\[31m|\[H|\[m|\[24m/g, ''))?.join(' '), {
		encoding: 'utf8',
	});

}

const WatchTerminalData = (e: any) => {
	handleError(e.data);
}

let DisposableWatchTerminal: any;

export function activateErrorWatch(context: vscode.ExtensionContext) {
	DisposableWatchTerminal = vscode.window?.onDidWriteTerminalData(WatchTerminalData);
}

export function deactivateErrorWatch() {
	console.log('关闭')
	if (DisposableWatchTerminal) {
		DisposableWatchTerminal();
		DisposableWatchTerminal = undefined;
	}
}