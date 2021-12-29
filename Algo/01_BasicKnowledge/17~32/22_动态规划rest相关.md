

# 打怪兽

给定3个参数，**N，M，K**
怪兽有**N滴血**，等着英雄来砍自己
英雄每一次打击，都会让怪兽流失**[0-M]**的血量, 每一次在**[0~M]**上等概率的获得一个值
求**K次打击**之后，英雄把怪兽砍死的概率

## 解题

递归得到杀死的可能, 

约束: N<=0就行

总可能性: (M+1)^k

```java
public static long process(int times, int M, int hp) {
   if (times == 0) {
      return hp <= 0 ? 1 : 0;
   }
   if (hp <= 0) {
      return (long) Math.pow(M + 1, times);
   }
   long ways = 0;
   for (int i = 0; i <= M; i++) {
      ways += process(times - 1, M, hp - i);
   }
   return ways;
}
```

dp1

```java
public static double dp1(int N, int M, int K) {
   if (N < 1 || M < 1 || K < 1) {
      return 0;
   }
   long all = (long) Math.pow(M + 1, K);
   long[][] dp = new long[K + 1][N + 1];
   dp[0][0] = 1;
   for (int times = 1; times <= K; times++) {
      dp[times][0] = (long) Math.pow(M + 1, times);
      for (int hp = 1; hp <= N; hp++) {
         long ways = 0;
         for (int i = 0; i <= M; i++) {
            if (hp - i >= 0) {
               ways += dp[times - 1][hp - i];
            } else {
               //hp < 0直接获得生存点
               ways += (long) Math.pow(M + 1, times - 1);
            }
         }
         dp[times][hp] = ways;
      }
   }
   long kill = dp[K][N];
   return (double) ((double) kill / (double) all);
}
```

dp2

