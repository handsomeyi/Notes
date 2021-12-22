# Manacher

https://www.jianshu.com/p/116aa58b7d81

预处理

![image-20211129113040133](https://raw.githubusercontent.com/handsomeyi/Pics/master/image-20211129113040133.png)

- 回文直径



- 回文半径



- 回文半径数组, 生成的帮助数组

  parr[ ]



- 最右回文右边界, 过程中一直更新

  int R = -1



- 最右回文中心点

  int C = 1



### 第一种情况：i没有被R罩住

在这种情况下，采用**普遍的解法**，将移动的位置为对称中心，向两边扩，同时更新回文半径数组，最右回文右边界R和最右回文右边界的对称中心C。







### 第二种情况：i被R罩住

**用C左边的数据 求 C右边的数据!**

下一个要移动的位置就是最右回文右边界R或是在R的左边

在这种情况下又分为三种：

1、下一个要移动的位置p1**不在**最右回文右边界R右边，且cL<pL。

p2是p1以C为对称中心的对称点；

**pL是以p2**为对称中心的回文子串的左边界;

**cL是以C**为对称中心的回文子串的左边界。

这种情况下==**p1的回文半径就是p2的回文半径**==radius[p2]。

![image-20211129115547766](https://raw.githubusercontent.com/handsomeyi/Pics/master/image-20211129115547766.png)

2、下一个要移动的位置票p1**不在**最右回文右边界R的右边，且cL>pL。

p2是p1以C为对称中心的对称点；

pL是以p2为对称中心的回文子串的左边界；

cL是以C为对称中心的回文子串的左边界。

这种情况下p1的回文半径就是**==p1到R==**的距离R-p1+1。

![image-20211129115557663](https://raw.githubusercontent.com/handsomeyi/Pics/master/image-20211129115557663.png)

3、下一个要移动的位置票p1**不在**最右回文右边界R的右边，且cL=pL；

p2是p1以C为对称中心的对称点；

pL是以p2为对称中心的回文子串的左边界；

cL是以C为对称中心的回文子串的左边界。

这种情况下p1的回文半径就还要继续往外扩，但是只需要从R之后往外扩就可以了，扩了之后更新R和C。

![image-20211129115607489](https://raw.githubusercontent.com/handsomeyi/Pics/master/image-20211129115607489.png)



# 例题

给定一个字符串, 在后面加字符, 求最加的最少字数使得整体成为回文.



# KMP例题

检查两个字符串是否互为旋转串 

把s1+s1然后看s2是否为s1+s1子串



# 子树问题

序列化然后KMP

