# Netty

![image-20220307141248376](https://s2.loli.net/2022/03/07/ysmIichpS6wuJgZ.png)

```java
public class ServerMain {
    /**
     * 应用主函数
     *
     * @param argArray 参数数组
     */
    static public void main(String[] argArray) {
        EventLoopGroup bossGroup   = new NioEventLoopGroup();// 这个是故事中的美女
        EventLoopGroup workerGroup = new NioEventLoopGroup();// 这个是故事中的服务生
        ServerBootstrap b = new ServerBootstrap();
        b.group(bossGroup, workerGroup);
        b.channel(NioServerSocketChannel.class);// 服务器信道的处理方式 => NIO
        b.childHandler(new ChannelInitializer<SocketChannel>() {// 客户端信道的处理器方式
            @Override
            protected void initChannel(SocketChannel ch) throws Exception {
                ch.pipeline().addLast(
                    new HttpServerCodec(), // Http 服务器编解码器
                    new HttpObjectAggregator(65535), // 内容长度限制
                    new WebSocketServerProtocolHandler("/websocket"), // WebSocket 协议处理器, 在这里处理握手、ping、pong 等消息
                    new GameMsgHandler() // 自定义的消息处理器
                );
            }
        });
        try {
            // 绑定 12345 端口,
            // 注意: 实际项目中会使用 argArray 中的参数来指定端口号
            ChannelFuture f = b.bind(12345).sync();

            if (f.isSuccess()) {
                System.out.println("服务器启动成功");
            }
            // 等待服务器信道关闭,
            // 也就是不要退出应用程序,
            // 让应用程序可以一直提供服务
            f.channel().closeFuture().sync();
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }
}
```



# ServerMain

加入log4j

```java
/**
 * 服务器入口类
 */
public class ServerMain {
    /**
     * 日志对象
     */
    static private final Logger LOGGER = LoggerFactory.getLogger(ServerMain.class);
    /**
     * 应用主函数
     *
     * @param argArray 参数数组
     */
    static public void main(String[] argArray) {
        CmdHandlerFactory.init();
        GameMsgRecognizer.init();
        EventLoopGroup bossGroup = new NioEventLoopGroup();   // 拉客的, 也就是故事中的美女
        EventLoopGroup workerGroup = new NioEventLoopGroup(); // 干活的, 也就是故事中的服务生
        ServerBootstrap b = new ServerBootstrap();
        b.group(bossGroup, workerGroup);
        b.channel(NioServerSocketChannel.class); // 服务器信道的处理方式
        b.childHandler(new ChannelInitializer<SocketChannel>() {
            @Override
            protected void initChannel(SocketChannel ch) throws Exception {
                ch.pipeline().addLast(
                    new HttpServerCodec(), // Http 服务器编解码器
                    new HttpObjectAggregator(65535), // 内容长度限制
                    new WebSocketServerProtocolHandler("/websocket"), // WebSocket 协议处理器, 在这里处理握手、ping、pong 等消息
                    new GameMsgDecoder(), // 自定义的消息解码器
                    new GameMsgEncoder(), // 自定义的消息编码器
                    new GameMsgHandler() // 自定义的消息处理器
                );
            }
        });
        try {
            // 绑定 12345 端口,
            // 注意: 实际项目中会使用 argArray 中的参数来指定端口号
            ChannelFuture f = b.bind(12345).sync();
            if (f.isSuccess()) {
                LOGGER.info("服务器启动成功!");
            }
            // 等待服务器信道关闭,
            // 也就是不要立即退出应用程序, 让应用程序可以一直提供服务
            f.channel().closeFuture().sync();
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }
}
```



# GameMsgDecoder

把消息头两个short解码之后 重新触发 ctx.fireChannelRead 解码

```java
public class GameMsgDecoder extends ChannelInboundHandlerAdapter {
    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {// 重写read消息的方法
        if (!(msg instanceof BinaryWebSocketFrame)) {
            return;// 如果不是二进制消息 就退出
        }
        // WebSocket 二进制消息会通过 HttpServerCodec 解码成 BinaryWebSocketFrame 类对象
        BinaryWebSocketFrame frame = (BinaryWebSocketFrame) msg;
        ByteBuf byteBuf = frame.content();
        byteBuf.readShort(); // 读取消息的长度 (读取消息长度 short两个字节 就是前两位 告诉解码器后面字节数组有几个数)
        int msgCode = byteBuf.readShort(); // 读取消息的编号 (告诉解码器消息是什么 =查表=> 枚举消息编号类MsgCode)
        // 拿到消息体
        byte[] msgBody = new byte[byteBuf.readableBytes()];
        byteBuf.readBytes(msgBody);
        GeneratedMessageV3 cmd = null;
        switch (msgCode) {
            case GameMsgProtocol.MsgCode.USER_ENTRY_CMD_VALUE:
                cmd = GameMsgProtocol.UserEntryCmd.parseFrom(msgBody);
                break;
            case GameMsgProtocol.MsgCode.WHO_ELSE_IS_HERE_CMD_VALUE:
                cmd = GameMsgProtocol.WhoElseIsHereCmd.parseFrom(msgBody);
                break;
            case GameMsgProtocol.MsgCode.USER_MOVE_TO_CMD_VALUE:
                cmd = GameMsgProtocol.UserMoveToCmd.parseFrom(msgBody);
                break;
        }
        if (null != cmd) {
            ctx.fireChannelRead(cmd);
        }
    }
}
```



客户端 ----->encode-------------------------->decode-----> 服务器

客户端 <-----decode<--------------------------encode<----- 服务器



# 实现客户端同步 如何广播新用户?

服务器如何推数据给客户端?

## 1. 把结果writeAndFlush到客户端信道数组

把返回_channelGroup.writeAndFlush(newResult);

```java
/**
 * 自定义的消息处理器
 */
public class GameMsgHandler extends SimpleChannelInboundHandler<Object> {
    /**
     * 客户端信道数组, 一定要使用 static, 否则无法实现群发
     */
    static private final ChannelGroup _channelGroup = new DefaultChannelGroup(GlobalEventExecutor.INSTANCE);
    /**
     * 用户字典
     */
    static private final Map<Integer, User> _userMap = new HashMap<>();
    @Override
    public void channelActive(ChannelHandlerContext ctx) throws Exception {
        super.channelActive(ctx);
        _channelGroup.add(ctx.channel());
    }
    @Override
    public void handlerRemoved(ChannelHandlerContext ctx) throws Exception {
        super.handlerRemoved(ctx);
        _channelGroup.remove(ctx.channel());
        // 先拿到用户 Id
        Integer userId = (Integer)ctx.channel().attr(AttributeKey.valueOf("userId")).get();
        if (null == userId) {
            return;
        }
        _userMap.remove(userId);
        GameMsgProtocol.UserQuitResult.Builder resultBuilder = GameMsgProtocol.UserQuitResult.newBuilder();
        resultBuilder.setQuitUserId(userId);
        GameMsgProtocol.UserQuitResult newResult = resultBuilder.build();
        _channelGroup.writeAndFlush(newResult);
    }
    @Override
    protected void channelRead0(ChannelHandlerContext ctx, Object msg) throws Exception {
        System.out.println("收到客户端消息, msgClazz = " + msg.getClass().getName() + ", msg = " + msg);
        if (msg instanceof GameMsgProtocol.UserEntryCmd) {
            // 从指令对象中获取用户 Id 和英雄形象
            GameMsgProtocol.UserEntryCmd cmd = (GameMsgProtocol.UserEntryCmd) msg;
            int userId = cmd.getUserId();
            String heroAvatar = cmd.getHeroAvatar();
            GameMsgProtocol.UserEntryResult.Builder resultBuilder = GameMsgProtocol.UserEntryResult.newBuilder();
            resultBuilder.setUserId(userId);
            resultBuilder.setHeroAvatar(heroAvatar);
            // 将用户加入字典
            User newUser = new User();
            newUser.userId = userId;
            newUser.heroAvatar = heroAvatar;
            _userMap.put(newUser.userId, newUser);
            // 将用户 Id 附着到 Channel
            ctx.channel().attr(AttributeKey.valueOf("userId")).set(userId);
            // 构建结果并发送
            GameMsgProtocol.UserEntryResult newResult = resultBuilder.build();
            _channelGroup.writeAndFlush(newResult);
        } else if (msg instanceof GameMsgProtocol.WhoElseIsHereCmd) {
            GameMsgProtocol.WhoElseIsHereResult.Builder resultBuilder = GameMsgProtocol.WhoElseIsHereResult.newBuilder();
            for (User currUser : _userMap.values()) {
                if (null == currUser) {
                    continue;
                }
                GameMsgProtocol.WhoElseIsHereResult.UserInfo.Builder userInfoBuilder = GameMsgProtocol.WhoElseIsHereResult.UserInfo.newBuilder();
                userInfoBuilder.setUserId(currUser.userId);
                userInfoBuilder.setHeroAvatar(currUser.heroAvatar);
                resultBuilder.addUserInfo(userInfoBuilder);
            }
            GameMsgProtocol.WhoElseIsHereResult newResult = resultBuilder.build();
            ctx.writeAndFlush(newResult);
        } else if (msg instanceof GameMsgProtocol.UserMoveToCmd) {
            Integer userId = (Integer)ctx.channel().attr(AttributeKey.valueOf("userId")).get();
            if (null == userId) {
                return;
            }
            GameMsgProtocol.UserMoveToCmd cmd = (GameMsgProtocol.UserMoveToCmd)msg;
            GameMsgProtocol.UserMoveToResult.Builder resultBuilder = GameMsgProtocol.UserMoveToResult.newBuilder();
            resultBuilder.setMoveUserId(userId);
            resultBuilder.setMoveToPosX(cmd.getMoveToPosX());
            resultBuilder.setMoveToPosY(cmd.getMoveToPosY());
            GameMsgProtocol.UserMoveToResult newResult = resultBuilder.build();
            _channelGroup.writeAndFlush(newResult);
        }
    }
}
```

## 2. 准备把刚才的信道编码 返回result











# 保存首次登陆时的用户id

把userid附着到channel上

hashmap 保存

长连接 保证movetoresult返回到正确的用户



https://mote.fyi/djkusyr

# 用户quitresult

修补客户端退出公屏不消失该人物的bug



# 主流程



HTTP => Netty => channel(NIO) => 

decoder(protobuf) => 业务流程 => encoder(protobuf) => MsgHandler => 

channel(NIO) => Netty => HTTP





**Http 服务器编解码器**

new HttpServerCodec()

**内容长度限制**

new HttpObjectAggregator(65535)

**WebSocket 协议处理器, 在这里处理握手、ping、pong 等消息**

new WebSocketServerProtocolHandler("/websocket")

**自定义的消息解码器**

new GameMsgDecoder()

**自定义的消息编码器**

new GameMsgEncoder()

**自定义的消息处理器**

new GameMsgHandler()



# 优化

## 把ChannelGroup分离出来单独类-Broadcaster类



## 把User操作拿出来放到UserManager类



## 把client发来的不同指令放到不同的函数里边儿去

if else 太多 看起来很丑 => 函数封装

## 把不同的函数放到不同的Handler类里边儿



## 设计接口: 不同的类都实现了ICmdHandler接口

```java
public interface ICmdHandler<TCmd extends GeneratedMessageV3> {
    /**
     * 处理client cmd
     * @param ctx
     * @param cmd
     */
    void handle(ChannelHandlerContext ctx, TCmd cmd);
}
```



### 通过判断不同instanceof 创建相应的Handler类实例

```java
ICmdHandler<? extends GeneratedMessageV3> cmdHandler = null;

if (msg instanceof GameMsgProtocol.UserEntryCmd) { // 用户节点模块
    cmdHandler = new UserEntryCmdHandler();
} else if (msg instanceof GameMsgProtocol.WhoElseIsHereCmd) { // 同步人物模块
    cmdHandler = new WhoElseIsHereCmdHandler();
} else if (msg instanceof GameMsgProtocol.UserMoveToCmd) { // 移动模块
    cmdHandler = new UserMoveToCmdHandler();
}
if (cmdHandler != null) {
    cmdHandler.handle(ctx, cast(msg));
}
```

### 然后 cmdHandler.handle(ctx, cast(msg));

cast是啥?

转型 => 把msg搞成泛型传回去  就不用转成指定特定的消息类型了



## 设计CmdHandlerFactory工厂类

new什么样的Handler我不管 我直接丢给工厂







# 把登陆 查库的逻辑 异步化!

就是把查库送去另一个线程(asyncOp.doAsync();)
让他查库, 查完之后, 回调函数继续执行逻辑(doFinish).

防止主厨师出来传菜 => 查库就是传菜 => 防止主线程去查库

## 异步优缺点

参考: http://t.csdn.cn/JAdYo

**优点**

1) I/O受限 => 异步能提高性能
2) 增强系统健壮性  
3) 改善用户体验 => (减少其他用户的响应时间)

