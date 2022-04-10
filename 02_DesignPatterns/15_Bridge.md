# Bridge-避免类爆炸

## 问题

```java
如果礼物分为温柔的礼物和狂野的礼物
WarmGift WildGift
这时Flower应该分为
WarmFlower WildFlower
WarmBook WildBook

如果再有别的礼物，比如抽象类型：ToughGift ColdGift
或者具体的某种实现：Ring Car

就会产生类的爆炸
WarmCar ColdRing WildCar WildFlower ...
```

## 解决

```
使用桥接模式：
分离抽象与具体实现，让他们可以独自发展
Gift -> WarmGift ColdGift WildGift
GiftImpl -> Flower Ring Car
```

![image-20211105212559928](https://raw.githubusercontent.com/handsomeyi/Pics/master/image-20211105212559928.png)







```java
public abstract class Gift {
    GiftImpl impl;
}
```

```java
public class GiftImpl {
}
```

```java
public class WarmGift extends Gift {
    public WarmGift(GiftImpl impl) {
        this.impl = impl;
    }
}
```

```java
public class WildGift extends Gift {
    public WildGift(GiftImpl impl) {
        this.impl = impl;
    }
}
```

### 实体

```java
public class Book extends GiftImpl {
}
```

```java
public class Flower extends GiftImpl {
}
```

###  GG & MM 

```java
public class MM {
    String name;
}
```

```java
public class GG {
    public void chase(MM mm) {
        Gift g = new WarmGift(new Flower());
        give(mm, g);
    }

    public void give(MM mm, Gift g) {
        System.out.println(g + "gived!");
    }

}
```



==gift 就可以直接通过下面这种方式来创建==

```java
Gift g = new WarmGift(new Flower());
```

来创建各种各样的类

