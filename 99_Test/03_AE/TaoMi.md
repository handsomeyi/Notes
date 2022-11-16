# 笔试

## 二级指针

## 多边形内外利用射线法

## tcp4次挥手的过程

## 点乘叉乘，凸包问题，判断是凸多边形还是凹多边形

## 面向对象七个原则，继承与组合的区别

### 开闭原则（The Open-Closed Principle ，OCP）

- **对扩展开放**（open）
- **对修改关闭**（closed） 的设计原则。

### 里氏替换原则（Liskov Substitution Principle ，LSP）

- **不应该在代码中出现if/else对类的类型进行判断的操作**
- **派生类应当可以替换基类并出现在基类能够出现的任何地方，或者说如果我们把代码中使用基类的地方用它的派生类所代替，代码还能正常工作。**

### 迪米特原则（最少知道原则）（Law of Demeter ，LoD）

只把需要的最少信息传递给下一个结构.

### 单一职责原则

只加载需要的功能, 冗余的不要加载

修改时也方便修改, 否则会影响到另一个职责

### 接口分隔原则（Interface Segregation Principle ，ISP）

不能强迫用户去依赖那些他们不使用的接口。

### 依赖倒置原则（Dependency Inversion Principle ，DIP）

A. 高层模块不应该依赖于低层模块，二者都应该依赖于抽象
B. 抽象不应该依赖于细节，细节应该依赖于抽象 
C. 针对接口编程，不要针对实现编程。

High Level Classes（高层模块） --> Abstraction Layer（抽象接口层） --> Low Level Classes（低层模块）

### 组合/聚合复用原则（Composite/Aggregate Reuse Principle ，CARP）

就是说要尽量的使用合成和聚合，而不是继承关系达到复用的目的。



## 数据量特别大如何设计表结构

首先架构层面 可以使用主从复制架构 做到读写分离 => 带来的同步开销.

**数据库设计和表创建时就要考虑性能**

**设计时要注意**

- 避免null值, null很难查询优化占用索引空间, 用0代替null.

- 尽量使用INT而非BIGINT, 若非负加上UNSIGNED(可把符号位利用), TINYINT, SMALLINT, MEDIUM_INT更好.
- 使用枚举或整数代替字符串
- 尽量使用TIMESTAMP而非DATETIME
- 字段数20以内
- 整形存IP, 有一个算法可以相互转换来着?

**索引**

- 针对性创建索引,考虑在WHERE和ORDER BY命令上涉及的列建立索引, 可根据EXPLAIN来查看是否用了索引还是全表扫描
- 尽量避免WHERE子句判断NULL值, 否则索引将失效, 进行全表扫描
- 值分布稀少不需建立索引, 例如"性别"
- 字符字段只建立前缀索引
- 字符字段不做主键
- ==不用外键, 程序保证约束?==
- 不用UNIQUE, 由程序保证约束?
- 多列索引时注意顺序与查询条件保持一致, 删除不必要的单列索引.

```sql
# 选择合适的数据类型
（1）使用可存下数据的最小的数据类型，整型 < date,time < char,varchar < blob
（2）使用简单的数据类型，整型比字符处理开销更小，因为字符串的比较更复杂。如，int类型存储时间类型，bigint类型转ip函数
（3）使用合理的字段属性长度，固定长度的表会更快。使用enum、char而不是varchar
（4）尽可能使用not null定义字段
（5）尽量少用text，非用不可最好分表
# 选择合适的索引列
（1）查询频繁的列，在where，group by，order by，on从句中出现的列
（2）where条件中<，<=，=，>，>=，between，in，以及like 字符串+通配符（%）出现的列
（3）长度小的列，索引字段越小越好，因为数据库的存储单位是页，一页中能存下的数据越多越好
（4）离散度大（不同的值多）的列，放在联合索引前面。查看离散度，通过统计不同的列值来实现，count越大，离散程度越高：
```

**sql的编写需要注意优化**

- 使用limit对结果进行限定
- 避免selset * from
- 使用连接代替子查询
- 拆分大的delete或insert语句
- 开启慢查询日志找出较慢的SQL
- 不做列运算, 也就是 `select id where age + 1 = 10` 对age进行运算操作, 导致全表扫描, 应该在等号右边操作
- SQL语句尽量简单, 将大语句拆分为小语句.
- 不用函数与触发器, 在程序实现
- 避免%XXX查询
- 少用JOIN
- 使用同类型进行比较
- 避免在where子句中使用1= < > , 否则会全表扫描
- 列表数据不应该拿全表, 应该拿LIMIT分页结果, 每页不要带大

**引擎**

MyISAM适合SELECT密集
InnoDB适合INSERT密集
但是MyISAM不支持事务, 所以必须用InnoDB.

**分区**

MySQL5.1时已经有了简单的水平拆分, 建表的适合加上分区参数, SQL查询的时候带上分区条件参数.
底层实现是多个物理子表, 因此可以将表分布在不同的物理设备上, 充分利用硬件.

优势

- 逻辑单表存更多数据, 物理单表实际上是分开的.
- 操作灵活, 可对分区进行整体删除或增加分区. 或者备份恢复单个分区.
- 部分查询落在少数分区上, 提高效率
- 避免某些特殊瓶颈，例如InnoDB单个索引的互斥访问、ext3文件系统的inode锁竞争???

劣势

- 最多1024个分区
- 如果分区字段中有主键或者唯一索引的列，那么所有主键列和唯一索引列都必须包含进来
- 分区表无法使用外键
- NULL值使分区过滤失效?

分区类型

