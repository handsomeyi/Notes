

# 请返回str是总序列中的第几个

```java
// 给定一个长度len，表示一共有几位
// 所有字符都是小写(a~z)，可以生成长度为1，长度为2，
// 长度为3...长度为len的所有字符串
// 如果把所有字符串根据字典序排序，每个字符串都有所在的位置。
// 给定一个字符串str，给定len，请返回str是总序列中的第几个
// 比如len = 4，字典序的前几个字符串为:
// a aa aaa aaaa aaab ... aaaz ... azzz b ba baa baaa ... bzzz c ...
// a是这个序列中的第1个，bzzz是这个序列中的第36558个
public class Code01_StringKth {
   // 思路：
   // cdb，总共长度为7，请问cdb是第几个？
   // 第一位c :
   // 以a开头，剩下长度为(0~6)的所有可能性有几个
   // +
   // 以b开头，剩下长度为(0~6)的所有可能性有几个
   // +
   // 以c开头，剩下长度为(0)的所有可能性有几个
   // 第二位d :
   // +
   // 以ca开头的情况下，剩下长度为(0~5)的所有可能性有几个
   // +
   // 以cb开头的情况下，剩下长度为(0~5)的所有可能性有几个
   // +
   // 以cc开头的情况下，剩下长度为(0~5)的所有可能性有几个
   // +
   // 以cd开头的情况下，剩下长度为(0)的所有可能性有几个
   // 第三位b
   // +
   // 以cda开头的情况下，剩下长度为(0~4)的所有可能性有几个
   // +
   // 以cdb开头的情况下，剩下长度为(0)的所有可能性有几个
   public static int kth(String s, int len) {
      if (s == null || s.length() == 0 || s.length() > len) {
         return -1;
      }
      char[] num = s.toCharArray();
      int ans = 0;
      for (int i = 0, rest = len - 1; i < num.length; i++, rest--) {
         ans += (num[i] - 'a') * f(rest) + 1;
      }
      return ans;
   }

   // 不管以什么开头，剩下长度为(0~len)的所有可能性有几个
   public static int f(int len) {
      int ans = 1;
      for (int i = 1, base = 26; i <= len; i++, base *= 26) {
         ans += base;
      }
      return ans;
   }
```

# 石子过河(小红书)

```java
import java.util.Arrays;
// 来自小红书
// [0,4,7] ： 0表示这里石头没有颜色，如果变红代价是4，如果变蓝代价是7
// [1,X,X] ： 1表示这里石头已经是红，而且不能改颜色，所以后两个数X无意义
// [2,X,X] ： 2表示这里石头已经是蓝，而且不能改颜色，所以后两个数X无意义
// 颜色只可能是0、1、2，代价一定>=0
// 给你一批这样的小数组，要求最后必须所有石头都有颜色，且红色和蓝色一样多，返回最小代价
// 如果怎么都无法做到所有石头都有颜色、且红色和蓝色一样多，返回-1
public class Code02_MagicStone {
   public static int minCost(int[][] stones) {
      int n = stones.length;
      if ((n & 1) != 0) {
         return -1;
      }
      Arrays.sort(stones, (a, b) -> a[0] == 0 && b[0] == 0 ? (b[1] - b[2] - a[1] + a[2]) : (a[0] - b[0]));
      int zero = 0;
      int red = 0;
      int blue = 0;
      int cost = 0;
      for (int i = 0; i < n; i++) {
         if (stones[i][0] == 0) {
            zero++;
            cost += stones[i][1];
         } else if (stones[i][0] == 1) {
            red++;
         } else {
            blue++;
         }
      }
      if (red > (n >> 1) || blue > (n >> 1)) {
         return -1;
      }
      blue = zero - ((n >> 1) - red);
      for (int i = 0; i < blue; i++) {
         cost += stones[i][2] - stones[i][1];
      }
      return cost;
   }
   public static void main(String[] args) {
      int[][] stones = { { 1, 5, 3 }, { 2, 7, 9 }, { 0, 6, 4 }, { 0, 7, 9 }, { 0, 2, 1 }, { 0, 5, 9 } };
      System.out.println(minCost(stones));
   }
}
```

# 看电影时间(小红书)

电影一定要排序

