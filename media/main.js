const vscode = acquireVsCodeApi();

function generateResources() {
    vscode.postMessage({ type: 'generateResources' });
}

function removeResources() {
    vscode.postMessage({ type: 'removeResources' });
}

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

function sendCommand(type, data) {
    window.top.postMessage({ type, data }, "vscode-file://vscode-app");
}

