# 字符串查找(找到子串)

"abc123def"

"123"

找到子串



## 暴力方法

"aaaaaaaaaaaaaaab"

"aaaaab"

这样导致重复判断, 太暴力了, 没有任何重复利用数据



## 前缀后缀串最长匹配长度

"a b c a b c k"

[0 1 2 3 4 5 6]



### 1.求next数组(短的)

例如:

6位置的信息: **3** (6位置前面的前缀和后缀依次比较, 匹配了就打勾)

![image-20211108175058358](https://i.loli.net/2021/11/08/pOnk7JbeLacjBA4.png)

0位置的信息: 规定为 **-1**

1位置的信息: 规定为 **0**

2位置的信息: 看前面字符串最长匹配值

3......



例如

a  a  b  a  a  b  s  a  a  b  t

[0 1 2   3  4  5  6  7  8  9 10]

-1 0 1   0  1  2  3  ........

如上就是得到的**信息next数组**

 ### 2.

S1的下标 : x

S2的下标 : y

![image-20211108185351182](https://i.loli.net/2021/11/08/zyYwVUf9jruRg1K.png)





![image-20211108185602054](https://i.loli.net/2021/11/08/8P7OvVYQFltJZGR.png)



Next数组

![image-20211108185726198](https://i.loli.net/2021/11/08/Smngj12VMUd5GpK.png)

![image-20211108185738033](https://i.loli.net/2021/11/08/Jt3fbWhgM8w6OuH.png)

## code

```java
public static int getIndexOf(String s1, String s2) {
   if (s1 == null || s2 == null || s2.length() < 1 || s1.length() < s2.length()) {
      return -1;
   }
   char[] str1 = s1.toCharArray();
   char[] str2 = s2.toCharArray();
   int x = 0;
   int y = 0;
   // O(M) m <= n
   int[] next = getNextArray(str2);
   // O(N)
   while (x < str1.length && y < str2.length) {
      if (str1[x] == str2[y]) {
         x++;
         y++;
      } else if (next[y] == -1) { // y == 0
         x++;
      } else {
         y = next[y];
      }
   }
   return y == str2.length ? x - y : -1;
}

public static int[] getNextArray(char[] str2) {
   if (str2.length == 1) {
      return new int[] { -1 };
   }
   int[] next = new int[str2.length];
   next[0] = -1;
   next[1] = 0;
   int i = 2; // 目前在哪个位置上求next数组的值
   int cn = 0; // 当前是哪个位置的值在和i-1位置的字符比较
   while (i < next.length) {
      if (str2[i - 1] == str2[cn]) { // 配成功的时候,就直接值就是前一个的值加一
         next[i++] = ++cn;
      } else if (cn > 0) {
         cn = next[cn];
      } else {
         next[i++] = 0;
      }
   }
   return next;
}
```







