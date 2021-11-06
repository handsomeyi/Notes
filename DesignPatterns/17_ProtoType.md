# Prototype-原型模式

Object.clone ( )

![image-20211105220324741](https://raw.githubusercontent.com/handsomeyi/Pics/master/image-20211105220324741.png)



![image-20211105220403230](https://raw.githubusercontent.com/handsomeyi/Pics/master/image-20211105220403230.png)





深克隆 里面的**属性类也得实现**Cloneable **==使得P2的location引用有属于自己的引用!!!==**



==**String不需要深克隆.**==

两个引用指向同一个常量池中的string, 

如果一个引用的string改了, 另一个引用代表的不会变, 因为修改引用那个会新开一个常量池条目









