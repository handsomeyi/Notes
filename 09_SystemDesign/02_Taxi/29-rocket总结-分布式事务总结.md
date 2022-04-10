# rocketmq使用



rocketmq-all-4.5.0-bin-release

rocketmq-externals



启动顺序

namesrv

```sh
 start mqnamesrv.cmd
```



broker

```sh
start mqbroker.cmd -n 127.0.0.1:9876 autoCreateTopicEnable=true
```



externals

```sh
java -jar rocketmq-console-ng-1.0.1.jar
```



测试：

![image-20200827203507295](29-课上.assets/image-20200827203507295.png)



项目

rocket-tx

producer(改造成我们的服务)

consumer(改造成我们的服务)



19-29。20个小时。2小时。



# 总结分布式事务

2pc(协调者超时 回滚，占用连接，)

3pc (2pc的第一阶段 拆成了 2个阶段，协调者和参与者都超时，pre超时是回滚，do 超时是提交)。

tcc（2pc的第二阶段 拆成了2个阶段，不占用连接，性能高，但是麻烦）(简单业务可以tcc)。

lcn(lcn,tcc)(代码)

seata(at,tcc)（代码）

消息队列+本地事件表（代码）

最大努力通知

可靠消息服务

消息事务（代码）







