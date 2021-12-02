# Morris

通过利用原树中大量空闲指针的方式，达到节省空间的目的  

## 前提

对左子树右子树依赖没那么强, 就可以用Morris遍历, 因为其他的需要完整的左右子树信息



**假设来到当前节点cur，开始时cur来到头节点位置**   

1. 如果cur没有左孩子，cur向右移动 (**cur = cur.right**)  

2. 如果cur有左孩子，找到左子树上最右的节点mostRight：   

   a. 如果mostRight的右指针指向空，让其指向cur，然后cur向左移动 **(cur = cur.left**)   

   b. 如果mostRight的右指针指向cur，让其指向null，然后cur向右移动 **(cur = cur.right**)  和上面同一个表达

3. cur为空时遍历停止 (**while**)

   

- **精髓:**

**==加路往左移 减路往右移==**

**无左孩子直接右移**

## 前置知识

- **前置知识**

```java
public static class Node {
   public int value;
   Node left;
   Node right;

   public Node(int data) {
      this.value = data;
   }
}
//额外空间复杂度O(M) 根据高度
public static void process(Node root) {
   if (root == null) {
      return;
   }
   // 1
   process(root.left);
   // 2
   process(root.right);
   // 3
}
```

- **反转链表基础**

![image-20211130165603814](https://raw.githubusercontent.com/handsomeyi/Pics/master/image-20211130165603814.png)



## 先序

### 第一次到达就打印,第二次的舍弃

```java
public static void morrisTest(Node head){
		if (head == null) {
			return;
		}
		Node cur = head;
		Node mostRight = null;
		while (cur != null) {
			mostRight = cur.left;
			if (mostRight != null) {
				while (mostRight.right != null && mostRight.right != cur) {//cur的右孩子不等于空 且 不等于cur
					//一直往下走到头 直到找到真的mostRight
					mostRight = mostRight.right;
				}
				if (mostRight.right == null) {
					System.out.print(cur.value + " ");
					mostRight.right = cur;
					cur = cur.left;
					continue;
				}else {//mostRight.right == cur (代表通过了mostRight.right回到了cur)
					mostRight.right = null;
				}
			}else{//for 
				System.out.print(cur.value + " ");
			}
			cur = cur.right;//1 和 2.b的cur移动 都通过这个移动来诠释
		}
		System.out.println();
	}
```

## 中序

### 两次的数只有第二次打印, 一次的数直接打印

```java
public static void morrisIn(Node head) {
   if (head == null) {
      return;
   }
   Node cur = head;
   Node mostRight = null;
   while (cur != null) {
      mostRight = cur.left;
      if (mostRight != null) {
         while (mostRight.right != null && mostRight.right != cur) {
            mostRight = mostRight.right;
         }
         if (mostRight.right == null) {
            mostRight.right = cur;
            cur = cur.left;
            continue;
         } else {
            mostRight.right = null;
         }
      }
       ////////////////////////////////
      System.out.print(cur.value + " ");
      cur = cur.right;
   }
    ////////////////////////////////
   System.out.println();
}
```

## 后序

### 只要第二次到达的时候,打印cur左树的右边界(倒序),最后单独打印head右边界

```java
public static void morrisPos(Node head) {
   if (head == null) {
      return;
   }
   Node cur = head;
   Node mostRight = null;
   while (cur != null) {
      mostRight = cur.left;
      if (mostRight != null) {
         while (mostRight.right != null && mostRight.right != cur) {
            mostRight = mostRight.right;
         }
         if (mostRight.right == null) {
            mostRight.right = cur;
            cur = cur.left;
            continue;
         } else {
            mostRight.right = null;
             ////////////////////////////////
            printEdge(cur.left);
         }
      }
      cur = cur.right;
   }
    ////////////////////////////////
   printEdge(head);
   System.out.println();
}

public static void printEdge(Node head) {
   Node tail = reverseEdge(head);
   Node cur = tail;
   while (cur != null) {
      System.out.print(cur.value + " ");
      cur = cur.right;
   }
   reverseEdge(tail);
}

public static Node reverseEdge(Node from) {
   Node pre = null;
   Node next = null;
   while (from != null) {
      next = from.right;
      from.right = pre;
      pre = from;
      from = next;
   }
   return pre;
}
```

# 求是否是搜索二叉树

中序遍历升序即可

用morris遍历然后判断升序

```java
public static boolean isBST(Node head) {
   if (head == null) {
      return true;
   }
   Node cur = head;
   Node mostRight = null;
   Integer pre = null;
   boolean ans = true;
   while (cur != null) {
      mostRight = cur.left;
      if (mostRight != null) {
         while (mostRight.right != null && mostRight.right != cur) {
            mostRight = mostRight.right;
         }
         if (mostRight.right == null) {
            mostRight.right = cur;
            cur = cur.left;
            continue;
         } else {
            mostRight.right = null;
         }
      }
      if (pre != null && pre >= cur.value) {
         ans = false;
      }
      pre = cur.value;
      cur = cur.right;
   }
   return ans;
}
```

# 求二叉树最小深度

给定一棵二叉树的头节点head

求以head为头的树中，最小深度是多少？

```java
public static int minHeight2(Node head) {
   if (head == null) {
      return 0;
   }
   Node cur = head;
   Node mostRight = null;
   int curLevel = 0;
   int minHeight = Integer.MAX_VALUE;
   while (cur != null) {
      mostRight = cur.left;
      if (mostRight != null) {
         int rightBoardSize = 1;
         while (mostRight.right != null && mostRight.right != cur) {
            rightBoardSize++;
            mostRight = mostRight.right;
         }
         if (mostRight.right == null) { // 第一次到达
            curLevel++;
            mostRight.right = cur;
            cur = cur.left;
            continue;
         } else { // 第二次到达
            if (mostRight.left == null) {
               minHeight = Math.min(minHeight, curLevel);
            }
            curLevel -= rightBoardSize;
            mostRight.right = null;
         }
      } else { // 只有一次到达
         curLevel++;
      }
      cur = cur.right;
   }
   int finalRight = 1;
   cur = head;
   while (cur.right != null) {
      finalRight++;
      cur = cur.right;
   }
   if (cur.left == null && cur.right == null) {
      minHeight = Math.min(minHeight, finalRight);
   }
   return minHeight;
}
```

