export default function (config: any, extName: string, version: string): string {
	return `
	/*ext-${extName}-start*/
	/*ext.${extName}.ver.${version}*/
	class Live2d {
		live2dWrapper = undefined; // live2d html最外层节点div
		live2dIframe = undefined; // live2d 的具体 iframe页面
		anchorCore = 'br'; // live2d div 定位依赖，初始默认为右下角， 一共有四个情况: tl,tr,bl,br
		KEY = 'live2d-asoul-config'; // 用于localstorage存储信息的key

		constructor() {
			// 添加postmessage事件监听
			const receiveMessage = (event) => {
				const origin = event.origin || event.originalEvent.origin;
				if (origin !== "vscode-webview://webviewview-vscode-live2d-live2dview" && !origin.startsWith('vscode-webview://'))
					return;
				const { type, data } = event?.data || {};
				if(type)
					switch (type) {
						case 'live2d-asoul-openAutoLodash':
							this.saveConfig({ autoLodash: true });
							break;
						case 'live2d-asoul-closeAutoLodash':
							this.saveConfig({ autoLodash: false });
							break;
						case 'live2d-asoul-lodash':
							this.createLive2d();
							break;
						case 'live2d-asoul-close':
							this.deleteLive2d();
							break;
						case 'live2d-asoul-setAnchor': 
							this.anchor = data;
							break;
						case 'live2d-asoul-resetPosition':
							this.resetPosition();
							break;
						case 'live2d-asoul-saveCurrentConfig':
							this.saveCurrentConfig();
							break;
						case 'live2d-asoul-saveBackground':
							this.saveBackground();
							break;
						case 'live2d-asoul-loadBackground':
							this.loadBackground();
							break;
						case 'live2d-asoul-openBackgroundSetTime':
							this.openBackgroundSetTime(data);
							break;
						case 'live2d-asoul-closeBackgroundSetTime':
							this.closeBackgroundSetTime();
							break;
						case 'live2d-asoul-modifyBackgroundConfig':
							this.modifyBackgroundConfig(data);
							break;
						case 'live2d-asoul-loadOtherModel':
							this.loadOtherModel(data);
							break;
						default:
							break;
					}
			}
			window.addEventListener('message', receiveMessage, false);
	
			// 从localstorage中获取配置信息，进行对应处理
			const config = this.getConfig();
			if (config.autoLodash === true)
				this.createLive2d();
			this.anchor = config.anchor;
		}

		get anchor() {
			return this.anchorCore;
		}
	
		set anchor(value) {
			if (['tl', 'tr', 'bl', 'br'].includes(value)) {
				this.anchorCore = value;
				this.saveConfig({anchor: value});
				this.resetLocationDependency(this.live2dWrapper, value); // 恢复目标定位依赖
			}
		}
	
		// 会进行校验，最多只允许创建一个
		createLive2d = () => {
			// if (document.getElementById('live2d-wrapper'))
			// 	return;
			if (this.live2dWrapper) {
				document.body.appendChild(this.live2dWrapper);
				return;
			}
			this.live2dWrapper = document.createElement('div');
			this.live2dWrapper.id = 'live2d-wrapper';
			Object.assign(this.live2dWrapper.style, this.getConfig().style);
			// 显示iframe, live2d
			const iframe = this.initIframe();
			if (!iframe)
				return;
			this.live2dIframe = iframe;
			this.live2dWrapper.appendChild(iframe);
			// 控制按钮
			const controlBar = this.initControlBar(this.live2dWrapper);
			controlBar && this.live2dWrapper.appendChild(controlBar);
			this.addWrapperStyle();
			document.body.appendChild(this.live2dWrapper);
		}
	
		// 只是将 live2dWrapper 整个节点从body移除，依旧存在内存中，因为还存在事件的引用
		deleteLive2d = () => {
			if (this.live2dWrapper) {
				this.live2dWrapper.remove();
				// this.live2dWrapper = undefined;
			}
		}
	
		// 外壳wrapper基础样式
		addWrapperStyle = () => {
			let styleNode = document.createElement('style');
			let styleContent = \`
			div#live2d-wrapper {
				width: 280px;
				height: 300px;
				position: fixed;
				bottom: 50px;
				right: 50px;
				z-index: 100;
			}
			.live2d-wrapper-controller-wrapper {
				pointer-events:auto;
				position: absolute;
				right: 1px;
				top: 2px; 
				display:flex;
				opacity: 0;
				transition: all 0.2s;
			}
			div#live2d-wrapper:hover .live2d-wrapper-controller-wrapper {
				opacity: 1;
			}
			.live2d-wrapper-controller-icon {
				width:16px;
				height:16px;
				cursor: pointer;
				transition: all 0.3s;
			}
			.live2d-wrapper-controller-icon:hover {
				width:20px;
				height:20px;
			}
			.live2d-wrapper-controller-corner {
				width: 10px;
				height: 10px;
				background-color: #faa;
				position: absolute;
			}
			\`;
			styleNode.appendChild(document.createTextNode(styleContent))
			document.head.appendChild(styleNode);
		}
	
		// iframe, 初始化具体live2d的页面
		initIframe = () => {
			const str = window.location.href;
			if (!str.includes('workbench.html'))
				return
			const iframe = document.createElement('iframe');
			iframe.style.cssText = 'width:100%; height:100%; border:0;';
			iframe.src = str.replace('workbench.html', 'live2d/index.html');
			return iframe;
		}
	
		// 控制图标，三个图标 调整大小，点击穿透，拖拽位置
		initControlBar = (container) => {
			const controlEles = document.createElement('div');
			controlEles.classList.add("live2d-wrapper-controller-wrapper");
	
			const borderIconDiv = document.createElement('div');
			borderIconDiv.title = '调整大小';
			const borderIcon = document.createElement('img');
			borderIcon.src = 'https://s3.bmp.ovh/imgs/2021/10/c87f9f3d038d2598.png';
			borderIcon.classList.add("live2d-wrapper-controller-icon");
			borderIcon.addEventListener('click', (() => {
				let hasBorder = false;
				let corners;
				return () => {
					hasBorder = !hasBorder;
					if (hasBorder)
						corners = this.addBorderCorner(container, corners);
					else
						corners.forEach(ele => ele.remove());
					// container.style.border = hasBorder ? 'solid 4px white' : '0';
				}
			})());
			borderIconDiv.appendChild(borderIcon);
			controlEles.appendChild(borderIconDiv);
	
			const penetrateIconDiv = document.createElement('div');
			penetrateIconDiv.title = '是否允许点击穿透';
			penetrateIconDiv.style.cssText = 'margin: 0 6px;';
			const penetrateIcon = document.createElement('img');
			penetrateIcon.src = 'https://s3.bmp.ovh/imgs/2021/10/aa5c35f26d1541b8.png';
			penetrateIcon.classList.add("live2d-wrapper-controller-icon");
			penetrateIcon.addEventListener('click', (() => {
				let isPenetrate = false;
				return () => {
					isPenetrate = !isPenetrate;
					controlEles.style.opacity = isPenetrate ? '1' : '';
					container.style.pointerEvents = isPenetrate ? 'none' : 'auto';
				}
			})());
			penetrateIconDiv.appendChild(penetrateIcon);
			controlEles.appendChild(penetrateIconDiv);
	
			const dragIconDiv = document.createElement('div');
			dragIconDiv.title = '鼠标按住拖拽移动';
			const dragIcon = document.createElement('img');
			dragIcon.src = 'https://s3.bmp.ovh/imgs/2021/10/9e34525e8e70acd8.png';
			dragIcon.classList.add("live2d-wrapper-controller-icon");
			document.addEventListener("mousedown", e => {
				// 这里过滤掉非目标元素
				if (e.target !== dragIcon) {
					return;
				}
				const disx = e.pageX - container.offsetLeft;//获取鼠标相对元素距离
				const disy = e.pageY - container.offsetTop;
				
				// 防止鼠标移动到iframe上，使得鼠标移动事件丢失
				const iframe = container.getElementsByTagName('iframe')[0];
				iframe && (iframe.style.pointerEvents = 'none');

				const handleMove = (event) => {
					container.style.left = event.pageX - disx + 'px';
					container.style.top = event.pageY - disy + 'px';
				};
				const tempMouseUp = () => {
					iframe && (iframe.style.pointerEvents = 'inherit');
					this.resetLocationDependency(container, this.anchor); // 恢复目标定位依赖
					document.removeEventListener("mousemove", handleMove);
					document.removeEventListener("mouseup", tempMouseUp);
				}
				document.addEventListener("mousemove", handleMove);
				document.addEventListener("mouseup", tempMouseUp);
				e.preventDefault();//阻止浏览器的默认事件
			});
			dragIconDiv.appendChild(dragIcon);
			controlEles.appendChild(dragIconDiv);
	
			return controlEles;
		}
	
		// 初始化4个角落点，用于后续拖拽缩放大小
		initCorner = () => {
			// 来4个元素
			const eles = Array.from({ length: 4 }).map(() =>
				document.createElement("div")
			);
			eles.forEach(x => x.classList.add("live2d-wrapper-controller-corner"));
			// 分别在topleft、topright、bottomleft、bottomright位置
			const [tl, tr, bl, br] = eles;
	
			// 每一个角都移动半个身位
			Object.assign(tl.style, {
				top: "-5px",
				left: "-5px",
				cursor: "nw-resize"
			});
			Object.assign(tr.style, {
				top: "-5px",
				cursor: "ne-resize",
				right: "-5px"
			});
			Object.assign(bl.style, {
				bottom: "-5px",
				cursor: "sw-resize",
				left: "-5px"
			});
			Object.assign(br.style, {
				bottom: "-5px",
				cursor: "se-resize",
				right: "-5px"
			});
			return { eles };
		}
	
		// 给4个角落点挂载事件
		drag = (ele, container, type) => {
			if (!type)
				return;
			document.addEventListener("mousedown", e => {
				// 这里过滤掉非目标元素
				if (e.target !== ele) {
					return;
				}
	
				const { width, height } = container.getBoundingClientRect();

				// 固定container元素,以使不同定位角可以拉动, 因为是对角拖拽，所以需要用对角定位
				const antiType = (type[0] == 't' ? 'b' : 't') + (type[1] == 'l' ? 'r' : 'l');
				this.resetLocationDependency(container, antiType);

				// 防止鼠标移动到iframe上，使得鼠标移动事件丢失
				const iframe = container.getElementsByTagName('iframe')[0];
				iframe && (iframe.style.pointerEvents = 'none');

				const disx = e.pageX;//获取鼠标相对元素距离
				const disy = e.pageY;

				let factorWidth = (type === 'tl' || type === 'bl') ? -1 : 1;
				let factorHeight = (type === 'tl' || type === 'tr') ? -1 : 1;
				const Live2dResize = (event) => {
					const newWidth = width + (event.pageX - disx) * factorWidth;
					const newHeight = height + (event.pageY - disy) * factorHeight;
					// 最小宽高
					if (newWidth >= 75)
						container.style.width = newWidth + 'px';
					if (newHeight >= 75)
						container.style.height = newHeight + 'px';
				};

				const tempMouseUp = () => {
					iframe && (iframe.style.pointerEvents = 'inherit');
					this.resetLocationDependency(container, this.anchor); // 恢复目标定位依赖
					document.removeEventListener("mousemove", Live2dResize);
					document.removeEventListener("mouseup", tempMouseUp);
				}
				document.addEventListener("mousemove", Live2dResize);
				document.addEventListener("mouseup", tempMouseUp);
				e.preventDefault();//阻止浏览器的默认事件
			});
		}
	
		addBorderCorner = (target, corners) => {
			if (!target)
				return;
			// 获取四个角——eles
			if (!corners) {
				const { eles } = this.initCorner();
				const [tl, tr, bl, br] = eles;
				target.appendChild(tl);
				this.drag(tl, target, 'tl');
				target.appendChild(tr);
				this.drag(tr, target, 'tr');
				target.appendChild(bl);
				this.drag(bl, target, 'bl');
				target.appendChild(br);
				this.drag(br, target, 'br');
				return eles;
			}
			else {
				corners.forEach(ele => target.appendChild(ele));
				return corners;
			}
		}

		// 重置元素对于某个角落的定位, target目标元素 ， type定位角落
		resetLocationDependency = (target, type) => {
			if (target && type) {
				const { top, bottom, left, right } = target.getBoundingClientRect();

				const pageWidth = document.documentElement.clientWidth;
				const pageHeight = document.documentElement.clientHeight;

				if (type === 'tl') {
					target.style.top = top + 'px';
					target.style.left = left + 'px';
					target.style.right = '';
					target.style.bottom = '';
				}
				else if (type === 'tr') {
					target.style.top = top + 'px';
					target.style.left = '';
					target.style.right = pageWidth - right + 'px';
					target.style.bottom = '';
				}
				else if (type === 'bl') {
					target.style.top = '';
					target.style.left = left + 'px';
					target.style.right = '';
					target.style.bottom = pageHeight - bottom + 'px';
					
				}
				else if (type === 'br') {
					target.style.top = '';
					target.style.left = '';
					target.style.right = pageWidth - right + 'px';
					target.style.bottom = pageHeight - bottom + 'px';
				}
			}
		}

		resetPosition = () => {
			if (this.live2dWrapper) {
				const style = this.live2dWrapper.style;
				style.top = '';
				style.right = '';
				style.bottom = '';
				style.left = '';
				style.width = '';
				style.height = '';
			}
		}
	
		saveCurrentConfig = () => {
			if (this.live2dWrapper) {
				const { top, right, bottom, left, width, height } = this.live2dWrapper.style;
				const style = { top, right, bottom, left, width, height };
				this.saveConfig({ style })
			}
		}
	
		saveConfig = (newData) => {
			const str = localStorage.getItem(this.KEY);
			const data = str ? JSON.parse(str) : { autoLodash: false, anchor: 'br', style: {} };
			localStorage.setItem(this.KEY, JSON.stringify({ ...data, ...newData }));
		}
	
		getConfig = () => {
			const str = localStorage.getItem(this.KEY);
			return str ? JSON.parse(str) : { autoLodash: false, anchor: 'br', style: {} };
		}

		saveBackground = () => {
			const fn = this.live2dIframe?.contentWindow?.saveBackground;
			fn && fn();
		}
	
		loadBackground = () => {
			const fn = this.live2dIframe?.contentWindow?.loadBackground;
			fn && fn();
		}

		openBackgroundSetTime = (time) => {
			const fn = this.live2dIframe?.contentWindow?.openBackgroundSetTime;
			fn && fn(time);
		}
	
		closeBackgroundSetTime = () => {
			const fn = this.live2dIframe?.contentWindow?.closeBackgroundSetTime;
			fn && fn();
		}

		modifyBackgroundConfig = (config) => {
			const fn = this.live2dIframe?.contentWindow?.modifyBackgroundConfig;
			fn && fn(config);
		}

		loadOtherModel = (path) => {
			const fn = this.live2dIframe?.contentWindow?.loadOtherModel;
			fn && fn(path);
		}
	}

	let live2dInstance = new Live2d();
	
	/*ext-${extName}-end*/
	`;
}