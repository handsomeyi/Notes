## 动态规划转移方程

https://leetcode-cn.com/problems/zui-chang-bu-han-zhong-fu-zi-fu-de-zi-zi-fu-chuan-lcof/

请从字符串中找出一个最长的不包含重复字符的子字符串，计算该最长子字符串的长度。

![image-20211210154810495](https://s2.loli.net/2021/12/10/d7Hc2avhAurJQg5.png)

```java
public int lengthOfLongestSubstring(String s) {
    Map<Character, Integer> dic = new HashMap<>();
    int res = 0, tmp = 0;
    for(int j = 0; j < s.length(); j++) {
        int i = dic.getOrDefault(s.charAt(j), -1); // 获取索引 i
        dic.put(s.charAt(j), j); // 更新哈希表
        tmp = tmp < j - i ? tmp + 1 : j - i; // dp[j - 1] -> dp[j]
        res = Math.max(res, tmp); // max(dp[j - 1], dp[j])
    }
    return res;
}
```
