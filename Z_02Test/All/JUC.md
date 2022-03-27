# 1. 多线程理解

什么是多线程: 多线程指的是在单个程序中可以同时运行多个不同的线程, 执行不同的任务

- 提高CPU资源的利用率
- 提高程序响应. 
- 使用场景: 
  1. 后台任务, 例如: 定时向大量(100w以上)的用户发送邮件; 
  2. 异步处理, 例如: 发微博, 记录日志等; 
  3. 分布式计算 => 有意思
  4. tomcat, 多个客户端访问一个web程序, 把每个请求给一个servlet

### 并行和并发的区别

并发 => 任务提交方式 => 指的是多个任务并发打过来, 我应该如何处理? => 分时间片给各个任务
并行 => 任务执行方式 => 多个cpu同时执行处理
并行是并发的子集

# 2. Java实现同步方式

- synchronized 关键字
- wait, notify等
- Concurrent包中的ReentrantLock
- volatile关键字
- ThreadLocal局部变量

# 3. 线程的6种状态

- **==new==**: 新创建一个线程对象
- **==runnable==**: Java将操作系统的就绪状态与运行状态统称为runnable, 调用start方法后进入就绪态等待操作系统调用, 获取到cpu时间片, 进入运行态
- **==阻塞状态==**
  - **blocked**: 阻塞于锁
  - **waiting**: 调用Object.wait(), Thread.join(), LockSupport.park()进入; 调用Object.notify(), Object.notifyAll(), LockSupport.unpark()回到runnable状态
  - **Timed_waiting**: 调用Object.wait(long), Thread.sleep(long)进入超时等待
- **==terminated==**: 线程执行完毕

# 4. 开启多线程方式

1. **==实现Runnable==**, Runnable规定的方法是run(), 无返回值, 无法抛出异常 

2. **==实现Callable==**, Callable规定的方法是call(), 任务执行后有返回值, 可以抛出异常

3. **==继承Thread类==**, 继承java.lang.Thread类, 重写Thread类的run()方法, 在run()方 法中实现运行在线程上的代码, 调用start()方法开启线程.  Thread 类本质上是实现了 Runnable 接口的一个实例, 代表一个线程的实例. 启动线程的唯 一方法就是通过 Thread 类的 start()实例方法. start()方法是一个 native 方法, 它将启动一个 新线程, 并执行 run()方法

4. **==使用 Executors 工具类创建线程池==**

   实现 Runnable 和 Callable 接口的类只能当做一个可以在**线程中运行的任务**, 不是真正意义上的线程, 因此最后还需要通过 Thread 来调用. 可以理解为任务是通过线程驱动从而执行的. 

   **Ruunable与Callabale区别？**
   都是通过实现他们来开启多线程, Runnable是重写run方法, 无返回值, Callable重写call方法, 有返回值, 可以捕获异常. 需要将实现Callable接口的类作为参数丢给FutureTask类, 然后将TutureTask实例作为参数丢给Thread类, 才开启多线程. 
   可以**通过future或则FutureTask获取返回结果**, Future是接口, 线程池submit后, 可以通过future异步获取任务返回结果, FuturTask实现了Runable和Future接口

# 5. 几个常用方法(线程同步线程调度相关)

- **Object.wait()**
  - Object类的方法, 使线程阻塞等待, 释放锁, 不需要捕获异常, 用于线程通信, 等待必须notify唤醒
  - wait, notify和notifyAll只能在同步控制方法或者同步控制块里面使用
- **Object.notify(), notifyAll()**: 唤醒某一个等待线程, 唤醒所有等待线程去竞争锁
- **Thread.sleep()**: Thread类静态方法, 使线程进入睡眠, 不释放锁, 需要捕获异常, 睡到时间自动醒, wait必须notify
- **Thread.yield()**: Thread静态方法, 让当前线程回到可执行状态, 礼让, 让同优先级或则更高优先级的线程获得执行机会
- **join()**: 等待调用join方法的线程结束, 再继续执行

# 6. Java内存模型(JMM)

**定义**: 
只是一个抽象的规范, 避免不同硬件和操作系统下对内存访问逻辑有所差异带来同一套代码不同执行结果的问题

**JMM关于同步的规定**: 
1: 线程解锁前, 必须把共享变量的值重新刷新回主内存当中
2: 线程加锁前, 必须将主内存中最新值读到工作内存中
3: 加锁解锁是同一把锁