```java
import java.util.Arrays;
// 来自小红书
// 一场电影开始和结束时间可以用一个小数组来表示["07:30","12:00"]
// 已知有2000场电影开始和结束都在同一天，这一天从00:00开始到23:59结束
// 一定要选3场完全不冲突的电影来观看，返回最大的观影时间
// 如果无法选出3场完全不冲突的电影来观看，返回-1
public class Code03_WatchMovieMaxTime {

   // 暴力方法，枚举前三场所有的可能全排列
   public static int maxEnjoy1(int[][] movies) {
      if (movies.length < 3) {
         return -1;
      }
      return process1(movies, 0);
   }

   public static int process1(int[][] movies, int index) {
      if (index == 3) {
         int start = 0;
         int watch = 0;
         for (int i = 0; i < 3; i++) {
            if (start > movies[i][0]) {
               return -1;
            }
            watch += movies[i][1] - movies[i][0];
            start = movies[i][1];
         }
         return watch;
      } else {
         int ans = -1;
         for (int i = index; i < movies.length; i++) {
            swap(movies, index, i);
            ans = Math.max(ans, process1(movies, index + 1));
            swap(movies, index, i);
         }
         return ans;
      }
   }

   public static void swap(int[][] movies, int i, int j) {
      int[] tmp = movies[i];
      movies[i] = movies[j];
      movies[j] = tmp;
   }

   // 优化后的递归解
   public static int maxEnjoy2(int[][] movies) {
      Arrays.sort(movies, (a, b) -> a[0] != b[0] ? (a[0] - b[0]) : (a[1] - b[1]));
      return process2(movies, 0, 0, 3);
   }

   public static int process2(int[][] movies, int index, int time, int rest) {
      if (index == movies.length) {
         return rest == 0 ? 0 : -1;
      }
      int p1 = process2(movies, index + 1, time, rest);
      int next = movies[index][0] >= time && rest > 0 ? process2(movies, index + 1, movies[index][1], rest - 1) : -1;
      int p2 = next != -1 ? (movies[index][1] - movies[index][0] + next) : -1;
      return Math.max(p1, p2);
   }

   // 记忆化搜索的动态规划
    
   // 为了测试
   public static int[][] randomMovies(int len, int time) {
      int[][] movies = new int[len][2];
      for (int i = 0; i < len; i++) {
         int a = (int) (Math.random() * time);
         int b = (int) (Math.random() * time);
         movies[i][0] = Math.min(a, b);
         movies[i][1] = Math.max(a, b);
      }
      return movies;
   }

   public static void main(String[] args) {
      int n = 10;
      int t = 20;
      int testTime = 10000;
      System.out.println("测试开始");
      for (int i = 0; i < testTime; i++) {
         int len = (int) (Math.random() * n) + 1;
         int[][] movies = randomMovies(len, t);
         int ans1 = maxEnjoy1(movies);
         int ans2 = maxEnjoy2(movies);
         if (ans1 != ans2) {
            for (int[] m : movies) {
               System.out.println(m[0] + " , " + m[1]);
            }
            System.out.println(ans1);
            System.out.println(ans2);
            System.out.println("出错了");
         }
      }
      System.out.println("测试结束");
   }
}
```

# 陆地海洋走路 (网易)[[小根堆 & A*算法]]

```java
// 来自网易
// map[i][j] == 0，代表(i,j)是海洋，渡过的话代价是2
// map[i][j] == 1，代表(i,j)是陆地，渡过的话代价是1
// map[i][j] == 2，代表(i,j)是障碍，无法渡过
// 每一步上、下、左、右都能走，返回从左上角走到右下角最小代价是多少，如果无法到达返回-1
public class Code04_WalkToEnd {

   public static int minCost(int[][] map) {
      if (map[0][0] == 2) {
         return -1;
      }
      int n = map.length;
      int m = map[0].length;
      PriorityQueue<Node> heap = new PriorityQueue<>((a, b) -> a.cost - b.cost);
      boolean[][] visited = new boolean[n][m];
      add(map, 0, 0, 0, heap, visited);
      while (!heap.isEmpty()) {
         Node cur = heap.poll();
         if (cur.row == n - 1 && cur.col == m - 1) {
            return cur.cost;
         }
         add(map, cur.row - 1, cur.col, cur.cost, heap, visited);
         add(map, cur.row + 1, cur.col, cur.cost, heap, visited);
         add(map, cur.row, cur.col - 1, cur.cost, heap, visited);
         add(map, cur.row, cur.col + 1, cur.cost, heap, visited);
      }
      return -1;
   }

   public static void add(int[][] m, int i, int j, int pre, PriorityQueue<Node> heap, boolean[][] visited) {
      if (i >= 0 && i < m.length && j >= 0 && j < m[0].length && m[i][j] != 2 && !visited[i][j]) {
         heap.add(new Node(i, j, pre + (m[i][j] == 0 ? 2 : 1)));
         visited[i][j] = true;
      }
   }

   public static class Node {
      public int row;
      public int col;
      public int cost;

      public Node(int a, int b, int c) {
         row = a;
         col = b;
         cost = c;
      }
   }
```

