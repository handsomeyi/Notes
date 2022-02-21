
# 69.煎饼排序[双指针实现翻转数组]
[969. 煎饼排序](https://leetcode-cn.com/problems/pancake-sorting/)
```java
class Solution {
    public List<Integer> pancakeSort(int[] arr) {
        int n = arr.length;
        int[] idxs = new int[n + 10];
        for (int i = 0; i < n; i++) {
            idxs[arr[i]] = i;//把arr对应值的下标 存入idxs中 存的是下标
        }
        List<Integer> ans = new ArrayList<>();
        for (int i = n; i >= 1; i--) {//arr中找n
            int idx = idxs[i]; //拿到n的下标
            if (idx == i - 1) continue;
            if (idx != 0) {
                ans.add(idx + 1);
                reverse(arr, 0, idx, idxs);//把n转到0下标处
            }
            ans.add(i);
            reverse(arr, 0, i - 1, idxs);//把n从1转到i-1处
        }
        return ans;
    }
    void reverse(int[] arr, int i, int j, int[] idxs) {
        while (i < j) {//翻转通过改变idxs中的值来代替
            idxs[arr[i]] = j;
            idxs[arr[j]] = i;
            int temp = arr[i];
            arr[i++] = arr[j];
            arr[j--] = temp;
        }
    }
}
```