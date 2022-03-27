# 1, 谈谈面向对象的理解

​	面向对象是一种编程思想, 早期的面向过程的思想就是一件事该怎么做, 而面向对象就是一件事该由谁来做, 它怎么做的我不管, 我只需要调用就行. 
​	而这些是由面向对象的三大特性来实现的, 三大特性就是==封装, 继承, 多态==. 
​	封装就是将一类属性和行为抽象成一个类, 使其属性私有化, 行为公开化, 提高属性的安全性的同时, 也可以使代码模块化, 这样做使代码的复用性更高. 
​	继承就是将几个类共有的属性和行为抽象成一个父类, 每个子类都有父类的属性和行为, 也有自己的属性和行为, 这样做, 扩展了已存在的代码, 进一步提高的代码的复用性, 但是继承是耦合度很高的一种关系, 父类代码修改, 子类行为也会改变, 如果过度使用继承会起到反效果. 
​	多态必须要有继承和重写, 并且父类/接口引用指向子类/实现类对象, 很多的设计模式都是基于面向对象中多态性设计的. 

面向过程 => 一件事该怎么做, **注重实现过程**, 以过程为中心
面向对象 => 实现**对象是谁**, 只关心**怎样使用**, **不关心具体实现**(有封装继承多态三大特性)
封装 => 不用关注内部具体构造, 只需会用就行(例如手机电脑汽车 => 会用就行)
继承 => 不同类公用方法和属性抽离到父类 => 代码更易扩展 => ==复用代码, 减少冗余, 易于扩展.==
多态 => **==使用统一的逻辑实现代码处理不同的对象, 从而执行不同的行为. 多态就是父类的引用指向子类的对象, 消除类型之间的耦合关系==**(做什么和怎么做分开了)
多态还有 3 个必要条件: 继承, 重写, 向上转型. 

```java
// 例如 咱不知道他传什么类型的对象过来 我就new一个他们的父类 然后可以分别调用他们各自的实现
// for test
public class Tests {
    public static void main(String[] args) {
        Figure figure; // 声明Figure类的变量
        figure = new Rectangle(9, 9);
        System.out.println(figure.area());
        System.out.println("===============================");
        figure = new Triangle(6, 8);
        System.out.println(figure.area());
        System.out.println("===============================");
        figure = new Figure(10, 10);
        System.out.println(figure.area());
    }
}

public class Figure {
    double dim1;
    double dim2;
    Figure(double d1, double d2) {
        // 有参的构造方法
        this.dim1 = d1;
        this.dim2 = d2;
    }
    double area() {
        // 用于计算对象的面积
        System.out.println("父类中计算对象面积的方法, 没有实际意义, 需要在子类中重写. ");
        return 0;
    }
}
class Rectangle extends Figure {
    Rectangle(double d1, double d2) {
        super(d1, d2);
    }
    double area() {
        System.out.println("长方形的面积: ");
        return super.dim1 * super.dim2;
    }
}
class Triangle extends Figure {
    Triangle(double d1, double d2) {
        super(d1, d2);
    }
    double area() {
        System.out.println("三角形的面积: ");
        return super.dim1 * super.dim2 / 2;
    }
}
```

# 2, 面向对象与面向过程区别

面向过程(性能, 单片机) => 性能比面向对象高, 追求性能或者简单单片机 => 用面向过程

面向对象(低耦合系统) => 因为==封装, 继承, 多态== => ==易维护, 复用, 扩展==.可以设计出低耦合的大型系统!

# 3, JDK与JRE区别

JDK=JRE+开发工具集(java javac javadoc jar....)

JRE=JVM+核心类库

# 4, 值传递与引用传递

# 5, ==与equals()区别

基本数据类型 => 比较值
引用数据类型 => 比较内存地址

equals() 属于 Object 类方法, 没重写和==一样, 重写后一般比较值.

# 6, 为什么重写 equals 时必须重写 hashCode⽅法

