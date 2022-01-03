# 装逼刷题法
from:
https://github.com/Gordon-Deng/happyLeetCode/blob/master/finally/%E8%A3%85%E9%80%BC%E5%88%B7%E9%A2%98%E6%B3%95.md


### [3] 无重复字符的最长子串

```
https://leetcode-cn.com/problems/longest-substring-without-repeating-characters/description/

给定一个字符串，请你找出其中不含有重复字符的 最长子串 的长度。

示例 1:

输入: "abcabcbb"
输出: 3 
解释: 因为无重复字符的最长子串是 "abc"，所以其长度为 3。
```

#### 通用：滑动窗口 O(N)，O(∣Σ∣)，其中Σ表示字符集（即字符串中可以出现的字符）
```
class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        # 哈希集合，记录每个字符是否出现过
        occ = set()
        n = len(s)
        # 右指针，初始值为 -1，相当于我们在字符串的左边界的左侧，还没有开始移动
        rk, ans = -1, 0
        for i in range(n):
            if i != 0:
                # 左指针向右移动一格，移除一个字符
                occ.remove(s[i - 1])
            while rk + 1 < n and s[rk + 1] not in occ:
                # 不断地移动右指针
                occ.add(s[rk + 1])
                rk += 1
            # 第 i 到 rk 个字符是一个极长的无重复字符子串
            ans = max(ans, rk - i + 1)
        return ans
```

### [42] 接雨水
```
https://leetcode-cn.com/problems/trapping-rain-water/description/

给定 n 个非负整数表示每个宽度为 1 的柱子的高度图，计算按此排列的柱子，下雨之后能接多少雨水。

示例:

输入: [0,1,0,2,1,0,1,3,2,1,2,1]
输出: 6
```
#### Low: 单调栈 O(n)，O(n)
```
class Solution:
    def trap(self, height: List[int]) -> int:
        ans = 0
        stack = list()
        n = len(height)
        
        for i, h in enumerate(height):
            while stack and h > height[stack[-1]]:
                top = stack.pop()
                if not stack:
                    break
                left = stack[-1]
                currWidth = i - left - 1
                currHeight = min(height[left], height[i]) - height[top]
                ans += currWidth * currHeight
            stack.append(i)
        
        return ans
```

#### High: 双指针 O(n)，O(1)
左右高度，小的为王，同侧相减，加进总和

```
class Solution:
    def trap(self, height: List[int]) -> int:
        ans = 0
        left, right = 0, len(height) - 1
        leftMax = rightMax = 0

        while left < right:
            leftMax = max(leftMax, height[left])
            rightMax = max(rightMax, height[right])
            if height[left] < height[right]:
                ans += leftMax - height[left]
                left += 1
            else:
                ans += rightMax - height[right]
                right -= 1
        
        return ans
```

### [121] 买卖股票的最佳时机系列

```
真特么牛逼
https://leetcode-cn.com/problems/best-time-to-buy-and-sell-stock/description/

给定一个数组，它的第 i 个元素是一支给定股票第 i 天的价格。

如果你最多只允许完成一笔交易（即买入和卖出一支股票），设计一个算法来计算你所能获取的最大利润。

注意你不能在买入股票前卖出股票。

示例 1:

输入: [7,1,5,3,6,4]
输出: 5
解释: 在第 2 天（股票价格 = 1）的时候买入，在第 5 天（股票价格 = 6）的时候卖出，最大利润 = 6-1 = 5 。
⁠    注意利润不能是 7-1 = 6, 因为卖出价格需要大于买入价格。


示例 2:

输入: [7,6,4,3,1]
输出: 0
解释: 在这种情况下, 没有交易完成, 所以最大利润为 0。
```

我们要跳出固有的思维模式，并不是要考虑买还是卖，而是要最大化手里持有的钱。
买股票手里的钱减少，卖股票手里的钱增加，无论什么时刻，我们要保证手里的钱最多。

我们这一次买还是卖只跟上一次我们卖还是买的状态有关。

#### 121. 买卖股票的最佳时机
```
class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        
        buy, sell = -float("inf"), 0

        for p in prices:
            buy = max(buy, 0 - p)
            sell = max(sell, buy + p)

        return sell
```

#### 122. 买卖股票的最佳时机
这两个问题唯一的不同点在于我们是买一次还是买无穷多次，而代码就只有 0-p 和 sell-p 的区别。
因为如果买无穷多次，就需要上一次卖完的状态。如果只买一次，那么上一个状态一定是0。

```
class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        
        buy, sell = -float("inf"), 0

        for p in prices:
            buy = max(buy, sell - p)
            sell = max(sell, buy + p)

        return sell

```

#### 123. 买卖股票的最佳时机
这题只允许最多买两次，那么就有四个状态，第一次买，第一次卖，第二次买，第二次卖。
还是那句话，无论什么状态，我们要保证手里的钱最多。

