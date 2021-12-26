import * as vscode from 'vscode';
import { Main } from '../live2dModify/Main';

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

		webviewView.webview.onDidReceiveMessage(data => {
			switch (data.type) {
				case 'generateResources':
					Main.Instance &&
						Main.Instance.generateResources();
					break;
				case 'removeResources':
					Main.Instance &&
						Main.Instance.removeResources(true);
					break;
			}
		});
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

					<div class="common-subtitle">背景图:(需要先启动live2d人物)</div>
					<div class="common-bar">
						<button class="common-button" onclick="saveBackground()">保存背景图</button>
						<button class="common-button" onclick="loadBackground()"> 加载背景图</button>
					</div>
					<div class="common-subtitle">定时切换(分钟):</div>
					<div class="common-bar">
						<input style="width: 30%" placeholder="默认30" type="number" onchange="handleChangeTime(event)" />
						<button style="width: 30%" onclick="openBackgroundSetTime()"> 开启</button>
						<button style="width: 30%" onclick="closeBackgroundSetTime()"> 关闭</button>
					</div>
					<div class="common-subtitle">背景图配置:(会默认使用最近配置)</div>
					<div class="common-bar">
						<div style="margin-right:6px" > 不透明度:  </div>
						<input id="background-opacity-input" style="width: 80%; flex: 1" type="number" placeholder="范围: 0-1，默认是0.2" onchange="handleChangeOpacity(event)" />
					</div>
					<div class="common-bar">
						<div style="margin-right:6px" > 适配样式:  </div>
						<select id="background-mode-select" style="width: 80%; flex: 1" onchange="handleChangeMode(event)">
							<option value='' disabled selected style='display:none;'>背景图适配样式,默认是覆盖</option>  
							<option value="cover">覆盖</option>
							<option value="contain">适应</option>
						</select>
					</div>
					<div class="common-bar" style="justify-content: space-round" >
						<button style="width: 45%" onclick="modifyBackgroundConfig()"> 确认</button>
						<button style="width: 45%" onclick="restoreBgConfig()"> 恢复默认</button>
					</div>
					
					<br />
					<div class="common-title">配置信息:</div>
					<div class="common-subtitle">自启动:</div>
					<div class="common-bar" >
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

					<br />
					<div class="common-title">补充配置:</div>
					<div class="common-subtitle">插件依赖文件:</div>
					<div class="common-bar">
						<button 
							title="插件依赖文件会在初次安装插件并启动时自动生成，点击该按钮可强制生成覆盖"
							class="common-button" 
							onclick="generateResources()">
							生成
						</button>
						<button 
							title="卸载该插件前，请先执行该操作。去除该插件造成的影响"
							class="common-button" 
							onclick="removeResources()">
							移除
						</button>
					</div>

					<br />
					<div class="common-title">测试功能:</div>
					<div class="common-subtitle">下载当前背景图(勿短时间内多次点击):</div>
					<div class="common-bar">
						<button class="common-button" onclick="downloadBackground()">获取当前背景</button>
						<button class="common-button" onclick="removeDownloadBackground()">移除下载展示</button>
					</div>
					<div id="currentBackground" class="common-bar"></div>
				</div>
			
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

// <script nonce="${nonce}" src="${scriptUri}"></script>