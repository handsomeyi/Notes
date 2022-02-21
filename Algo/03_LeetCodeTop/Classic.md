# 1

## [[窗口]]给定长度K绳子,求最多盖几个点

给定一个==有序==数组arr，代表坐落在X轴上的点

给定一个正数K，代表绳子的长度

返回绳子**最多**压中几个点？

即使绳子边缘处盖住点也算盖住



### 思路1 贪心

![image-20220113065907657](https://s2.loli.net/2022/01/15/KChZMbyAmYTSJpX.png)



然后**二分**找大于绳子头的个数

```java
public static int maxPoint1(int[] arr, int L) {
   int res = 1;
   for (int i = 0; i < arr.length; i++) {
      int nearest = nearestIndex(arr, i, arr[i] - L);
      res = Math.max(res, i - nearest + 1);
   }
   return res;
}

public static int nearestIndex(int[] arr, int R, int value) {
   int L = 0;
   int index = R;
   while (L <= R) {
      int mid = L + ((R - L) >> 1);
      if (arr[mid] >= value) {
         index = mid;
         R = mid - 1;
      } else {
         L = mid + 1;
      }
   }
   return index;
}
```

### 思路2 [[滑动窗口]]

arr[1, 4, 6, 7, 8, 10, 11, 14......]

​      L       R

双指针 维护窗口最大值 O(N)

```java
public static int maxPoint2(int[] arr, int K) {
   int left = 0;
   int right = 0;
   int N = arr.length;
   int max = 0;
   while (left < N) {
      while (right < N && arr[right] - arr[left] <= K) {
         right++;
      }
      max = Math.max(max, right - (left++));
   }
   return max;
}

public static int maxPointTest(int[] arr, int K) {
    int L = 0, R = 0, N = arr.length, max = 0;//双指针 和 窗口维护的最大值
    while (L < N) {
        while (R < N && arr[R] - arr[L] <= K) {
            R++;
        }
        max = Math.max(max, R - L);//下标差就是元素个数
        L+
    }
    return max;
}
```



## [[图的遍历]]目录下的文件数量 BFS|DFS

给定一个文件目录的路径，

写一个函数统计这个目录下所有的文件数量并返回

隐藏文件也算，但是文件夹不算

```java
import java.io.File;
import java.util.Stack;
// 注意这个函数也会统计隐藏文件
public static int getFileNumber(String folderPath) {
   File root = new File(folderPath);
   if (!root.isDirectory() && !root.isFile()) {
      return 0;
   }
   if (root.isFile()) {
      return 1;
   }
   Stack<File> stack = new Stack<>();
   stack.add(root);
   int files = 0;
   while (!stack.isEmpty()) {
      File folder = stack.pop();
      for (File next : folder.listFiles()) {
         if (next.isFile()) {
            files++;
         }
         if (next.isDirectory()) {
            stack.push(next);
         }
      }
   }
   return files;
}
```

## 返回离非负整数num最近的2的某次方

给定一个非负整数num，

如何不用循环语句，

返回>=num，并且离num最近的，2的某次方

![image-20220113071449763](https://s2.loli.net/2022/01/15/qCrtLdANKmFhujP.png)

从最高位开始到后面全1 然后加一得到100000.....

n-1 是为了: 如果正好是2的某次方 就可以得到自己

## [[贪心]]G,B的最少交换次数 (双指针)

一个数组中只有两种字符'G'和’B’，

可以让所有的G都放在左侧，所有的B都放在右侧

或者可以让所有的G都放在右侧，所有的B都放在左侧

但是只能在相邻字符之间进行交换操作，

返回至少需要交换几次



### 思路: 把所有G保持相对次序 放到左边来(用双指针)

L指针维持当前来到的G位置

R指针遍历数组

算好代价1

然后再来一次B在左边 G在右边 算好代价2

求代价最小值



## (腾讯)数组中添加运算符得到值的方法数

给定一个数组arr，你可以在每个数字之前决定+或者-, 但是必须所有数字都参与, 再给定一个数target，请问最后算出target的方法数是多少？

```java
package class01;

import java.util.HashMap;

// leetcode 494题
public class Code07_TargetSum {

   public static int findTargetSumWays1(int[] arr, int s) {
      return process1(arr, 0, s);
   }

   // 可以自由使用arr[index....]所有的数字！
   // 搞出rest这个数，方法数是多少？返回
   // index == 7 rest = 13
   // map "7_13" 256
   public static int process1(int[] arr, int index, int rest) {
      if (index == arr.length) { // 没数了！
         return rest == 0 ? 1 : 0;
      }
      // 还有数！arr[index] arr[index+1 ... ]
      return process1(arr, index + 1, rest - arr[index]) + process1(arr, index + 1, rest + arr[index]);
   }

   public static int findTargetSumWays2(int[] arr, int s) {
      return process2(arr, 0, s, new HashMap<>());
   }

   public static int process2(int[] arr, int index, int rest, HashMap<Integer, HashMap<Integer, Integer>> dp) {
      if (dp.containsKey(index) && dp.get(index).containsKey(rest)) {
         return dp.get(index).get(rest);
      }
      // 否则，没命中！
      int ans = 0;
      if (index == arr.length) {
         ans = rest == 0 ? 1 : 0;
      } else {
         ans = process2(arr, index + 1, rest - arr[index], dp) + process2(arr, index + 1, rest + arr[index], dp);
      }
      if (!dp.containsKey(index)) {
         dp.put(index, new HashMap<>());
      }
      dp.get(index).put(rest, ans);
      return ans;
   }

   public static int findTargetSumWays(int[] arr, int target) {
      int sum = 0;
      for (int n : arr) {
         sum += n;
      }
      return sum < target || ((target & 1) ^ (sum & 1)) != 0 ? 0 : subset2(arr, (target + sum) >> 1);
   }

   // 求非负数组nums有多少个子集，累加和是s
   // 二维动态规划
   // 不用空间压缩
   public static int subset1(int[] nums, int s) {
      if (s < 0) {
         return 0;
      }
      int n = nums.length;
      // dp[i][j] : nums前缀长度为i的所有子集，有多少累加和是j？
      int[][] dp = new int[n + 1][s + 1];
      // nums前缀长度为0的所有子集，有多少累加和是0？一个：空集
      dp[0][0] = 1;
      for (int i = 1; i <= n; i++) {
         for (int j = 0; j <= s; j++) {
            dp[i][j] = dp[i - 1][j];
            if (j - nums[i - 1] >= 0) {
               dp[i][j] += dp[i - 1][j - nums[i - 1]];
            }
         }
      }
      return dp[n][s];
   }

   // 求非负数组nums有多少个子集，累加和是s
   // 二维动态规划
   // 用空间压缩:
   // 核心就是for循环里面的：for (int i = s; i >= n; i--) {
   // 为啥不枚举所有可能的累加和？只枚举 n...s 这些累加和？
   // 因为如果 i - n < 0，dp[i]怎么更新？和上一步的dp[i]一样！所以不用更新
   // 如果 i - n >= 0，dp[i]怎么更新？上一步的dp[i] + 上一步dp[i - n]的值，这才需要更新
   public static int subset2(int[] nums, int s) {
      if (s < 0) {
         return 0;
      }
      int[] dp = new int[s + 1];
      dp[0] = 1;
      for (int n : nums) {
         for (int i = s; i >= n; i--) {
            dp[i] += dp[i - n];
         }
      }
      return dp[s];
   }

}
```

// 优化点一 :
   // 你可以认为arr中都是非负数
   // 因为即便是arr中有负数，比如[3,-4,2]
   // 因为你能在每个数前面用+或者-号
   // 所以[3,-4,2]其实和[3,4,2]达成一样的效果
   // 那么我们就全把arr变成非负数，不会影响结果的
// 优化点二 :
   // 如果arr都是非负数，并且所有数的累加和是sum
   // 那么如果target<sum，很明显没有任何方法可以达到target，可以直接返回0
// 优化点三 :
   // arr内部的数组，不管怎么+和-，最终的结果都一定不会改变奇偶性
   // 所以，如果所有数的累加和是sum，
   // 并且与target的奇偶性不一样，没有任何方法可以达到target，可以直接返回0
// 优化点四 :
   // 比如说给定一个数组, arr = [1, 2, 3, 4, 5] 并且 target = 3
   // 其中一个方案是 : +1 -2 +3 -4 +5 = 3
   // 该方案中取了正的集合为P = {1，3，5}
   // 该方案中取了负的集合为N = {2，4}

   // 所以任何一种方案，都一定有 sum(P) - sum(N) = target

   // 现在我们来处理一下这个等式，把左右两边都加上sum(P) + sum(N)，那么就会变成如下：
   // sum(P) - sum(N) + sum(P) + sum(N) = target + sum(P) + sum(N)
   // 2 * sum(P) = target + 数组所有数的累加和
   // sum(P) = (target + 数组所有数的累加和) / 2
   // 也就是说，任何一个集合，只要累加和是(target + 数组所有数的累加和) / 2
   // 那么就一定对应一种target的方式
   // 也就是说，比如非负数组arr，target = 7, 而所有数累加和是11
   // 求有多少方法组成7，其实就是求有多少种达到累加和(7+11)/2=9的方法
// 优化点五 :
   // 二维动态规划的空间压缩技巧


## (329)最长递增链

给定一个二维数组matrix，可以从任何位置出发，每一步可以走向上、下、左、右，四个方向。返回最大递增链的长度。
例子：
matrix =
5 4 3
3 1 2
2 1 3
从最中心的1出发，是可以走出1 2 3 4 5的链的，而且这是最长的递增链。所以返回长度5

```java
public static int longestIncreasingPath2(int[][] matrix) {
   int ans = 0;
   int N = matrix.length;
   int M = matrix[0].length;
   int[][] dp = new int[N][M];
   for (int i = 0; i < N; i++) {
      for (int j = 0; j < M; j++) {
         ans = Math.max(ans, process2(matrix, i, j, dp));
      }
   }
   return ans;
}

// 从m[i][j]开始走，走出来的最长递增链，返回！
public static int process2(int[][] m, int i, int j, int[][] dp) {
   if (dp[i][j] != 0) {
      return dp[i][j];
   }
   // (i,j)不越界
   int up = i > 0 && m[i][j] < m[i - 1][j] ? process2(m, i - 1, j, dp) : 0;
   int down = i < (m.length - 1) && m[i][j] < m[i + 1][j] ? process2(m, i + 1, j, dp) : 0;
   int left = j > 0 && m[i][j] < m[i][j - 1] ? process2(m, i, j - 1, dp) : 0;
   int right = j < (m[0].length - 1) && m[i][j] < m[i][j + 1] ? process2(m, i, j + 1, dp) : 0;
   int ans = Math.max(Math.max(up, down), Math.max(left, right)) + 1;
   dp[i][j] = ans;
   return ans;
}
```



## [[线段树]] 法师AOE技能次数

给定两个非负数组x和hp，长度都是N，再给定一个正数rangex有序，

x[i]表示i号怪兽在x轴上的位置；hp[i]表示i号怪兽的血量
range表示法师如果站在x位置，用AOE技能打到的范围是：[x-range,x+range]，

被打到的每只怪兽损失**1点血量**
返回要把所有怪兽血量清空，**至少需要释放多少次AOE技能**？

每次剪掉的血量 要遍历吗? 不, 用线段树 -> (相当于把计算合并 不用每次计算到每个元素上)

```java
// 贪心策略：永远让最左边缘以最优的方式(AOE尽可能往右扩，最让最左边缘盖住目前怪的最左)变成0，也就是选择：
// 一定能覆盖到最左边缘, 但是尽量靠右的中心点
// 等到最左边缘变成0之后，再去找下一个最左边缘...
public static int minAoe2(int[] x, int[] hp, int range) {
   int N = x.length;
   int ans = 0;
   for (int i = 0; i < N; i++) {
      if (hp[i] > 0) {
         int triggerPost = i;
         while (triggerPost < N && x[triggerPost] - x[i] <= range) {
            triggerPost++;
         }
         ans += hp[i];
         aoe(x, hp, i, triggerPost - 1, range);
      }
   }
   return ans;
}

public static void aoe(int[] x, int[] hp, int L, int trigger, int range) {
   int N = x.length;
   int RPost = trigger;
   while (RPost < N && x[RPost] - x[trigger] <= range) {
      RPost++;
   }
   int minus = hp[L];
   for (int i = L; i < RPost; i++) {
      hp[i] = Math.max(0, hp[i] - minus);
   }
}

// 贪心策略和方法二一样，但是需要用线段树，可优化成O(N * logN)的方法，
public static int minAoe3(int[] x, int[] hp, int range) {
   int N = x.length;
   // coverLeft[i]：如果以i为中心点放技能，左侧能影响到哪，下标从1开始，不从0开始
   // coverRight[i]：如果以i为中心点放技能，右侧能影响到哪，下标从1开始，不从0开始
   // coverLeft和coverRight数组，0位置弃而不用
   // 举个例子，比如 :
   // x = [1,2,5,7,9,12,15], range = 3
   // 下标: 1 2 3 4 5 6 7
   // 以1位置做中心点: 能覆盖位置:1,2 -> [1..2]
   // 以2位置做中心点: 能覆盖位置:1,2,3 -> [1..3]
   // 以3位置做中心点: 能覆盖位置:2,3,4 -> [2..4]
   // 以4位置做中心点: 能覆盖位置:3,4,5 -> [3..5]
   // 以5位置做中心点: 能覆盖位置:4,5,6 -> [4..6]
   // 以6位置做中心点: 能覆盖位置:5,6,7 -> [5..7]
   // 以7位置做中心点: 能覆盖位置:6,7 -> [6..7]
   // 可以看出如果从左往右，依次求每个位置的左边界(left)和左边界(right)，是可以不回退的！
   int[] coverLeft = new int[N + 1];
   int[] coverRight = new int[N + 1];
   int left = 0;
   int right = 0;
   // 从左往右，不回退的依次求每个位置的左边界(left)和左边界(right)，记录到coverLeft和coverRight里
   for (int i = 0; i < N; i++) {
      while (x[i] - x[left] > range) {
         left++;
      }
      while (right < N && x[right] - x[i] <= range) {
         right++;
      }
      coverLeft[i + 1] = left + 1;
      coverRight[i + 1] = right;
   }
   // best[i]: 如果i是最左边缘点，选哪个点做技能中心点最好，下标从1开始，不从0开始
   // 与上面同理，依然可以不回退
   int[] best = new int[N + 1];
   int trigger = 0;
   for (int i = 0; i < N; i++) {
      while (trigger < N && x[trigger] - x[i] <= range) {
         trigger++;
      }
      best[i + 1] = trigger;
   }
   SegmentTree st = new SegmentTree(hp);
   st.build(1, N, 1);
   int ans = 0;
   // 整体思路：
   // 当前左边缘点从i位置开始(注意0位置已经弃而不用了)，
   // 目标是把左边缘的怪物杀死，但是放技能的位置当然是尽可能远离左边缘点，但是又保证能覆盖住
   // best[i] : 放技能的位置当然是尽可能远离左边缘点i，但是又保证能覆盖住，
   // 请问这个中心在哪？就是best的含义，之前求过了。
   // 然后在这个中心点，放技能，放几次技能呢？左边缘点还剩多少血，就放几次技能，
   // 这样能保证刚好杀死左边缘点。
   // 然后向右继续寻找下一个没有死的左边缘点。
   for (int i = 1; i <= N; i++) {
      // 查询当前i位置，还有没有怪物存活
      long leftEdge = st.query(i, i, 1, N, 1);
      // 如果还有血量(leftEdge > 0)，说明有存活。此时，放技能
      // 如果没有血了(leftEdge <= 0)，说明当前边缘点不需要考虑了，换下一个i
      if (leftEdge > 0) {
         // t = best[i]: 在哪放技能最值
         // l = coverLeft[t]: 如果在t放技能的话，左边界影响到哪
         // r = coverRight[t]: 如果在t放技能的话，右边界影响到哪
         // 就在t放技能，放leftEdge次，这样左边缘点恰好被杀死
         ans += leftEdge;
         int t = best[i];
         int l = coverLeft[t];
         int r = coverRight[t];
         // 同时[l...r]整个范围，所有的怪物都会扣除掉leftEdge的血量，因为AOE嘛！
         st.add(l, r, (int) (-leftEdge), 1, N, 1);
      }
   }
   return ans;
}

public static class SegmentTree {
   // arr[]为原序列的信息从0开始，但在arr里是从1开始的
   // sum[]模拟线段树维护区间和
   // lazy[]为累加懒惰标记
   // change[]为更新的值
   // update[]为更新慵懒标记
   private int MAXN;
   private int[] arr;
   private int[] sum;
   private int[] lazy;
   private int[] change;
   private boolean[] update;

   public SegmentTree(int[] origin) {
      MAXN = origin.length + 1;
      arr = new int[MAXN]; // arr[0] 不用 从1开始使用
      for (int i = 1; i < MAXN; i++) {
         arr[i] = origin[i - 1];
      }
      sum = new int[MAXN << 2]; // 用来支持脑补概念中，某一个范围的累加和信息

      lazy = new int[MAXN << 2]; // 用来支持脑补概念中，某一个范围沒有往下傳遞的纍加任務
      change = new int[MAXN << 2]; // 用来支持脑补概念中，某一个范围有没有更新操作的任务
      update = new boolean[MAXN << 2]; // 用来支持脑补概念中，某一个范围更新任务，更新成了什么
   }

   private void pushUp(int rt) {
      sum[rt] = sum[rt << 1] + sum[rt << 1 | 1];
   }

   // 之前的，所有懒增加，和懒更新，从父范围，发给左右两个子范围
   // 分发策略是什么
   // ln表示左子树元素结点个数，rn表示右子树结点个数
   private void pushDown(int rt, int ln, int rn) {
      if (update[rt]) {
         update[rt << 1] = true;
         update[rt << 1 | 1] = true;
         change[rt << 1] = change[rt];
         change[rt << 1 | 1] = change[rt];
         lazy[rt << 1] = 0;
         lazy[rt << 1 | 1] = 0;
         sum[rt << 1] = change[rt] * ln;
         sum[rt << 1 | 1] = change[rt] * rn;
         update[rt] = false;
      }
      if (lazy[rt] != 0) {
         lazy[rt << 1] += lazy[rt];
         sum[rt << 1] += lazy[rt] * ln;
         lazy[rt << 1 | 1] += lazy[rt];
         sum[rt << 1 | 1] += lazy[rt] * rn;
         lazy[rt] = 0;
      }
   }

   // 在初始化阶段，先把sum数组，填好
   // 在arr[l~r]范围上，去build，1~N，
   // rt : 这个范围在sum中的下标
   public void build(int l, int r, int rt) {
      if (l == r) {
         sum[rt] = arr[l];
         return;
      }
      int mid = (l + r) >> 1;
      build(l, mid, rt << 1);
      build(mid + 1, r, rt << 1 | 1);
      pushUp(rt);
   }

   public void update(int L, int R, int C, int l, int r, int rt) {
      if (L <= l && r <= R) {
         update[rt] = true;
         change[rt] = C;
         sum[rt] = C * (r - l + 1);
         lazy[rt] = 0;
         return;
      }
      // 当前任务躲不掉，无法懒更新，要往下发
      int mid = (l + r) >> 1;
      pushDown(rt, mid - l + 1, r - mid);
      if (L <= mid) {
         update(L, R, C, l, mid, rt << 1);
      }
      if (R > mid) {
         update(L, R, C, mid + 1, r, rt << 1 | 1);
      }
      pushUp(rt);
   }

   // L..R -> 任务范围 ,所有的值累加上C
   // l,r -> 表达的范围
   // rt 去哪找l，r范围上的信息
   public void add(int L, int R, int C, int l, int r, int rt) {
      // 任务的范围彻底覆盖了，当前表达的范围
      if (L <= l && r <= R) {
         sum[rt] += C * (r - l + 1);
         lazy[rt] += C;
         return;
      }
      // 任务并没有把l...r全包住
      // 要把当前任务往下发
      // 任务 L, R 没有把本身表达范围 l,r 彻底包住
      int mid = (l + r) >> 1; // l..mid (rt << 1) mid+1...r(rt << 1 | 1)
      // 下发之前所有攒的懒任务
      pushDown(rt, mid - l + 1, r - mid);
      // 左孩子是否需要接到任务
      if (L <= mid) {
         add(L, R, C, l, mid, rt << 1);
      }
      // 右孩子是否需要接到任务
      if (R > mid) {
         add(L, R, C, mid + 1, r, rt << 1 | 1);
      }
      // 左右孩子做完任务后，我更新我的sum信息
      pushUp(rt);
   }

   // 1~6 累加和是多少？ 1~8 rt
   public long query(int L, int R, int l, int r, int rt) {
      if (L <= l && r <= R) {
         return sum[rt];
      }
      int mid = (l + r) >> 1;
      pushDown(rt, mid - l + 1, r - mid);
      long ans = 0;
      if (L <= mid) {
         ans += query(L, R, l, mid, rt << 1);
      }
      if (R > mid) {
         ans += query(L, R, mid + 1, r, rt << 1 | 1);
      }
      return ans;
   }

}
```



# 2

## [[有序表]]能获得的最好收入(Comparator运用)

给定数组**hard**和**money**，长度**都为N**, 

hard[i]表示i号的难度， money[i]表示i号工作的收入



给定数组**ability**，长度都为**M**，ability[j]表示j号人的能力, 

每一号工作，都可以提供无数的岗位，难度和收入都一样
但是人的能力必须**>=**这份工作的难度，才能上班. 

返回一个长度为**M**的数组ans，ans[j]表示j号人能获得的最好收入





思路: 

先排序 然后基于保证**难度上升,收入上升** 来删除多余的工作

然后每个小人根据能力二分查找

```java
public static class Job {
   public int money;
   public int hard;

   public Job(int m, int h) {
      money = m;
      hard = h;
   }
}

public static class JobComparator implements Comparator<Job> {
   @Override
   public int compare(Job o1, Job o2) {
      return o1.hard != o2.hard ? (o1.hard - o2.hard) : (o2.money - o1.money);
   }
}

public static int[] getMoneys(Job[] job, int[] ability) {
   Arrays.sort(job, new JobComparator());
   // key : 难度   value：报酬
   TreeMap<Integer, Integer> map = new TreeMap<>();
   map.put(job[0].hard, job[0].money);
   // pre : 上一份进入map的工作
   Job pre = job[0];
   for (int i = 1; i < job.length; i++) {
      if (job[i].hard != pre.hard && job[i].money > pre.money) {//根据排序结果 删除多余的工作
         pre = job[i];
         map.put(pre.hard, pre.money);
      }
   }

   int[] ans = new int[ability.length];
   for (int i = 0; i < ability.length; i++) {
      // ability[i] 当前人的能力 <= ability[i]  且离它最近的
      Integer key = map.floorKey(ability[i]);//直接用接口二分了
      ans[i] = key != null ? map.get(key) : 0;
   }
   return ans;
}
```



## 无序数组需要排序的最短子数组长度

给定一个数组arr，只能对arr中的一个子数组排序，

但是想让arr整体都有序

返回满足这一设定的子数组中，最短的是多长



思路: 

int leftMax = 0;

int index = 1;

从左往右遍历**arr[leftMax] > arr[index++]** => 画叉 否则画勾 记录最右的叉下标

{1,2,6,5,4,3,8,9,10}

 0 1 2 3 4 5 6 7  8

记录下标5 

**因为8 不必给前面的最大值让位置, 所以就记录该位置.**



从右往左遍历**arr[rightMin] < arr[index--]** =>  画叉 否则画勾 记录最左的叉下标

同理

```java
public static int findUnsortedSubarray(int[] nums) {
   if (nums.length == 1) {
      return 0;
   }
   int N = nums.length, right = -1, max = Integer.MIN_VALUE, min = Integer.MAX_VALUE, left = N;
   for (int i = 0; i < N; i++) {
      if (max > nums[i]) {
         right = i;
      }
      max = Math.max(max, nums[i]);
      if (min < nums[N - 1 - i]) {
         left = N - 1 - i;
      }
      min = Math.min(min, nums[N - 1 - i]);
   }
   return Math.max(0, right - left + 1);
}
```





## [[数据结构设计]]HashMap设计setAll O(1)

思路: **类似ZooKeeper的id的感觉** 设置一个time号, 最新值通过time来确定

```java
public static class MyValue<V> {
   public V value;
   public long time;
   public MyValue(V v, long t) {
      value = v;
      time = t;
   }
}
public static class MyHashMap<K, V> {
   private HashMap<K, MyValue<V>> map;
   private long time;
   private MyValue<V> setAll;
   public MyHashMap() {
      map = new HashMap<>();
      time = 0;
      setAll = new MyValue<V>(null, -1);
   }
   public void put(K key, V value) {
      map.put(key, new MyValue<V>(value, time++));
   }
   public void setAll(V value) {
      setAll = new MyValue<V>(value, time++);
   }
   public V get(K key) {
      if (!map.containsKey(key)) {
         return null;
      }
      if (map.get(key).time > setAll.time) {
         return map.get(key).value;
      } else {
         return setAll.value;
      }
   }
}
```







## [[数据结构设计]]接收消息并打印

已知一个消息流会不断地吐出整数 1~N，但不一定按照顺序吐出。如果上次打印的数为 i， 那么当 i+1 出现时，请打印 i+1 及其之后接收过的并且连续的所有数，直到 1~N 全部接收 并打印完，请设计这种接收并打印的结构。



思路: **==蜘蛛纸牌==**

如果用动态数组 会导致内存泄漏 所以不行 

![image-20220114233824030](https://s2.loli.net/2022/01/15/mZDP1ehHjbv3nW7.png)



![image-20220114234803330](https://s2.loli.net/2022/01/15/V5l6XG1NTZEMJgq.png)

```java
public static class Node {
   public String info;
   public Node next;
   public Node(String str) {
      info = str;
   }
}
public static class MessageBox {
   private HashMap<Integer, Node> headMap;
   private HashMap<Integer, Node> tailMap;
   private int waitPoint;//每次打印后更新 值为最后打印的 +1
   public MessageBox() {
      headMap = new HashMap<Integer, Node>();
      tailMap = new HashMap<Integer, Node>();
      waitPoint = 1;
   }
   // 消息的编号，info消息的内容, 消息一定从1开始
   public void receive(int num, String info) {
      if (num < 1) {
         return;
      }
      Node cur = new Node(info);
      // num~num
      headMap.put(num, cur);
      tailMap.put(num, cur);
      // 建立了num~num这个连续区间的头和尾
      // 查询有没有某个连续区间以num-1结尾
      if (tailMap.containsKey(num - 1)) {//如果可以连上
         tailMap.get(num - 1).next = cur;
         tailMap.remove(num - 1);/
         headMap.remove(num);
      }
      // 查询有没有某个连续区间以num+1开头的
      if (headMap.containsKey(num + 1)) {
         cur.next = headMap.get(num + 1);
         tailMap.remove(num);
         headMap.remove(num + 1);
      }
      if (num == waitPoint) {
         print();
      }
   }
   private void print() {
      Node node = headMap.get(waitPoint);
      headMap.remove(waitPoint);
      while (node != null) {
         System.out.print(node.info + " ");
         node = node.next;
         waitPoint++;
      }
      tailMap.remove(waitPoint-1);
      System.out.println();
   }
}
public static void main(String[] args) {
   // MessageBox only receive 1~N
   MessageBox box = new MessageBox();
   // 1....
   System.out.println("这是2来到的时候");
   box.receive(2,"B"); // - 2"
   System.out.println("这是1来到的时候");
   box.receive(1,"A"); // 1 2 -> print, trigger is 1
   box.receive(4,"D"); // - 4
   box.receive(5,"E"); // - 4 5
   box.receive(7,"G"); // - 4 5 - 7
   box.receive(8,"H"); // - 4 5 - 7 8
   box.receive(6,"F"); // - 4 5 6 7 8
   box.receive(3,"C"); // 3 4 5 6 7 8 -> print, trigger is 3
   box.receive(9,"I"); // 9 -> print, trigger is 9
   box.receive(10,"J"); // 10 -> print, trigger is 10
   box.receive(12,"L"); // - 12
   box.receive(13,"M"); // - 12 13
   box.receive(11,"K"); // 11 12 13 -> print, trigger is 11
}
```



## [[携程]]买可乐(Coding能不能模拟行为加速)

贩卖机只支持硬币支付，且收退都只支持**10 ，50，100**三种面额
**一次购买==只能出一瓶可乐==**，且**投钱和找零**都遵循**优先使用大钱**的原则
需要购买的可乐数量是**m**，
其中手头拥有的**10、50、100**的数量分别为**a、b、c**
可乐的价格是x (**x是10的倍数**)
请计算出需要投入**硬币次数**？



数据量: m = 10^18

说明题解和m没关系 



思路: 

1000$	500$	200$	100$	50$

先用大钱 然后用小钱 注意: **==有可能到了500$ 但是1000$还剩1张的情况==**



**每一种面值 的第一瓶可乐**都要参考preQianRest&preQianZhang

// 之前面值的钱还剩下多少总钱数
int **==preQianRest==** = 0;
// 之前面值的钱还剩下多少总张数
int **==preQianZhang==** = 0;



**==向上取整==**得到钱张数

a/x(向上取整) = (a + (x - 1))/x   ----   加一个凑不成x的数 再除



## [[动态规划]] 司机分配 (贪心)

现有司机N * 2人，调度中心会将所有司机平分给A、B两个区域
第 i 个司机去A可得收入为income[i] [0]，
第 i 个司机去B可得收入为income[i] [1]，
返回所有调度方案中能使所有司机总收入最高的方案，是多少钱



```java
// 课上的现场版本
// income -> N * 2 的矩阵 N是偶数！
// 0 [9, 13]
// 1 [45,60]
public static int maxMoney1(int[][] income) {
   if (income == null || income.length < 2 || (income.length & 1) != 0) {
      return 0;
   }
   int N = income.length; // 司机数量一定是偶数，所以才能平分，A N /2 B N/2
   int M = N >> 1; // M = N / 2 要去A区域的人
   return process1(income, 0, M);
}

// index.....所有的司机，往A和B区域分配！
// A区域还有rest个名额!
// 返回把index...司机，分配完，并且最终A和B区域同样多的情况下，index...这些司机，整体收入最大是多少！
public static int process1(int[][] income, int index, int rest) {
   if (index == income.length) {
      return 0;
   }
   // 还剩下司机！
   if (income.length - index == rest) {
      return income[index][0] + process1(income, index + 1, rest - 1);
   }
   if (rest == 0) {
      return income[index][1] + process1(income, index + 1, rest);
   }
   // 当前司机，可以去A，或者去B
   int p1 = income[index][0] + process1(income, index + 1, rest - 1);
   int p2 = income[index][1] + process1(income, index + 1, rest);
   return Math.max(p1, p2);
}

// 严格位置依赖的动态规划版本
public static int maxMoney2(int[][] income) {
   int N = income.length;
   int M = N >> 1;
   int[][] dp = new int[N + 1][M + 1];
   for (int i = N - 1; i >= 0; i--) {
      for (int j = 0; j <= M; j++) {
         if (N - i == j) {
            dp[i][j] = income[i][0] + dp[i + 1][j - 1];
         } else if (j == 0) {
            dp[i][j] = income[i][1] + dp[i + 1][j];
         } else {
            int p1 = income[i][0] + dp[i + 1][j - 1];
            int p2 = income[i][1] + dp[i + 1][j];
            dp[i][j] = Math.max(p1, p2);
         }
      }
   }
   return dp[0][M];
}

// 这题有贪心策略 :
// 假设一共有10个司机，思路是先让所有司机去A，得到一个总收益
// 然后看看哪5个司机改换门庭(去B)，可以获得最大的额外收益
// 这道题有贪心策略，打了我的脸
// 但是我课上提到的技巧请大家重视
// 根据数据量猜解法可以省去大量的多余分析，节省时间
// 这里感谢卢圣文同学
public static int maxMoney3(int[][] income) {
   int N = income.length;
   int[] arr = new int[N];
   int sum = 0;
   for (int i = 0; i < N; i++) {
      arr[i] = income[i][1] - income[i][0];
      sum += income[i][0];
   }
   Arrays.sort(arr);
   int M = N >> 1;
   for (int i = N - 1; i >= M; i--) {
      sum += arr[i];
   }
   return sum;
}
```



# 3



## (coding 套路)返回二叉树中与target距离k的节点

思路 主要要想到做出记录parents的表

```java
public static class Node {
   public int value;
   public Node left;
   public Node right;

   public Node(int v) {
      value = v;
   }
}

public static List<Node> distanceKNodes(Node root, Node target, int K) {
   HashMap<Node, Node> parents = new HashMap<>();
   parents.put(root, null);
   createParentMap(root, parents);
   Queue<Node> queue = new LinkedList<>();
   HashSet<Node> visited = new HashSet<>();
   queue.offer(target);
   visited.add(target);
   int curLevel = 0;
   List<Node> ans = new ArrayList<>();
   while (!queue.isEmpty()) {
      int size = queue.size();
      while (size-- > 0) {
         Node cur = queue.poll();
         if (curLevel == K) {
            ans.add(cur);
         }
         if (cur.left != null && !visited.contains(cur.left)) {
            visited.add(cur.left);
            queue.offer(cur.left);
         }
         if (cur.right != null && !visited.contains(cur.right)) {
            visited.add(cur.right);
            queue.offer(cur.right);
         }
         if (parents.get(cur) != null && !visited.contains(parents.get(cur))) {
            visited.add(parents.get(cur));
            queue.offer(parents.get(cur));
         }
      }
      curLevel++;
      if (curLevel > K) {
         break;
      }
   }
   return ans;
}

public static void createParentMap(Node cur, HashMap<Node, Node> parents) {
   if (cur == null) {
      return;
   }
   if (cur.left != null) {
      parents.put(cur.left, cur);
      createParentMap(cur.left, parents);
   }
   if (cur.right != null) {
      parents.put(cur.right, cur);
      createParentMap(cur.right, parents);
   }
}
```



## [[滑动窗口]]最多同时多少场比赛

给定一个数组ar,代表每个人的能力值。再给定一个非负数k
如果两个人能力差值正好为k, 那么可以凑在一起比赛
一局比赛只有两个人
返回最多可以同时有多少场比赛



思路: **先排序 然后L , R 窗口向右移动**

注意: 要记录R是否用过 给L判断 boolean[] usedR.

L 不可能 > R

```java
// 暴力解
public static int maxPairNum1(int[] arr, int k) {
   if (k < 0) {
      return -1;
   }
   return process1(arr, 0, k);
}

public static int process1(int[] arr, int index, int k) {
   int ans = 0;
   if (index == arr.length) {
      for (int i = 1; i < arr.length; i += 2) {
         if (arr[i] - arr[i - 1] == k) {
            ans++;
         }
      }
   } else {
      for (int r = index; r < arr.length; r++) {
         swap(arr, index, r);
         ans = Math.max(ans, process1(arr, index + 1, k));
         swap(arr, index, r);
      }
   }
   return ans;
}

public static void swap(int[] arr, int i, int j) {
   int tmp = arr[i];
   arr[i] = arr[j];
   arr[j] = tmp;
}

// 时间复杂度O(N*logN)
public static int maxPairNum2(int[] arr, int k) {
   if (k < 0 || arr == null || arr.length < 2) {
      return 0;
   }
   Arrays.sort(arr);
   int ans = 0;
   int N = arr.length;
   int L = 0;
   int R = 0;
   boolean[] usedR = new boolean[N];
   while (L < N && R < N) {
      if (usedR[L]) {
         L++;
      } else if (L >= R) {
         R++;
      } else { // 不止一个数，而且都没用过！
         int distance = arr[R] - arr[L];
         if (distance == k) {
            ans++;
            usedR[R++] = true;
            L++;
         } else if (distance < k) {
            R++;
         } else {
            L++;
         }
      }
   }
   return ans;
}
```

## 最长无重复字符子串长度

思路: 

这就是所谓的你看到任何一个关于什么子串问题，还是子数组问题
先这么想，这个答案你甭管它问的是啥，这道题是最长无重复子串，是最长无重复这个事儿,下回一个别的问题叫S问题，只要是子串子数组的问题，你就想O结尾的时候这个s答案是啥?1结尾的时候这个s答案是啥，就这么想，这是我们的一个重要思维传统



![image-20220115115920865](https://s2.loli.net/2022/01/15/6x39EBuCdYS2XT7.png)





可以用int[] map = new int[256];记录每个字母上次出现的位置



这两个条件谁离我近 用谁

```java
public static int lengthOfLongestSubstring(String s) {
   if (s == null || s.equals("")) {
      return 0;
   }
   char[] str = s.toCharArray();
   int[] map = new int[256];
   for (int i = 0; i < 256; i++) {
      map[i] = -1;
   }
   map[str[0]] = 0;
   int N = str.length;
   int ans = 1;
   int pre = 1;
   for (int i = 1; i < N; i++) {
      pre = Math.min(i - map[str[i]], pre + 1);
      ans = Math.max(ans, pre);
      map[str[i]] = i;
   }
   return ans;
}
```



## [[位运算]]基于"同类" 去重字符串

只由小写字母（a~z）组成的一批字符串

都放在字符类型的数组String[] arr中

如果其中某两个字符串所含有的字符种类完全一样

就将两个字符串算作一类

比如：baacbba和bac就算作一类

返回arr中有多少类？



**思路: 用32位int 每位代表一个字母是否存在**

**然后每个数 存入HashSet**

**dp 结合 枚举套路**



### ==[[设计查询结构]]最大正方形面积==

给你一个由若干 0 和 1 组成的二维网格 grid，

请你找出边界全部由 1 组成的最大 **正方形** 子网格，并返回该子网格中的元素数量。

如果不存在，则返回 0。

 

==枚举**N * M矩阵中** 的长方形 = **O(N^2 * M^2)**

枚举**N * N矩阵中** 的正方形 = **O(N^3)**

```java
public static int test(int[][] m) {
    int N = m.length;
    int M = m[0].length;
    for (int i = 0; i < N; i++) {
        for (int j = 0; j < M; j++) {
            for (int border = 1;border <= Math.min(N - i, M - j);border++) {
                
            }
        }
    }
}
```



思路:

![image-20220115201515823](https://s2.loli.net/2022/01/15/IXMbPzjiUQoSvDC.png) 

**==遍历原数组 得到右连续1dp表 和 下连续1dp表==**

```java
public static int largest1BorderedSquare(int[][] m) {
   int[][] right = new int[m.length][m[0].length];
   int[][] down = new int[m.length][m[0].length];
   setBorderMap(m, right, down);
   for (int size = Math.min(m.length, m[0].length); size != 0; size--) {
      if (hasSizeOfBorder(size, right, down)) {
         return size * size;
      }
   }
   return 0;
}

public static void setBorderMap(int[][] m, int[][] right, int[][] down) {
   int r = m.length;
   int c = m[0].length;
   if (m[r - 1][c - 1] == 1) {
      right[r - 1][c - 1] = 1;
      down[r - 1][c - 1] = 1;
   }
   for (int i = r - 2; i != -1; i--) {
      if (m[i][c - 1] == 1) {
         right[i][c - 1] = 1;
         down[i][c - 1] = down[i + 1][c - 1] + 1;
      }
   }
   for (int i = c - 2; i != -1; i--) {
      if (m[r - 1][i] == 1) {
         right[r - 1][i] = right[r - 1][i + 1] + 1;
         down[r - 1][i] = 1;
      }
   }
   for (int i = r - 2; i != -1; i--) {
      for (int j = c - 2; j != -1; j--) {
         if (m[i][j] == 1) {
            right[i][j] = right[i][j + 1] + 1;
            down[i][j] = down[i + 1][j] + 1;
         }
      }
   }
}

public static boolean hasSizeOfBorder(int size, int[][] right, int[][] down) {
   for (int i = 0; i != right.length - size + 1; i++) {
      for (int j = 0; j != right[0].length - size + 1; j++) {
         if (right[i][j] >= size && down[i][j] >= size && right[i + size - 1][j] >= size
               && down[i][j + size - 1] >= size) {
            return true;
         }
      }
   }
   return false;
}
```

![image-20220115201809650](https://s2.loli.net/2022/01/15/mlSBZMuDWr627HG.png)



当写完3个for循环之后,底层一个正方形再验的时候不想再遍历了，**==势必会设计─种查询的结构来支持==**它,不让它遍历来保证O(1)
==**这就是思想的开端**==
预处理数组怎么用?
就是当你最后卡在最后一步，一个小的元件需要遍历搞定，这样的时候特别的多，
你就想着我怎么样做出一个能够提前查询的结构，到这一步的时候把遍历省掉,比如前缀数组



## ==[[MinBoat问题]]==

给定一个正数数组**arr**,代表若干人的体重
再给定一个正数**limit**,表示所有船共同拥有的载重量
每艘船最多坐两人，且不能超过载重
想让所有的人同时过河，并且用最好的分配方法让船尽量少
返回最少的船数

![image-20220115202655085](https://s2.loli.net/2022/01/15/KR6M47OApTuyY5x.png)

思路: 

先排序 

找到<=limit/2的最右位置 设置好L, R指针

![image-20220115203526931](https://s2.loli.net/2022/01/15/Dc62to5ZQ7A4diq.png)

```java
public static int minBoat(int[] arr, int limit) {
   if (arr == null || arr.length == 0) {
      return 0;
   }
   int N = arr.length;
   Arrays.sort(arr);
   if (arr[N - 1] > limit) {
      return -1;
   }
   int lessR = -1;
   for (int i = N - 1; i >= 0; i--) {
      if (arr[i] <= (limit / 2)) {
         lessR = i;
         break;
      }
   }
   if (lessR == -1) {
      return N;
   }
   int L = lessR;
   int R = lessR + 1;
   int noUsed = 0;
   while (L >= 0) {
      int solved = 0;
      while (R < N && arr[L] + arr[R] <= limit) {
         R++;
         solved++;
      }
      if (solved == 0) {
         noUsed++;
         L--;
      } else {
         L = Math.max(-1, L - solved);
      }
   }
   int all = lessR + 1;
   int used = all - noUsed;
   int moreUnsolved = (N - all) - used;
   return used + ((noUsed + 1) >> 1) + moreUnsolved;
}
```



## ==数组长度小 => [[分治]]==最接近目标值的子序列和

给你一个整数数组 **nums** 和一个目标值 **goal** 。

你需要从 nums 中选出一个子序列，使子序列元素总和**最接近 goal** 。

也就是说，如果**子序列元素和为 sum** ，你需要 最小化绝对差 **abs(sum - goal)** 。

返回 **abs(sum - goal)** 可能的 最小值 。

注意，数组的子序列是通过移除原始数组中的某些元素（可能全部或无）而形成的数组。
链接：https://leetcode-cn.com/problems/closest-subsequence-sum

思路: 

```java
// 本题数据量描述:
// 1 <= nums.length <= 40
// -10^7 <= nums[i] <= 10^7
// -10^9 <= goal <= 10^9
// 通过这个数据量描述可知，需要用到分治，因为数组长度不大
// 而值很大，用动态规划的话，表会爆
```

**数组一分为二,** 

**然后左边右边分别暴力找可能性**

**然后看单独接近还是两者和更接近**

## [[动态规划]]自由之路

电子游戏“辐射4”中，任务“通向自由”要求玩家到达名为“Freedom Trail Ring”的金属表盘，并使用表盘拼写特定关键词才能开门。

给定一个字符串 **ring**，表示刻在外环上的编码；

给定另一个字符串 **key**，表示需要拼写的关键词。

您需要算出能够拼写关键词中所有字符的**最少步数。**



最初，ring 的第一个字符与12:00方向对齐。

您需要顺时针或逆时针**旋转 ring** 以使 key 的一个字符在 12:00 方向**对齐**，**然后按下中心按钮**，以此逐个拼写完 key 中的所有字符。

旋转 ring 拼出 key 字符 key[i] 的阶段中：

您可以将 ring 顺时针或逆时针**旋转一个位置，计为1步**。

旋转的最终目的是将字符串 ring 的一个字符与 12:00 方向对齐，并且这个字符必须等于字符 key[i] 。



如果字符 key[i] 已经对齐到12:00方向，您需要按下中心按钮进行拼写，**这也将算作 1 步**。

按完之后，您可以开始拼写 key 的下一个字符（下一阶段）, 直至完成所有拼写。



示例：GODDING

 ![img](https://s2.loli.net/2022/01/15/XVwclRd5rF9ge3o.jpg)

提示：

ring 和 key 的字符串长度取值范围均为 1 至 100；
两个字符串中都只有小写字符，并且均可能存在重复字符；
字符串 key 一定可以由字符串 ring 旋转拼出。

```Java
//主调函数
public static int findRotateSteps(String r, String k) {
   char[] ring = r.toCharArray();
   int N = ring.length;
   HashMap<Character, ArrayList<Integer>> map = new HashMap<>();
   for (int i = 0; i < N; i++) {
      if (!map.containsKey(ring[i])) {
         map.put(ring[i], new ArrayList<>());
      }
      map.get(ring[i]).add(i);
   }
   char[] str = k.toCharArray();
   int M = str.length;
   int[][] dp = new int[N][M + 1];
   // hashmap
   // dp[][] == -1 : 表示没算过！
   for (int i = 0; i < N; i++) {
      for (int j = 0; j <= M; j++) {
         dp[i][j] = -1;
      }
   }
   return process(0, 0, str, map, N, dp);
}

// 电话里：指针指着的上一个按键preButton
// 目标里：此时要搞定哪个字符？keyIndex
// map : key 一种字符 value: 哪些位置拥有这个字符
// N: 电话大小
// f(0, 0, aim, map, N)
public static int process
(int preButton, //指针的上一个按键位置
 int index, //当前要搞定的位置
 char[] str, //电话机元素个数
 HashMap<Character, ArrayList<Integer>> map, //map 字符所在的下标
 int N,
 int[][] dp
) {
   if (dp[preButton][index] != -1) {//看有没有算过
      return dp[preButton][index];
   }
   int ans = Integer.MAX_VALUE;
   if (index == str.length) {
      ans = 0;
   } else {
      // 还有字符需要搞定呢！
      char cur = str[index];
      ArrayList<Integer> nextPositions = map.get(cur);
      for (int next : nextPositions) {
         int cost = dial(preButton, next, N) + 1 + process(next, index + 1, str, map, N, dp);
         ans = Math.min(ans, cost);
      }
   }
   dp[preButton][index] = ans;
   return ans;
}

//minDistance of ring[i] to ring[j]
public static int dial(int i1, int i2, int size) {
   return Math.min(Math.abs(i1 - i2), Math.min(i1, i2) + size - Math.max(i1, i2));//简单的坐标变幻
}
```

# 4
## (字节)频繁的数组查询

数组为**{3,2,2,3,1}**,查询为**(1,3,2)**
意思是在数组里下标0-3这个范围上，有几个2?答案返回2
假设给你一个数组arr, 对这个数组的查询非常频繁，都给出来
请返回所有查询的结果



思路:

==**频繁 => 预处理结构?**==

有两种思路

- 生成一张表 **HashMap**<Integer, ArrayList < Integer >>

  记录每个数 在数组中出现的下标

  然后在区间内分别对 1,3 

  **二分**找到 

  大于等于1最左侧的位置

  小于等于3最右侧的位置

  然后得出个数

  

- 根据每个数 得到其前缀个数 

  然后对前缀个数后减前 可实现O(1)的查询 

  **如果数组长度非常小 并且值的返回不大** 可以用这个方法


```java
public static class QueryBox1 {
   private int[] arr;

   public QueryBox1(int[] array) {
      arr = new int[array.length];
      for (int i = 0; i < arr.length; i++) {
         arr[i] = array[i];
      }
   }

   public int query(int L, int R, int v) {
      int ans = 0;
      for (; L <= R; L++) {
         if (arr[L] == v) {
            ans++;
         }
      }
      return ans;
   }
}

public static class QueryBox2 {
   private HashMap<Integer, ArrayList<Integer>> map;

   public QueryBox2(int[] arr) {
      map = new HashMap<>();
      for (int i = 0; i < arr.length; i++) {
         if (!map.containsKey(arr[i])) {
            map.put(arr[i], new ArrayList<>());
         }
         map.get(arr[i]).add(i);
      }
   }

   public int query(int L, int R, int value) {
      if (!map.containsKey(value)) {
         return 0;
      }
      ArrayList<Integer> indexArr = map.get(value);
      // 查询 < L 的下标有几个
      int a = countLess(indexArr, L);
      // 查询 < R+1 的下标有几个
      int b = countLess(indexArr, R + 1);
      return b - a;
   }

   // 在有序数组arr中，用二分的方法数出<limit的数有几个
   // 也就是用二分法，找到<limit的数中最右的位置
   private int countLess(ArrayList<Integer> arr, int limit) {
      int L = 0;
      int R = arr.size() - 1;
      int mostRight = -1;
      while (L <= R) {
         int mid = L + ((R - L) >> 1);
         if (arr.get(mid) < limit) {
            mostRight = mid;
            L = mid + 1;
         } else {
            R = mid - 1;
         }
      }
      return mostRight + 1;
   }
}

public static int[] generateRandomArray(int len, int value) {
   int[] ans = new int[(int) (Math.random() * len) + 1];
   for (int i = 0; i < ans.length; i++) {
      ans[i] = (int) (Math.random() * value) + 1;
   }
   return ans;
}
```





## 子数组最大累加和

返回一个数组中，最大子数组累加和

```java
class Solution {
    public int maxSubArray(int[] nums) {
        int dp = nums[0], max = nums[0];
        for (int i = 1; i < nums.length; i++) {
            dp = Math.max(nums[i], dp + nums[i]);//因为是连续子数组 不是求子序列
            max = Math.max(max, dp);
        }
        return max;
    }
}
```



## [[数组压缩]]17.24 子矩阵最大累加和(H)

给定一个正整数、负整数和 0 组成的 N × M 矩阵，编写代码找出元素总和最大的子矩阵。

**返回一个数组 [r1, c1, r2, c2]，**

其中 r1, c1 分别代表子矩阵左上角的行号和列号，r2, c2 分别代表右下角的行号和列号。

若有多个满足条件的子矩阵，返回任意一个均可。
链接：https://leetcode-cn.com/problems/max-submatrix-lcci

```java
public static int maxSum(int[][] m) {
   if (m == null || m.length == 0 || m[0].length == 0) {
      return 0;
   }
   // O(N^2 * M)
   int N = m.length;
   int M = m[0].length;
   int max = Integer.MIN_VALUE;
   for (int i = 0; i < N; i++) {
      // i~j
      int[] s = new int[M];
      for (int j = i; j < N; j++) {
         for (int k = 0; k < M; k++) {
            s[k] += m[j][k];
         }
         max = Math.max(max, maxSubArray(s));
      }
   }
   return max;
}

public static int maxSubArray(int[] arr) {
   if (arr == null || arr.length == 0) {
      return 0;
   }
   int max = Integer.MIN_VALUE;
   int cur = 0;
   for (int i = 0; i < arr.length; i++) {
      cur += arr[i];
      max = Math.max(max, cur);
      cur = cur < 0 ? 0 : cur;
   }
   return max;
}

	// 本题测试链接 : https://leetcode-cn.com/problems/max-submatrix-lcci/
	public static int[] getMaxMatrix(int[][] m) {
		int N = m.length;
		int M = m[0].length;
		int max = Integer.MIN_VALUE;
		int cur = 0;
		int a = 0;//左上角 行
		int b = 0;//左上角 列
		int c = 0;//右下角 行
		int d = 0;//右下角 列
		for (int i = 0; i < N; i++) {
			int[] s = new int[M];
			for (int j = i; j < N; j++) {
				cur = 0;
				int begin = 0;
				for (int k = 0; k < M; k++) {//这个递增规则纯靠想 并没有证明
					s[k] += m[j][k];
					cur += s[k];
					if (max < cur) {
						max = cur;
						a = i;//左上角 行
						b = begin;//左上角 列
						c = j;//右下角 行
						d = k;//右下角 列
					}
					if (cur < 0) {
						cur = 0;
						begin = k + 1;
					}
				}
			}
		}
		return new int[] { a, b, c, d };
	}
```







## [[从左往右的尝试模型]] (美团)不能相邻的最大子序列累加和

返回一个数组中，选择的数字不能相邻的情况下，
最大子序列累加和



思路

- 现在来到i位置做决定
  - 不要i位置 => **0~i-1**范围上的最大值
  - ​    要i位置 => **0~i-2**范围上最大值 **+ i**位置的值

就两种情况

```java
// 给定一个数组arr，在不能取相邻数的情况下，返回所有组合中的最大累加和
// 思路：
// 定义dp[i] : 表示arr[0...i]范围上，在不能取相邻数的情况下，返回所有组合中的最大累加和
// 在arr[0...i]范围上，在不能取相邻数的情况下，得到的最大累加和，可能性分类：
// 可能性 1) 选出的组合，不包含arr[i]。那么dp[i] = dp[i-1]
// 比如，arr[0...i] = {3,4,-4}，最大累加和是不包含i位置数的时候
//
// 可能性 2) 选出的组合，只包含arr[i]。那么dp[i] = arr[i]
// 比如，arr[0...i] = {-3,-4,4}，最大累加和是只包含i位置数的时候
//
// 可能性 3) 选出的组合，包含arr[i], 且包含arr[0...i-2]范围上的累加和。那么dp[i] = arr[i] + dp[i-2]
// 比如，arr[0...i] = {3,1,4}，最大累加和是3和4组成的7，因为相邻不能选，所以i-1位置的数要跳过
//
// 综上所述：dp[i] = Max { dp[i-1], arr[i] , arr[i] + dp[i-2] }
public static int maxSum(int[] arr) {
   if (arr == null || arr.length == 0) {
      return 0;
   }
   int N = arr.length;
   if (N == 1) {
      return arr[0];
   }
   if (N == 2) {
      return Math.max(arr[0], arr[1]);
   }
   int[] dp = new int[N];
   dp[0] = arr[0];
   dp[1] = Math.max(arr[0], arr[1]);
   for (int i = 2; i < N; i++) {
      dp[i] = Math.max(Math.max(dp[i - 1], arr[i]), arr[i] + dp[i - 2]);
   }
   return dp[N - 1];
}
```







## [[预处理结构]]135.分糖果问题(H)

n 个孩子站成一排。给你一个整数数组 ratings 表示每个孩子的评分。

你需要按照以下要求，给这些孩子分发糖果：

每个孩子至少分配到 1 个糖果。
**相邻两个孩子评分更高的孩子会获得更多的糖果。**
请你给每个孩子分发糖果，计算并返回需要准备的 最少糖果数目 。
链接：https://leetcode-cn.com/problems/candy

```
输入：ratings = [1,0,2]
输出：5
解释：你可以分别给第一个、第二个、第三个孩子分发 2、1、2 颗糖果。
```

思路:

- 建立两个数组

  左坡度数组: 从左往右 -> 递增就加1 否则归1

  右坡度数组: 从右往左 -> 递增就加1 否则归1

  然后两数组每个位置求最大值

- 

```java
// 这是原问题的优良解
// 时间复杂度O(N)，额外空间复杂度O(N)
public static int candy1(int[] arr) {
   if (arr == null || arr.length == 0) {
      return 0;
   }
   int N = arr.length;
   int[] left = new int[N];
   for (int i = 1; i < N; i++) {
      if (arr[i - 1] < arr[i]) {
         left[i] = left[i - 1] + 1;
      }
   }
   int[] right = new int[N];
   for (int i = N - 2; i >= 0; i--) {
      if (arr[i] > arr[i + 1]) {
         right[i] = right[i + 1] + 1;
      }
   }
   int ans = 0;
   for (int i = 0; i < N; i++) {
      ans += Math.max(left[i], right[i]);
   }
   return ans + N;
}

// 这是原问题空间优化后的解
// 时间复杂度O(N)，额外空间复杂度O(1)
public static int candy2(int[] arr) {
   if (arr == null || arr.length == 0) {
      return 0;
   }
   int index = nextMinIndex2(arr, 0);
   int res = rightCands(arr, 0, index++);
   int lbase = 1;
   int next = 0;
   int rcands = 0;
   int rbase = 0;
   while (index != arr.length) {
      if (arr[index] > arr[index - 1]) {
         res += ++lbase;
         index++;
      } else if (arr[index] < arr[index - 1]) {
         next = nextMinIndex2(arr, index - 1);
         rcands = rightCands(arr, index - 1, next++);
         rbase = next - index + 1;
         res += rcands + (rbase > lbase ? -lbase : -rbase);
         lbase = 1;
         index = next;
      } else {
         res += 1;
         lbase = 1;
         index++;
      }
   }
   return res;
}

public static int nextMinIndex2(int[] arr, int start) {
   for (int i = start; i != arr.length - 1; i++) {
      if (arr[i] <= arr[i + 1]) {
         return i;
      }
   }
   return arr.length - 1;
}

public static int rightCands(int[] arr, int left, int right) {
   int n = right - left + 1;
   return n + n * (n - 1) / 2;
}

// 这是进阶问题的最优解，不要提交这个
// 时间复杂度O(N), 额外空间复杂度O(1)
public static int candy3(int[] arr) {
   if (arr == null || arr.length == 0) {
      return 0;
   }
   int index = nextMinIndex3(arr, 0);
   int[] data = rightCandsAndBase(arr, 0, index++);
   int res = data[0];
   int lbase = 1;
   int same = 1;
   int next = 0;
   while (index != arr.length) {
      if (arr[index] > arr[index - 1]) {
         res += ++lbase;
         same = 1;
         index++;
      } else if (arr[index] < arr[index - 1]) {
         next = nextMinIndex3(arr, index - 1);
         data = rightCandsAndBase(arr, index - 1, next++);
         if (data[1] <= lbase) {
            res += data[0] - data[1];
         } else {
            res += -lbase * same + data[0] - data[1] + data[1] * same;
         }
         index = next;
         lbase = 1;
         same = 1;
      } else {
         res += lbase;
         same++;
         index++;
      }
   }
   return res;
}

public static int nextMinIndex3(int[] arr, int start) {
   for (int i = start; i != arr.length - 1; i++) {
      if (arr[i] < arr[i + 1]) {
         return i;
      }
   }
   return arr.length - 1;
}

public static int[] rightCandsAndBase(int[] arr, int left, int right) {
   int base = 1;
   int cands = 1;
   for (int i = right - 1; i >= left; i--) {
      if (arr[i] == arr[i + 1]) {
         cands += base;
      } else {
         cands += ++base;
      }
   }
   return new int[] { cands, base };
}
```



## [[博弈论]]小人过有鳄鱼的河

一个小人通过有鳄鱼的河, 鳄鱼可能会在过河时把人吃掉, 

但是鳄鱼吃了人以后会变得非常虚弱, 而虚弱的鳄鱼会被其它鳄鱼吃掉, 

假设鳄鱼都是绝顶聪明, 问小人在什么时候可以过河, 什么时候不该过河.



分析为小问题 吃完了 就是鳄鱼总数减一的小问题



奇数不能过河 偶数可以过河





## 生成长度为size的达标数组

生成长度为size的达标数组，什么叫达标？
达标：对于任意的 **i< k < j** ,满足 **[i] + [j] != [k] * 2**
给定一个正数size,返回长度为size的达标数组



![image-20220116105452135](https://s2.loli.net/2022/01/16/CTkmnt9Whiwevoc.png)



达标 最小单元 如上图



当我给定一个大的样本N的时候，左侧搞定单独,右侧搞定单独,想整合逻辑对吧。左侧N/2暴力能不能拿下,右侧N/2暴力能不能拿下,会不会超过10^8的计算量，然后看到左侧多少规模跟右侧到规模怎么去整合，能够不用玩一个2^N的遍历代价。

当你搞定了一个一半规模的时候，你去想整合逻辑，怎么让它扩出两倍的N都达标吗?你有了这种整合的思路，其实左边部分只是偶数，右边部分只是奇数，并不怎么难想，但是这道题还是很难的。但是它其实来自于分治的一种思维。

```java
// 生成长度为size的达标数组
// 达标：对于任意的 i<k<j，满足 [i] + [j] != [k] * 2
public static int[] makeNo(int size) {
   if (size == 1) {
      return new int[] { 1 };
   }
   // size
   // 一半长达标来
   // 7 : 4
   // 8 : 4
   // [4个奇数] [3个偶]
   int halfSize = (size + 1) / 2;
   int[] base = makeNo(halfSize);
   // base -> 等长奇数达标来
   // base -> 等长偶数达标来
   int[] ans = new int[size];
   int index = 0;
   for (; index < halfSize; index++) {
      ans[index] = base[index] * 2 - 1;
   }
   for (int i = 0; index < size; index++, i++) {
      ans[index] = base[i] * 2;
   }
   return ans;
}
```



## [[样本对应模型]]97.字符串交错组成

给定三个字符串 s1、s2、s3，请你帮忙验证 s3 是否是由 s1 和 s2 交错 组成的。

两个字符串 s 和 t 交错 的定义与过程如下，其中每个字符串都会被分割成若干 非空 子字符串：

s = s1 + s2 + ... + sn
t = t1 + t2 + ... + tm
|n - m| <= 1
交错 是 s1 + t1 + s2 + t2 + s3 + t3 + ... 或者 t1 + s1 + t2 + s2 + t3 + s3 + ...
提示：a + b 意味着字符串 a 和 b 连接。
链接：https://leetcode-cn.com/problems/interleaving-string



**boolean dp[i] [j]**拿**前i个str1**字符 和 **前j个str2**字符 是否能搞定 **str总的前 i+j 个**字符

![image-20220116111726680](https://s2.loli.net/2022/01/16/U9Pvw2Ei15ZBMGf.png)

```java
public static boolean isInterleave(String s1, String s2, String s3) {
   if (s1 == null || s2 == null || s3 == null) {
      return false;
   }
   char[] str1 = s1.toCharArray();
   char[] str2 = s2.toCharArray();
   char[] str3 = s3.toCharArray();
   if (str3.length != str1.length + str2.length) {
      return false;
   }
   boolean[][] dp = new boolean[str1.length + 1][str2.length + 1];
   dp[0][0] = true;
   for (int i = 1; i <= str1.length; i++) {
      if (str1[i - 1] != str3[i - 1]) {
         break;
      }
      dp[i][0] = true;
   }
   for (int j = 1; j <= str2.length; j++) {
      if (str2[j - 1] != str3[j - 1]) {
         break;
      }
      dp[0][j] = true;
   }
   for (int i = 1; i <= str1.length; i++) {
      for (int j = 1; j <= str2.length; j++) {
         if ((str1[i - 1] == str3[i + j - 1] && dp[i - 1][j]) || 
               (str2[j - 1] == str3[i + j - 1] && dp[i][j - 1])
               ) {
            dp[i][j] = true;
         }
      }
   }
   return dp[str1.length][str2.length];
}
```





## 218.大楼最高点变化的轮廓线

城市的天际线是从远处观看该城市中所有建筑物形成的轮廓的外部轮廓。给你所有建筑物的位置和高度，请返回由这些建筑物形成的 天际线 。

每个建筑物的几何信息由数组 buildings 表示，其中三元组 buildings[i] = [lefti, righti, heighti] 表示：

lefti 是第 i 座建筑物左边缘的 x 坐标。
righti 是第 i 座建筑物右边缘的 x 坐标。
heighti 是第 i 座建筑物的高度。
天际线 应该表示为由 “关键点” 组成的列表，格式 [[x1,y1],[x2,y2],...] ，并按 x 坐标 进行 排序 。关键点是水平线段的左端点。列表中最后一个点是最右侧建筑物的终点，y 坐标始终为 0 ，仅用于标记天际线的终点。此外，任何两个相邻建筑物之间的地面都应被视为天际线轮廓的一部分。

注意：输出天际线中不得有连续的相同高度的水平线。例如 [...[2 3], [4 5], [7 5], [11 5], [12 7]...] 是不正确的答案；三条高度为 5 的线应该在最终输出中合并为一个：[...[2 3], [4 5], [12 7], ...]



原题链接：https://leetcode-cn.com/problems/the-skyline-problem
![image-20220115220918567](https://s2.loli.net/2022/01/15/4XlCpoIakhTvO9Q.png)

`输入：buildings = [[2,9,10],[3,7,15],[5,12,12],[15,20,10],[19,24,8]]
输出：[[2,10],[3,15],[7,12],[12,0],[15,10],[20,8],[24,0]]`
解释：
图 A 显示输入的所有建筑物的位置和高度，
图 B 显示由这些建筑物形成的天际线。图 B 中的红点表示输出列表中的关键点。



思路: 

如果有N个大楼导出2N个对象，因为一个大楼有在某个时刻加一个高度，在某个时刻减一个高度,这2N个对象只根据第一维数据排序。在同一个位置做加加减减。你就会知道X轴每一个你需要关心的点，它最大高度最终变成了啥，以最后一次为准。你有了这么一个过程，你生成轮廓线是就搞定了。



有些大楼捣乱: 

你任何减操作是在map中一定够用的,因为数据是成对出现的
但是有捣乱的数据,**纸片大楼的出现**会导致你必须在同一个位置把+放前为了防止这种特殊例子的影响,
所以我们的排序是生成对象的一维数据X位置在哪儿，**从小到大排序，如果×一样,加的在减的前面**

```java
public static class Node {
   public int x;
   public boolean isAdd;
   public int h;

   public Node(int x, boolean isAdd, int h) {
      this.x = x;
      this.isAdd = isAdd;
      this.h = h;
   }
}

public static class NodeComparator implements Comparator<Node> {
   @Override
   public int compare(Node o1, Node o2) {
      return o1.x - o2.x;
   }
}

public static List<List<Integer>> getSkyline(int[][] matrix) {
   Node[] nodes = new Node[matrix.length * 2];
   for (int i = 0; i < matrix.length; i++) {
      nodes[i * 2] = new Node(matrix[i][0], true, matrix[i][2]);
      nodes[i * 2 + 1] = new Node(matrix[i][1], false, matrix[i][2]);
   }
   Arrays.sort(nodes, new NodeComparator());
   // key  高度  value 次数
   TreeMap<Integer, Integer> mapHeightTimes = new TreeMap<>();
   TreeMap<Integer, Integer> mapXHeight = new TreeMap<>();
   for (int i = 0; i < nodes.length; i++) {
      if (nodes[i].isAdd) {
         if (!mapHeightTimes.containsKey(nodes[i].h)) {
            mapHeightTimes.put(nodes[i].h, 1);
         } else {
            mapHeightTimes.put(nodes[i].h, mapHeightTimes.get(nodes[i].h) + 1);
         }
      } else {
         if (mapHeightTimes.get(nodes[i].h) == 1) {
            mapHeightTimes.remove(nodes[i].h);
         } else {
            mapHeightTimes.put(nodes[i].h, mapHeightTimes.get(nodes[i].h) - 1);
         }
      }
      if (mapHeightTimes.isEmpty()) {
         mapXHeight.put(nodes[i].x, 0);
      } else {
         mapXHeight.put(nodes[i].x, mapHeightTimes.lastKey());
      }
   }
   List<List<Integer>> ans = new ArrayList<>();
   for (Entry<Integer, Integer> entry : mapXHeight.entrySet()) {
      int curX = entry.getKey();
      int curMaxHeight = entry.getValue();
      if (ans.isEmpty() || ans.get(ans.size() - 1).get(1) != curMaxHeight) {
         ans.add(new ArrayList<>(Arrays.asList(curX, curMaxHeight)));
      }
   }
   return ans;
}
```


# 5
## 1008.前序遍历构造二叉搜索树
==根据二叉树后序遍历结果生成整棵树==
https://leetcode-cn.com/problems/construct-binary-search-tree-from-preorder-traversal/
已知一棵搜索二叉树上没有重复值的节点， 现在有一个数组arr，是这棵搜索二叉树后序遍历的结果 请根据arr生成整棵树并返回头节点

返回与给定前序遍历 **preorder** 相匹配的二叉搜索树（binary search tree）的根结点。
(回想一下，二叉搜索树是二叉树的一种，其每个节点都满足以下规则，对于 node.left 的任何后代，值总 < node.val，而 node.right 的任何后代，值总 > node.val。此外，前序遍历首先显示节点 node 的值，然后遍历 node.left，接着遍历 node.right。）

```
题目保证，对于给定的测试用例，总能找到满足要求的二叉搜索树
示例：
输入：[8,5,1,7,10,12]
输出：[8,5,10,1,7,null,12]
提示：
1 <= preorder.length <= 100
1 <= preorder[i] <= 10^8
preorder 中的值互不相同
```



```java
// 不用提交这个类
	public static class TreeNode {
		public int val;
		public TreeNode left;
		public TreeNode right;

		public TreeNode() {
		}

		public TreeNode(int val) {
			this.val = val;
		}

		public TreeNode(int val, TreeNode left, TreeNode right) {
			this.val = val;
			this.left = left;
			this.right = right;
		}
	}

	// 提交下面的方法
	public static TreeNode bstFromPreorder1(int[] pre) {
		if (pre == null || pre.length == 0) {
			return null;
		}
		return process1(pre, 0, pre.length - 1);
	}

	public static TreeNode process1(int[] pre, int L, int R) {
		if (L > R) {
			return null;
		}
		int firstBig = L + 1;
		for (; firstBig <= R; firstBig++) {
			if (pre[firstBig] > pre[L]) {
				break;
			}
		}
		TreeNode head = new TreeNode(pre[L]);
		head.left = process1(pre, L + 1, firstBig - 1);
		head.right = process1(pre, firstBig, R);
		return head;
	}

	// 已经是时间复杂度最优的方法了，但是常数项还能优化
	public static TreeNode bstFromPreorder2(int[] pre) {
		if (pre == null || pre.length == 0) {
			return null;
		}
		int N = pre.length;
		int[] nearBig = new int[N];
		for (int i = 0; i < N; i++) {
			nearBig[i] = -1;
		}
		Stack<Integer> stack = new Stack<>();
		for (int i = 0; i < N; i++) {
			while (!stack.isEmpty() && pre[stack.peek()] < pre[i]) {
				nearBig[stack.pop()] = i;
			}
			stack.push(i);
		}
		return process2(pre, 0, N - 1, nearBig);
	}

	public static TreeNode process2(int[] pre, int L, int R, int[] nearBig) {
		if (L > R) {
			return null;
		}
		int firstBig = (nearBig[L] == -1 || nearBig[L] > R) ? R + 1 : nearBig[L];
		TreeNode head = new TreeNode(pre[L]);
		head.left = process2(pre, L + 1, firstBig - 1, nearBig);
		head.right = process2(pre, firstBig, R, nearBig);
		return head;
	}

	// 最优解
	public static TreeNode bstFromPreorder3(int[] pre) {
		if (pre == null || pre.length == 0) {
			return null;
		}
		int N = pre.length;
		int[] nearBig = new int[N];
		for (int i = 0; i < N; i++) {
			nearBig[i] = -1;
		}
		int[] stack = new int[N];
		int size = 0;
		for (int i = 0; i < N; i++) {
			while (size != 0 && pre[stack[size - 1]] < pre[i]) {
				nearBig[stack[--size]] = i;
			}
			stack[size++] = i;
		}
		return process3(pre, 0, N - 1, nearBig);
	}

	public static TreeNode process3(int[] pre, int L, int R, int[] nearBig) {
		if (L > R) {
			return null;
		}
		int firstBig = (nearBig[L] == -1 || nearBig[L] > R) ? R + 1 : nearBig[L];
		TreeNode head = new TreeNode(pre[L]);
		head.left = process3(pre, L + 1, firstBig - 1, nearBig);
		head.right = process3(pre, firstBig, R, nearBig);
		return head;
	}
```



## [[二叉树递归套路]]二叉树的相等子树 Hash
拼接hashCode作为Info判断是否相等    极少几率碰撞 人类不可能碰撞出来
```java
public static class Node {
	public int value;
	public Node left;
	public Node right;
	public Node(int v) {
		value = v;
	}
}
///////////////////////////////////////////////////////////////////////////
//计数递归
public static int sameNumber11(Node head) {
	if (head == null) {
		return 0;
	}
	return sameNumber11(head.left) + sameNumber11(head.right) + (sameTest(head.left, head.right) ? 1 : 0);
}
//判断递归
public static boolean sameTest(Node n1, Node n2) {
	if (n1 == null ^ n2 == null) return false;//一个空一个不空 => 肯定不相等
	if (n1 == null && n2 == null) return true;//两个都为空 => 直接相等
	return n1.value == n2.value && sameTest(n1.left, n2.left) && sameTest(n1.right, n2.right);//两个都有值
}
///////////////////////////////////////////////////////////////////////////
public static int sameNumber22(Node head) {
	String algorithm = "SHA-256";
	Hash hash = new Hash(algorithm);//先把hash对象创建好 设置相应的算法 然后可以直接.出来
	return processTest(head, hash).count;//返回head的信息里面的count 包含了所有子树的count
}

public static class InfoTest {
	public int count;
	public String hashStr;
	public InfoTest(int count, String hashStr) {
		this.count = count;
		this.hashStr = hashStr;
	}
}
public static InfoTest processTest(Node head, Hash hash) {
	if (head == null) return new InfoTest(0, hash.hashCode("#,"));
	InfoTest leftInfo = processTest(head.left, hash);
	InfoTest rightInfo = processTest(head.right, hash);
	int count = (leftInfo.hashStr.equals(rightInfo.hashStr) ? 1 : 0) + leftInfo.count + rightInfo.count;//本head是否对称
	String hashStr = hash.hashCode(String.valueOf(head.value) + "," + leftInfo.hashStr + rightInfo.hashStr);
	return new InfoTest(count, hashStr);
}
```



## [经典]编辑距离问题

主要核心: **如何达到目标最省**
实用: 在搜索中,得到两个字符串相似程度

```java
public static int minCost1(String s1, String s2, int ic, int dc, int rc) {
		if (s1 == null || s2 == null) {
			return 0;
		}
		char[] str1 = s1.toCharArray();
		char[] str2 = s2.toCharArray();
		int N = str1.length + 1;
		int M = str2.length + 1;
		int[][] dp = new int[N][M];
		// dp[0][0] = 0
		for (int i = 1; i < N; i++) {
			dp[i][0] = dc * i;
		}
		for (int j = 1; j < M; j++) {
			dp[0][j] = ic * j;
		}
		for (int i = 1; i < N; i++) {
			for (int j = 1; j < M; j++) {
				dp[i][j] = dp[i - 1][j - 1] + (str1[i - 1] == str2[j - 1] ? 0 : rc);
				dp[i][j] = Math.min(dp[i][j], dp[i][j - 1] + ic);
				dp[i][j] = Math.min(dp[i][j], dp[i - 1][j] + dc);
			}
		}
		return dp[N - 1][M - 1];
	}

public static int minCost2(String str1, String str2, int ic, int dc, int rc) {
		if (str1 == null || str2 == null) {
			return 0;
		}
		char[] chs1 = str1.toCharArray();
		char[] chs2 = str2.toCharArray();
		char[] longs = chs1.length >= chs2.length ? chs1 : chs2;
		char[] shorts = chs1.length < chs2.length ? chs1 : chs2;
		if (chs1.length < chs2.length) {
			int tmp = ic;
			ic = dc;
			dc = tmp;
		}
		int[] dp = new int[shorts.length + 1];
		for (int i = 1; i <= shorts.length; i++) {
			dp[i] = ic * i;
		}
		for (int i = 1; i <= longs.length; i++) {
			int pre = dp[0];
			dp[0] = dc * i;
			for (int j = 1; j <= shorts.length; j++) {
				int tmp = dp[j];
				if (longs[i - 1] == shorts[j - 1]) {
					dp[j] = pre;
				} else {
					dp[j] = pre + rc;
				}
				dp[j] = Math.min(dp[j], dp[j - 1] + ic);
				dp[j] = Math.min(dp[j], tmp + dc);
				pre = tmp;
			}
		}
		return dp[shorts.length];
	}
```


## (字节)S2删除最少字符成为S1的子串


```java
	// 题目：
	// 给定两个字符串s1和s2，问s2最少删除多少字符可以成为s1的子串？
	// 比如 s1 = "abcde"，s2 = "axbc"
	// 返回 1

	// 解法一
	// 求出str2所有的子序列，然后按照长度排序，长度大的排在前面。
	// 然后考察哪个子序列字符串和s1的某个子串相等(KMP)，答案就出来了。
	// 分析：
	// 因为题目原本的样本数据中，有特别说明s2的长度很小。所以这么做也没有太大问题，也几乎不会超时。
	// 但是如果某一次考试给定的s2长度远大于s1，这么做就不合适了。
	public static int minCost1(String s1, String s2) {
		List<String> s2Subs = new ArrayList<>();
		process(s2.toCharArray(), 0, "", s2Subs);
		s2Subs.sort(new LenComp());
		for (String str : s2Subs) {
			if (s1.indexOf(str) != -1) { // indexOf底层和KMP算法代价几乎一样，也可以用KMP代替
				return s2.length() - str.length();
			}
		}
		return s2.length();
	}

	public static void process(char[] str2, int index, String path, List<String> list) {
		if (index == str2.length) {
			list.add(path);
			return;
		}
		process(str2, index + 1, path, list);
		process(str2, index + 1, path + str2[index], list);
	}

	// x字符串只通过删除的方式，变到y字符串
	// 返回至少要删几个字符
	// 如果变不成，返回Integer.Max
	public static int onlyDelete(char[] x, char[] y) {
		if (x.length < y.length) {
			return Integer.MAX_VALUE;
		}
		int N = x.length;
		int M = y.length;
		int[][] dp = new int[N + 1][M + 1];
		for (int i = 0; i <= N; i++) {
			for (int j = 0; j <= M; j++) {
				dp[i][j] = Integer.MAX_VALUE;
			}
		}
		dp[0][0] = 0;
		// dp[i][j]表示前缀长度
		for (int i = 1; i <= N; i++) {
			dp[i][0] = i;
		}
		for (int xlen = 1; xlen <= N; xlen++) {
			for (int ylen = 1; ylen <= Math.min(M, xlen); ylen++) {
				if (dp[xlen - 1][ylen] != Integer.MAX_VALUE) {
					dp[xlen][ylen] = dp[xlen - 1][ylen] + 1;
				}
				if (x[xlen - 1] == y[ylen - 1] && dp[xlen - 1][ylen - 1] != Integer.MAX_VALUE) {
					dp[xlen][ylen] = Math.min(dp[xlen][ylen], dp[xlen - 1][ylen - 1]);
				}
			}
		}
		return dp[N][M];
	}

	public static class LenComp implements Comparator<String> {

		@Override
		public int compare(String o1, String o2) {
			return o2.length() - o1.length();
		}

	}

	// 解法二
	// 生成所有s1的子串
	// 然后考察每个子串和s2的编辑距离(假设编辑距离只有删除动作且删除一个字符的代价为1)
	// 如果s1的长度较小，s2长度较大，这个方法比较合适
	public static int minCost2(String s1, String s2) {
		if (s1.length() == 0 || s2.length() == 0) {
			return s2.length();
		}
		int ans = Integer.MAX_VALUE;
		char[] str2 = s2.toCharArray();
		for (int start = 0; start < s1.length(); start++) {
			for (int end = start + 1; end <= s1.length(); end++) {
				// str1[start....end]
				// substring -> [ 0,1 )
				ans = Math.min(ans, distance(str2, s1.substring(start, end).toCharArray()));
			}
		}
		return ans == Integer.MAX_VALUE ? s2.length() : ans;
	}

	// 求str2到s1sub的编辑距离
	// 假设编辑距离只有删除动作且删除一个字符的代价为1
	public static int distance(char[] str2, char[] s1sub) {
		int row = str2.length;
		int col = s1sub.length;
		int[][] dp = new int[row][col];
		// dp[i][j]的含义：
		// str2[0..i]仅通过删除行为变成s1sub[0..j]的最小代价
		// 可能性一：
		// str2[0..i]变的过程中，不保留最后一个字符(str2[i])，
		// 那么就是通过str2[0..i-1]变成s1sub[0..j]之后，再最后删掉str2[i]即可 -> dp[i][j] = dp[i-1][j] + 1
		// 可能性二：
		// str2[0..i]变的过程中，想保留最后一个字符(str2[i])，然后变成s1sub[0..j]，
		// 这要求str2[i] == s1sub[j]才有这种可能, 然后str2[0..i-1]变成s1sub[0..j-1]即可
		// 也就是str2[i] == s1sub[j] 的条件下，dp[i][j] = dp[i-1][j-1]
		dp[0][0] = str2[0] == s1sub[0] ? 0 : Integer.MAX_VALUE;
		for (int j = 1; j < col; j++) {
			dp[0][j] = Integer.MAX_VALUE;
		}
		for (int i = 1; i < row; i++) {
			dp[i][0] = (dp[i - 1][0] != Integer.MAX_VALUE || str2[i] == s1sub[0]) ? i : Integer.MAX_VALUE;
		}
		for (int i = 1; i < row; i++) {
			for (int j = 1; j < col; j++) {
				dp[i][j] = Integer.MAX_VALUE;
				if (dp[i - 1][j] != Integer.MAX_VALUE) {
					dp[i][j] = dp[i - 1][j] + 1;
				}
				if (str2[i] == s1sub[j] && dp[i - 1][j - 1] != Integer.MAX_VALUE) {
					dp[i][j] = Math.min(dp[i][j], dp[i - 1][j - 1]);
				}

			}
		}
		return dp[row - 1][col - 1];
	}

	// 解法二的优化
	public static int minCost3(String s1, String s2) {
		if (s1.length() == 0 || s2.length() == 0) {
			return s2.length();
		}
		char[] str2 = s2.toCharArray();
		char[] str1 = s1.toCharArray();
		int M = str2.length;
		int N = str1.length;
		int[][] dp = new int[M][N];
		int ans = M;
		for (int start = 0; start < N; start++) { // 开始的列数
			dp[0][start] = str2[0] == str1[start] ? 0 : M;
			for (int row = 1; row < M; row++) {
				dp[row][start] = (str2[row] == str1[start] || dp[row - 1][start] != M) ? row : M;
			}
			ans = Math.min(ans, dp[M - 1][start]);
			// 以上已经把start列，填好
			// 以下要把dp[...][start+1....N-1]的信息填好
			// start...end end - start +2
			for (int end = start + 1; end < N && end - start < M; end++) {
				// 0... first-1 行 不用管
				int first = end - start;
				dp[first][end] = (str2[first] == str1[end] && dp[first - 1][end - 1] == 0) ? 0 : M;
				for (int row = first + 1; row < M; row++) {
					dp[row][end] = M;
					if (dp[row - 1][end] != M) {
						dp[row][end] = dp[row - 1][end] + 1;
					}
					if (dp[row - 1][end - 1] != M && str2[row] == str1[end]) {
						dp[row][end] = Math.min(dp[row][end], dp[row - 1][end - 1]);
					}
				}
				ans = Math.min(ans, dp[M - 1][end]);
			}
		}
		return ans;
	}

	// 来自学生的做法，时间复杂度O(N * M平方)
	// 复杂度和方法三一样，但是思路截然不同
	public static int minCost4(String s1, String s2) {
		char[] str1 = s1.toCharArray();
		char[] str2 = s2.toCharArray();
		HashMap<Character, ArrayList<Integer>> map1 = new HashMap<>();
		for (int i = 0; i < str1.length; i++) {
			ArrayList<Integer> list = map1.getOrDefault(str1[i], new ArrayList<Integer>());
			list.add(i);
			map1.put(str1[i], list);
		}
		int ans = 0;
		// 假设删除后的str2必以i位置开头
		// 那么查找i位置在str1上一共有几个，并对str1上的每个位置开始遍历
		// 再次遍历str2一次，看存在对应str1中i后续连续子串可容纳的最长长度
		for (int i = 0; i < str2.length; i++) {
			if (map1.containsKey(str2[i])) {
				ArrayList<Integer> keyList = map1.get(str2[i]);
				for (int j = 0; j < keyList.size(); j++) {
					int cur1 = keyList.get(j) + 1;
					int cur2 = i + 1;
					int count = 1;
					for (int k = cur2; k < str2.length && cur1 < str1.length; k++) {
						if (str2[k] == str1[cur1]) {
							cur1++;
							count++;
						}
					}
					ans = Math.max(ans, count);
				}
			}
		}
		return s2.length() - ans;
	}
```





























