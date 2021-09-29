import * as vscode from 'vscode';
import { Main } from './Main';

export function activateModify(context: vscode.ExtensionContext) {
    context.subscriptions.push(Main.watch());
}

export function deactivateModify() { }