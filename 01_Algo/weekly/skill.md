# MRQ方法 不可修改的范围最大最小值查询 易于实现

比线段树的范围查询 **简单多了** 代码量也少很多

![image-20220629171007541](https://s2.loli.net/2022/06/29/g6iDJpbVRfhYMyx.png)

填表的思路就是 找到上一轮 的两个位置的值a,b 而max(a, b) => 就是这一轮的区间最大值

```java
	public static class RMQ {
		public int[][] max;

		// 下标一定要从1开始，没有道理！就是约定俗成！
		public RMQ(int[] arr) {
			// 长度！
			int n = arr.length;
			// 2的几次方，可以拿下n
			int k = power2(n);
			// n*logn
			max = new int[n + 1][k + 1];
			for (int i = 1; i <= n; i++) {
				// i 0：从下标i开始，往下连续的2的0次方个数，中，最大值
				// 1...1个
				// 2...1个
				// 3...1个
				max[i][0] = arr[i - 1];
			}
			for (int j = 1; (1 << j) <= n; j++) {
				// i...连续的、2的1次方个数，这个范围，最大值
				// i...连续的、2的2次方个数，这个范围，最大值
				// i...连续的、2的3次方个数，这个范围，最大值
				for (int i = 1; i + (1 << j) - 1 <= n; i++) {
					// max[10][3]
					// 下标10开始，连续的8个数，最大值是多少
					// 1) max[10][2]
					// 2) max[14][2]
					max[i][j] = Math.max(
							max[i][j - 1], 
							max[i + (1 << (j - 1))][j - 1]);
				}
			}
		}

		public int max(int l, int r) {
			// l...r -> r - l + 1 -> 2的哪个次方最接近它！
			int k = power2(r - l + 1);
			return Math.max(max[l][k], max[r - (1 << k) + 1][k]);
		}

		private int power2(int m) {
			int ans = 0;
			while ((1 << ans) <= (m >> 1)) {
				ans++;
			}
			return ans;
		}

	}
```