- RANGE分区：基于属于一个给定连续区间的列值，把多行分配给分区
- LIST分区：类似于按RANGE分区，区别在于LIST分区是基于列值匹配一个离散值集合中的某个值来进行选择
- HASH分区：基于用户定义的表达式的返回值来进行选择的分区，该表达式使用将要插入到表中的这些行的列值进行计算。这个函数可以包含MySQL中有效的、产生非负整数值的任何表达式
- KEY分区：类似于按HASH分区，区别在于KEY分区只支持计算一列或多列，且MySQL服务器提供其自身的哈希函数。必须有一列或多列包含整数值

**分表**

水平分表 => 就是分区啊.

垂直分表 => (基于业务区分)将不常用, 数据较大, 长度较长拆分到扩展表.

**分库**

垂直分库 => 数据库表太多, 按照业务逻辑垂直切分, 例如订单服务相关数据放到一个库,个人信息服务相关数据放到另一个库

水平分库 => 单张表数据分为几个区, 这与分区又很像了, 比较麻烦. **每个分区的表结构相同, 数据集不同.**







## 用位运算优化判断是否为4的倍数

```java
算法如下：
　　x&3==0，则是4的倍数。
原理：
　　先来看一组数字的二进制表示
　　4　　　　0100
　　8　　　　1000
　　12　　　 1100
　　16　　  10000
　　20　　  10100
　　由此可见4的倍数的二进制表示的后2为一定为0。
　　从另外一个角度来看，4的二进制表示是0100，任何4的倍数一定是在此基础上增加n个0100，由此也可得4的倍数的二进制表示的后2为一定为0。
```



# 一面试

判断是否是排序树
tcpudp区别
红黑树
平衡树
MySQL存储引擎有什么
索引是什么
topK问题
大端小端 windows是大端还是小端

## 判断是否是排序树

- 二叉排序树中序遍历后的结果序列为递增

- 左孩子小于等于父节点, 右孩子大于等于父节点

- ```java
  boolean checkBST(Node root) {
      return checkBST(root, Integer.MIN_VALUE, Integer.MAX_VALUE); 
  }
  boolean checkBST(Node root, int min, int max) {
      if (root == null) return true; 
      if (root.data <= min || root.data >= max)
          return false;
      if (!checkBST(root.left, min, root.data) || !checkBST(root.right, root.data, max))
          return false;
      return true;
  }
  ```

## tcpudp区别

## 红黑树

- 从二叉搜索树 → \rightarrow→ AVL，严格控制左右子树高度差，避免二叉搜索树退化成链表（时间复杂度从O(logN)退化成O(N)

- 从AVL → \rightarrow→ 红黑树，牺牲严格的平衡要求，以换取新增/删除节点时少量的旋转操作，平均性能优于AVL；通过红黑规则，保证在最坏的情况下，也能拥有O(logN)的时间复杂度

- 红黑树的应用：Java的TreeMap、TreeSet、HashMap(JDK1.8)；linux底层的CFS进程调度算法中，vruntime使用红黑树进行存储；多路复用技术的Epoll，其核心结构是红黑树 + 双向链表。

- 红黑规则

- 红黑树节点的定义、红黑树的定义、红黑树的左旋、右旋操作

- 红黑树新增节点后的调整，记住左儿子的情况，举一反三右儿子的情况

- 红黑树删除节点后的调整，记住左儿子的情况，举一反三右儿子的情况
  ————————————————

  原文链接：https://blog.csdn.net/u014454538/article/details/120120216

## 平衡树

## MySQL存储引擎有什么

## 索引是什么

B+数数据结构

## topK问题

三种思路

## 大端小端 windows是大端还是小端

来自于Jonathan Swift的《格利佛游记》

比如数据 `0x123456` 在两种情况下的存储形式

大端 => 字节高低位递增 => 地位 => 高位 => **判断正负**

```cpp
  低地址 -----> 高地址
  0x12 | 0x34 | 0x56 
      //大端模式由于符号位为第一个字节，很方便判断正负
```

小端 => 字节高低位递减 => 高位 => 低位 => **截取低字节**

```cpp
  低地址 -----> 高地址
  0x56 | 0x34 | 0x12 
      // 小端模式强制转换类型时不需要调整字节内容，直接截取低字节即可
```

**==小端序列的优势在于计算更方便==**。比如你有一个int型的数据，它占4个字节，假设它在内存中的地址是0x00007ffe9ac00000现在你要把它截断，变成一个char类型的数据，新的数据的地址不会发生变化。如果是大端序的话，保留低8位，它的地址就发生变化了。

Java虚拟机里面的字节序是大端，网络字节序也是大端。
链接：https://www.zhihu.com/question/62630221/answer/362412930

大小端是由CPU和操作系统来决定的，在操作系统中，
x86和一般的OS（如windows，FreeBSD,Linux）使用的是**小端模式**，
但比如Mac OS是**大端模式**。

 知道为什么有模式的存在，下面需要了解下具有有什么应用场景： 1）不同端模式的处理器进行数据传递时必须要考虑端模式的不同 2）在网络上传输数据时，由于数据传输的两端对应不同的硬件平台，采用的存储字节顺序可能不一致。 所以在TCP/IP协议规定了在网络上必须采用网络字节顺序，也就是大端模式。 

## 平时看什么书

深入理解java虚拟机

图解算法

计算机网络

我觉得我接下来得看 Effective C++ 了.  Effective Modern C++. 

还有其他的话 以前看过三体.



# 二面试

coding => 二分查找(降序数组), 全排列一个字符串(递归回溯)