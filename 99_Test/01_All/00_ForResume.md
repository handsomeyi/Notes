# Resume

### 数据结构



### 常见设计模式



### IO模型

https://zhuanlan.zhihu.com/p/115912936 5种IO模型

https://cloud.tencent.com/developer/article/1862671 epoll 为什么用红黑树？

![img](https://s2.loli.net/2022/03/23/Wo4tk6JqVf7Eelv.jpg)

同步阻塞IO => 同步非阻塞IO => 加入IO多路复用器 => 加入epoll机制(信号驱动) => 异步IO

**同步阻塞IO**

![image-20220323151015356](https://s2.loli.net/2022/03/23/RPsGX4FZTO2l1UA.png)

服务器应用B线程调用revcfrom时, 从kernel缓冲区读取fd会一直阻塞, 直到数据包到达缓冲区或报错.

所以是一个接着一个轮流读取内核中fd. => 慢

**同步非阻塞IO** 



![image-20220323151038146](https://s2.loli.net/2022/03/23/rqW5pcAeT3MBflR.png)

应用B线程从kernel读取fd时, 会遍历用户空间的fd=>然后来内核缓冲区询问是否到达

轮询一次发生在用户空间 => 查询一次就要调一次系统调用内核态用户态来回切换 => CPU保护恢复现场 

所以开销大, 应该尽量把

**加入IO多路复用器** **==内核增加系统调用select==**

![image-20220323152436096](https://s2.loli.net/2022/03/23/W4RrLktp1uEiITK.png) 

![image-20220323151135860](https://s2.loli.net/2022/03/23/SgoHnz9lQOeDBrG.png)

Linux内核新增select系统调用 => 用户进程B 把你要监控的1000个fd传给内核 => 一次

kernel自己监控, 当数据到达 => 返回ready的fd => 然后B再调用**read系统调用** =>一次

所以减少了内核态用户态切换 => 提高CPU利用效率



**加入epoll机制(信号驱动)** => 因为select拷贝数据来去开销 又想优化 => **==共享空间==**

内核又新增了**==mmap系统调用==** => 内核态与用户态的共享空间

![image-20220323153844543](https://s2.loli.net/2022/03/23/kJBPWvAGti7FMg3.png)

![image-20220323153614872](https://s2.loli.net/2022/03/23/GiN7IUprqF5ZbuV.png)

详细理解 内核态与用户态的共享空间**如何创建(epoll_create) 如何使用(epoll_wait)** 

然后数据来了  => 软中断 => 从fd buffer拷贝数据到红黑树

![image-20220323160701976](https://s2.loli.net/2022/03/23/LKxJfjaTtFvgzqc.png)

```c++
epoll_create()

epoll_ctl() 

epoll_wait()
就绪队列

```

### ==epoll源码详解==

epoll源码详解: https://www.cnblogs.com/l2017/p/10830391.html





###  **==在 Linux 的设计中有三种典型的 I/O 多路复用模型 select、poll、epoll. ==** 

 **select 是一个主动模型, 需要线程自己通过一个集合存放所有的 Socket, 然后发生 I/O 变化的时候遍历**. 在 select 模型下, 操作系统不知道哪个线程应该响应哪个事件, 而是由线程自己去操作系统看有没有发生网络 I/O 事件, 然后再遍历自己管理的所有 Socket, 看看这些 Socket 有没有发生变化.  

 **poll 提供了更优质的编程接口, 但是本质和 select 模型相同**. 因此千级并发以下的 I/O, 你可以考虑 select 和 poll, 但是如果出现更大的并发量, 就需要用 epoll 模型.  

 **epoll 模型在操作系统内核中提供了一个中间数据结构, 这个中间数据结构会提供事件监听注册, 以及快速判断消息关联到哪个线程的能力（红黑树实现）**. 因此在高并发 I/O 下, 可以考虑 epoll 模型, 它的速度更快, 开销更小. 

**异步IO**



### JVM信手拈来



### 计算机网络信手拈来



### Redis源码

 => 持332久化? 主从复制? 哨兵? 集群分片?



### MySQL

 => InnoDB,MyISAM? 索引? SQL优化?

### 了解Cocos Creator, Unity



### SpringCloud



### Kafka, RocketMQ



### Restful API? OAuth? JWT?



### Protobuf如何设计使用?

 => 如何编解码

### 角色入场, 角色移动, 角色离场

 => 如何同步? => Netty (ChannelGroup)

### Redis+RocketMQ

如何实现排行榜系统的? => 是存在库里 => 用户要的时候才返回(并不是实时的)

1. **服务器生产数据 userId 击杀次数 死亡次数 => 发给RocketMQ**

2. **RocketMQ => 排行榜进程(排名逻辑处理) => 写到Redis**

3. **最后用户再要排名的时候再从Redis取排名数据**

![image-20220323235920704](https://s2.loli.net/2022/03/23/sNBiObKyoglvn5P.png)

- 需求

  - 根据击杀胜利次数进行排名；

  - 显示排名 Id、用户头像、用户名称、胜利次数；

  - 最多显示 10 个用户；

- 实现

  - 修改 Protobuf 消息协议文档；
  - 增加 GetRankCmd 和 GetRankResult；
  - 增加 GetRankCmdHandler 类；
  - 修改 UserAttkCmdHandler 类完成排行榜功能；

- Redis命令

  - hset, hget (哈希表存取) => 设

    ```redis
    hset User_1 BasicInfo "{userId:1}"
    hset User_1 kill 2
    hset User_1 die 1
    ```

  - hincrby(线程安全增加)

    ```redis
    hincrby User_1 kill 1
    Integer 3
    ```

  - zadd(设置一个zset)

  - zrange(升序), zrevrange(降序)



### Filebeat(收集), Elasticsearch(存储, 搜索), Kibana(展示)

**LogStash or Filebeat?**

因为**logstash是jvm跑的, 资源消耗比较大**, 所以后来作者**又用golang写了**一个功能较少但是资源消耗也小的轻量级的logstash-forwarder. 后来改名叫Filebeat.

是什么? 如何使用? 如何配置?

![image-20220324003302290](https://s2.loli.net/2022/03/24/Cf4S3iUe7pw5ys6.png)

配置完后他会自动帮你捞日志 => 直接通过Kibana看就行啦! 

**配置**

装好Filebeat => 修改filebeat.yml配置文件 => 

配置log目录位置, 配置es网络位置, Kibana网络位置





### 工厂模式是什么? 

怎么运用的? 给你加一个功能怎么加入呢?



### 如何生成验证码?

 => 什么格式(JOSN) 如何调用第三方服务发送? 如何使用JWT生成token? 如何在网关校验?

### 灰度发布怎么实现的?

 你还知道哪些灰度发布的实现? => 蓝绿,滚动,... => Zuul? Ribbon?

### 路线信息存储? 

怎么创建订单?(前面几节课) 存储计价规则? => 操作运营端.

验证码

# 英雄传说

只用了Netty 基本上纯手写

只用了Redis RocketMQ MySQL

### GameServer

```java
EventLoopGroup bossGroup = new NioEventLoopGroup();   // 拉客的, 故事中的美女
EventLoopGroup workerGroup = new NioEventLoopGroup(); // 干活的, 故事中的男服务生
```



**用ServerBootstrap建立了**

1. 这些Http编解码器

2. 内容长度限制
3. SocketServerProtocol: WebSocket协议
4. 游戏消息编码器
5. 游戏消息解码器
6. 游戏消息处理器

```java
ServerBootstrap b = new ServerBootstrap();
            b.group(bossGroup, workerGroup);
			// 非阻塞的信道, 拉客不停歇!
            b.channel(NioServerSocketChannel.class); 
			// 告诉干活的这活应该怎么干?
            b.childHandler(new ChannelInitializer<SocketChannel>() { 
                @Override
                public void initChannel(SocketChannel ch) {
                    // 在这里告诉干活的这活应该怎么干?
                    ch.pipeline().addLast(
                        new HttpServerCodec(), // 添加 Http 编解码器
                        new HttpObjectAggregator(65535), // 内容不能太长
                        // WebSocket 协议
                        new WebSocketServerProtocolHandler("/websocket"), 
                        new GameMsgEncoder(), // 增加游戏消息编码器
                        new GameMsgDecoder(), // 增加游戏消息解码器
                        new GameMsgHandler()  // 最后在这里处理游戏消息
                    );
                }
            });
```

```java
// 绑定服务器端口号
ChannelFuture f = b.bind(AllConf.GAME_SERVER_HOST, AllConf.GAME_SERVER_PORT).sync(); // 阻塞函数等待服务器完全启动
```

```java
if (f.isSuccess()) {
    LOGGER.info(">>> 游戏服务器启动成功! <<<");
}

f.channel().closeFuture().sync();
```



**消息进来后先通过解码器 => 生成消息对象**

```java
Message newCmd = msgBuilder.build();
```



然后走到主线程处理器 **MainThreadProcessor** **创建CmdHandler消息逻辑处理器**

```java
// 创建命令处理器
final ICmdHandler<? extends GeneratedMessageV3> handlerImpl = CmdHandlerFactory.create(msgClazz);
```



不同的消息就会在不同的处理器被处理 => 然后返回结果

例如首先是登陆 **先创建了UserLoginCmdHandler 调用 LoginService 处理登陆逻辑**

处理完后获取用户实体 => 有一个回调函数 => **回调函数构建**userId, userName,userAvatar

如果不为空 **就构建结果并且writeAndFlush** => 向管道写回消息

```java
public ChannelFuture writeAndFlush(Object msgObj) { // 向管道写回消息
    if (null != msgObj) {
        return _realCtx.writeAndFlush(wrapMsg(msgObj));
    } else {
        return null;
    }
}
```

