# MySQL锁简介

**MyISAM MEMORY** => **表级锁**

**InnoDB** => **行级锁 表级锁 都支持**

**表级锁：**开销小, 加锁快; 不会出现死锁; 锁定粒度大, 发生锁冲突的概率最高, 并发度最低
**行级锁：**开销大, 加锁慢; 会出现死锁; 锁定粒度最小, 发生锁冲突的概率最低, 并发度也最高.   



# ACID

**Atomicity原子性:** 

表示不可分割, 一个操作集合要么==全部成功, 要么全部失败==, 不可以从中间做切分

**Consistency一致性: **

最终是为了保证数据的一致性, 当经过N多个操作之后, 数据的状态不会改变(转账)从一个一致性状态到另一个一致状态, 也就是==数据不可以发生错乱==

**Isolation隔离性: **

各个事务之间相关不会产生影响, (隔离级别)严格的隔离性会导致效率降低, 在某些情况下为了提高程序的执行效率, 需要降低隔离的级别
隔离级别：
	**读未提交**
	**读已提交**
	**可重复读**
	**序列化**
数据不一致的问题：
	**脏读**
	**不可重复读**
	**幻读**

**Durability持久性: **

所有数据的修改都必须要持久化到存储介质中, 不会因为应用程序的关闭而导致数据丢失

# 事务的操作

**事务的结束**
  1. 正常的commit（使数据修改生效）或者rollback（将数据恢复到上一个状态）
  2. 自动提交, 但是一般情况下要将自动提交进行关闭, 效率太低
  3. 用户关闭会话之后, 会自动提交事务
  4. 系统崩溃或者断电的时候回回滚事务, 也就是将数据恢复到上一个状态

**事务存档**

```sql
--savepoint  保存点(存档?)
--当一个操作集合中包含多条SQL语句, 但是只想让其中某部分成功, 某部分失败, 此时可以使用保存点
--此时如果需要回滚到某一个状态的话使用 rollback to sp1;
delete from emp where empno = 1111;
delete from emp where empno = 2222;
savepoint sp1;
delete from emp where empno = 1234;
rollback to sp1;
commit;
```

# 脏读 不可重复读 幻读

**脏读**： 一个事务正在对一条记录做修改, 在这个事务并提交前, 这条记录的数据就处于不一致状态; 这时, 另一个事务也来读取同一条记录, 如果不加控制, 第二个事务读取了这些“脏”的数据, 并据此做进一步的处理, 就会产生未提交的数据依赖关系. 这种现象被形象地叫做“脏读” 

**不可重复读**：一个事务在读取某些数据已经发生了改变、或某些记录已经被删除了！这种现象叫做“不可重复读”.  

**幻读**： 一个事务按相同的查询条件重新读取以前检索过的数据, 却发现其他事务插入了满足其查询条件的新数据, 这种现象就称为“幻读” 

|                            | 脏读 | 不可重复读 | 幻读 |
| :------------------------: | :--: | :--------: | :--: |
| 读未提交-read uncommitted  |  √   |     √      |  √   |
|  读已提交-read committed   |      |     √      |  √   |
| 不可重复读-repeatable read |      |            |  √   |
|    序列化-serializable     |      |            |      |

**3、InnoDB的行锁模式及加锁方法**

​		**共享锁（s）**：又称读锁. 允许一个事务去读一行, 阻止其他事务获得相同数据集的排他锁. 若事务T对数据对象A加上S锁, 则事务T可以读A但不能修改A, 其他事务只能再对A加S锁, 而不能加X锁, 直到T释放A上的S锁. 这保证了其他事务可以读A, 但在T释放A上的S锁之前不能对A做任何修改. 
​		**排他锁（x）**：又称写锁. 允许获取排他锁的事务更新数据, 阻止其他事务取得相同的数据集共享读锁和排他写锁. 若事务T对数据对象A加上X锁, 事务T可以读A也可以修改A, 其他事务不能再对A加任何锁, 直到T释放A上的锁. 

​		mysql InnoDB引擎默认的修改数据语句：**update,delete,insert都会自动给涉及到的数据加上排他锁, select语句默认不会加任何锁类型**, 如果加排他锁可以使用select …for update语句, 加共享锁可以使用select … lock in share mode语句. **所以加过排他锁的数据行在其他事务种是不能修改数据的, 也不能通过for update和lock in share mode锁的方式查询数据, 但可以直接通过select …from…查询数据, 因为普通查询没有任何锁机制. ** 

**InnoDB行锁实现方式**

