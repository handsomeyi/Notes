# Hash

in   --> ∞



out--> 0 ~ (2^64) - 1

​	  --> 0 ~ (2^128) - 1

所以一定会有hash碰撞



离散散列





# HashMap



![img](https://s2.loli.net/2021/12/03/wOhoMRuUTBCKHA4.png)



17个桶空间



- 当每个桶挂的树叶差不多到了阈值了



- 就开始扩容



- 扩容后每个节点都重新算hash值 重新算模% 



当每个桶挂的树叶又差不多到了阈值了......



## 时间复杂度?

就算最挫的时候也是单次O(1)  ==> 一个桶, 不能挂任何枝叶 



后面的红黑树什么优化都是小优化





原文链接：https://blog.csdn.net/LoveMyTail/article/details/107286727

不管插入还是查找，由key获取hash值然后定位到桶的时间复杂度都是O（1），那么真正决定时间复杂度的实际上是桶里面链表/红黑树的情况

如果桶里面没有元素，那么直接将元素插入/或者直接返回未查找到，时间复杂度就是O（1），如果里面有元素，那么就沿着链表进行遍历，时间复杂度就是O（n），链表越短时间复杂度越低，如果是红黑树的话那就O(logn)

所以平均复杂度很难说，只能说在最优的情况下是O（1）

# 布隆过滤器

爬虫1 爬虫2 爬虫3 爬虫4......  ====> 爬之前映射到bitmap中 看看是否已经爬过了



然后能想到布隆过滤器的结构

## 布隆过滤器原理

1. 你的数据库里面有啥玩意
2. 你有啥先在我bitmap里面备案
3. 请求来了 我先算一下 如果你的请求没备案 就舍弃!!!(节省了服务器的开销啊)
4. 请求有可能被误标记 没关系 很少很少
5. 而且 省钱 成本低 



![image-20211204003937770](https://s2.loli.net/2021/12/04/CL94MEankFA78Ni.png)





**咱允许有失误率嘛?** 

然后再讨论 聊

## 布隆过滤器重要的三个公式(==全文背诵==)

1. 假设数据量为n，预期的==失误率为p==（布隆过滤器大小和每个样本的大小无关）

2. 根据n和p，算出Bloom Filter一共需要多少个bit位，向上取整，记为m

3. 根据m和n，算出Bloom Filter需要多少个哈希函数，向上取整，记为k

4. 根据修正公式，算出真实的失误率p_true



![image-20211204005604194](https://s2.loli.net/2021/12/04/cAFaqbVeSu3RxsZ.png)

## HDFS

每块存储区域维护一个bloom

可以减少遍历 块数



# 一致性哈希

**机器增减自如, 也解决了分布不均的问题**

![image-20211204134405196](https://s2.loli.net/2021/12/04/RrK1svBcjQkglxN.png)

**根据m机器的性能不同, 可以设置不同的虚拟节点数量**









C++反外挂 => 

unity 自带的工具...






















