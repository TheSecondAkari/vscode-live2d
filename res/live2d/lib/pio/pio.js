/* ----

# Pio Plugin
# By: Dreamer-Paul
# Modify: journey-ad
# Last Update: 2021.5.4

一个支持更换 Live2D 模型的 Typecho 插件。

本代码为奇趣保罗原创，并遵守 GPL 2.0 开源协议。欢迎访问我的博客：https://paugram.com

---- */

var Paul_Pio = function (prop) {
    var that = this;

    // 音频实例，只维护一个
    var audioInstance = new Audio();

    var current = {
        idol: localStorage.getItem('live2d-asoul-model') ? Number(localStorage.getItem('live2d-asoul-model')) : 0,
        menu: document.querySelector(".pio-container .pio-action"),
        canvas: document.getElementById("pio"),
        body: document.querySelector(".pio-container"),
        root: document.location.protocol + '//' + document.location.hostname + '/'
    };

    /* - 方法 */
    var modules = {
        // 更换模型
        idol: function () {
            current.idol < (prop.model.length - 1) ? current.idol++ : current.idol = 0;
            return current.idol;
        },
        // 创建内容
        create: function (tag, prop) {
            var e = document.createElement(tag);
            if (prop.class) e.className = prop.class;
            return e;
        },
        // 随机内容
        rand: function (arr) {
            return arr[Math.floor(Math.random() * arr.length)];
        },
        // 播放音频
        audioPlay: function (url) {
            if (url && audioInstance) {
                audioInstance.pause();
                audioInstance.src = url;
                audioInstance.play().catch((e) => {
                    if (e.toString() == 'NotSupportedError: Failed to load because no supported source was found.')
                        this.render('vscode默认不支持html音频处理,如何开启可查看该插件简介')
                })
            }
        },
        // 创建对话框方法
        render: function (text) {
            if (text.constructor === Array) {
                dialog.innerHTML = modules.rand(text);
            }
            else if (text.constructor === String) {
                dialog.innerHTML = text;
            }
            else {
                dialog.innerHTML = "输入内容出现问题了 X_X";
            }

            dialog.classList.add("active");

            clearTimeout(this.t);
            this.t = setTimeout(function () {
                dialog.classList.remove("active");
            }, 3000);
        },
        // 是否为移动设备
        isMobile: function () {
            var ua = window.navigator.userAgent.toLowerCase();
            ua = ua.indexOf("mobile") || ua.indexOf("android") || ua.indexOf("ios");

            return window.innerWidth < 500 || ua !== -1;
        }
    };
    this.modules = modules;

    var elements = {
        home: modules.create("span", { class: "pio-home" }),
        background: modules.create("span", { class: "pio-background" }), // 用于切换背景图
        skin: modules.create("span", { class: "pio-skin" }),
        skate: modules.create("span", { class: "pio-skate" }),
        audio: modules.create("span", { class: "pio-diana" }), // 语音功能测试
        fans: modules.create("span", { class: "pio-asoulfans" }),
        info: modules.create("span", { class: "pio-info" }),
        // close: modules.create("span", { class: "pio-close" }),
        // show: modules.create("div", { class: "pio-show" })
    };

    var dialog = modules.create("div", { class: "pio-dialog" });
    current.body.appendChild(dialog);
    // current.body.appendChild(elements.show);  // 自带的显示和关闭 注释掉

    /* - 提示操作 */
    var action = {
        // 欢迎
        welcome: function () {
            if (prop.tips) {
                var text, hour = new Date().getHours();

                if (hour > 22 || hour <= 5) {
                    text = '你是夜猫子呀？这么晚还不睡觉，明天起的来嘛';
                }
                else if (hour > 5 && hour <= 8) {
                    text = '早上好！';
                }
                else if (hour > 8 && hour <= 11) {
                    text = '上午好！工作顺利嘛，不要久坐，多起来走动走动哦！';
                }
                else if (hour > 11 && hour <= 14) {
                    text = '中午了，工作了一个上午，现在是午餐时间！';
                }
                else if (hour > 14 && hour <= 17) {
                    text = '午后很容易犯困呢，今天的运动目标完成了吗？';
                }
                else if (hour > 17 && hour <= 19) {
                    text = '傍晚了！窗外夕阳的景色很美丽呢，最美不过夕阳红~';
                }
                else if (hour > 19 && hour <= 21) {
                    text = '晚上好，今天过得怎么样？';
                }
                else if (hour > 21 && hour <= 23) {
                    text = '已经这么晚了呀，早点休息吧，晚安~';
                }
                else {
                    text = "奇趣保罗说：这个是无法被触发的吧，哈哈";
                }

                modules.render(text);
            }
            else {
                modules.render(prop.content.welcome || "欢迎使用本插件，记得去B站关注a-soul！");
            }

            // 定时提醒,每一小时提示一下需要休息了
            setInterval(() => {
                modules.render('已经连续一个小时写代码了，请注意活动一下身体');
            }, 1000 * 60 * 60);
        },
        // 触摸
        touch: function () {
            current.canvas.onclick = function () {
                modules.render(prop.content.touch || ["你在干什么？", "再摸我就报警了！", "HENTAI!", "不可以这样欺负我啦！"]);
            };
        },
        // 右侧按钮
        buttons: function () {
            // asoulworld网站
            elements.home.onclick = function () {
                window.open('https://studio.asf.ink/');
            };
            elements.home.onmouseover = function () {
                modules.render(prop.content.home || "想查看更多A-Soul的信息吗？");
            };
            current.menu.appendChild(elements.home);

            // 更换背景图
            elements.background.onclick = function () {
                changeBackground && changeBackground();
            };
            elements.background.onmouseover = function () {
                modules.render(prop.content.background || "背景图？早该换换了");
            };
            current.menu.appendChild(elements.background);

            // 更换模型
            elements.skin.onclick = function () {
                const modelIndex = modules.idol();
                localStorage.setItem('live2d-asoul-model', modelIndex);
                that.model = loadlive2d("pio", prop.model[modelIndex], model => {
                    prop.onModelLoad && prop.onModelLoad(model)
                    prop.content.skin && prop.content.skin[1] ? modules.render(prop.content.skin[1]) : modules.render("新衣服真漂亮~");
                });
            };
            elements.skin.onmouseover = function () {
                prop.content.skin && prop.content.skin[0] ? modules.render(prop.content.skin[0]) : modules.render("想看看我的新衣服吗？");
            };
            if (prop.model.length > 1) current.menu.appendChild(elements.skin);

            // 溜冰场
            elements.skate.onclick = function () {
                const link = window.溜冰场 || prop.content.link;
                if (link) {
                    if (Array.isArray(link))
                        window.open(modules.rand(link))
                    else if (typeof link === 'string')
                        window.open(link);
                }
                else {
                    window.open("https://paugram.com/coding/add-poster-girl-with-plugin.html");
                }
            };
            elements.skate.onmouseover = function () {
                const list = ["溜冰去咯", "随机挑战开启", "溜冰的意思不是让你咬咬牙溜十次八次，而是要上百次", "你想摸鱼？？？"]
                modules.render(list);
            };
            current.menu.appendChild(elements.skate);


            // 音频测试
            elements.audio.onclick = function () {
                if (current.idol === 0) {
                    window.live2d_playAction({
                        text: "嘉心糖屁都用没有",
                        motion: "Tap生气 -领结"
                    })
                    // 播放音频
                    modules.audioPlay(`./models/Diana/audio/jiaxintang-nouse.aac`);
                }
                else {
                    modules.render('晚晚的语音测试未添加');
                }
            };
            elements.audio.onmouseover = function () {
                modules.render("音频测试");
            };
            current.menu.appendChild(elements.audio);

            // 一个魂们的二创
            elements.fans.onclick = function () {
                window.open("https://asoulfanart.com/pic");
            };
            elements.fans.onmouseover = function () {
                modules.render("想看更多一个魂们的二创吗？");
            };
            current.menu.appendChild(elements.fans);

            // 关于我
            elements.info.onclick = function () {
                window.open("https://www.bilibili.com/video/BV1FZ4y1F7HH");
            };
            elements.info.onmouseover = function () {
                modules.render(["想了解更多关于我的信息吗？", "模型来源"]);
            };
            current.menu.appendChild(elements.info);
        }
    };

    /* - 运行 */
    var begin = {
        static: function () {
            current.body.classList.add("static");
        },
        fixed: function () {
            action.touch(); action.buttons();
        },
        draggable: function () {
            action.touch(); action.buttons();

            var body = current.body;
            body.onmousedown = function (downEvent) {
                var location = {
                    x: downEvent.clientX - this.offsetLeft,
                    y: downEvent.clientY - this.offsetTop
                };

                function move(moveEvent) {
                    body.classList.add("active");
                    body.classList.remove("right");
                    body.style.left = (moveEvent.clientX - location.x) + 'px';
                    body.style.top = (moveEvent.clientY - location.y) + 'px';
                    body.style.bottom = "auto";
                }

                document.addEventListener("mousemove", move);
                document.addEventListener("mouseup", function () {
                    body.classList.remove("active");
                    document.removeEventListener("mousemove", move);
                });
            };
        }
    };

    // 运行
    this.init = function (onlyText) {
        if (!(prop.hidden && modules.isMobile())) {
            if (!onlyText) {
                action.welcome();
                that.model = loadlive2d("pio", prop.model[current.idol], model => {
                    prop.onModelLoad && prop.onModelLoad(model)
                });
            }

            switch (prop.mode) {
                case "static": begin.static(); break;
                case "fixed": begin.fixed(); break;
                case "draggable": begin.draggable(); break;
            }

        }
    };

    this.init();
};

// 请保留版权说明
if (window.console && window.console.log) {
    console.log("%c Pio %c https://paugram.com ", "color: #fff; margin: 1em 0; padding: 5px 0; background: #673ab7;", "margin: 1em 0; padding: 5px 0; background: #efefef;");
}