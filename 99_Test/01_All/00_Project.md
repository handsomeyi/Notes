# 英雄传说MMORPG

## 遇到的难题

### 用PackageUtil工具类空格问题

背景: 用packageUtil把一个包里的所有类, 放到一个set里面, 方便初始化, 易于扩展.

在利用这个工具类的时候获取clazzSet, 就是想把所有类型的消息处理器放到一个set里头
结果在**debug的时候发现** => 源码意外里面发现本地path的url => 里面有一个 %20 
之前在利用protobuf生成java代码的时候也遇见过, 所以就在path上找问题
因为这个util没有对空格形式特殊处理, 所以set一直没找到, 消息一直没被处理.
我又认为这个命名不规范, 我索性就把文件夹名字去掉了空格.

一定要规范命名

### 低级错误

把build好的msg对象弃之而不用, 只用它做了一个判空处理. (而且idea也没提示, 因为我用到了msg对象)
然后实际该用它的时候填错了, 填的是原本的消息体(一个字节数组) => 一直出错
也是debug的时候发现了...

### MySQL连接问题(折磨王)

1. **时区问题** => UTC GMT

2. **驱动问题**

   mysql-connector-java 6.0+ => com.mysql.cj.jdbc.Driver

   mysql-connector-java 6.0- => com.mysql.jdbc.Driver

3. **数据库版本问题**



这是一个利用了Netty框架和Protobuf序列化的简单游戏服务端的demo

客户端用cocos => Protobuf => 服务端Netty

## 概要介绍

前提是打开服务器 => 

### 初始化

1. CmdHandlerFactory.init() => **==消息类 到 消息处理器的映射==**

   通过一个 **辅助包PackageUtil** 获取指定路径下所有 handler 类 => 得到Set<Class<?>>
   然后遍历这个Set, 通过反射获取类的方法的参数 就能得到相应proto消息类
   然后用clazz.newInstance()得到一个实例存入Map => **==key是消息类, value是消息处理器==**.

   ```java
   CmdHandlerFactory.init(); // 注册所有的handler到_handlerMap
   // Class<?> => ICmdHandler<? extends GeneratedMessageV3>
   // 消息类  =>  消息处理器的映射
   ```

2. GameMsgRecognizer.init() => MsgBody 与 MsgCode 的关联

   直接反射获取 **GameMsgProtocol** 的所有 **GeneratedMessageV3** 类(也就是消息类)
   放在 Class<?>[] 类数组, **==遍历类数组==** => 拿到类 和 类名
   用 类 和 类名 去和消息号做匹配, 匹配上了就直接加入Map, Map参数如下 否则contiue;

   ```java
   GameMsgRecognizer.init(); // 完成 MsgBody 与 MsgCode 关联, 两个HashMap
   // <Integer, GeneratedMessageV3> => 通过消息编号取消息类型
   // <Class<?>, Integer>           => 通过消息类获取消息号
   ```

3. MySqlSessionFactory.init()
   **咱就是直接通过MyBatis初始化获取一个sqlSessionFactory**
   **这个工厂 后边登陆异步调用的时候就openSession()使用SQLSession执行查库**

```java
static public void init() {
_sqlSessionFactory = (new SqlSessionFactoryBuilder()).
    build(Resources.getResourceAsStream("MyBatisConfig.xml")
}
static public SqlSession openSession() {
    return _sqlSessionFactory.openSession(true);
}
```

4. 初始化Redis
5. 初始化RocketMQ

   

### 等待客户端消息

### 消息到达 => NIO => Decoder

### GameMsgDecoder

客户端发出的每个指令都被序列化为一个字节数组 => 通过相应的协议发送

Netty就负责通过接收到二进制信息 通过BinaryWebSocketFrame转化为字节数组信息

咱们的消息设计就是头部第一个short(两个字节)是空值

然后第二个short就是msgCode消息编号

通过消息编号获取相应的MsgBuilder(这个是protobuf实现)然后**build**出 Message newMsg 对象.