```
class Solution:
    def maxProfit(self, prices: List[int]) -> int:

        b1, b2, s1, s2 = -float("inf"), -float("inf"), 0, 0

        for p in prices:
            b1 = max(b1, 0 - p)
            s1 = max(s1, b1 + p)
            b2 = max(b2, s1 - p)
            s2 = max(s2, b2 + p)
            
        return s2
```

#### 188. 买卖股票的最佳时机
上三题最多两次我们有2x2个状态，那么k次我们就需要kx2个状态。
那么我们并不需要像第三题那样真的列kx2个参数，我们只需要两个数组就可以了。

```
class Solution:
    def maxProfit(self, k: int, prices: List[int]) -> int:
        k = min(k, len(prices) // 2)

        buy = [-float("inf")] * (k+1)
        sell = [0] * (k+1)

        for p in prices:
            for i in range(1, k+1):
                buy[i] = max(buy[i], sell[i-1] - p)
                sell[i] = max(sell[i], buy[i] + p)

        return sell[-1]

```

#### 309. 最佳买卖股票时机含冷冻期
这道题只是122的变形，卖完要隔一天才能买，那么就多记录上一次卖的状态即可。


```
class Solution:
    def maxProfit(self, prices: List[int]) -> int:

        buy, sell_pre, sell = -float("inf"), 0, 0

        for p in prices:
            buy = max(buy, sell_pre - p)
            sell_pre, sell = sell, max(sell, buy + p)
                 
        return sell
```

#### 714. 买卖股票的最佳时机含手续费
每次买卖需要手续费，那么我们买的时候减掉手续费就行了。

```
class Solution:
    def maxProfit(self, prices: List[int], fee: int) -> int:

        buy, sell = -float("inf"), 0

        for p in prices:
            buy = max(buy, sell - p - fee)
            sell = max(sell, buy + p)
        
        return sell
```
### [199] 二叉树的右视图

```
https://leetcode-cn.com/problems/binary-tree-right-side-view/description/

algorithms
Medium (64.92%)
Likes:    507
Dislikes: 0
Total Accepted:    124.2K
Total Submissions: 191K
Testcase Example:  '[1,2,3,null,5,null,4]'

给定一个二叉树的 根节点 root，想象自己站在它的右侧，按照从顶部到底部的顺序，返回从右侧所能看到的节点值。



示例 1:




输入: [1,2,3,null,5,null,4]
输出: [1,3,4]


示例 2:


输入: [1,null,3]
输出: [1,3]
```

#### 层次遍历+hashmap巧取同层最后一个 

```
class Solution:
    def rightSideView(self, root: TreeNode) -> List[int]:
        rightmost_value_at_depth = dict() # 深度为索引，存放节点的值
        max_depth = -1

        queue = deque([(root, 0)])
        while queue:
            node, depth = queue.popleft()

            if node is not None:
                # 维护二叉树的最大深度
                max_depth = max(max_depth, depth)

                # 由于每一层最后一个访问到的节点才是我们要的答案，因此不断更新对应深度的信息即可
                rightmost_value_at_depth[depth] = node.val

                queue.append((node.left, depth + 1))
                queue.append((node.right, depth + 1))

        return [rightmost_value_at_depth[depth] for depth in range(max_depth + 1)]
```


#### 反向层次遍历+setdefault

```
class Solution:
    def rightSideView(self, root: TreeNode) -> List[int]:
        rightmost_value_at_depth = dict() # 深度为索引，存放节点的值
        max_depth = -1

        queue = deque([(root, 0)])
        while queue:
            node, depth = queue.popleft()

            if node is not None:
                # 维护二叉树的最大深度
                max_depth = max(max_depth, depth)

                # setdefault相当于get, 不改变原有值，除非没有key
                rightmost_value_at_depth.setdefault(depth, node.val)
                
                # 从右到左
                queue.append((node.right, depth + 1))
                queue.append((node.left, depth + 1))

        return [rightmost_value_at_depth[depth] for depth in range(max_depth + 1)]
```

### 剑指 Offer 12. 矩阵中的路径

```
https://leetcode-cn.com/problems/ju-zhen-zhong-de-lu-jing-lcof/

给定一个 m x n 二维字符网格 board 和一个字符串单词 word 。如果 word 存在于网格中，返回 true ；否则，返回 false 。

单词必须按照字母顺序，通过相邻的单元格内的字母构成，其中“相邻”单元格是那些水平相邻或垂直相邻的单元格。同一个单元格内的字母不允许被重复使用。

示例 1：

输入：board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"
输出：true
示例 2：

输入：board = [["a","b"],["c","d"]], word = "abcd"
输出：false
```

#### LOW 基础回溯+DFS

