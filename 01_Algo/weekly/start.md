# 1.可能的卷子种数(区域查询 => IndexTree)

给定一个数组arr，arr[i] = j，表示第i号试题的难度为j。给定一个非负数M
想出一张卷子，对于任何相邻的两道题目，前一题的难度不能超过后一题的难度+M
返回所有可能的卷子种数

------

题目描述：
多多打算将N道试题按一定顺序排列，组成一场考试，每道题有一定的难度Ai,一场合理考试的题目难度应该是从低到高的，多多希望难度升序，但又不完全升序，相部的题目中前一道题比后一道题难一点点也是可以的。
在对于一个题目序列，只要相邻的题目中前一道题的难度不超过后一道题的难度+M,就认为是满足的序列。求有多个序列是满足的序列。
输入描述：
第一行输入为两个整数N,M,含义如题目描述所示。
第二行为N个整数，分别表示每道题的难度。



#### IndexTree(logN)

- 先sort数组, 难度由小到大

- 0~N-1的题目必须全部使用完

- **==从左往右尝试模型==** 因为新来的数不可能让前面不合法的卷子的尝试变合法 

  也就是如果某个过程不合法直接当前分支剪掉

- 前面合法的卷子种数 × 前面大于等于 arr[index] - M 的点数 = 当前的卷子种数

```java
// 纯暴力方法，生成所有排列，一个一个验证
public static int ways1(int[] arr, int m) {
   if (arr == null || arr.length == 0) {
      return 0;
   }
   return process(arr, 0, m);
}
public static int process(int[] arr, int index, int m) {
   if (index == arr.length) {
      for (int i = 1; i < index; i++) {
         if (arr[i - 1] > arr[i] + m) {
            return 0;
         }
      }
      return 1;
   }
   int ans = 0;
   for (int i = index; i < arr.length; i++) {
      swap(arr, index, i);
      ans += process(arr, index + 1, m);
      swap(arr, index, i);
   }
   return ans;
}
public static void swap(int[] arr, int i, int j) {
   int tmp = arr[i];
   arr[i] = arr[j];
   arr[j] = tmp;
}
//////////////////////////////////////////////////////////
// 时间复杂度O(N * logN)
// 从左往右的动态规划 + 范围上二分
public static int ways2(int[] arr, int m) {
   if (arr == null || arr.length == 0) {
      return 0;
   }
   Arrays.sort(arr);
   int all = 1;
   for (int i = 1; i < arr.length; i++) {
      all = all * (num(arr, i - 1, arr[i] - m) + 1);
   }
   return all;
}
// arr[0..r]上返回>=t的数有几个, 二分的方法
// 找到 >=t 最左的位置a, 然后返回r - a + 1就是个数
public static int num(int[] arr, int r, int t) {
   int i = 0;
   int j = r;
   int m = 0;
   int a = r + 1;
   while (i <= j) {
      m = (i + j) / 2;
      if (arr[m] >= t) {
         a = m;
         j = m - 1;
      } else {
         i = m + 1;
      }
   }
   return r - a + 1;
}
////////////////////////////////////////////
// 时间复杂度O(N * logV)
// 从左往右的动态规划 + IndexTree ===> 区域查询功能 ===> 联想到IndexTree
public static int ways3(int[] arr, int m) {
   if (arr == null || arr.length == 0) {
      return 0;
   }
   int max = Integer.MIN_VALUE;
   int min = Integer.MAX_VALUE;
   for (int num : arr) {
      max = Math.max(max, num);
      min = Math.min(min, num);
   }
   IndexTree itree = new IndexTree(max - min + 2);
   Arrays.sort(arr);
   int a = 0;
   int b = 0;
   int all = 1;
   itree.add(arr[0] - min + 1, 1);
   for (int i = 1; i < arr.length; i++) {
      a = arr[i] - min + 1;
      b = i - (a - m - 1 >= 1 ? itree.sum(a - m - 1) : 0);
      all = all * (b + 1);
      itree.add(a, 1);
   }
   return all;
}
// 注意开始下标是1，不是0
public static class IndexTree {
   private int[] tree;
   private int N;
   public IndexTree(int size) {
      N = size;
      tree = new int[N + 1];
   }
   public int sum(int index) {
      int ret = 0;
      while (index > 0) {
         ret += tree[index];
         index -= index & -index;
      }
      return ret;
   }
   public void add(int index, int d) {
      while (index <= N) {
         tree[index] += d;
         index += index & -index;
      }
   }
}
```