# 小朋友分糖果问题(网易)

**基础线形**

生成两个辅助数组 左边比他大就1 比他小就加

右同理

![image-20220102210208982](https://s2.loli.net/2022/01/02/QviWSPaqODUs7Bp.png)





**进阶环形**

就把价值最低值放到两侧 保持相邻位置关系

```java
// 来自网易
// 给定一个正数数组arr，表示每个小朋友的得分
// 任何两个相邻的小朋友，如果得分一样，怎么分糖果无所谓，但如果得分不一样，分数大的一定要比分数少的多拿一些糖果
// 假设所有的小朋友坐成一个环形，返回在不破坏上一条规则的情况下，需要的最少糖果数
public class Code05_CircleCandy {

   public static int minCandy(int[] arr) {
      if (arr == null || arr.length == 0) {
         return 0;
      }
      if (arr.length == 1) {
         return 1;
      }
      int n = arr.length;
      int minIndex = 0;
      for (int i = 0; i < n; i++) {
         if (arr[i] <= arr[lastIndex(i, n)] && arr[i] <= arr[nextIndex(i, n)]) {
            minIndex = i;
            break;
         }
      }
      int[] nums = new int[n + 1];
      for (int i = 0; i <= n; i++, minIndex = nextIndex(minIndex, n)) {
         nums[i] = arr[minIndex];
      }
      int[] left = new int[n + 1];
      left[0] = 1;
      for (int i = 1; i <= n; i++) {
         left[i] = nums[i] > nums[i - 1] ? (left[i - 1] + 1) : 1;
      }
      int[] right = new int[n + 1];
      right[n] = 1;
      for (int i = n - 1; i >= 0; i--) {
         right[i] = nums[i] > nums[i + 1] ? (right[i + 1] + 1) : 1;
      }
      int ans = 0;
      for (int i = 0; i < n; i++) {
         ans += Math.max(left[i], right[i]);
      }
      return ans;
   }

   public static int nextIndex(int i, int n) {
      return i == n - 1 ? 0 : (i + 1);
   }

   public static int lastIndex(int i, int n) {
      return i == 0 ? (n - 1) : (i - 1);
   }

   public static void main(String[] args) {
      int[] arr = { 3, 4, 2, 3, 2 };
      System.out.println(minCandy(arr));
   }

}
```





# ReverseInvertString (网易)[[递归分治]]

大写字母的A-Z对应ASCII码的65-90

小写字母的a-z对应ASCII码的97-122



[[分治]] 找到 Sn 的第 k 个字符在左半部分 还是右半部分 还是中间 中间可以直接返回
递归分支只走一个

```java
// 规定：L[1]对应a，L[2]对应b，L[3]对应c，...，L[25]对应y
// S1 = a
// S(i) = S(i-1) + L[i] + reverse(invert(S(i-1)));
// 解释invert操作：
// S1 = a
// S2 = aby
// 假设invert(S(2)) = 甲乙丙
// a + 甲 = 26, 那么 甲 = 26 - 1 = 25 -> y
// b + 乙 = 26, 那么 乙 = 26 - 2 = 24 -> x
// y + 丙 = 26, 那么 丙 = 26 - 25 = 1 -> a
// 如上就是每一位的计算方式，所以invert(S2) = yxa
// 所以S3 = S2 + L[3] + reverse(invert(S2)) = aby + c + axy = abycaxy
// invert(abycaxy) = yxawyba, 再reverse = abywaxy
// 所以S4 = abycaxy + d + abywaxy = abycaxydabywaxy
// 直到S25结束
// 给定两个参数n和k，返回Sn的第k位是什么字符，n从1开始，k从1开始
// 比如n=4，k=2，表示S4的第2个字符是什么，返回b字符

	//所有长度先记录好
	public static int[] lens = null;
	//为了递归不重复调用初始化
	public static void fillLens() {
		lens = new int[26];
		lens[1] = 1;
		for (int i = 2; i <= 25; i++) {
			lens[i] = (lens[i - 1] << 1) + 1;
		}
	}

	// 求sn中的第k个字符
	// O(n), s <= 25 O(1)
	public static char kth(int n, int k) {
		if (lens == null) {
			fillLens();
		}
		if (n == 1) { // 无视k
			return 'a';
		}
		// sn half
		int half = lens[n - 1];//n-1的全部长度就是当前一半长度
		if (k <= half) {//通过下标和 half 来判断是 左 or 中 or 右
			return kth(n - 1, k);//左
		} else if (k == half + 1) {//中
			return (char) ('a' + n - 1);
		} else {//右
			// sn
			// 我需要右半区，从左往右的第a个
			// 需要找到，s(n-1)从右往左的第a个
			// 当拿到字符之后，invert一下，就可以返回了！
			return invert(kth(n - 1, ((half + 1) << 1) - k));
		}
	}

	public static char invert(char c) {
//		return (char) (('a' << 1) + 24 - c);  //两种都行
		return (char) (('z' << 1) - 26 - c);
 	}
```





# 010101001分割(京东)

局部比例和整体比例 的关系

```java
// 来自京东
// 把一个01字符串切成多个部分，要求每一部分的0和1比例一样，同时要求尽可能多的划分
// 比如 : 01010101
// 01 01 01 01 这是一种切法，0和1比例为 1 : 1
// 0101 0101 也是一种切法，0和1比例为 1 : 1
// 两种切法都符合要求，但是那么尽可能多的划分为第一种切法，部分数为4
// 比如 : 00001111
// 只有一种切法就是00001111整体作为一块，那么尽可能多的划分，部分数为1

// 给定一个01字符串str，假设长度为N，要求返回一个长度为N的数组ans
// 其中ans[i] = str[0...i]这个前缀串，要求每一部分的0和1比例一样，同时要求尽可能多的划分下，部分数是多少
// 输入: str = "010100001"
// 输出: ans = [1, 1, 1, 2, 1, 2, 1, 1, 3]
```

![image-20220103135436226](https://s2.loli.net/2022/01/03/YoDXKvjeIMNqGEy.png)

```java
// 001010010100...
public static int[] split(int[] arr) {
   // key : 分子
   // value : 属于key的分母表, 每一个分母，及其 分子/分母 这个比例，多少个前缀拥有
   HashMap<Integer, HashMap<Integer, Integer>> pre = new HashMap<>();
   int n = arr.length;
   int[] ans = new int[n];
   int zero = 0; // 0出现的次数
   int one = 0; // 1出现的次数
   for (int i = 0; i < n; i++) {
      if (arr[i] == 0) {
         zero++;
      } else {
         one++;
      }
      if (zero == 0 || one == 0) {
         ans[i] = i + 1;
      } else { // 0和1，都有数量 -> 最简分数
         int gcd = gcd(zero, one);
         int a = zero / gcd;
         int b = one / gcd;
         // a / b 比例，之前有多少前缀拥有？ 3+1 4 5+1 6
         if (!pre.containsKey(a)) {
            pre.put(a, new HashMap<>());
         }
         if (!pre.get(a).containsKey(b)) {
            pre.get(a).put(b, 1);
         } else {
            pre.get(a).put(b, pre.get(a).get(b) + 1);
         }
         ans[i] = pre.get(a).get(b);
      }
   }
   return ans;
}

public static int gcd(int m, int n) {
   return n == 0 ? m : gcd(n, m % n);
}
```



# KMP++ (KMP)

```java
// 来自美团
// 给定两个字符串s1和s2
// 返回在s1中有多少个子串等于s2
public class Code03_MatchCount {

   public static int sa(String s1, String s2) {
      if (s1 == null || s2 == null || s1.length() < s2.length()) {
         return 0;
      }
      char[] str1 = s1.toCharArray();
      char[] str2 = s2.toCharArray();
      return count(str1, str2);
   }

   // 改写kmp为这道题需要的功能
   public static int count(char[] str1, char[] str2) {
      int x = 0;
      int y = 0;
      int count = 0;
      int[] next = getNextArray(str2);
      while (x < str1.length) {
         if (str1[x] == str2[y]) {
            x++;
            y++;
            if (y == str2.length) {
               count++;
               y = next[y];
            }
         } else if (next[y] == -1) {
            x++;
         } else {
            y = next[y];
         }
      }
      return count;
   }

   // next数组多求一位
   // 比如：str2 = aaaa
   // 那么，next = -1,0,1,2,3
   // 最后一个3表示，终止位置之前的字符串最长前缀和最长后缀的匹配长度
   // 也就是next数组补一位
   public static int[] getNextArray(char[] str2) {
      if (str2.length == 1) {
         return new int[] { -1, 0 };
      }
      int[] next = new int[str2.length + 1];
      next[0] = -1;
      next[1] = 0;
      int i = 2;
      int cn = 0;
      while (i < next.length) {
         if (str2[i - 1] == str2[cn]) {
            next[i++] = ++cn;
         } else if (cn > 0) {
            cn = next[cn];
         } else {
            next[i++] = 0;
         }
      }
      return next;
   }

}
```



# 求括号值 (美团) [[嵌套递归套路]]

```java
// 来自美团
// () 分值为2
// (()) 分值为3
// ((())) 分值为4
// 也就是说，每包裹一层，分数就是里面的分值+1
// ()() 分值为2 * 2
// (())() 分值为3 * 2
// 也就是说，每连接一段，分数就是各部分相乘，以下是一个结合起来的例子
// (()())()(()) -> (2 * 2 + 1) * 2 * 3 -> 30
// 给定一个括号字符串str，已知str一定是正确的括号结合，不会有违规嵌套
// 返回分数
```

```java
public static int sores(String s) {
   return compute(s.toCharArray(), 0)[0];
}

// s[i.....] 遇到 ')' 或者 终止位置  停！
// 返回值：int[]  长度就是2
// 0 ：分数是多少
// 1 : 来到了什么位置停的！
public static int[] compute(char[] s, int i) {
   if (s[i] == ')') {//递归过程遇到 右括号返回当前值
      return new int[]{ 1, i };
   }
   int ans = 1;
   while (i < s.length && s[i] != ')') {
      int[] info = compute(s, i + 1);
      ans *= info[0] + 1;//每块相乘
      i = info[1] + 1;
   }
   return new int[]{ ans, i };
}
```



# Query3Problems [[线段树]]

遇见式子不要慌 先化简试试看

![image-20220102222356650](https://s2.loli.net/2022/01/02/Kul5x6XazCE8M4h.png)

```java
// 来自美团
// 给定一个数组arr，长度为N，做出一个结构，可以高效的做如下的查询
// 1) int querySum(L,R) : 查询arr[L...R]上的累加和
// ==============前缀和数组==============
// 2) int queryAim(L,R) : 查询arr[L...R]上的目标值，目标值定义如下：
//        假设arr[L...R]上的值为[a,b,c,d]，a+b+c+d = s
//        目标值为 : (s-a)^2 + (s-b)^2 + (s-c)^2 + (s-d)^2
// ============== 数学化简 平方之后前缀和 ==============
// 3) int queryMax(L,R) : 查询arr[L...R]上的最大值
// ==============线段树==============
// 要求：
// 1) 初始化该结构的时间复杂度不能超过O(N*logN)
// 2) 三个查询的时间复杂度不能超过O(logN)
// 3) 查询时，认为arr的下标从1开始，比如 : 
//    arr = [ 1, 1, 2, 3 ];
//    querySum(1, 3) -> 4
//    queryAim(2, 4) -> 50
//    queryMax(1, 4) -> 3

public class Code05_Query3Problems {

   public static class SegmentTree {
      private int[] max;
      private int[] change;
      private boolean[] update;

      public SegmentTree(int N) {
         max = new int[N << 2];
         change = new int[N << 2];
         update = new boolean[N << 2];
         for (int i = 0; i < max.length; i++) {
            max[i] = Integer.MIN_VALUE;
         }
      }

      private void pushUp(int rt) {
         max[rt] = Math.max(max[rt << 1], max[rt << 1 | 1]);
      }

      // ln表示左子树元素结点个数，rn表示右子树结点个数
      private void pushDown(int rt, int ln, int rn) {
         if (update[rt]) {
            update[rt << 1] = true;
            update[rt << 1 | 1] = true;
            change[rt << 1] = change[rt];
            change[rt << 1 | 1] = change[rt];
            max[rt << 1] = change[rt];
            max[rt << 1 | 1] = change[rt];
            update[rt] = false;
         }
      }

      public void update(int L, int R, int C, int l, int r, int rt) {
         if (L <= l && r <= R) {
            update[rt] = true;
            change[rt] = C;
            max[rt] = C;
            return;
         }
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

      public int query(int L, int R, int l, int r, int rt) {
         if (L <= l && r <= R) {
            return max[rt];
         }
         int mid = (l + r) >> 1;
         pushDown(rt, mid - l + 1, r - mid);
         int left = 0;
         int right = 0;
         if (L <= mid) {
            left = query(L, R, l, mid, rt << 1);
         }
         if (R > mid) {
            right = query(L, R, mid + 1, r, rt << 1 | 1);
         }
         return Math.max(left, right);
      }

   }

   public static class Query {
      public int[] sum1;
      public int[] sum2;
      public SegmentTree st;
      public int m;

      public Query(int[] arr) {
         int n = arr.length;
         m = arr.length + 1;
         sum1 = new int[m];
         sum2 = new int[m];
         st = new SegmentTree(m);
         for (int i = 0; i < n; i++) {
            sum1[i + 1] = sum1[i] + arr[i];
            sum2[i + 1] = sum2[i] + arr[i] * arr[i];
            st.update(i + 1, i + 1, arr[i], 1, m, 1);
         }

      }

      public int querySum(int L, int R) {
         return sum1[R] - sum1[L - 1];
      }

      public int queryAim(int L, int R) {
         int sumPower2 = querySum(L, R);
         sumPower2 *= sumPower2;
         return sum2[R] - sum2[L - 1] + (R - L - 1) * sumPower2;
      }

      public int queryMax(int L, int R) {
         return st.query(L, R, 1, m, 1);
      }

   }

   public static void main(String[] args) {
      int[] arr = { 1, 1, 2, 3 };
      Query q = new Query(arr);
      System.out.println(q.querySum(1, 3));
      System.out.println(q.queryAim(2, 4));
      System.out.println(q.queryMax(1, 4));
   }

}
```



# 颜色计算权值[[]]

```java
// 来自美团
// 有一棵树，给定头节点h，和结构数组m，下标0弃而不用
// 比如h = 1, m = [ [] , [2,3], [4], [5,6], [], [], []]
// 表示1的孩子是2、3; 2的孩子是4; 3的孩子是5、6; 4、5和6是叶节点，都不再有孩子
// 每一个节点都有颜色，记录在c数组里，比如c[i] = 4, 表示节点i的颜色为4
// 一开始只有叶节点是有权值的，记录在w数组里，
// 比如，如果一开始就有w[i] = 3, 表示节点i是叶节点、且权值是3
// 现在规定非叶节点i的权值计算方式：
// 根据i的所有直接孩子来计算，假设i的所有直接孩子，颜色只有a,b,k
// w[i] = Max {
//              (颜色为a的所有孩子个数 + 颜色为a的孩子权值之和), 
//              (颜色为b的所有孩子个数 + 颜色为b的孩子权值之和),
//              (颜色为k的所有孩子个数 + 颜色k的孩子权值之和)
//            }
// 请计算所有孩子的权值并返回
public class Code06_NodeWeight {

   // 当前来到h节点，
   // h的直接孩子，在哪呢？m[h] = {a,b,c,d,e}
   // 每个节点的颜色在哪？比如i号节点，c[i]就是i号节点的颜色
   // 每个节点的权值在哪？比如i号节点，w[i]就是i号节点的权值
   // void : 把w数组填满就是这个函数的目标
   public static void w(int h, int[][] m, int[] w, int[] c) {
      if (m[h].length == 0) { // 叶节点
         return;
      }
      // 在递归里面new是因为每个结点的colors 和 weihts 都不同
      // 有若干个直接孩子
      // 1 7个
      // 3 10个
      HashMap<Integer, Integer> colors = new HashMap<Integer, Integer>();
      // 1 20
      // 3 45
      HashMap<Integer, Integer> weihts = new HashMap<Integer, Integer>();
      for (int child : m[h]) {
         w(child, m, w, c);
         colors.put(c[child], colors.getOrDefault(c[child], 0) + 1);
         weihts.put(c[child], weihts.getOrDefault(c[child], 0) + w[c[child]]);
      }
      for (int color : colors.keySet()) {
         w[h] = Math.max(w[h], colors.get(color) + weihts.get(color));
      }
   }
}
```

# group by %m

```java
// 来自腾讯
// 给定一个单链表的头节点head，每个节点都有value(>0)，给定一个正数m
// value%m 的值一样的节点算一类
// 请把所有的类根据单链表的方式重新连接好，返回每一类的头节点
```

```java
public static class Node {
   public int value;
   public Node next;
}

public static class Ht {
   public Node h;
   public Node t;

   public Ht(Node a) {
      h = a;
      t = a;
   }
}

public static Node[] split(Node h, int m) {
   HashMap<Integer, Ht> map = new HashMap<>();
   while (h != null) {
      Node next = h.next;
      h.next = null;
      int mod = h.value % m;
      if (!map.containsKey(mod)) {
         map.put(mod, new Ht(h));
      } else {
         map.get(mod).t.next = h;
         map.get(mod).t = h;
      }
      h = next;
   }
   Node[] ans = new Node[m];
   for (int mod : map.keySet()) {
      ans[mod] = map.get(mod).h;
   }
   return ans;
}
```



# PickAndMax

```java
// 来自腾讯
// 给定一个数组arr，当拿走某个数a的时候，其他所有的数都+a
// 请返回最终所有数都拿走的最大分数
// 比如: [2,3,1]
// 当拿走3时，获得3分，数组变成[5,4]
// 当拿走5时，获得5分，数组变成[9]
// 当拿走9时，获得9分，数组变成[]
// 这是最大的拿取方式，返回总分17
```

```java
// 最优解
public static int pick(int[] arr) {
   Arrays.sort(arr);
   int ans = 0;
   for (int i = arr.length - 1; i >= 0; i--) {
      ans = (ans << 1) + arr[i];
   }
   return ans;
}
```

# MinBoat问题(腾讯)

搞两个数组 偶数组 奇数组 再调用原型

```java
// 来自腾讯
// 给定一个正数数组arr，代表每个人的体重。给定一个正数limit代表船的载重，所有船都是同样的载重量
// 每个人的体重都一定不大于船的载重
// 要求：
// 1, 可以1个人单独一搜船
// 2, 一艘船如果坐2人，两个人的体重相加需要是偶数，且总体重不能超过船的载重
// 3, 一艘船最多坐2人
// 返回如果想所有人同时坐船，船的最小数量

// this.class03 有原型题

//搞两个数组 偶数组 奇数组 再调用原型
public class Code09_MinBoatEvenNumbers {

   public static int minBoat(int[] arr, int limit) {
      Arrays.sort(arr);
      int odd = 0;
      int even = 0;
      for (int num : arr) {
         if ((num & 1) == 0) {
            even++;
         } else {
            odd++;
         }
      }
      int[] odds = new int[odd];
      int[] evens = new int[even];
      for (int i = arr.length - 1; i >= 0; i--) {
         if ((arr[i] & 1) == 0) {
            evens[--even] = arr[i];
         } else {
            odds[--odd] = arr[i];
         }
      }
      return min(odds, limit) + min(evens, limit);
   }

   public static int min(int[] arr, int limit) {
      if (arr == null || arr.length == 0) {
         return 0;
      }
      int N = arr.length;
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

}
```

# 最长递增子序列[[经典单调栈]]

```java
public static String maxString(String s, int k) {
   if (k <= 0 || s.length() < k) {
      return "";
   }
   char[] str = s.toCharArray();
   int n = str.length;
   char[] stack = new char[n];
   int size = 0;
   for (int i = 0; i < n; i++) {
      while (size > 0 && stack[size - 1] < str[i] && size + n - i > k) {
         size--;
      }
      if (size + n - i == k) {
         return String.valueOf(stack, 0, size) + s.substring(i);
      }
      stack[size++] = str[i];
   }
   return String.valueOf(stack, 0, k);
}
```

# 拿石子问题 通过该前后手 递归所有情况 来判断 最后动态规划[[动规]]

```java
// 来自哈喽单车
// 本题是leetcode原题 : https://leetcode.com/problems/stone-game-iv/
```

```java
// 返回 的:
// 当前的！先手，会不会赢
// 打表，不能发现规律
public static boolean winnerSquareGame1(int n) {
   if (n == 0) {
      return false;
   }
   // 当前的先手，会尝试所有的情况，1，4，9，16，25，36....
   for (int i = 1; i * i <= n; i++) {
      // 当前的先手，决定拿走 i * i 这个平方数
      // 它的对手会不会赢？ winnerSquareGame1(n - i * i)
      if (!winnerSquareGame1(n - i * i)) {
         return true;
      }
   }
   return false;
}

public static boolean winnerSquareGame2(int n) {
   int[] dp = new int[n + 1];
   dp[0] = -1;
   return process2(n, dp);
}

public static boolean process2(int n, int[] dp) {
   if (dp[n] != 0) {
      return dp[n] == 1 ? true : false;
   }
   boolean ans = false;
   for (int i = 1; i * i <= n; i++) {
      if (!process2(n - i * i, dp)) {
         ans = true;
         break;
      }
   }
   dp[n] = ans ? 1 : -1;
   return ans;
}

public static boolean winnerSquareGame3(int n) {
   boolean[] dp = new boolean[n + 1];
   for (int i = 1; i <= n; i++) {
      for (int j = 1; j * j <= i; j++) {
         if (!dp[i - j * j]) {
            dp[i] = true;
            break;
         }
      }
   }
   return dp[n];
}
```



# 车站路线[[BFS]]

宽度优先遍历  以公交线为单位 **BFS**

```java
import java.util.ArrayList;
import java.util.HashMap;
// 练习

// 来自三七互娱
// Leetcode原题 : https://leetcode.com/problems/bus-routes/

// 宽度优先遍历  以公交线为单位 BFS
public class Code12_BusRoutes {

   // 0 : [1,3,7,0]
   // 1 : [7,9,6,2]
   // ....
   // 返回：返回换乘几次+1 -> 返回一共坐了多少条线的公交。
   public static int numBusesToDestination(int[][] routes, int source, int target) {
      if (source == target) {
         return 0;
      }
      int n = routes.length;
      // key : 车站
      // value : list -> 该车站拥有哪些线路！
      //统计线路信息
      HashMap<Integer, ArrayList<Integer>> map = new HashMap<>();
      for (int i = 0; i < n; i++) {
         for (int j = 0; j < routes[i].length; j++) {
            if (!map.containsKey(routes[i][j])) {
               map.put(routes[i][j], new ArrayList<>());
            }
            map.get(routes[i][j]).add(i);
         }
      }
      // BFS -> 一次搞一层 队列形式BFS
      ArrayList<Integer> queue = new ArrayList<>();
      boolean[] set = new boolean[n];
      for (int route : map.get(source)) {
         queue.add(route);
         set[route] = true;// 防止重复
      }
      int len = 1;
      while (!queue.isEmpty()) {
         ArrayList<Integer> nextLevel = new ArrayList<>();
         for (int route : queue) { // 引出新路线 放入nextLevel里
            int[] bus = routes[route];// 把路线拿出来 用来遍历
            for (int station : bus) {
               if (station == target) {// 撞上target了 直接返回层数
                  return len;
               }
               for (int nextRoute : map.get(station)) {// 在map里拿 每个车站的有哪些线路经过
                  if (!set[nextRoute]) {// 这条没进过队列
                     nextLevel.add(nextRoute);// 注册进入
                     set[nextRoute] = true;// 加入队列 设置true
                  }
               }
            }
         }
         queue = nextLevel;
         len++;
      }
      return -1;
   }

}
```

