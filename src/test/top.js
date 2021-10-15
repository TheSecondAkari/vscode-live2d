// 会进行校验，最多只允许创建一个
function createLive2d() {
    let live2dWrapper = document.getElementById('live2d-wrapper');
    if (live2dWrapper)
        return;
    live2dWrapper = document.createElement('div');
    live2dWrapper.id = 'live2d-wrapper';
    // 控制按钮
    const controlBar = controlEles(live2dWrapper);
    controlBar && live2dWrapper.appendChild(controlBar);

    // 显示iframe
    const iframe = iframeEle();
    if(!iframe)
        return;
    live2dWrapper.appendChild(iframe);
    addWrapperStyle();
    document.body.appendChild(live2dWrapper);
    
    addDragEvent(live2dWrapper);
}

// 外壳wrapper基础样式
function addWrapperStyle() {
    let styleNode = document.createElement('style');
    let styleContent = `
div#live2d-wrapper {
    width: 800px;
    height: 800px;
    position: fixed;
    bottom: 50px;
    right: 50px;
    z-index: 100;
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

function iframeEle() {
    const str = window.location.href;
    if (!str.includes('workbench.html'))
        return
    const iframe = document.createElement('iframe');
    iframe.style.cssText = `width:100%; height:100%;`;
    iframe.frameborder = 0;
    iframe.src = str.replace('workbench.html', 'live2d/index.html');
    return iframe;
}

function controlEles(container) {
    const controlEles = document.createElement('div');
    controlEles.style.cssText = 'pointer-events:auto;position: absolute;right: 1px;top: 2px; display:flex;';
    const borderIcon = document.createElement('img');
    borderIcon.src = 'https://t7.baidu.com/it/u=963301259,1982396977&fm=193&f=GIF';
    borderIcon.style.cssText = 'width:16px;height:16px;cursor: pointer;';
    borderIcon.addEventListener('click',(()=>{
        let hasBorder = false;
        return () => {
            hasBorder = !hasBorder;
            container.style.border = hasBorder ? 'solid 4px white' : '0';
        }
    })());
    controlEles.appendChild(borderIcon);

    const penetrateIcon = document.createElement('img');
    penetrateIcon.src = 'https://t7.baidu.com/it/u=2077212613,1695106851&fm=193&f=GIF';
    penetrateIcon.style.cssText = 'width:16px;height:16px;cursor:pointer;';
    penetrateIcon.addEventListener('click',(()=>{
        let isPenetrate = false;
        return () => {
            isPenetrate = !isPenetrate;
            container.style.pointerEvents = isPenetrate ? 'none' : 'auto';
        }
    })());
    controlEles.appendChild(penetrateIcon);

    const dragIcon = document.createElement('img');
    dragIcon.src = 'https://t7.baidu.com/it/u=2077212613,1695106851&fm=193&f=GIF';
    dragIcon.style.cssText = 'width:16px;height:16px;cursor:pointer;';
    let timer = false;
    dragIcon.onmousedown = function (e) {//鼠标按下触发
        var disx = e.pageX - container.offsetLeft;//获取鼠标相对元素距离
        var disy = e.pageY - container.offsetTop;
        document.onmousemove = function (e) {//鼠标移动触发事件，元素移到对应为位置
            if (!timer) {
                timer = true;
                container.style.left = e.pageX - disx + 'px';
                container.style.top = e.pageY - disy + 'px';
                setTimeout(() => { timer = false; }, 5);
            }
        }
        document.onmouseup = function () {//鼠标抬起，清除绑定的事件，元素放置在对应的位置
            document.onmousemove = undefined;
        };
        e.preventDefault();//阻止浏览器的默认事件
    };
    controlEles.appendChild(dragIcon);

    return controlEles;
}