通过**ctx.fireChannelRead(newMsg)** => 把消息对象交给Netty 加入到ctx

### GameMsgHandler (消息处理器) => 把消息交给主线程处理消息

```java
// channelActive(ctx) => 添加客户端信道
// handlerRemoved(ctx)=> 移除客户端信道
public class GameMsgHandler extends SimpleChannelInboundHandler<Object> {
    @Override
    protected void channelRead0(ChannelHandlerContext ctx, Object msg) {
        if (msg instanceof GeneratedMessageV3) {
            Class<?> msgClazz = msg.getClass();
            LOGGER.info("test => 收到客户端消息, smgClazz = {}, msg = {}", msgClazz.getName(), msg);
            // 通过主线程处理器处理消息
            MainThreadProcessor.getInstance().process(ctx, (GeneratedMessageV3) msg);
        }
    }
}
```

### MainThreadProcessor => 单线程

```java
// 单例实例对象
static private final MainThreadProcessor _instance = new MainThreadProcessor();
// 拿实例
static public MainThreadProcessor getInstance() {
    return _instance;
}
// 单线程池
private final ExecutorService _es = Executors.newSingleThreadExecutor((newRunnable) -> {
    Thread newThread = new Thread(newRunnable);
    newThread.setName("MainThreadProcessor");
    return newThread;
});
// 用单线程池提交处理过程
public void process(ChannelHandlerContext ctx, GeneratedMessageV3 msg) {
        // 获取消息类
        Class<?> msgClazz = msg.getClass();// 前面的map里拿映射到的类
        _es.submit(() -> {
            // 获取指令处理器
            ICmdHandler<? extends GeneratedMessageV3>
                cmdHandler = CmdHandlerFactory.create(msgClazz); // 工厂获取handler
            cmdHandler.handle(ctx, cast(msg)); // 调用handler.handle()
        });
}
```

### XxxXxxxCmdHandler  implements  ICmdHandler

再就是业务逻辑啦

```java
// 各种消息处理器 => 实现了接口中的handle()方法
GetRankCmdHandler.class;
UserAttkCmdHandler.class; => MQ Redis
UserEntryCmdHandler.class;
UserLoginCmdHandler.class;
UserMoveToCmdHandler.class;
WhoElseIsHereCmdHandler.class;
```



### 异步实现登陆

实际生产环境的应该是单独服务器和其他安全框架实现.
但是这个异步过程应该也没问题, 能用上.

就是把查库送去另一个线程(asyncOp.doAsync();)
让他查库, 查完之后, 回调函数继续执行逻辑(doFinish)



### Redis + RocketMQ 排行榜系统是如何实现的?

