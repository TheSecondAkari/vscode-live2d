
import * as vscode from 'vscode';
import * as path from 'path';
import version from './version';
import { Dom } from './Dom';
import {
	Uri,
	window,
	InputBoxOptions,
	commands,
	env,
  } from 'vscode';


export class Main {
	static Instance?: Dom;

	public static watch(): vscode.Disposable {
		const base = env.appRoot;
		const filePath = path.join(base,'out','vs', 'code', 'electron-sandbox', 'workbench', 'workbench.js');
		const configName = 'vscode-live2d-asoul';
		const extName = "TheSecondAkari-vscode-live2d";
		let DomApi = new Dom(configName, filePath, version, extName);
		Main.Instance = DomApi;
		return vscode.workspace.onDidChangeConfiguration(() => DomApi.install());
	}
}