```
class Solution:
    def exist(self, board: List[List[str]], word: str) -> bool:
        def dfs(i, j, k):
            # 用来判断程序是否越界，还有第一个字母是否匹配，第一个都不匹配直接返回False
            if not 0 <= i < len(board) or not 0 <= j < len(board[0]) or board[i][j] != word[k]:  return False
            # 当程序跑到word的最后一个字母时，这时无需再dfs，直接返回True
            if k == len(word) - 1: return True
            # 把访问过的字母标记为空，这样可以避免程序多次访问同一元素
            board[i][j] = ""
            # 剪枝顺序：下、上、右、左
            res = dfs(i + 1, j, k + 1) or dfs(i - 1, j, k + 1) or dfs(i, j + 1, k + 1) or dfs(i, j - 1, k + 1)
            # 一趟dfs结束后把原来设的空改回来，以免影响后面的dfs遍历使用
            board[i][j] = word[k]
            return res 
        # 一个一个字母来尝试，每一次尝试都是dfs遍历成功的一种可能性
        for i in range(len(board)):
            for j in range(len(board[0])):
                if dfs(i, j, 0): return True
        # 遍历完成，仍没有成功的路径，返回False
        return False
```

#### High 问是否支持变更数组，上面解法其实已经支持无修改原数组，但问多一句有好处
```
```

### [232] 用栈实现队列

```
https://leetcode-cn.com/problems/implement-queue-using-stacks/description/

algorithms
Easy (68.87%)
Likes:    446
Dislikes: 0
Total Accepted:    142.3K
Total Submissions: 206.2K
Testcase Example:  '["MyQueue","push","push","peek","pop","empty"]\n[[],[1],[2],[],[],[]]'

请你仅使用两个栈实现先入先出队列。队列应当支持一般队列支持的所有操作（push、pop、peek、empty）：

实现 MyQueue 类：


void push(int x) 将元素 x 推到队列的末尾
int pop() 从队列的开头移除并返回元素
int peek() 返回队列开头的元素
boolean empty() 如果队列为空，返回 true ；否则，返回 false

说明：
你只能使用标准的栈操作 —— 也就是只有 push to top, peek/pop from top, size, 和 is empty
操作是合法的。
你所使用的语言也许不支持栈。你可以使用 list 或者 deque（双端队列）来模拟一个栈，只要是标准的栈操作即可。

进阶：

你能否实现每个操作均摊时间复杂度为 O(1) 的队列？换句话说，执行 n 个操作的总时间复杂度为 O(n) ，即使其中一个操作可能花费较长时间。
示例：

输入：
["MyQueue", "push", "push", "peek", "pop", "empty"]
[[], [1], [2], [], [], []]
输出：
[null, null, null, 1, 1, false]

解释：
MyQueue myQueue = new MyQueue();
myQueue.push(1); // queue is: [1]
myQueue.push(2); // queue is: [1, 2] (leftmost is front of the queue)
myQueue.peek(); // return 1
myQueue.pop(); // return 1, queue is [2]
myQueue.empty(); // return false

提示：
最多调用 100 次 push、pop、peek 和 empty
假设所有操作都是有效的 （例如，一个空的队列不会调用 pop 或者 peek 操作）
```

#### O(1), O(1)

```
class MyQueue:
    def __init__(self):
        self.stack1 = list()
        self.stack2 = list()

    def push(self, x: int) -> None:
        # self.stack1用于接受元素
        self.stack1.append(x)

    def pop(self) -> int:
        # self.stack2用于弹出元素，如果self.stack2为[],则将self.stack1中元素全部弹出给self.stack2
        if self.stack2 == []:
            while self.stack1:
                tmp = self.stack1.pop()
                self.stack2.append(tmp)
        return self.stack2.pop()

    def peek(self) -> int:
        if self.stack2 == []:
            while self.stack1:
                tmp = self.stack1.pop()
                self.stack2.append(tmp)
        return self.stack2[-1]

    def empty(self) -> bool:
        return self.stack1 == [] and self.stack2 == []
```

### [155] 最小栈
没啥好说的，基础python中取队列尾部用下标-1就OK

```
https://leetcode-cn.com/problems/min-stack/description/
设计一个支持 push，pop，top 操作，并能在常数时间内检索到最小元素的栈。

push(x) -- 将元素 x 推入栈中。
pop() -- 删除栈顶的元素。
top() -- 获取栈顶元素。
getMin() -- 检索栈中的最小元素。
```

#### 双栈：O(1）,O(N)
```
class MinStack:

    def __init__(self):
        self.stack = []
        self.min_stack = []

    def push(self, x: int) -> None:
        self.stack.append(x)
        if not self.min_stack or x <= self.min_stack[-1]: 
            self.min_stack.append(x)

    def pop(self) -> None:
        if self.stack.pop() == self.min_stack[-1]:
            self.min_stack.pop()

    def top(self) -> int:
        return self.stack[-1]

    def getMin(self) -> int:
        return self.min_stack[-1]
```

