# Java



### JVM

   JVM由三部分组成：**==类加载子系统==**、**==执行引擎==**、**==运行时数据区==**. 

1. 类加载子系统, 可以根据指定的全限定名来载入类或接口. 

2. 执行引擎, 负责执行那些包含在被载入类的方法中的指令. 

3. 当程序运行时, JVM需要内存来存储许多内容, 例如：字节码、对象、参数、返回值、局部变量、运算的中间结果, 等等, JVM会把这些东西都存储到运行时数据区中, 以便于管理. 而运行时数据区又可以分为方法区、堆、虚拟机栈、本地方法栈、程序计数器. 

加分回答

  运行时数据区是开发者重点要关注的部分, 因为程序的运行与它密不可分, 很多错误的排查也需要基于对运行时数据区的理解. 在运行时数据区所包含的几块内存空间中, 方法区和堆是线程之间共享的内存区域, 而虚拟机栈、本地方法栈、程序计数器则是线程私有的区域, 就是说每个线程都有自己的这个区域. 



### HashMap?

**为啥扩容是两倍?**  也就是容量一直是2^n次方

X % 2^ n = X & (2^ n – 1)
2^ n表示2的n次方, 也就是说, **一个数对2^ n取模 == 一个数和(2^n – 1)做按位与运算** . 

### **Java基本类型 和占用字节数**

byte 1 => -2^7 ~ 2^7-1
short 2 => -2^15 ~ 2^15-1
int 4 => -2^31 ~ 2^31-1
float 4
double 4
long 8
char 2
boolean 4byte, 但是boolean[] => 每个元素1byte

### **基本类型, 引用类型区别**

== 上是判断值

引用类型==判断地址

如果重写了equals() => 判断的是值



### **集合**

```java
1) Collection
一组"对立"的元素, 通常这些元素都服从某种规则
 　　1.1) List必须保持元素特定的顺序 (有序.可重复.查找效率高.插入删除低.下标遍历)
   		1.1.1) ArrayList
        1.1.2) Vector
        1.1.3) LinkedList
 　　1.2) Set不能有重复元素(无序.不可重复.查询效率低)
   		1.2.1) HashSet(为快速查找设计, )
        	1.2.1.1) LinkedHashSet
        1.2.2) SortSet
        	1.2.2.1) TreeSet(使得有序)
 　　1.3) Queue保持一个队列(先进先出)的顺序
   		1.3.1) PriorityQueue(模拟堆, 按照元素顺序排序)
    	1.3.2) Deque
2) Map
一组成对的"键值对"对象
	2.1) HashMap
    2.2) HashSet
    2.3) SortedMap
    	2.3.1) TreeMap(基于红黑树排序 O(logn))
    2.4) ....
```

**ArrayList扩容**

插入元素前ensureCapacityInternal() 判断, 如果不够 => grow() 扩容

然后扩容1.5倍 => 复制整个数组 ==开销大!==

所以最好提前设置好容量

**ArrayList or Vector?**

都是List下

Vector => Synchronized同步 => 效率低

Vector扩容两倍 => 浪费空间

ArrayList默认10长

**ArrayList or LinkedList?**

都不线程安全

ArrayList => 数组(默认初始10长)

LinkedList => 双向链表(1.6之前循环链表, 1.7不循环)

插入 => 

ArrayList：若增加至末尾, O(1)；若在指定位置i插入O(n-i). 

LinkedList：插入删除都是近似O(1)

数组支持随机快速访问, 而链表需要依次遍历, 更耗时. 

**占用内存空间大小** => 维护两个指针 or 扩容两倍

**HashMap 和 Hashtable** 

Hashtable方法sychonized修饰 效率比HashMap低

HashMap jdk8当链表长度>=8并且数组长度>=64链表会转红黑树, , Hashtable没有这样机制

默认初始量：Hashtable为11, HashMap为16

扩容：Hashtable容量变为原来2n+1倍, HashMap变为2倍. (如果小于2^n, 会自动扩展到2^n, 因为必须要2^n)

HashSet

HashSet 底层就是基于 HashMap 实现的（除了个别方法自己实现, 其他调用hashmap的）. HashMap使用键(Key)计算hashcode, HashSet使用成员对象来计算hashcode值. 

**HashMap jdk8与jdk7区别**
● JDK8中新增了红黑树, JDK8是通过数组+链表+红黑树来实现的
● JDK7中链表的插入是用的头插法, 而JDK8中则改为了尾插法
	**○**因为JDK1.7是用单链表进行的纵向延伸, 当采用**头插法时会容易出现逆序**且**环形链表死循环**问题. 但是在JDK1.8之后是因为加入了**红黑树使用尾插法**, 能够避**免出现逆序且链表死循环**的问题. 
●JDK8中的因为使用了**红黑树保证了插入和查询了效率**, 所以实际上JDK8中 的Hash算法实现的复杂度降低了
●JDK7中是**先扩容再添加新元素**, JDK8中是**先添加新元素然后再扩容** 
●JDK8中数组扩容的条件也发了变化, 只会判断是否当前元素个数是否超过了阈值, 而不再判断当前put进来的元素对应的数组下标位置是否有值.  

**HashMap 的⻓度为什么是2的幂次⽅**