**缺点**

1) 滥用异步, 会影响性能
2) 增加编程难度   

**异步实现**

1. 专用线程

   ```java
   System.Threading.ThreadStart ts = new System.Threading.ThreadStart(void(object state) target);   
   System.Threading.Thread th = new System.Threading.Thread(ts);   
   ts.Start();   
   ```

   调用 Start()方法之前, 并没有实质性得创建线程资源, 而是 Start()后才进行创建, 此种方式的好
   处在于能设置线程是前台线程还是后台线程, 并且能控制线程的挂起和消亡   

2. 线程池

   ```java
   // 都是后台线程
   ThreadPool.QueueUserWorkItem(WaitCallback callback) 
   ```


3. 使用异步编程模型 

   ```java
   BeginXXX(…IAsyCallBack callback, object asyState); 
   EndXXX(IAsyState ar); //这种模型的好处上面已经有所阐述
   ```


4) 使用 BackgroundWorker
.Net2.0 下提供了 BackgroundWorker, 使用它可以轻易的完成异步操作, 并且它还有一些功能
上的加强, 比如取消操作



# if-continue代码风格非常优美(for循环内)

循环中if-continue写法可以**减少主逻辑代码的缩进**，==**代码美观度**==稍好一点，代价是判断逻辑要取反，不太直观。

```java
for (GameMsgProtocol.MsgCode msgCode : GameMsgProtocol.MsgCode.values()) {
    String strMsgCode = msgCode.name();
    strMsgCode = strMsgCode.replaceAll("_", ""); // 把下划线干没
    strMsgCode = strMsgCode.toLowerCase();
    if (!strMsgCode.startsWith(clazzName)) { // 没匹配上
        continue;
    }
    // 后续业务逻辑
    // ......
}
```