### [105] 从前序与中序遍历序列构造二叉树

```
https://leetcode-cn.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/description/

algorithms
Medium (69.68%)
Likes:    1038
Dislikes: 0
Total Accepted:    193.8K
Total Submissions: 278.1K
Testcase Example:  '[3,9,20,15,7]\n[9,3,15,20,7]'

根据一棵树的前序遍历与中序遍历构造二叉树。

注意:
你可以假设树中没有重复的元素。

例如，给出

前序遍历 preorder = [3,9,20,15,7]
中序遍历 inorder = [9,3,15,20,7]

返回如下的二叉树：

⁠   3
⁠  / \
⁠ 9  20
⁠   /  \
⁠  15   7



@lc code=start
Definition for a binary tree node.
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right
```

#### 入门：递归 O(N) 、O(N)
```
list.index(列表中某个值) 求下标

```
```
class Solution:
    def buildTree(self, preorder: List[int], inorder: List[int]) -> TreeNode:
        if not preorder or not inorder:  # 递归终止条件
            return
        root = TreeNode(preorder[0])  # 先序为“根左右”，所以根据preorder可以确定root
        idx = inorder.index(preorder[0])  # 中序为“左根右”，根据root可以划分出左右子树
        # 下面递归对root的左右子树求解即可
        root.left = self.buildTree(preorder[1:1 + idx], inorder[:idx])
        root.right = self.buildTree(preorder[1 + idx:], inorder[idx + 1:])
        return root
```

#### 进阶：主动构造测试用例
```
# 构建树（将输入的列表转化为一棵二叉树，返回根节点）
def deserialize(data):
    def dfs(data):
        val = data.pop(0)
        if val == 'null':
            return None

        node = TreeNode(val)
        node.left = dfs(data)
        node.right = dfs(data)
        return node
    return dfs(data)
```


### [5] 最长回文子串
```
https://leetcode-cn.com/problems/longest-palindromic-substring/description/

给定一个字符串 s，找到 s 中最长的回文子串。你可以假设 s 的最大长度为 1000。

示例 1：

输入: "babad"
输出: "bab"
注意: "aba" 也是一个有效答案。


示例 2：

输入: "cbbd"
输出: "bb"
```

#### 入门： 二维数组DP + 夹层，O(N^2)、O(N^2)
遍历每个字符，让后定义一个函数从当前字符往两边走，前后指针处的字符相同则继续（要注意计数回文串和偶数回文串）

```
class Solution:
    def longestPalindrome(self, s: str) -> str:
        n = len(s)
        max_len, begin_index = 1, 0
        dp = [[False] * n for _ in range(n)]
        # if s[0] == s[1]:
        #     dp[0][1] = True

        for i in range(n):
            dp[i][i] = True
        for L in range(2, n+1):
            for i in range(n):
                j = L + i - 1
                if j >= n:
                    break
                if s[i] == s[j] and (j - i < 3):
                    dp[i][j] = True
                elif s[i] == s[j] and (j - i >= 3):
                    dp[i][j] = dp[i+1][j-1]

                if dp[i][j] and j - i + 1 > max_len:
                    max_len = j - i + 1
                    begin_index = i
        return s[begin_index:begin_index + max_len]
```

### [101] 对称二叉树
```
https://leetcode-cn.com/problems/symmetric-tree/description/

给定一个二叉树，检查它是否是镜像对称的。

例如，二叉树 [1,2,2,3,4,4,3] 是对称的。

⁠   1
⁠  / \
⁠ 2   2
⁠/ \ / \
3  4 4  3

但是下面这个 [1,2,2,null,3,null,3] 则不是镜像对称的:

⁠   1
⁠  / \
⁠ 2   2
⁠  \   \
⁠  3    3
```

#### 入门：递归 O(n)、O(n)
左右子树确实的case判定完后，递归check是否对称

```
class Solution:
    def isSymmetric(self, root: TreeNode) -> bool:
        def fun(left,right):
            if left and not right:
                return False
            elif not left and right:
                return False
            elif not left and not right:
                return True
            else:
                return left.val==right.val and fun(left.left,right.right) and fun(left.right,right.left)
        
        if not root:
            return True
        flag=fun(root.left,root.right)
        return flag
```
#### 进阶：迭代 O(n)、O(n)

```
class Solution:
    def isSymmetric(self, root: TreeNode) -> bool:
        # 使用队列-先进先出
        if root == None:
            return True
        
        q = [(root.left,root.right)]
        while q != []:
            left,right = q.pop(0)
            if left == None and right == None:
                continue
            
            if left and right and left.val == right.val:
                # 将左右孩子添加入队列
                q.append((left.left,right.right))
                q.append((left.right,right.left))
            else:
                return False
        
        return True
```

[198] 打家劫舍

