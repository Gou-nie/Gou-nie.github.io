---
tags:
  - bug
category:
  - write
---

# 操作记录

_踩坑记录_

- 1. [ios 应用发布 TestFlight](#first)
  - 1.1. [打包](#firstPOne)
  - 1.2. [注意事项](#firstPTwo)
- 2. [vscode 操作](#second)
  - 2.1. [rustfmt](#secondPOne)

## 1. <a name='first'></a> iosApp 测试版发布

### 1.1. 打包

<br>&emsp;&emsp; 在 xcode 中完成项目编码之后, 选择 Product->Archive, 选择自动分发 App（Distribute App）.会有一个弹窗要选择 App Store Connect，如果这里选择 TestFlight Internal Only 的话是无法给外部测试人员分发的。
<br>&emsp;&emsp; 等待进度条走完，登陆 ios 开发者管理平台，进入到之前创建好的 App 中在 TestFlight 中可以看到已经有一个构建版本是准备提交的状态，这里有一个出口规范选项选不是上面两种即可，然后就会开始审核到。可以在后边群组添加测试人员，会有个弹窗让输入这次测试的提示信息给测试人员。
<br>&emsp;&emsp; 审核通过之后，在 TestFlight 中就会有一个可以下载的版本。可以通过邮件通知测试人员下载，也可以使用公开的固定链接给匿名测试人员测试。
<br>&emsp;&emsp; 测试人员可以通过 TestFlight 下载到 App，然后安装到自己的手机上进行测试。

### 1.2. 注意事项

<br>&emsp;&emsp; 版本问题，从 2025 年 4 月 24 号开始，必须使用 Xcode16 及以上版本构建 App 上传 App Store Connect 提交或发布。 系统版本和 Xcode16 版本对应关系如下：
| Xcode 版本 | 支持的 macOS 版本 | SDK | 部署目标 | 设备支持 | 模拟器 | Swift |
|----------------|------------------------------------------|---------------------------------------------------------------------|--------------------------------------------------------------------------|--------------------------------------------------------------------------|-----------------------------------------------------------------------|----------------------------------------------------------------------|
| Xcode 16.3 | macOS Sequoia 15.2  或更高版本 | iOS 18.4<br>Apple tvOS 18.4<br>watchOS 11.4<br>visionOS 2.4<br>macOS 15.4<br>DriverKit 24.4 | iOS 15–18<br>iPadOS 15–18<br>Apple tvOS 15–18<br>watchOS 7–11<br>visionOS 1–2<br>macOS 10.13–15<br>DriverKit 19–24 | iOS 15  或更高版本<br>Apple tvOS 15  或更高版本<br>watchOS 7  或更高版本<br>visionOS 1  或更高版本 | iOS 15-18.4<br>Apple tvOS 15-18.4<br>watchOS 8-11.4<br>visionOS 1-2.4 | **编译器：**<br>Swift 6.1<br><br>**语言模式：**<br>Swift 6<br>Swift 5<br>Swift 4.2<br>Swift 4 |
| Xcode 16.2 | macOS Sonoma 14.5 - macOS Sequoia 15.x | iOS 18.2<br>Apple tvOS 18.2<br>watchOS 11.2<br>visionOS 2.2<br>macOS 15.2<br>DriverKit 24.2 | iOS 15–18<br>iPadOS 15–18<br>Apple tvOS 15–18<br>watchOS 7–11<br>visionOS 1–2<br>macOS 10.13–15<br>DriverKit 19–24 | iOS 15  或更高版本<br>Apple tvOS 15  或更高版本<br>watchOS 7  或更高版本<br>visionOS 1  或更高版本 | iOS 15-18.2<br>Apple tvOS 15-18.1<br>watchOS 8-11.1<br>visionOS 1-2.1 | **编译器：**<br>Swift 6.0<br><br>**语言模式：**<br>Swift 6<br>Swift 5<br>Swift 4.2<br>Swift 4 |
| Xcode 16.1 | macOS Sonoma 14.5 - macOS Sequoia 15.x | iOS 18.1<br>Apple tvOS 18.1<br>watchOS 11.1<br>visionOS 2.1<br>macOS 15.1<br>DriverKit 24.1 | iOS 15–18<br>iPadOS 15–18<br>Apple tvOS 15–18<br>watchOS 7–11<br>visionOS 1–2<br>macOS 10.13–15<br>DriverKit 19–24 | iOS 15  或更高版本<br>Apple tvOS 15  或更高版本<br>watchOS 7  或更高版本<br>visionOS 1  或更高版本 | iOS 15-18.1<br>Apple tvOS 15-18<br>watchOS 8-11<br>visionOS 1-2 | **编译器：**<br>Swift 6.0<br><br>**语言模式：**<br>Swift 6<br>Swift 5<br>Swift 4.2<br>Swift 4 |
| Xcode 16 | macOS Sonoma 14.5 - macOS Sequoia 15.x | iOS 18<br>Apple tvOS 18<br>watchOS 11<br>visionOS 2<br>macOS 15<br>DriverKit 24 | iOS 15–18<br>iPadOS 15–18<br>Apple tvOS 15–18<br>watchOS 7–11<br>visionOS 1–2<br>macOS 10.13–15<br>DriverKit 19–24 | iOS 15  或更高版本<br>Apple tvOS 15  或更高版本<br>watchOS 7  或更高版本<br>visionOS 1  或更高版本 | iOS 15-18<br>Apple tvOS 15-18<br>watchOS 8-11<br>visionOS 1-2 | **编译器：**<br>Swift 6.0<br><br>**语言模式：**<br>Swift 6<br>Swift 5<br>Swift 4.2<br>Swift 4 |

<br>&emsp;&emsp; [xcode 各种版本 xip 下载地址](https://developer.apple.com/download/all/)

<br>&emsp;&emsp; 第三方包需要隐私清单清单来声明，否则审核不过，提示二进制文件无效。 这个可以将第三方更新到最新版本，或者自己去声明隐私。

## 2. <a name='second'></a> vscode 操作

### 2.1. <a name='secondPOne'></a> rustfmt

<br>&emsp;&emsp; 安装 rust-analyzer 插件，这个插件中rustfmt可以格式化 rust 代码。 
一开始快捷键格式化代码错误如下
```
[Error - 14:13:22] Request textDocument/formatting failed.
  Message: Failed to spawn cd "/Users/mac/Documents/githubObject/leaningRust/leaning_library/src/lean001" && "rustfmt" "path"
  Code: -32603 
```
*原因：rustfmt没在插件设置里配置路径*
在setting.json中添加配置如下
```
  "rust-analyzer.rustfmt.overrideCommand": [
    "/usr/local/bin/rustfmt"
  ],
```