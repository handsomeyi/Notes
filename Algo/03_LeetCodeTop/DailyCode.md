
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





# 2049. 统计最高分的节点数目

2022年3月11日

```java
/**
 * 给你一棵根节点为 0 的 二叉树 ，它总共有 n 个节点，节点编号为 0 到 n - 1 。
 * 同时给你一个下标从 0 开始的整数数组 parents 表示这棵树，其中 parents[i] 是节点 i 的父节点。
 * 由于节点 0 是根，所以 parents[0] == -1 。
 *
 * 一个子树的 大小 为这个子树内节点的数目。
 * 每个节点都有一个与之关联的 分数 。
 * 求出某个节点分数的方法是，将这个节点和与它相连的边全部 删除 ，
 * 剩余部分是若干个 非空 子树，这个节点的 分数 为所有这些子树 大小的乘积 。
 *
 * 请你返回有 最高得分 节点的 数目 。
 */

// 删除一个节点最多把整颗树分割成三部分：左子树、右子树、父节点及父节点的另一半子树
// 所以，我们可以遍历每个节点的左右子树的数目，
// 父节点及父节点的另一半子树的数量就等于 总节点数 减去 左右子树的数目 再减 一
// 三者相乘就是分数，没有的部分用 1 代替
// 而我们需要先构造出来这颗树才能通过DFS遍历
public class Test03二叉树DFS {
    static class Node {
        Node l;
        Node r;
        void addChild(Node child) {
            if (this.l == null) {
                this.l = child;
            } else {
                this.r  = child;
            }
        }
    }
    long maxScore = 0;
    int ans = 0;
    int n;

    public int countHighestScore(int[] parents) {
        n = parents.length;
        Node[] nodes = new Node[n];
        for (int i = 0; i < n; i++) { // 先把所有Node new出来
            nodes[i] = new Node();
        }
        for (int i = 1; i < n; i++) { // 再建立关系 从一开始记住了!
            nodes[parents[i]].addChild(nodes[i]);
        }
        dfs(nodes[0]);
        return ans;
    }

    public int dfs(Node node) {
        if (node == null) {
            return 0;
        }
        int l = dfs(node.l);
        int r = dfs(node.r);
        int rest = n - l - r - 1;
        long score = help(l) * help(r) * help(rest); // 最多三部分 因为是二叉树
        if (score == maxScore) {
            ans++;
        } else if (score > maxScore) {
            maxScore = score;
            ans = 1;
        }
        return l + r + 1;
    }

    private long help(int count) {
        return count == 0 ? 1 : count;
    }


}
```

