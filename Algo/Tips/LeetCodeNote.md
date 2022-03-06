### 动态规划转移方程

https://leetcode-cn.com/problems/zui-chang-bu-han-zhong-fu-zi-fu-de-zi-zi-fu-chuan-lcof/

请从字符串中找出一个最长的**==不包含重复字符的子字符串==**，计算该最长子字符串的长度。

![image-20211210154810495](https://s2.loli.net/2021/12/10/d7Hc2avhAurJQg5.png)

```java
public int lengthOfLongestSubstring(String s) {
    Map<Character, Integer> dic = new HashMap<>();
    int res = 0, tmp = 0;
    for(int j = 0; j < s.length(); j++) { // 遍历字符串 s
        int i = dic.getOrDefault(s.charAt(j), -1); // 获取索引 i
        dic.put(s.charAt(j), j); // 更新哈希表
        tmp = tmp < j - i ? tmp + 1 : j - i; // dp[j - 1] -> dp[j]
        res = Math.max(res, tmp); // max(dp[j - 1], dp[j])
    }
    return res;
}
```



```java
public int lengthOfLongestSubstring(String s) {
        //if(s==null) return 0;这句话可以不加，s.length()长度为0时，不进入下面的循环，会直接返回max=0;
        //划定当前窗口的坐标为(start,i],左开右闭,所以start的初始值为-1，而非0。
        int max = 0,start =-1;
        //使用哈希表map统计 各字符最后一次 出现的索引位置
        HashMap<Character,Integer> map = new HashMap<>();
        for(int i=0;i<s.length();i++){
            char tmp = s.charAt(i);
//当字符在map中已经存储时，需要判断其索引值index和当前窗口start的大小以确定是否需要对start进行更新:
//当index>start时，start更新为当前的index,否则保持不变。
//注意若index作为新的start，计算当前滑动空间的长度时也是不计入的，左开右闭，右侧s[i]会计入，这样也是防止字符的重复计入。
            if(map.containsKey(tmp)) start = Math.max(start,map.get(tmp));
            
            //如果map中不含tmp，此处是在map中新增一个键值对，否则是对原有的键值对进行更新
            map.put(tmp,i);
            
            //i-start,为当前滑动空间(start,i]的长度，若其大于max，则需要进行更新。
            max = Math.max(max,i-start);
        }
        return max;
    }
```



```java
public int lengthOfLongestSubstring(String s) {
    // 记录每个字母出现的最后位置
    HashMap<Character, Integer> hashMap = new HashMap<>();
    int left = 0;
    int right = 0;
    int res = 0;
    while (right < s.length()) {
        char ch = s.charAt(right);
        // 当前值已经出现过了，更新左边界
        if (hashMap.containsKey(ch)) {
            // 另 left = 当前值最后一次出现的地方 + 1, 使得[left,right]无重复值
            // 需要取较大值
            left = Math.max(left, hashMap.get(ch) + 1);
        }
        //更新最后出现下标
        hashMap.put(ch, right);
        // [left,right]的长度
        res = Math.max(res, right - left + 1);
        right++;
    }
    return res;
}
```



### 贪心

**(大根堆)**

先按课程的截止时间由小到大排序；

再遍历课程，依次考察是否可选：

```
1）用一个变量维持当前时间，选择后更新当前时间；
2）用一个大根堆维持已被选中的课程，大根堆根据课程的持续时间组织；
```

课程可选的条件是：

```
1）当前时间+该课程持续时间<=该课程截止时间 ：此时，直接选修该课程；
2）当前时间+该课程持续时间 > 该课程截止时间 && 该课程持续时间 < 堆顶课程的持续时间 ： 此时选择该课程，淘汰堆顶课程；
```

```java
public static int scheduleCourse(int[][] courses) {
    Arrays.sort(courses, ((o1, o2) -> o1[1] - o2[1]));
    int curTime = 0;
    //这里直接存数组更快 而不是直接用Integer 那样会有zhuang'xiang'ca
    PriorityQueue<int[]> maxHeap = new PriorityQueue<>((o1, o2) -> o2[0] - o1[0]);
    for (int[] course : courses) {
        if (curTime + course[0] <= course[1]) { 
            // 满足条件1），直接选修该课程
            maxHeap.add(course);
            curTime += course[0];
        } 
        else if (!maxHeap.isEmpty() && maxHeap.peek()[0] > course[0]) { 
            // 满足条件2），剔除堆顶再选修该课程
            int[] c = maxHeap.poll();
            curTime -= c[0];
            maxHeap.add(course);
            curTime += course[0];
        }
    }
    return maxHeap.size();
}
```



作者：tong-zhu
链接：https://leetcode-cn.com/problems/course-schedule-iii/solution/tong-ge-lai-shua-ti-la-630-ke-cheng-biao-uhlu/

比如说，给定的两门课程为：[1, 3] 和 [2, 5]，这时候，我们无论先学习哪门课程都是可以完成两门课程的。

再比如说，给定的两门课程为：[1, 2] 和 [2, 4]，这时候，如果先学习后者再学习前者，会导致 d2 + d1 > l1，将无法完成前者的学习，因此，我们只能先学习前者再学习后者。

所以，归到一般情况，我们选择截止时间更近的课程优选学习总是优于选择截止时间更远的课程学习。

因此，我们可以将所有课程按截止时间排序，然后依次学习。

但是，这样并不能保证我们前面遍历到的课程学习了，后面的课程就一定能够学习得了。

比如说，给定了三门课程分别为：[1,2] 、[3, 4]、[2, 5]，这时候，当选择到第三门课程的时候，发现 1 + 3 + 2 > 5 的，所以，第三门课程是学习不了的，那么，这时候，在第二门和第三门课程中间做一个选择，你会怎么选择呢？（因为后面可能还有个 [3, 6] 的课程）

因为题目要求了返回 能够学习的最大课程数目，所以，我们应该优先选择学习时长更短的课程，对于上例来说，我们选择 [2, 5] 优于 [3, 4]，因为 [2, 5] 学习时长更短，相当于我们可以有更多的时间学习后续的课程。

因此，我们可以使用优先级队列（大根堆）来维护已经选择了的课程，当出现冲突的时候，我们比较堆顶元素与待选择元素的学习时长，选择时长更短的课程进行学习。

```java
class Solution {
    public int scheduleCourse(int[][] courses) {
        // 按课程截止时间升序排序
        Arrays.sort(courses, (a, b) -> a[1] - b[1]);
        // 大根堆，学习时长更长的在堆顶
        PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> b[0] - a[0]);
        // 记录总学习时长
        int total = 0;
        // 按截止时间从近到远遍历课程
        for (int[] course : courses) {
            // 如果总时长不会超过截止时间，那么，当前这门课程可以选择，直接入堆
            if (total + course[0] <= course[1]) {
                total += course[0];
                heap.offer(course);
            } else if (!heap.isEmpty() && heap.peek()[0] > course[0]) {
                // 出现冲突，优先选择学习时长更短的课程
                total = total - heap.poll()[0] + course[0];
                heap.offer(course);
            }
        }
        // 堆中有多少课程就是结果
        return heap.size();
    }
}
```



### 如果有些问题 能转化成出度入度的感觉 就能用图来尝试

















