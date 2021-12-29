# Java中的Stack结构


```java
Stack<Integer> stack = new Stack<>();
stack.add(1);
stack.add(1);
stack.add(1);
while(!stack.isEmpty()) {
    System.out.println(stack.pop());
}
```

Java里自己的实现是比较慢的, 栈实现的东西, 如果想优化常数实际, 别用这个结构, 
用LinkedList实现栈的功能: 每次都从尾部进, 从尾部出
就用双端队列替代了栈结构了, 还能快点

```java
LinkedList<Integer> stack = new LinkedList<>();
stack.addLast(1);
stack.addLast(2);
stack.addLast(3);

while(!stack.isEmpty()) {
    System.out.println(stack.pollLast());
}
```


如果你明确知道你数组的长度, 比如假如是100, 拿数组结构替代是最快的
```java
int[] stack3 = new int[100];
int index = 0;
// 加入
stack3[index++] = 1;
stack3[index++] = 2;
stack3[index++] = 3;
// 弹出
System.out.println(stack3[--index]);
System.out.println(stack3[--index]);
System.out.println(stack3[--index]);
```



```java

System.out.println("===========Start==========");

testTime = 1000000;
Stack<Integer> stack4 = new Stack<>();
start = System.currentTimeMillis();
for(int i = 0; i < testTime; i++) {
    stack4.add(i);
}
while(!stack4.isEmpty()) {
    stack4.pop();
}
end = System.currentTimeMillis();
System.out.println(end-start);


int[] stack6 = new int[testTime];
start = System.currentTimeMillis();
int index = 0;
for(int i = 0; i < testTime; i++) {
    stack6[index++] = i;
}
while(index != 0) {
    int a = stack6[--index];
}
end = System.currentTimeMillis();
System.out.println(end-start);
System.out.println("===========End============");

```


```text
===========Start==========
36
5
===========End============
```

用数组实现一些Java中自有的数据结构来节省常数时间