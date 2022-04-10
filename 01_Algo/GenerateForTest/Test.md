

# 生成定长一维数组

```java
// for test
public static int[] generateArray(int len, int max) {
   int[] ans = new int[(int) (Math.random() * len) + 1];
   for (int i = 0; i < ans.length; i++) {
      ans[i] = (int) (Math.random() * max);
   }
   return ans;
}
```

# 生成随机长度一维数组

```java
// for test
public static int[] generateRandomArray(int maxSize, int maxValue) {
   int[] arr = new int[(int) ((maxSize + 1) * Math.random())];
   for (int i = 0; i < arr.length; i++) {
      arr[i] = (int) ((maxValue + 1) * Math.random()) - (int) (maxValue * Math.random());
   }
   return arr;
}
```

# 生成二维数组 & 打印二维数组

```java
public static int[][] generateArray(int row, int col, double maxValue) {
    int[][] ans = new int[row][col];
    for (int i = 0; i < row; i++) {
        for (int j = 0; j < col; j++) {
            ans[i][j] = (int) (Math.random() * maxValue);
        }
    }
    return ans;
}

public static void printArray(int[][] array) {
    for (int[] ints : array) {
        int iMax = ints.length - 1;
        StringBuilder b = new StringBuilder();
        b.append('[');
        for (int i = 0; i <= iMax; i++) {
            if (ints[i] < 10) b.append(" " + ints[i]);
            else b.append(ints[i]);
            if (i == iMax) b.append(']').toString();
            else b.append(", ");
        }
        System.out.println(b);
    }
}
```