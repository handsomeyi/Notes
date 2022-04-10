# State状态模式

![image-20211107202612905](https://raw.githubusercontent.com/handsomeyi/Pics/master/image-20211107202612905.png)



GOF.eg



```java
public abstract class MMState {
    abstract void smile();
    abstract void cry();
    abstract void say();
}
```



```java
public class MMHappyState extends MMState {
    @Override
    void smile() {
        System.out.println("happy smile");
    }

    @Override
    void cry() {
        System.out.println("happy cry" );
    }

    @Override
    void say() {
        System.out.println("happy say");
    }
}
```



```java
public class MMNervousState extends MMState {
    @Override
    void smile() {
    }

    @Override
    void cry() {
    }

    @Override
    void say() {
    }
}
```



```java
public class MMSadState extends MMState {
    @Override
    void smile() {
    }

    @Override
    void cry() {
    }

    @Override
    void say() {
    }
}
```







![image-20211107203848403](https://raw.githubusercontent.com/handsomeyi/Pics/master/image-20211107203848403.png)

CarState 

Car





## 有限状态机 StateMachine 

![image-20211107203402563](https://raw.githubusercontent.com/handsomeyi/Pics/master/image-20211107203402563.png)
