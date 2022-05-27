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

监听的fd放到红黑树, 然后数据到达就把fd复制到ready链表

epoll整体源码详解(Linux5): https://www.cnblogs.com/l2017/p/10830391.html (貌似以前用到了mmap)

epoll重点源码分析: https://zhuanlan.zhihu.com/p/345804840



###  **==在 Linux 的设计中有三种典型的 I/O 多路复用模型 select、poll、epoll. ==** 

 **select 是一个主动模型, 需要线程自己通过一个集合存放所有的 Socket, 然后发生 I/O 变化的时候遍历**. 在 select 模型下, 操作系统不知道哪个线程应该响应哪个事件, 而是由线程自己去操作系统看有没有发生网络 I/O 事件, 然后再遍历自己管理的所有 Socket, 看看这些 Socket 有没有发生变化.  

 **poll 提供了更优质的编程接口, 但是本质和 select 模型相同**. 因此千级并发以下的 I/O, 你可以考虑 select 和 poll, 但是如果出现更大的并发量, 就需要用 epoll 模型.  

 **epoll 模型在操作系统内核中提供了一个中间数据结构, 这个中间数据结构会提供==事件监听注册==, 以及快速判断消息关联到哪个线程的能力（红黑树实现）**. 因此在高并发 I/O 下, 可以考虑 epoll 模型, 它的速度更快, 开销更小. 



**异步IO**



### JVM信手拈来

GC过程?

1. CAS or TLAB?

2. Eden是否满?

   1. 没满直接分配到Eden区(分配结束)
   2. 满了先MinorGC

3. MinorGC过程

4. 先检查老年代最大可用连续空间是否大于新生代所有对象总空间?

   1. 大于 => 安全 => 直接Appel式回收(Eden, From => To)
   2. 小于=>不安全=>HandlePromotionFailure是true或false
      1. true 看之前平均如果大于就继续Appel式回收, 小于就FullGC
      2. false 直接FullGC

5. GC过程中有几个晋升点

   1. 超过MaxTenuringThreshold值(PS=15, CMS=6, G1=15)

   2. MinorGC时ToSurvivor满了分配担保 多余的放入老年代 

      HandlePromotionFailure一般为ture, 减少FullGC

   3. 动态年龄计算(年龄总和?)

**新生代占用1/3堆空间, 老年代占用2/3堆空间**
**新生代中 Eden占8/10, From与To占2/10**

### 计算机网络信手拈来



### Redis源码

 => 持久化? 

RDB => save, bgsave

AOF 直接追加

主从复制? 

fork进程来实现

backlog 作为缓冲区 取舍数据有可能丢失的情况

哨兵? 集群分片?

3.0之后redis cluster

**持久化**

RDB AOF

过期策略: 立即过期 惰性过期 定期过期=>上面两种的折中.

Redis实现高可用三种模式:主从, 哨兵, 集群模式

**主从复制**

首次全量复制:
从发psync请求
主执行bgsave
RDB文件生成
向slave发送RDB文件
从解析文件
主缓存后期的同步期间写命令
传给从执行

增量复制

replicationFeedSalves()对导致数据变化的用户命令 => 传给slave

**sds**:

- int，存储字符串长度小于21且能够转化为整数的字符串（大于8字节）。
- embstr，存储字符串长度小于44字节的字符串（REDIS_ENCODING_EMBSTR_SIZE_LIMIT）。
- raw，剩余情况使用raw编码进行存储。

空间分配前先判断

**哨兵**

多个哨兵实例组成的,监视所有Redis节点.

哨兵作用:
心跳检测各个redis是否活着,
当主宕机时, 通知其他哨兵进行一个选举活动, 得出新主
哨兵之间相互监控

网络总是不完全可靠的, 所以要多个哨兵一起投票, 大于某个值才能判断是否真的宕机了


**集群分片**



### MySQL

 => InnoDB,MyISAM? 索引? SQL优化?

### 了解Cocos Creator, Unity



### SpringCloud



### Kafka, RocketMQ



### Restful API? OAuth? JWT?

### JWT和Token的区别

**相同点：**

- 都是访问资源的令牌
- 都可以记录用户的信息
- 都是使服务端无状态化
- 都是只有验证成功后，客户端才能访问服务端上受保护的资源

**不同点：**