```
https://leetcode-cn.com/problems/house-robber/description/

你是一个专业的小偷，计划偷窃沿街的房屋。每间房内都藏有一定的现金，影响你偷窃的唯一制约因素就是相邻的房屋装有相互连通的防盗系统，如果两间相邻的房屋在同一晚上被小偷闯入，系统会自动报警。

给定一个代表每个房屋存放金额的非负整数数组，计算你 不触动警报装置的情况下 ，一夜之内能够偷窃到的最高金额。

示例 1：
输入：[1,2,3,1]
输出：4
解释：偷窃 1 号房屋 (金额 = 1) ，然后偷窃 3 号房屋 (金额 = 3)。
偷窃到的最高金额 = 1 + 3 = 4 。

示例 2：
输入：[2,7,9,3,1]
输出：12
解释：偷窃 1 号房屋 (金额 = 2), 偷窃 3 号房屋 (金额 = 9)，接着偷窃 5 号房屋 (金额 = 1)。
偷窃到的最高金额 = 2 + 9 + 1 = 12 。
```

#### 入门：DP O(n)、O(n)
```
class Solution:
    def rob(self, nums: List[int]) -> int:
        if not nums :
            return 0
        n = len(nums)
        if n == 1:
            return nums[0]
        dp = [0] * n
        dp[0] = nums[0]
        dp[1] = max(nums[0], nums[1])
        for i in range(2, n):
            dp[i] = max(dp[i-2] + nums[i], dp[i-1])
        
        return dp[n-1]
```

#### 入门：DP + 滚动数组 O(n)、O(1)
每间房屋的最高总金额只和该房屋的前两间房屋的最高总金额相关，因此可以使用滚动数组，在每个时刻只需要存储前两间房屋的最高总金额。

```
class Solution:
    def rob(self, nums: List[int]) -> int:
        if not nums:
            return 0

        size = len(nums)
        if size == 1:
            return nums[0]
        
        first, second = nums[0], max(nums[0], nums[1])
        for i in range(2, size):
            first, second = second, max(first + nums[i], second)
        
        return second
```

### [69] x 的平方根
```
https://leetcode-cn.com/problems/sqrtx/description/

实现 int sqrt(int x) 函数。

计算并返回 x 的平方根，其中 x 是非负整数。

由于返回类型是整数，结果只保留整数的部分，小数部分将被舍去。

示例 1:

输入: 4
输出: 2

示例 2:

输入: 8
输出: 2
说明: 8 的平方根是 2.82842..., 
由于返回类型是整数，小数部分将被舍去。
```

#### 入门：二分查找 O(logN)、O(1)

```
class Solution:
    def mySqrt(self, x: int) -> int:
        l, r, ans = 0, x, -1
        while l <= r:
            mid = (l + r) // 2
            if mid * mid <= x:
                ans = mid
                l = mid + 1
            else:
                r = mid - 1
        return ans
```

#### 进阶：牛顿迭代 O(logN)、O(1)
看不懂，背就对了

```
class Solution:
    def mySqrt(self, x: int) -> int:
        if x == 0:
            return 0
        
        C, x0 = float(x), float(x)
        while True:
            xi = 0.5 * (x0 + C / x0)
            if abs(x0 - xi) < 1e-7:
                break
            x0 = xi
        
        return int(x0)
```

### [剑22] 链表中倒数第k个节点

```
输入一个链表，输出该链表中倒数第k个节点。为了符合大多数人的习惯，本题从1开始计数，即链表的尾节点是倒数第1个节点。

例如，一个链表有 6 个节点，从头节点开始，它们的值依次是 1、2、3、4、5、6。这个链表的倒数第 3 个节点是值为 4 的节点。
```
#### 入门： 双指针 O(N)、O(1)

让你K步又何妨

```
class Solution:
    def getKthFromEnd(self, head: ListNode, k: int) -> ListNode:
        fast, slow = head, head

        while fast and k > 0:
            fast, k = fast.next, k - 1
        while fast:
            fast,slow = fast.next,slow.next
        
        return slow
```

### [169] 多数元素

```
https://leetcode-cn.com/problems/majority-element/description/

给定一个大小为 n 的数组，找到其中的多数元素。多数元素是指在数组中出现次数大于 ⌊ n/2 ⌋ 的元素。

你可以假设数组是非空的，并且给定的数组总是存在多数元素。

示例 1:
输入: [3,2,3]
输出: 3

示例 2:
输入: [2,2,1,1,1,2,2]
输出: 2
```

#### 哈希表 O(N)、O(N)
```
class Solution:
    def majorityElement(self, nums: List[int]) -> int:
        counts = collections.Counter(nums)
        return max(counts.keys(), key=counts.get)
```

#### 摩尔投票法 

候选人(cand_num)初始化为nums[0]，票数count初始化为1。
当遇到与cand_num相同的数，则票数count = count + 1，否则票数count = count - 1。
当票数count为0时，更换候选人，并将票数count重置为1。
遍历完数组后，cand_num即为最终答案。

