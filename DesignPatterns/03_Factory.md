## 简单工厂

```java
/**
 * 简单工厂的可扩展性不好
 */
public class SimpleVehicleFactory {
    public Car createCar() {
        //before processing
        return new Car();
    }

    public Broom createBroom() {
        return new Broom();
    }
}
```



## 工厂方法-产品维度扩展

```java
public interface Moveable {
    void go();
}
```

```java
public class Car implements  Moveable {
    //Car类 规定了car的规范和长相  实现了接口(Moveable)
    public void go() {
        System.out.println("Car go wuwuwuwuw....");
    }
}
```

```java
public class CarFactory {
    public Moveable create() {
        System.out.println("a car created!");
        //制造一个车  让return返回一个Moveable对象
        return new Car();
    }
}
```

```java
public class Main {
    public static void main(String[] args) {
        //new一个CarFactory, 并执行create方法
        Moveable m = new CarFactory().create();
        m.go();
    }
}
```

## 抽象工厂-产品族扩展

意义: 方便扩展不同类型的实际工厂



![image-20211103102607040](https://raw.githubusercontent.com/handsomeyi/Pics/master/image-20211103102607040.png)

## bean工厂

???









































