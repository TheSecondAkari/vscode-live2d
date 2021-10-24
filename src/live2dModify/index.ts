import * as vscode from 'vscode';
import { Main } from './Main';

export function activateModify(context: vscode.ExtensionContext) {
    const [dispose, Instance] = Main.watch();
    context.subscriptions.push(dispose);
    // Instance.removeResources();
}

export function deactivateModify() { }