![image-20220323235920704](https://s2.loli.net/2022/04/12/DesM4jSJdCnlmty.png)

**Redis**

是存在库里 => 用户要的时候才返回(并不是实时的)

1. **服务器生产数据 userId 击杀次数 死亡次数 => 发给RocketMQ**
2. **RocketMQ => 排行榜进程(排名逻辑处理) => 写到Redis**
3. **最后用户再要排名的时候再从Redis取排名数据**

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

    ```java
    hset User_1 BasicInfo "{userId:1}"
    hset User_1 kill 2
    hset User_1 die 1
    hget User_1 BasicInfo // =>  "{userId:1}"
    hget User_1 kill // =>  (Integer) 2
    ```

  - hincrby(线程安全增加)
  
    ```redis
    hincrby User_1 kill 1
    Integer 3
    ```

  - zadd(设置一个zset)
  
    ```java
    zadd Rank 2 1 // => (key=2, value=1)
    zadd Rank 1 2 // => (key=1, value=2)
    zrange Rank 0 9 withsocres // 升序
    zrevrange Rank 0 9 withscores // 降序
    ```
  
  - zrange(升序), zrevrange(降序)

**RocketMQ**

![image-20220412020822459](https://s2.loli.net/2022/04/12/vHt4N3inZBwV6CW.png)

把RocketMQ 和 启动起来 => Broker 

先是传到GetRankCmdHandler => 然后调用获取排名服务

也是用的一个异步调用, 用到了之前的aysnc包里的异步逻辑.
去redis拿到的结果就是一个Set< Tuple > (元组)
然后遍历元组 => 一个个加到java自己的ArrayList<>里面
最后主线程得到list之后 => 遍历结果集 => builder.build();
最后, 写到channel里面就完成了.

还有一个点就是 => 另外起一个RankApp进程 与游戏主业务服务器进程解耦.



### 如果给100万人排序怎么排?

5000个桶, 实时记录分数变化, 特殊处理前两百名. 每个人排名就是之前桶的总和.

https://blog.codingnow.com/2014/03/mmzb_db_2.html



### 日志系统用的什么? FEK是什么?

Elasticsearch是个开源分布式搜索引擎，提供搜集、分析、存储数据三大功能。它的特点有：分布式，零配置，自动发现，索引自动分片，索引副本机制，restful风格接口，多数据源，自动搜索负载等。

Logstash(此项目用Filebeat) 主要是用来日志的搜集、分析、过滤日志的工具，支持大量的数据获取方式。一般工作方式为c/s架构，client端安装在需要收集日志的主机上，server端负责将收到的各节点日志进行过滤、修改等操作在一并发往elasticsearch上去.

Kibana 也是一个开源和免费的工具，Kibana可以为 Logstash 和 ElasticSearch 提供的日志分析友好的 Web 界面，可以帮助汇总、分析和搜索重要数据日志。

用的FileBeat(收集) + Elasticsearch(存储, 搜索) + Kibana(展示)

**LogStash or Filebeat?**

因为**logstash是jvm跑的, 资源消耗比较大**, 所以后来作者**又用golang写了**一个功能较少但是资源消耗也小的轻量级的logstash-forwarder. 后来改名叫Filebeat.

![image-20220324003302290](https://s2.loli.net/2022/04/12/yWCxQqshteMajfp.png)

配置完后他会自动帮你捞日志 => 直接通过Kibana看就行啦! 

如何**配置**?

**==装好Filebeat => 修改filebeat.yml配置文件== =>** 

**==配置log目录位置, 配置es网络位置, Kibana网络位置==**

# 网约车SpringCloud

参与了一个网约车项目, 它基于微服务实现的, 用到了SpringCloud相关的一些组件.

## Eureka

![image-20220412123525389](https://s2.loli.net/2022/04/12/toz1HInDLxwsJKr.png)

## Zuul

之前再zuul配置实现

动态路由 => 扩展方便 => 统一逻辑路由

## Ribbon

服务间调用

## JWT是什么

由服务端根据规范生成一个令牌（token），并且发放给客户端。
此时客户端请求服务端的时候就可以携带者令牌，以令牌来证明自己的身份信息。
作用：类似session保持登录状态 的办法，通过token来代表用户身份。

它由三部分组成：**头部**、**载荷**与**签名** header.payload.signature

**JWT令牌的优点: **

jwt基于json，非常方便解析可以再令牌中自定义丰富的内容，易扩展（payload可以扩展）通过签名，让JWT防止被篡改，安全性高资源服务使用JWT可不依赖认证服务即可完成授权

a、**token到底生成什么样最好？（规则），每个用户要唯一**

三部分组成：头部、载荷与签名 header.payload.signature

b、**token返回给客户端之后，服务端还要保存吗？**

服务端不需要保存

c、**校验token时，怎么保证数据并没有被黑客拦截并篡改？（安全）**

signature中有私钥来进行签名，可以保证安全性

d、**token颁发给客户端之后，要不要有过期时间？**

需要设置token过期时间

e、**多次登录生成的token都是一样的吗？都是可用的吗？**

可以再payload加上时间戳，来保证每次生成的token都不一样，都是可用的