因为当容量为2的幂时, h&(length-1)运算才等价于length取模, 也就是h%length, 而&比%具有更高的效率, 也就是计算机会计算的更快. **减少哈希冲突：**
**key的哈希码右移16位呢** (32位的 然后左移16位减少hash碰撞)

经过扰动函数计算得到hash值（先计算出key的hashcode, 再计算h^(h>>>16））---减少hash碰撞
通过 **(n - 1) & hash** 判断当前元素存放的位置

**HashMap并发线程安全问题？**

在JDK1.7中, 当并发执行扩容操作会造成环形链, 然后调用get方法会死循环

JDK1.8中, **==并发执行==**put操作时会发生**数据覆盖**的操作. 



### **反射原理**?

通过将类对应的字节码文件加载到 JVM堆中有一个Java.lang.Class对象入口, 通过这个Class对象可以反向获取实例的各个属性以及调用它的方法. 

- Object ——> getClass();（对象.getClass()）

- 都有一个“静态”的class属性 (类.class)

- Class.forName("");

**使用场景**

- 通过反射运行配置文件内容

  - 加载配置文件, 并解析配置文件得到相应信息

  - 根据解析的字符串利用反射机制获取某个类的Class实例

  - 动态配置属性

- JDK动态代理
- jdbc通过Class.forName()加载数据的驱动程序
- Spring解析xml装配Bean(无反射无Spring框架) => IOC 

### **Object的方法有哪些？notify和notifyAll的区别？**

1. getClass--final方法, 获得运行时类型. 

2. toString——对象的字符串表示形式（对象所属类的名称+@+转换为十六进制的对象的哈希值组成的字符串 ）

3. equas方法——如果没有重写用的就是Object里的方法, 和 == 一样都是比较两个引用地址是否相等, 或则基本数据类型值是否相等

4. Clone方法——保护方法, 实现对象的浅复制, 只有实现了Cloneable接口才可以调用该方法, 否则抛出CloneNotSupportedException异常. 

5. notify方法——唤醒在该对象上等待的某个线程

6. notifyAll方法——唤醒在该对象上等待的所有线程

7. Wait方法——wait()的作用是让当前线程进入等待状态, 同时, wait()也会让当前线程释放它所持有的锁, 直到其他线程调用此对象的 notify() 方法或 notifyAll() 方法”, 当前线程被唤醒(进入“就绪状态”). 还有一个wait(long timeout)超时时间-补充sleep不会释放锁

8. Finalize()方法——可以用于对象的自我拯救 => 析构函数 => 可以不被回收 => 导致OOM

9. Hashcode方法——该方法用于哈希查找, 可以减少在查找中使用equals的次数, **重写了equals方法一般都要重写hashCode方法. **这个方法在一些具有哈希功能的Collection中用到. 
   一般必须满足obj1.equals(obj2) == true. 可以推出obj1.hash- Code() == obj2.hashCode(), 但是hashCode相等不一定就满足equals. 不过为了提高效率, 应该尽量使上面两个条件接近等价

### **红黑树**?
二叉查找树（二叉排序, 二叉搜索树）, 相当于二分查找, 但是可能出现线性化, 相当于o(n), 于是出现了红黑树, 它是自平衡的二叉搜索树, 有红黑两种结点, 根节点红色, 叶子节点是为空的黑色结点, 红黑交替, 从任意结点出发到达它可达的叶子结点路径所包含的黑色结点一样, 增删查时间复杂度O(logn).通过变色与旋转维持平衡. 左旋：逆时针旋转, 让父节点右孩子当父亲；右旋：顺时针旋转, 让父节点左孩子当父亲. 

### **JDK与cjlib动态代理**

动态代理好处：
一个工程如果依赖另一个工程给的接口, 但是另一个工程的接口不稳定, 经常变更协议, 就可以使用一个代理, 接口变更时, 只需要修改代理, 不需要一一修改业务代码
作用：
●功能增强：再原有功能加新功能
●控制访问：代理类不让你访问目标
JDK动态代理：利用反射机制生成代理类, 可以动态指定代理类的目标类, 要求实现invovationHandler接口, 重写invoke方法进行功能增强, 还要求目标类必须实现接口. 
Cjlib动态代理：利用ASM开源包, 把代理对象的CLass文件加载进来, 修改其字节码文件生成子类, 子类重写目标类的方法, 被final修饰不可以, 然后在子类采用方法拦截技术拦截父类方法调用, 织入逻辑（定义拦截器实现MethodInterceptor接口）

### **异常体系**

Throwable的子类为Error和Exception

Error就是一些程序处理不了的错误, 代表JVM出现了一些错误, 应用程序无法处理. 例如当 JVM 不再有继续执行操作所需的内存资源时, 将出现 OutOfMemoryError. 

![image.png](https://s2.loli.net/2022/03/22/mZGRf4nxTpwlb1H.png)





### **包装类型和基本类型的区别是什么**

包装类 => 对象 => 初始值为null => 数据堆中 => 引用变量栈中 

基本类型 => 0 => 栈中

### **Java中接口和抽象类的区别？**

方法：接口只有定义, 不能有方法的实现, java 1.8中可以定义default与static方法体, 而抽象类可以有定义与实现, 方法可在抽象类中实现. 
●成员变量：接口成员变量只能是public static final的, 且必须初始化, 抽象类可以和普通类一样任意类型. 
●继承实现：一个类只能继承一个抽象类(extends), 可以实现多个接口（implements)
●都不能实例化
●接口不能有构造函数, 抽象类可以有



### **谈谈常量池的理解·**

1. **class文件常量池**
2. 方法区**运行时常量池**: (编译器生成的字面量和符号引用 => 类加载后放入堆), 还允许动态生成, 例如 String 类的 intern()
3. **字符串常量池**: jdk6及以前, 在方法区, jdk7及以后移到堆
4. 八种基本类型的包装类的对象池

**一次完整的GC流程**



**抽象工厂模式, 详细说下概念和具体在项目里面怎么实现? 那我如果要增加一种具体的产品, 你怎么处理?** 





## 找到垃圾?

GCroot => 往后找 => 找得到就继续找 找不到就回收



如果是引用计数不能解决循环引用的情况, 导致内存泄漏

### 三种清除垃圾方法:

标记清除(Mark-Sweep) => 碎片化严重 
复制算法(copying) => 效率高 无碎片 => 可用内存只有一半 => 两个survive区域来回复制
标记整理算法(Mark-Compact) => 复制到一边]