- Token：服务端验证客户端发送过来的 Token 时，还需要查询数据库获取用户信息，然后验证 Token 是否有效。
- JWT：将 Token 和 Payload 加密后存储于客户端，服务端只需要使用密钥解密进行校验（校验也是 JWT 自己实现的）即可，不需要查询或者减少查询数据库，因为 JWT 自包含了用户信息和加密的数据。

普通token需要后端存储与用户的对应关系，而JWT自身携带对应关系。在大型的多系统中，普通token每次请求需要向用户资源服务器获取对应用户信息同时验证token，而JWT只需要验证签名有效即可信任且JWT自带用户信息, 无需额外请求。

**==token进行用户身份验证的流程：==**

客户端使用用户名和密码请求登录
服务端收到请求，验证用户名和密码
验证成功后，服务端会签发一个token，再把这个token返回给客户端
客户端收到token后可以把它存储起来，比如放到cookie中
客户端每次向服务端请求资源时需要携带服务端签发的token，可以在cookie或者header中携带
服务端收到请求，然后去验证客户端请求里面带着的token，如果验证成功，就向客户端返回请求数据
这种基于token的认证方式相比传统的session认证方式更节约服务器资源，并且对移动端和分布式更加友好。其优点如下：

支持跨域访问：cookie是无法跨域的，而token由于没有用到cookie(前提是将token放到请求头中)，所以跨域后不会存在信息丢失问题
无状态：token机制在服务端不需要存储session信息，因为token自身包含了所有登录用户的信息，所以可以减轻服务端压力
更适用CDN：可以通过内容分发网络请求服务端的所有资料
更适用于移动端：当客户端是非浏览器平台时，cookie是不被支持的，**此时采用token**认证方式会简单很多
无需考虑CSRF：由于不再依赖cookie，所以采用token认证方式不会发生CSRF，所以也就无需考虑CSRF的防御

==**JWT属于token认证的一种方式**==
对比传统的session认证方式，JWT的优势是：

简洁**：JWT Token数据量小，传输速度也很快**
因为JWT Token是以JSON加密形式保存在客户端的，所以JWT是跨语言的，原则上任何web形式都支持
不需要在服务端保存会话信息，也就是说不依赖于cookie和session，所以没有了传统session认证的弊端，特别适用于分布式微服务
**单点登录友好**：使用Session进行身份认证的话，由于cookie无法跨域，难以实现单点登录。但是，使用token进行认证的话， token可以被保存在客户端的任意位置的内存中，不一定是cookie，所以不依赖cookie，不会存在这些问题
**适合移动端应用**：使用Session进行身份认证的话，需要保存一份信息在服务器端，而且这种方式会依赖到Cookie（需要 Cookie 保存 SessionId），所以不适合移动端
————————————————
原文链接：https://blog.csdn.net/Tom098/article/details/122930030

==**JWT就相当于一个人戴了口罩, 你虽然能看到他长啥样, 男的女的, 但你不知道他的私密信息, 不知道他是谁.**
**所以JWT的payload里面可以存放公开信息, 非私密信息.==**

因为签名是基于密钥来进行hash, 所以payload被修改后服务器就会知道你修改了, 就不会返回资源.

- JWT是一种安全标准。基本思路就是用户提供用户名和密码给认证服务器，服务器验证用户提交信息信息的合法性；如果验证成功，会产生并返回一个Token（令牌），用户可以使用这个token访问服务器上受保护的资源。

- 头部、载荷、签名
- 头部描述JWT基本信息, 类型, 签名算法等.
- 载荷 签发者, 签发时间, 过期时间, 接收者, 使用者 + 自定义其他信息.
- 签名 则为对Header、Payload的签名 通过base64编码

**优点**

- 因为json的通用性，所以JWT是可以进行跨语言支持的，像JAVA,JavaScript,NodeJS,PHP等很多语言都可以使用。
- 因为有了payload部分，所以JWT可以在自身存储一些其他业务逻辑所必要的**非敏感信息**。
- 便于传输，jwt的构成非常简单，字节占用很小，所以它是非常便于传输的。
- 它不需要在服务端保存会话信息, 所以它易于应用的扩展

**安全相关**

- 不应该在jwt的payload部分存放敏感信息，因为该部分是客户端可解密的部分。
- 保护好secret私钥，该私钥非常重要。
- 如果可以，请使用https协议

# 英雄传说

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

## 英雄传说

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

