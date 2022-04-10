# 为什么用Protobuf

Google的成熟消息协议框架

Protobuf简单介绍一下?



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



# 消息解码器和消息编码器流程?



# 角色入场, 角色移动, 以及角色离场?

channelGroup广播消息





# 如何同步? 状态同步? 帧同步?

咱们这个用的是状态同步 => state 记录移动时的状态.



# 排行榜系统是如何实现的?

Redis + RocketMQ

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



# 日志系统用的什么? FEK是什么?

用的FileBeat(收集) + Elasticsearch(存储, 搜索) + Kibana(展示)

**LogStash or Filebeat?**

因为**logstash是jvm跑的, 资源消耗比较大**, 所以后来作者**又用golang写了**一个功能较少但是资源消耗也小的轻量级的logstash-forwarder. 后来改名叫Filebeat.

![image-20220324003302290](https://s2.loli.net/2022/04/10/tqDcwlis3fRuCAO.png)

配置完后他会自动帮你捞日志 => 直接通过Kibana看就行啦! 

如何**配置**?

装好Filebeat => 修改filebeat.yml配置文件 => 

配置log目录位置, 配置es网络位置, Kibana网络位置