### 四个事务特性

事务特性 4个点

•	原子性 （atomicity） => 事务执行应该是原子性的, 不可分割.
•	一致性 （consistency）=> 事务前后数据完整性应该一致.
•	隔离性 （isolation） => 事务执行过程中不应该被其他事务影响
•	持久性（durability）=> 事务结束立刻持久化

A原子性

C一致性

I隔离性

D持久性



死锁四个条件

互斥条件

不可剥夺条件

请求保持条件

循环等待

1. **互斥条件** 同一时间只能有一个线程获取资源。 

2. **不可剥夺条件** 一个线程已经占有的资源，在释放之前不会被其它线程抢占 
3. **请求和保持条件** 线程等待过程中不会释放已占有的资源 
4. **循环等待条件** 多个线程互相等待对方释放资源

# OS

### **32位和64位操作系统**? **是不是有故事? 🤣感觉很有趣**



#### 程序角度

 => 32位 64位程序 => 编译后的可执行文件不同 => 跑的平台和系统不同

**但是CPU可以向下兼容**

#### 系统与硬件

- **==CPU一次处理的位数,字长,CPU通用寄存器的数据宽度(32/64bit)==** => 运算速度不同

- 64位CPU(x64) => 运行64位操作系统和32位操作系统 => 可以处理更大的地址整数128GB的内存
- 32位CPU(x86) => 只能运行32位操作系统  => 最多4GB内存

**64位操作系统优势**

64位系统拥有**更大的寻址空间**. 

64位系统拥有**更多可用的寄存器**. 

64位系统拥有**更多可用的CPU指令**. 

64位程序的指针比较耗内存. 一个绕过方案是使用32位指针, 不过实践少. 

第一, **设计初衷不同**. 64位操作系统的设计初衷是为了满足机械设计和分析, 三维动画, 视频编辑和创作, 以及科学计算和高性能计算应用程序等领域中需要大量内存和浮点性能的客户需求. 　　

第二, **要求配置不同**. 64位操作系统只能安装在64位电脑上(CPU必须是64位的). 同时需要安装64位常用软件以发挥64位(x64)的最佳性能.  32位操作系统则可以安装在32位(32位CPU)或64位(64位CPU)电脑上. 当然, 32位操作系统安装在64位电脑上, 其硬件恰似"大马拉小车"：64位效能就会大打折扣. 　

第三, **运算速度不同**. 64位CPU GPRs(General-Purpose Registers, 通用寄存器)的数据宽度为64位, 64位指令集可以运行64位数据指令, 也就是说处理器一次可提取64位数据(**只要两个指令, 一次提取8个字节的数据**), 比32位(**需要四个指令,一次提取4个字节的数据**)提高了一倍, 理论上性能会相应提升1倍. 　　

第四, **寻址能力不同**. 64位处理器的优势还体现在系统对内存的控制上. 由于地址使用的是特殊的整数, 因此一个ALU(算术逻辑运算器)和寄存器可以处理更大的整数, 也就是更大的地址. 比如, Windows Vista x64 Edition支持多达128 GB的内存和多达16 TB的虚拟内存, 而32位CPU和操作系统最大只可支持4G内存. 



### **进程和线程的区别, 线程切换的算法**

- 进程

  是系统进行**资源分配和调度**的基本单位 => 系统中运行的程序(代码 各种数据结构 ...)

  ==资源分配==的最小单位.

- 线程

  操作系统进行**运算调度**最小单位, 包含在进程之中, 是进程的实际运行单位. 

  一个进程可以并发执行多个线程 => 并发: 系统给到线程的时间片轮转

  ==程序执行==的最小单位.

我私下了解到, 

在Linux操作系统底层 => 

fork => 新的进程(使用不同内存空间) => 进程

clone => 新的"进程"(与原进程同一个内存空间) => 线程



### 进程间如何通信

进程间通信主要包括：管道、命名管道、信号、消息队列、共享内存、内存映射、信号量、Socket

1. **管道**

   管道也叫无名（匿名）管道, 它是是 UNIX 系统 IPC（进程间通信）的最古老形式, 所有的 UNIX 系统都支持这种通信机制. 管道本质其实是内核中维护的一块内存缓冲区, Linux 系统中通过 pipe() 函数创建管道, 会生成两个文件描述符, 分别对应管道的读端和写端. 无名管道只能用于具有亲缘关系的进程间的通信. 

