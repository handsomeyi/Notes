# 7.[整数反转](https://leetcode-cn.com/problems/reverse-integer)(防止溢出)

1. res结果是负数, 如果比系统最小/10 还小, 那么乘10之后必溢出

2. 如果res == m, 则乘10之后不溢出, 但是模出来的数x%/10如果系统最小模10, 则加上这部分必溢出
3. 因为负数可以兼顾正负两种情况, 所以可以通用!

```java
public static int reverse(int x) {
   boolean neg = ((x >>> 31) & 1) == 1;
   x = neg ? x : -x;
   int m = Integer.MIN_VALUE / 10;
   int o = Integer.MIN_VALUE % 10;
   int res = 0;
   while (x != 0) {
      if (res < m || (res == m && x % 10 < o)) {//某一种判断的时候 要多用到 短路或 拆分条件 性能更加优秀
         return 0;
      }
      res = res * 10 + x % 10;
      x /= 10;
   }
   return neg ? res : Math.abs(res);
}
```

# 8.[字符串转换整数](https://leetcode-cn.com/problems/string-to-integer-atoi) (atoi-溢出)

请你来实现一个 myAtoi(string s) 函数，使其能将字符串转换成一个 32 位有符号整数（类似 C/C++ 中的 atoi 函数）。

函数 myAtoi(string s) 的算法如下：

读入字符串并丢弃无用的前导空格
检查下一个字符（假设还未到字符末尾）为正还是负号，读取该字符（如果有）。 确定最终结果是负数还是正数。 如果两者都不存在，则假定结果为正。
读入下一个字符，直到到达下一个非数字字符或到达输入的结尾。字符串的其余部分将被忽略。
将前面步骤读入的这些数字转换为整数（即，"123" -> 123， "0032" -> 32）。如果没有读入数字，则整数为 0 。必要时更改符号（从步骤 2 开始）。
如果整数数超过 32 位有符号整数范围 [−231,  231 − 1] ，需要截断这个整数，使其保持在这个范围内。具体来说，小于 −231 的整数应该被固定为 −231 ，大于 231 − 1 的整数应该被固定为 231 − 1 。
返回整数作为最终结果。
链接：https://leetcode-cn.com/problems/string-to-integer-atoi

核心逻辑:

```java
public static int myAtoi(String s) {
   // str 是符合日常书写的，正经整数形式
   boolean posi = str[0] == '-' ? false : true;
   int minq = Integer.MIN_VALUE / 10;
   int minr = Integer.MIN_VALUE % 10;
   int res = 0;
   int cur = 0;
   for (int i = (str[0] == '-' || str[0] == '+') ? 1 : 0; i < str.length; i++) {
      // 3  cur = -3   '5'  cur = -5    '0' cur = 0
      cur = '0' - str[i];
      if ((res < minq) || (res == minq && cur < minr)) {
         return posi ? Integer.MAX_VALUE : Integer.MIN_VALUE;
      }
      res = res * 10 + cur;
   }
   // 数是整数 且res等于系统最小 就返回系统最大 还是溢出了
   if (posi && res == Integer.MIN_VALUE) {
      return Integer.MAX_VALUE;
   }
   return posi ? -res : res;
}
```



# 12.[整数转罗马数字](https://leetcode-cn.com/problems/integer-to-roman)

罗马数字包含以下七种字符： I， V， X， L，C，D 和 M。

字符          数值
I             1
V             5
X             10
L             50
C             100
D             500
M             1000
例如， 罗马数字 2 写做 II ，即为两个并列的 1。12 写做 XII ，即为 X + II 。 27 写做  XXVII, 即为 XX + V + II 。

通常情况下，罗马数字中小的数字在大的数字的右边。但也存在特例，例如 4 不写做 IIII，而是 IV。数字 1 在数字 5 的左边，所表示的数等于大数 5 减小数 1 得到的数值 4 。同样地，数字 9 表示为 IX。这个特殊的规则只适用于以下六种情况：

I 可以放在 V (5) 和 X (10) 的左边，来表示 4 和 9。
X 可以放在 L (50) 和 C (100) 的左边，来表示 40 和 90。 
C 可以放在 D (500) 和 M (1000) 的左边，来表示 400 和 900。
给你一个整数，将其转为罗马数字。
链接：https://leetcode-cn.com/problems/integer-to-roman

```java
public static String intToRoman(int num) {
		String[][] c = { 
				{ "", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX" },
				{ "", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC" },
				{ "", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM" },
				{ "", "M", "MM", "MMM" } };
		StringBuilder roman = new StringBuilder();
		roman
		.append(c[3][num / 1000 % 10])
		.append(c[2][num / 100 % 10])
		.append(c[1][num / 10 % 10])
		.append(c[0][num % 10]);
		return roman.toString();
	}
```

# 13.[罗马数字转整数](https://leetcode-cn.com/problems/roman-to-integer)

I             1
V             5
X             10
L             50
C             100
D             500
M             1000

直接遍历罗马数 如果比下一位小就是负当前数 否则就是本身

然后累加

```java
for (int i = 0; i < nums.length - 1; i++) {
			if (nums[i] < nums[i + 1]) {
				sum -= nums[i];
			} else {
				sum += nums[i];
			}
		}
```

# 14.最长公共前缀

编写一个函数来查找字符串数组中的最长公共前缀。

如果不存在公共前缀，返回空字符串 `""`。



直接一个一个看 如果不匹配就截断

```java
    public static String longestCommonPrefix(String[] strs) {
		if (strs == null || strs.length == 0) {
			return "";
		}
		char[] chs = strs[0].toCharArray();
		int min = Integer.MAX_VALUE;
		for (String str : strs) {
			char[] tmp = str.toCharArray();
			int index = 0;
			while (index < tmp.length && index < chs.length) {
				if (chs[index] != tmp[index]) {
					break;
				}
				index++;
			}
			min = Math.min(index, min);
			if (min == 0) {
				return "";
			}
		}
		return strs[0].substring(0, min);
	}
```

# 17.[电话号码的字母组合](https://leetcode-cn.com/problems/letter-combinations-of-a-phone-number)(前缀树-深度优先遍历)

给定一个仅包含数字 2-9 的字符串，返回所有它能表示的字母组合。答案可以按 任意顺序 返回。

