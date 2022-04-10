# 饿汉式-最简洁

```java
/**
 * 饿汉式
 * 类加载到内存后，就实例化一个单例，JVM保证线程安全
 * 简单实用，推荐使用！
 * 唯一缺点：不管用到与否，类装载时就完成实例化
 * Class.forName("")
 * （话说你不用的，你装载它干啥）
 */
public class Mgr01 {
    private static final Mgr01 INSTANCE = new Mgr01();
	//这也也可以, 和静态代码块一样
    /*static {
        INSTANCE = new Mgr02();
    }*/
    private Mgr01() {};

    public static Mgr01 getInstance() {
        return INSTANCE;
    }

    public void m() {
        System.out.println("m");
    }

    public static void main(String[] args) {
        Mgr01 m1 = Mgr01.getInstance();
        Mgr01 m2 = Mgr01.getInstance();
        System.out.println(m1 == m2);
    }
}
```

静态变量加载到内存, 就实例化了.



# 懒汉式-增加判断过滤

lazyloading

```java
private static Mgr03 INSTANCE;
private Mgr03() {
}
public static Mgr03 getInstance() {
    if (INSTANCE == null) {
        try {
            Thread.sleep(1);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        INSTANCE = new Mgr03();
    }
    return INSTANCE;
}
```

不安全, 在两个线程里头, 容易冲突.

睡一秒是为了增加被打断的机会.

---

```java
private static Mgr04 INSTANCE;
private Mgr04() {
}
public static synchronized Mgr04 getInstance() {
    if (INSTANCE == null) {
        try {
            Thread.sleep(1);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        INSTANCE = new Mgr04();
    }
    return INSTANCE;
}
```

加锁 => 效率降低 => 安全



## ==双重检查==-单例写法-完美

```java
private static volatile Mgr06 INSTANCE; //JIT
private Mgr06() {
}
public static Mgr06 getInstance() {
    if (INSTANCE == null) {
        //双重检查
        synchronized (Mgr06.class) {
            if(INSTANCE == null) {
                try {
                    Thread.sleep(1);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                INSTANCE = new Mgr06();
            }
        }
    }
    return INSTANCE;
}
```

加一个 volatile 防止指令重排



# 静态内部类方式

```java
/**
 * 静态内部类方式
 * JVM保证单例
 * 加载外部类时不会加载内部类，这样可以实现懒加载
 */
public class Mgr07 {

    private Mgr07() {
    }

    private static class Mgr07Holder {
        private final static Mgr07 INSTANCE = new Mgr07();
    }

    public static Mgr07 getInstance() {
        return Mgr07Holder.INSTANCE;
    }

    public void m() {
        System.out.println("m");
    }

    public static void main(String[] args) {
        for(int i=0; i<100; i++) {
            new Thread(()->{
                System.out.println(Mgr07.getInstance().hashCode());
            }).start();
        }
    }
}
```

* **JVM保证单例**---虚拟机加载class只会加载一次, Mar07Holder也只会加载一次
 * **==加载外部类时不会加载内部类，这样可以实现懒加载==**



# enum方法

```java
/**
 * 不仅可以解决线程同步，还可以防止反序列化。
 */
public enum Mgr08 {
    INSTANCE;
    public void m() {}
    public static void main(String[] args) {
        for(int i=0; i<100; i++) {
            new Thread(()->{
                System.out.println(Mgr08.INSTANCE.hashCode());
            }).start();
        }
    }
}
```

而其他方法的会通过反射, 可以破解.

**enum没有构造方法**, 所以不会被反序列化

## 总结

1、序列化如何破坏单例的？怎么解决？

2、枚举是如何防止序列化破坏单例的？



序列化的过程是通过ObjectOutPutStream将类写入文件，通过ObjectInputStream将类序列化文件从硬盘读出生成一个对象

在单例的序列化中，被反序列化的单例对象通过显示或者默认的readObject()去获取一个指向新的实例的引用INSTANCE, 原理是利用反射构建了一个新的对象，所以私有构造器是没有用的，readObject()等于是一个面向反序列化的、参数是字节流的公有构造器，这样就会破坏单例类中的一个INSTANCE指向同一个对象的原则

枚举可以保证不被破坏是因为枚举的实例底层编译是一个final static class，这样的实现类似于单例中静态常量模式的实现(饿汉式)，无法实现lazy-loading但保证了单例。类在被加载时是线程安全的，所以解决了线程问题。各种序列化方法，如writeObject、readObject、readObjectNoData、writeReplace和readResolve等会造成单例破坏的方法都是被禁用的，所以在JVM中，枚举类和枚举量都是唯一的，这就实现了自由序列化。

还可以通过序列化中的readResolve方法去保证序列化中的单例，前面说过， **readObject会在反序列化中，为通过对象的字节流参数去新建一个对象，但是反序列化中readResolve方法可以去替换掉readObject新建的实例** ，这就实现了单例传递，而被新建的实例就会因为失去引用被GC线程回收。





