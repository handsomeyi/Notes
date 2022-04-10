# 用PackageUtil工具类空格问题

在利用这个工具类的时候获取clazzSet, 就是想把所有类型的消息处理器放到一个set里头
结果在debug的时候发现 => 源码意外里面发现本地path的url => 里面有一个 %20 
之前在利用protobuf生成java代码的时候也遇见过, 所以就在path上找问题
因为这个util没有对空格形式特殊处理, 所以set一直没找到, 消息一直没被处理.
我又认为这个命名不规范, 我索性就把文件夹名字去掉了空格.

# 低级错误

把build好的msg对象弃之而不用, 只用它做了一个判空处理. (而且idea也没提示, 因为我用到了msg对象)
然后实际该用它的时候填错了, 填的是原本的消息体(一个字节数组) => 一直出错
也是debug的时候发现了...



# MySQL连接问题(折磨王)

1. **时区问题** => UTC GMT

2. **驱动问题**

   mysql-connector-java 6.0+ => com.mysql.cj.jdbc.Driver

   mysql-connector-java 6.0- => com.mysql.jdbc.Driver

3. **数据库版本问题**