​		InnoDB行锁是通过给**索引**上的索引项加锁来实现的, 这一点MySQL与Oracle不同, 后者是通过在数据块中对相应数据行加锁来实现的. InnoDB这种行锁实现特点意味着：只有通过索引条件检索数据, InnoDB才使用行级锁, **否则, InnoDB将使用表锁！**  

1、在不通过索引条件查询的时候, innodb使用的是表锁而不是行锁

```sql
create table tab_no_index(id int,name varchar(10)) engine=innodb;
insert into tab_no_index values(1,'1'),(2,'2'),(3,'3'),(4,'4');
```

|                           session1                           |                           session2                           |
| :----------------------------------------------------------: | :----------------------------------------------------------: |
| set autocommit=0<br />select * from tab_no_index where id = 1; | set autocommit=0<br />select * from tab_no_index where id =2 |
|      select * from tab_no_index where id = 1 for update      |                                                              |
|                                                              |     select * from tab_no_index where id = 2 for update;      |

session1只给一行加了排他锁, 但是session2在请求其他行的排他锁的时候, 会出现锁等待. 原因是在没有索引的情况下, innodb只能使用表锁. 

2、创建带索引的表进行条件查询, innodb使用的是行锁

```sql
create table tab_with_index(id int,name varchar(10)) engine=innodb;
alter table tab_with_index add index id(id);
insert into tab_with_index values(1,'1'),(2,'2'),(3,'3'),(4,'4');
```

|                           session1                           |                           session2                           |
| :----------------------------------------------------------: | :----------------------------------------------------------: |
| set autocommit=0<br />select * from tab_with_indexwhere id = 1; | set autocommit=0<br />select * from tab_with_indexwhere id =2 |
|     select * from tab_with_indexwhere id = 1 for update      |                                                              |
|                                                              |     select * from tab_with_indexwhere id = 2 for update;     |

3、由于mysql的行锁是针对索引加的锁, 不是针对记录加的锁, 所以虽然是访问不同行的记录, 但是依然无法访问到具体的数据

```sql
insert into tab_with_index  values(1,'4');
```

|                           session1                           |                           session2                           |
| :----------------------------------------------------------: | :----------------------------------------------------------: |
|                       set autocommit=0                       |                       set autocommit=0                       |
| select * from tab_with_index where id = 1 and name='1' for update |                                                              |
|                                                              | select * from tab_with_index where id = 1 and name='4' for update<br />虽然session2访问的是和session1不同的记录, 但是因为使用了相同的索引, 所以需要等待锁 |

### 总结

**对于MyISAM的表锁, 主要讨论了以下几点：** 
（1）共享读锁（S）之间是兼容的, 但共享读锁（S）与排他写锁（X）之间, 以及排他写锁（X）之间是互斥的, 也就是说读和写是串行的.   
（2）在一定条件下, MyISAM允许查询和插入并发执行, 我们可以利用这一点来解决应用中对同一表查询和插入的锁争用问题.  
（3）MyISAM默认的锁调度机制是写优先, 这并不一定适合所有应用, 用户可以通过设置LOW_PRIORITY_UPDATES参数, 或在INSERT、UPDATE、DELETE语句中指定LOW_PRIORITY选项来调节读写锁的争用.  
（4）由于表锁的锁定粒度大, 读写之间又是串行的, 因此, 如果更新操作较多, MyISAM表可能会出现严重的锁等待, 可以考虑采用InnoDB表来减少锁冲突. 

**对于InnoDB表, 本文主要讨论了以下几项内容：** 
（1）InnoDB的行锁是基于索引实现的, 如果不通过索引访问数据, InnoDB会使用表锁.  
（2）在不同的隔离级别下, InnoDB的锁机制和一致性读策略不同. 

在了解InnoDB锁特性后, 用户可以通过设计和SQL调整等措施减少锁冲突和死锁, 包括：

- 尽量使用较低的隔离级别;  精心设计索引, 并尽量使用索引访问数据, 使加锁更精确, 从而减少锁冲突的机会; 
- 选择合理的事务大小, 小事务发生锁冲突的几率也更小; 
- 给记录集显式加锁时, 最好一次性请求足够级别的锁. 比如要修改数据的话, 最好直接申请排他锁, 而不是先申请共享锁, 修改时再请求排他锁, 这样容易产生死锁; 
- 不同的程序访问一组表时, 应尽量约定以相同的顺序访问各表, 对一个表而言, 尽可能以固定的顺序存取表中的行. 这样可以大大减少死锁的机会; 
- 尽量用相等条件访问数据, 这样可以避免间隙锁对并发插入的影响;  不要申请超过实际需要的锁级别; 除非必须, 查询时不要显示加锁; 
- 对于一些特定的事务, 可以使用表锁来提高处理速度或减少死锁的可能. 