**JMM对内存的划分**
JMM把内存主要分为主内存与工作内存, 规定变量存储于主内存中, 每个线程都有自己的工作内存, 线程中保存了自己需要操作的变量的主内存的拷贝副本, 对其进行操作后再刷回主内存, 每个线程工作内存是独立的, 线程操作数据只能在工作内存中进行, 再刷回主内存, 所以线程通信得依靠主内存. 
Java线程<----->工作内存<----->主内存

# 7. as-if-serial (就像和单线程一样)

不管怎么重排序, (单线程)程序的执行结果不能被改变. 
还有就是数据依赖【写后读+写后写+读后写】也是不能重排序

# 8. happens-before(两个操作的关系)

- **原则定义**
  - 如果一个操作happens-before另一个操作, 那么第一个操作的执行结果将对第二个操作可见, 而且第一个操作的执行顺序排在第二个操作之前. 
  - 两个操作存在happers-before关系, 并不意味者Java平台的具体实现必须要按照happens-before关系指定的顺序来执行. 如果重排序后的执行结果与按happens-before关系执行的结果一致, 那么这种重排序合法(JMM允许这种重排序)

- **规则**
  - 程序顺序规则: 一个线程内, 按照代码顺序, 前面的操作先行发生于后面的操作
  - 锁定规则: 解锁happens-before后面同一个锁的加锁
  - 传递性: A happens-before B, B happens-before C, 那么A happens-before C.
  - volatile: 写volatile变量happens-before读volatile变量

# 9. synchronized使用范围

- **修饰实例方法(对象锁)**: 锁的是当前对象实例
  某个线程得到了对象锁 => 其他线程就拿不到此对象锁 => 不能访问此对象的同步方法(不同步普通方法的可以访问)

```java
    public synchronized void test1(){ // 修饰实例方法
        // TODO
    }
    public void test2(){
        synchronized (this) { // 锁住当前this对象
            // TODO
        }
    }
```

- **修饰静态方法(类锁)**: 锁当前类的Class对象 => 和对象锁差不多 => 但是锁不同, 相互独立

```java
    public static synchronized void test(){ // 修饰静态 static 方法
        // TODO
    }
    public static void test(){
        synchronized (Test.class) { // 引用当前的类
            // TODO
        }
    }
```



**修饰代码块**: 锁是Sychonized括号里配置的对象

# 10. synchronized底层实现原理 (获取对象监视器)

- **修饰同步代码块**
  - javac编译时, 会在代码块前后生成monitorenter和monitorexit, 当执行遇到monitorenter指令, 会尝试获取对象的monitor使用权, 即尝试加锁, 
  - 为了保证出现异常也能释放锁, 会隐式添加一个try-finnaly, finnaly中有monitorexit命令释放锁
  - 任何对象都有一个monitor与之关联, 当且一个monitor被持有后, 它将处于锁定状态

- **修饰方法**
  - javac为方法的**==flags属性==**添加了一个**==ACC_SYNCHRONIZED==**关键字, 在JVM进行方法调用时, 发现调用的方法被ACC_SYNCHRONIZED修饰, 则会先尝试获得锁
  - 两者本质都是**==获取对象监视器monitor==**

# 11. 对象头. Mark Word. monitor构造

- 对象: 对象头+实例数据+对齐填充

- 对象头: Mark Word+类型指针(若是数组, 还包含长度)

- Mark Word: 存对象自身运行时信息(hashcode, GC分代年龄, 锁状态标志, 持有的锁)

