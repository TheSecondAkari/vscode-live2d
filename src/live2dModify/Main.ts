
import * as vscode from 'vscode';
import * as path from 'path';
import version from './version';
import { Dom } from './Dom';

export class Main {
	public static watch(): vscode.Disposable {
		console.log('qweqwe')
		const base = path.dirname(require.main.filename);
		const filePath = path.join(base, 'vs', 'code', 'electron-browser', 'workbench', 'workbench.js');
		console.log('ewq', base, filePath)
		const extName = "TheSecondAkari-vscode-live2d";
		let DomApi = new Dom(extName, filePath, version, extName);
		return vscode.workspace.onDidChangeConfiguration(() => DomApi.install());
	}
}