为何这行得通呢？
投票法是遇到相同的则票数 + 1，遇到不同的则票数 - 1。
且“多数元素”的个数> ⌊ n/2 ⌋，其余元素的个数总和<= ⌊ n/2 ⌋。
因此“多数元素”的个数 - 其余元素的个数总和 的结果 肯定 >= 1。
这就相当于每个“多数元素”和其他元素 两两相互抵消，抵消到最后肯定还剩余至少1个“多数元素”。

无论数组是1 2 1 2 1，亦或是1 2 2 1 1，总能得到正确的候选人。

```
class Solution:
    def majorityElement(self, nums: List[int]) -> int:
        count = 0
        candidate = None

        for num in nums:
            if count == 0:
                candidate = num
            count += (1 if num == candidate else -1)

        return candidate
```

### [142] 环形链表 II

```
https://leetcode-cn.com/problems/linked-list-cycle-ii/description/

给定一个链表，返回链表开始入环的第一个节点。 如果链表无环，则返回 null。

为了表示给定链表中的环，我们使用整数 pos 来表示链表尾连接到链表中的位置（索引从 0 开始）。 如果 pos 是 -1，则在该链表中没有环。

说明：不允许修改给定的链表。
示例 1：

输入：head = [3,2,0,-4], pos = 1
输出：tail connects to node index 1
解释：链表中有一个环，其尾部连接到第二个节点。

示例 2：

输入：head = [1,2], pos = 0
输出：tail connects to node index 0
解释：链表中有一个环，其尾部连接到第一个节点。

示例 3：

输入：head = [1], pos = -1
输出：no cycle
解释：链表中没有环。
```

#### 入门： 快慢指针 O(N)、O(1)
在快慢指针相遇后，将快指针置为head，让后都一步一步走

```
class Solution:
    def detectCycle(self, head: ListNode) -> ListNode:
        fast, slow = head, head
        while True:
            if not (fast and fast.next): return
            fast, slow = fast.next.next, slow.next
            if fast == slow: break
        fast = head
        while fast != slow:
            fast, slow = fast.next, slow.next
            # 不可以，因为第一个while的时候就有可能fast == slow, 导致没有任何return
            # if fast == slow:
            #     return fast
        return fast
```

### [88] 合并两个有序数组
```
https://leetcode-cn.com/problems/merge-sorted-array/description/

给定两个有序整数数组 nums1 和 nums2，将 nums2 合并到 nums1 中，使得 num1 成为一个有序数组。

说明:


初始化 nums1 和 nums2 的元素数量分别为 m 和 n。
你可以假设 nums1 有足够的空间（空间大小大于或等于 m + n）来保存 nums2 中的元素。


示例:

输入:
nums1 = [1,2,3,0,0,0], m = 3
nums2 = [2,5,6],       n = 3

输出: [1,2,2,3,5,6]
```

### 入门：正向双指针 O(m+n)、O(m+n)

```
class Solution:
    def merge(self, nums1: List[int], m: int, nums2: List[int], n: int) -> None:
        sorted = []
        p1, p2 = 0, 0
        while p1 < m or p2 < n:
            if p1 == m:
                sorted.append(nums2[p2])
                p2 += 1
            elif p2 == n:
                sorted.append(nums1[p1])
                p1 += 1
            elif nums1[p1] < nums2[p2]:
                sorted.append(nums1[p1])
                p1 += 1
            else:
                sorted.append(nums2[p2])
                p2 += 1
        nums1[:] = sorted
```

### 进阶：逆向双指针 O(m+n)、O(1)

从后往前是指从一个数组m+n-1这个位置开始倒推，而不是m-1/n-1的位置，是最终的位置

```
class Solution:
    def merge(self, nums1: List[int], m: int, nums2: List[int], n: int) -> None:
        """
        Do not return anything, modify nums1 in-place instead.
        """
        p1, p2 = m - 1, n - 1
        tail = m + n - 1
        while p1 >= 0 or p2 >= 0:
            if p1 == -1:
                nums1[tail] = nums2[p2]
                p2 -= 1
            elif p2 == -1:
                nums1[tail] = nums1[p1]
                p1 -= 1
            elif nums1[p1] > nums2[p2]:
                nums1[tail] = nums1[p1]
                p1 -= 1
            else:
                nums1[tail] = nums2[p2]
                p2 -= 1
            tail -= 1
```

### [239] 滑动窗口最大值