为什么? => 例如在set中, 如何保证插入元素不重复? => 用hashcode散列
我就看待插入元素的映射出的位置
	是否已经有值了, 如果没值 => 没重复 => 放心插入
	如果有值呢? => 再使用equals判断是否相等 => 再判断是否插入.

```java
// 例如 如果不重写hashCode就会用对象的内存地址算hash值

// 但是对于Student类! => 判断是否相等 我们看的是name和age => 所以也应该用name,age算hash值
public class Student {
	private String name;
	private int age;
	
	public Student(String name, int age) {
		super();
		this.name = name;
		this.age = age;
	}
	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + age;
		result = prime * result + ((name == null) ? 0 : name.hashCode());
		return result;
	}
	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		Student other = (Student) obj;
		if (age != other.age)
			return false;
		if (name == null) {
			if (other.name != null)
				return false;
		} else if (!name.equals(other.name))
			return false;
		return true;
	}
	// 省略 get, set方法...
}
```

# 7, 深拷贝与浅拷贝

深拷贝 => 全部数据拷贝一份
浅拷贝 => 拷贝引用

# 8, Student s = new Student();在内存中做了哪些事情

- 载入Student.class文件进内存(方法区)
- 在栈内存为s开辟空间 => 
- 对象引用(Java栈本地变量表) => 对象实例数据,对象头,填充(堆) => 对象数据类型(方法区)
- 对学生对象的成员变量进行默认初始化 => preparation
- 对学生对象的成员变量进行显示初始化
- 通过构造方法对学生对象的成员变量赋值 < clinit >()
- 学生对象初始化完成, 把对象地址赋值给s变量

# 9, 重载和重写的区别(实现多态)

重载 => 同一个类 => 参数列表不同, **==与返回值和访问修饰符无关==**
重写 => 父子类中 => 参数必须相同, ==**返回值小于父类, 异常小于父类, 访问修饰符大于父类**==(两小一大)

# 10, 多态理解(见1)

# 11, String为何不可变不可变好处

**String 类中使⽤ final 关键字修饰字符数组来保存字符串**, jdk9后, 使用byte数组. 

**好处?**
缓存hash值(使得hash值不变, 只进行一次计算)
String pool需要
线程安全
参数安全性(网络连接, 参数变了, 以为连接主机变了)

**改变字符串地址的操作**

