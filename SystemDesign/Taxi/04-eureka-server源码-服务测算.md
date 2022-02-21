## eureka结构

![image-20211213163550237](https://s2.loli.net/2021/12/13/ZJbHFM6OB9hVREn.png)

## cap 

1.三级缓存。

2.从其他peer拉取注册表。peer。int registryCount = this.registry.syncUp()，没有满足C的地方。

3.P：网络不好的情况下，还是可以拉取到注册表进行调用的。服务还可以调用。



100     80， 20挂了。1个没挂，但是网络抖动了。

不剔除这1个了。



## 自我保护剔除：eureka 优化

1. 开关
2. 阈值







## server源码。

剔除（本质也是下面的下线）。长时间没有心跳的服务，eureka server将它从注册表剔除。√

注册。√

续约。√

下线。√

集群间同步。√

拉取注册表。（all-apps,apps-delta,服务名）

```sh
Lease<InstanceInfo>租约     InstanceInfo服务实例
```



收到服务实例，保存。心跳时间，xxx时间。



服务实例，有 xxxx时间。



class 租约{

​	long 到期time;

​	long 续约时间time;

​	long 心跳时间time;

​	T 服务实例 holder。setter

}



后面续约：频繁。

## 服务测算。

20个服务   每个服务部署5个。 eureka client：100个。

1分钟 200。

心跳。向server发送我们活着。

几十万次。对server而言。



1个拉一次，注册一次。100 ，200.



10M，cpu hz。   100.

----

增量拉取。
