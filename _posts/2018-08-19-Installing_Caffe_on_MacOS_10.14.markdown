---
layout: post
title:  "macOS10.14 + Anaconda3 + Python 3.7 安装Caffe框架"
date:   2018-08-19
categories: [教程]
tags: [Tutorial, Caffe, Apple, DeepLearning]
---

2019更新：这是一篇踩坑实录，目前建议大家使用 PyTorch 作为深度学习框架。

## 写在前面

捣鼓了一周左右，总算是装好了Caffe。这个过程中，在网上看了很多教程，更重要的是请教了一位装过的同学——他为我提供了很多帮助，我特别感谢他。

总的来说，这真是一次曲折而痛苦的经历。无论如何，记录一下这次安装过程，但愿后面装 Caffe 的各位童鞋少走一些弯路。（2018.12注：建议现在要使用 Caffe 的童鞋直接用 Docker，哈哈）

废话少说，安装整体分为三个过程，即

- 安装依赖
- 编译 Caffe
- 编译 Caffe 的 Python 接口


##安装环境

- macOS 10.14 Mojave
- Homebrew
- Anaconda 3
- Python 3.7
- openBLAS
- CPU_ONLY 模式


## 安装依赖
首先确定安装了 Anaconda 和 Homebrew，安装方法不再赘述。
打开Terminal，使用 Brew 安装依赖。

```
brew install --fresh -vd snappy leveldb gflags glog szip lmdb opencv hdf5 openblas
# brew install --build-from-source --with-python --fresh -vd protobuf
brew install --build-from-source --fresh -vd boost boost-python3
```

**关于 protobuf：**

如果使用 brew install 会默认安装最新版本，但由于protobuf 3.6.0 之后的版本需要C++ 11，会导致编译caffe时失败。

所以需要去 Github 上下一个老版本，在 https://github.com/google/protobuf，我下载的是3.5.1。找到自己需要的版本，下载protobuf-3.5.1.zip后解压。

```
cd /Users/Piddnad/Downloads/protobuf-3.5.1
./configure
make
make check
make install
```

这样就可以安装成功了，在终端 protoc --version 可以检验是否安装成功。

## 编译 Caffe

先从 Github 克隆 Caffe 源代码。

```
git clone https://github.com/BVLC/caffe.git
cd caffe
cp Makefile.config.example Makefile.config
```

接下来，编辑编译配置文件 Makefile.config.example，并保存为 Makefile.config。 

以下是我的配置，需要修改的位置已在注释中标注。