- moniter: 每个对象与一个monitor关联, 若synchronized给该对象加锁后, 该对象头的mark work被设置成指向moniter的指针(重量级锁)

  ![image-20211015190143112](https://s2.loli.net/2022/03/28/DxXArOQCv9TdPZf.png)

  

# 12. synchronized锁升级

![image-20211015192325739](https://s2.loli.net/2022/03/28/yfnP28GFaxT7tYr.png)

1. 先判断Mark Word里面是否有当前线程指针, 若有则处于偏向锁

2. 若无则尝试用cas将mark word替换为线程Id, 若成功则偏向锁设置成功

3. 失败则有竞争要升级成轻量级锁, 尝试cas替换mark word为**锁记录指针**, 成功获得锁, 失败表示其他线程竞争锁, 

4. 当前线程尝试使用自旋获取锁, 获取成功依然处于轻量级锁, 自旋失败等太久升级成重量级(WaitSet等待队列). 

   (轻量级锁不会自己释放锁)

5. 偏向锁依赖当前线程ID, 重量级锁依赖monitor 轻量级锁依赖‘锁记录lock-record`

**是否一定要先用偏向锁?**
如果明确知道很多线程在竞争,偏向锁需要锁撤销,也消耗CPU资源,这时候直接用自旋锁
JVM启动,有很多线程竞争(明确),默认启动时不打开偏向锁,过一段时间再打开.
默认:     -XX:BiasedLockingStartupDelay=4
如果设为0,就代表已启动,就会变成匿名偏向锁,如上图:

**轻度竞争:**
每个线程有一个标志位[**LR**], Lock Record 表示, 两个线程想把自己的LR贴到MarkWord(厕所门)上, 另一个就自旋.

**重度竞争:**
synchronized -->  monitorenter(JVM指令) --> 重量级锁

**偏向锁未启动**

**偏向锁已经启动**

**自旋升级为重量级锁:**

1.6之后有Adapative Self Spinning ,JVM自适应控制.

**为什么?** 因为**==自旋消耗CPU资源==**,如果锁时间长,自旋线程过多,CPU就被大量浪费

重量级锁,**==等待线程丢到WaitSet等待队列,不消耗CPU==**.

# 13. synchronized与lcok区别



# 14. synchronized与volatile区别

- **本质原理不同**: 虽然两个都能保证可见性和有序性, 但是本质不一样. 
  - volatile本质是lock汇编前缀, 利用**嗅探**与**缓存一致性协议**保持可见性, **用内存屏障**达到禁止指令重排序, 以保证有序性. ;  
  - synchronized是通过阻塞其他线程, 只有当前线程可以访问. 
- **使用范围不同**: volatile仅能使用在变量级别; synchronized则可以使用在方法, 代码块的
- **功能不同**: volatile仅能保证可见性和有序性, synchronized可以保证原子性
- **是否能被编译器优化**: 被volatile修饰禁止指令重排, 不能被编译器优化, synchronized可以
- **是否造成线程阻塞情况**: volatile不会造成线程的阻塞; synchronized可能会造成线程的阻塞(不会释放锁). 

# 15. volatile

volatile是java虚拟机提供的轻量级同步机制
●作用: 保证线程变量间可见性+禁止指令重排, 保证有序性, 不保证原子性

- 可见性原理
  - lock前缀+嗅探机制+缓存一致性协议
  - lock前缀作用: 
    - 将当前处理器的缓存行写入主内存
    - 写回内存的操作会导致其他处理器缓存失效
  - volatile在进行写操作时, JVM会向处理器发送一个lock前缀指令, 将这个变量所在缓存行的数据写到主内存, 每个处理器通过嗅探机制监听总线上的数据来检查自己缓存行的数据是否过期, 要是发现自己缓存行对应的内存地址被改了, 就会将当前缓存行设置为无效状态. 当自己要用时再去主内存将数据读到自己工作内存中. 完解！

- 禁止指令重排原理
  - 重排序: 指令重排序是为了在执行程序时提高性能, 编译器与处理器常常会对指令做重排序. 
  - 编译器生成字节码文件时, 会在读写操作指令前后插入内存屏障, 指令排序时不能把后面的指令重排到前面
  - 内存屏障: 一组处理器指令
  - X86处理器只会对写-读操作重排序, 因此JMM仅需在volatile写后面插入一个StoreLoad屏障

**原子性**: 一个操作或者多个操作要么全部执行并且执行的过程不会被任何因素打断, 要么就不执行.   
**线程安全问题**: 
**线程安全条件**: 
	1.运算结果并不依赖变量的当前值, 或者能够确保只有单一的线程修改变量. 
	2.变量不需要与其他状态变量共同参与不变约束. 
**volatile的典型用法**: 检查某个状态标记, 以作为条件判断(比如是否退出循环)
使用场景: 

# 16. final

# 17. CAS, 乐观锁与悲观锁

内存值, 旧的预期值, 要修改的值
每次比较内存中值与预期值是否相同, 不同就自旋, 相同就修改
unsafe(里面全是native修饰的本地方法, 可以直接调用操作系统)+ lock cmpxchg(硬件**缓存锁**或者**总线锁**)
一种乐观锁实现机制
**缺点**: 
	**ABA(version解决)**——当一个值从A被更新为B, 然后又改回来, 普通CAS机制发现不了.
	**一直while浪费资源**: 若并发量高, 许多线程反复尝试更新变量又更新不成功, 循环往复, 会给CPU带来高消耗
	**不能保证代码块原子性**: 只能保证一个变量的原子操作, 代码块要用sychronized
**场景**: 读多写少. 对于资源竞争严重的情况, CAS自旋的概率会比较大, 从而浪费更多的CPU资源, 效率低于synchronized

- **乐观锁**
  - CAS或则version版本机制
  - 操作数据不加锁, 最后更新数据时检查数据有没有被修改, 没有的话才更新
- **悲观锁**: 加锁实现

# 18. AQS(Abtract Queued Synchronizer )？

![img](https://s2.loli.net/2022/03/28/6vglH27hKktS4az.png)

AQS核心思想: 
如果资源空闲 => 当前请求线程抢到资源 => 并且资源被占用.
如果资源占用 => 将阻塞**==等待线程的等待状态等信息==**包装成一个node节点加入CLH队列(双向链表).
当大哥释放锁时 => 会唤醒二哥去拿锁.

- 我所理解的AQS的核心结构:
  一个表示同步状态的 int state变量 + cas机制设置state状态 + FIFO等待队列(双向链表). 

- 具体来说: 
  AQS的锁类型分为两套api: 独占锁, 共享锁. 

  

- **==运用AQS==的实例** : 
  ReentrantLock非公平锁的加锁流程: (==state 0 => 🚾没人==, ==state 1 => 正在喔💩==, ==state>1 => 🚾外面在排队==...)

  1. 尝试着使用CAS操作将锁的状态state由0修改为1, 修改成功则线程获得锁. 
  2. 不成功就会再次尝试去抢锁, 以及判断这个线程是否是当前持有锁的线程(如果是只需要将state+1, 代表锁重入). 
  3. 抢锁没成功, 也不是持有锁的线程, 那么就会添加到等待队列然后调用LockSupport.park()方法进行阻塞等待, 然后被唤醒. 

  模板方法设计模式: 使用者继承AbstractQueuedSynchronizer并重写指定的方法

# 19. ConcurrentHashMap(不允许key, value为null)

JDK1.7 => Segment数组 + HashEntry数组 + 链表

```java
// 一个Segment中包含一个HashEntry数组, 每个HashEntry又是一个链表结构
static final class Segment<K,V> extens ReentrantLock implements Serializable {
transient volatile HashEntry<K,V>[] tables;
// ......
}
static final class HashEntry<K,V> {
  final int hash;
  final K key;
  volatile V value;
  volatile HashEntry<K,V> next;
}
```



参考: http://www.jasongj.com/java/concurrenthashmap/

### 1.7 ConcurrentHashMap

- 锁机制: Segmen继承了ReentrantLock, 分段锁, 每次只锁定操作的segment, segment数组默认16(并发度16)
  ●get: 二次hash, 第一次Hash定位到Segment, 第二次Hash定位到元素所在的链表的头部, get方法无需加锁, volatile保证
  ●put
  会二次hash定位到插入位置
  第一次根据key的hash值定位到segment位置, 若segment数组还未初始化, cas将其赋值
  第二次hash定位到HashEntry位置
  然后插入元素时, 会尝试获取锁, 成功插入链表尾端, 失败自旋再次获取锁, 超过指定次数就挂起等待唤醒
  ●链表遍历时间复杂度O(n)

![image-20220328015912055](https://s2.loli.net/2022/03/28/tBqgW5IK1EUxrcj.png)

### 1.8 ConcurrentHashMap

- **数据结构: Node数组+链表+红黑树**
- 锁机制
  - 抛弃Segment分段锁, 采用CAS+synchronized, 锁粒度更细
  - 只锁住链表头节点(红黑树根结点), 不影响其他哈希桶数组元素的读写, 提高并发度
- **put**
  1. 根据key计算出hash值
  2. 判断是否需要初始化
  3. 定位到对应槽位, 拿到首结点f, 判断首结点f
     3.1. 若f==null,则通过CAS的方式尝试添加
     3.2. 若f.hash=MOVED=-1, 说明其他线程在扩容, 参与一起扩容
     3.3. 若都不满足, synchronized锁住f结点, 判断是链表还是红黑树插入结点
  4. 当链表长度>=8, 进行数组扩容或则链表树化
     红黑树遍历O(logN)
- **为何不支持null value**
  vaule为null, 有两种情况, 可能是存的值为null或则没有映射到值返回null, hashmap用于单线程下可以通过containskey()区分这两种情况, 但是ConcurrentHashMap用于多线程场景, 本来是没有映射containskey返回fasle, 但是可能在你调用containskey检查时新线程插入null值, 返回ture, 存在二义性
- **ConcurrentHashMap迭代器弱一致性**
  迭代器创建后, 遍历每个元素, 若遍历过程钟内部元素变化, 变化发生在遍历过的部分迭代器不会反映出来, 没遍历过的部分反映出来
- **多线程先安全操作Map**
  Collection.synchronizedMap(对方法加同步锁, 本质也是全表锁)

![image-20220328015937125](https://s2.loli.net/2022/03/28/AejMaK8roIYgdEy.png)

# 20. ThreadLocal

- **本地线程副本变量工具类**
- **工作原理**
  ThreadLocal主要依靠Thread类的ThreadLocalMap, 最终存放时以ThreadLocal为key, 要存放的值为value存入ThreadLoalMap, ThreadLocal相当于是一层封装
- **内存泄漏**
  无用对象得不到回收
  ThreadLocalMap的Entry是继承WeakReference, 是弱引用, 意味着ThreadLocalMap的key是指向ThreadLocal类变量的弱引用, value是强引用. 若ThreadLocal没有被外部强引用, 垃圾回收时key被清理, value不会, 这样⼀来,  ThreadLocalMap 中就会出现 key 为 null 的 Entry. 假如我们不做任何措施的话, value 永远⽆法被 GC 回收, 这个时候就可能会产⽣内存泄露. 手动调用remove()方法. 
- **场景**
  - JDBC连接Connection+session+登陆用户保存
  - 使用ThreadLocal获取用户request的信息, 保存到线程可以用来做匹配处理.

# 21. CopyOnWriteArrayList(读多写少)

- 实现了List接口
- 内部持有ReentrantLock对象, 底层使用volatile transient声明的数组
- 读写分离, 写时复制, 先用ReetrantLock对象加锁, 然后会复制一份原数组进行写操作, 写完了再将新数组值赋予原数组. 
- **==适合读多写少场景==**. 

# 22. ReentrantReadWriteLock

ReentrantReadWriteLock会使用两把锁来解决问题, 一个读锁, 一个写锁 线程进入读锁的前提条件:     没有其他线程的写锁,     没有写请求或者有写请求, 但调用线程和持有锁的线程是同一个
线程进入写锁的前提条件:     没有其他线程的读锁    没有其他线程的写锁

# 23. 线程池

- **线程池好处**: 降低资源消耗, 提高响应速度, 方便统一管理. 
- **七大核心参数**: 核心线程数, 最大线程数, keepAlive Time(工作线程空闲后, 存活时间), TimeUnit, workQueue, ThreadFactory, 拒绝策略
- **线程池工作原理**: 向线程池添加一个任务, 首先看线程池中线程数是否小于核心线程数, 若小于则创建一个线程执行任务, 反之再判断任务队列满没, 若没有满则将任务放到任务队列并等待执行, 若满了再判断现在线程池中线程数是否大于最大线程数, 若没有大于则创建一个线程执行任务, 若大于则使用饱和策略进行处理任务. 
- **任务队列**: ArrayBlockingQueue, LinkedBlockingQueue, PriorityBlockingQueue, SynchronousQueue(存一个取一个, 阻塞等待), DelayedWorkQueue
- **拒绝策略**: 
  1.CallerRunsPolicy 由调用线程处理该任务. 
  2.AbortPolicy 默认拒绝策略 直接丢弃, 抛出异常RejectedExecutionException
  3.DiscardPolicy 直接丢弃, 不抛出异常
  4.DiscardOldestPolicy 丢弃队列最早的任务, 然后重新尝试执行任务. 
- **Executors的4种功能线程池**: 定长, 定时, 可缓存, 单线程化
- **线程池5大状态**: Running(可接收, 可处理), Shutdown(不接收, 可处理), Stop(不接收, 不处理, 中断正在执行), Tidying(所有任务终止), Terminated(线程池彻底终止). 
- **创建线程池**: 
  《阿⾥巴巴 Java 开发⼿册》中强制线程池不允许使⽤ Executors 去创建, ⽽是通过ThreadPoolExecutor 的⽅式, 避免使用Executors创建线程池, 主要是避免使用其中的默认实现(比如定长缓存池使用链表任务队列, 默认长度为Integer.MAX_VALUE, 可能堆积大量请求, 导致OOM)那么我们可以自己直接调用ThreadPoolExecutor的构造函数自己创建线程池. 在创建的同时, 给BlockQueue指定容量就可以了. 规避资源耗尽的⻛险
  - **Executors 返回线程池对象的弊端如下**: 
    - newFixedThreadPool 和 newSingleThreadExecutor :  允许请求的队列⻓度为Integer.MAX_VALUE , 可能堆积⼤量的请求, 从⽽导致 OOM. 
    - newCachedThreadPool和 newScheduledThreadPool :  允许创建的线程数量为Integer.MAX_VALUE , 可能会创建⼤量线程, 从⽽导致 OOM. 注意二者产生OOM的原因不一样
  - **通过 Executor 框架的⼯具类 Executors 来实现**
    - 定长线程池(newFixedThreadPool)
      特点: 只有核心线程(corePoolSize=maximumPoolSize), 线程数量固定, 执行完立即回收, 任务队列为
    - 表结构的无界队列(Integer.MAX_VALUE). 
      应用场景: 控制线程最大并发数. 
    - 单线程化线程池(newSingleThreadExecutor)
      特点: 只有1个核心线程, 最大线程数为1, 无非核心线程, (corePoolSize=maximumPoolSize=1)执行完立即回收, 任务队列为链表结构的无界队列(Integer.MAX_VALUE). 
      应用场景: 不适合并发但可能引起IO阻塞性及影响UI线程响应的操作, 如数据库操作, 文件操作等. 
    - 定时线程池(newScheduledThreadPool )
      特点: 核心线程数量固定, 非核心线程数量无限, 执行完闲置10ms后回收, 任务队列为延时阻塞队列. (corePoolSize为传进来参数, 最大线程数=Integer.MAX_VALUE, 使用DelayedWorkQueue())
      应用场景: 执行定时或周期性的任务. 
    - 可缓存线程池(newCachedThreadPool)
      特点: 无核心线程, 非核心线程数量无限, 执行完闲置60s后回收, 任务队列为不存储元素的阻塞队列(SynchronousQueue). (corePoolSize=0, maximumPoolSize=Integer.MAX_VALUE, keepAlive Time=60L)
      应用场景: 执行大量, 耗时少的任务. 
  - **通过ThreadPoolExecutor 构造方法**

# 24. 线程池参数设置原则

==首先根据不同任务类型划分, 然后再根据具体情况压测调试==.

**CPU密集型**: corePoolSize = CPU核数 + 1 => 然后再具体调试压测
**IO密集型**:     corePoolSize = CPU核数 * 2 => 然后再具体调试压测

# 25. JUC包下有哪些类

- **atomic包**
  运用了CAS的AtomicBoolean, AtomicInteger, AtomicReference等原子变量类(CAS)
- **locks包**
  的AbstractQueuedSynchronizer(AQS)以及使用AQS的
  ReentantLock(可重入锁)
  ReentrantReadWriteLock: 分读写锁, 多个读锁不互斥, 读锁与写锁互斥. (共享锁, 排他锁)
- **运用了AQS的类还有**: Semaphore, CountDownLatch, ReentantLock(显式锁), ReentrantReadWriteLock
- **同步工具类**: CountDownLatch(闭锁), Semaphore(信号量), CyclicBarrier(栅栏), FutureTask
- **并发容器类**: ConcurrentHashMap, CopyOnWriteArrayList
- **Executor框架的相关类**:  线程池的工厂类->Executors  线程池的实现类->ThreadPoolExecutor/ForkJoinPool
- **阻塞队列实现类**: ArrayBlockingQueue, LinkedBlockingQueue, PriorityBlockingQueue

手搓阻塞队列?

# 26. JUC同步工具类

**CyclicBarrier**一般用于一组线程互相等待至某个状态, 然后这一组线程再同时执行; CountDownLatch强调一个线程(或者多个),  等待另外N个线程完成某个事情之后才能执行. 

使用场景: 
**CyclicBarrier**可以用于多线程计算数据, 最后合并计算结果的应用场景. 
LOL每个玩家互相等待等到100%才进入游戏页面
**countdownlatch**: 班长教师所有人走了才去关灯关门走人. 阿姨等所有人吃完饭才去收拾桌子. 

![image-20220328022942901](https://s2.loli.net/2022/03/28/cBd2MoAphv571qL.png)