![image-20220327013413711](https://s2.loli.net/2022/03/27/LK8ba6jPJws7BEx.png)

字符串+=  => 新建一个条目, 把原来的str指向新条目(in constant pool)
==str3.concat("456");== 和 ==str5.replace("A", "B")==; => (返回一个新字符串, 原来的str不变)

**为什么StringBuilder和StringBuffer是可变的?**
StringBuilder 与 StringBuffer 都继承⾃ AbstractStringBuilder 类, 
在 AbstractStringBuilder 中也是**==使⽤字符数组保存==**字符串char[] value 但是**==没有⽤ final==** 关键字修饰, 所以这两种对象都是可变的. 

真的不可变? **==可用反射==**使其变化! => getDeclaredField("value"); valueField.setAccessible(true); 

```java
Field valueField = String.class.getDeclaredField("value");
// 改变value属性的访问权限
valueField.setAccessible(true);
// 获取str对象上value属性的值
char[] value = (char[]) valueField.get(str);
// 改变value所引用的数组中的字符
value[3] = '?';
```

参考: http://t.csdn.cn/Ye63T

# 12, String有几种编码格式? 

# 13, String, StringBuffer和StringBuilder之间的区别是什么? 

**==可变性==**: String是不可变对象(因为不可变有一些好处), 任何对String修改都会创建新的String对象, StringBuffer和StringBuilder可变类. 
**==效率==**: 频繁对字符进行操作时, 使用String会生成一些临时对象, 多一些附加操作, 效率低些. 
**==安全性==**: Stringbuffer方法由synchronized修饰, 线程安全. 

# 14, 关于String的理解

```java
String str1 = new String("123");//再常量池创一个“123”对象, 遇到new在堆内存创建一个对象, 并返回堆中的对象引用
String str2 = "123";//因为之前常量池中能找到“123”的对象, 所以直接将引用返回, 不创建新的
String str3 = str1.intern();//若常量池中包含了str1字符串“123”,则直接返回引用, 否则就在池中先创建一个在返回池中的对象引用
System.out.println((str1 == str2) +","+ (str3 == str2))
//输出 false,true
String str4 = new String("234");
String str5 = new String("234");
String str6 = str4.intern();
String str7 = str5.intern();
System.out.println((str4 == str5) +","+ (str6 == str7));
//输出false ture
```



# 15, 8种基本数据类型(重点背)

|  类型   |                 大小                 |             范围             |
| :-----: | :----------------------------------: | :--------------------------: |
|  byte   |             1byte, 8bit              |          -128 ~ 127          |
|  short  |                2byte                 |        -2^15 ~ 2^15-1        |
|   int   |             4byte, 32bit             | -2^32 ~ 2^32-1, -31亿 ~ 31亿 |
|  float  |                4byte                 |              -               |
| double  |                8byte                 |              -               |
|  long   |             8byte, 64bit             |        -2^64 ~ 2^64-1        |
|  char   |                2byte                 |              -               |
| boolean | 编译为int类型4byte, boolean[]中1byte |              -               |

```java
// 数据长度短的转换为长的并不会造成数据丢失, 所以默认可以自动转换
float a = 2.0f; // 标准
float f = 2; // JVM自动转换为float

double b = 2.0; // 标准
double e = 2; // JVM自动转换为double

long g = 2L; // 标准
long d = 2; // JVM自动转换为long
```

# 16, float 与 double/short与int

```java
float f = 1.1；错    
float f=1.1f；对
short s=1; s+=1;
s=s+1;错  s++; (隐式类型转换 相当于 s = (short) (s + 1);)
```

# 17, Java集合机制与使用场景

```java
Collection
    List // 必须保持元素特定的顺序
    	ArrayList, Vector, LinkedList
    Set // 不能有重复元素(无序, 不可重复, 查询效率低)
    	HashSet // 为快速查找设计
    		LinkedHashSet
    	SortSet
    		TreeSet
    Queue
    	PriorityQueue // 模拟堆, 按照元素顺序排序
    	Deque
    

Map
	HashMap
	HashSet
	SortedMap
        TreeMap // 基于红黑树排序 O(logn)

```



# 18, set与list区别? 

1. List,Set都是继承自Collection接口
2. List特点: 元素有放入顺序, 元素可重复 , Set特点: 元素无放入顺序, 元素不可重复, 重复元素会覆盖掉, (元素虽然无放入顺序, 但是元素在set中的位置是有该元素的HashCode决定的, 其位置其实是固定的, 加入Set 的Object必须定义equals()方法 , 另外list支持for循环, 也就是通过下标来遍历, 也可以用迭代器, 但是set只能用迭代, 因为他无序, 无法用下标来取得想要的值. ) 
3. Set和List对比:  
   Set: 检索元素效率低下, 删除和插入效率高, 插入和删除不会引起元素位置改变.  
   List: 和数组类似, List可以动态增长, 查找元素效率高, 插入删除元素效率低, 因为会引起其他元素位置改变.  

# 19, ArrayList扩容机制

- 添加元素时使用 ==**ensureCapacityInternal()**== 方法来保证容量足够, 如果不够时, 需要使用 **==grow()==** 方法进行扩容
- 新容量的大小为 **==oldCapacity + (oldCapacity >> 1)==**, 即 oldCapacity+oldCapacity/2. 其中 oldCapacity >> 1 需要取整, 所以新容量大约是旧容量的 **==1.5 倍左右==**. (oldCapacity 为偶数就是 1.5 倍, 为奇数就是 1.5 倍-0.5)
- 扩容操作需要调用 **==Arrays.copyOf()==** 把原数组整个复制到新数组中, 这个操作代价很高, 因此**==最好在创建==** ArrayList 对象时就指定大概的容量大小, 减少扩容操作的次数. 
- **==modCount==**记录结构修改次数

# 20, ArrayList 与 Vector 区别呢?为什么要⽤Arraylist取代Vector呢

- **实现**: 都实现List接口, 底层采用**==Object[] elementData==**数组, 
- **线程安全**: **==Vector 使用了 Synchronized==** 来实现线程同步, 是线程安全的, 而 **==ArrayList 是非线程安全==**的. 
- **性能**: ArrayList 在性能方面要优于 Vector. 
- **扩容**: ArrayList 和 Vector 都会根据实际的需要动态的调整容量, 只不过在 **Vector 扩容每次变2倍**, 而 ArrayList 变1.5倍
- **长度**: ArrayList**==默认初始长度10==**

# 21, ArrayList和LinkedList的区别

- **ArrayList与LinkedList都实现List接口**：arrayList实现了 **RandomAccess接口**, 代表支持随机访问
- **线程安全问题**：ArrayList与LinkedList都是不是线程安全. 
- **底层数据结构**：
  - ArrayList底层使用==数组==, 默认初始大小为==10==; 扩容时==1.5倍==; 
  - LinkedList底层采用==双向链表==数据结构（注意：**==JDK1.6之前为循环链表, JDK1.7取消了循环==**）. 
- **插入删除**：
  - ArrayList：若增加至末尾, O(1)；若在指定位置i插入O(n-i). 
  - LinkedList：插入删除都是==近似O(1)==, 而数组为近似 O（n）
- **查询**：数组支持随机快速访问, 而链表需要依次遍历, 更耗时. 
- **占用内存空间大小**：
  - 一般LinkedList占空间更大, 双向列表每个结点要维护两个指针. 
  - 但是若ArrayList刚到扩容阈值, 扩容后会浪费很多空间. 
- **数据查找原理**：
  - 数组空间连续, 查询通过偏移量找, 
  - LinkList底层链表, 逻辑连续, 空间不连续, 指针访问

# 22, HashMap

## 22, HashMap 和 Hashtable 的区别

- **线程安全**：Hashtable方法sychonized修饰, 线程安全
- **效率方面**：由于**==Hashtable方法被sychonized==**修饰, 效率比HashMap低
- **底层数据结构**：HashMap jdk8当链表长度>=8并且数组长度>=64链表会转红黑树, Hashtable没有这样机制
- **初始容量与扩容**：
  - 默认初始量：Hashtable为11, HashMap为16；若指定初始量：
  - Hashtable用指定的值, HashMap会扩充为 2 的幂次⽅⼤⼩. 扩容：Hashtable容量变为原来2n+1倍, HashMap变为2倍. 
- 对Null key与Null value支持：HashMap支持一个Null key多个Null value, Hashtable不支持Null key, 否则报错空指针异常

## 23, HashSet怎样检查重复

1. 先计算hashCode定位, 如果位置没值 => 直接插入
2. 否则用equlas()判断

## 24, HashMap与HashSet区别

- HashMap使用**键(Key)计算hashcode**
- HashSet使用成员**对象来计算hashcode**

## 25, HashMap jdk8与jdk7区别

- 数据结构组织形式: JDK8新增了红黑树, JDK8是通过数组+链表+红黑树来实现的
- 头插法尾插法: 
  - JDK7单链表纵向延伸, 头插法 => 逆序, 死循环
  - JDK8尾插法, 红黑树避免了逆序和死循环.
- 查询效率: JDK8红黑树查询接近O(1)
- 扩容: JDK7 => 先扩容后添加, JDK8 => 先添加后扩容 =>只会判断是否当前元素个数是否超过了阈值

## 26, HashMap 的⻓度为什么是2的幂次⽅(因为是2倍扩容)

h & (length - 1) 等价于 对length取模 => 计算更快
并且减少hash冲突: 2^n - 1 也就是n个1, **==按位与做到每一位都与到了, 分布更均匀==**.

## 27, 为什么要把key的哈希码右移16位呢

```java
static final int hash(Object key) { // 扰动函数
    int h; // 为了接收hashcode值 方便后面位移运算 不用重复再调用hashCode
    return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
}
```

因为h的int类型正好32位, 为了使计算出的hash值更加的分散, 所以选择先将h无符号右移16位, 然后再与h异或时, 就能达到h的高16位和低16位都能参与计算, 尽最大努力减少哈希冲突

## 28, HashMap如何确定元素放在哪个位置呢

```java
经过扰动函数计算得到hash值  => 减少hash碰撞
n = (tab = resize()).length; // 也就是tab的length
通过 i = (n - 1) & hash 判断当前元素存放的位置 
// hash对length-1 与运算 => 等价于取模 => 分布到各个tab上
```

## 29, hashmap的put方法流程

HashMap 通过 key 的 **hashCode** 经过扰动函数处理过后得到 **hash** 值, 然后通过 **(n - 1) & hash** 得到当前元素存放的位置（n = tab.length）, 如果当前位置存在元素的话, 就判断该元素与要存⼊的元素的 hash 值以及 key 是否相同, 如果相同的话, 直接覆盖, 不相同就通过拉链法解决冲突. 

- 执行put方法会执行putval方法, 执行putval前先计算hash值
- 经过扰动函数使其hash值更散列（调用key对象的hashcode方法计算出来hash值, 将 Hash 值的高 16 位右移并与原 Hash 值取异或运算（^）, 混合高 16 位和低 16 位的值, 得到一个更加散列的低 16 位的 Hash 值）
- 然后进入putval方法, 会判断是否第一次调用put, 若是第一次才初始化数组长度16, 
- 然后会判断数组该位置是否为空, 若空创建结点插入, 不为空若插入元素与桶中元素key一样, 后面会替换. 若不为空且插入元素与桶中元素key不一样, 则向后添加元素. 
  - jdk7,头插法
  - jdk8尾插法, 遍历链表, 若有相同的node,替换. 否则尾插, 然后再判断是否树化（链表长度>=8 进入treeifyBin(tab, hash);进入该方法还需要判断当前数组长度>=64才能树化,如果<64则扩容）
- ++modCount
- size++

## 30, HashMap并发线程安全问题? 

- 在JDK1.7中, 当**==并发执行扩容操作会造成环形链==**, 然后调用**==get方法会死循环==**
- JDK1.8中, **==并发执行put操作时会发生数据覆盖==**的操作
- 解决办法
  - Collections.synchronizedMap(hashMap)返回一个新的Map, 这个新的map就是线程安全的.
    - 直接使用了锁住方法, 基本上是锁住了非常多的代码块.例如第一个线程抢到锁, 其他线程直接阻塞, "他就宁可错杀一万, 绝不放过一个" 把其他线程阻塞住了.
  - java.util.concurrent.ConcurrentHashMap
    - 分段锁住, 减少了并发时的冲突(非公平锁 NonfairSync), 就算操作了同一个段, CAS保证安全.

## 31, hashmap扩容流程? 

JDK1.7扩容时多线程操作 => 链表成环 => 调用get死循环
JDK1.8因为是尾插法所以没有这个问题

- 触发时机: 
  - 未初始化, 第一次put的时候
  - 大于扩容阈值
- 流程:
  - 新建2倍大小的数组, 根据新数组长度对其值rehash, 寻址. 
  - 具体会将原来数组链表拆为**高低位链表**, 低位链表存放扩容后数组下标没变的结点, 高位链表存放变了的, 然后将**==高低位链表插入新数组==**

# 32, TreeMap (基于红黑树)

- 操作的时间复杂度都是O(logn);
- 默认按键的升序排序, 具体顺序可有指定的comparator决定. 
- TreeMap键、值都不能为null；
- hashtable也不能为null

# 33, 反射原理

- 什么是反射：动态的获取类的各个属性以及调用它的方法

- 原理：通过将类对应的字节码文件加载到jvm内存中得到一个Class对象, 通过这个Class对象可以反向获取实例的各个属性以及调用它的方法. 

- 获取Class对象的三种方式：

  - 1. Object ——> getClass();（对象.getClass()）
  - 2. 任何数据类型（包括基本数据类型）都有一个“静态”的class属性 (类.class)
  - 3. Class.forName("");

- 使用场景：

  - 1. 通过反射运行配置文件内容

       - 加载配置文件, 并解析配置文件得到相应信息

       - 根据解析的字符串利用反射机制获取某个类的Class实例

       - 动态配置属性

  - 2. JDK**==动态代理==** => 直接从内存拿出来 => 动态生成一个类

  - 3. jdbc通过Class.forName()**==加载数据的驱动程序==**

  - 4. Spring**==解析xml装配Bean==**

# 34, object的方法有哪些? notify和notifyAll的区别? 

1. getClass--final方法, 获得运行时类型. 

2. toString——对象的字符串表示形式（对象所属类的名称+@+转换为十六进制的对象的哈希值组成的字符串 ）

3. equas方法——如果没有重写用的就是Object里的方法, 和== 一样都是比较两个引用地址是否相等, 或则基本数据类型值是否相等

4. Clone方法——保护方法, 实现对象的浅克隆, 只有实现了Cloneable接口才可以调用该方法, 否则抛出CloneNotSupportedException异常. 

5. notify方法——唤醒在该对象上等待的某个线程

6. notifyAll方法——唤醒在该对象上等待的所有线程

7. Wait方法——wait()的作用是让==当前线程进入等待状态==, 释放锁, 直到 调notify() 方法或 notifyAll() 方法,  还有一个wait(long timeout)超时时间  --- (补充: sleep不会释放锁)

8. Finalize()方法——可以用于对象的自我拯救 => 不被回收.

9. Hashcode方法——该方法用于哈希查找, 可以减少在查找中使用equals的次数, 重写了equals方法一般都要重写hashCode方法. 这个方法在一些具有哈希功能的Collection中用到. 
   一般必须满足obj1.equals(obj2) == true. 可以推出obj1.hash- Code() == obj2.hashCode(), 但是hashCode相等不一定就满足equals. 不过为了提高效率, 应该尽量使上面两个条件接近等价

# 35, Java中接口和抽象类的区别?

- 方法：接口只有定义, 不能有方法的实现, java 1.8中可以定义default与static方法体, 而抽象类可以有定义与实现, 方法可在抽象类中实现. 
- 成员变量：接口成员变量只能是public static final的, 且必须初始化, 抽象类可以和普通类一样任意类型. 
- 继承实现：一个类只能继承一个抽象类(extends), 可以实现多个接口（implements)
- **==都不能实例化==**
- 接口不能有构造函数, 抽象类可以有(抽象类可以指定子类的构造雏形)