```
## Refer to http://caffe.berkeleyvision.org/installation.html
# Contributions simplifying and improving our build system are welcome!

# cuDNN acceleration switch (uncomment to build with cuDNN).
# USE_CUDNN := 1

# CPU-only switch (uncomment to build without GPU support).
# 开启CPU_ONLY模式
CPU_ONLY := 1

# uncomment to disable IO dependencies and corresponding data layers
# USE_OPENCV := 0
# USE_LEVELDB := 0
# USE_LMDB := 0

# uncomment to allow MDB_NOLOCK when reading LMDB files (only if necessary)
#	You should not set this flag if you will be reading LMDBs with any
#	possibility of simultaneous read and write
# ALLOW_LMDB_NOLOCK := 1

# Uncomment if you're using OpenCV 3
OPENCV_VERSION := 3

# To customize your choice of compiler, uncomment and set the following.
# N.B. the default for Linux is g++ and the default for OSX is clang++
# CUSTOM_CXX := g++

# CUDA directory contains bin/ and lib/ directories that we need.
CUDA_DIR := /usr/local/cuda
# On Ubuntu 14.04, if cuda tools are installed via
# "sudo apt-get install nvidia-cuda-toolkit" then use this instead:
# CUDA_DIR := /usr

# CUDA architecture setting: going with all of them.
# For CUDA < 6.0, comment the *_50 through *_61 lines for compatibility.
# For CUDA < 8.0, comment the *_60 and *_61 lines for compatibility.
# For CUDA >= 9.0, comment the *_20 and *_21 lines for compatibility.
CUDA_ARCH := -gencode arch=compute_20,code=sm_20 \
		-gencode arch=compute_20,code=sm_21 \
		-gencode arch=compute_30,code=sm_30 \
		-gencode arch=compute_35,code=sm_35 \
		-gencode arch=compute_50,code=sm_50 \
		-gencode arch=compute_52,code=sm_52 \
		-gencode arch=compute_60,code=sm_60 \
		-gencode arch=compute_61,code=sm_61 \
		-gencode arch=compute_61,code=compute_61

# BLAS choice:
# atlas for ATLAS (default)
# mkl for MKL
# open for OpenBlas
BLAS := open
# Custom (MKL/ATLAS/OpenBLAS) include and lib directories.
# Leave commented to accept the defaults for your choice of BLAS
# (which should work)!
# BLAS_INCLUDE := /path/to/your/blas
# BLAS_LIB := /path/to/your/blas

# Homebrew puts openblas in a directory that is not on the standard search path
BLAS_INCLUDE := $(shell brew --prefix openblas)/include
BLAS_LIB := $(shell brew --prefix openblas)/lib

# This is required only if you will compile the matlab interface.
# MATLAB directory should contain the mex binary in /bin.
# MATLAB_DIR := /usr/local
# MATLAB_DIR := /Applications/MATLAB_R2012b.app

# NOTE: this is required only if you will compile the python interface.
# We need to be able to find Python.h and numpy/arrayobject.h.
# PYTHON_INCLUDE := /usr/local/Cellar/python@2/2.7.15_1/Frameworks/Python.framework/Versions/2.7/include/python2.7 \
# /usr/local/lib/python2.7/site-packages/numpy/core/include
# PYTHON_LIB := /usr/local/Cellar/python@2/2.7.15_1/Frameworks/Python.framework/Versions/2.7/lib
# Anaconda Python distribution is quite popular. Include path:
# Verify anaconda location, sometimes it's in root.
ANACONDA_HOME := /Users/piddnad/anaconda3
PYTHON_INCLUDE := $(ANACONDA_HOME)/include \
		$(ANACONDA_HOME)/include/python3.7m \
		$(ANACONDA_HOME)/lib/python3.7/site-packages/numpy/core/include
# PYTHON_INCLUDE := $(ANACONDA_HOME)/envs/py27/include \
#         $(ANACONDA_HOME)/envs/py27/include/python2.7 \
#         $(ANACONDA_HOME)/envs/py27/lib/python2.7/site-packages/numpy/core/include

# Uncomment to use Python 3 (default is Python 2)
PYTHON_LIBRARIES := boost_python37 python3.7m
# PYTHON_INCLUDE := /usr/include/python3.6m \
#                /usr/lib/python3.5/dist-packages/numpy/core/include

# We need to be able to find libpythonX.X.so or .dylib.
# PYTHON_LIB := $(ANACONDA_HOME)/envs/py27/lib
PYTHON_LIB := $(ANACONDA_HOME)/lib

# Homebrew installs numpy in a non standard path (keg only)
# PYTHON_INCLUDE += $(dir $(shell python -c 'import numpy.core; print(numpy.core.__file__)'))/include
# PYTHON_LIB += $(shell brew --prefix numpy)/lib

# Uncomment to support layers written in Python (will link against Python libs)
# WITH_PYTHON_LAYER := 1

# Whatever else you find you need goes here.
INCLUDE_DIRS := $(PYTHON_INCLUDE) /usr/local/include
LIBRARY_DIRS := $(PYTHON_LIB) /usr/local/lib /usr/lib

# If Homebrew is installed at a non standard location (for example your home directory) and you use it for general dependencies
# INCLUDE_DIRS += $(shell brew --prefix)/include
# LIBRARY_DIRS += $(shell brew --prefix)/lib

# NCCL acceleration switch (uncomment to build with NCCL)
# https://github.com/NVIDIA/nccl (last tested version: v1.2.3-1+cuda8.0)
# USE_NCCL := 1

# Uncomment to use `pkg-config` to specify OpenCV library paths.
# (Usually not necessary -- OpenCV libraries are normally installed in one of the above $LIBRARY_DIRS.)
# USE_PKG_CONFIG := 1

# N.B. both build and distribute dirs are cleared on `make clean`
BUILD_DIR := build
DISTRIBUTE_DIR := distribute

# Uncomment for debugging. Does not work on OSX due to https://github.com/BVLC/caffe/issues/171
# DEBUG := 1

# The ID of the GPU that 'make runtest' will use to run unit tests.
TEST_GPUID := 0

# enable pretty build (comment to see full commands)
Q ?= @

```

随后，在 caffe 目录执行

```
make clean
make all -j8 #（数字表示线程数量，可以根据你的硬件配置增加或减少）
make test -j8
make runtest
make pycaffe
make pytest
```


## 错误解决

1. make all 时一堆错误，错误出在文件名带 protobuf 的文件

    protobuf 版本问题，需要安装3.6.0以下版本，具体参考前文。


2. make pycaffe 时错误，提示library not found fpr -lboost_python

    将配置文件84行

    ```
    PYTHON_LIBRARIES := boost_python3 python3.7m
    ```
    
    改为
    
    ```
    PYTHON_LIBRARIES := boost_python37 python3.7m
    ```
3. make pytest 出错
    
    ```
    cd python; python -m unittest discover -s caffe/test
    /bin/sh: line 1: 10816 Segmentation fault: 11  python -m unittest discover -s caffe/test
    make: *** [pytest] Error 139
    ```
    
    未解决
    
    
## 参考链接
https://blog.nyan.im/posts/3177.html
https://cn.aliyun.com/jiaocheng/349449.html
    