给出数字到字母的映射如下（与电话按键相同）。注意 1 不对应任何字母。
链接：https://leetcode-cn.com/problems/letter-combinations-of-a-phone-number
![img](https://s2.loli.net/2021/12/23/ot9EOk4zyMuZewA.png)

```java
public static char[][] phone = { 
      { 'a', 'b', 'c' }, // 2    0
      { 'd', 'e', 'f' }, // 3    1
      { 'g', 'h', 'i' }, // 4    2
      { 'j', 'k', 'l' }, // 5    3
      { 'm', 'n', 'o' }, // 6    
      { 'p', 'q', 'r', 's' }, // 7 
      { 't', 'u', 'v' },   // 8
      { 'w', 'x', 'y', 'z' }, // 9
};

// "23"
public static List<String> letterCombinations(String digits) {
   List<String> ans = new ArrayList<>();
   if (digits == null || digits.length() == 0) {
      return ans;
   }
   char[] str = digits.toCharArray();
   char[] path = new char[str.length];
   process(str, 0, path, ans);
   return ans;
}
//深度优先遍历 收集沿途答案
public static void process(char[] str, int index, char[] path, List<String> ans) {
   if (index == str.length) {
      ans.add(String.valueOf(path));
   } else {
      char[] cands = phone[str[index] - '2'];
      for (char cur : cands) {
         path[index] = cur;
         process(str, index + 1, path, ans);
      }
   }
}
```

# 19.[删除链表的倒数第 N 个结点](https://leetcode-cn.com/problems/remove-nth-node-from-end-of-list/)(同步指针)

给你一个链表，删除链表的倒数第 `n` 个结点，并且返回链表的头结点。

![image-20211223133359840](https://s2.loli.net/2021/12/23/trhgpbuxQTomBzI.png)

```java
	public static class ListNode {
		public int val;
		public ListNode next;
	}
	public static ListNode removeNthFromEnd(ListNode head, int n) {
		ListNode cur = head;
		ListNode pre = null;
		while (cur != null) {
			n--;
			if (n == -1) {
				pre = head;
			}
			if (n < -1) {
				pre = pre.next;
			}
			cur = cur.next;
		}
		if (n > 0) {
			return head;
		}
		if (pre == null) {
			return head.next;
		}
		pre.next = pre.next.next;
		return head;
	}

```



# 20.[有效的括号](https://leetcode-cn.com/problems/valid-parentheses/)(辅助栈)

给定一个只包括 '('，')'，'{'，'}'，'['，']' 的字符串 s ，判断字符串是否有效。

有效字符串需满足：

- 左括号必须用相同类型的右括号闭合。
- 左括号必须以正确的顺序闭合。



左括号压栈

右括号弹出 匹配

匹配成功继续 匹配失败返回false

如果遍历完了 栈还得必须是空的 否则返回false

最后才返回true

![image-20211223134814774](https://s2.loli.net/2021/12/23/uQYkNVm1hegZWDK.png)



#### 用数组替代栈   int size代替栈大小

#### 数组替代HashMap 前提是范围确定 并且数小

```java
public static boolean isValid(String s) {
		if (s == null || s.length() == 0) {
			return true;
		}
		char[] str = s.toCharArray();
		int N = str.length;
		char[] stack = new char[N];
		int size = 0;
		for (int i = 0; i < N; i++) {
			char cha = str[i];
			if (cha == '(' || cha == '[' || cha == '{') {
				stack[size++] = cha == '(' ? ')' : (cha == '[' ? ']' : '}');
			} else {
				if (size == 0) {
					return false;
				}
				char last = stack[--size];
				if (cha != last) {
					return false;
				}
			}
		}
		return size == 0;
	}
```



# [22. 括号生成](https://leetcode-cn.com/problems/generate-parentheses/)(剪枝练习)

#### 保证所有分支尽可能在中间过程判断剪枝,保证递归效率



数字 `n` 代表生成括号的对数，请你设计一个函数，用于能够生成所有可能的并且 **有效的** 括号组合。

```java
	public static List<String> generateParenthesis(int n) {
		char[] path = new char[n << 1];
		List<String> ans = new ArrayList<>();
		process(path, 0, 0, n, ans);
		return ans;
	}
	// path 做的决定  path[0....index-1]做完决定的！
	// path[index.....] 还没做决定，当前轮到index位置做决定！
	public static void process(char[] path, int index, int leftMinusRight, int leftRest, List<String> ans) {
		if (index == path.length) {
			ans.add(String.valueOf(path));//剪枝剪得好直接返回字符 不用判断
		} else {
			// index (   )
			if (leftRest > 0) {
				path[index] = '(';
				process(path, index + 1, leftMinusRight + 1, leftRest - 1, ans);
			}
			if (leftMinusRight > 0) {
				path[index] = ')';
				process(path, index + 1, leftMinusRight - 1, leftRest, ans);
			}
		}
	}
```

# [26. 删除有序数组中的重复项](https://leetcode-cn.com/problems/remove-duplicates-from-sorted-array/)(双指针)

```java
public static int removeDuplicates(int[] nums) {
		if (nums == null) {
			return 0;
		}
		if (nums.length < 2) {
			return nums.length;
		}
		int done = 0;
		for (int i = 1; i < nums.length; i++) {
			if (nums[i] != nums[done]) {
				nums[++done] = nums[i];
			}
		}
		return done + 1;
	}
```

# [33. 搜索旋转排序数组](https://leetcode-cn.com/problems/search-in-rotated-sorted-array/)(旋转数组-二分变种-面试向)

有序数组 左右互相交换了一下, 求target的位置.



很多情况下 对有序数组稍微修改过后

依然能使用二分法, 只是控制条件更多, 更复杂一些而已

就是考察你的分析能力, 

```java
// arr，原本是有序数组，旋转过，而且左部分长度不知道
// 找num
// num所在的位置返回
public static int search(int[] arr, int num) {
   int L = 0;
   int R = arr.length - 1;
   int M = 0;
   while (L <= R) {
      // M = L + ((R - L) >> 1)
      M = (L + R) / 2;
      if (arr[M] == num) {
         return M;
      }
      // arr[M] != num
      // [L] == [M] == [R] != num 无法二分
      if (arr[L] == arr[M] && arr[M] == arr[R]) {
         while (L != M && arr[L] == arr[M]) {
            L++;
         }
         // 1) L == M L...M 一路都相等
         // 2) 从L到M终于找到了一个不等的位置
         if (L == M) { // L...M 一路都相等
            L = M + 1;
            continue;
         }
      }
      // ...
      // arr[M] != num
      // [L] [M] [R] 不都一样的情况, 如何二分的逻辑
      if (arr[L] != arr[M]) {
         //如果 2, 3, 4, 5, 7, 1, 1, 1, 1;
         //    L          M            R
         if (arr[M] > arr[L]) { // L...M 一定有序  断点一定在右侧
            if (num >= arr[L] && num < arr[M]) { //  3  [L] == 1    [M]   = 5   L...M - 1
               R = M - 1;
            } else { // 9    [L] == 2    [M]   =  7   M... R
               L = M + 1;
            }
         } else { // [L] > [M]    L....M  存在断点
            if (num > arr[M] && num <= arr[R]) {
               L = M + 1;
            } else {
               R = M - 1;
            }
         }
      } else { /// [L] [M] [R] 不都一样，  [L] === [M] -> [M]!=[R]
         if (arr[M] < arr[R]) {
            if (num > arr[M] && num <= arr[R]) {
               L = M + 1;
            } else {
               R = M - 1;
            }
         } else {
            if (num >= arr[L] && num < arr[M]) {
               R = M - 1;
            } else {
               L = M + 1;
            }
         }
      }
   }
   return -1;
}
```











# [34. 在排序数组中查找元素的第一个和最后一个位置](https://leetcode-cn.com/problems/find-first-and-last-position-of-element-in-sorted-array/)(二分法)

一个有序数组中找到

小于等于num的最右的位置

和大于等于一个num最左的位置

```java
	public static int[] searchRange(int[] nums, int target) {
		if (nums == null || nums.length == 0) {
			return new int[] { -1, -1 };
		}
		int L = lessMostRight(nums, target) + 1;
		if (L == nums.length || nums[L] != target) {
			return new int[] { -1, -1 };
		}
		return new int[] { L, lessMostRight(nums, target + 1) };
	}

	public static int lessMostRight(int[] arr, int num) {
		int L = 0;
		int R = arr.length - 1;
		int M = 0;
		int ans = -1;
		while (L <= R) {
			M = L + ((R - L) >> 1);
			if (arr[M] < num) {
				ans = M;
				L = M + 1;
			} else {
				R = M - 1;
			}
		}
		return ans;
	}
```

# [36. 有效的数独](https://leetcode-cn.com/problems/valid-sudoku/)

请你判断一个 9 x 9 的数独是否有效。只需要 根据以下规则 ，验证已经填入的数字是否有效即可。

数字 1-9 在每一行只能出现一次。
数字 1-9 在每一列只能出现一次。
数字 1-9 在每一个以粗实线分隔的 3x3 宫内只能出现一次。（请参考示例图）


注意：

一个有效的数独（部分已被填充）不一定是可解的。
只需要根据以上规则，验证已经填入的数字是否有效即可。
空白格用 '.' 表示。

![img](https://s2.loli.net/2021/12/23/769uNQrShw8UF4X.png)





如何记录重复与否?

```java
	//定义9行 9列 9桶  i行是否出现数j?
		boolean[][] row = new boolean[9][10];
		boolean[][] col = new boolean[9][10];
		boolean[][] bucket = new boolean[9][10];
```

```java
public static boolean isValidSudoku(char[][] board) {
   boolean[][] row = new boolean[9][10];
   boolean[][] col = new boolean[9][10];
   boolean[][] bucket = new boolean[9][10];
   for (int i = 0; i < 9; i++) {
      for (int j = 0; j < 9; j++) {
         int bid = 3 * (i / 3) + (j / 3);//观察通过行列规律得到桶数
         if (board[i][j] != '.') {
            int num = board[i][j] - '0';
            if (row[i][num] || col[j][num] || bucket[bid][num]) {
               return false;
            }
            row[i][num] = true;
            col[j][num] = true;
            bucket[bid][num] = true;
         }
      }
   }
   return true;
}
```



# [37. 解数独](https://leetcode-cn.com/problems/sudoku-solver/)(hard-递归)

1. 生成三个信息如下 初始化三个表

```java
public static void solveSudoku(char[][] board) {
		boolean[][] row = new boolean[9][10];
		boolean[][] col = new boolean[9][10];
		boolean[][] bucket = new boolean[9][10];
		initMaps(board, row, col, bucket);
		process(board, 0, 0, row, col, bucket);
}

	public static void initMaps(char[][] board, boolean[][] row, boolean[][] col, boolean[][] bucket) {
		for (int i = 0; i < 9; i++) {
			for (int j = 0; j < 9; j++) {
				int bid = 3 * (i / 3) + (j / 3);
				if (board[i][j] != '.') {
					int num = board[i][j] - '0';
					row[i][num] = true;
					col[j][num] = true;
					bucket[bid][num] = true;
				}
			}
		}
	}
```

2. 一个一个位置玩深度优先遍历

```java
	//  当前来到(i,j)这个位置，如果已经有数字，跳到下一个位置上
	//                      如果没有数字，尝试1~9，不能和row、col、bucket冲突
public static boolean process(char[][] board, int i, int j, boolean[][] row,boolean[][] col, boolean[][] bucket) {
   if (i == 9) {//i到了终止位置
      return true;
   }
   // 当离开(i，j)，应该去哪？(nexti, nextj)
   	int nexti = j != 8 ? i : i + 1;//列数j到了8 行数i++
	int nextj = j != 8 ? j + 1 : 0;//列数j到了8 列数j重置 到了下一行的0
//   	int nexti = j == 8 ? i + 1 : i;//列数j到了8 行数i++
//   	int nextj = j == 8 ? 0 : j + 1;//列数j到了8 列数j重置 到了下一行的0
   if (board[i][j] != '.') {
      return process(board, nexti, nextj, row, col, bucket);
   } else {
      // 可以尝试1~9
      int bid = 3 * (i / 3) + (j / 3);
      for (int num = 1; num <= 9; num++) { // 尝试每一个数字1~9
         if ((!row[i][num]) && (!col[j][num]) && (!bucket[bid][num])) {
            // 可以尝试num
            row[i][num] = true;
            col[j][num] = true;
            bucket[bid][num] = true;
            board[i][j] = (char) (num + '0');
            if (process(board, nexti, nextj, row, col, bucket)) {
               return true;
            }
             //恢复现场
            row[i][num] = false;
            col[j][num] = false;
            bucket[bid][num] = false;
            board[i][j] = '.';
         }
      }
      return false;
   }
}
```



# [38. 外观数列](https://leetcode-cn.com/problems/count-and-say/)(👎)

```java
public static String countAndSay(int n) {
		if (n < 1) {
			return "";
		}
		if (n == 1) {
			return "1";
		}
		char[] last = countAndSay(n - 1).toCharArray();
		StringBuilder ans = new StringBuilder();
		int times = 1;
		for (int i = 1; i < last.length; i++) {
			if (last[i - 1] == last[i]) {
				times++;
			} else {
				ans.append(String.valueOf(times));
				ans.append(String.valueOf(last[i - 1]));
				times = 1;
			}
		}
		ans.append(String.valueOf(times));
		ans.append(String.valueOf(last[last.length - 1]));
		return ans.toString();
	}  vvvfm,
```

# [49. 字母异位词分组](https://leetcode-cn.com/problems/group-anagrams/)(HashMap的使用方式)

给你一个字符串数组，请你将 字母异位词 组合在一起。可以按任意顺序返回结果列表。

字母异位词 是由重新排列源单词的字母得到的一个新单词，所有源单词中的字母通常恰好只用一次。

- 法1°  排序放入 HashMap

- 法2° int[]记录词频 然后判断

```java
public static List<List<String>> groupAnagrams1(String[] strs) {
   HashMap<String, List<String>> map = new HashMap<String, List<String>>();
   for (String str : strs) {
      int[] record = new int[26];
      for (char cha : str.toCharArray()) {
         record[cha - 'a']++;
      }
      StringBuilder builder = new StringBuilder();
      for (int value : record) {
         builder.append(String.valueOf(value)).append("_");
      }
      String key = builder.toString();
      if (!map.containsKey(key)) {
         map.put(key, new ArrayList<String>());
      }
      map.get(key).add(str);
   }
   List<List<String>> res = new ArrayList<List<String>>();
   for (List<String> list : map.values()) {
      res.add(list);
   }
   return res;
}

public static List<List<String>> groupAnagrams2(String[] strs) {
   HashMap<String, List<String>> map = new HashMap<String, List<String>>();
   for (String str : strs) {
      char[] chs = str.toCharArray();
      Arrays.sort(chs);
      String key = String.valueOf(chs);
      if (!map.containsKey(key)) {
         map.put(key, new ArrayList<String>());
      }
      map.get(key).add(str);
   }
   List<List<String>> res = new ArrayList<List<String>>();
   for (List<String> list : map.values()) {
      res.add(list);
   }
   return res;
}
```

# [50. Pow(x, n)](https://leetcode-cn.com/problems/powx-n/)(快速幂)

- 如果n小于0 则先算正数 然后用1除

- 如果n为Integer.MIN_VALUE  则用Integer.MAX_VALUE算 然后再乘一次底数  然后再用1除

```java
public static int pow(int a, int n) {
   int ans = 1;
   int t = a;
   while (n != 0) {
      if ((n & 1) != 0) {
         ans *= t;
      }
      t *= t;
      n >>= 1;
   }
   return ans;
}

// x的n次方，n可能是负数
public static double myPow(double x, int n) {
   if (n == 0) {
      return 1D;
   }
   int pow = Math.abs(n == Integer.MIN_VALUE ? n + 1 : n);
   double t = x;
   double ans = 1D;
   while (pow != 0) {
      if ((pow & 1) != 0) {
         ans *= t;
      }
      pow >>= 1;
      t = t * t;
   }
   if (n == Integer.MIN_VALUE) {
      ans *= x;
   }
   return n < 0 ? (1D / ans) : ans;
}
```

# [56. 合并区间](https://leetcode-cn.com/problems/merge-intervals/)(Lambda)

```java
public static int[][] merge(int[][] intervals) {
   if (intervals.length == 0) {
      return new int[0][0];
   }
   Arrays.sort(intervals, (a, b) -> a[0] - b[0]);
   int start = intervals[0][0];
   int end = intervals[0][1];
   int size = 0;
   for (int i = 1; i < intervals.length; i++) {
      if (intervals[i][0] > end) {
         intervals[size][0] = start;
         intervals[size++][1] = end;
         start = intervals[i][0];
         end = intervals[i][1];
      } else {
         end = Math.max(end, intervals[i][1]);
      }
   }
   intervals[size][0] = start;
   intervals[size++][1] = end;
   return Arrays.copyOf(intervals, size);
}
```

# [62. 不同路径](https://leetcode-cn.com/problems/unique-paths/)(动态规划-防止溢出)

一个机器人位于一个 m x n 网格的左上角 （起始点在下图中标记为 “Start” ）。

机器人每次只能向下或者向右移动一步。机器人试图达到网格的右下角（在下图中标记为 “Finish” ）。

问总共有多少条不同的路径？

- 法1° 动态规划

  ```java
  class Solution {
      public int uniquePaths(int m, int n) {
          int[] cur = new int[n];
          Arrays.fill(cur,1);
          for (int i = 1; i < m;i++){
              for (int j = 1; j < n; j++){
                  cur[j] += cur[j-1] ;
              }
          }
          return cur[n-1];
      }
  }
  ```

- 法2° 数学排列组合 C 

  ```java
  public static int uniquePaths(int m, int n) {
  		int right = n - 1;
  		int all = m + n - 2;
  		//分子分母先列出来
  		long o1 = 1;
  		long o2 = 1;
  		// o1乘进去的个数 一定等于 o2乘进去的个数
  		for (int i = right + 1, j = 1; i <= all; i++, j++) {
  			o1 *= i;
  			o2 *= j;
  			long gcd = gcd(o1, o2);
  			o1 /= gcd;
  			o2 /= gcd;
  		}
  		return (int) o1;
  	}
  	// 调用的时候，请保证初次调用时，m和n都不为0
  	public static long gcd(long m, long n) {
  		return n == 0 ? m : gcd(n, m % n);
  	}
  ```

  

# [66. 加一](https://leetcode-cn.com/problems/plus-one/)(精妙的进位判断-easy)

给定一个由 整数 组成的 非空 数组所表示的非负整数，在该数的基础上加一。

最高位数字存放在数组的首位， 数组中每个元素只存储单个数字。

你可以假设除了整数 0 之外，这个整数不会以零开头。

```java
public static int[] plusOne(int[] digits) {
   int n = digits.length;
   for (int i = n - 1; i >= 0; i--) {
       //精妙的进位判断
      if (digits[i] < 9) {
         digits[i]++;
         return digits;
      }
      digits[i] = 0;
   }
   int[] ans = new int[n + 1];
   ans[0] = 1;
   return ans;
}
```



# [69. Sqrt(x)](https://leetcode-cn.com/problems/sqrtx/)(求平方根-二分法)

```java
// x一定非负，输入可以保证
public static int mySqrt(int x) {
   if (x == 0) {
      return 0;
   }
   if (x < 3) {
      return 1;
   }
   // x >= 3
   long ans = 1;
   long L = 1;
   long R = x;
   long M = 0;
   while (L <= R) {
      M = (L + R) / 2;
      if (M * M <= x) {
         ans = M;
         L = M + 1;
      } else {
         R = M - 1;
      }
   }
   return (int) ans;
}
```

#### 进阶-求小数点后几位

例如求后四位 根号下10

先二分得出整数位

3.0000 ~ 3.9999 之间再二分

就是0000 ~ 9999之间试 

例如试4999

用的就是3.4999*3.4999 与 10 比大小 然后二分



# [73. 矩阵置零](https://leetcode-cn.com/problems/set-matrix-zeroes/)

给定一个 `*m* x *n*` 的矩阵，如果一个元素为 **0** ，则将其所在行和列的所有元素都设为 **0** 。请使用 **[原地](http://baike.baidu.com/item/原地算法)** 算法**。**

![image-20211224103429642](https://s2.loli.net/2021/12/24/Pr6dInDQHmN7SWT.png)

```java
/////////////////////////////////////////法1°/////////////////////////////////////////
public static void setZeroes1(int[][] matrix) {
		boolean row0Zero = false;
		boolean col0Zero = false;
		int i = 0;
		int j = 0;
		for (i = 0; i < matrix[0].length; i++) {
			if (matrix[0][i] == 0) {
				row0Zero = true;
				break;
			}
		}
		for (i = 0; i < matrix.length; i++) {
			if (matrix[i][0] == 0) {
				col0Zero = true;
				break;
			}
		}
		for (i = 1; i < matrix.length; i++) {
			for (j = 1; j < matrix[0].length; j++) {
				if (matrix[i][j] == 0) {
					matrix[i][0] = 0;
					matrix[0][j] = 0;
				}
			}
		}
		for (i = 1; i < matrix.length; i++) {
			for (j = 1; j < matrix[0].length; j++) {
				if (matrix[i][0] == 0 || matrix[0][j] == 0) {
					matrix[i][j] = 0;
				}
			}
		}
		if (row0Zero) {
			for (i = 0; i < matrix[0].length; i++) {
				matrix[0][i] = 0;
			}
		}
		if (col0Zero) {
			for (i = 0; i < matrix.length; i++) {
				matrix[i][0] = 0;
			}
		}
	}
/////////////////////////////////////////法2°/////////////////////////////////////////
public static void setZeroes2(int[][] matrix) {
   boolean col0 = false;//第0列是否要变0
   int i = 0;
   int j = 0;
   for (i = 0; i < matrix.length; i++) {
      for (j = 0; j < matrix[0].length; j++) {
         if (matrix[i][j] == 0) {
            matrix[i][0] = 0;
            if (j == 0) {
               col0 = true;
            } else {
               matrix[0][j] = 0;
            }
         }
      }
   }
   for (i = matrix.length - 1; i >= 0; i--) {
      for (j = 1; j < matrix[0].length; j++) {
         if (matrix[i][0] == 0 || matrix[0][j] == 0) {
            matrix[i][j] = 0;
         }
      }
   }
   if (col0) {
      for (i = 0; i < matrix.length; i++) {
         matrix[i][0] = 0;
      }
   }
}
```



# [79. 单词搜索](https://leetcode-cn.com/problems/word-search/)

m×n的字母表格中不回头找单词

![img](https://s2.loli.net/2021/12/24/HZn1soIgd8qlMDR.jpg)





# [88. 合并两个有序数组](https://leetcode-cn.com/problems/merge-sorted-array/)(重要-谁大拷贝谁到尾部)

两个指针向左移动

![image-20211224115156118](https://s2.loli.net/2021/12/24/OwNt23PRThJzv47.png)

```java
public static void merge(int[] nums1, int m, int[] nums2, int n) {
   int index = nums1.length;
   while (m > 0 && n > 0) {
      if (nums1[m - 1] >= nums2[n - 1]) {
         nums1[--index] = nums1[--m];
      } else {
         nums1[--index] = nums2[--n];
      }
   }
   while (m > 0) {
      nums1[--index] = nums1[--m];
   }
   while (n > 0) {
      nums1[--index] = nums2[--n];
   }
}
```

# [91. 解码方法](https://leetcode-cn.com/problems/decode-ways/)

一条包含字母 A-Z 的消息通过以下映射进行了 编码 ：

'A' -> 1
'B' -> 2
...
'Z' -> 26
要 解码 已编码的消息，所有数字必须基于上述映射的方法，反向映射回字母（可能有多种方法）。例如，"11106" 可以映射为：

"AAJF" ，将消息分组为 (1 1 10 6)
"KJF" ，将消息分组为 (11 10 6)
注意，消息不能分组为  (1 11 06) ，因为 "06" 不能映射为 "F" ，这是由于 "6" 和 "06" 在映射中并不等价。

给你一个只含数字的 非空 字符串 s ，请计算并返回 解码 方法的 总数 。

题目数据保证答案肯定是一个 32 位 的整数。

#### [639. 解码方法 II](https://leetcode-cn.com/problems/decode-ways-ii/)(分类讨论练习-进阶)

有通配符 * = 1 ~ 9 返回可能种数

# [98. 验证二叉搜索树](https://leetcode-cn.com/problems/validate-binary-search-tree/)(Morris遍历 不快 但是省空间)

- 普通笔试用递归即可 ==**耗费系统栈空间**==

```java
    public boolean isValidBST(TreeNode root) {
        return isValidBST(root, Long.MIN_VALUE, Long.MAX_VALUE);
    }

    public boolean isValidBST(TreeNode node, long lower, long upper) {
        if (node == null) {
            return true;
        }
        if (node.val <= lower || node.val >= upper) {
            return false;
        }
        return isValidBST(node.left, lower, node.val) && isValidBST(node.right, node.val, upper);
    }
```

- 面试可以提及Morris遍历: **==利用叶子节点空闲指针来遍历 省的是系统栈空间==**

```java
    public boolean isValidBST(TreeNode root) {
      if (root == null) {
         return true;
      }
      TreeNode cur = root;
      TreeNode mostRight = null;
      Integer pre = null;
      boolean ans = true;
      while (cur != null) {
         mostRight = cur.left;
         if (mostRight != null) {
            while (mostRight.right != null && mostRight.right != cur) {
               mostRight = mostRight.right;
            }
            if (mostRight.right == null) {
               mostRight.right = cur;
               cur = cur.left;
               continue;
            } else {
               mostRight.right = null;
            }
         }
         if (pre != null && pre >= cur.val) {
            ans = false;
         }
         pre = cur.val;
         cur = cur.right;
      }
      return ans;
   }

}
```



# [101. 判断对称二叉树](https://leetcode-cn.com/problems/symmetric-tree/)(递归和迭代两种方法)

- 递归方式 (==优美的递归函数==)

```java
public static class TreeNode {
   int val;
   TreeNode left;
   TreeNode right;
}
public boolean isSymmetric(TreeNode root) {
   return isMirror(root, root);
}
// 一棵树是原始树  head1
// 另一棵是翻面树  head2
public static boolean isMirror(TreeNode head1, TreeNode head2) {
   if (head1 == null && head2 == null) {
      return true;
   }
   if (head1 != null && head2 != null) {
      return head1.val == head2.val //先判断当前节点值
            && isMirror(head1.left, head2.right) //
            && isMirror(head1.right, head2.left);
   }
   // 一个为空，一个不为空  false
   return false;
}
```

- 迭代方式

???

# [103. 二叉树的锯齿形层序遍历](https://leetcode-cn.com/problems/binary-tree-zigzag-level-order-traversal/)

#### 利用队列层次遍历 (宽度优先遍历)

每次记录size 弹出就把孩子加入队列

这一层弹完了 再次记录size

开始弹下一层



本题修改一下条件就行啦!

```java
public static List<List<Integer>> zigzagLevelOrder(TreeNode root) {
   List<List<Integer>> ans = new ArrayList<>();
   if (root == null) {
      return ans;
   }
   LinkedList<TreeNode> deque = new LinkedList<>();
   deque.add(root);
   int size = 0;
   boolean isHead = true;
   while (!deque.isEmpty()) {
      size = deque.size();
      List<Integer> curLevel = new ArrayList<>();
      for (int i = 0; i < size; i++) {
         TreeNode cur = isHead ? deque.pollFirst() : deque.pollLast();
         curLevel.add(cur.val);
         if(isHead) {
            if (cur.left != null) {
               deque.addLast(cur.left);
            }
            if (cur.right != null) {
               deque.addLast(cur.right);
            }
         }else {
            if (cur.right != null) {
               deque.addFirst(cur.right);
            }
            if (cur.left != null) {
               deque.addFirst(cur.left);
            }
         }
      }
      ans.add(curLevel);
      isHead = !isHead;
   }
   return ans;
}
```

# [108. 将有序数组转换为二叉搜索树](https://leetcode-cn.com/problems/convert-sorted-array-to-binary-search-tree/)

```java
public TreeNode sortedArrayToBST(int[] nums) {
   return process(nums, 0, nums.length - 1);
}

public static TreeNode process(int[] nums, int L, int R) {
   if (L > R) {
      return null;
   }
   if (L == R) {
      return new TreeNode(nums[L]);
   }
   int M = (L + R) / 2;
   TreeNode head = new TreeNode(nums[M]);
   head.left = process(nums, L, M - 1);
   head.right = process(nums, M + 1, R);
   return head;
}
```





# 114. 二叉树展开为链表[[二叉树递归套路]]

[114. 二叉树展开为链表](https://leetcode-cn.com/problems/flatten-binary-tree-to-linked-list/)

给你二叉树的根结点 root ，请你将它展开为一个单链表：

展开后的单链表应该同样使用 TreeNode ，其中 right 子指针指向链表中下一个结点，而左子指针始终为 null 。
展开后的单链表应该与二叉树 先序遍历 顺序相同。













# [116. 填充每个节点的下一个右侧节点指针](https://leetcode-cn.com/problems/populating-next-right-pointers-in-each-node/)(利用条件当队列)

给定一个 完美二叉树 ，其所有叶子节点都在同一层，每个父节点都有两个子节点。
填充它的每个 next 指针，让这个指针指向其下一个右侧节点。如果找不到下一个右侧节点，则将 next 指针设置为 NULL。

初始状态下，所有 next 指针都被设置为 NULL。

进阶：

你只能使用常量级额外空间。
使用递归解题也符合要求，本题中递归程序占用的栈空间不算做额外的空间复杂度。

```java
public static class Node {
   public int val;
   public Node left;
   public Node right;
   public Node next;
}

// 提交下面的代码
public static Node connect(Node root) {
   if (root == null) {
      return root;
   }
   MyQueue queue = new MyQueue();
   queue.offer(root);
   while (!queue.isEmpty()) {
      // 第一个弹出的节点
      Node pre = null;
      int size = queue.size;
      for (int i = 0; i < size; i++) {
         Node cur = queue.poll();
         if (cur.left != null) {
            queue.offer(cur.left);
         }
         if (cur.right != null) {
            queue.offer(cur.right);
         }
         if (pre != null) {//如果pre有节点  则  pre.next 向右连接
            pre.next = cur;
         }
         pre = cur;
      }
   }
   return root;
}

public static class MyQueue {
   public Node head;
   public Node tail;
   public int size;

   public MyQueue() {
      head = null;
      tail = null;
      size = 0;
   }

   public boolean isEmpty() {
      return size == 0;
   }

   public void offer(Node cur) {
      size++;
      if (head == null) {
         head = cur;
         tail = cur;
      } else {
         tail.next = cur;
         tail = cur;
      }
   }

   public Node poll() {
      size--;
      Node ans = head;
      head = head.next;
      ans.next = null;
      return ans;
   }

}
```

#### [118. 杨辉三角](https://leetcode-cn.com/problems/pascals-triangle/)(生成返回)

<img src="https://s2.loli.net/2021/12/24/P1nmgaRhYGbBX8q.png" alt="image-20211224154911767" style="zoom: 50%;" />

```java
public static List<List<Integer>> generate(int numRows) {
   List<List<Integer>> ans = new ArrayList<>();
   for (int i = 0; i < numRows; i++) {
      ans.add(new ArrayList<>());
      ans.get(i).add(1);//第一个一定是1
   }
   for (int i = 1; i < numRows; i++) {
      for (int j = 1; j < i; j++) {
         ans.get(i).add(ans.get(i - 1).get(j - 1) + ans.get(i - 1).get(j));//左上角值 + 上面值
      }
      ans.get(i).add(1);//最后的一定是1
   }
   return ans;
}
```



#### 给定n，返回「杨辉三角」的第n行(数组压缩技巧 原地更新)

 要求: 空间O(n) 



```java
必须倒着来,从右往左  因为要求的是左上角数据  和上面数据    
public List<Integer> getRow(int rowIndex) {
    List<Integer> ans = new ArrayList<>();
    for (int i = 0; i <= rowIndex; i++) {
        for (int j = i - 1; j > 0; j--) {
            ans.set(j, ans.get(j - 1) + ans.get(j));
        }
        ans.add(1);
    }
    return ans;
}
```

![image-20211226163607446](https://s2.loli.net/2021/12/26/z3HWidnpoDmwGvy.png)



# [124. 二叉树中的最大路径](https://leetcode-cn.com/problems/binary-tree-maximum-path-sum/)

```java
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
// follow up : 如果要求返回整个路径怎么做？
public class Problem_0124_BinaryTreeMaximumPathSum {
   public static class TreeNode {
      int val;
      TreeNode left;
      TreeNode right;
      public TreeNode(int v) {
         val = v;
      }
   }
   public static int maxPathSum(TreeNode root) {
      if (root == null) {
         return 0;
      }
      return process(root).maxPathSum;
   }
   // 任何一棵树，必须汇报上来的信息
   public static class Info {
      public int maxPathSum;
      public int maxPathSumFromHead;
      public Info(int path, int head) {
         maxPathSum = path;
         maxPathSumFromHead = head;
      }
   }
   public static Info process(TreeNode x) {
      if (x == null) {
         return null;
      }
      Info leftInfo = process(x.left);
      Info rightInfo = process(x.right);
      // x 1)只有x 2）x往左扎 3）x往右扎
      int maxPathSumFromHead = x.val;
      if (leftInfo != null) {
         maxPathSumFromHead = Math.max(maxPathSumFromHead, x.val + leftInfo.maxPathSumFromHead);
      }
      if (rightInfo != null) {
         maxPathSumFromHead = Math.max(maxPathSumFromHead, x.val + rightInfo.maxPathSumFromHead);
      }
      // x整棵树最大路径和 1) 只有x 2)左树整体的最大路径和 3) 右树整体的最大路径和
      int maxPathSum = x.val;
      if (leftInfo != null) {
         maxPathSum = Math.max(maxPathSum, leftInfo.maxPathSum);
      }
      if (rightInfo != null) {
         maxPathSum = Math.max(maxPathSum, rightInfo.maxPathSum);
      }
      // 4) x只往左扎 5）x只往右扎
      maxPathSum = Math.max(maxPathSumFromHead, maxPathSum);
      // 6）一起扎
      if (leftInfo != null && rightInfo != null && leftInfo.maxPathSumFromHead > 0
            && rightInfo.maxPathSumFromHead > 0) {
         maxPathSum = Math.max(maxPathSum, leftInfo.maxPathSumFromHead + rightInfo.maxPathSumFromHead + x.val);
      }
      return new Info(maxPathSum, maxPathSumFromHead);
   }
   // 如果要返回路径的做法
   public static List<TreeNode> getMaxSumPath(TreeNode head) {
      List<TreeNode> ans = new ArrayList<>();
      if (head != null) {
         Data data = f(head);
         HashMap<TreeNode, TreeNode> fmap = new HashMap<>();
         fmap.put(head, head);
         fatherMap(head, fmap);
         fillPath(fmap, data.from, data.to, ans);
      }
      return ans;
   }
   public static class Data {
      public int maxAllSum;
      public TreeNode from;
      public TreeNode to;
      public int maxHeadSum;
      public TreeNode end;
      public Data(int a, TreeNode b, TreeNode c, int d, TreeNode e) {
         maxAllSum = a;
         from = b;
         to = c;
         maxHeadSum = d;
         end = e;
      }
   }
   public static Data f(TreeNode x) {
      if (x == null) {
         return null;
      }
      Data l = f(x.left);
      Data r = f(x.right);
      int maxHeadSum = x.val;
      TreeNode end = x;
      //往左或往右扎
      if (l != null && l.maxHeadSum > 0 && (r == null || l.maxHeadSum > r.maxHeadSum)) {
         maxHeadSum += l.maxHeadSum;
         end = l.end;
      }
      if (r != null && r.maxHeadSum > 0 && (l == null || r.maxHeadSum > l.maxHeadSum)) {
         maxHeadSum += r.maxHeadSum;
         end = r.end;
      }
      int maxAllSum = Integer.MIN_VALUE;
      TreeNode from = null;
      TreeNode to = null;
      if (l != null) {
         maxAllSum = l.maxAllSum;
         from = l.from;
         to = l.to;
      }
      if (r != null && r.maxAllSum > maxAllSum) {
         maxAllSum = r.maxAllSum;
         from = r.from;
         to = r.to;
      }
      int p3 = x.val + (l != null && l.maxHeadSum > 0 ? l.maxHeadSum : 0)
            + (r != null && r.maxHeadSum > 0 ? r.maxHeadSum : 0);
      if (p3 > maxAllSum) {
         maxAllSum = p3;
         from = (l != null && l.maxHeadSum > 0) ? l.end : x;
         to = (r != null && r.maxHeadSum > 0) ? r.end : x;
      }
      return new Data(maxAllSum, from, to, maxHeadSum, end);
   }
   public static void fatherMap(TreeNode h, HashMap<TreeNode, TreeNode> map) {
      if (h.left == null && h.right == null) {
         return;
      }
      if (h.left != null) {
         map.put(h.left, h);
         fatherMap(h.left, map);
      }
      if (h.right != null) {
         map.put(h.right, h);
         fatherMap(h.right, map);
      }
   }
   public static void fillPath(HashMap<TreeNode, TreeNode> fmap, TreeNode a, TreeNode b, List<TreeNode> ans) {
      if (a == b) {
         ans.add(a);
      } else {
         HashSet<TreeNode> ap = new HashSet<>();
         TreeNode cur = a;
         while (cur != fmap.get(cur)) {
            ap.add(cur);
            cur = fmap.get(cur);
         }
         ap.add(cur);
         cur = b;
         TreeNode lca = null;
         while (lca == null) {
            if (ap.contains(cur)) {
               lca = cur;
            } else {
               cur = fmap.get(cur);
            }
         }
         while (a != lca) {
            ans.add(a);
            a = fmap.get(a);
         }
         ans.add(lca);
         ArrayList<TreeNode> right = new ArrayList<>();
         while (b != lca) {
            right.add(b);
            b = fmap.get(b);
         }
         for (int i = right.size() - 1; i >= 0; i--) {
            ans.add(right.get(i));
         }
      }
   }
   public static void main(String[] args) {
      TreeNode head = new TreeNode(4);
      head.left = new TreeNode(-7);
      head.right = new TreeNode(-5);
      head.left.left = new TreeNode(9);
      head.left.right = new TreeNode(9);
      head.right.left = new TreeNode(4);
      head.right.right = new TreeNode(3);
      List<TreeNode> maxPath = getMaxSumPath(head);
      for (TreeNode n : maxPath) {
         System.out.println(n.val);
      }
   }
}
```

# [125. 验证回文串](https://leetcode-cn.com/problems/valid-palindrome/)

#### ==判断大小写是否配套==

```java
 (Math.max(c1, c2) - Math.min(c1, c2) == 32
```

给定一个字符串，验证它是否是回文串，只考虑字母和数字字符，可以忽略字母的大小写。

**说明：**本题中，我们将空字符串定义为有效的回文串。



双指针靠拢 空格就跳过

```java
// 忽略空格、忽略大小写 -> 是不是回文
// 数字不在忽略大小写的范围内
public static boolean isPalindrome(String s) {
   if (s == null || s.length() == 0) {
      return true;
   }
   char[] str = s.toCharArray();
   int L = 0;
   int R = str.length - 1;
   while (L < R) {
      // 英文（大小写） + 数字
      if (validChar(str[L]) && validChar(str[R])) {
         if (!equal(str[L], str[R])) {
            return false;
         }
         L++;
         R--;
      } else {
         L += validChar(str[L]) ? 0 : 1;
         R -= validChar(str[R]) ? 0 : 1;
      }
   }
   return true;
}

public static boolean validChar(char c) {
   return isLetter(c) || isNumber(c);
}

public static boolean equal(char c1, char c2) {
   if (isNumber(c1) || isNumber(c2)) {
      return c1 == c2;
   }
   // a  A   32
   // b  B   32
   // c  C   32
   return (c1 == c2) || (Math.max(c1, c2) - Math.min(c1, c2) == 32);
}

public static boolean isLetter(char c) {
   return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z');
}

public static boolean isNumber(char c) {
   return (c >= '0' && c <= '9');
}
```

# [127. 单词接龙](https://leetcode-cn.com/problems/word-ladder/) (夹逼BFS)

#### O(1)HashMap只有是int或者 短的八字节对象 才是O(1)

如果是string就是O(k) string长度k



**求最短输出路径长度**

输入：beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]
输出：5
解释：一个最短转换序列是 "hit" -> "hot" -> "dot" -> "dog" -> "cog", 返回它的长度 5。



List 元素放入 HashMap

```java
// start，出发的单词
// to, 目标单位
// list, 列表
// to 一定属于list
// start未必
// 返回变幻的最短路径长度
public static int ladderLength1(String start, String to, List<String> list) {
   list.add(start);
   // key : 列表中的单词，每一个单词都会有记录！
   // value : key这个单词，有哪些邻居！
   HashMap<String, ArrayList<String>> nexts = getNexts(list);
   // abc  出发     abc  -> abc  0
   // bbc  1
   HashMap<String, Integer> distanceMap = new HashMap<>();
   distanceMap.put(start, 1);
   HashSet<String> set = new HashSet<>();
   set.add(start);
   Queue<String> queue = new LinkedList<>();
   queue.add(start);
   while (!queue.isEmpty()) {
      String cur = queue.poll();
      Integer distance = distanceMap.get(cur);
      for (String next : nexts.get(cur)) {
         if (next.equals(to)) {
            return distance + 1;
         }
         if (!set.contains(next)) {
            set.add(next);
            queue.add(next);
            distanceMap.put(next, distance + 1);
         }
      }
   }
   return 0;
}
public static HashMap<String, ArrayList<String>> getNexts(List<String> words) {
   HashSet<String> dict = new HashSet<>(words);
   HashMap<String, ArrayList<String>> nexts = new HashMap<>();
   for (int i = 0; i < words.size(); i++) {
      nexts.put(words.get(i), getNext(words.get(i), dict));
   }
   return nexts;
}
// 应该根据具体数据状况决定用什么来找邻居
// 1)如果字符串长度比较短，字符串数量比较多，以下方法适合
// 2)如果字符串长度比较长，字符串数量比较少，以下方法不适合
public static ArrayList<String> getNext(String word, HashSet<String> dict) {
   ArrayList<String> res = new ArrayList<String>();
   char[] chs = word.toCharArray();
   for (int i = 0; i < chs.length; i++) {
      for (char cur = 'a'; cur <= 'z'; cur++) {
         if (chs[i] != cur) {
            char tmp = chs[i];
            chs[i] = cur;
            if (dict.contains(String.valueOf(chs))) {
               res.add(String.valueOf(chs));
            }
            chs[i] = tmp;
         }
      }
   }
   return res;
}
//////////////////////////////////////////////////////////////////////////////////////////
public static int ladderLength2(String beginWord, String endWord, List<String> wordList) {
   HashSet<String> dict = new HashSet<>(wordList);
   if (!dict.contains(endWord)) {
      return 0;
   }
   HashSet<String> startSet = new HashSet<>();
   HashSet<String> endSet = new HashSet<>();
   HashSet<String> visit = new HashSet<>();
   startSet.add(beginWord);
   endSet.add(endWord);
   for (int len = 2; !startSet.isEmpty(); len++) {
      // startSet是较小的，endSet是较大的
      HashSet<String> nextSet = new HashSet<>();
      for (String w : startSet) {
         // w -> a(nextSet)
         // a b c
         // 0 
         //   1
         //     2
         for (int j = 0; j < w.length(); j++) {
            char[] ch = w.toCharArray();
            for (char c = 'a'; c <= 'z'; c++) {
               if (c != w.charAt(j)) {
                  ch[j] = c;
                  String next = String.valueOf(ch);
                  if (endSet.contains(next)) {
                     return len;
                  }
                  if (dict.contains(next) && !visit.contains(next)) {
                     nextSet.add(next);
                     visit.add(next);
                  }
               }
            }
         }
      }
      // startSet(小) -> nextSet(某个大小)   和 endSet大小来比
      startSet = (nextSet.size() < endSet.size()) ? nextSet : endSet;
      endSet = (startSet == nextSet) ? endSet : nextSet;
   }
   return 0;
}
```

# [130. 被围绕的区域](https://leetcode-cn.com/problems/surrounded-regions/)

#### ==经典infect递归过程==

感染一块相邻的区域

```java
// m -> 二维数组， 不是0就是1
   public static void infect(int[][] m, int i, int j) {
      if (i < 0 || i == m.length || j < 0 || j == m[0].length || m[i][j] != 1) {
         return;
      }
      // m[i][j] == 1
      m[i][j] = 2;
      infect(m, i - 1, j);
      infect(m, i + 1, j);
      infect(m, i, j - 1);
      infect(m, i, j + 1);
   }
```

给你一个 `m x n` 的矩阵 `board` ，由若干字符 `'X'` 和 `'O'` ，找到所有被 `'X'` 围绕的区域，并将这些区域里所有的 `'O'` 用 `'X'` 填充。

输入：

board =

[["X","X","X","X"],

["X","O","O","X"],

["X","X","O","X"],

["X","O","X","X"]]
输出：

[["X","X","X","X"],

["X","X","X","X"],

["X","X","X","X"],

["X","O","X","X"]]
解释：被围绕的区间不会存在于边界上，换句话说，任何边界上的 'O' 都不会被填充为 'X'。

 任何不在边界上，或不与边界上的 'O' 相连的 'O' 最终都会被填充为 'X'。

如果两个元素在水平或垂直方向相邻，则称它们是“相连”的。



解题:从四周infect 所有O改成F

然后再遍历原数组 把所有O改成X

最后F改回O

```java
public static void solve1(char[][] board) {
   boolean[] ans = new boolean[1];
   for (int i = 0; i < board.length; i++) {
      for (int j = 0; j < board[0].length; j++) {
         if (board[i][j] == 'O') {
            ans[0] = true;
            can(board, i, j, ans);
            board[i][j] = ans[0] ? 'T' : 'F';
         }
      }
   }
   for (int i = 0; i < board.length; i++) {
      for (int j = 0; j < board[0].length; j++) {
         char can = board[i][j];
         if (can == 'T' || can == 'F') {
            board[i][j] = '.';
            change(board, i, j, can);
         }
      }
   }
}
public static void can(char[][] board, int i, int j, boolean[] ans) {
   if (i < 0 || i == board.length || j < 0 || j == board[0].length) {
      ans[0] = false;
      return;
   }
   if (board[i][j] == 'O') {
      board[i][j] = '.';
      can(board, i - 1, j, ans);
      can(board, i + 1, j, ans);
      can(board, i, j - 1, ans);
      can(board, i, j + 1, ans);
   }
}
public static void change(char[][] board, int i, int j, char can) {
   if (i < 0 || i == board.length || j < 0 || j == board[0].length) {
      return;
   }
   if (board[i][j] == '.') {
      board[i][j] = can == 'T' ? 'X' : 'O';
      change(board, i - 1, j, can);
      change(board, i + 1, j, can);
      change(board, i, j - 1, can);
      change(board, i, j + 1, can);
   }
}
// 从边界开始感染的方法，比第一种方法更好
public static void solve2(char[][] board) {
   if (board == null || board.length == 0 || board[0] == null || board[0].length == 0) {
      return;
   }
   int N = board.length;
   int M = board[0].length;
   for (int j = 0; j < M; j++) {
      if (board[0][j] == 'O') {
         free(board, 0, j);
      }
      if (board[N - 1][j] == 'O') {
         free(board, N - 1, j);
      }
   }
   for (int i = 1; i < N - 1; i++) {
      if (board[i][0] == 'O') {
         free(board, i, 0);
      }
      if (board[i][M - 1] == 'O') {
         free(board, i, M - 1);
      }
   }
   for (int i = 0; i < N; i++) {
      for (int j = 0; j < M; j++) {
         if (board[i][j] == 'O') {
            board[i][j] = 'X';
         }
         if (board[i][j] == 'F') {
            board[i][j] = 'O';
         }
      }
   }
}
public static void free(char[][] board, int i, int j) {
   if (i < 0 || i == board.length || j < 0 || j == board[0].length || board[i][j] != 'O') {
      return;
   }
   board[i][j] = 'F';
   free(board, i + 1, j);
   free(board, i - 1, j);
   free(board, i, j + 1);
   free(board, i, j - 1);
}
```

1020题目类似 也可以用infect过程来理解

```java
package class31;

/*
 * @Auther:deeys
 * @Date:2022/2/12
 * @Description:class31
 * @Version:1.0
 */
public class Problem_1020_飞地的数量 {
    public int numEnclaves(int[][] grid) {
        int ans = 0;
        int N = grid.length;
        int M = grid[0].length;
        for (int j = 0; j < M; j++) {
            //第一行和最后一行
            if (grid[0][j] == 1) infect(grid, 0, j);
            if (grid[N - 1][j] == 1) infect(grid, N - 1, j);
        }
        for (int i = 1; i < N - 1; i++) {
            //第一列和最后一列
            if (grid[i][0] == 1) infect(grid, i, 0);
            if (grid[i][M - 1] == 1) infect(grid, i, M - 1);
        }
        //遍历
        for (int i = 0; i < N; i++) {
            for (int j = 0; j < M; j++) {
                if (grid[i][j] == 1) ans++;
            }
        }
        return ans;
    }
    public static void infect(int[][] grid, int i, int j) {
        if (i < 0 || i == grid.length || j < 0 || j == grid[0].length || grid[i][j] != 1/*只有1才能继续感染*/) {
            return;
        }
        grid[i][j] = -1;
        infect(grid, i + 1, j);
        infect(grid, i - 1, j);
        infect(grid, i, j + 1);
        infect(grid, i, j - 1);
    }
}

```


# [139. 单词拆分](https://leetcode-cn.com/problems/word-break/)(从左往右的)

给你一个字符串 s 和一个字符串列表 wordDict 作为字典。请你判断是否可以利用字典中出现的单词拼接出 s 。

注意：不要求字典中出现的单词全部都使用，并且字典中的单词可以重复使用。



```java
    //记忆化回溯
class Solution {
    public boolean wordBreak(String s, List<String> wordDict) {
        int n = s.length();
        int[] memo = new int[n+1];
        return dfs(s,n,0,wordDict,memo);
    }
    public boolean dfs(String s,int n,int start, List<String> wordDict,int[] memo){
        if(memo[start] == 2) return false;
        if(start == n || memo[start] == 1){
            return true;
        }
        for(String word:wordDict){
            int newStrat = start + word.length();
            if(s.startsWith(word,start) && dfs(s, n, newStrat, wordDict, memo)){
                memo[start] = 1;
                return true;
            }
        }
        memo[start] = 2;
        return false;
    }
}
```

```java
public static class Node {
   public boolean end;
   public Node[] nexts;

   public Node() {
      end = false;
      nexts = new Node[26];
   }
}
public static boolean wordBreak1(String s, List<String> wordDict) {
   Node root = new Node();
   for (String str : wordDict) {
      char[] chs = str.toCharArray();
      Node node = root;
      int index = 0;
      for (int i = 0; i < chs.length; i++) {
         index = chs[i] - 'a';
         if (node.nexts[index] == null) {
            node.nexts[index] = new Node();
         }
         node = node.nexts[index];
      }
      node.end = true;
   }
   char[] str = s.toCharArray();
   int N = str.length;
   boolean[] dp = new boolean[N + 1];
   dp[N] = true; // dp[i]  word[i.....] 能不能被分解
   // dp[N] word[N...]  -> ""  能不能够被分解 
   // dp[i] ... dp[i+1....]
   for (int i = N - 1; i >= 0; i--) {
      // i
      // word[i....] 能不能够被分解
      // i..i    i+1....
      // i..i+1  i+2...
      Node cur = root;
      for (int end = i; end < N; end++) {
         cur = cur.nexts[str[end] - 'a'];
         if (cur == null) {
            break;
         }
         // 有路！
         if (cur.end) {
            // i...end 真的是一个有效的前缀串  end+1....  能不能被分解
            dp[i] |= dp[end + 1];
         }
         if (dp[i]) {
            break;
         }
      }
   }
   return dp[0];
}
```





# [140. 单词拆分 II](https://leetcode-cn.com/problems/word-break-ii/)(根据动态规划表生成路径)



# [148. 排序链表](https://leetcode-cn.com/problems/sort-list/)(链表的归并排序 额外空间O(1) 不同于数组)

给你链表的头结点 head ，请将其按 升序 排列并返回 排序后的链表 。

你可以在 O(n log n) 时间复杂度和常数级空间复杂度下，对链表进行排序吗？



# [149. 直线上最多的点数](https://leetcode-cn.com/problems/max-points-on-a-line/)

给定一个点集 求最大共线点数

```java
public int maxPoints(int[][] points) {
   //题目数据量小可以用暴力
   if (points.length<3) {return points.length;}
   int ans=2;
   for (int i=0; i<points.length; i++) {
      for (int j=i+1; j<points.length; j++) {
         int count=2;
         for (int k=j+1; k<points.length; k++) {
            //遍历points 然后遍历所有点的斜率 相等就加1
            if((points[j][0]-points[i][0])*(points[k][1]-points[j][1]) == (points[j][1]-points[i][1])*(points[k][0]-points[j][0])) {
               count++;
            }
         }
         ans=Math.max(ans,count);
      }
   }
   return ans;
}
```

# [150. 逆波兰表达式求值](https://leetcode-cn.com/problems/evaluate-reverse-polish-notation/)(栈)

遇见+ - 就算两个数 * / 优先算

# [152. 乘积最大子数组](https://leetcode-cn.com/problems/maximum-product-subarray/)

给你一个整数数组 `nums` ，请你找出数组中乘积最大的连续子数组（该子数组中至少包含一个数字），并返回该子数组所对应的乘积。



子数组以0 ~ length-1结尾, 分别最大的连续子数组 ,中的所有最大值 (例如当前到了17位置)

- 只要17位置
- 16位置的最大值 再乘上17位置的值 (就是17位置让dp[16]更大了)

- 17 乘上 以16结尾的最小累乘积(负负得正)

```java
    public int maxProduct(int[] nums) {
        int max = Integer.MIN_VALUE; //结果最大
        int imax = 1; int imin = 1; //阶段最大，最小
        for(int tmp:nums){
            //当遇到负数的时候进行交换，因为阶段最小会最大，最大变最小
            if(tmp < 0 ){
                int exc = imax;
                imax = imin;
                imin = exc;
            }
            //在这里用乘积跟元素本身进行比较的原因是：
            //对于最小值来说，最小值本身则说明这个元素值比前面连续子数组的最小值还小，相当于重置了阶段最小的起始位置。
            imax = Math.max(imax*tmp,tmp);
            imin = Math.min(imin*tmp,tmp);
            //对比 阶段最大值和最终结果最大值
            max = Math.max(imax,max);
        }
        return max;
    }
```

```java
	public static int maxProduct(int[] nums) {
		int ans = nums[0];
		int min = nums[0];
		int max = nums[0];
		for (int i = 1; i < nums.length; i++) {
			int curmin = Math.min(nums[i], Math.min(min * nums[i], max * nums[i]));
			int curmax = Math.max(nums[i], Math.max(min * nums[i], max * nums[i]));
			min = curmin;
			max = curmax;
			ans  = Math.max(ans, max);
		}
		return ans;
	}
```

# 163.缺失的区间

![image-20211227133306559](https://s2.loli.net/2021/12/27/ITawlVGhpmoebcu.png)

```java
public static List<String> findMissingRanges(int[] nums, int lower, int upper) {
   List<String> ans = new ArrayList<>();
   for (int num : nums) {
      if (num > lower) {
         ans.add(miss(lower, num - 1));
      }
      if (num == upper) {
         return ans;
      }
      lower = num + 1;
   }
   if (lower <= upper) {//加最后一段
      ans.add(miss(lower, upper));
   }
   return ans;'[      56t]'
}
// 生成"lower->upper"的字符串，如果lower==upper，只用生成"lower"
public static String miss(int lower, int upper) {
   String left = String.valueOf(lower);
   String right = "";
   if (upper > lower) {
      right = "->" + String.valueOf(upper);
   }
   return left + right;
}
```

# [166. 分数到小数](https://leetcode-cn.com/problems/fraction-to-recurring-decimal/)

```java
输入：numerator = 4, denominator = 333
输出："0.(012)"
```

```java
public static String fractionToDecimal(int numerator, int denominator) {
   if (numerator == 0) {
      return "0";
   }
   StringBuilder res = new StringBuilder();
   // "+" or "-"
   res.append(((numerator > 0) ^ (denominator > 0)) ? "-" : "");//判断正负
   //为了不溢出用long
   long num = Math.abs((long) numerator);
   long den = Math.abs((long) denominator);
   // integral part 整数部分
   res.append(num / den);
   num = num % den;
   if (num == 0) {
      return res.toString();
   }
   // fractional part
   res.append(".");

   HashMap<Long, Integer> map = new HashMap<Long, Integer>();
   map.put(num, res.length());
   while (num != 0) {//除法过程
      num *= 10;//模完后剩余的数 要补0
      res.append(num / den);
      num = num % den;
      if (map.containsKey(num)) {
         int index = map.get(num);
         res.insert(index, "(");//上一个重复答案的时候加入括号
         res.append(")");
         break;
      } else {
         map.put(num, res.length());
      }
   }
   return res.toString();
}
```

# [171. Excel 表列序号](https://leetcode-cn.com/problems/excel-sheet-column-number/)(26伪进制)

    A -> 1
    B -> 2
    C -> 3
    ...
    Z -> 26
    AA -> 27
    AB -> 28 
    ...



![image-20211227144631838](https://s2.loli.net/2021/12/27/l8omBanZFSPKhtv.png)

```java
// 这道题反过来也要会写
public static int titleToNumber(String s) {
   char[] str = s.toCharArray();
   int ans = 0;
   for (int i = 0; i < str.length; i++) {
      ans = ans * 26 + (str[i] - 'A') + 1;//(str[i] - 'A')+1: 在字母中第几位 
   }
   return ans;
}
```



# [172. 阶乘后的零](https://leetcode-cn.com/problems/factorial-trailing-zeroes/)(因子为5的个数)

给定一个整数 `n` ，返回 `n!` 结果中尾随零的数量。

提示 `n! = n * (n - 1) * (n - 2) * ... * 3 * 2 * 1`



就相当于先把其他因子全算完, 最后再看有多少5*2 就有多少个0

```java
public static int trailingZeroes(int n) {
   int ans = 0;
   //n/5 代表以5为单位 第一遍的因子个数 x
   //x/5 代表在25的影响下多出来的一个因子 y
   //y/5 代表在125的影响下再多出来的一个因子 z
   //
   while (n != 0) {
      n /= 5;
      ans += n;
   }
   return ans;
}
```



# [189. 轮转数组](https://leetcode-cn.com/problems/rotate-array/)(三次逆序旋转数组)

给你一个数组，将数组中的元素向右轮转 k 个位置，其中 k 是非负数。

输入: nums = [1,2,3,4,5,6,7], k = 3
输出: [5,6,7,1,2,3,4]
解释:
向右轮转 1 步: [7,1,2,3,4,5,6]
向右轮转 2 步: [6,7,1,2,3,4,5]
向右轮转 3 步: [5,6,7,1,2,3,4]



#### 这个三次逆序非常轻 操作很秀 可以记忆一下

```java
public void rotate1(int[] nums, int k) {
   int N = nums.length;
   k = k % N;
   reverse(nums, 0, N - k - 1);
   reverse(nums, N - k, N - 1);
   reverse(nums, 0, N - 1);
}

public static void reverse(int[] nums, int L, int R) {
   while (L < R) {
      int tmp = nums[L];
      nums[L++] = nums[R];
      nums[R--] = tmp;
   }
}

public static void rotate2(int[] nums, int k) {
   int N = nums.length;
   k = k % N;
   if (k == 0) {
      return;
   }
   int L = 0;
   int R = N - 1;
   int lpart = N - k;
   int rpart = k;
   int same = Math.min(lpart, rpart);
   int diff = lpart - rpart;
   exchange(nums, L, R, same);
   while (diff != 0) {
      if (diff > 0) {
         L += same;
         lpart = diff;
      } else {
         R -= same;
         rpart = -diff;
      }
      same = Math.min(lpart, rpart);
      diff = lpart - rpart;
      exchange(nums, L, R, same);
   }
}

public static void exchange(int[] nums, int start, int end, int size) {
   int i = end - size + 1;
   int tmp = 0;
   while (size-- != 0) {
      tmp = nums[start];
      nums[start] = nums[i];
      nums[i] = tmp;
      start++;
      i++;
   }
}
```

# [190. 颠倒二进制位](https://leetcode-cn.com/problems/reverse-bits/)

![image-20211227165733880](https://s2.loli.net/2021/12/27/ltNqE2i7QuKmVMs.png)

```java
// 代码看着很魔幻吧？
	// 给个例子，假设n二进制为：
	// 1011 0111 0011 1001 0011 1111 0110 1010 
	// 解释一下，第一行，是把n左边16位，和n右边16位交换
	// n = (n >>> 16) | (n << 16);
	// 因为 n >>> 16 就是左边16位被移动到了右侧
	// 同时 n << 16  就是右边16位被移动到了左侧
	// 又 | 在了一起，所以，n变成了
	// 0011 1111 0110 1010 1011 0111 0011 1001
	
	// 第二行，
	// n = ((n & 0xff00ff00) >>> 8) | ((n & 0x00ff00ff) << 8);
	// (n & 0xff00ff00)  
	// 这一句意思是，左侧开始算0~7位，保留；8~15位，全变0；16~23位，保留；24~31位，全变0
	// 0011 1111 0000 0000 1011 0111 0000 0000
	// (n & 0xff00ff00) >>> 8 这句就是上面的值，统一向右移动8位，变成：
	// 0000 0000 0011 1111 0000 0000 1011 0111
	//
	//
	// (n & 0x00ff00ff)
	// 这一句意思是，左侧开始算0~7位，全变0；8~15位，保留；16~23位，全变0；24~31位，保留
	// 0000 0000 0110 1010 0000 0000 0011 1001
	// (n & 0x00ff00ff) << 8 这句就是上面的值，统一向左移动8位，变成：
	// 0110 1010 0000 0000 0011 1001 0000 0000
	// 那么 ((n & 0xff00ff00) >>> 8) | ((n & 0x00ff00ff) << 8)
	// 什么效果？就是n的0~7位和8~15位交换了，16~23位和24~31位交换了
	// 0110 1010 0011 1111 0011 1001 1011 0111

	// 也就是说，整个过程是n的左16位，和右16位交换
	// n的左16位的内部，左8位和右8位交换；n的右16位的内部，左8位和右8位交换
	// 接下来的一行，其实是，从左边开始算，0~7位内部，左4和右4交换；8~15位，左4和右4交换；...
	// 接下来的一行，其实是，从左边开始算，0~3位内部，左2和右2交换；4~7位，左2和右2交换；...
	// 最后的一行，其实是，从左边开始算，0~1位内部，左1和右1交换；2~3位，左1和右1交换；...	
public static int reverseBits(int n) {
		// n的高16位，和n的低16位，交换
		n = (n >>> 16) | (n << 16);
		n = ((n & 0xff00ff00) >>> 8) | ((n & 0x00ff00ff) << 8);
		n = ((n & 0xf0f0f0f0) >>> 4) | ((n & 0x0f0f0f0f) << 4);
		n = ((n & 0xcccccccc) >>> 2) | ((n & 0x33333333) << 2);
		n = ((n & 0xaaaaaaaa) >>> 1) | ((n & 0x55555555) << 1);
		return n;
	}
```

# [191. 位1的个数](https://leetcode-cn.com/problems/number-of-1-bits/)

#### 法1° 固定位移运算 

```java
public static int hammingWeight2(int n) {
    //0101 0101 0101 0101 0101 0101 0101 0101
   n = (n & 0x55555555) + ((n >>> 1) & 0x55555555);
    //0011 0011 0011 0011 0011 0011 0011 0011
   n = (n & 0x33333333) + ((n >>> 2) & 0x33333333);
    //0000 1111 0000 1111 0000 1111 0000 1111
   n = (n & 0x0f0f0f0f) + ((n >>> 4) & 0x0f0f0f0f);
    //0000 0000 1111 1111 0000 0000 1111 1111
   n = (n & 0x00ff00ff) + ((n >>> 8) & 0x00ff00ff);
    //0000 0000 0000 0000 1111 1111 1111 1111
   n = (n & 0x0000ffff) + ((n >>> 16) & 0x0000ffff);
   return n;
}
```

#### 法2° 提取最右侧的1

观察这个运算：**==n & (n−1)==**，其运算结果恰为把 n 的二进制位中的最低位的 1 变为 0 之后的结果。

直到n变为0 返回count

```java
//第一种比较简洁 可以记住这个结论
public int hammingWeight1(int n) {
    int ret = 0;
    while (n != 0) {
        n &= n - 1;
        ret++;
    }
    return ret;
}
//第二种思路比较清晰 逻辑结构比较容易理解
public static int hammingWeight2(int n) {
   int bits = 0;
   int rightOne = 0;
   while(n != 0) {
      bits++;
      rightOne = n & (-n);//取出末尾的1
      n ^= rightOne; //让他异或末尾1 得到 最低位的1变为0之后的结果 也就是(n &= n - 1)
   }
   return bits;
}
```

# [202. 快乐数](https://leetcode-cn.com/problems/happy-number/)

```java
public static boolean isHappy1(int n) {
   HashSet<Integer> set = new HashSet<>();
   while (n != 1) {
      int sum = 0;
      while (n != 0) {
         int r = n % 10;
         sum += r * r;
         n /= 10;
      }
      n = sum;
      if (set.contains(n)) {
         break;
      }
      set.add(n);
   }
   return n == 1;
}

// 实验代码
public static TreeSet<Integer> sum(int n) {
   TreeSet<Integer> set = new TreeSet<>();
   while (!set.contains(n)) {
      set.add(n);
      int sum = 0;
      while (n != 0) {
         sum += (n % 10) * (n % 10);
         n /= 10;
      }
      n = sum;
   }
   return set;
}

public static boolean isHappy2(int n) {
   while (n != 1 && n != 4) {
      int sum = 0;
      while (n != 0) {
         sum += (n % 10) * (n % 10);
         n /= 10;
      }
      n = sum;
   }
   return n == 1;
}

public static void main(String[] args) {
   for (int i = 1; i < 1000; i++) {
      System.out.println(sum(i));
   }
}
```

https://pic.leetcode-cn.com/1606932458-HgVOnW-Sieve_of_Eratosthenes_animation.gif





# [207. 课程表](https://leetcode-cn.com/problems/course-schedule/)(拓扑排序-给了范围就用数组)

#### 给了范围就用数组

用足够范围的数组 和双指针 l,r 代替队列

```java
int[] zero = new int[courses];
   // 该队列有效范围是[l,r)
   // 新来的数，放哪？r位置，r++
   // 出队列的数，从哪拿？l位置，l++
   // l == r 队列无元素  l < r 队列有元素
   int l = 0;
   int r = 0;
```



```java
输入：numCourses = 2, prerequisites = [[1,0],[0,1]]
输出：false
解释：总共有 2 门课程。学习课程 1 之前，你需要先完成课程 0 ；并且学习课程 0 之前，你还应先完成课程 1 。这是不可能的。
-----------------------------------------------------------------------------
输入：numCourses = 2, prerequisites = [[1,0]]
输出：true
解释：总共有 2 门课程。学习课程 1 之前，你需要完成课程 0 。这是可能的。
```

```java
public static class Course {
   public int name;
   public int in;
   public ArrayList<Course> nexts;
   public Course(int n) {
      name = n;
      in = 0;
      nexts = new ArrayList<>();
   }
}
//////////////////////////////////HashMap实现////////////////////////
public static boolean canFinish1(int numCourses, int[][] prerequisites) {
		if (prerequisites == null || prerequisites.length == 0) {
			return true;
		}
		// 一个编号 对应 一个课的实例
		HashMap<Integer, Course> map = new HashMap<>();//HashMap实现图
		for (int[] arr : prerequisites) {//遍历所有的 二元组 把依赖关系设置到map
			int to = arr[0];
			int from = arr[1]; // from -> to
			if (!map.containsKey(to)) {
				map.put(to, new Course(to));
			}
			if (!map.containsKey(from)) {
				map.put(from, new Course(from));
			}
			Course t = map.get(to);
			Course f = map.get(from);
			f.nexts.add(t);//form的next加入to节点
			t.in++;//to的入度+1
		}
		int needPrerequisiteNums = map.size();//只能用不重复的课程数量
		Queue<Course> zeroInQueue = new LinkedList<>();
		for (Course node : map.values()) {
			if (node.in == 0) {
				zeroInQueue.add(node);//拓扑排序中的 第一批
			}
		}
		int count = 0;
		while (!zeroInQueue.isEmpty()) {
			Course cur = zeroInQueue.poll();
			count++;
			for (Course next : cur.nexts) {
				if (--next.in == 0) {
					zeroInQueue.add(next);
				}
			}
		}
		return count == needPrerequisiteNums;//最终能拓扑出来的count数 和课程要求数
	}
////////////////////////////数组+链表实现/////////////////////////////////////
// 和方法1算法过程一样
// 但是写法优化了
public static boolean canFinish2(int courses, int[][] relation) {
   if (relation == null || relation.length == 0) {
      return true;
   }
   // 3 :  0 1 2
   // nexts :   0   {}
   //           1   {}
   //           2   {}
   //           3   {0,1,2}
   ArrayList<ArrayList<Integer>> nexts = new ArrayList<>();
   for (int i = 0; i < courses; i++) {
      nexts.add(new ArrayList<>());
   }
   // 3 入度 1  in[3] == 1
   int[] in = new int[courses];
   for (int[] arr : relation) {
      // arr[1] from   arr[0] to
      nexts.get(arr[1]).add(arr[0]);
      in[arr[0]]++;
   }
   
   // 队列
   int[] zero = new int[courses];
   // 该队列有效范围是[l,r)
   // 新来的数，放哪？r位置，r++
   // 出队列的数，从哪拿？l位置，l++
   // l == r 队列无元素  l < r 队列有元素
   int l = 0;
   int r = 0;
   for (int i = 0; i < courses; i++) {
      if (in[i] == 0) {
         zero[r++] = i;
      }
   }
   int count = 0;
   while (l != r) {
      count++; // zero[l] 出队列   l++
      for (int next : nexts.get(zero[l++])) {
         if (--in[next] == 0) {
            zero[r++] = next;
         }
      }
   }
   return count == nexts.size();
}
```





# [213. 打家劫舍 II](https://leetcode-cn.com/problems/house-robber-ii/)()

给定数组nums不取相邻数, 子序列的最大值. 首尾算相邻.

![image-20211228144536004](https://s2.loli.net/2021/12/28/8dVOYsESCX7I9mH.png)





# 221. 最大正方形

[221. 最大正方形](https://leetcode-cn.com/problems/maximal-square/)



# 226. 翻转二叉树

[226. 翻转二叉树](https://leetcode-cn.com/problems/invert-binary-tree/)



# [237. 删除链表中的节点](https://leetcode-cn.com/problems/delete-node-in-a-linked-list/)

#### 工程上不合理

因为并不能删除这个节点 而且不能删除最后一个节点 而且我本身并没有被删除



请编写一个函数，用于 删除单链表中某个特定节点 。在设计函数时需要注意，你无法访问链表的头节点 head ，只能直接访问 要被删除的节点 。

题目数据保证需要删除的节点 不是末尾节点 。

```java
	public static class ListNode {
		int val;
		ListNode next;
	}
	public void deleteNode(ListNode node) {
		node.val = node.next.val;
		node.next = node.next.next;
	}
```

# [238. 除自身以外数组的乘积](https://leetcode-cn.com/problems/product-of-array-except-self/)

int维护前缀积

ans[]维护后缀积

```java
public int[] productExceptSelf(int[] nums) {
   int n = nums.length;
   int[] ans = new int[n];
   ans[0] = nums[0];
   for (int i = 1; i < n; i++) {
      ans[i] = ans[i - 1] * nums[i];
   }
   int right = 1;
   for (int i = n - 1; i > 0; i--) {
      ans[i] = ans[i - 1] * right;
      right *= nums[i];
   }
   ans[0] = right;
   return ans;
}
// 扩展 : 如果仅仅是不能用除号，把结果直接填在nums里呢？
// 解法：
// 1. 数一共几个0；
// 2每一个位得到结果就是，a / b，位运算替代 /，之前的课讲过（新手班）
// 可以用位运算替代除法
```



# [242. 有效的字母异位词](https://leetcode-cn.com/problems/valid-anagram/)(int[]记录词频)

```java
public static boolean isAnagram(String s, String t) {
   if (s.length() != t.length()) {
      return false;
   }
   char[] str1 = s.toCharArray();
   char[] str2 = t.toCharArray();
   int[] count = new int[256];//256是为了unicode的时候
   for (char cha : str1) {
      count[cha]++;
   }
   for (char cha : str2) {
      if (--count[cha] < 0) {
         return false;
      }
   }
   return true;
}
```



# [251. 展开二维向量](https://leetcode-cn.com/problems/flatten-2d-vector)

做二维数组迭代器  Vector2D(int[][] v), int next(), boolean hasNext()

[3, 4, 5, 1]

[2, 3, 4]

[2, 9]

```java
public static class Vector2D {
   private int[][] matrix;
   private int row;
   private int col;
   private boolean curUse;

   public Vector2D(int[][] v) {
      matrix = v;
      row = 0;
      col = -1;
      curUse = true;
      hasNext();
   }

   public int next() {
      int ans = matrix[row][col];
      curUse = true;
      hasNext();
      return ans;
   }

   public boolean hasNext() {
      if (row == matrix.length) {
         return false;
      }
      if (!curUse) {
         return true;
      }
      // (row，col)用过了
      if (col < matrix[row].length - 1) {
         col++;
      } else {
         col = 0;
         do {
            row++;
         } while (row < matrix.length && matrix[row].length == 0);
      }
      // 新的(row，col)
      if (row != matrix.length) {
         curUse = false;
         return true;
      } else {
         return false;
      }
   }

}
```

# [269. 火星词典](https://leetcode-cn.com/problems/alien-dictionary)(拓扑排序-图)

给很多字符串 求该字符串规律 的字典序 返回字典序, 如无字典序,返回空



```java
//就是看能不能拓扑排序
public static String alienOrder(String[] words) {
   if (words == null || words.length == 0) {
      return "";
   }
   int N = words.length;
   HashMap<Character, Integer> indegree = new HashMap<>();
   for (int i = 0; i < N; i++) {
      for (char c : words[i].toCharArray()) {
         indegree.put(c, 0);
      }
   }
   HashMap<Character, HashSet<Character>> graph = new HashMap<>();
   for (int i = 0; i < N - 1; i++) {
      char[] cur = words[i].toCharArray();
      char[] nex = words[i + 1].toCharArray();
      int len = Math.min(cur.length, nex.length);
      int j = 0;
      for (; j < len; j++) {
         if (cur[j] != nex[j]) {
             //只看导致高低的 字母对
            if (!graph.containsKey(cur[j])) {
               graph.put(cur[j], new HashSet<>());
            }
            if (!graph.get(cur[j]).contains(nex[j])) {
               graph.get(cur[j]).add(nex[j]);
               indegree.put(nex[j], indegree.get(nex[j]) + 1);
            }
            break;
         }
      }
      if (j < cur.length && j == nex.length) {
         return "";
      }
   }
   StringBuilder ans = new StringBuilder();
   Queue<Character> q = new LinkedList<>();
   for (Character key : indegree.keySet()) {
      if (indegree.get(key) == 0) {
         q.offer(key);
      }
   }
   while (!q.isEmpty()) {
      char cur = q.poll();
      ans.append(cur);
      if (graph.containsKey(cur)) {
         for (char next : graph.get(cur)) {
            indegree.put(next, indegree.get(next) - 1);
            if (indegree.get(next) == 0) {
               q.offer(next);
            }
         }
      }
   }
   return ans.length() == indegree.size() ? ans.toString() : "";
}
```

# [277. 搜寻名人](https://leetcode-cn.com/problems/find-the-celebrity)(图)

有0 ~ N-1个人

**填写函数**: know(i, j) ==> i 是否知晓 j 这个人(如果i = j, 则返回true)

名人: (**有1个或者0个**)

其他人都认识名人

名人不认识其他人,只认识自己

```java
// 提交时不要提交这个函数，因为默认系统会给你这个函数
// knows方法，自己不认识自己
public static boolean knows(int x, int i) {
   return true;
}

// 只提交下面的方法 0 ~ n-1
public int findCelebrity(int n) {
   // 谁可能成为明星，谁就是cand
   int cand = 0;
   for (int i = 0; i < n; ++i) {
      if (knows(cand, i)) {
         cand = i;
      }
   } // cand是什么？唯一可能是明星的人！
   // 下一步就是验证，它到底是不是明星
   // 1) cand是不是不认识所有的人 cand...（右侧cand都不认识）
   // 所以，只用验证 ....cand的左侧即可
   for (int i = 0; i < cand; ++i) {
      if (knows(cand, i)) {
         return -1;
      }
   }
   // 2) 是不是所有的人都认识cand
   for (int i = 0; i < n; ++i) {
      if (!knows(i, cand)) {
         return -1;
      }
   }
   return cand;
}
```

# [279. 完全平方数](https://leetcode-cn.com/problems/perfect-squares/)(猜规律+也能动态规划)

```java
// 暴力解
public static int numSquares1(int n) {
   int res = n, num = 2;
   while (num * num <= n) {
      int a = n / (num * num), b = n % (num * num);
      res = Math.min(res, a + numSquares1(b));
      num++;
   }
   return res;
}

// 1 : 1, 4, 9, 16, 25, 36, ...
// 4 : 7, 15, 23, 28, 31, 39, 47, 55, 60, 63, 71, ...
// 规律解
// 规律一：个数不超过4
// 规律二：出现1个的时候，显而易见
// 规律三：任何数 % 8 == 7，一定是4个
// 规律四：任何数消去4的因子之后，剩下rest，rest % 8 == 7，一定是4个
public static int numSquares2(int n) {
   int rest = n;
   while (rest % 4 == 0) {
      rest /= 4;
   }
   if (rest % 8 == 7) {
      return 4;
   }
   int f = (int) Math.sqrt(n);
   if (f * f == n) {
      return 1;
   }
   for (int first = 1; first * first <= n; first++) {
      int second = (int) Math.sqrt(n - first * first);
      if (first * first + second * second == n) {
         return 2;
      }
   }
   return 3;
}

// 数学解
// 1）四平方和定理
// 2）任何数消掉4的因子，结论不变
public static int numSquares3(int n) {
   while (n % 4 == 0) {
      n /= 4;
   }
   if (n % 8 == 7) {
      return 4;
   }
   for (int a = 0; a * a <= n; ++a) {
      // a * a +  b * b = n  
      int b = (int) Math.sqrt(n - a * a);
      if (a * a + b * b == n) {
         return (a > 0 && b > 0) ? 2 : 1;
      }
   }
   return 3;
}
```





# [287. 寻找重复数](https://leetcode-cn.com/problems/find-the-duplicate-number/)(==秒啊~==单链表快慢指针入环节点)

![image-20211228214751917](https://s2.loli.net/2021/12/28/Fz8hWUs9xrtSYfq.png)

给定一个包含 n + 1 个整数的数组 nums ，其数字都在 1 到 n 之间（包括 1 和 n），可知至少存在一个重复的整数。

假设 nums 只有 一个重复的整数 ，找出 这个重复的数 。

你设计的解决方案必须不修改数组 nums 且只用常量级 O(1) 的额外空间。

```java
public static int findDuplicate(int[] nums) {
   if (nums == null || nums.length < 2) {
      return -1;
   }
   int slow = nums[0];
   int fast = nums[nums[0]];
   while (slow != fast) {
      slow = nums[slow];
      fast = nums[nums[fast]];
   }
   fast = 0;
   while (slow != fast) {
      fast = nums[fast];
      slow = nums[slow];
   }
   return slow;
}
```



# [289. 生命游戏](https://leetcode-cn.com/problems/game-of-life/)(重复利用题设空间)









# [295. 数据流的中位数](https://leetcode-cn.com/problems/find-median-from-data-stream/)(大根堆-小根堆-配合)

```java
class MedianFinder {

   private PriorityQueue<Integer> maxh;
   private PriorityQueue<Integer> minh;

   public MedianFinder() {
      maxh = new PriorityQueue<>((a, b) -> b - a);
      minh = new PriorityQueue<>((a, b) -> a - b);
   }

   public void addNum(int num) {
      if (maxh.isEmpty() || maxh.peek() >= num) {
         maxh.add(num);
      } else {
         minh.add(num);
      }
      balance();
   }

   public double findMedian() {
      if (maxh.size() == minh.size()) {
         return (double) (maxh.peek() + minh.peek()) / 2;
      } else {
         return maxh.size() > minh.size() ? maxh.peek() : minh.peek();
      }
   }

   private void balance() {
      if (Math.abs(maxh.size() - minh.size()) == 2) {
         if (maxh.size() > minh.size()) {
            minh.add(maxh.poll());
         } else {
            maxh.add(minh.poll());
         }
      }
   }

}
```



# [315. 计算右侧小于当前元素的个数](https://leetcode-cn.com/problems/count-of-smaller-numbers-after-self/)(merge-逆序对?)

给你一个整数数组 nums ，按要求返回一个新数组 counts 。数组 counts 有该性质： counts[i] 的值是  nums[i] 右侧小于 nums[i] 的元素的数量。

```java
public static class Node {
   public int value;
   public int index;

   public Node(int v, int i) {
      value = v;
      index = i;
   }
}

public static List<Integer> countSmaller(int[] nums) {
   List<Integer> ans = new ArrayList<>();
   if (nums == null) {
      return ans;
   }
   for (int i = 0; i < nums.length; i++) {
      ans.add(0);
   }
   if (nums.length < 2) {
      return ans;
   }
   Node[] arr = new Node[nums.length];
   for (int i = 0; i < arr.length; i++) {
      arr[i] = new Node(nums[i], i);
   }
   process(arr, 0, arr.length - 1, ans);
   return ans;
}

public static void process(Node[] arr, int l, int r, List<Integer> ans) {
   if (l == r) {
      return;
   }
   int mid = l + ((r - l) >> 1);
   process(arr, l, mid, ans);
   process(arr, mid + 1, r, ans);
   merge(arr, l, mid, r, ans);
}

public static void merge(Node[] arr, int l, int m, int r, List<Integer> ans) {
   Node[] help = new Node[r - l + 1];
   int i = help.length - 1;
   int p1 = m;
   int p2 = r;
   while (p1 >= l && p2 >= m + 1) {
      if (arr[p1].value > arr[p2].value) {
         ans.set(arr[p1].index, ans.get(arr[p1].index) + p2 - m);
      }
      help[i--] = arr[p1].value > arr[p2].value ? arr[p1--] : arr[p2--];
   }
   while (p1 >= l) {
      help[i--] = arr[p1--];
   }
   while (p2 >= m + 1) {
      help[i--] = arr[p2--];
   }
   for (i = 0; i < help.length; i++) {
      arr[l + i] = help[i];
   }
}
```



# [324. 摆动排序 II](https://leetcode-cn.com/problems/wiggle-sort-ii/)(改写快排-完美洗牌)

==完美洗牌在20节==

先改写快排 然后得到数组

如果随机数打偏了就继续找

最后得到

**[较小数, ......, 中等数, ......,较大数]**

```java
// 时间复杂度O(N)，额外空间复杂度O(1)
   public static void wiggleSort(int[] nums) {
      if (nums == null || nums.length < 2) {
         return;
      }
      int N = nums.length;
      // 小 中 右
      findIndexNum(nums, 0, nums.length - 1, N / 2);
      if ((N & 1) == 0) {
         // R L -> L R
         shuffle(nums, 0, nums.length - 1);
         // R1 L1 R2 L2 R3 L3 R4 L4
         // L4 R4 L3 R3 L2 R2 L1 R1 -> 代码中的方式，可以的！
         // L1 R1 L2 R2 L3 R3 L4 R4 -> 课上的分析，是不行的！不能两两交换！
         reverse(nums, 0, nums.length - 1);
         // 做个实验，如果把上一行的code注释掉(reverse过程)，然后跑下面注释掉的for循环代码
         // for循环的代码就是两两交换，会发现对数器报错，说明两两交换是不行的, 必须整体逆序
//       for (int i = 0; i < nums.length; i += 2) {
//          swap(nums, i, i + 1);
//       }
      } else {
         shuffle(nums, 1, nums.length - 1);
      }
   }

   public static int findIndexNum(int[] arr, int L, int R, int index) {
      int pivot = 0;
      int[] range = null;
      while (L < R) {
         pivot = arr[L + (int) (Math.random() * (R - L + 1))];
         range = partition(arr, L, R, pivot);
         if (index >= range[0] && index <= range[1]) {
            return arr[index];
         } else if (index < range[0]) {
            R = range[0] - 1;
         } else {
            L = range[1] + 1;
         }
      }
      return arr[L];
   }

   public static int[] partition(int[] arr, int L, int R, int pivot) {
      int less = L - 1;
      int more = R + 1;
      int cur = L;
      while (cur < more) {
         if (arr[cur] < pivot) {
            swap(arr, ++less, cur++);
         } else if (arr[cur] > pivot) {
            swap(arr, cur, --more);
         } else {
            cur++;
         }
      }
      return new int[] { less + 1, more - 1 };
   }

   public static void shuffle(int[] nums, int l, int r) {
      while (r - l + 1 > 0) {
         int lenAndOne = r - l + 2;
         int bloom = 3;
         int k = 1;
         while (bloom <= lenAndOne / 3) {
            bloom *= 3;
            k++;
         }
         int m = (bloom - 1) / 2;
         int mid = (l + r) / 2;
         rotate(nums, l + m, mid, mid + m);
         cycles(nums, l - 1, bloom, k);
         l = l + bloom - 1;
      }
   }

   public static void cycles(int[] nums, int base, int bloom, int k) {
      for (int i = 0, trigger = 1; i < k; i++, trigger *= 3) {
         int next = (2 * trigger) % bloom;
         int cur = next;
         int record = nums[next + base];
         int tmp = 0;
         nums[next + base] = nums[trigger + base];
         while (cur != trigger) {
            next = (2 * cur) % bloom;
            tmp = nums[next + base];
            nums[next + base] = record;
            cur = next;
            record = tmp;
         }
      }
   }

   public static void rotate(int[] arr, int l, int m, int r) {
      reverse(arr, l, m);
      reverse(arr, m + 1, r);
      reverse(arr, l, r);
   }

   public static void reverse(int[] arr, int l, int r) {
      while (l < r) {
         swap(arr, l++, r--);
      }
   }

   public static void swap(int[] nums, int i, int j) {
      int tmp = nums[i];
      nums[i] = nums[j];
      nums[j] = tmp;
   }
```

```java
    public  void wiggleSort(int[] nums) {
        int[]bucket=new int[5001];
        for(int num:nums)bucket[num]++;
        int len=nums.length;
        int small,big;//穿插数字时的上界
        //总长度为奇数时，“小 大 小 大 小”边界左右都为较小的数；
        //总长度为偶数时，“小 大 小 大”边界左为较小的数，边界右为较大的数
        if((len&1)==1){
            small=len-1;
            big=len-2;
        }else{
            small=len-2;
            big=len-1;
        }
        int j=5000; //从后往前，将桶中数字穿插到数组中，后界为j
        //桶中大的数字在后面，小的数字在前面，所以先取出较大的数字，再取出较小的数字
        //先将桶中的较大的数字穿插放在nums中
        for(int i=1;i<=big;i+=2){
            while (bucket[j]==0)j--;//找到不为0的桶
            nums[i]=j;
            bucket[j]--;
        }
        //再将桶中的较小的数字穿插放在nums中
        for(int i=0;i<=small;i+=2){
            while (bucket[j]==0)j--;//找到不为0的桶
            nums[i]=j;
            bucket[j]--;
        }
    }
```

# [326. 3 的幂](https://leetcode-cn.com/problems/power-of-three/)

```java
// 如果一个数字是3的某次幂，那么这个数一定只含有3这个质数因子
// 1162261467是int型范围内，最大的3的幂，它是3的19次方
// 这个1162261467只含有3这个质数因子，如果n也是只含有3这个质数因子，那么
// 1162261467 % n == 0
// 反之如果1162261467 % n != 0 说明n一定含有其他因子
public static boolean isPowerOfThree(int n) {
   return (n > 0 && 1162261467 % n == 0);
}
```

# [328. 奇偶链表](https://leetcode-cn.com/problems/odd-even-linked-list/)

偶数下标的节点保持相对顺序全部放到最后面

```java
public ListNode oddEvenList(ListNode head) {
   ListNode firstOdd = null;
   ListNode firstEven = null;
   ListNode odd = null;
   ListNode even = null;
   ListNode next = null;
   int count = 1;
   while (head != null) {
      next = head.next;
      head.next = null;
      if ((count & 1) == 1) {
         firstOdd = firstOdd == null ? head : firstOdd;
         if (odd != null) {
            odd.next = head;
         }
         odd = head;
      } else {
         firstEven = firstEven == null ? head : firstEven;
         if (even != null) {
            even.next = head;
         }
         even = head;
      }
      count++;
      head = next;
   }
   if (odd != null) {
      odd.next = firstEven;
   }
   return firstOdd != null ? firstOdd : firstEven;
}
```





# 337. 打家劫舍 III

[337. 打家劫舍 III](https://leetcode-cn.com/problems/house-robber-iii/)





# [340. 至多包含 K 个不同字符的最长子串](https://leetcode-cn.com/problems/longest-substring-with-at-most-k-distinct-characters)([[)

#### 用滑动窗口 必须找到窗口内某个值是单调的 才好用

给定字符串 k   找少于等于k种字符的最长子串



窗口扩大只会导致种类增加或者不变





# [341. 扁平化嵌套列表迭代器](https://leetcode-cn.com/problems/flatten-nested-list-iterator/)

给你一个嵌套的整数列表 nestedList 。每个元素要么是一个整数，要么是一个列表；该列表的元素也可能是整数或者是其他列表。请你实现一个迭代器将其扁平化，使之能够遍历这个列表中的所有整数。

```java
实现扁平迭代器类 NestedIterator:
NestedIterator(List<NestedInteger> nestedList) 用嵌套列表 nestedList 初始化迭代器。
int next() 返回嵌套列表的下一个整数。
boolean hasNext() 如果仍然存在待迭代的整数，返回 true ；否则，返回 false 。
```


你的代码将会用下述伪代码检测：

```java
initialize iterator with nestedList
res = []
while iterator.hasNext()
    append iterator.next() to the end of res
return res
```

- **准备一个栈 存当前深度坐标** 利用递归回溯顺序压栈 得到入栈顺序

  顶	l	整体下标	  l

  ​		l  第二层下标  l

  ​		l  第三层下标  l

  ​		l	 	......	   	  l

  底	l  __ __ __  __  __l



# [348. 设计井字棋](https://leetcode-cn.com/problems/design-tic-tac-toe)

实现move(行,列,人) 返回谁赢了或者没人赢

```java
class TicTacToe {
   private int[][] rows;
   private int[][] cols;
   private int[] leftUp;
   private int[] rightUp;
   private boolean[][] matrix;
   private int N;

   public TicTacToe(int n) {
      // rows[a][1] : 1这个人，在a行上，下了几个
      // rows[b][2] : 2这个人，在b行上，下了几个
      rows = new int[n][3]; //0 1 2
      cols = new int[n][3];
      // leftUp[2] = 7 : 2这个人，在左对角线上，下了7个
      leftUp = new int[3];
      // rightUp[1] = 9 : 1这个人，在右对角线上，下了9个
      rightUp = new int[3];
      matrix = new boolean[n][n];
      N = n;
   }

   public int move(int row, int col, int player) {
      if (matrix[row][col]) {
         return 0;
      }
      matrix[row][col] = true;
      rows[row][player]++;
      cols[col][player]++;
      if (row == col) {
         leftUp[player]++;
      }
      if (row + col == N - 1) {
         rightUp[player]++;
      }
      if (rows[row][player] == N || cols[col][player] == N || leftUp[player] == N || rightUp[player] == N) {
         return player;
      }
      return 0;
   }

}
```

# ==373.查找和最小的K对数字==(数据结构重要性)

给定两个以 升序排列 的整数数组 nums1 和 nums2 , 以及一个整数 k 。

定义一对值 (u,v)，其中第一个元素来自 nums1，第二个元素来自 nums2 。

请找到和最小的 k 个数对 (u1,v1),  (u2,v2)  ...  (uk,vk) 。
链接：https://leetcode-cn.com/problems/find-k-pairs-with-smallest-sums

```java
class Solution {
    public List<List<Integer>> kSmallestPairs(int[] nums1, int[] nums2, int k) {
        PriorityQueue<int[]> queue = new PriorityQueue<>(
                nums1.length, (o1, o2) -> nums1[o1[0]] + nums2[o1[1]] - nums1[o2[0]] - nums2[o2[1]]
        );
        for (int i = 0; i < nums1.length; i++) {
            queue.add(new int[]{i, 0});
        }
        List<List<Integer>> result = new ArrayList<>();
        k = Math.min(nums1.length * nums2.length, k);
        while (k-- > 0) {
            int[] next = queue.poll();
            if (next[1] + 1 < nums2.length) {
                queue.offer(new int[]{next[0], next[1] + 1});
            }
            result.add(Arrays.asList(nums1[next[0]], nums2[next[1]]));
        }
        return result;
    }
}
```



# [380. O(1) 时间插入、删除和获取随机元素](https://leetcode-cn.com/problems/insert-delete-getrandom-o1/)

填洞 方便生成随机数

![image-20211229153819933](https://s2.loli.net/2021/12/29/VLHbPAv2YqRQzX4.png)

```java
public class RandomizedSet {  
     
   private HashMap<Integer, Integer> keyIndexMap;  
 private HashMap<Integer, Integer> indexKeyMap;  
 private int size;  
  
 public RandomizedSet() {  
      keyIndexMap = new HashMap<Integer, Integer>();  
 indexKeyMap = new HashMap<Integer, Integer>();  
 size = 0;  
 }  
  
   public boolean insert(int val) {  
      if (!keyIndexMap.containsKey(val)) {  
         keyIndexMap.put(val, size);  
 indexKeyMap.put(size++, val);  
 return true; }  
      return false;  
 }  
  
   public boolean remove(int val) {  
      if (keyIndexMap.containsKey(val)) {  
         int deleteIndex = keyIndexMap.get(val);  
 int lastIndex = --size;  
 int lastKey = indexKeyMap.get(lastIndex);  
 keyIndexMap.put(lastKey, deleteIndex);  
 indexKeyMap.put(deleteIndex, lastKey);  
 keyIndexMap.remove(val);  
 indexKeyMap.remove(lastIndex);  
 return true; }  
      return false;  
 }  
  
   public int getRandom() {  
      if (size == 0) {  
         return -1;  
 }  
      int randomIndex = (int) (Math.random() * size);  
 return indexKeyMap.get(randomIndex);  
 }  
}
```



```java
class Solution {  
   private int[] origin;  
 private int[] shuffle;  
 private int N;  
  
 public Solution(int[] nums) {  
      origin = nums;  
 N = nums.length;  
 shuffle = new int[N];  
 for (int i = 0; i < N; i++) {  
         shuffle[i] = origin[i];  
 }  
   }  
  
   public int[] reset() {  
      return origin;  
 }  
  
   public int[] shuffle() {  
      for (int i = N - 1; i >= 0; i--) {  
         int r = (int) (Math.random() * (i + 1));  
 int tmp = shuffle[r];  
 shuffle[r] = shuffle[i];  
 shuffle[i] = tmp;  
 }  
      return shuffle;  
 }  
}
```

# [384. 打乱数组](https://leetcode-cn.com/problems/shuffle-an-array/)




# [347. 前 K 个高频元素](https://leetcode-cn.com/problems/top-k-frequent-elements/)[[门槛堆]]
给你一个整数数组 `nums` 和一个整数 `k` ，请你返回其中出现频率前 `k` 高的元素。你可以按 **任意顺序** 返回答案。

**得到词频表 然后按照次数维护小根堆 新来的元素能不能把门槛儿干掉
自己进来 所以不能用大根堆**

```java
public static class Node {  
   public int num;  
 public int count;  
  
 public Node(int k) {  
      num = k;  
 count = 1;  
 }  
}  
  
public static class CountComparator implements Comparator<Node> {  
  
   @Override  
 public int compare(Node o1, Node o2) {  
      return o1.count - o2.count;  
 }  
  
}  
  
public static int[] topKFrequent(int[] nums, int k) {  
   HashMap<Integer, Node> map = new HashMap<>();  
 for (int num : nums) {  
      if (!map.containsKey(num)) {  
         map.put(num, new Node(num));  
 } else {  
         map.get(num).count++;  
 }  
   }  
   PriorityQueue<Node> heap = new PriorityQueue<>(new CountComparator());  
 for (Node node : map.values()) {  
      if (heap.size() < k || (heap.size() == k && node.count > heap.peek().count)) {  
         heap.add(node);  
 }  
      if (heap.size() > k) {  
         heap.poll();  
 }  
   }  
   int[] ans = new int[k];  
 int index = 0;  
 while (!heap.isEmpty()) {  
      ans[index++] = heap.poll().num;  
 }  
   return ans;  
}
```



# 394. 字符串解码

[394. 字符串解码](https://leetcode-cn.com/problems/decode-string/)





# 406. 根据身高重建队列

[406. 根据身高重建队列](https://leetcode-cn.com/problems/queue-reconstruction-by-height/)





# 416. 分割等和子集

[416. 分割等和子集](https://leetcode-cn.com/problems/partition-equal-subset-sum/)



# 437. 路径总和 III

[437. 路径总和 III](https://leetcode-cn.com/problems/path-sum-iii/)







# [454. 四数相加 II](https://leetcode-cn.com/problems/4sum-ii/)

给你四个整数数组 nums1、nums2、nums3 和 nums4 ，数组长度都是 n ，请你计算有多少个元组 (i, j, k, l) 能满足：

0 <= i, j, k, l < n
nums1[i] + nums2[j] + nums3[k] + nums4[l] == 0



给四个数组 A, B, C, D 

AB所有组合 的 和存在表里

CD所有组合 的 和存在表里

然后两个表对应查找答案次数

```java
public static int fourSumCount(int[] A, int[] B, int[] C, int[] D) {
   HashMap<Integer, Integer> map = new HashMap<>();
   int sum = 0;
   for (int i = 0; i < A.length; i++) {
      for (int j = 0; j < B.length; j++) {
         sum = A[i] + B[j];
         if (!map.containsKey(sum)) {
            map.put(sum, 1);
         } else {
            map.put(sum, map.get(sum) + 1);
         }
      }
   }
   int ans = 0;
   for (int i = 0; i < C.length; i++) {
      for (int j = 0; j < D.length; j++) {
         sum = C[i] + D[j];
         if (map.containsKey(-sum)) {
            ans += map.get(-sum);
         }
      }
   }
   return ans;
}
```

# [673. 最长递增子序列的个数](https://leetcode-cn.com/problems/number-of-longest-increasing-subsequence/)

给定一个未排序的整数数组，找到最长递增子序列的个数。

示例 1:

输入: [1,3,5,4,7]
输出: 2
解释: 有两个最长递增子序列，分别是 [1, 3, 4, 7] 和[1, 3, 5, 7]。

![image-20220102162041115](https://s2.loli.net/2022/01/02/TN734cX1BjdG9L2.png)



长度为1  长度为2 长度为3 ... 长度为10 ... 

分别统计以某个数结尾 的最长长度

然后后面就能依赖了



**常规**O(n^2)

```java
// 好理解的方法，时间复杂度O(N^2)
public static int findNumberOfLIS1(int[] nums) {
   if (nums == null || nums.length == 0) {
      return 0;
   }
   int n = nums.length;
   int[] lens = new int[n];
   int[] cnts = new int[n];
   lens[0] = 1;
   cnts[0] = 1;
   int maxLen = 1;
   int allCnt = 1;
   for (int i = 1; i < n; i++) {
      int preLen = 0;
      int preCnt = 1;
      for (int j = 0; j < i; j++) {
         if (nums[j] >= nums[i] || preLen > lens[j]) {
            continue;
         }
         if (preLen < lens[j]) {
            preLen = lens[j];
            preCnt = cnts[j];
         } else {
            preCnt += cnts[j];
         }
      }
      lens[i] = preLen + 1;
      cnts[i] = preCnt;
      if (maxLen < lens[i]) {
         maxLen = lens[i];
         allCnt = cnts[i];
      } else if (maxLen == lens[i]) {
         allCnt += cnts[i];
      }
   }
   return allCnt;
}
```

==35=>54:00==

```java
class Solution {
// 优化后的最优解，时间复杂度O(N*logN)
	public static int findNumberOfLIS(int[] nums) {
		if (nums == null || nums.length == 0) {
			return 0;
		}
		ArrayList<TreeMap<Integer, Integer>> dp = new ArrayList<>();
		int len = 0;
		int cnt = 0;
		for (int num : nums) {
			// num之前的长度，num到哪个长度len+1
			len = search(dp, num);
			// cnt : 最终要去加底下的记录，才是应该填入的value
			if (len == 0) {
				cnt = 1;
			} else {
				TreeMap<Integer, Integer> p = dp.get(len - 1);
				cnt = p.firstEntry().getValue() - (p.ceilingKey(num) != null ? p.get(p.ceilingKey(num)) : 0);
			}
			if (len == dp.size()) {
				dp.add(new TreeMap<Integer, Integer>());
				dp.get(len).put(num, cnt);
			} else {
				dp.get(len).put(num, dp.get(len).firstEntry().getValue() + cnt);
			}
		}
		return dp.get(dp.size() - 1).firstEntry().getValue();
	}

	// 二分查找，返回>=num最左的位置
	public static int search(ArrayList<TreeMap<Integer, Integer>> dp, int num) {
		int l = 0, r = dp.size() - 1, m = 0;
		int ans = dp.size();
		while (l <= r) {
			m = (l + r) / 2;
			if (dp.get(m).firstKey() >= num) {
				ans = m;
				r = m - 1;
			} else {
				l = m + 1;
			}
		}
		return ans;
	}
}
```





# [687. 最长同值路径](https://leetcode-cn.com/problems/longest-univalue-path/)[[二叉树递归套路]]

给定一个二叉树，找到最长的路径，这个路径中的每个节点具有相同值。 这条路径可以经过也可以不经过根节点。

**注意**：两个节点之间的路径长度由它们之间的边数表示。

```java
public static class TreeNode {
   public int val;
   public TreeNode left;
   public TreeNode right;

   public TreeNode(int v) {
      val = v;
   }
}

public static int longestUnivaluePath(TreeNode root) {
   if (root == null) {
      return 0;
   }
   return process(root).max - 1;
}

// 建设以x节点为头的树，返回两个信息
public static class Info {
   // 在一条路径上：要求每个节点通过且只通过一遍
   public int len; // 路径必须从x出发且只能往下走的情况下，路径的最大距离
   public int max; // 路径不要求必须从x出发的情况下，整棵树的合法路径最大距离

   public Info(int l, int m) {
      len = l;
      max = m;
   }
}

private static Info process(TreeNode x) {
   if (x == null) {
      return new Info(0, 0);
   }
   TreeNode l = x.left;
   TreeNode r = x.right;
   // 左树上，不要求从左孩子出发，最大路径
   // 左树上，必须从左孩子出发，往下的最大路径
   Info linfo = process(l);
   // 右树上，不要求从右孩子出发，最大路径
   // 右树上，必须从右孩子出发，往下的最大路径
   Info rinfo = process(r);
   // 必须从x出发的情况下，往下的最大路径
   int len = 1;
   if (l != null && l.val == x.val) {
      len = linfo.len + 1;
   }
   if (r != null && r.val == x.val) {
      len = Math.max(len, rinfo.len + 1);
   }
   // 不要求从x出发，最大路径
   int max = Math.max(Math.max(linfo.max, rinfo.max), len);
   if (l != null && r != null && l.val == x.val && r.val == x.val) {
      max = Math.max(max, linfo.len + rinfo.len + 1);
   }
   return new Info(len, max);
}
```