2. **命名管道**

   匿名管道, 由于没有名字, 只能用于亲缘关系的进程间通信. 为了克服这个缺点, 提出了有名管道（FIFO）, 也叫命名管道、FIFO文件. 有名管道（FIFO）不同于匿名管道之处在于它提供了一个路径名与之关联, 以 FIFO 的文件形式存在于文件系统中, 并且其打开方式与打开一个普通文件是一样的, 这样即使与 FIFO 的创建进程不存在亲缘关系的进程, 只要可以访问该路径, 就能够彼此通过 FIFO 相互通信, 因此, 通过 FIFO 不相关的进程也能交换数据. 

3. **信号**

   信号是 Linux 进程间通信的最古老的方式之一, **是事件发生时对进程的通知机制**, 有时也称之为**软件中断**, 它是在软件层次上对中断机制的一种模拟, 是一种异步通信的方式. 信号可以导致一个正在运行的进程被另一个正在运行的异步进程中断, 转而处理某一个突发事件. 

4. **消息队列**

   消息队列就是一个消息的链表, 可以把消息看作一个记录, 具有特定的格式以及特定的优先级, 对消息队列有写权限的进程可以向消息队列中按照一定的规则添加新消息, 对消息队列有读权限的进程则可以从消息队列中读走消息, 消息队列是随内核持续的. 

5. **共享内存**

   **共享内存允许两个或者多个进程共享物理内存的同一块区域**（通常被称为段）. 由于一个共享内存段会称为一个进程用户空间的一部分, 因此这种 IPC 机制无需内核介入. 所有需要做的就是让一个进程将数据复制进共享内存中, 并且这部分数据会对其他所有共享同一个段的进程可用. 与管道等要求发送进程将数据从用户空间的缓冲区复制进内核内存和接收进程将数据从内核内存复制进用户空间的缓冲区的做法相比, 这种 IPC 技术的速度更快. 

6. **内存映射**

   内存映射（Memory-mapped I/O）是将磁盘文件的数据映射到内存, 用户通过修改内存就能修改磁盘文件. 

7. **信号量**

   信号量主要用来解决进程和线程间并发执行时的同步问题, 进程同步是并发进程为了完成共同任务采用某个条件来协调它们的活动. 对信号量的操作分为 P 操作和 V 操作, 

   **P 操作是将信号量的值减 1**, 

   **V 操作是将信号量的值加 1**. 当信号量的值小于等于 0 之后, 再进行 P 操作时, 当前进程或线程会被阻塞, 直到另一个进程或线程执行了 V 操作将信号量的值增加到大于 0 之时. 

8. **Socket**

   套接字（Socket）, 就是对网络中不同主机上的应用进程之间进行双向通信的端点的抽象. 一个套接字就是网络上进程通信的一端, 提供了应用层进程利用网络协议交换数据的机制. Socket 一般用于网络中不同主机上的进程之间的通信. 



### 线程间如何通信(Java)

- 共享变量 => valatile

- wait() notifyAll()

- CountDownLatch 设置初始值, 线程运行时调用countDownLatch.countDown()使值减一, 被通知线程countDownLatch.await()

- 使用Condition的await()和singnalAll()方法

### **cpu的三级高速缓存**

