export default function (config: any, extName: string, version: string): string {
	return `
	/*ext-${extName}-start*/
	/*ext.${extName}.ver.${version}*/
	let live2dWrapper; // live2d 顶点div
	// 会进行校验，最多只允许创建一个
	function createLive2d() {
		if(live2dWrapper)
			return;
		live2dWrapper = document.createElement('div');
		live2dWrapper.id = 'live2d-wrapper';
		// 控制按钮
		const controlBar = controlEles(live2dWrapper);
		controlBar && live2dWrapper.appendChild(controlBar);
		// 显示iframe, live2d
		const iframe = iframeEle();
		if(!iframe)
			return;
		live2dWrapper.appendChild(iframe);
		addWrapperStyle();
		document.body.appendChild(live2dWrapper);
	}

	function deleteLive2d() {
		if(live2dWrapper)
		{
			live2dWrapper.remove();
			live2dWrapper = undefined;
		}
	}
	
	// 外壳wrapper基础样式
	function addWrapperStyle() {
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
	.live2d-wrapper-controller-wrapper:hover {
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
		width: 8px;
		height: 8px;
		background-color: #faa;
		position: absolute;
	}
	\`;
		styleNode.appendChild(document.createTextNode(styleContent))
		document.head.appendChild(styleNode);
	}

	// iframe
	function iframeEle() {
		const str = window.location.href;
		if (!str.includes('workbench.html'))
			return
		const iframe = document.createElement('iframe');
		iframe.style.cssText = 'width:100%; height:100%; border:0;';
		iframe.src = str.replace('workbench.html', 'live2d/index.html');
		return iframe;
	}

	// 控制图标
	function controlEles(container) {
		const controlEles = document.createElement('div');
		controlEles.classList.add("live2d-wrapper-controller-wrapper");

		const borderIconDiv = document.createElement('div');
		borderIconDiv.title = '添加/移除边框';
		const borderIcon = document.createElement('img');
		borderIcon.src = 'https://s3.bmp.ovh/imgs/2021/10/c87f9f3d038d2598.png';
		borderIcon.classList.add("live2d-wrapper-controller-icon");
		borderIcon.addEventListener('click',(()=>{
			let hasBorder = false;
			let corners;
			return () => {
				hasBorder = !hasBorder;
				if(hasBorder)
					corners = addBorderCorner(container, corners);
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
		penetrateIcon.addEventListener('click',(()=>{
			let isPenetrate = false;
			return () => {
				isPenetrate = !isPenetrate;
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
			const handleMove = (event) => {
				container.style.left = event.pageX - disx + 'px';
				container.style.top = event.pageY - disy + 'px';
			};
			document.addEventListener("mousemove", handleMove);
			document.addEventListener("mouseup", () => {
				document.removeEventListener("mousemove", handleMove);
			});
			e.preventDefault();//阻止浏览器的默认事件
		});
		dragIconDiv.appendChild(dragIcon);
		controlEles.appendChild(dragIconDiv);
	
		return controlEles;
	}

	window.addEventListener('message', receiveMessage, false);

	function receiveMessage(event) {
		const origin = event.origin || event.originalEvent.origin;
		if (origin !== "vscode-webview://webviewview-vscode-live2d-live2dview")
			return;
		const {type, data} = event.data;
		switch(type) {
			case 'lodash-live2d-asoul':
				createLive2d();
				break;
			case 'close-live2d-asoul':
				deleteLive2d();
				break;
			default:
				break;
		}
	}

	
// 设置大小
// function Live2dReSize(){ }

function renderCorner() {
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

function drag(ele, container, type) {
	if (!type)
		return;
	document.addEventListener("mousedown", e => {
		console.log()
		// 这里过滤掉非目标元素
		if (e.target !== ele) {
			return;
		}

		const { width, height, top, bottom, left, right } = container.getBoundingClientRect();
		const disx = e.pageX;//获取鼠标相对元素距离
		const disy = e.pageY;
		const pageWidth = document.documentElement.clientWidth;
		const pageHeight = document.documentElement.clientHeight;

		let factorWidth = 1;
		let factorHeight = 1;
		// 固定container元素
		if (type === 'tl') {
			factorWidth = -1;
			factorHeight = -1;
			container.style.top = '';
			container.style.left = '';
			container.style.right = pageWidth - right + 'px';
			container.style.bottom = pageHeight - bottom + 'px';
		}
		else if (type === 'tr') {
			factorHeight = -1;
			container.style.top = '';
			container.style.left = left + 'px';
			container.style.right = '';
			container.style.bottom = pageHeight - bottom + 'px';
		}
		else if (type === 'bl') {
			factorWidth = -1;
			container.style.top = top + 'px';
			container.style.left = '';
			container.style.right = pageWidth - right + 'px';
			container.style.bottom = '';
		}
		else if (type === 'br') {
			container.style.top = top + 'px';
			container.style.left = left + 'px';
			container.style.right = '';
			container.style.bottom = '';
		}
		const Live2dResize = (event) => {
			container.style.width = width + (event.pageX - disx) * factorWidth + 'px';
			container.style.height = height + (event.pageY - disy) * factorHeight + 'px';
		};
		document.addEventListener("mousemove", Live2dResize);
		document.addEventListener("mouseup", () => {
			document.removeEventListener("mousemove", Live2dResize);
		});
		e.preventDefault();//阻止浏览器的默认事件
	});
}

function addBorderCorner(target, corners) {
	if (!target)
		return;
	// 获取四个角——eles
	if (!corners) {
		const { eles } = renderCorner();
		const [tl, tr, bl, br] = eles;
		target.appendChild(tl);
		drag(tl, target, 'tl');
		target.appendChild(tr);
		drag(tr, target, 'tr');
		target.appendChild(bl);
		drag(bl, target, 'bl');
		target.appendChild(br);
		drag(br, target, 'br');
		return eles;
	}
	else {
		corners.forEach(ele => target.appendChild(ele));
		return corners;
	}
}

	
	/*ext-${extName}-end*/
	`;
}

