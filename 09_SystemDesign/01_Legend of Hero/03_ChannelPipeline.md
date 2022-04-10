

```java
io.netty.channel public interface ChannelPipeline
extends ChannelInboundInvoker, ChannelOutboundInvoker, Iterable<Map.Entry<String, ChannelHandler>>
处理或拦截Channel入站事件和出站操作的ChannelHandler的列表。 ChannelPipeline实现了一种高级形式的拦截过滤器 模式，使用户可以完全控制事件的处理方式以及管道中的ChannelHandler如何相互交互。
管道的创建
每个通道都有自己的管道，并在创建新通道时自动创建。
事件如何在管道中流动
下图描述了ChannelPipeline ChannelHandler通常如何处理 I/O 事件。 I/O 事件由ChannelInboundHandler或ChannelOutboundHandler处理，并通过调用ChannelHandlerContext定义的事件传播方法ChannelHandlerContext.fireChannelRead(Object)例如ChannelHandlerContext.fireChannelRead(Object)和ChannelHandlerContext.write(Object)转发到其最近的处理程序。
```

![image-20220308004159472](https://s2.loli.net/2022/03/08/oUKG7vFtcHZbaV8.png)

```java
入站事件由入站处理程序按自下而上的方向处理，如图左侧所示。 入站处理程序通常处理由图底部的 I/O 线程生成的入站数据。 入站数据通常是通过实际输入操作（例如SocketChannel.read(ByteBuffer)从远程对等方读取的。 如果入站事件超出了顶级入站处理程序，则它会被静默丢弃，或者在需要您注意时将其记录下来。
出站事件由出站处理程序按自上而下的方向处理，如图右侧所示。 出站处理程序通常会生成或转换出站流量，例如写入请求。 如果出站事件超出了底部出站处理程序，则由与Channel关联的 I/O 线程处理。 I/O 线程经常执行实际的输出操作，例如SocketChannel.write(ByteBuffer) 。
例如，假设我们创建了以下管道：
   ChannelPipeline p = ...;
   p.addLast("1", new InboundHandlerA());
   p.addLast("2", new InboundHandlerB());
   p.addLast("3", new OutboundHandlerA());
   p.addLast("4", new OutboundHandlerB());
   p.addLast("5", new InboundOutboundHandlerX());

在上面的示例中，名称以Inbound开头的类表示它是一个入站处理程序。 名称以Outbound开头的类表示它是一个出站处理程序。
在给定的示例配置中，当事件进入时，处理程序评估顺序为 1、2、3、4、5。 当事件出站时，顺序为ChannelPipeline 。在此原则之上， ChannelPipeline跳过某些处理程序的评估以缩短堆栈深度：
3 和 4 没有实现ChannelInboundHandler ，因此入站事件的实际评估顺序将是：1、2 和 5。
1 和 2 没有实现ChannelOutboundHandler ，因此出站事件的实际评估顺序将是： ChannelOutboundHandler和 3。
如果 5 同时实现ChannelInboundHandler和ChannelOutboundHandler ，则入站和出站事件的评估顺序可能分别为 125 和 543。
将事件转发到下一个处理程序
正如您在图中可能注意到的那样，处理程序必须调用ChannelHandlerContext的事件传播方法才能将事件转发到其下一个处理程序。 这些方法包括：
入站事件传播方法：
ChannelHandlerContext.fireChannelRegistered()
ChannelHandlerContext.fireChannelActive()
ChannelHandlerContext.fireChannelRead(Object)
ChannelHandlerContext.fireChannelReadComplete()
ChannelHandlerContext.fireExceptionCaught(Throwable)
ChannelHandlerContext.fireUserEventTriggered(Object)
ChannelHandlerContext.fireChannelWritabilityChanged()
ChannelHandlerContext.fireChannelInactive()
ChannelHandlerContext.fireChannelUnregistered()
出站事件传播方法：
ChannelHandlerContext.bind(SocketAddress, ChannelPromise)
ChannelHandlerContext.connect(SocketAddress, SocketAddress, ChannelPromise)
ChannelHandlerContext.write(Object, ChannelPromise)
ChannelHandlerContext.flush()
ChannelHandlerContext.read()
ChannelHandlerContext.disconnect(ChannelPromise)
ChannelHandlerContext.close(ChannelPromise)
ChannelHandlerContext.deregister(ChannelPromise)
以下示例显示了事件传播通常是如何完成的：
   public class MyInboundHandler extends ChannelInboundHandlerAdapter {
        @Override
       public void channelActive(ChannelHandlerContext ctx) {
           System.out.println("Connected!");
           ctx.fireChannelActive();
       }
   }

   public class MyOutboundHandler extends ChannelOutboundHandlerAdapter {
        @Override
       public void close(ChannelHandlerContext ctx, ChannelPromise promise) {
           System.out.println("Closing ..");
           ctx.close(promise);
       }
   }

建立管道
用户应该在管道中有一个或多个ChannelHandler来接收 I/O 事件（例如读取）和请求 I/O 操作（例如写入和关闭）。 例如，典型的服务器将在每个通道的管道中具有以下处理程序，但您的里程可能会因协议和业务逻辑的复杂性和特征而异：
协议解码器 - 将二进制数据（例如ByteBuf ）转换为 Java 对象。
协议编码器 - 将 Java 对象转换为二进制数据。
业务逻辑处理程序 - 执行实际的业务逻辑（例如数据库访问）。
它可以表示为如下例所示：
   static final EventExecutorGroup group = new DefaultEventExecutorGroup(16);
   ...

   ChannelPipeline pipeline = ch.pipeline();

   pipeline.addLast("decoder", new MyProtocolDecoder());
   pipeline.addLast("encoder", new MyProtocolEncoder());

   // Tell the pipeline to run MyBusinessLogicHandler's event handler methods
   // in a different thread than an I/O thread so that the I/O thread is not blocked by
   // a time-consuming task.
   // If your business logic is fully asynchronous or finished very quickly, you don't
   // need to specify a group.
   pipeline.addLast(group, "handler", new MyBusinessLogicHandler());

线程安全
ChannelHandler可以随时添加或删除，因为ChannelPipeline是线程安全的。 例如，您可以在即将交换敏感信息时插入加密处理程序，并在交换后将其删除。
  Maven: io.netty:netty-all:4.1.43.Final
```

