```
https://leetcode-cn.com/problems/sliding-window-maximum/description/
给你一个整数数组 nums，有一个大小为 k 的滑动窗口从数组的最左侧移动到数组的最右侧。你只可以看到在滑动窗口内的 k
个数字。滑动窗口每次只向右移动一位。

返回滑动窗口中的最大值。

示例 1：


输入：nums = [1,3,-1,-3,5,3,6,7], k = 3
输出：[3,3,5,5,6,7]
解释：
滑动窗口的位置                最大值
---------------               -----
[1  3  -1] -3  5  3  6  7       3
⁠1 [3  -1  -3] 5  3  6  7       3
⁠1  3 [-1  -3  5] 3  6  7       5
⁠1  3  -1 [-3  5  3] 6  7       5
⁠1  3  -1  -3 [5  3  6] 7       6
⁠1  3  -1  -3  5 [3  6  7]      7


示例 2：

输入：nums = [1], k = 1
输出：[1]

示例 3：

输入：nums = [1,-1], k = 1
输出：[1,-1]

示例 4：

输入：nums = [9,11], k = 2
输出：[11]

示例 5：

输入：nums = [4,-2], k = 2
输出：[4]
```

#### 入门：堆

heapq.heapify(q)堆的操作
原理有点拗口，就是每次维护一个大顶堆，注意不要被窗口大小限制思想，这道题不用理固定堆的大小就为K，只需要看堆顶的最大值是否在当前窗口即可
当滑动窗口移动时，若最大值不在窗口，那就弹出去，否则一值滑动一直往堆里加元素就好了

```
from heapq import * 

class Solution:
    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:
        n = len(nums)
        # 注意 Python 默认的优先队列是小根堆
        q = [(-nums[i], i) for i in range(k)]
        heapq.heapify(q)

        ans = [-q[0][0]]
        for i in range(k, n):
            heapq.heappush(q, (-nums[i], i))
            while q[0][1] <= i - k:
                heapq.heappop(q)
            ans.append(-q[0][0])
        
        return ans
```

#### 进阶：双端队列

```
class Solution:
    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:
        ans = []
        dq = deque()
        
        for i in range(len(nums)):
            # 只要当前遍历的元素的值比队尾大，让队尾出队列，
            # 最终队列中的最小元素是大于当前元素的
            while dq and dq[-1] < nums[i]:
                dq.pop()
            # 当前遍历的元素入队列， 此时队列中的元素一定是有序的，队列头部最大
            dq.append(nums[i])
            if i >= k - 1:
                # 如果窗口即将失效（下一次循环要失效）的值与当前对列头部的值相同，那么将对头的值出队列，
                # 注意只pop一次，可能两个4，相邻同时是最大值，
                ans.append(dq[0])
                # 从队列中删除即将失效的数据
                if nums[i - k + 1] == dq[0]:
                    dq.popleft()
        return ans
```


#### 大师：手撸轮子

```
from typing import List

class LinkNode:
    def __init__(self, val=0):
        self.prev = None
        self.next = None
        self.val = val

class Solution:
    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:
        ans = []
        if k > len(nums):
            return nums
        self.head = LinkNode()
        self.tail = LinkNode()
        self.head.next = self.tail
        self.tail.prev = self.head

        for i in range(len(nums)):
            # 判空注意是tail.prev.prev
            while self.tail.prev.prev and self.get_queue_last_node().val < nums[i]:
                self.remove_node_from_tail()
            self.add_node_to_tail(LinkNode(nums[i]))
            if 0 <= i - k + 1:
                ans.append(self.get_queue_first_node().val)
                if nums[i - k + 1] == self.get_queue_first_node().val:
                    self.pop_the_leftest_node()
        return ans

    def add_node_to_tail(self, node: LinkNode):

        node.next = self.tail
        node.prev = self.tail.prev
        self.tail.prev.next = node
        self.tail.prev = node

    def get_queue_first_node(self):
        return self.head.next

    def get_queue_last_node(self):
        return self.tail.prev

    def pop_the_leftest_node(self):

        self.head.next.next.prev = self.head
        self.head.next = self.head.next.next

    def remove_node_from_tail(self):

        self.tail.prev.prev.next = self.tail
        self.tail.prev = self.tail.prev.prev
```


### [287] 寻找重复数

```
https://leetcode-cn.com/problems/find-the-duplicate-number/description/

给定一个包含 n + 1 个整数的数组 nums ，其数字都在 1 到 n 之间（包括 1 和 n），可知至少存在一个重复的整数。

假设 nums 只有 一个重复的整数 ，找出 这个重复的数 。

你设计的解决方案必须不修改数组 nums 且只用常量级 O(1) 的额外空间。


示例 1：
输入：nums = [1,3,4,2,2]
输出：2

示例 2：
输入：nums = [3,1,3,4,2]
输出：3

示例 3：
输入：nums = [1,1]
输出：1

示例 4：
输入：nums = [1,1,2]
输出：1
提示：


1 
nums.length == n + 1
1 
nums 中 只有一个整数 出现 两次或多次 ，其余整数均只出现 一次
```

#### 入门：啥都不问直接干,直接二分

