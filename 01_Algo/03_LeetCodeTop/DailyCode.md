
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





给出一组候选数![img](https://www.nowcoder.com/equation?tex=\ C) 和一个目标数![img](https://www.nowcoder.com/equation?tex=\ T)，找出候选数中起来和等于![img](https://www.nowcoder.com/equation?tex=%5C%20T) 的所有组合。
![img](https://www.nowcoder.com/equation?tex=%5C%20C) 中的每个数字在一个组合中只能使用一次。

注意：

- 题目中所有的数字（包括目标数![img](https://www.nowcoder.com/equation?tex=%5C%20T) ）都是正整数
- 组合中的数字 (![img](https://www.nowcoder.com/equation?tex=a_1%2C a_2%2C … %2C a_k)) 要按非递增排序 (![img](https://www.nowcoder.com/equation?tex=a_1 \leq  a_2 \leq  … \leq  a_k)).
- 结果中不能包含重复的组合

例如：给定的候选数集是[10,1,2,7,6,1,5]，目标数是8

解集是：

[1, 7]
[1, 2, 5]
[2, 6]
[1, 1, 6]





https://leetcode-cn.com/problems/minimum-height-trees/comments/1488504



```java
	public List<Integer> findMinHeightTrees(int n, int[][] edges) {
        // 看了评论才知道, 可以通过找到最长链的中点(1-2个)确定那个根
        // 因为对于最长链上的中点, 它的两个子树(一个点可以多个儿子,
        // 但是属于最长链的就两个儿子)都是都是等长(对于偶数长度的最
        // 长链的两个中点的两个子树长度也只差1), 如果从这个中点往外找任意一个
        // 点作为根, 它都有一条路经过中点然后加上最长链的一条边
        // 以上为个人理解
        // 可以通过不断删除度为1的结点最后剩下1-2个结点来找到中点
        // 个人理解: 删除度为1的结点, 可以看作对一条长链表删除两端(因为其它从
        // 根结点出来的路径会更短, 因此都会在长链表删除结束前被删除完)
        // 最后删除到中点
        // 记录每节课的度
        int[] degree = new int[n];
        int[][] neighbours = new int[n][];
        for (int[] edge : edges) { // 遍历边记录每个节点度数
            degree[edge[0]]++;
            degree[edge[1]]++;
        }
        // 初始化neighbours
        for (int i = 0; i < n; i++) {
            neighbours[i] = new int[degree[i] + 1];
        }
        for (int[] edge : edges) {
            
            
            neighbours[edge[0]][++neighbours[edge[0]][0]] = edge[1];
            neighbours[edge[1]][++neighbours[edge[1]][0]] = edge[0];
        }
        // 将入度为1的入队(将度为0的也入队是因为有测试用例只有一个结点)
        LinkedList<Integer> queue = new LinkedList<>();
        for (int i = 0; i < n; i++) {
            if (degree[i] == 1 || degree[i] == 0) {
                queue.add(i);
            }
        }
        // 如果剩下的结点大于2, 那么所有结点还没入队
        while (n > 2) {
            int size = queue.size();
            for (; size-- > 0; n--) {
                Integer node = queue.poll();
                if (node == null) {
                    // idea的警告
                    continue;
                }
                int neighbourLength = neighbours[node][0];
                for (int i = 1; i <= neighbourLength; i++) {
                    if (--degree[neighbours[node][i]] == 1) {
                        queue.add(neighbours[node][i]);
                    }
                }
            }
        }

        List<Integer> result = new ArrayList<>(queue.size());
        while (!queue.isEmpty()) {
            result.add(queue.poll());
        }
        return result;
   }


// 第一次发现可以不赋初值, 等要用的时候再给每个数组开辟空间. (new int[3][];)
public static void main(String[] args) {
    int[][] nums = new int[3][];
    nums[0] = new int[5];
    for (int i = 0; i < nums[0].length; i++) {
        nums[0][i] = i;
    }
    nums[1] = new int[3];
    for (int i = 0; i < nums[1].length; i++) {
        nums[1][i] = i;
    }
    nums[2] = new int[9];
    for (int i = 0; i < nums[2].length; i++) {
        nums[2][i] = i;
    }
    System.out.println(Arrays.deepToString(nums));
    // [[0, 1, 2, 3, 4], [0, 1, 2], [0, 1, 2, 3, 4, 5, 6, 7, 8]]
}
```
