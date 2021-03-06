---
layout: post
title:  "论文重读：Faster R-CNN: Towards Real-Time Object Detection with Region Proposal Networks"
date:   2019-03-14
categories: [论文]
tags: [Paper, Deep Learning, Object Detection]
---

发表在 NIPS 2015

Paper: [Faster R-CNN: Towards Real-Time Object Detection with Region Proposal Networks](https://arxiv.org/abs/1506.01497)

大名鼎鼎的 Faster R-CNN，第一次读是去年暑假，然而读完也似懂非懂，如今过了半年重读一遍，想必会有新的收获。

## Abstract
* 目前最先进的目标检测网络基于区域提议算法（region proposal algorithms）来假设对象位置。先进的网络如 SPPnet 和 Fast R-CNN 已经减少了检测网络的运行时间，这时区域提议计算就成为了瓶颈。
* 在本文的工作中，我们提出了一个区域提议网络（Region Proposal Network, RPN ），它与检测网络共享全局卷积特征，使得区域提议几乎不需要时间。
    * RPN 是一个可同时预测每个位置的对象边框和对象得分的完全卷积网络。
    * RPN 通过端到端地训练得到，能够生成高质量用于 Fast R-CNN 进行目标检测的区域提议。
    * 通过一个简单的交替优化，RPN 和 Fast R-CNN 可以共享卷积特征。
* 对于非常深的 VGG-16 模型，我们的检测系统在 GPU 上的帧速率为 5fps（包括所有步骤），同时在 PASCAL VOC 2007 和 2012 上实现了最先进的目标检测精度（73.2％mAP，70.4％mAP），每张图片使用 300 个提议框。代码已公开。

## 1 Introduction
目标检测的最新进展是由区域提议方法（region proposal methods）和基于区域的卷积神经网络（R-CNNs）的成功推动的。
* 尽管最初提出的基于区域建议的（region-based）CNN 计算代价很高，但通过候选区域之间共享卷积，其代价已经大大降低。因此，提议步骤是目前最先进目标检测系统的主要瓶颈。
* 区域提议方法通常依赖于廉价的特征（inexpensive features）和经济的推断模式（economical inference schemes）。
    * 选择性搜索（Selective Search, SS）是最流行的方法之一，基于人工构造的特征采用贪心策略合并超像素。然而和高效的检测网络相比，选择性搜索慢了一个数量级，在 CPU 中处理每张图片需要 2s。
    * EdgeBoxes 在提议质量和生成速度之间取得了最佳权衡，处理每张图片需要 0.2s。然而，区域提议步骤仍然消耗了与检测网络一样多的运行时间。

值得注意的是，Fast R-CNN 利用了GPU，但区域提议依然基于 CPU 实现——一个很显然的加速区域提议的方法就是在 GPU 上实现，但是这一实现却忽略了下游的检测网络，因此错过了共享计算的重要机会。

> 至此，本文已经提出了目前给予区域提议的目标检测方法的两个弊病，即（1）区域提议方法速度太慢，成为整个目标检测系统的瓶颈；（2）把区域提议和检测都放在 GPU 可以加速计算，但同时实现特征共享也成为了可能，何乐而不为呢？接下来作者首先引入 RPN：

### 区域提议网络 RPN
本文使用一个深度网络计算提议，提供一种提议计算几乎无代价的优雅而有效的解决方案。为此引入新颖的区域提议网络 RPN，它与最先进的目标检测网络共享卷积层。测试时，计算提议的代价很小（每个图像只需10ms）。

我们观察到，基于区域的探测器（如Fast R-CNN）使用的卷积层特征，也可以用于生成区域提议。在这些卷积特征之上，我们通过添加两个额外的卷积层来构造RPN：它们中一个负责将每一个卷积层的特征图编码成为一个短的（比如256维）特征向量，另一个对于特征图的每一个位置，为k个不同大小和不同比例的候选区域（一般设置k =9）输出一个对象得分和回归得到的边框。

因此，我们的 RPN 是一种完全卷积网络（FCN），它们可以专门针对生成检测提议的任务进行端到端训练。为了将 RPN 与 Fast R-CNN 目标检测网络统一起来，我们提出了一种简单的训练方案，交替执行微调区域提议任务和保持区域提议固定的情况下微调目标检测任务。该方案快速收敛并提供具有在两个任务之间共享卷积特征的单一网络。

我们在 PASCAL VOC 检测基准上评估我们的方法，其中 Fast R-CNN + RPN 产生的检测精度优于具有 Fast R-CNN + SS 的强基线。同时，我们的方法几乎免除了 SS 在测试时的所有计算负担 - 提议的有效运行时间仅为 10 毫秒。使用复杂的非常深的模型，我们的检测方法在GPU上仍然具有5fps的帧速率（包括所有步骤），因此在速度和准确度方面都是一个实用的目标检测系统（PASCAL VOC 2007 上 73.2％mAP，2012 上 70.4％mAP）。

## 2 Related Work
这部分没好好翻，随便看看吧。。

> 最近的几篇论文提出了使用深度网络来定位类特定或类不可知边界框的方法[20,17,3,19]。在OverFeat方法[17]中，训练4-d输出fc层（对于每个或所有类）以预测定位任务（假定单个对象）的框坐标。然后将fc层转换为用于检测多个类特定对象的卷积层。 MultiBox方法[3,19]从网络生成区域提议，其最后的fc层同时预测多个（例如800个）框，用于R-CNN [6]目标检测。他们的提议网络应用于单个图像或多个大图像 crop（例如，224×224）[19]。我们将在后面的方法中更深入地讨论OverFeat和MultiBox。
> 卷积[17,1,7,2]的共享计算已经引起了越来越多的关注，以获得有效但准确的视觉识别。 OverFeat论文[17]计算了图像金字塔中的卷积特征，用于分类，定位和检测。针对共享卷积特征映射的自适应大小池[7]被提出用于有效的基于区域的目标检测[7,15]和语义分割[2]。Fast R-CNN [5]实现了对共享卷积特征的自适应池的端到端训练，并展现出引人注目的准确性和速度。

## 3 Region Proposal Networks
> 在这个部分，详细介绍了本文的主角——RPN。

区域提议网络（RPN）以图像（任意大小）作为输入并输出一组矩形目标提议，每个提议具有目标得分。因为我们的最终目标是与 Fast R-CNN 共享计算，我们假设两个网络共享一组共同的卷积层。 在我们的实验中，我们研究了
* Zeiler和Fergus模型（ZF），它有5个可共享的卷积层；
* Simonyan和Zisserman模型（VGG），它有13个可共享的卷积层。

![RPN](/imgs/20190314/1.jpg)
为了生成区域提议，我们在最后一个共享卷积层输出的卷积特征映射上滑动一个小网络。该网络全连接到输入卷积特征映射的 n×n 空间窗口。每个滑动窗口被映射到较低维向量（对于ZF为256-d，对于VGG为512-d）。该向量被馈送到两个兄弟全连接的层——框回归层（reg）和框分类层（cls）。我们在本文中使用 n = 3，因为注意到输入图像上的有效感受野很大（ZF和VGG分别为171和228像素）。注意，由于迷你网络以滑动窗口方式运行，因此全连接层在所有空间位置共享。这个架构自然地用 n×n 卷积层实现，然后是两个兄弟 1×1 卷积层（分别用于reg和cls）。 ReLU应用于 n×n 卷积层的输出。

### 3.1 Translation-Invariant Anchors
在每个滑动窗口位置，我们同时预测 k 个区域提议，因此 reg 层具有 4k 个输出，即 k 个边框的坐标编码。 cls 层输出 2k 个分数，用于估计每个提议的对象/非对象的概率. k 个提议被相应的相 k 个参考框（称为锚框）进行参数化。每个锚框定位于所讨论的滑动窗口的中心，并对应一种尺度和纵横比。我们使用 3 种尺度和 3 种纵横比，在每个滑动位置产生 k = 9 个锚框。对于大小为 W×H （典型值约 2400）的卷积特征映射，总共存在 WHk 个锚框。我们方法的一个重要特性是平移不变性，对锚框和对计算锚框相应的提议框的函数而言都是这样。

作为比较， MultiBox 方法使用 k-means 生成 800 个锚框，这些锚框不是平移不变的。如果平移图像中的对象，则提议也应该平移，并且相同的函数应该能够在任一位置预测提议。此外，因为MultiBox 的锚框不是平移不变的，所以它需要（4 + 1）×800 维输出层，而我们的方法需要（4 + 2）×9维输出层。我们的提议图层的参数数量减少了一半（使用 GoogLeNet 的 MultiBox 为2700万，而使用VGG-16的RPN为240万），因此PASCAL VOC等小数据集的过度拟合风险较小。

## 3.2 A Loss Function for Learning Region Proposals
> 这一部分讲了 RPN 的损失函数定义，这对于训练出一个高效的区域提议生成网络至关重要。另外这个损失函数在目标检测领域也很常见。

为了训练 RPN，我们给每个锚框分配一个二进制的标签（是不是目标）。

* 我们分配正标签给两类锚框：
    1. 具有与 ground-truth（GT）边框最高 IoU（Intersection-over-Union，交集并集之比）的锚框（也许不到0.7）
    2. 具有与 ground-truth 边框的 IoU  大于 0.7 的锚框。注意，一个 ground-truth 边框有可能为多个锚框分配正标签。
* 我们分配负标签给与所有 ground-truth 边框的 IoU  都低于0.3的锚框。
* 非正非负的锚框将被忽略并且对训练目标没有任何作用。

通过这些定义，我们使用在 Fast R-CNN 中的 multi-task loss  将目标函数最小化。 对于锚框 i，其损失函数定义为：
$ L(p_i, t_i) = L_{cls} (p_i, p_i^\*) + \lambda p_i^\* L_{reg} (t_i, t_i^*) $

* 这里 $ p_i $ 表示锚框 $ i $ 是目标的预测概率。 $ p_i^* $ 表示锚框的标签，如果锚框标记为正，则 $ p_i^* $ 为1，如果标记为负，则为0。
* $ t_i = \{ t_x , t_y , t_w , t_h \}_i $ 表示预测边界框的4个参数化坐标，$ t_i^* = \{ t_x^* , t_y^* , t_w^* , t_h^* \}_i $ 表示与正锚框相关联的 ground-truth 框的坐标。 
* 分类损失 $ L_{cls} $ 是两类（目标与非目标）的 softmax 损失
* 回归损失 $ L_{reg} (t_i , t_i^∗ ) = R(t_i − t_i^∗ )$，$ R $ 是 smooth L1 损失，$ p_i^∗ L_reg $ 这一项说明只有正锚框才计算回归损失
* 损失平衡权重 $ \lambda $ 设为 10，意味着我们期望更好的预测框位置
* cls 层和 reg 层的输出分别由 $ \{p_i\} $ 和 $ \{t_i\} $ 组成

我们采用如下的4个坐标的参数化：
![](/imgs/20190314/2.jpg)
其中x，x_a和x^*分别表示预测框，锚框和 ground-truth 框。 这可以被认为是从锚框到附近的 ground-truth 框的边界框回归。

然而，我们的方法通过与先前基于特征图的方法不同的方式实现了边界框回归[7,5]。 在[7,5]中，边框回归在任意大小的区域的池化特征上进行，并且回归的权重被所有大小的区域共享。在我们的方法中，用于回归的特征在特征图中具有相同的空间大小（n×n）。考虑到各种不同的大小，需要学习一系列 k 个边框回归值。每一个回归量对应于一个尺度和长宽比，k 个回归量之间不共享权重。 因此，即使特征具有固定的尺寸/尺度，预测各种尺寸的边框仍然是可能的。

### 3.3 Optimization
RPN自然地实现为全卷积网络，可以通过反向传播和随机梯度下降（SGD）进行端到端训练。我们遵循[5]中的“imagecentric”采样策略来训练这个网络。每个 mini-batch 由包含许多正负样本的单个图像组成。我们可以优化所有锚框的损失函数，但是这会偏向于负样本，因为它们是主要的。因此，我们随机地在一个图像中采样 256 个锚框，计算 mini-batch 的损失函数，其中采样的正负锚框的比例是1:1。如果一个图像中的正样本数小于128，我们就用负样本填补这个mini-batch。

我们通过从零均值标准差为 0.01 的高斯分布中获取的权重来随机初始化所有新层（最后一个卷积层其后的层），所有其他层（即共享的卷积层）是通过对 ImageNet 分类预训练的模型来初始化的，这也是标准惯例。我们调整ZF网络的所有层，以及 conv3_1，并为VGG网络做准备，以节约内存。我们在PASCAL数据集上对于60k个mini-batch用的学习率为0.001，对于下一20k个mini-batch用的学习率是0.0001。动量是0.9，权重衰减为0.0005。我们使用Caffe实现。

### 3.4 Sharing Convolutional Features for Region Proposal and Object Detection
> 到此为止，RPN 的设计已经讲清楚了。那么，就剩下最后一个问题，如何实现 RPN 和 Fast R-CNN 的卷积特征共享呢？接下来请看本文提出的四步优化法。

到目前为止，我们已经描述了如何训练用于区域提议生成的网络，而没有考虑基于区域的目标检测 CNN 如何利用这些提议。对于检测网络，我们采用 Fast R-CNN，现在描述一种算法，用于学习在 RPN和 Fast R-CNN 之间共享的卷积层。

RPN 和 Fast R-CNN 都是独立训练的，要以不同方式修改其卷积层。因此，我们需要开发一种允许在两个网络之间共享卷积层的技术，而不是分别学习两个网络。请注意，这并不像简单地定义包含 RPN 和 Fast R-CNN 的单个网络，然后使用反向传播联合优化它那样容易。原因是 Fast R-CNN 训练依赖于固定对象提议（ fixed object proposals），如果在同时改变提议机制的同时学习 Fast R-CNN是否将会收敛是不确定的。虽然这种联合优化是未来工作的一个有趣问题，但我们开发了一种实用的4步训练算法，通过交替优化来学习共享特征。
* 第一步，使用经过 ImageNet 训练的模型初始化 RPN ，并针对区域提议任务进行端对端微调。
* 第二步，使用由第一步 RPN 生成的提议通过 Fast R-CNN 训练一个单独的检测网络。该检测网络也由ImageNet预训练模型初始化。此时，两个网络还没有共享卷积层。
* 第三步，我们使用检测网络来初始化 RPN 训练，但是固定共享卷积层并仅微调 RPN 特有的层。现在这两个网络共享卷积层。
* 最后，保持共享卷积层固定，微调 Fast R-CNN 的 fc 层。因此，两个网络共享相同的卷积层，构成一个统一的网络。

### 3.5 Implementation Details
我们在单一尺度的图像上训练和测试区域提议和目标检测网络。我们缩放图像，让它们的短边 s=600 像素。多尺度特征提取可能提高准确率但是不利于速度与准确率之间的权衡。

对于锚框，我们用3个简单的尺度，边框面积为 128x128，256x256，512x512，和3个简单的长宽比，1:1，1:2，2:1。注意到，在预测大建议框时，我们的算法考虑了使用大于基本感受野的锚框。这些预测不是不可能——只要看得见目标的中间部分，还是能大致推断出这个目标的范围。通过这个设计，我们的解决方案不需要多尺度特征或者多尺度滑动窗口来预测大的区域，节省了相当多的运行时间。下表是用ZF网络对每个锚框学到的平均建议框大小（s=600）。

![](/imgs/20190314/3.jpg)

跨越图像边界的锚框要小心处理。在训练中，我们忽略所有跨越图像边界的锚框，这样它们不会对损失有影响。对于一个典型的1000x600的图像，差不多总共有20k（~60x40x9）个锚框。忽略了跨越边界的锚框以后，每个图像只剩下6k个锚框需要训练了。如果跨越边界的异常值在训练时不忽略，就会带来又大又困难的修正误差项，训练也不会收敛。在测试时，我们还是应用全卷积的RPN到整个图像中，这可能生成跨越边界的建议框，我们将其裁剪到图像边缘位置。 

有些RPN建议框和其他建议框大量重叠，为了减少冗余，我们基于建议区域的cls得分，对其采用非极大值抑制（non-maximum suppression, NMS）。我们固定对NMS的IoU阈值为0.7，这样每个图像只剩2k个建议区域。在实验中发现，NMS不会影响最终的检测准确率，但是大幅地减少了建议框的数量。NMS之后，我们用建议区域中的top-N个来检测。在下文中，我们用2k个RPN建议框训练Fast R-CNN，但是在测试时会对不同数量的建议框进行评价。

## 4 Experiments
![](/imgs/20190314/4.jpg)
在 PASCAL VOC 2007 和 PASCAL VOC 2012 目标检测任务上实现了 state-of-art  水平。

## 后记 by Piddnad
Faster R-CNN 的贡献在于提出了 RPN，实现了高效和准确的区域建议的生成。另外，通过与后面的检测网络共享卷积特征，几乎消除区域提议的时间损耗。最后，通过交替优化学习的 RPN 也改善了区域提议的质量，进而提高了整个目标检测系统的准确性。

总的来说，Faster R-CNN 算是深度学习目标检测领域的又一个 milestone。