# 36, 既然有了字节流,为什么还要有字符流

- Java 虚拟机转字节得到字符流, 耗时；
- 不知道编码类型还很容易出现乱码. 所以干脆提供字符流. 

# 37, throw与throws区别

- throw => ==方法内部==, 只能用于抛出一种异常；
- throws => ==方法声明==上, 可以抛出多个异常, 用来标识该方法可能抛出的异常列表

# 38, 红黑树特性? 时间复杂度? 

- 二叉查找树（二叉排序, 二叉搜索树）, 相当于二分查找, 但是可能出现线性化, 相当于o(n), 

- 红黑树, 它是自平衡的二叉搜索树, 有红黑两种结点, 根节点红色, 叶子节点是为空的黑色结点, 红黑交替, 从任意结点出发到达它可达的叶子结点路径所包含的黑色结点一样, 增删查时间复杂度O(logn).通过变色与旋转维持平衡. 

- 左旋：逆时针旋转, 让父节点右孩子当父亲；右旋：顺时针旋转, 让父节点左孩子当父亲. 

- **左旋**: 右孩子Y向上旋, X自己向下走, 自己变成Y的左孩子, Y原来的左孩子成为自己的孩子

  ![image-20220303162254844](https://s2.loli.net/2022/03/27/5mGa4jOreABIuCp.png)

  **右旋**: 左孩子Y向上旋, X自己向下走, 自己变成Y的右孩子, Y原来的右孩子成为自己的左孩子

  ![image-20220303163035639](https://s2.loli.net/2022/03/27/Wvrb8OBnCHVoL7N.png)

# 39, JDK与cjlib动态代理

- 动态代理好处：
  一个工程如果依赖另一个工程给的接口, 但是另一个工程的接口不稳定, 经常变更协议, 就可以使用一个代理, 接口变更时, 只需要修改代理, 不需要一一修改业务代码
- 作用：
  - 功能增强：再原有功能加新功能
  - 控制访问：代理类不让你访问目标
- JDK动态代理：利用反射机制生成代理类, 可以动态指定代理类的目标类, 要求实现invovationHandler接口, 重写invoke方法进行功能增强, 还要求目标类必须实现接口. 
- Cjlib动态代理：利用ASM开源包, 把代理对象的CLass文件加载进来, 修改其字节码文件生成子类, 子类重写目标类的方法, 被final修饰不可以, 然后在子类采用方法拦截技术拦截父类方法调用, 织入逻辑（定义拦截器实现MethodInterceptor接口）

# 40, 异常体系

Throwable的子类为Error和Exception
Exception的子类为RuntimeException异常和RuntimeException以外的异常（例如IOException）. 
主要分为Error, RuntimeException异常和RuntimeException以外的异常. (错误、运行时异常和编译时异常)
Error就是一些程序处理不了的错误, 代表JVM出现了一些错误, 应用程序无法处理. 例如当 JVM 不再有继续执行操作所需的内存资源时, 将出现 OutOfMemoryError. 
常见异常：NullPointerException、ClassNotFoundException、arrayindexoutofboundsexception、ClassCastException（类型强制转换）

# 41, 包装类型(有缓存)和基本类型

最主要的区别是包装类型是对象, 拥有字段和方法, 可以很方便地调用一些基本的方法, 初始值是null, 而且可以使用null代表空值, 而基本数据类型只能使用0来代表初始值. 
其次是基本数据类型是直接存储在栈中, 而包装类型是一个对象, 对象的引用变量是存储在栈中, 存储了对象在堆中的地址, 对象的数据是存在堆中. 

# 42, BIO,NIO,AIO 有什么区别

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

**AIO暂时Linux没实现**

# 43, 谈谈常量池的理解

- class文件常量池
- 方法区运行时常量池（Class 文件中的常量池（编译器生成的字面量和符号引用）会在类加载后被放入这个区域）, 除了在编译期生成的常量, 还允许动态生成, 例如 String 类的 intern(). ）
- 字符串常量池（jdk6及以前, 在方法区, jdk7及以后移到堆）
- 八种基本类型的包装类的对象池

# 44, 动态链接与静态链接



# 45, Java8新特性

 # 1、Lambda 表达式 

## 1. 什么是Lambda表达式：

函数作为参数传递进方法中

作用：

1、代替实现接口时写匿名内部类繁琐代码

2、使代码变的更加简洁紧凑

写法：

a、无参数、无返回 () -> System.out.println("");

b、有参数, 无返回 (x) -> System.out.println(x)；

c、无参数, 返回 () -> 5；

d、有参数, 返回 (x, y) -> x – y;   (x)->2*x;

注：

可选类型声明：不需要声明参数类型, 编译器可以统一识别参数值. 

可选的参数圆括号：一个参数无需定义圆括号, 但多个参数需要定义圆括号. 

可选的大括号：如果主体包含了一个语句, 就不需要使用大括号. 

可选的返回关键字：如果主体只有一个表达式返回值则编译器会自动返回值, 大括号需要指定明表达式返回了一个数值. 

Lambda表达式需要配合函数式接口使用（接口只有一个方法）

##  2、默认方法 

接口种默认方法, 可以有方法体

##  3、方法引用 

##  4、Stream API 

Stream流

filter（过滤）、sort（排序）、map（对给个对象映射）、limit(获取指定数量的流)

```
List<Integer> numbers = Arrays.asList(3, 2, 2, 3, 7, 3, 5);
numbers.stream().filter(t -> t % 2 == 0).map(t -> String.valueOf(t)+"*").collect(Collectors.toList()).forEach(System.out::println);
IntSummaryStatistics stats = numbers.stream().mapToInt((x) -> x).summaryStatistics();
```

##  5、Date Time API  

jdk7非线程安全+设计很差(util.Date sql.Date, Date年1900开始, 月0-11, )+时区处理麻烦

Java 8引了新的日期和时间API, 它们是不变类, 默认按ISO 8601标准格式化和解析；

使用LocalDateTime可以非常方便地对日期和时间进行加减, 或者调整日期和时间, 它总是返回新对象；

使用isBefore()和isAfter()可以判断日期和时间的先后；

使用Duration和Period可以表示两个日期和时间的“区间间隔”. 

从Java 8开始, java.time包提供了新的日期和时间API, 主要涉及的类型有：

本地日期和时间：LocalDateTime, LocalDate, LocalTime；

带时区的日期和时间：ZonedDateTime；

时刻：Instant；

时区：ZoneId, ZoneOffset；

时间间隔：Duration. 

以及一套新的用于取代SimpleDateFormat的格式化类型DateTimeFormatter. 

和旧的API相比, 新API严格区分了时刻、本地日期、本地时间和带时区的日期时间, 并且, 对日期和时间进行运算更加方便. 

此外, 新API修正了旧API不合理的常量设计：

Month的范围用1~12表示1月到12月；jdk7 月：0-11 年：1900起

Week的范围用1~7表示周一到周日. 

最后, 新API的类型几乎全部是不变类型（和String类似）, 可以放心使用不必担心被修改. 

LocalDateTime dt = LocalDateTime.now(); // 当前日期和时间

LocalDateTime dt2 = LocalDateTime.of(2019, 11, 30, 15, 16, 17);

DateTimeFormatter自定义输出格式：

 // 自定义格式化:

 DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm:ss");

 System.out.println(dtf.format(LocalDateTime.now()));

LocalDateTime提供了对日期和时间进行加减的非常简单的链式调用：

/ 加5天减3小时:

LocalDateTime dt2 = dt.plusDays(5).minusHours(3);

##  6、Optional 类 

Java8新特性：

Optional

static <T> Optional<T> ofNullable(T value)

如果为非空, 返回 Optional 描述的指定值, 否则返回空的 Optional. 

可以保存类型T的值, 或者仅仅保存null, 很好的解决空指针异常, 减少空值判断代码, 可读性降低

```java
// JDK 7
public String getCity(User user)  throws Exception{
        if(user!=null){
            if(user.getAddress()!=null){
                Address address = user.getAddress();
                if(address.getCity()!=null){
                    return address.getCity();
                }
            }
        }
        throw new Excpetion("取值错误");  
    }
```

```java
// JDK 8
public String getCity(User user) throws Exception{
    return Optional.ofNullable(user)
                   .map(u-> u.getAddress())
                   .map(a->a.getCity())
                   .orElseThrow(()->new Exception("取指错误"));
}

//如上所示, 如果user的name的长度是小于6的, 则返回. 如果是大于6的, 则返回一个EMPTY对象. 
Optional<User> user1 = Optional.ofNullable(user).filter(u -> u.getName().length()<6);
```

