# 整体

```java
import java.util.*;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int num = sc.nextInt();//num个测试样例
        for (int i = 0; i < num; i++) {
            //每个测试样例处理的模式
            //赋值给变量
            //......coding......
            sysOut(args, args......)
        }
    }
    public static void sysOut(args, args......) {
        //......coding......
        System.out.println(ans);
    }
}
```

# 数组输入(分隔符为空格)

直接获取数量 => 循环内输入

```java
Scanner sc = new Scanner(System.in);
int N = sc.nextInt();
int[] numsN = new int[N];
for (int j = 0; j < N; j++) {
    numsN[j] = sc.nextInt();
}
```

# 数组输入(分隔符为,)

先用 **next().toString()** 获取输入字符串

然后用 **str.split(",")** 分割为字符传数组

然后用 **Integer.parseInt(arr[i])** 把字符串转化为int

```java
// 例如: 输入1, 2, 3, 4, 5
Scanner sc = new Scanner(System.in);
String str = scanner.next().toString();
String[] arr = str.split(", ");
int[] nums = new int[arr.length];
for (int i = 0; i < arr.length; i++) {
    nums[i] = Integer.parseInt(arr[i]);
}
//得到实际数组nums
```

