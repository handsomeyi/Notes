# 如何实现工厂模式



![image-20220409110842201](https://s2.loli.net/2022/04/09/dNeBSiLovjJwIsV.png)

咱们这个CmdHandlerFactory 用的是通过if else判断 instance of 来决定返回某种类型的handler
后来发现咱们可以用一个HashMap来存放

```java
// 更快, 性能优良, O(1)的复杂度拿到相应cmdHandler
new HashMap<Class<?>, IcmdHandler<? extends GeneratedMessageV3>>
```



```java
public final class CmdHandlerFactory {
    // handlerMap字典
    // key为消息类, value为消息处理器 => _handlerMap<消息类,实现类>
    static private Map<Class<?>, ICmdHandler<? extends GeneratedMessageV3>> _handlerMap = new HashMap<>();
    // 私有类构造器
    private CmdHandlerFactory() {
    }
    // 初始化处理器 handlerMap
    static public void init() {
        _handlerMap.put(GameMsgProtocol.UserEntryCmd.class, new UserEntryCmdHandler());
        _handlerMap.put(GameMsgProtocol.WhoElseIsHereCmd.class, new WhoElseIsHereCmdHandler());
        _handlerMap.put(GameMsgProtocol.UserMoveToCmd.class, new UserMoveToCmdHandler());
    }
    // 根据msg的Class类型 从 {@_handlerMap} 里面直接取
    static public ICmdHandler<? extends GeneratedMessageV3> create(Class<?> msgClazz) {
        if (msgClazz == null) return null;
        return _handlerMap.get(msgClazz);
    }
}
```