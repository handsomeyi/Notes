# IndexTree

## 特点：

**1）支持区间查询**

**2）没有线段树那么强，但是非常容易改成一维、二维、三维的结构**(加层for循环的事儿)

**3）只支持单点更新**



![image-20211201222144835](https://raw.githubusercontent.com/handsomeyi/Pics/master/image-20211201222144835.png)



合成大西瓜 1024 游戏的思想



例如前缀和:  2^n 管前面所有的值

## 规律

- 在help数组中: 10010100代表的数所管的数就是 10010001 **(即把最后一个1去掉, 然后加1得到的数)**

例如 求0110100的累加和



help[0110100] **----->管---->** arr[0110001]~arr[0110100]

+help[0110000] **--->管---->** arr[0100001]~arr[0110001]

+help[0100000] **--->管---->** arr[0000001]~arr[0100000]



- 如果改动arr[010011000]这个数

  则受牵连的有 每个数加上最右侧的1 

  **help[010011000]** 加上最右侧的1 得

  **help[010100000]** 加上最右侧的1 得

  **help[011000000]** 加上最右侧的1 得

  **help[100000000]** 加上最右侧的1 得......

  ......

  

```java
// 下标从1开始！
public static class IndexTree {

   private int[] tree;
   private int N;

   // 0位置弃而不用！
   public IndexTree(int size) {
      N = size;
      tree = new int[N + 1];
   }

   // 1~index 累加和是多少？
   public int sum(int index) {
      int ret = 0;
      while (index > 0) {
         ret += tree[index];
         index -= index & -index;
      }
      return ret;
   }

   // index & -index : 提取出index最右侧的1出来
   // index :           0011001000
   // index & -index :  0000001000
   public void add(int index, int d) {
      while (index <= N) {
         tree[index] += d;
         index += index & -index;
      }
   }
}

public static class Right {
   private int[] nums;
   private int N;

   public Right(int size) {
      N = size + 1;
      nums = new int[N + 1];
   }

   public int sum(int index) {
      int ret = 0;
      for (int i = 1; i <= index; i++) {
         ret += nums[i];
      }
      return ret;
   }

   public void add(int index, int d) {
      nums[index] += d;
   }

}
```

## 例题

https://leetcode-cn.com/problems/range-sum-query-2d-mutable

给你一个 2D 矩阵 matrix，请计算出从左上角 (row1, col1) 到右下角 (row2, col2) 组成的矩形中所有元素的和。

![image-20211201165147453](https://raw.githubusercontent.com/handsomeyi/Pics/master/image-20211201165147453.png)

上述粉色矩形框内的，该矩形由左上角 (row1, col1) = (2, 1) 和右下角 (row2, col2) = (4, 3) 确定。其中，所包括的元素总和 sum = 8。

示例：
```java
给定 matrix = [
  [3, 0, 1, 4, 2],
  [5, 6, 3, 2, 1],
  [1, 2, 0, 1, 5],
  [4, 1, 0, 1, 7],
  [1, 0, 3, 0, 5]
]

sumRegion(2, 1, 4, 3) -> 8
update(3, 2, 2)
sumRegion(2, 1, 4, 3) -> 10
```

注意:

矩阵 matrix 的值只能通过 update 函数来进行修改
你可以默认 update 函数和 sumRegion 函数的调用次数是均匀分布的
你可以默认 row1 ≤ row2，col1 ≤ col2





# AC自动机

前缀树上玩KMP 



解决在一个大字符串中，找到多个候选字符串的问题



## AC自动机算法核心
1）把所有匹配串生成一棵前缀树

2）前缀树节点增加fail指针

3）fail指针含义：

为了不淘汰有任何可能匹配到敏感词的情况  并且是没有重复计算的(性能高) 

实现**==拥有最大的匹配长度==**(父亲的选择最长**自然**导致儿子的选择也是最长的 见**02:24:57** )







如果必须以当前字符结尾，当前形成的路径是str，剩下哪一个字符串的前缀和str的后缀，**==拥有最大的匹配长度==**。fail指针就指向那个字符串的最后一个字符所对应的节点。（迷不迷？听讲述！）

目前来到的节点，之前路径上的字符串记为str，除了str之外哪个前缀字符串，和str的后缀串匹配最大，fail指针就指向那个最大匹配串的最后字符底下的节点。（难理解吧？其实是精髓，看视频）





## build fail

- 头-->null

- 头子-->头 (因为就是第一个字母匹配失败就直接回到开头配呀)

- 我的父-->我 记为char 

  如果父的fail指向的节点 有通往char的路, 则我指向这条路

  如果没有则看这个节点的fail指向的节点, 同理 直到......null



每次移动都沿着fail指针看一遍 有没有符合敏感词的 

只有真失败了 cur才变化

## code

```java
package class32;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;
public class Code04_AC2 {
   // 前缀树的节点
   public static class Node {
      // 如果一个node，end为空，不是结尾
      // 如果end不为空，表示这个点是某个字符串的结尾，end的值就是这个字符串
      public String end;
      // 只有在上面的end变量不为空的时候，endUse才有意义
      // 表示，这个字符串之前有没有加入过答案
      public boolean endUse;
      public Node fail;
      public Node[] nexts;

      public Node() {
         endUse = false;
         end = null;
         fail = null;
         nexts = new Node[26];
      }
   }

   public static class ACAutomation {
      private Node root;
      public ACAutomation() {
         root = new Node();
      }

      public void insert(String s) {//把敏感词 加入前缀树
         char[] str = s.toCharArray();
         Node cur = root;
         int index = 0;
         for (int i = 0; i < str.length; i++) {
            index = str[i] - 'a';
            if (cur.nexts[index] == null) {
               cur.nexts[index] = new Node();
            }
            cur = cur.nexts[index];
         }
         cur.end = s;
      }

      public void build() {//连前缀树的 fail指针
         Queue<Node> queue = new LinkedList<>();
         queue.add(root);
         Node cur = null;
         Node cfail = null;

         while (!queue.isEmpty()) {
            // 某个父亲，cur
            cur = queue.poll();
            for (int i = 0; i < 26; i++) { // 所有的路
               // cur -> 父亲  i号儿子，必须把i号儿子的fail指针设置好！
               if (cur.nexts[i] != null) { // 如果真的有i号儿子
                  cur.nexts[i].fail = root;//先设置好 如果找到了就改就ok啦
                  cfail = cur.fail;
                  while (cfail != null) {
                     if (cfail.nexts[i] != null) {//父亲的fail 有i号儿子的路
                        cur.nexts[i].fail = cfail.nexts[i];
                        break;
                     }
                     cfail = cfail.fail;//再往父亲的fail 指向的节点 的fail找
                  }
                  queue.add(cur.nexts[i]);
               }
            }
         }


      }

      // 大文章：content
      public List<String> containWords(String content) {
         char[] str = content.toCharArray();
         Node cur = root;
         Node follow = null;
         int index = 0;
         List<String> ans = new ArrayList<>();
         for (int i = 0; i < str.length; i++) {
            index = str[i] - 'a'; // 路 content的每个字母 所代表的值
            // 如果当前字符在这条路上没配出来，就随着fail方向走向下条路径
            while (cur.nexts[index] == null && cur != root) {//cur的下条路没有content中被匹配的样本字母 且 cur不是根
               cur = cur.fail;//直接失败 cur移动到fail继续判断
            }
            // 1) 现在来到的路径，是可以继续匹配的
            // 2) 现在来到的节点，就是前缀树的根节点
            cur = cur.nexts[index] != null ? cur.nexts[index]/*可以往下走*/ : root;/*走不了 去root了*/
            follow = cur;//用follow搂一下
            while (follow != root) {
               if (follow.endUse) {//走过了 就不管了
                  break;
               }
               // 不同的需求，在这一段之间修改
               if (follow.end != null) {
                  ans.add(follow.end);
                  follow.endUse = true;
               }
               // 不同的需求，在这一段之间修改
               follow = follow.fail;
            }
         }
         return ans;
      }

   }
///////////////////////////////////////////////////////////////////////////////////
   public static void main(String[] args) {
      ACAutomation ac = new ACAutomation();
      ac.insert("dhe");
      ac.insert("he");
      ac.insert("abcdheks");
      // 设置fail指针
      ac.build();

      List<String> contains = ac.containWords("abcdhekskdjfafhasldkflskdjhwqaeruv");
      for (String word : contains) {
         System.out.println(word);
      }
   }

}
```













