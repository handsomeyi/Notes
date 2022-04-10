# Seata

# eureka

启动



## 搭建TC

1. 下载 seata-server

   ```html
   http://seata.io/zh-cn/blog/download.html
   ```

   

2. 修改配置。

   registry.conf

   ```yml
   注册中心 eureka
   
   配置中心 file
   ```

   

   file.conf

   ```yml
   服务信息
   存储
   
   注意：jdbc驱动。
   
   jar包：xml里：2，开发不需要知道线上敏感信息。
   
   
   ```

   

![image-20200820202436708](C:\Users\CPF\AppData\Roaming\Typora\typora-user-images\image-20200820202436708.png)



# setat-server-db

自己建库，自己建表。

数据库名和 file.conf中一致。

```sql
分支事务表
CREATE TABLE `branch_table` (
  `branch_id` bigint(20) NOT NULL,
  `xid` varchar(128) NOT NULL,
  `transaction_id` bigint(20) DEFAULT NULL,
  `resource_group_id` varchar(32) DEFAULT NULL,
  `resource_id` varchar(256) DEFAULT NULL,
  `branch_type` varchar(8) DEFAULT NULL,
  `status` tinyint(4) DEFAULT NULL,
  `client_id` varchar(64) DEFAULT NULL,
  `application_data` varchar(2000) DEFAULT NULL,
  `gmt_create` datetime(6) DEFAULT NULL,
  `gmt_modified` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`branch_id`),
  KEY `idx_xid` (`xid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

全局事务表
CREATE TABLE `global_table` (
  `xid` varchar(128) NOT NULL,
  `transaction_id` bigint(20) DEFAULT NULL,
  `status` tinyint(4) NOT NULL,
  `application_id` varchar(32) DEFAULT NULL,
  `transaction_service_group` varchar(32) DEFAULT NULL,
  `transaction_name` varchar(128) DEFAULT NULL,
  `timeout` int(11) DEFAULT NULL,
  `begin_time` bigint(20) DEFAULT NULL,
  `application_data` varchar(2000) DEFAULT NULL,
  `gmt_create` datetime DEFAULT NULL,
  `gmt_modified` datetime DEFAULT NULL,
  PRIMARY KEY (`xid`),
  KEY `idx_gmt_modified_status` (`gmt_modified`,`status`),
  KEY `idx_transaction_id` (`transaction_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


全局锁
CREATE TABLE `lock_table` (
  `row_key` varchar(128) NOT NULL,
  `xid` varchar(96) DEFAULT NULL,
  `transaction_id` bigint(20) DEFAULT NULL,
  `branch_id` bigint(20) NOT NULL,
  `resource_id` varchar(256) DEFAULT NULL,
  `table_name` varchar(32) DEFAULT NULL,
  `pk` varchar(36) DEFAULT NULL,
  `gmt_create` datetime DEFAULT NULL,
  `gmt_modified` datetime DEFAULT NULL,
  PRIMARY KEY (`row_key`),
  KEY `idx_branch_id` (`branch_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



```







## TM

one

db：seata-rm-one

业务：插入tbl_one



下面两个配置，不配置也行，走默认8091。

registry.conf

file.conf



pom

```xml
<dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-alibaba-seata</artifactId>
            <version>2.2.0.RELEASE</version>
        </dependency>
```



注解：

```java
@GlobalTransactional(rollbackFor = Exception.class)
```



undo log

```sql
CREATE TABLE `undo_log` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `branch_id` bigint(20) NOT NULL,
  `xid` varchar(100) NOT NULL,
  `context` varchar(128) NOT NULL,
  `rollback_info` longblob NOT NULL,
  `log_status` int(11) NOT NULL,
  `log_created` datetime NOT NULL,
  `log_modified` datetime NOT NULL,
  `ext` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_undo_log` (`xid`,`branch_id`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8;


```

d

## RM

two

db：seata-rm-two

业务：插入tbl_two

下面两个配置，不配置也行，走默认8091。

registry.conf

file.conf

pom

```xml
<dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-alibaba-seata</artifactId>
            <version>2.2.0.RELEASE</version>
        </dependency>
```







three

db：seata-rm-three

业务：插入tbl_three

下面两个配置，不配置也行，走默认8091。

registry.conf

file.conf

pom

```xml
<dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-alibaba-seata</artifactId>
            <version>2.2.0.RELEASE</version>
        </dependency>
```





undo log

```sql
CREATE TABLE `undo_log` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `branch_id` bigint(20) NOT NULL,
  `xid` varchar(100) NOT NULL,
  `context` varchar(128) NOT NULL,
  `rollback_info` longblob NOT NULL,
  `log_status` int(11) NOT NULL,
  `log_created` datetime NOT NULL,
  `log_modified` datetime NOT NULL,
  `ext` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_undo_log` (`xid`,`branch_id`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8;


```



# 脚本

```html
https://github.com/seata/seata/tree/1.2.0/script
```





# TCC

1. tcc

   ```java
   @LocalTCC
   public interface RmOneInterface {
   	// 制定  confirm  和 cancel
       @TwoPhaseBusinessAction(name = "rm1TccAction" , commitMethod = "rm1Commit" ,rollbackMethod = "rm1Rollback")
       public String rm1(BusinessActionContext businessActionContext);
   
       public boolean rm1Commit(BusinessActionContext businessActionContext);
   
       public boolean rm1Rollback(BusinessActionContext businessActionContext);
   }
   ```

   





try，confirm，cancel 中独立事务。通过业务回滚。

此时不用undo.log表了。



**tcc场景：（!（支持acid事务的关系型数据库） 和 xxx  ）。**



1.混合场景。2。独立场景。







# 源码方法

seata 源码：黄师傅 五期源码课里有。



spring boot方法。找spring.factories



从 日志 中 看执行流程。全局去搜 关键字。



---



10年内 | 近两家



---

|        | 2pc  | tcc  | 消息队列 |      |
| ------ | ---- | ---- | -------- | ---- |
| 一致性 | 强   | 最终 | 最终     |      |
| 吞吐量 | 低   | 中等 | 高       |      |
| 复杂度 | 简单 | 复杂 | 中等     |      |







seata锁的是什么？

