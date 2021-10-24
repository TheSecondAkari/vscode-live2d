const vscode = acquireVsCodeApi();
function generateResources() {
    vscode.postMessage({ type: 'generateResources' });
}

function removeResources() {
    vscode.postMessage({ type: 'removeResources' });
}

let background_time = 30;

function handleChangeTime(e) {
    const value = Number(e.target.value);
    if (value > 0) {
        background_time = value;
    }
    else e.target.value = '0.5';
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

function sendCommand(type, data) {
    window.top.postMessage({ type, data }, "vscode-file://vscode-app");
}