---
layout: post
title:  "ffmpeg 使用笔记"
date:   2019-04-16
categories: [技术]
tags: [Tutorial, Linux]
---

因为毕设涉及到截取视频帧这一操作，因此（在学长的推荐下）接触并使用了 [ffmpeg](https://ffmpeg.org/ffmpeg.html) 这个转码视频的强大工具。

## 1 What is ffmpeg?
ffmpeg 是一个非常有用的命令行程序，用于快速转码媒体文件。它是领先的多媒体框架 FFmpeg 的一部分，后者在其[官网](https://ffmpeg.org/)是这么介绍的：“（FFmpeg）能够解码、编码、转码、混流、分离、流化、过滤和播放几乎所有的人和机器创建的媒体文件，支持从最晦涩古老至前沿的各种格式，还具有高度可移植性，可以在各种构建环境，机器架构和配置下使用。”

> 注意，ffmpeg 和 FFmpeg 不是同一个东西。FFmpeg 是框架，而 ffmpeg 是一个其中的一个功能。

具体来说，ffmpeg命令读取由 -i 选项指定的任意数量的输入“文件”（可以是常规文件，管道，网络流，抓取设备等），并写入任意数量的由普通输出URL指定的输出“文件”。 其处理流程可描述如下图：

```
 _______              ______________
|       |            |              |
| input |  demuxer   | encoded data |   decoder
| file  | ---------> | packets      | -----+
|_______|            |______________|      |
                                           v
                                       _________
                                      |         |
                                      | decoded |
                                      | frames  |
                                      |_________|
 ________             ______________       |
|        |           |              |      |
| output | <-------- | encoded data | <----+
| file   |   muxer   | packets      |   encoder
|________|           |______________|
```

## 2 安装 ffmpeg
macOS 下，使用 [Homebrew](https://brew.sh/) 安装，过程非常简单：

```
brew install ffmpeg
```

安装结束后，可以通过以下命令查看安装ffmpeg的信息：

```
brew info ffmpeg
```

## 3 从视频中截取帧存储为图片文件
从一个基础命令开始：

```
ffmpeg -i foo.avi -r 1 -s WxH -f image2 foo-%03d.jpg
```

这个命令的效果是：从视频 foo.avi 中每秒提取一个视频帧，并以 WxH 的尺寸将其输出为名称类似 foo-001.jpg、foo-002.jpg 的图片文件。

上面的命令里，用到了一些常规参数：
* -i 获取输入文件
* -f 指定保存图片使用的格式 
* -r 设置帧率，即每秒提取图片的帧数
* -s 设置输出图像尺寸

有时，我们需要截取特定数量的帧，或者在视频的特定时间开始截取，这就需要用到以下三个参数：
* -frames:v 指定抽取的帧数
* -t 指定持续时间，单位为秒
* -ss 指定起始时间，注意需要在 -i 参数之前，否则会得到空输出（已踩过坑）

以我使用的一个命令举例

```
ffmpeg -ss 1:20:00 -i 1.mp4 -r 1/30 -frames:v 100 -f image2 image_%05d.jpg
```

即从视频 1.mp4 的 1:20:00 时间开始，每 30 秒提取一个视频帧，共截取 100 帧，输出为名称格式类似 image_00001.jpg 的图片文件。

## 4 截取视频片段
和截取图片类似，使用命令时需要提供输入和输出文件名，不同的是输出文件变成了视频格式。再根据需求自定义一些参数就ok啦~

```
ffmpeg -ss 1:01:13 -t 20 -i 2.mp4 temp.mp4
```

参数也很好理解：
* -ss 需要截取内容的开始时间
* -t 为需要截取的时长
* （可选）-codec copy 这个选项会复制原视频的所有流，不进行重新编码。如果没有 -codec 选项，ffmpeg 将使用默认编码器重新编码输入中的每个流。


## 后记
关于 ffmpeg 的更多用法和资料，可以参考其[官方网站](https://ffmpeg.org/ffmpeg.html)（本文的大部分内容也参考于此）。

