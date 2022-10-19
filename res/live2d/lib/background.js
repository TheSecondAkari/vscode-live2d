// 背景图样式基础样式
let backgroundCssNode;
const typeList = [1, 2, 3, 4, 1, 2, 4, 1, 4]; // sort 参数的随机  1是浏览量，2是分享数，3是新发布，4是热门
const pageList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
var currentImgs = undefined;
const IMGKEY = 'live2d-asoul-background';
const BgConfKey = 'live2d-asoul-background-config';
let backgroundConfig = JSON.parse(localStorage.getItem(BgConfKey) || '{}');

const getRandom = (arr) => arr[Math.floor((Math.random() * arr.length))];

const getRandomArray = (arr, num) => {
    let sData = arr.slice(0), i = arr.length, min = i - num, item, index;
    while (i-- > min) {
        index = Math.floor((i + 1) * Math.random());
        item = sData[index];
        sData[index] = sData[i];
        sData[i] = item;
    }
    return sData.slice(min);
}

function addBackgroundStyle(styleContent) {
    removeBackgroundStyle(); //先清除旧样式
    const topDocument = window.top.document;
    backgroundCssNode = topDocument.createElement('style');
    backgroundCssNode.appendChild(topDocument.createTextNode(styleContent))
    topDocument.head.appendChild(backgroundCssNode);
}

function removeBackgroundStyle() {
    if (backgroundCssNode) {
        backgroundCssNode.remove();
        backgroundCssNode = undefined;
    }
}

function getBackgroundStyleText(mainImgs, siderImgs) {
    const { opacity = 0.2, backgroundSize = 'cover' } = backgroundConfig;
    const commonStyle = `
    content: '';
    pointer-events: none;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 99999;
    width: 100%;
    height: 100%;
    background-position: center center;
    background-repeat: no-repeat;
    background-size: ${backgroundSize};
    opacity:${opacity};
    `;

    const styleContent = `
${addMainImagesCss(mainImgs, commonStyle)}
${addSidebarImagesCss(siderImgs, commonStyle)}
`;

    return styleContent;
}

function addMainImagesCss(images, commonStyle, loop) {

    // ------ 在前景图时使用 ::after ------
    const frontContent = '::after'; // useFront ? '::after' : '::before';

    // ------ 组合样式 ------
    const imageStyleContent = images
        .map((img, index) => {
            // ------ nth-child ------
            // nth-child(1)
            let nthChildIndex = index + 1 + '';
            // nth-child(3n + 1)
            if (loop) {
                nthChildIndex = `${images.length}n + ${nthChildIndex}`;
            }

            return (
                // code editor
                `[id="workbench.parts.editor"] .split-view-view:nth-child(${nthChildIndex}) ` +
                `.editor-container .editor-instance>.monaco-editor ` +
                `.overflow-guard>.monaco-scrollable-element${frontContent}{background-image: url('${img}') !important;${commonStyle}}` +
                '\n' +
                // home screen
                `[id="workbench.parts.editor"] .split-view-view:nth-child(${nthChildIndex}) ` +
                `.empty::before { background-image: url('${img}') !important;${commonStyle} }`
            );
        })
        .join('\n');

    const content = `
${imageStyleContent}
[id="workbench.parts.editor"] .split-view-view .editor-container .editor-instance>.monaco-editor .overflow-guard>.monaco-scrollable-element>.monaco-editor-background{background: none;}
`;

    return content;
}

const addSidebarImagesCss = function (images, commonStyle, loop) {
    const sidebarItems = [
        "workbench.view.explorer",
        "workbench.view.search",
        "workbench.view.scm",
        "workbench.view.debug",
        "workbench.view.extensions"
    ];

    // ------ 组合样式 ------
    const imageStyleContent = images
        .map((img, index) => {
            // ------ nth-child ------
            // nth-child(1)
            let nthChildIndex = index + 1 + '';
            // nth-child(3n + 1)
            if (loop) {
                nthChildIndex = `${images.length}n + ${nthChildIndex}`;
            }
            const Items = sidebarItems && sidebarItems.length ? sidebarItems : ['workbench.view.explorer'];
            // sidebar content css
            return (
                Items.map(
                    id =>
                        `[id="${id}"] .split-view-view:nth-child(${nthChildIndex}) ` +
                        `.pane-body .monaco-list>.monaco-scrollable-element::before{background-image: url('${img}') !important;${commonStyle}}`
                ).join('\n') + '\n'
            );
        })
        .join('\n');
    return imageStyleContent;
};

function getAsoulImgs(callback) {
    fetch(`https://api.asoulfanart.com:9000/getPic?page=${getRandom(pageList)}&tag_id=0&sort=${getRandom(typeList)}&part=0&rank=0&ctime=0&type=1`, {
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, same-origin, *omit
        headers: {
            "user-agent": "Mozilla/4.0 MDN Example",
            "content-type": "application/json"
        },
        method: "GET", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, cors, *same-origin
        redirect: "follow", // manual, *follow, error
        referrer: "no-referrer" // *client, no-referrer
    })
        .then(response => response.json())
        .then(function (myJson) {
            if (Array.isArray(myJson) && myJson.length > 0) {
                const imgs = myJson.map(item => ({ author: item.name || 'none', img: getRandom(item.pic_url).img_src }));
                const targets = getRandomArray(imgs, 10);
                callback && callback(targets);
            }
        });
}

// 切换背景的具体操作
function changeAction(targets) {
    if (targets) {
        const imgs = targets.map(i => i.img);
        const sidebar = imgs.slice(0, 5);
        const coding = imgs.slice(5, 10);
        currentImgs = targets;
        const css = getBackgroundStyleText(sidebar, coding);
        addBackgroundStyle(css);
    }
}

// 设置背景图，从接口获取，随机设置
const changeBackground = () => getAsoulImgs(changeAction)

// 移除背景图
function removeBackground() {
    removeBackgroundStyle();
}

// 保存背景图
function saveBackground() {
    if (currentImgs)
        localStorage.setItem(IMGKEY, JSON.stringify(currentImgs));
}

// 加载背景图
function loadBackground() {
    const str = localStorage.getItem(IMGKEY);
    if (str) {
        const imgs = JSON.parse(str);
        changeAction(typeof imgs[0] === 'string' ? imgs.map(img => ({ img })) : imgs);
    }
}

// 设置定时切换背景图
let timer = undefined;
function openBackgroundSetTime(time) {
    closeBackgroundSetTime();
    if (typeof time === 'number' && time > 0) {
        timer = setInterval(() => {
            changeBackground();
        }, 1000 * 60 * time)
        // 加入旋转样式
        document.getElementsByClassName('pio-background')[0].classList.add('normal-cycle');
    }
}

// 关闭定时切换背景图
function closeBackgroundSetTime() {
    if (timer) {
        clearInterval(timer);
        timer = undefined;
        // 移除旋转样式
        document.getElementsByClassName('pio-background')[0].classList.remove('normal-cycle');
    }
}

// 修改背景图样式配置： 不透明度、适配模式
function modifyBackgroundConfig(config) {
    backgroundConfig = config;
    localStorage.setItem(BgConfKey, JSON.stringify(config));
    if (currentImgs?.length) {
        changeAction(currentImgs)
    }
}