![image-20211026172519937](https://raw.githubusercontent.com/handsomeyi/Pics/master/image-20211026172519937.png)

```java
public static double dp2(int N, int M, int K) {
   if (N < 1 || M < 1 || K < 1) {
      return 0;
   }
   long all = (long) Math.pow(M + 1, K);
   long[][] dp = new long[K + 1][N + 1];
   dp[0][0] = 1;
   for (int times = 1; times <= K; times++) {
      dp[times][0] = (long) Math.pow(M + 1, times);
      for (int hp = 1; hp <= N; hp++) {
         dp[times][hp] = dp[times][hp - 1] + dp[times - 1][hp];
         if (hp - 1 - M >= 0) {
            dp[times][hp] -= dp[times - 1][hp - 1 - M];
         } else {//重要
            dp[times][hp] -= Math.pow(M + 1, times - 1);
         }
      }
   }
   long kill = dp[K][N];
   return (double) ((double) kill / (double) all);
}
```

## 总结

**剪枝策略**

如果推表过程中, 原始递归过程, 有些情况会导致表不够用, 做出剪枝策略, 补进递归里去

如上的 if (hp <= 0) { return (long) Math.pow(M + 1, times); }

如果小于零, 就直接返回其分支下的枝叶



# 面值数组-组成最少货币数

arr是面值数组，其中的值都是正数且没有重复。再给定一个正数aim。
每个值都认为是一种面值，且认为张数是无限的。
返回组成aim的最少货币数

## 解题

```java
public static int minCoins(int[] arr, int aim) {
   return process(arr, 0, aim);
}

// arr[index...]面值，每种面值张数自由选择，
// 搞出rest正好这么多钱，返回最小张数
// 拿Integer.MAX_VALUE标记怎么都搞定不了
public static int process(int[] arr, int index, int rest) {
   if (index == arr.length) {
      return rest == 0 ? 0 : Integer.MAX_VALUE;
   } else {
      int ans = Integer.MAX_VALUE;
      for (int zhang = 0; zhang * arr[index] <= rest; zhang++) {
         int next = process(arr, index + 1, rest - zhang * arr[index]);
         if (next != Integer.MAX_VALUE) {
            ans = Math.min(ans, zhang + next);
         }
      }
      return ans;
   }
}

public static int dp1(int[] arr, int aim) {
   if (aim == 0) {
      return 0;
   }
   int N = arr.length;
   int[][] dp = new int[N + 1][aim + 1];
   dp[N][0] = 0;
   for (int j = 1; j <= aim; j++) {
      dp[N][j] = Integer.MAX_VALUE;
   }
   for (int index = N - 1; index >= 0; index--) {
      for (int rest = 0; rest <= aim; rest++) {
         int ans = Integer.MAX_VALUE;
         for (int zhang = 0; zhang * arr[index] <= rest; zhang++) {
            int next = dp[index + 1][rest - zhang * arr[index]];
            if (next != Integer.MAX_VALUE) {
               ans = Math.min(ans, zhang + next);
            }
         }
         dp[index][rest] = ans;
      }
   }
   return dp[0][aim];
}

public static int dp2(int[] arr, int aim) {
   if (aim == 0) {
      return 0;
   }
   int N = arr.length;
   int[][] dp = new int[N + 1][aim + 1];
   dp[N][0] = 0;
   for (int j = 1; j <= aim; j++) {
      dp[N][j] = Integer.MAX_VALUE;
   }
   for (int index = N - 1; index >= 0; index--) {
      for (int rest = 0; rest <= aim; rest++) {
         dp[index][rest] = dp[index + 1][rest];
         if (rest - arr[index] >= 0 
               && dp[index][rest - arr[index]] != Integer.MAX_VALUE) {
            dp[index][rest] = Math.min(dp[index][rest], dp[index][rest - arr[index]] + 1);
         }
      }
   }
   return dp[0][aim];
}
```



优化技巧!!!

![image-20211027160822017](https://raw.githubusercontent.com/handsomeyi/Pics/master/image-20211027160822017.png)



# 数字裂开

给定一个正数1，裂开的方法有一种，

(1) 给定一个正数2，裂开的方法有两种，(1和1)、



(2) 给定一个正数3，裂开的方法有三种，(1、1、1)、(1、2)、



(3) 给定一个正数4，裂开的方法有五种，(1、1、1、1)、(1、1、2)、(1、3)、(2、2)、 (4)
给定一个正数n，求裂开的方法数。

## 解题

先递归尝试

dp2思路

![image-20211027164749197](https://raw.githubusercontent.com/handsomeyi/Pics/master/image-20211027164749197.png)

```Java
// n为正数
public static int ways(int n) {
   if (n < 0) {
      return 0;
   }
   if (n == 1) {
      return 1;
   }
   return process(1, n);
}

// 上一个拆出来的数是pre
// 还剩rest需要去拆
// 返回拆解的方法数
public static int process(int pre, int rest) {
   if (rest == 0) {
      return 1;
   }
   if (pre > rest) {
      return 0;
   }
   int ways = 0;
   for (int first = pre; first <= rest; first++) {
      ways += process(first, rest - first);
   }
   return ways;
}

public static int dp1(int n) {
   if (n < 0) {
      return 0;
   }
   if (n == 1) {
      return 1;
   }
   int[][] dp = new int[n + 1][n + 1];
   for (int pre = 1; pre <= n; pre++) {
      dp[pre][0] = 1;
      dp[pre][pre] = 1;
   }
   for (int pre = n - 1; pre >= 1; pre--) {
      for (int rest = pre + 1; rest <= n; rest++) {
         int ways = 0;
         for (int first = pre; first <= rest; first++) {
            ways += dp[first][rest - first];
         }
         dp[pre][rest] = ways;
      }
   }
   return dp[1][n];
}

public static int dp2(int n) {
   if (n < 0) {
      return 0;
   }
   if (n == 1) {
      return 1;
   }
   int[][] dp = new int[n + 1][n + 1];
   for (int pre = 1; pre <= n; pre++) {
      dp[pre][0] = 1;
      dp[pre][pre] = 1;
   }
   for (int pre = n - 1; pre >= 1; pre--) {
      for (int rest = pre + 1; rest <= n; rest++) {
         dp[pre][rest] = dp[pre + 1][rest];
         dp[pre][rest] += dp[pre][rest - pre];
      }
   }
   return dp[1][n];
}
```



## 总结

















