二分查找的思路是先猜一个数（有效范围 [left..right] 里位于中间的数 mid），然后统计原始数组中 小于等于 mid 的元素的个数 cnt：

如果 cnt 严格大于 mid。根据抽屉原理，重复元素就在区间 [left..mid] 里；
否则，重复元素就在区间 [mid + 1..right] 里。

```
class Solution:
    def findDuplicate(self, nums: List[int]) -> int:
        left = 1
        right = len(nums) - 1
        while left < right:
            mid = left + (right - left) // 2
            cnt = 0
            for num in nums:
                if num <= mid:
                    cnt += 1
            if cnt > mid:
                right = mid
            else:
                left = mid + 1
        return left
```

#### 进阶：问清楚是否支持该原数组, 升级成二进制

```
class Solution:
    def findDuplicate(self, nums: List[int]) -> int:
        bit = 0
        for v in nums:
            pos = 1 << v
            if bit & pos:
                return v
            bit |= pos
```

#### 大师：问清楚是否支持该原数组, 然后改用快慢指针

```
class Solution:
    def findDuplicate(self, nums: List[int]) -> int:
        slow = fast = cir_start = 0
        while True:
            fast = nums[nums[fast]]
            slow = nums[slow]
            if fast == slow:
                break

        while True:
            slow = nums[slow]
            cir_start = nums[cir_start]
            if cir_start == slow:
                return slow
```


### [25] K 个一组翻转链表

```
https://leetcode-cn.com/problems/reverse-nodes-in-k-group/description/

给你一个链表，每 k 个节点一组进行翻转，请你返回翻转后的链表。
k 是一个正整数，它的值小于或等于链表的长度。
如果节点总数不是 k 的整数倍，那么请将最后剩余的节点保持原有顺序。

进阶：
你可以设计一个只使用常数额外空间的算法来解决此问题吗？
你不能只是单纯的改变节点内部的值，而是需要实际进行节点交换。

示例 1：
输入：head = [1,2,3,4,5], k = 2
输出：[2,1,4,3,5]

示例 2：
输入：head = [1,2,3,4,5], k = 3
输出：[3,2,1,4,5]

示例 3：
输入：head = [1,2,3,4,5], k = 1
输出：[1,2,3,4,5]

示例 4：
输入：head = [1], k = 1
输出：[1]
```

#### 入门：基础反转, 递归
```
def reverseList(self, head: ListNode) -> ListNode:
    if head is None or head.next is None:
        return head
    
    p = self.reverseList(head.next)
    # head.next.next是为了回环，逆向的第一步
    head.next.next = head
    # 彻底断开当前指向下个节点的路线，让上一步的回环指到自己身上形成逆转
    head.next = None

    return p
		
```

#### 入门：基础反转, 迭代
```
def reverseList(self, head: ListNode) -> ListNode:
    prev, curr = None, head
    while curr is not None:
        next = curr.next
        curr.next = prev
        prev = curr
        curr = next
    return prev

作者：tangweiqun
链接：https://leetcode-cn.com/problems/reverse-linked-list/solution/shi-pin-jiang-jie-die-dai-he-di-gui-hen-hswxy/
来源：力扣（LeetCode）
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。
		
```

#### 进阶： 虚拟头结点
```
class Solution:
    def reverseKGroup(self, head: ListNode, k: int) -> ListNode:
        virtual_head = ListNode()
        virtual_head.next = head
        prev = virtual_head

        while head:
            tail = prev
            for i in range(k):
                tail = tail.next
                if not tail:
                    return virtual_head.next
            next_node = tail.next
            head, tail = self.reverse(head, tail)
            prev.next = head
            tail.next = next_node
            prev = tail
            head = next_node
        return virtual_head.next
    
    def reverse(self, head, tail):
        prev = tail.next

        cur = head
        while prev != tail:
            temp = cur.next
            cur.next = prev
            prev = cur
            cur = temp
        return prev, head
```


### [415] 字符串相加

```
https://leetcode-cn.com/problems/add-strings/description/

给定两个字符串形式的非负整数 num1 和num2 ，计算它们的和。

num1 和num2 的长度都小于 5100
num1 和num2 都只包含数字 0-9
num1 和num2 都不包含任何前导零
你不能使用任何內建 BigInteger 库， 也不能直接将输入的字符串转换为整数形式
```

#### 入门：字符串相加 O(max(M,N))，O(1)

```
    def addStrings(self, num1: str, num2: str) -> str:
        res = ""
        i, j, carry = len(num1) - 1, len(num2) - 1, 0
        while while i>=0 or j >= 0 or carry != 0:
            n1 = int(num1[i]) if i >= 0 else 0
            n2 = int(num2[j]) if j >= 0 else 0
            tmp = n1 + n2 + carry
            carry = tmp // 10
            res = str(tmp % 10) + res
            i, j = i - 1, j - 1
        return "1" + res if carry else res
```