# [689. 三个无重叠子数组的最大和](https://leetcode-cn.com/problems/maximum-sum-of-3-non-overlapping-subarrays/)

给你一个整数数组 nums 和一个整数 k ，找出三个长度为 k 、互不重叠、且全部数字和（3 * k 项）最大的子数组，并返回这三个子数组。

以下标的数组形式返回结果，数组中的每一项分别指示每个子数组的起始位置（下标从 0 开始）。如果有多个结果，返回字典序最小的一个。



#### 思路如下 建立三个dp

help记录 所有的长为3的数组之内的元素和
left记录 左边的数组最大值 存的是下标
right记录右边的数组最大值 存的是下标

下标的含义就是以下标开始 往后一共k个数形成的数组

```java
class Solution {
    public static int[] maxSumOfThreeSubarrays(int[] nums, int k) {
        int L = nums.length;
        int[] help = new int[L - k + 1];//记录 所有的长为3的数组之内的元素和
        for (int i = 0; i <= k - 1; i++) {
            help[0] += nums[i];//初始化help0
        }
        for (int i = 1; i <= L - k; i++) {
            help[i] = help[i - 1] - nums[i - 1] + nums[i + k - 1];//help完成  help是 所有k个数的集合  i代表原数组起始下标
        }
        int[] leftDP = new int[L];
        for (int i = 1; i <= L - 3 * k ; i++) {//左边最大值 存的是下标
            leftDP[i] = help[i] > help[leftDP[i - 1]] ? i : leftDP[i - 1];
        }
        int[] rightDP = new int[L];
        rightDP[L - k] = L - k;
        //L - k
        for (int i = L - k - 1; i >= 2 * k; i--) {//右边最大值 存的是下标
            rightDP[i] = help[i] >= help[rightDP[i + 1]] ? i : rightDP[i + 1];//为了字典序 倒序遍历
        }
        int a = 0, b = 0, c = 0, max= 0;
        for (int i = k; i <= L - 2 * k; i++) {
            int part1 = help[leftDP[i - k]];
            int part2 = help[i];
            int part3 = help[rightDP[i + k]];
            if (part1 + part2 + part3 > max) {
                max = part1 + part2 + part3;
                a = leftDP[i - k];
                b = i;
                c = rightDP[i + k];
            }
        }
        return new int[] {a, b, c};
    }
}
```







# 有n个人，m个任务,int[] []depends

