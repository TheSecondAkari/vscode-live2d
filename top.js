let live2dWrapper; // live2d 顶点div
// 会进行校验，最多只允许创建一个
function createLive2d() {
	if (live2dWrapper)
		return;
	live2dWrapper = document.createElement('div');
	live2dWrapper.id = 'live2d-wrapper';
	// 控制按钮
	const controlBar = controlEles(live2dWrapper);
	controlBar && live2dWrapper.appendChild(controlBar);
	// 显示iframe, live2d
	const iframe = iframeEle();
	if (!iframe)
		return;
	live2dWrapper.appendChild(iframe);
	addWrapperStyle();
	document.body.appendChild(live2dWrapper);
	// addDragEvent(live2dWrapper);
}

function deleteLive2d() {
	if (live2dWrapper) {
		live2dWrapper.remove();
		live2dWrapper = undefined;
	}
}

// 外壳wrapper基础样式
function addWrapperStyle() {
	let styleNode = document.createElement('style');
	let styleContent = `
	div#live2d-wrapper {
		width: 600px;
		height: 600px;
		position: fixed;
		bottom: 50px;
		right: 50px;
		z-index: 100;
	}
	.live2d-wrapper-controller-corner {
		width: 4px;
		height: 4px;
		background-color: #faa;
		position: absolute;
	}
	`;
	styleNode.appendChild(document.createTextNode(styleContent))
	document.head.appendChild(styleNode);
}

// 注册拖拽事件
function addDragEvent(drag) {
	let timer = false;
	drag.onmousedown = function (e) {//鼠标按下触发
		var disx = e.pageX - drag.offsetLeft;//获取鼠标相对元素距离
		var disy = e.pageY - drag.offsetTop;
		document.onmousemove = function (e) {//鼠标移动触发事件，元素移到对应为位置
			if (!timer) {
				timer = true;
				drag.style.left = e.pageX - disx + 'px';
				drag.style.top = e.pageY - disy + 'px';
				setTimeout(() => { timer = false; }, 5);
			}
		}
		document.onmouseup = function () {//鼠标抬起，清除绑定的事件，元素放置在对应的位置
			document.onmousemove = null;
			document.onmousedown = null;
		};
		e.preventDefault();//阻止浏览器的默认事件
	};
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
	controlEles.style.cssText = 'pointer-events:auto;position: absolute;right: 1px;top: 2px; display:flex;';
	const borderIcon = document.createElement('img');
	borderIcon.src = 'https://s3.bmp.ovh/imgs/2021/10/c87f9f3d038d2598.png';
	borderIcon.style.cssText = 'width:16px;height:16px;cursor: pointer;';
	borderIcon.addEventListener('click', (() => {
		let hasBorder = false;
		let corners;
		return () => {
			hasBorder = !hasBorder;
			if(hasBorder)
				corners = addBorderCorner(container, corners);
			else 
				corners.forEach(ele => ele.remove());
			container.style.border = hasBorder ? 'solid 4px white' : '0';
		}
	})());
	controlEles.appendChild(borderIcon);

	const penetrateIcon = document.createElement('img');
	penetrateIcon.src = 'https://s3.bmp.ovh/imgs/2021/10/aa5c35f26d1541b8.png';
	penetrateIcon.style.cssText = 'width:16px;height:16px;cursor:pointer;margin:0 6px';
	penetrateIcon.addEventListener('click', (() => {
		let isPenetrate = false;
		return () => {
			isPenetrate = !isPenetrate;
			container.style.pointerEvents = isPenetrate ? 'none' : 'auto';
		}
	})());
	controlEles.appendChild(penetrateIcon);

	const dragIcon = document.createElement('img');
	dragIcon.src = 'https://s3.bmp.ovh/imgs/2021/10/9e34525e8e70acd8.png';
	dragIcon.style.cssText = 'width:16px;height:16px;cursor:pointer;';
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
	controlEles.appendChild(dragIcon);

	return controlEles;
}

window.addEventListener('message', receiveMessage, false);

function receiveMessage(event) {
	const origin = event.origin || event.originalEvent.origin;
	if (origin !== "vscode-webview://webviewview-vscode-live2d-live2dview")
		return;
	const { type, data } = event.data;
	switch (type) {
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
		top: `-5px`,
		left: `-5px`,
		cursor: "nw-resize"
	});
	Object.assign(tr.style, {
		top: `-5px`,
		cursor: "ne-resize",
		right: `-5px`
	});
	Object.assign(bl.style, {
		bottom: `-5px`,
		cursor: "sw-resize",
		left: `-5px`
	});
	Object.assign(br.style, {
		bottom: `-5px`,
		cursor: "se-resize",
		right: `-5px`
	});
	return { eles };
}

function drag(ele, container, type) {
	if (!type)
		return;
	document.addEventListener("mousedown", e => {
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
		const handleMove = (event) => {
			container.style.width = width + (event.pageX - disx) * factorWidth + 'px';
			container.style.height = height + (event.pageY - disy) * factorHeight + 'px';
		};
		document.addEventListener("mousemove", handleMove);
		document.addEventListener("mouseup", () => {
			document.removeEventListener("mousemove", handleMove);
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
