const vscode = acquireVsCodeApi();
const MainOrigin = "vscode-file://vscode-app";
function generateResources() {
    vscode.postMessage({ type: 'generateResources' });
}

function removeResources() {
    vscode.postMessage({ type: 'removeResources' });
}

function sendCommand(type, data) {
    window.top.postMessage({ type, data }, MainOrigin);
}

const receiveMessage = (event) => {
    const origin = event.origin || event.originalEvent.origin;
    if (origin !== MainOrigin)
        return;
    const { type, data } = event?.data || {};
    if (type)
        switch (type) {
            case 'live2d-asoul-initDownloadBackground':
                initDownloadBackground(data);
                break;
            default:
                break;
        }
}
window.addEventListener('message', receiveMessage, false);

let background_time = 30;
let background_opacity = 0.2;
let background_mode = 'cover';

function handleChangeTime(e) {
    const value = Number(e.target.value);
    if (value > 0) {
        background_time = value;
    }
    else e.target.value = '0.5';
}

function handleChangeOpacity(e) {
    let value = e.target.value;
    value = value === 0 ? 0 : value ? Number(value) : 0.2;
    if (value >= 0 && value <= 1) {
        background_opacity = value;
    }
}

function handleChangeMode(e) {
    background_mode = e.target.value;
}

function setEleBackgroundConfig(input, select) {
    const eleInput = document.getElementById('background-opacity-input');
    eleInput && (eleInput.value = input);
    background_opacity = input === undefined ? 0.2 : input;
    const eleSelect = document.getElementById('background-mode-select');
    eleSelect && (eleSelect.value = select || '');
    background_mode = select ? select : 'cover';
}

function restoreBgConfig() {
    setEleBackgroundConfig(undefined, '');
    modifyBackgroundConfig();
}

function modifyBackgroundConfig() {
    const config = { opacity: background_opacity, backgroundSize: background_mode };
    sendCommand('live2d-asoul-modifyBackgroundConfig', config);
}

function openBackgroundSetTime() {
    sendCommand('live2d-asoul-openBackgroundSetTime', background_time);
}

function closeBackgroundSetTime() {
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
// 背景图下载相关
function downloadBackground() {
    sendCommand('live2d-asoul-downloadBackground');
}
function removeDownloadBackground() {
    const ele = document.getElementById('currentBackground');
    while (ele.firstChild) {
        ele.removeChild(ele.firstChild);
    }
}
function initDownloadBackground(list) {
    const ele = document.getElementById('currentBackground');
    while (ele.firstChild) {
        ele.removeChild(ele.firstChild);
    }
    list?.forEach(obj => {
        let eleImg = document.createElement("img");
        eleImg.src = obj.img;
        eleImg.classList.add('download-img')
        eleImg.onclick = () => downloadIamge(obj.img, obj.author);
        ele.appendChild(eleImg);
    })
}
//下载图片地址和图片名
function downloadIamge(imgsrc, filename) {
    let image = new Image();
    // 解决跨域 Canvas 污染问题
    image.setAttribute("crossOrigin", "anonymous");
    image.onload = function () {
        let canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        let context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, image.width, image.height);
        let url = canvas.toDataURL("image/png"); //得到图片的base64编码数据
        let a = document.createElement("a"); // 生成一个a元素
        let event = new MouseEvent("click"); // 创建一个单击事件
        a.download = (filename || "photo") + new Date().getTime().toString(); // 设置图片名称
        a.href = url; // 将生成的URL设置为a.href属性
        a.dispatchEvent(event); // 触发a的单击事件
    };
    image.src = imgsrc;
}

