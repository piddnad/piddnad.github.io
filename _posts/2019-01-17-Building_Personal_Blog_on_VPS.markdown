---
layout: post
title:  "VPS 搭建个人博客傻瓜教程"
date:   2019-01-17
categories: [教程]
tags: [Tutorial, Linux]
---

## 0 前言
之所以会写这篇教程，是因为发生了黑客攻击我的博客并删除数据库的事件，导致我一怒之下直接重装了服务器的系统。。。

所以，我要首先对攻击我的服务器的黑客献上最崇高的敬意：

![](https://ws2.sinaimg.cn/large/006tKfTcly1g0vt3rhlamj31c00u0e82.jpg)

## 1 准备工作
为了搭建一个完全属于自己的个人博客，你只需要以下 3 样东西：

* 自己有一台 VPS 或独立主机（提供 VPS 的服务商很多，例如[搬瓦工](https://bwh1.net/index.php)、[DigitalOcean](https://www.digitalocean.com/)、[Linode](https://www.linode.com/)等）
* 在域名提供商注册一个域名（可以通过[阿里云](https://wanwang.aliyun.com/domain/)，便宜且简单快捷）
* 好奇心和一点点动手能力

准备好了，我们就开始！

## 2 域名解析
> 简单的说，域名解析就是把你购买的域名绑定到你的 VPS 对应的 IP 地址上。

本教程以阿里云为例：

首先登录阿里云，进入“控制台”，进入菜单“域名”-“域名列表”。

![](https://ws3.sinaimg.cn/large/006tKfTcly1g0vt3z6xy1j31te0gyjwc.jpg)

这里列出了你持有的全部域名，找到你想要解析的域名，在右边的“操作”中选择“解析”。

![](https://ws2.sinaimg.cn/large/006tKfTcly1g0vt44r4p9j31ti0k8wkf.jpg)

进入解析设置界面，按照上图添加两条记录，“记录值”字段填写你的 VPS 的 IP 地址。

这样，域名解析就配置完成了。你可以使用自己的电脑 ping 一下刚才解析的域名，若正确无误，应该可以 ping 通。

![](https://ws4.sinaimg.cn/large/006tKfTcly1g0vt48193lj30pa07o0xe.jpg)

## 3 搭建 LNMP 环境

> LNMP 指的是一个基于 CentOS/Debian 编写的 Nginx、PHP、MySQL、phpMyAdmin、eAccelerator 一键安装包。可以在 VPS、独立主机上轻松的安装 LNMP 生产环境。

> LNMP代表的就是：Linux + Nginx + MySQL + PHP 这种网站服务器架构。
 
> 实际上，在 [LNMP 官网](https://lnmp.org/)上也有相关的[安装教程](https://lnmp.org/install.html)，推荐大家参考。

接下来的操作，都是要在 VPS 上完成。因此，我们需要通过 ssh 命令连接到服务器。

> SSH（Secure Shell）即安全外壳协议，是目前较可靠、专为远程登录会话和其他网络服务提供安全性的协议。

* 对于 macOS 和 Linux 用户，可以直接在终端内使用 ssh 命令。
    * 默认端口连接 ``ssh root@ip``（ssh 默认端口为22）
    * 指定端口连接 ``ssh -p 端口号 root@ip``
* 对于 Windows 用户，需要使用别的方式，我推荐一个 Chrome App：[Secure Shell](http://link.zhihu.com/?target=https%3A//chrome.google.com/webstore/detail/secure-shell/pnhechapfaindjhompbnflcldabbghjo%3Futm_source%3Dchrome-app-launcher-info-dialog)，当然，你也可以安装别的 ssh 工具例如 [PuTTY](https://www.chiark.greenend.org.uk/~sgtatham/putty/) 等。

成功登录后，创建一个名为 “lnmp” 的 screen 会话：

```
screen -S lnmp
```

下载并解压，执行安装命令，进入安装配置界面：

```
wget http://soft.vpser.net/lnmp/lnmp1.5.tar.gz -cO lnmp1.5.tar.gz && tar zxf lnmp1.5.tar.gz && cd lnmp1.5 && ./install.sh lnmp
```

选择 MySQL 数据库版本：

![](https://ws1.sinaimg.cn/large/006tKfTcly1g0vt4bqdyyj30v40e6gqe.jpg)

注意：MySQL 5.6，5.7 及 MariaDB 10 需要 1G 以上内存。

随后会设置 MySQL 的 root 密码，建议设置一个较强的密码并牢记。

接下来询问是否需要启用 MySQL InnoDB，InnoDB 引擎默认为开启，一般建议开启。

![](https://ws1.sinaimg.cn/large/006tKfTcly1g0vt4m9tz2j30xe03qdhg.jpg)

选择 PHP 版本：

![](https://ws3.sinaimg.cn/large/006tKfTcly1g0vt4s8b1oj30pm0byq6d.jpg)

注意：选择 PHP 7+ 版本时需要自行确认PHP版本是否与自己的程序兼容。

最后，选择是否安装内存优化：

![](https://ws1.sinaimg.cn/large/006tKfTcly1g0vt4vg6chj30uo06u40p.jpg)

> 这里做一个简单的科普。
> TCMalloc 是 Google 开源的一个内存管理库， 作为 glibc malloc 的替代品。目前已经在 Chrome、Safari 等知名软件中运用；
> Jemalloc 是 facebook 推出的， 最早的时候是 freeBSD 的 libc malloc 实现，目前在 Firefox、Facebook 服务器各种组件中大量使用。

配置完成，回车，耐心等待安装完成。安装时间一般为几十分钟到几个小时。

安装完成后，显示 ``Install lnmp V1.5 completed! enjoy it.`` ，表示安装成功。

## 4 添加虚拟主机
LNMP 安装完成后，就可以添加虚拟主机了，执行：

```
lnmp vhost add
```

提示输入域名，输入你的域名:

![](https://ws3.sinaimg.cn/large/006tKfTcly1g0vt50mf13j30w202cwfb.jpg)

回车，提示添加更多域名

![](https://ws2.sinaimg.cn/large/006tKfTcly1g0vt54d2xxj30x2024mxy.jpg)

> 注：带 www 和不带 www 的是不同的域名，如需带 www 和不带的 www 的域名都访问同一个网站，需要同时都绑定。

接下来，设置网站目录，这里我们可以直接回车采用默认目录

![](https://ws1.sinaimg.cn/large/006tKfTcly1g0vt57zue8j30r00220tm.jpg)

询问伪静态和是否启用日志，我这里全选了no

![](https://ws2.sinaimg.cn/large/006tKfTcly1g0vt5bam58j30gg068aba.jpg)

接下来，会询问是否添加数据库和数据库用户，输入 y 。输入之前设置的数据库root密码，然后，提示输入数据库名称，输入要创建的数据库名称，确认。同时，会创建一个和数据库同名的数据库用户，设置数据库用户密码，回车确认。

![](https://ws3.sinaimg.cn/large/006tKfTcly1g0vt5evjuuj317m06e0vo.jpg)



最后会询问是否添加 SSL 证书，推荐添加。然后选择 2，可以为你自动申请一个 SSL 证书。

![](https://ws4.sinaimg.cn/large/006tKfTcly1g0vt5iwro4j30ru05e0u8.jpg)

## 5. 安装 WordPress
首先进入添加的虚拟主机目录

```
cd /home/wwwroot/www.piddnad.cn
```

下载 WordPress 最新安装包

```
wget http://wordpress.org/latest.tar.gz
```

下载完成后解压

```
tar -xzvf latest.tar.gz
```

将解压出来的WordPress文件全部移动到当前域名目录下

```
mv wordpress/* .
```

删除wordpress空文件夹和WordPress安装包

```
rm -rf wordpress
rm -rf latest.tar.gz
```

赋予根目录文件可写权限，避免因权限问题导致安装出错等问题

```
chmod -R 755 /home/wwwroot
chown -R www /home/wwwroot
```

至此，我们在VPS端的操作全部完成。

## 7 自定义你的博客！
打开浏览器，输入你的博客网址，进入 WordPress 安装程序

![](https://ws1.sinaimg.cn/large/006tKfTcly1g0vt5mik4rj318a0u0wm5.jpg)

数据库名、数据库用户名和数据库密码都填写之前创建的，并建议妥善记录保管。

![](https://ws3.sinaimg.cn/large/006tKfTcly1g0vt5r95stj316x0u0q8b.jpg)

然后将进行“著名的WordPress五分钟安装程序”，最后，大功告成！

## 6 其他优化
### 6.1 添加IP访问
可以尝试一下在浏览器地址栏输入 VPS 的 IP 地址，将会看到LNMP安装成功的提示界面：

![](https://ws4.sinaimg.cn/large/006tKfTcly1g0vt5vaawsj30u00v3x0t.jpg)

为解决这个问题，我们需要修改 LNMP 网站配置文件

```
vi /usr/local/nginx/conf/nginx.conf
```

![](https://ws1.sinaimg.cn/large/006tKfTcly1g0vt5y37ixj30t408e402.jpg)

找到server对应模块的代码，并将 root 后面的值更换为 /home/wwwroot/www.piddnad.cn

## 后记
其实还有很多可以优化的东西，比如开启防火墙，更改 SWAP 分区大小等。。今天就说到这里吧，以后慢慢写。

最后，要感谢 Simonyy（[博客地址](http://www.simonyy.com/)）一直以来的帮助支持，还有他的博客搭建教程，嘿嘿。

## 参考
1. https://www.simonyy.com/2018/10/13/ru-keng-ling-ji-chu-da-jian-si-ren-bo-ke-jia-jian/#toc_8
2. https://lnmp.org/install.html
3. https://blog.csdn.net/junlon2006/article/details/77854898


