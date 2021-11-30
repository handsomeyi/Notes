

# 实现ZooKeeper中Watch&CallBack

## 结构图

<img src="https://raw.githubusercontent.com/handsomeyi/Pics/master/%E7%90%86%E8%A7%A3ZooKeeper%E4%B8%AD%E7%9A%84Watch%26CallBack.png" alt="理解ZooKeeper中的Watch&CallBack"  />

## 代码

```java
/*
 * @Auther:deeys
 * @Date:2021/10/13
 * @Version:1.0
 */
public class App {
    public static void main(String[] args) throws Exception {
        System.out.println("Hello ZooKeeper!");
        final CountDownLatch cd = new CountDownLatch(1);
        final Stat stat = new Stat();
        final String connectString = "192.168.203.100:2181,192.168.203.112:2181,192.168.203.113:2181,192.168.203.114:2181";
        ZooKeeper zk = new ZooKeeper(connectString, 3000, event -> {
            Watcher.Event.KeeperState state = event.getState();
            Watcher.Event.EventType type = event.getType();
            String path = event.getPath();
            System.out.println("new zk watch: "+ event.toString());

            switch (state) {
                case Unknown:
                case Disconnected:
                case NoSyncConnected:
                case AuthFailed:
                case ConnectedReadOnly:
                case SaslAuthenticated:
                case Expired:
                    break;
                case SyncConnected:
                    System.out.println("connected");
                    cd.countDown();
                    break;
            }

            switch (type) {
                case None:
                case NodeCreated:
                case NodeDeleted:
                case NodeDataChanged:
                case NodeChildrenChanged:
                    break;
            }
        });
        cd.await();
        ZooKeeper.States state = zk.getState();
        switch (state) {
            case CONNECTING:
                System.out.println("connecting......");
                break;
            case ASSOCIATING:
            case CONNECTEDREADONLY:
            case CLOSED:
            case AUTH_FAILED:
            case NOT_CONNECTED:
                break;
            case CONNECTED:
                System.out.println("connected........");
                break;
        }
        String xoxo = zk.create("/xoxo", "AppTest".getBytes(), ZooDefs.Ids.OPEN_ACL_UNSAFE, CreateMode.EPHEMERAL);//创建临时节点
        System.out.println("node name: " + xoxo);

        //首次getData
        byte[] data = zk.getData("/xoxo", new Watcher() {
            @Override
            public void process(WatchedEvent event) {
                try {
                    zk.getData("/xoxo", this, stat);
                } catch (KeeperException e) {
                    e.printStackTrace();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }, stat);
        System.out.println("old data = " + new  String(data));

        zk.setData("/xoxo", "NewData".getBytes(), -1);//触发回调

        zk.getData("/xoxo", false, new AsyncCallback.DataCallback() {
            @Override//异步回调
            public void processResult(int rc, String path, Object ctx, byte[] data, Stat stat) {
                System.out.println("new data = " + new String(data));
            }
        }, "a ctx");
        Thread.sleep(10000);
    }
}
```

























