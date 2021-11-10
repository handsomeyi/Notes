# TemplateMethod模板方法-勾子函数

![image-20211107201550733](https://raw.githubusercontent.com/handsomeyi/Pics/master/image-20211107201550733.png)



![image-20211107201704355](https://raw.githubusercontent.com/handsomeyi/Pics/master/image-20211107201704355.png)



```java
public class Main {
    public static void main(String[] args) {
        F f = new C1();
        f.m();
    }
}

abstract class F {
    public void m() {
        op1();
        op2();
    }

    abstract void op1();
    abstract void op2();
}

class C1 extends F {

    @Override
    void op1() {
        System.out.println("op1");
    }

    @Override
    void op2() {
        System.out.println("op2");
    }
}
```