function customizeModel(modelUrl: string, model: string) {
	if (modelUrl) {
		return modelUrl;
	} else {
		switch (model) {
			case 'shizuku':
				return './models/shizuku/index.json';
			case 'shizuku-pajama':
				return 'https://cdn.jsdelivr.net/gh/fghrsh/live2d_api/model/ShizukuTalk/shizuku-pajama/index.json';
			case 'bilibili-22':
				return 'https://cdn.jsdelivr.net/gh/fghrsh/live2d_api/model/bilibili-live/22/index.json';
			case 'bilibili-33':
				return 'https://cdn.jsdelivr.net/gh/fghrsh/live2d_api/model/bilibili-live/33/index.json';
			case 'Pio':
				return 'https://cdn.jsdelivr.net/gh/fghrsh/live2d_api/model/Potion-Maker/Pio/index.json';
			case 'Tia':
				return 'https://cdn.jsdelivr.net/gh/fghrsh/live2d_api/model/Potion-Maker/Tia/index.json';
			case 'noir':
				return 'https://cdn.jsdelivr.net/gh/fghrsh/live2d_api/model/HyperdimensionNeptunia/noir_classic/index.json';
			case 'nepnep':
				return 'https://cdn.jsdelivr.net/gh/fghrsh/live2d_api/model/HyperdimensionNeptunia/nepnep/index.json';
			case 'nepmaid':
				return 'https://cdn.jsdelivr.net/gh/fghrsh/live2d_api/model/HyperdimensionNeptunia/nepmaid/index.json';
			case 'nepgear':
				return 'https://cdn.jsdelivr.net/gh/fghrsh/live2d_api/model/HyperdimensionNeptunia/nepgear/index.json';
			case 'vert':
				return 'https://cdn.jsdelivr.net/gh/fghrsh/live2d_api/model/HyperdimensionNeptunia/vert_swimwear/index.json';
			case 'tororo':
				return 'https://unpkg.com/live2d-widget-model-tororo@1.0.5/assets/tororo.model.json';
			case 'hijiki':
				return 'https://unpkg.com/live2d-widget-model-hijiki@1.0.5/assets/hijiki.model.json';
			default:
				return '';
		}
	}
}