```java
// 来自hulu
// 有n个人，m个任务，任务之间有依赖记录在int[][] depends里
// 比如: depends[i] = [a, b]，表示a任务依赖b任务的完成
// 其中 0 <= a < m，0 <= b < m
// 1个人1天可以完成1个任务，每个人都会选当前能做任务里，标号最小的任务
// 一个任务所依赖的任务都完成了，该任务才能开始做
// 返回n个人做完m个任务，需要几天
public class Code02_DoAllJobs {
   public static int days(int n, int m, int[][] depends) {
      if (n < 1) {
         return -1;
      }
      if (m <= 0) {
         return 0;
      }
      int[][] nexts = nexts(depends, m);
      int[] indegree = indegree(nexts, m);
      int[] start = new int[m];
       //工人队列
      PriorityQueue<Integer> workers = new PriorityQueue<>();
      for (int i = 0; i < n; i++) {
         workers.add(0);
      }
      PriorityQueue<Integer> zeroIn = new PriorityQueue<>();
      for (int i = 0; i < m; i++) {
         if (indegree[i] == 0) {
            zeroIn.add(i);
         }
      }
      int finishAll = 0;
      int done = 0;
      while (!zeroIn.isEmpty()) {
         int job = zeroIn.poll();
         int wake = workers.poll();
         int finish = Math.max(start[job], wake) + 1;
         finishAll = Math.max(finishAll, finish);
         done++;
         for (int next : nexts[job]) {
            start[next] = Math.max(start[next], finish);
            if (--indegree[next] == 0) {
               zeroIn.add(next);
            }
         }
         workers.add(finish);
      }
      return done == m ? finishAll : -1;
   }

   public static int[][] nexts(int[][] depends, int m) {
      Arrays.sort(depends, (a, b) -> a[1] - b[1]);
      int n = depends.length;
      int[][] nexts = new int[m][0];
      if (n == 0) {
         return nexts;
      }
      int size = 1;
      for (int i = 1; i < n; i++) {
         if (depends[i - 1][1] != depends[i][1]) {
            int from = depends[i - 1][1];
            nexts[from] = new int[size];
            for (int k = 0, j = i - size; k < size; k++, j++) {
               nexts[from][k] = depends[j][0];
            }
            size = 1;
         } else {
            size++;
         }
      }
      int from = depends[n - 1][1];
      nexts[from] = new int[size];
      for (int k = 0, j = n - size; k < size; k++, j++) {
         nexts[from][k] = depends[j][0];
      }
      return nexts;
   }

   public static int[] indegree(int[][] nexts, int m) {
      int[] indegree = new int[m];
      for (int i = 0; i < m; i++) {
         for (int j = 0; j < nexts[i].length; j++) {
            indegree[nexts[i][j]]++;
         }
      }
      return indegree;
   }

   public static void main(String[] args) {
      // 2 -> 5 -> 6
      //           |
      //           v
      // 1 -> 4 -> 7
      //      ^
      //      |
      // 0 -> 3
      int[][] d = {
            { 3, 0 },
            { 4, 1 },
            { 5, 2 },
            { 4, 3 },
            { 6, 5 },
            { 7, 4 },
            { 7, 6 }
         };
      System.out.println(days(3, 8, d));
      System.out.println(days(2, 8, d));
   }
```

# InterviewNeedManager(小根堆 - )

times[] [] 排序 以a[0]-b[0]





# 铺砖

![image-20211229213427565](https://s2.loli.net/2021/12/29/WZeVOdjNnhLMrKl.png)





```java
// 来自hulu
// 你只有1*1、1*2、1*3、1*4，四种规格的砖块
// 你想铺满n行m列的区域，规则如下：
// 1）不管那种规格的砖，都只能横着摆
// 比如1*3这种规格的砖，3长度是水平方向，1长度是竖直方向
// 2）会有很多方法铺满整个区域，整块区域哪怕有一点点不一样，就算不同的方法
// 3）区域内部(不算区域整体的4条边界)，不能有任何砖块的边界线，是从上一直贯穿到下的直线
// 返回符合三条规则下，铺满n行m列的区域，有多少种不同的摆放方法
public class Code04_WaysToBuildWall {

   public static long[] r = { 0, 1, 2, 4, 8 };

   public static long ways(int n, int m) {
      if (n <= 0 || m <= 1) {
         return 1;
      }
      // len[i] = 一共有1行的情况下，列的长度为i的时候有几种摆法(所有，不分合法和非法)
      long[] len = new long[m + 1];
      for (int i = 1; i <= m; i++) {
         len[i] = r[i];
      }
      for (int i = 5; i <= m; i++) {
         len[i] = len[i - 1] + len[i - 2] + len[i - 3] + len[i - 4];
      }
      // any[i] = 一共有n行的情况下，列的长度为i的时候有几种摆法(所有，不分合法和非法)
      long[] any = new long[m + 1];
      for (int i = 1; i <= m; i++) {
         any[i] = power(len[i], n);
      }
      // solid[i] = 一共有n行的情况下，列的长度为i的时候有几种合法的摆法
      long[] solid = new long[m + 1];
      solid[1] = 1;
      for (int i = 2; i <= m; i++) {
         long invalid = 0;
         for (int j = 1; j < i; j++) {
            invalid += solid[j] * any[i - j];
         }
         solid[i] = any[i] - invalid;
      }
      return solid[m];
   }

   public static long power(long base, int power) {
      long ans = 1;
      while (power != 0) {
         if ((power & 1) != 0) {
            ans *= base;
         }
         base *= base;
         power >>= 1;
      }
      return ans;
   }

}
```















