import * as vscode from 'vscode';

export function activateLive2d(context: vscode.ExtensionContext) {

	const provider = new Live2dViewProvider(context.extensionUri);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(Live2dViewProvider.viewType, provider));

	// context.subscriptions.push(
	// 	vscode.commands.registerCommand('vscode-live2d.addColor', () => {
	// 		provider.addColor();
	// 	}));

	// context.subscriptions.push(
	// 	vscode.commands.registerCommand('vscode-live2d.clearColors', () => {
	// 		provider.clearColors();
	// 	}));
}

class Live2dViewProvider implements vscode.WebviewViewProvider {

	public static readonly viewType = 'vscode-live2d.live2dView';

	private _view?: vscode.WebviewView;

	constructor(
		private readonly _extensionUri: vscode.Uri,
	) { }

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this._view = webviewView;

		webviewView.webview.options = {
			// Allow scripts in the webview
			enableScripts: true,
			localResourceRoots: [
				this._extensionUri
			]
		};

		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

		webviewView.webview.onDidReceiveMessage(data => {
			switch (data.type) {
				case 'colorSelected':
					{
						vscode.window.activeTextEditor?.insertSnippet(new vscode.SnippetString(`#${data.value}`));
						break;
					}
			}
		});
	}

	public addColor() {
		if (this._view) {
			this._view.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
			this._view.webview.postMessage({ type: 'addColor' });
		}
	}

	public clearColors() {
		if (this._view) {
			this._view.webview.postMessage({ type: 'clearColors' });
		}
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		

		// Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));
		const scriptLive2d = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'live2d-autoload.js'));

		// Do the same for the stylesheet.
		const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));
		const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css'));
		// const styleLive2dUri = webview.asWebviewUri('https://cdn.jsdelivr.net/npm/font-awesome/css/font-awesome.min.css');
	
		// Use a nonce to only allow a specific script to be run.
		const nonce = getNonce();

		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<link href="${styleVSCodeUri}" rel="stylesheet">
				<link href="${styleMainUri}" rel="stylesheet">
				<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/font-awesome/css/font-awesome.min.css">
				<title>Live 2d</title>
			</head>
			<body>
				<script nonce="${nonce}" src="${scriptLive2d}"></script>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
	}
}

function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}
// 

// 窗口样式
// div#webview-webviewview-calicocolors-colorsview {
//     border: solid 5px white;
//     width: 320px !important;
//     height: 320px !important;
//     position: fixed !important;
//     top: 0 !important;
//     left: 0 !important;
//     clip: unset !important;
// }

// let styleNode = document.createElement('style');
// let styleContent = `
// div#webview-webviewview-calicocolors-colorsview {
//     border: solid 5px white;
//     width: 320px !important;
//     height: 320px !important;
//     position: fixed !important;
//     top: 0 !important;
//     left: 0 !important;
//     clip: unset !important;
// }
// `;  
// styleNode.type='text/css';  
// styleNode.appendChild(document.createTextNode(styleContent))
// document.head.appendChild(styleNode);


// function addDragEvent(id) {
// 	let drag = document.getElementById(id);//获取操作元素
//  let timer = false;
// 	if(drag) {
// 		drag.onmousedown = function (e) {//鼠标按下触发
// 			var disx = e.pageX - drag.offsetLeft;//获取鼠标相对元素距离
// 			var disy = e.pageY - drag.offsetTop;
// 			document.onmousemove = function (e) {//鼠标移动触发事件，元素移到对应为位置
// 				if(!timer) {
// 					timer = true;
// 					drag.style.cssText = `left: ${e.pageX - disx + 'px !important'}; top: ${e.pageY - disy + 'px !important'}`;
// 					setTimeout(()=>{ timer = false; }, 5);
// 				}
// 			}
// 			document.onmouseup = function(){//鼠标抬起，清除绑定的事件，元素放置在对应的位置
// 				document.onmousemove = null;
// 				document.onmousedown = null;
// 			};
// 			e.preventDefault();//阻止浏览器的默认事件
// 		};
// 	}
// }
// addDragEvent('webview-webviewview-calicocolors-colorsview')