![image-20220320213444006](https://s2.loli.net/2022/03/20/2TClOuf3egb85kr.png)

### **虚拟内存**





### **CPU超线程**

超线程, 有时称为==同时多线程==(simultaneous multi - threading), 是一项==允许一个 CPU 执行多个控制流==的技术. 它涉及 CPU 某些硬件有多个备份, 比如程序计数器和寄存器文件, 而其他的硬件部分只有一份, 比如执行浮点算术运算的单元. 常规的处理器需要大约 20000 个时钟周期做不同线程间的转换, 而超线程的处理器可以在单个周期的基础上决定 要执行哪一个线程. 这使得 CPU 能够更好地利用它的处理资源. 比如, **==假设一个线程必须等到某些数据被装载到高速缓存中, 那 CPU 就可以继续去执行另一个线程==**. 举例来说,  Intel Core i7 处理器可以让每个核执行两个线程, 所以一个 4 核的系统实际上可以并行地 执行 8 个线程. 

### **CPU架构有哪些, 你说说看. **



### **4nm制成?**

![image-20220321102209363](https://s2.loli.net/2022/03/21/Y8W1vz24uJnwGFh.png)

现在都是立体晶体管

![image-20220321103728850](https://s2.loli.net/2022/03/21/KU7hCyvZsmetr1Y.png)

但是沟道越做越窄, 平面晶体管工艺最窄只能22nm, 再窄就漏电了, 不用加电压就能跑电子 => 立体FinFET工艺

![image-20220321104421506](https://s2.loli.net/2022/03/21/pXbEq3CuHU1NmKL.png)



![image-20220321104522132](https://s2.loli.net/2022/03/21/x8esISKa12YMGFy.png)

![image-20220321104553038](https://s2.loli.net/2022/03/21/IJFLdPGRpsBbc3m.png)

IBM全能门晶体管 => 晶体管密度是普通2nm的密度 => 并不一定实际上是2nm的宽度



### **硬盘寻道**







## 数据结构

什么是堆? 堆本质是一种什么结构? 堆底层实现? 最大堆插入删除具体步骤? 时间复杂度? 最大堆怎么遍历可以得到有序的序列? 

数组和链表的区别, 什么是循环链表? 

堆栈的区别, 内存分配的原理

数据结构的拆装箱

设计阻塞队列 (循环数组, 条件变量, 原子操作)

LRU是什么, 怎么实现的LRU, 到具体细节. 

链表里面可能有个环, 怎么去判断环存不存在? 环的入口怎么定位(快慢指针)? 

比平衡二叉树的优点

# 算法

关于链表复制

实现单列模式和发布订阅模式

实现数组转树结构

两个队列实现栈

排序问题

我简单描述下, 就是现在有很多节点, 他是用数组存储的, 

节点都有一个id, 一个pid, id就是节点的标识符, pid就是这个节点的父节点的id. 

简单来说一个根节点, 根节点有很多子节点, 子节点的pid就是跟节点的id, 可以理解为要把这个数组转换为类似树的一种结构. 

```java
// 应该是个二维数组 

public class Node{
    int id;
    int pid;
    ArrayList<Integer> son;
    public Node(int id, int pid, int[] sons){
        this.id = id;
        this.pid = pid;
        son = new ArrayList<Integer>(sons);
    }
}

```

找一堆数中的众数, 各种你能想到的方法

设计一个延时队列, 纯代码

TopK问题

# DB

MySql 为什么B+树. 

MySql索引

# Network 

非对称加密

网关 => 



==**CCNA学习指南(CCNA考试指导教材)**==

**tcp和udp的区别, udp的应用场景**

**如何让udp可靠** => 建立可靠机制 然后 HTTP3.0 基于UDP实现 => 

**get&post区别** => 

get 取数据  查询数据 => 更不安全 => url直接显示请求数据  并且有本地缓存

post发送修改请求      => 比get好 =>  数据传输没那么明显至少不会在url里面

本质上都是不安全的 因为 HTTP本身不安全 明文传输

GET => 幂等 可缓存

POST => 不幂等 因为主要会修改服务器数据 不可缓存

本质上区别不大

**dns解析**

浏览器缓存 => 本地hosts文件 => ISP本地服务商 => 根域名服务器 =>.com顶级域名服务器 => 权威域名服务器(世界各地非常多)

**ping命令原理(ICMP)**, ICMP作用, 遇到错误怎么解决, 报文格式. 

基于ICMP协议 => 发送IP数据包 套上ICMP首部(回显请求数据包) => 回来一个(回显应答数据包)



ICMP 还有一个应用程序 就是traceroute 

windows traceroute默认使用ICMP包

Linux traceroute默认使用UDP包

按Linux来说 => 发送一连串UDP包  由于TTL机制 会超时 => 经过的router就依次返回ICMP差错报文

就得到了各个router的IP

**粘包问题是什么? 如何解决?**

1. **发送方原因**(Nagle算法)

TCP默认使用(主要作用：减少网络中报文段的数量), 而Nagle算法主要做两件事：

- ==只有上一个分组得到确认, 才会发送下一个分组==
- 收集多个小分组, 在一个确认到来时一起发送



- 发送数据小于TCP发送缓冲区大小
- 收集多个分组一起发送
- 接收方没有及时读取完TCP缓冲区数据

2. **接收方原因**(缓存太多 可能会故障)

TCP接收到数据包时, 并不会马上交到应用层进行处理, 或者说应用层并不会立即处理. 实际上, TCP将接收到的数据包保存在接收缓存里, 然后应用程序主动从缓存读取收到的分组. 这样一来, 如果TCP接收数据包到缓存的速度大于应用程序从缓存中读取数据包的速度, 多个包就会被缓存, 应用程序就有可能读取到多个首尾相接粘到一起的包. 

**解决:**

使用带消息头的协议

设置消息边界 =>  固定格式设置边界符号.

发送长度 => 给数据格式留出一个数据长度 给代码来处理 => 确定数据边界

**计算机网络**, 自底向上. 

HTTP, https各种字段, 和区别. 

**cdn协议**. 

CDN => 存储静态资源 => ==静态资源异地访问加速==

**websocket, 问我如果需要同步的状态很多怎么办**(网络同步：帧同步, 状态同步)

网络同步? 帧同步? 状态同步?

**一次tcp能发多少个http**(跟http协议有关, 貌似是http1.1, 有兴趣自己了解)

https://zhuanlan.zhihu.com/p/61423830

**NAT了解嘛?**

NAT => 网络地址转换 

路由器 => S-NAT   50个user   CIP|VIP   NAT    DIP|

# Soft

校园经历

### 优点?

 我有很强的自驱力和自学能力, 在之前的工作中自学了Vue.设计模式.JVM等Java相关技术；
 如果在未来工作中遇到不会的, 也会去努力的去学习；包括向前辈学习.书本学习.自己去搜集资料, 而不断的去提升自己；我的这个能力相信会对公司未来发展做出贡献. 



### 缺点? 

我的工作经验相较于其他前辈比较少, 我会在工作中多多学习来弥补我的经验不足.  







1. 了解你面试的岗位要求, 其中有对于软实力和硬实力的要求. 优点围绕要求去回答, 对症下药. 

	2. 软实力：能力+事例+对业绩的好处, 最后的业绩贡献要看面试官有没有问, 没问可以不用回答, 避免可以. 
	3. 硬实力：很强的自驱力和学习能力+学习的技能+对业绩的好处. 
	4. 缺点雷区：不要直面缺点；不要自作聪明. 
      4.1 避免重灾区：依据具体岗位而定（会计：粗心）
       4.2 先谈优点再谈缺点 4：57 这个问题的答案同时体现了你的价值观和对自身能力的认知情况. 





第一：发送简历注意格式PDF
第二：内容同步到正文
第三：邮件有主题和落款
第四：查看是否发送成功
第五：面试前充足准备
第六：自信的眼神交流
第七：精心准备自我介绍（不要超时, 讲重点, 不要讲兴趣爱好和品质；根据岗位要求写）
第八：**回答问题分点, 条理清晰**
第九：**学会分情况讨论**
第十：**回答好最后一个问题**（==**问薪资问题(自信)**==, 企业对于这个岗位有什么期望）







**你有什么要问我的问题吗?**

技术面: 

对我的建议和评价?

贵公司对这个岗位的员工有什么样的期望吗? 或者说如果入职以后的要求? 



hr面: 

薪资福利? 

未来几年公司发展的重点是?



# Resume

### 数据结构



### 常见设计模式



### IO模型

https://zhuanlan.zhihu.com/p/115912936 5种IO模型

https://cloud.tencent.com/developer/article/1862671 epoll 为什么用红黑树？

![img](https://s2.loli.net/2022/03/23/Wo4tk6JqVf7Eelv.jpg)

同步阻塞IO => 同步非阻塞IO => 加入IO多路复用器 => 加入epoll机制(信号驱动) => 异步IO

**同步阻塞IO**

![image-20220323151015356](https://s2.loli.net/2022/03/23/RPsGX4FZTO2l1UA.png)

服务器应用B线程调用revcfrom时, 从kernel缓冲区读取fd会一直阻塞, 直到数据包到达缓冲区或报错.

所以是一个接着一个轮流读取内核中fd. => 慢

**同步非阻塞IO** 



![image-20220323151038146](https://s2.loli.net/2022/03/23/rqW5pcAeT3MBflR.png)

应用B线程从kernel读取fd时, 会遍历用户空间的fd=>然后来内核缓冲区询问是否到达

轮询一次发生在用户空间 => 查询一次就要调一次系统调用内核态用户态来回切换 => CPU保护恢复现场 

所以开销大, 应该尽量把

**加入IO多路复用器** **==内核增加系统调用select==**

![image-20220323152436096](https://s2.loli.net/2022/03/23/W4RrLktp1uEiITK.png) 

![image-20220323151135860](https://s2.loli.net/2022/03/23/SgoHnz9lQOeDBrG.png)

Linux内核新增select系统调用 => 用户进程B 把你要监控的1000个fd传给内核 => 一次

kernel自己监控, 当数据到达 => 返回ready的fd => 然后B再调用**read系统调用** =>一次

所以减少了内核态用户态切换 => 提高CPU利用效率



**加入epoll机制(信号驱动)** => 因为select拷贝数据来去开销 又想优化 => **==共享空间==**

内核又新增了**==mmap系统调用==** => 内核态与用户态的共享空间

![image-20220323153844543](https://s2.loli.net/2022/03/23/kJBPWvAGti7FMg3.png)

![image-20220323153614872](https://s2.loli.net/2022/03/23/GiN7IUprqF5ZbuV.png)

详细理解 内核态与用户态的共享空间**如何创建(epoll_create) 如何使用(epoll_wait)** 

然后数据来了  => 软中断 => 从fd buffer拷贝数据到红黑树

![image-20220323160701976](https://s2.loli.net/2022/03/23/LKxJfjaTtFvgzqc.png)



###  **==在 Linux 的设计中有三种典型的 I/O 多路复用模型 select、poll、epoll. ==** 

 **select 是一个主动模型, 需要线程自己通过一个集合存放所有的 Socket, 然后发生 I/O 变化的时候遍历**. 在 select 模型下, 操作系统不知道哪个线程应该响应哪个事件, 而是由线程自己去操作系统看有没有发生网络 I/O 事件, 然后再遍历自己管理的所有 Socket, 看看这些 Socket 有没有发生变化.  

 **poll 提供了更优质的编程接口, 但是本质和 select 模型相同**. 因此千级并发以下的 I/O, 你可以考虑 select 和 poll, 但是如果出现更大的并发量, 就需要用 epoll 模型.  

 **epoll 模型在操作系统内核中提供了一个中间数据结构, 这个中间数据结构会提供事件监听注册, 以及快速判断消息关联到哪个线程的能力（红黑树实现）**. 因此在高并发 I/O 下, 可以考虑 epoll 模型, 它的速度更快, 开销更小. 

**异步IO**



### JVM信手拈来



### 计算机网络信手拈来



### Redis源码

 => 持332久化? 主从复制? 哨兵? 集群分片?



### MySQL

 => InnoDB,MyISAM? 索引? SQL优化?

### 了解Cocos Creator, Unity



### SpringCloud



### Kafka, RocketMQ



### Restful API? OAuth? JWT?



### Protobuf如何设计使用?

 => 如何编解码

### 角色入场, 角色移动, 角色离场

 => 如何同步? => Netty (ChannelGroup)

### Redis+RocketMQ

如何实现排行榜系统的? => 是存在库里 => 用户要的时候才返回(并不是实时的)

1. **服务器生产数据 userId 击杀次数 死亡次数 => 发给RocketMQ**

2. **RocketMQ => 排行榜进程(排名逻辑处理) => 写到Redis**

3. **最后用户再要排名的时候再从Redis取排名数据**

![image-20220323235920704](https://s2.loli.net/2022/03/23/sNBiObKyoglvn5P.png)

- 需求

  - 根据击杀胜利次数进行排名；

  - 显示排名 Id、用户头像、用户名称、胜利次数；

  - 最多显示 10 个用户；

- 实现
  - 修改 Protobuf 消息协议文档；
  - 增加 GetRankCmd 和 GetRankResult；
  - 增加 GetRankCmdHandler 类；
  - 修改 UserAttkCmdHandler 类完成排行榜功能；

- Redis命令

  - hset, hget (哈希表存取) => 设

    ```redis
    hset User_1 BasicInfo "{userId:1}"
    hset User_1 kill 2
    hset User_1 die 1
    ```

  - hincrby(线程安全增加)

    ```redis
    hincrby User_1 kill 1
    Integer 3
    ```

  - zadd(设置一个zset)

  - zrange(升序), zrevrange(降序)



### Filebeat(收集), Elasticsearch(存储, 搜索), Kibana(展示)

**LogStash or Filebeat?**

因为**logstash是jvm跑的, 资源消耗比较大**, 所以后来作者**又用golang写了**一个功能较少但是资源消耗也小的轻量级的logstash-forwarder. 后来改名叫Filebeat.

是什么? 如何使用? 如何配置?

![image-20220324003302290](https://s2.loli.net/2022/03/24/Cf4S3iUe7pw5ys6.png)

配置完后他会自动帮你捞日志 => 直接通过Kibana看就行啦! 

**配置**

装好Filebeat => 修改filebeat.yml配置文件 => 

配置log目录位置, 配置es网络位置, Kibana网络位置





### 工厂模式是什么? 

怎么运用的? 给你加一个功能怎么加入呢?



### 如何生成验证码?

 => 什么格式(JOSN) 如何调用第三方服务发送? 如何使用JWT生成token? 如何在网关校验?

### 灰度发布怎么实现的?

 你还知道哪些灰度发布的实现? => 蓝绿,滚动,... => Zuul? Ribbon?

### 路线信息存储? 

怎么创建订单?(前面几节课) 存储计价规则? => 操作运营端.

验证码

# 英雄传说

只用了Netty 基本上纯手写

只用了Redis RocketMQ MySQL

### GameServer

```java
EventLoopGroup bossGroup = new NioEventLoopGroup();   // 拉客的, 故事中的美女
EventLoopGroup workerGroup = new NioEventLoopGroup(); // 干活的, 故事中的男服务生
```



**用ServerBootstrap建立了**

1. 这些Http编解码器

2. 内容长度限制
3. SocketServerProtocol: WebSocket协议
4. 游戏消息编码器
5. 游戏消息解码器
6. 游戏消息处理器

```java
ServerBootstrap b = new ServerBootstrap();
            b.group(bossGroup, workerGroup);
			// 非阻塞的信道, 拉客不停歇!
            b.channel(NioServerSocketChannel.class); 
			// 告诉干活的这活应该怎么干?
            b.childHandler(new ChannelInitializer<SocketChannel>() { 
                @Override
                public void initChannel(SocketChannel ch) {
                    // 在这里告诉干活的这活应该怎么干?
                    ch.pipeline().addLast(
                        new HttpServerCodec(), // 添加 Http 编解码器
                        new HttpObjectAggregator(65535), // 内容不能太长
                        // WebSocket 协议
                        new WebSocketServerProtocolHandler("/websocket"), 
                        new GameMsgEncoder(), // 增加游戏消息编码器
                        new GameMsgDecoder(), // 增加游戏消息解码器
                        new GameMsgHandler()  // 最后在这里处理游戏消息
                    );
                }
            });
```

```java
// 绑定服务器端口号
ChannelFuture f = b.bind(AllConf.GAME_SERVER_HOST, AllConf.GAME_SERVER_PORT).sync(); // 阻塞函数等待服务器完全启动
```

```java
if (f.isSuccess()) {
    LOGGER.info(">>> 游戏服务器启动成功! <<<");
}

f.channel().closeFuture().sync();
```



**消息进来后先通过解码器 => 生成消息对象**

```java
Message newCmd = msgBuilder.build();
```



然后走到主线程处理器 **MainThreadProcessor** **创建CmdHandler消息逻辑处理器**

```java
// 创建命令处理器
final ICmdHandler<? extends GeneratedMessageV3> handlerImpl = CmdHandlerFactory.create(msgClazz);
```



不同的消息就会在不同的处理器被处理 => 然后返回结果

例如首先是登陆 **先创建了UserLoginCmdHandler 调用 LoginService 处理登陆逻辑**

处理完后获取用户实体 => 有一个回调函数 => **回调函数构建**userId, userName,userAvatar

如果不为空 **就构建结果并且writeAndFlush** => 向管道写回消息

```java
public ChannelFuture writeAndFlush(Object msgObj) { // 向管道写回消息
    if (null != msgObj) {
        return _realCtx.writeAndFlush(wrapMsg(msgObj));
    } else {
        return null;
    }
}
```



000 => 0

001 => 1

010 => 2

011 => 3

100 => 4

101 => 5

110 => 6

111 => 7



chmod ug+rwx 

chmod 777 [filename]

# 一面

### **HashMap如何实现的 => 具体流程 具体数据结构**

### **操作系统权限管理 => root权限** 

https://zhuanlan.zhihu.com/p/94240550: 一篇文章了解Linux操作系统的权限管理

https://www.cnblogs.com/starof/p/4350212.html: linux chmod命令和chown命令

基于用户角色 => 提供权限管理机制(UGO+RWX/ACL权限控制)

UGO => User, Group, Other

RWX => Read, Write, eXecute

ACL => Access Control List

**自主访问控制(Discretionary Access Control, DAC)** => 文件拥有者可以决定文件权限设置

SELinux => MAC(Mandatory Access Control)

![image-20220325003312826](https://s2.loli.net/2022/03/25/4itbuCRUTPsBMzG.png)

![img](https://s2.loli.net/2022/03/25/XqW63cEUaBmAYvG.jpg)

常规- 目录d 块设备b 连接l 字符设备c

常规文件 => - 

目录 => d

块设备 => b

链接 => l

字符设备 => c
-dblc => 普通文件, 目录, 块设备, 链接, 字符设备
-dblc => 普通文件, 目录, 块设备, 链接, 字符设备

后面三段是文件具体的权限描述信息了, 分别是==文件所有者==, ==组用户==权限和==其它用户==的权限.

1. **r表示对于该用户可读**，对于文件来说是允许读取内容，对于目录来说是允许读取其中的文件；
2. **w表示对于该用户可写**，对于文件来说是允许修改其内容，对于目录来说可以写信息到目录中，即可以创建、删除文件、移动文件等操作。
3. **x表示对于该用户可执行**, 目录的话可以被搜索.

**==chmod和chown==**

\+ 表示添加权限, - 表示删除权限, = 重置权限

r => 100(4), r => 010(2), x => 001(1),  - => 0

所以可以用数字来改 ==rwx r-x r--== => ==111 101 100== => 754

-rw------- (600) 只有所有者才有读和写的权限。

-rw-r--r-- (644) 只有所有者才有读和写的权限，群组和其他人只有读的权限。

-rw-rw-rw- (666)每个人都有读写的权限

-rwx------ (700) 只有所有者才有读，写和执行的权限。

-rwx--x--x (711) 只有所有者才有读，写和执行的权限，群组和其他人只有执行的权限。

-rwxr-xr-x  (755) 只有所有者才有读，写，执行的权限，群组和其他人只有读和执行的权限。

-rwxrwxrwx (777) 每个人都有读，写和执行的权限



**查看权限**

执行ls -l /a/b查看的并不是b的权限，而是c的权限。ls -l /a/b => 显示目标文件夹中的文件权限信息

- ls -l /a => 能看到b文件的权限
- ls -l /a/b => 能看到c文件的权限
- ls -l /a/b/c => 能看到c文件的权限

**==chmod==**修改权限

- chmod 700 /a 修改的是a文件的权限
- chmod 700 /a/b 修改的是b文件的权限
- chmod 700 /a/b/c修改的是c文件的权限

```shell
# chmod o+w file:表示给其他人授予写file这个文件的权限
# chmod go-rw file：表示删除群组和其他人对file这个文件的读和写的权限
# chmod go-w+x mydir：拒绝组成员和其他人创建或删除mydir（go-w）中文件的权限，允许组成员和其他人搜索mydir
```

**==chown==** => 文件和目录权限可通过chomd来修改

```bash
[root@yl-web-test ~]# mkdir permission
[root@yl-web-test ~]# cd permission/
[root@yl-web-test permission]# ls
[root@yl-web-test permission]# touch file
[root@yl-web-test permission]# ll
total 0
-rw-r--r--. 1 root root 0 Aug  6 09:17 file # => root root => 所有者和用户组

# 修改修改file文件的所有者为lxy
[root@yl-web-test permission]# chown lxy file
[root@yl-web-test permission]# ll
total 0
-rw-r--r--. 1 lxy root 0 Aug  6 09:17 file

# 修改file文件的用户组为lxy
[root@yl-web-test permission]# chown root file
[root@yl-web-test permission]# ll
total 0
-rw-r--r--. 1 root root 0 Aug  6 09:17 file
[root@yl-web-test permission]# chown :lxy file
[root@yl-web-test permission]# ll
total 0
-rw-r--r--. 1 root lxy 0 Aug  6 09:17 file

# 同时修改所有者和用户组
[root@yl-web-test permission]# chown lxy:lxy file
[root@yl-web-test permission]# ll
total 0
-rw-r--r--. 1 lxy lxy 0 Aug  6 09:17 file

# 若修改文件夹下所有文件 => 用-R参数 (遍历?)
[root@yl-web-test permission]# chown -R lxy:lxy file
```

### **String是如何查找的...**



### **zSet是如何查找到数据的...**

底层用了跳表和压缩链表  

查数据是通过hash去查找的, 如果大于64, 就会自动生成hash

### **Redis如何实现各种数据结构, zsocre命令如何使用的, 使用原理是什么...**



### **计算机网络...**

### **进程线程 => 线程是如何调度的调度......**

