

# 文件描述符到底是什么?

http://c.biancheng.net/view/3066.html



![Linux文件描述符表示意图](https://s2.loli.net/2022/03/04/VECj42tdcioF7fW.gif)

## 打开文件结构拓扑图

如下图: https://www.processon.com/view/link/622949c17d9c0836f90c8b8a

![image-20220310085007945](https://s2.loli.net/2022/03/10/EUfms45n9AI3DZT.png)

- 同一个进程的不同文件描述符可以指向同一个文件
- 不同进程可以拥有相同的文件描述符
- 不同进程的同一个文件描述符可以指向不同的文件(一般也是这样, 除了 0,1,2 这三个特殊的文件)
- 不同进程的不同文件描述符也可以指向同一个文件。

参考: http://t.csdn.cn/PRANK

![img](https://s2.loli.net/2022/03/10/LdsD5kGjZbuzAOm.png)

```c++
这个结构体很庞大，毕竟记录了一个文件的很多信息，我们来逐个分析一下成员变量的作用。
struct hlist_node i_hash;
在文件系统里，所有的inode都在哈希链表上，加快寻找速度。
struct list_head i_list;
struct list_head i_sb_list;
struct list_head i_dentry;
这分别是标识inode在使用中状态的链表，在superblock上记录的链表，在目录上链接的链表，当新建一个inode的时候，会将i_list加在所有的已使用的inode链表上，然后再加到超级块上，最后连接到对应的目录链表上。
unsigned long i_ino;/* inode的唯一标号 */
atomic_t i_count; /* inode引用计数 */
unsigned int i_nlink;/* inode的硬连接数 */
uid_t i_uid;/* inode的对应文件的用户id */
gid_t i_gid;/* inode的对应文件的用户的组id */
dev_t i_rdev;/* 设备标识 */
unsigned long i_version;/* 版本号 */
loff_t i_size;   /* 文件大小 */
struct timespec i_atime;/* 最后修改时间 */
struct timespec i_mtime;/* 文件内容更改时间 */
struct timespec i_ctime;/* 文件change time */
unsigned int i_blkbits; /* inode块大小位数 */
blkcnt_t i_blocks;/* 块数 */
unsigned short          i_bytes;/* 已经使用的字节数 */
umode_t i_mode; /* 文件的打开模式 */
spinlock_t i_lock; /* 自旋锁 */
struct mutex i_mutex; /* 互斥量 */
struct rw_semaphore i_alloc_sem; /* 读写信号量 */
const struct inode_operations *i_op; /* inode的操作函数集合 */
const struct file_operations *i_fop; /* 文件操作函数 */
struct super_block *i_sb;   /* 超级块指针 */
struct file_lock *i_flock; /* 文件锁 */
struct list_head i_devices; /* 连接到设备链表上 */
__u32 i_generation; 
unsigned long i_state;    /* 文件状态位 */
unsigned long dirtied_when; /* 数据变脏时间 */
unsigned int i_flags; /* 状态位 */
atomic_t i_writecount; /* 写入计数 */
#ifdef CONFIG_SECURITY
void *i_security; /* 如果定义了这个宏，就会有一个专门用作安全作用的指针 */
#endif
void *i_private; /* 私有数据 */
```



## Linux一切皆为文件

比如C艹源文件, 视频文件, Shell脚本, 可执行文件等, 就连键盘, 显示器, 鼠标等硬件设备也都是文件.

一个 Linux 进程可以打开成百上千个文件,

Linux进程 

## 数组下标与偏移量的关系

数组在内存是一组连续的地址
比如，你声明了个数组
int a[5];
这里有5个数组元素，第一个元素的下标为0，依此类推：1，2，3，4
偏移量就是指相对于数组第一个元素的偏移值
比如，偏移量为2
那么此时应该指向是 a[1]
转载：
二、数组名和指针的关系
这个问题是个历史性的问题了，在C语言中，数组名是当作指针来处理的。更确切的说，数组名就是指向数组首元素地址的指针，数组索引就是距数组首元素地址的偏移量。理解这一点很重要，很多数组应用的问题就是有此而起的。这也就是为什么C语言中的数组是从0开始计数，因为这样它的索引就比较好对应到偏移量上。

# Linux文件系统详解

http://t.csdn.cn/NXSDf



