---
layout: post
title:  "Scrapy小练习之新闻爬虫"
date:   2019-07-10
categories: [教程]
tags: [Tutorial, Python, Scrapy]
---


## 0 写在前面

最近在暑期学校上课，选的一门课需要从网上爬取文本数据，所以借此机会复习一下Python网络爬虫。

这次使用的是自己之前用过的Scrapy框架，记录一下自己的学习&动手过程，方便以后回看~

## 1 Scrapy框架简介

### 爬虫的白话介绍

在介绍框架之前，简单介绍一下爬虫。

当我们上网时，浏览的网页上有很多形形色色的信息，我们可以手动收集（复制粘贴or下载）我们需要的信息。但是，当需要的信息量比较多就显得很麻烦了，有没有一种方式可以自动且快捷地把一堆相关网页上的海量信息下载下来呢？有，那就是网络爬虫。

爬虫首先从一个URL开始，从该页面中获得接下来要爬取的URL，再从新的URL中获取进一步要爬的URL……如此往复，就像蛛网一样访问到所有要爬的网页，在这个过程中，分析并提取网页中有用的数据，以结构化的方式存储——因此，爬虫就像是一个操作速度飞快而又不知疲倦的数据收集助手。

### Scrapy是什么

Scrapy是由Python语言开发的一个快速、高层次的屏幕抓取和Web抓取框架，用于抓取Web站点并从页面中提取结构化的数据。相比于传统的爬虫来说，基于Scrapy框架的爬虫更加结构化，同时也更加高效，能完成更加复杂的爬取任务。

### Scrapy架构概览

Scrapy框架的架构如图所示。

![Scrapy architecture](/imgs/20190710/1.png)

图中，绿线代表数据流向，整个数据流由中央的Scrapy Engine控制，具体工作流程是：

1. 从初始URL开始，Scheduler将第一个要爬取的URL通过下载中间件转发给Downloader进行下载。
2. 下载后页面后，Downloader将Response通过下载中间件和Spider中间件交给Spider进行分析。爬虫的核心功能代码在此发挥作用。
3. Spider处理后获得两类信息：第一类是需要进一步抓取的链接，也就是新的request，传回Scheduler；另一类是处理出来的item，交给Item Pipeline进一步处理和存储。
4. 重复直到Scheduler中没有更多的request

## 2 小练习 - 新闻爬虫

首先写一个新闻爬虫练练手。

### 明确需求

由于是一个小项目，所以需求比较简单。目标定为爬取网易的科技新闻（tech.163.com），要获取的项目包括以下几项：

- 标题
- 发表时间
- 来源
- 内容
- 链接

接下来，Coding~

### 创建项目

输入如下命令：

```
scrapy startproject NewsSpider  # 创建项目
cd NewsSpider
scrapy genspider technews tech.163.com  # 创建一个爬虫
```

项目的目录结构：

![](/imgs/20190710/2.png){:width="40%"}

### 定义Item

Item是保存爬取到的数据的容器，其使用方法和python字典类似。根据需求分析，我们在items.py文件中写入如下内容：

```
import scrapy

class NewsspiderItem(scrapy.Item):
    # define the fields for your item here like:
    # name = scrapy.Field()
    title = scrapy.Field()
    date = scrapy.Field()
    source = scrapy.Field()
    content = scrapy.Field()
    url = scrapy.Field()
    pass
```

### 编写爬虫

Spider是用于从网站爬取数据的类，也是我们整个工程的核心。

每一个Spider必须继承Scrapy内置的爬虫类。这里，我们选择继承CrawlSpider，CrawlSpider是爬取一般网站常用的spider，其定义了一些规则来提供跟进链接的方便机制。 

Spider代码如下：

```
class TechnewsSpider(CrawlSpider):
    name = 'technews'
    allowed_domains = ['tech.163.com']
    start_urls = ['https://tech.163.com/']

    rules = [
        Rule(LinkExtractor(
            allow=(
                ('https://tech\.163\.com/[0-9]+/.*$')
            ),
        ),
        callback="parse_item",
        follow=True)
    ]
```

具体来讲，我们需要定义爬取规则（rules），这里用到了三个规则：

- `link_extractor` 定义了如何从爬取到的页面提取链接。
- `callback` 是一个函数，从link_extractor中每获取到链接时将会调用该函数。该回调函数接受一个response作为其第一个参数， 并返回一个包含 `Item`以及(或) `Request`对象的列表(list)。个人理解就是替代最简单的Spider中的parse，根据不同内容的Xpath路径从页面中提取内容。
- `follow` 是一个布尔(boolean)值，指定了根据该规则从response提取的链接是否需要跟进。

接下来我们需要定义最关键的parse_item()函数，提取我们想要的item。

- title：新闻标题在页面的h1标签内。
- date：发表时间在类名为'post_time_source'的div标签内，但是包含其他无关字符，因此需要使用正则表达式进行匹配。
- source：来源在id为'ne_article_source'的a标签内。
- content：内容需要费点力气，通过观察发现content都在id为'endText'的div标签里的p标签内，但是只有普通的p标签才是正文，因此使用p[not(@class)]进行过滤，最后使用''.join()将整个文章合并。
- url：直接从response的url属性获得。

最终代码如下：

```
    def parse_item(self, response):
        item = NewsspiderItem()
        item['title'] = response.xpath("//h1/text()").extract()
        item['date'] = response.xpath("//div[@class='post_time_source']/text()").re(
            r'[0-9]*-[0-9]*-[0-9]* [0-9]*:[0-9]*:[0-9]*')
        item['source'] = response.xpath("//a[@id='ne_article_source']/text()").extract()
        item['content'] = ''.join(response.xpath("//div[@id='endText']/p[not(@class)]/text()").extract())
        item['url'] = response.url

        yield item
```

### 修改Settings

在开始爬取之前，还需要在Settings里面进行一些简单的设置。

```
BOT_NAME = 'NewsSpider'

SPIDER_MODULES = ['NewsSpider.spiders']
NEWSPIDER_MODULE = 'NewsSpider.spiders'

ROBOTSTXT_OBEY = True

FEED_EXPORT_ENCODING = 'utf-8'  # 输出的编码格式为uft-8
FEED_EXPORT_FIELDS = ["title", "date", "source", "content", "url"]  # 输出的字段顺序

DOWNLOAD_DELAY = 0.01  # 增加爬取延迟，降低被爬网站服务器压力
CLOSESPIDER_ITEMCOUNT = 500  # 爬取的新闻条数上限
```

### 运行效果

最后，运行爬虫：

```
scrapy crawl technews -o news.csv -t csv
```

爬取的新闻被成功保存在csv文件中~

![](/imgs/20190710/3.png)



## 参考

1. <http://www.demodashi.com/demo/13933.html>
2. <https://scrapy-chs.readthedocs.io/zh_CN/stable/intro/tutorial.html>