# 在无序数组中求第K小的数

1）改写快排的方法O(N), 因为不回退

就是partition对数组做荷兰国旗问题的划分, 然后通过< = > 三个区域的边界, 
看(i > L && i < R) 如果是, 则返回arr[i]
否则对k位数在的区间做partition

2）bfprt算法



![image-20211129163244085](https://raw.githubusercontent.com/handsomeyi/Pics/master/image-20211129163244085.png)



**选出相对平凡的数, 避免出现差情况**



# top k问题

给定一个无序数组arr中，长度为N，给定一个正数k，返回top k个最大的数

不同时间复杂度三个方法：

- **O(N*logN)**

  直接排序取出前K个

- **O(N + K*logN)O**

  大根堆(从底往上建堆) + 弹出前K个元素

- **O(N + k*logk)**

  先求出第k大的数x, 然后过一遍, 把小于x的拿出来 => O(N)

  一共k个,再排序就是k*logk



# 蓄水池(巨型抽奖问题)

假设有一个源源吐出不同球的机器，

只有装下10个球的袋子，每一个吐出的球，**要么放入袋子，要么永远扔掉** (二选一)

如何做到机器吐出每一个球之后，所有吐出的球都等概率被放进袋子里

(袋子里的球也可能被淘汰)



### 公平思路

小于10直接放入

==**大于10就以 10/i 的概率判断是否入袋, 然后如果入袋, 就从袋子里面随机淘汰一个**==

保证每个球等概率入袋, 并且实现一个一个入袋



# uuid生成器

![image-20211129181337755](https://raw.githubusercontent.com/handsomeyi/Pics/master/image-20211129181337755.png)



