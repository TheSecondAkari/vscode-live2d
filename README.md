# A-SOUL-live2d 使用简介
    嘉晚饭是真的！ 赢！
# 简单预览：
![](https://s3.bmp.ovh/imgs/2021/10/5a972bb9b3badcd0.png#pic_center)

# 视频演示

  [插件介绍视频](https://www.bilibili.com/video/BV1mR4y1J7XL)  可以的话请给我点一下赞，能转发分享评论就最好了   
  [我的b站账号](https://space.bilibili.com/5637882)  关注吗？也不是不行，(*^_^*)

# 功能概况：

使用 iframe 嵌入页面中，实现效果。

- 启动 live2d 看板娘视图(使用sdk: [pixi-live2d-display](https://github.com/guansss/pixi-live2d-display)   [pio](https://paugram.com/))
- 模型：嘉然、向晚（来源 b 站 up：[木果阿木果](https://space.bilibili.com/886695)）
- 整体操作
  - 拖拽位置
  - 缩放大小
  - 点击穿透
- 随机切换背景图
  - 该功能可与 A-SOUl-background插件功能配合使用，本插件的背景图优先级会更高
  - 点击切换随机背景图 [图来源](https://asoul.cloud/pic)
  - 保存背景图
  - 加载保存背景图
  - 定时切换背景图
- 随机溜冰场: 部分常见溜冰场，可能会有部分滞后
- [asoul 导航](https://asoulworld.com/)入口
- [一个魂二创](https://asoul.cloud/)入口

# 使用介绍：

## Warns 警告：

> **本插件是通过修改 vscode 的 js 文件的方式运行**
> 所以会在初次安装，或者 vscode 升级的时候，出现以下提示，请选择 【不再提示】:
>
> **This extension works by editting the vscode's css file.**
> So, a warning appears while the first time to install or vscode update. U can click the [never show again] to avoid it.
<div style="text-align:center" >
<img src="https://user-images.githubusercontent.com/9987486/40583926-b1fb5398-61ca-11e8-8271-4ac650d158d3.png#pic_center"  width="400" align="center">
</div>
This is the reason:
<div style="text-align:center" >
<img src="https://user-images.githubusercontent.com/9987486/40583775-91d4c8d6-61c7-11e8-9048-8c5538a32399.png#pic_center"  width="400" align="center">
</div>

## 使用流程

<div style="text-align:center" >
<img src="https://s3.bmp.ovh/imgs/2021/10/c4f5ec92fa4a10ab.png#pic_center"  height="350" align="center">
</div>

    本插件下载后，可以在侧边栏 “资源管理区” (第一个图标)，的最下面看到新的抽屉层【LIVE2D-A-SOUL】。
    初次打开该抽屉，会进行资源的配置,右下角提示需要重新启动vscode

<div style="text-align:center" >
<img src="https://i.bmp.ovh/imgs/2021/10/09e96e27a743e11b.png#pic_center"  height="400" align="center">
<img src="https://s3.bmp.ovh/imgs/2021/10/f5317166b245dd0a.png#pic_center"  height="400" align="center">
</div>

    再次打开该抽屉可以看到很多对应的功能按钮
    - 基本操作
      - 启动、关闭live2d： 字面意思，会启动看板人物，初始默认位置右下角
      - 保存当前配置： 在调整live2d大小缩放和拖拽位置后，可保存信息，下次启动时自动携带
      - 重置默认位置： 当前位置异常，无法拖拽移动时可重置使用【缩放大小也会重置】
      - 背景图
        - 点击切换： 点击按钮为人物右侧图标第二个
        - 保存背景图： 需要当前背景图存在才会生效。只能保存一份，再次点击会覆盖旧的
        - 加载背景图： 加载保存的背景图
        - 定时切换： 字面意思，可查看 切换按钮 是否旋转判断是否开启定时功能
    - 配置信息
      - 自启动： 字面意思，开启后。vscode启动，live2d自动启动
      - 定位依赖： 人物定位的依赖角
    - 补充配置
      - 插件依赖文件：
        - 插件依赖文件会在初次安装插件并启动时自动生成
        - 生成： live2d无法正常启动时，可尝试点击该按钮，强制重新生成覆盖配置信息
        - 移除： 卸载该插件前，请尽可能先执行该操作。 可移除插件对vscode文件的所有修改
  
    - 人物功能
      - 目光跟随鼠标 【缺点，暂时无法实现整个页面的跟随】
      - 点击互动
      - asoul粉丝导航网站入口
      - 切换背景图
      - 切换模型
      - 溜冰场
      - 音频测试
      - 一个魂二创网站入口
      - 模型来源

## 卸载流程
<div style="text-align:center" >
<img src="https://s3.bmp.ovh/imgs/2021/10/2e6689036f3d5953.png#pic_center"  width="400" align="center">
</div>

    卸载该插件前，请尽可能先执行该操作。可移除插件对vscode文件的所有修改,恢复正常。
    然后在插件列表卸载该插件

# 额外要求 【如果想开启音频支持】

    当前插件仅一个简单的语音测试，暂且可以不用考虑该功能

[VS Code 使用的 Electron 版本不包含 ffmpeg](https://stackoverflow.com/a/51735036)，需替换自带的 ffmpeg 动态链接库才能正常播放 (每次更新 VS Code 都需重新替换)

_VS Code for Windows 1.31.0 - 1.35.1 不需替换，1.36.0 后无此待遇_

_VS Code for macOS 1.43+ 替换后闪退[解决方案](https://github.com/nondanee/vsc-netease-music/issues/86#issuecomment-786546931)_

<details>
<summary>
<b>手动替换操作</b>
</summary>

    首先需要查看 vscode 版本对应的electron版本， 然后下载对应系统的electron版本的压缩包，将里面的特定文件ffmpeg 解压到vscode的安装目录下，替换原vscode的ffmpeg文件

  [electron下载](https://npm.taobao.org/mirrors/electron/)

#### Windows
    界面左上角 点击 help(帮助) => about(关于)，弹窗可查看electron版本  
    下载 **electron-%version%-win32-x64.zip**
    替换 `./ffmpeg.dll` 文件
#### macOS
    界面左上角 点击 code => about，弹窗可查看electron版本 
    下载 **electron-%version%-darwin-x64.zip**
    替换 `./Electron.app/Contents/Frameworks/Electron\ Framework.framework/Libraries/libffmpeg.dylib`
#### Linux
    界面左上角 Help(帮助) → \rightarrow →About(关于)
    下载 **electron-%version%-linux-x64.zip**
    替换 `./libffmpeg.so`

</details>
  
  
# 鸣谢
[vscode-live2d](https://marketplace.visualstudio.com/items?itemName=CharlesZ.vscode-live2d)  
[pixi-live2d-display](https://github.com/guansss/pixi-live2d-display)  
[pio](https://paugram.com/)  
[journey-ad](https://github.com/journey-ad)
  
还有乐于分享的一个魂们  
[asoul 导航](https://asoulworld.com/)  
[一个魂二创](https://asoul.cloud/)  
部分小图标也来源b站一个魂们的分享  
嘉然 向晚 模型：[木果阿木果](https://space.bilibili.com/886695)  
  
请勿使用该项目涉及的资源进行商业盈利