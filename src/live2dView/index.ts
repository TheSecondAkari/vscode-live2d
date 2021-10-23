import * as vscode from 'vscode';

export function activateLive2d(context: vscode.ExtensionContext) {

	const provider = new Live2dViewProvider(context.extensionUri);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(Live2dViewProvider.viewType, provider));
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
	}

	private _getHtmlForWebview(webview: vscode.Webview) {


		// Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));

		// Do the same for the stylesheet.
		const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));
		const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css'));

		// Use a nonce to only allow a specific script to be run.
		const nonce = getNonce();

		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<link href="${styleVSCodeUri}" rel="stylesheet">
				<link href="${styleMainUri}" rel="stylesheet">
				<title>Live 2d</title>
			</head>
			<body>
				<div style="max-width: 450px; min-width: 100px; padding: 12px">
					<div class="common-title">基本操作:</div>
					<div class="common-bar">
						<button class="common-button" onclick="lodashLive2d()">启动live2d</button>
						<button class="common-button" onclick="closeLive2d()"> 关闭live2d</button>
					</div>
					<div class="common-bar">
						<button 
							title="将定位依赖,大小，位置等信息存储，下次启动自动生效" 
							class="common-button" 
							onclick="saveCurrentConfig()">
							保存当前配置
						</button>
						<button class="common-button" onclick="resetPosition()">重置默认位置</button>
					</div>

					<div class="common-subtitle">背景图:</div>
					<div class="common-bar">
						<button class="common-button" onclick="saveBackground()">保存背景图</button>
						<button class="common-button" onclick="loadBackground()"> 加载背景图</button>
					</div>
					<div class="common-subtitle">定时切换(分钟/默认30分钟):</div>
					<div class="common-bar">
						<input style="width: 30%" type="number" onchange="handleChangeTime(event)" />
						<button style="width: 30%" onclick="openBackgroundSetTime()"> 开启</button>
						<button style="width: 30%" onclick="closeBackgroundSetTime()"> 关闭</button>
					</div>
					
					<br />
					<div class="common-title">配置信息:</div>
					<div class="common-subtitle">自启动:</div>
					<div class="common-bar">
						<button class="common-button" onclick="openAutoLodash()">开启</button>
						<button class="common-button" onclick="closeAutoLodash()">关闭</button>
					</div>
					<!-- <div style="display: flex;" >
						<div class="common-subtitle">定位依赖:</div>
						<span style="font-style: 12px;font-weight: 400;">(初始默认为右下角)</span>
					</div> -->
					<div class="common-subtitle">定位依赖:</div>
					<div class="common-bar">
						<button class="common-button" onclick="setAnchor('tl')">左上角</button>
						<button class="common-button" onclick="setAnchor('tr')">右上角</button>
						<button class="common-button" onclick="setAnchor('bl')">左下角</button>
						<button class="common-button" onclick="setAnchor('br')">右下角</button>
					</div>
				</div>
			
			
			
				<script>
					let background_time = 30;

					function handleChangeTime(e) {
						const value = Number(e.target.value);
						if(value > 0) {
							background_time = value;
						}
						else e.target.value = '0.5';
					}

					function openBackgroundSetTime () {
						sendCommand('live2d-asoul-openBackgroundSetTime', background_time);
					}

					function closeBackgroundSetTime () {
						sendCommand('live2d-asoul-closeBackgroundSetTime');
					}

					function openAutoLodash() {
						sendCommand('live2d-asoul-openAutoLodash');
					}
					function closeAutoLodash() {
						sendCommand('live2d-asoul-closeAutoLodash');
					}
					function lodashLive2d() {
						sendCommand('live2d-asoul-lodash');
					}
					function closeLive2d() {
						sendCommand('live2d-asoul-close');
					}
					function setAnchor(type) {
						sendCommand('live2d-asoul-setAnchor', type);
					}
					function saveCurrentConfig() {
						sendCommand('live2d-asoul-saveCurrentConfig');
					}
					function resetPosition() {
						sendCommand('live2d-asoul-resetPosition');
					}
					function saveBackground() {
						sendCommand('live2d-asoul-saveBackground');
					}
					function loadBackground() {
						sendCommand('live2d-asoul-loadBackground');
					}
			
					function sendCommand(type, data) {
						window.top.postMessage({ type, data }, "vscode-file://vscode-app");
					}
				</script>
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

// <script nonce="${nonce}" src="${scriptUri}"></script>