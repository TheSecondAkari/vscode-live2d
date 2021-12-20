// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {activateLive2d} from './live2dView';
import {activateModify} from './live2dModify';


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	// 注册live2d webView
	activateLive2d(context);
	
	// 注册修改文件操作
	activateModify(context);
}

// this method is called when your extension is deactivated
export function deactivate() {}
