官方：

```text
https://www.codingapi.com/docs/txlcn-setting-distributed/
```



# TM

协调器。

## pom

```xml
<!--tm-->
        <!-- tm  manager -->
        <dependency>
            <groupId>com.codingapi.txlcn</groupId>
            <artifactId>txlcn-tm</artifactId>
            <version>5.0.2.RELEASE</version>
        </dependency>

        <dependency>
            <groupId>com.codingapi.txlcn</groupId>
            <artifactId>txlcn-tc</artifactId>
            <version>5.0.2.RELEASE</version>
        </dependency>
        <dependency>
            <groupId>com.codingapi.txlcn</groupId>
            <artifactId>txlcn-txmsg-netty</artifactId>
            <version>5.0.2.RELEASE</version>
        </dependency>
        <!--tm-->
```

## yml

```yml
# TM事务管理器的服务端WEB访问端口。提供一个可视化的界面。端口自定义。
server.port=7970

# TM事务管理器，需要访问数据库，实现分布式事务状态记录。
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.url=jdbc:mysql://localhost:3306/tx-manager?characterEncoding=UTF-8&serverTimezone=Asia/Shanghai
spring.datasource.username=root
spring.datasource.password=root

# TM事务管理器，是依赖Redis使用分布式事务协调的。尤其是TCC和TXC两种事务模型。
spring.redis.host=127.0.0.1
spring.redis.port=6379
spring.redis.database=0

# 为spring应用起名。
spring.application.name=tx-lcn-transaction-manager

# TM事务管理器，提供的WEB管理平台的登录密码。无用户名。 默认是codingapi
tx-lcn.manager.admin-key=msb
# 日志。如果需要TM记录日志。则开启，赋值为true，并提供后续的配置。
tx-lcn.logger.enabled=true

# 为日志功能，提供数据库连接。和之前配置的分布式事务管理依赖使用的数据源不同。
tx-lcn.logger.driver-class-name=com.mysql.cj.jdbc.Driver
tx-lcn.logger.jdbc-url=jdbc:mysql://localhost:3306/tx-manager?characterEncoding=UTF-8&serverTimezone=Asia/Shanghai
tx-lcn.logger.username=root
tx-lcn.logger.password=root
```



## java

启动类

```java
@EnableTransactionManagerServer
```



业务类

```java
tm 没有业务类。
```



# TC

## pom

```xml
<!-- lcn -->
        <dependency>
            <groupId>com.codingapi.txlcn</groupId>
            <artifactId>txlcn-tc</artifactId>
            <version>5.0.2.RELEASE</version>
        </dependency>

        <dependency>
            <groupId>com.codingapi.txlcn</groupId>
            <artifactId>txlcn-txmsg-netty</artifactId>
            <version>5.0.2.RELEASE</version>
        </dependency>
```

## yml

```yml

tx-lcn:
  client:
    manager-address: 127.0.0.1:8070  # tm地址
```



## 启动类

```java
@EnableDistributedTransaction
```

## 业务类

```java
@LcnTransaction
```



----

上节课 tm单体。

# TM集群

## tm

启动多个。没啥。



## tc

```yml
tx-lcn:
  client:
    manager-address: 127.0.0.1:8071,127.0.0.1:8072
```



# tcc

