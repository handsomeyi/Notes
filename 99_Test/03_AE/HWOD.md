# 输入法单词联想

![image-20220702163148549](https://s2.loli.net/2022/07/02/M4BQy7FVjsvJuEI.png)

```java
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Scanner;
/*
 * @Author:deeys
 * @Date:2022/6/30
 * @Description:a_exam
 */
// The furthest distance in the world, Is not between life and death, But when I stand in front of you, Yet you don't know that I love you.
public class TestHuaWei {

    public static void main(String args[]){
        Scanner sc=new Scanner(System.in);
        String str = sc.nextLine(), pre = sc.nextLine();
        System.out.println(sysOut(str, pre));
    }

    public static String sysOut(String str, String pre) {
        str = str.replace(",", "");
        str = str.replace(".", "");
        str = str.replace("'", " ");
        String[] strArray = str.split(" ");
        Arrays.sort(strArray);
        ArrayList<String> ans = new ArrayList<>();
        for (String s : strArray) {
            if (s.startsWith(pre)) {
                ans.add(s);
            }
        }
        if (ans.size() == 0) return pre;
        String preWord = "";
        StringBuilder sb = new StringBuilder();
        for (String word : ans) {
            if (!word.equals(preWord)) {
                sb.append(word + " ");
                preWord = word;
            }
        }
        return sb.toString().trim();
    }
}
```

# 射击成绩单

![image-20220702164447494](https://s2.loli.net/2022/07/02/SZKPTXeYV7Hctpn.png)

```java
package a_exam;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Scanner;

/*
 * @Author:deeys
 * @Date:2022/6/30
 * @Description:a_exam
 */
public class TestHuaWei2 {
        public static void main(String args[]){
            Scanner sc=new Scanner(System.in);
            int N = sc.nextInt();
            String str1 = sc.next();
            String str2 = sc.next();
            String[] arr1 = str1.split(",");
            String[] arr2 = str2.split(",");
            int[] shootId = new int[N];
            int[] score = new int[N];
            for (int i = 0; i < N; i++) {
                shootId[i] = Integer.parseInt(arr1[i]);
                score[i] = Integer.parseInt(arr2[i]);
            }
            System.out.println(sysOut(shootId, score, N));
        }

        public static String sysOut(int[] shootId, int[] score, int N) {
            HashMap<Integer, ArrayList<Integer>> map = new HashMap<>();
            for (int i = 0; i < N; i++) {
                if (!map.containsKey(shootId[i])) {
                    map.put(shootId[i], new ArrayList<Integer>());
                    map.get(shootId[i]).add(score[i]);
                } else {
                    map.get(shootId[i]).add(score[i]);
                }
            }
            for (ArrayList list : map.values()) {
                list.sort((a,b) -> (int)b - (int)a);
            }
            HashMap<Integer, Integer> scoreMap = new HashMap<>();
            for (Integer id : map.keySet()) {
                if (map.get(id).size() < 3) continue;
                scoreMap.put(id, map.get(id).get(0) + map.get(id).get(1) + map.get(id).get(2));
            }

            int[][] sum = new int[scoreMap.size()][2];
            int cnt = 0;

            for (Integer id : scoreMap.keySet()) {
                sum[cnt][0] = id;
                sum[cnt++][1] = scoreMap.get(id);
            }

            Arrays.sort(sum, (a, b) -> a[1] == b[1] ? b[0] - a[0] : b[1] - a[1]);

            StringBuilder sb = new StringBuilder();
            for (int[] arr : sum) {
                sb.append(arr[0] + ",");
            }
            return sb.toString().substring(0, sb.toString().length() - 1);
        }
}
```



# 还原二叉树 且中序遍历

![image-20220702164458953](https://s2.loli.net/2022/07/02/FZexDfqgp5WrIBG.png)