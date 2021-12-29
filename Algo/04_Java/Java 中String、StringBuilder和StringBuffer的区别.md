## String、StringBuilder和StringBuffer的区别

---


区别：String为字符串常量，一旦被创建的话，就不能在改变了。

StringBuilder和StringBuffer为字符串变量，创建后是可以被更改的

速度：StringBuilder>StringBuffer>String

**区别:StringBuilder是线程不安全,StringBuffer是线程安全的**

StringBuffer中很多带有=synchronized=关键字



**String：适用于少量的字符串操作的情况**

**StringBuilder：适用于单线程下在字符缓冲区进行大量操作的情况**

**StringBuffer：适用多线程下在字符缓冲区进行大量操作的情况**



https://blog.csdn.net/yy_cly/article/details/87649885