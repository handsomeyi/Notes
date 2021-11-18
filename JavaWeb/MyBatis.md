# Problem

**Need to set ‘serverTimezone‘ property.**

https://blog.csdn.net/weixin_45812770/article/details/107996966 



**解决xml编码问题：1 字节的 UTF-8 序列的字节 1 无效**

https://www.cnblogs.com/thetree/p/12991403.html

# MyBatis简介

- MyBatis 是一款优秀的**持久层框架**

- MyBatis 避免了**几乎所有的 JDBC 代码和手动设置参数以及获取结果集的过程**

- MyBatis 可以**使用简单的 XML 或注解来配置和映射原生信息**，将接口和 Java 的 实体类 

  【PlainOld Java Objects,普通的 Java对象】映射成数据库中的记录。

## 持久化

持久化是将程序**数据在持久状态和瞬时状态间转换的机制**。

为什么需要持久化服务呢？内存掉电易失

## 持久层

持久层就是: 完成持久化工作的代码块 . ----> dao层 【DAO (Data Access Object) 数据访问对象】



## Why Mybatis?

- 使得: [数据存入数据库中 , 和从数据库中取数据] 变得简单

- 减少重复代码, 如数据取出时的封装 , 数据库的建立连接等等

- MyBatis 是一个半自动化的ORM框架 (Object Relationship Mapping) -->对象关系映射

* 优点: 

  灵活：mybatis不会对应用程序或者数据库的现有设计强加任何影响。

  解除sql与程序代码的耦合

  提供xml标签，支持编写动态sql。

# MyBatis实例

每个基于 MyBatis 的应用都是以一个 **SqlSessionFactory** 的实例为核心的。



 **SqlSessionFactoryBuilder==依据配置== --->生成---> SqlSessionFactory**



**思路流程**：搭建环境 --> 导入Mybatis ---> 编写代码 ---> 测试



## 配置文件XML

- 一些核心设置

- 数据库连接实例的数据源（DataSource）

- 决定事务**作用域**和**控制方式**的事务管理器（TransactionManager）

- mappers 元素则包含了一组映射器（[mapper](https://www.w3cschool.cn/kzsow/kzsow-frbn2grj.html)），

  这些映射器的 XML 映射文件包含了 [SQL](https://www.w3cschool.cn/sql/) 代码和映射定义信息。

## No xml, form Java Code

```java
DataSource dataSource = BlogDataSourceFactory.getBlogDataSource();
TransactionFactory transactionFactory = new JdbcTransactionFactory();
Environment environment = new Environment("development", transactionFactory, dataSource);
Configuration configuration = new Configuration(environment);
configuration.addMapper(<code>BlogMapper.class</code>);
SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(configuration);
```

## HowToCode

1. **编写接口**
2. **编写对应的mapper中的对应语句**
3. **测试**

### - MyBatisUtils

先用SqlSessionFactoryBuilder.bulid()一个Factory，通过流的方式，

把MyBatis-config.xml，getResourceAsStream一下。

```java
public class MyBatisUtils {
    private static SqlSessionFactory sqlSessionFactory;

    static {
        try {
            //使用mybatis第一步：获取sqlSessionFactory对象
            String resource = "MyBatis-config.xml";
            InputStream inputStream = Resources.getResourceAsStream(resource);
            sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
    //既然有了 SqlSessionFactory，顾名思义，我们可以从中获得 SqlSession 的实例。
    // SqlSession 提供了在数据库执行 SQL 命令所需的所有方法。
    // 你可以通过 SqlSession 实例来直接执行已映射的 SQL 语句

    public static SqlSession getSqlSession(){
        return sqlSessionFactory.openSession();
    }
}
```

### - UserMapper

总接口, 规定了一系列所有关于数据库的方法

```java
public interface UserMapper {
    List<User> getUserList();

    List<User> getUserLike(String value);

}
```

### - UserMapper.xml

封装SQL语句的xml, 并规定查找**返回的数据类型**

```xml
<?xml version="1.0" encoding="UTF8" ?>
<!-- 封装了一个SQL语句, 方便我们使用
 为了让MyBatis帮我们实现UserDao接口-->

<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<!--namespace绑定一个对应的mapper接口-->
<mapper namespace="indi.yid.dao.UserMapper">

    <!--id方法名                          返回的是User类型的数据-->
    <select id="getUserList" resultType="indi.yid.pojo.User">
        select * from mybatis.user
    </select>

    <select id="getUserLike" resultType="indi.yid.pojo.User">
    select * from mybatis.user where name like #{value}
    </select>

</mapper>
```

### - User

pojo包下面的实体类

```java
public class User {
    private int id;
    private String name;
    private String pwd;
    public User() {}
    public User(int id, String name, String pwd) {
        this.id = id;
        this.name = name;
        this.pwd = pwd;}
    public int getId() {
        return id;}
    public void setId(int id) {
        this.id = id;}
    public String getName() {
        return name;}

    public void setName(String name) {
        this.name = name;}
    public String getPwd() {
        return pwd;}
    public void setPwd(String pwd) {
        this.pwd = pwd;}
    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", pwd='" + pwd + '\'' +
                '}';}}
```

### - MyBatis-config.xml

总配置文件, 规定了一系列属性

```xml
<?xml version="1.0" encoding="UTF8" ?>
<!DOCTYPE configuration
        PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-config.dtd">

<configuration>

    <settings>
        <setting name="logImpl" value="STDOUT_LOGGING"/>
    </settings>

    <environments default="development">
        <environment id="development">
            <transactionManager type="JDBC"/>
            <dataSource type="POOLED">
                <property name="driver" value="com.mysql.jdbc.Driver"/>
                <property name="url" value="jdbc:mysql://localhost:3306/mybatis?userSSL=true&amp;
                userUnicode=true&amp;characterEncoding=UTF-8"/>
                <property name="username" value="root"/>
                <property name="password" value="1234"/>
            </dataSource>
        </environment>
    </environments>

    <mappers> <!--每一个mapper.xml都需要注册-->
        <mapper resource="indi/yid/dao/UserMapper.xml"/>
    </mappers>

</configuration>
```

### - UserDaoTest

测试方法, **基本格式**

```java
public class UserDaoTest {
    @Test
    public void test(){
        SqlSession sqlSession = MyBatisUtils.getSqlSession();
        try {        UserMapper userDao = sqlSession.getMapper(UserMapper.class);

            List<User> userList = userDao.getUserList();

            for (User user : userList){
                System.out.println(user);
            }

        }catch (Exception e){
            e.printStackTrace();
        }finally {
            sqlSession.close();
        }
    }
    
    @Test
    public void getUserLike(){
        SqlSession sqlSession = MyBatisUtils.getSqlSession();

        UserMapper mapper = sqlSession.getMapper(UserMapper.class);
        List<User> list = mapper.getUserLike("%y%");

        for(User user : list){
            System.out.println(user);
        }
        sqlSession.close();
    }
}
```

### - Tip

#### MapWay

假如我们的实体类属性过多，**用map**，传递map的key

```xml
<!-- UserMapper.xml写法 -->
<insert id="addUser2" parameterType="map">
    insert into mybatis.user (id, name, pwd) values (#{id1}, #{name1}, #{pwd1});
</insert>
```

```java
//UserMapper接口写法
int addUser2(Map<String, Object> map);
```

```java
//Test写法
@Test
public void addUser2(){
    SqlSession sqlSession = MybatisUtils.getSqlSession();
UserMapper mapper = sqlSession.getMapper(UserMapper.class);
    
Map<String, Object> map = new HashMap<String, Object>();
map.put("id1",5);
map.put("name1","dong");
map.put("pwd1","12345");
mapper.addUser2(map);

//提交事务
sqlSession.commit();
sqlSession.close();
}
```
#### 模糊查询

java代码执行的时候，传递通配符%

% 代表一段字符

```xml
<select id="getUserLike" resultType="com.hou.pogo.User">
    select * from mybatis.user where name like #{value}
</select>
```

```java
@Test
public void getUserLike(){
    SqlSession sqlSession = MybatisUtils.getSqlSession();

    UserMapper mapper = sqlSession.getMapper(UserMapper.class);
    List<User> list = mapper.getUserLike("%o%");

    for(User user : list){
        System.out.println(user);
    }

    sqlSession.close();
}
```



## Configuration

mybatis-config.xml

```xml
<!--层级结构-->
<configuration>（配置）
    <properties>（属性）
    <settings>（设置）C
    <typeAliases>（类型别名）
    <typeHandlers>（类型处理器）
    <objectFactory>（对象工厂）
    <plugins>（插件）
        <environments>（环境配置）
            <environment>（环境变量）
            <transactionManager>（事务管理器）
    <dataSource>（数据源）
    <databaseIdProvider>（数据库厂商标识）
    <mappers>（映射器）
```

# Log

 logImpl 

- SLF4J 
- ==LOG4J [掌握]==
- LOG4J2 
- JDK_LOGGING 
- COMMONS_LOGGING 
- STDOUT_LOGGING [掌握]
- NO_LOGGING 
- 

mybatis-config.xml

```xml
  <settings>
    <setting name="logImpl" value="STDOUT_LOGGING"/>
</settings>
```

## Log4j

- 先导包

- 新建log4j.properties文件

```properties
### set log levels ###
log4j.rootLogger = DEBUG,console,file

### 输出到控制台 ###
log4j.appender.console = org.apache.log4j.ConsoleAppender
log4j.appender.console.Target = System.out
log4j.appender.console.Threshold = DEBUG
log4j.appender.console.layout = org.apache.log4j.PatternLayout
log4j.appender.console.layout.ConversionPattern = [%c]-%m%n

### 输出到日志文件 ###
log4j.appender.file=org.apache.log4j.RollingFileAppender
log4j.appender.file.File=./log/hou.log
log4j.appender.file.MaxFileSize=10mb 
log4j.appender.file.Threshold=DEBUG 
log4j.appender.file.layout=org.apache.log4j.PatternLayout
log4j.appender.file.layout.ConversionPattern=[%p][%d{yy-MM-dd}][%c]%m%n

# 日志输出级别
log4j.logger.org.mybatis=DEBUG
log4j.logger.java.sql=DEBUG
log4j.logger.java.sql.Statement=DEBUG
log4j.logger.java.sql.ResultSet=DEBUG
log4j.logger.java.sql.PreparedStatement=DEBUG
```

- 配置实现

```xml
<settings>
    <setting name="logImpl" value="LOG4J"/>
</settings>
```

# 分页

## limit实现

如果查询大量数据的时候，我们往往使用分页进行查询，也就是分而治之

```SQL
#语法
SELECT * FROM table LIMIT stratIndex，pageSize
SELECT * FROM table LIMIT 5,10; // 检索记录行 6-15
#为了检索从某一个偏移量到记录集的结束所有的记录行，可以指定第二个参数为 -1：
SELECT * FROM table LIMIT 95,-1; // 检索记录行 96-last.
#如果只给定一个参数，它表示返回最大的记录行数目：
SELECT * FROM table LIMIT 5; //检索前 5 个记录行
#换句话说，LIMIT n 等价于 LIMIT 0,n。
```

步骤：

#### 1. 修改Mapper文件

```xml
<select id="selectUser" parameterType="map" resultType="user">
select * from user limit #{startIndex},#{pageSize}
</select>
```

#### 2. Mapper接口，参数为map

```Java
//选择全部用户实现分页
List<User> selectUser(Map<String,Integer> map);
```

#### 3. 在测试类中传入参数测试

```java
//推断：起始位置 = （当前页面 - 1 ） * 页面大小
//分页查询 , 两个参数startIndex , pageSize
@Test
public void testSelectUser() {
SqlSession session = MybatisUtils.getSession();
    UserMapper mapper = session.getMapper(UserMapper.class);
    int currentPage = 1; //第几页
    int pageSize = 2; //每页显示几个
    Map<String,Integer> map = new HashMap<String,Integer>();
    map.put("startIndex",(currentPage-1)*pageSize);
    map.put("pageSize",pageSize);
    List<User> users = mapper.selectUser(map);
    for (User user: users){
    System.out.println(user);
    }
    session.close();
}
```

## RowBounds实现

```java
int currentPage = 2; //第几页
int pageSize = 2; //每页显示几个
RowBounds rowBounds = new RowBounds((currentPage-1)*pageSize,pageSize);
```

## PageHelper Plugin

......





# Mybatis Annotation

本质：**反射机制**==>加载接口和注解所有信息

底层：**动态代理**==>代理去数据区取数据回来

## 步骤

#### 1. 删除UserMapper.xml

#### 2. UserMapper接口加@

```java
package com.hou.dao;

import com.hou.pojo.User;
import org.apache.ibatis.annotations.Select;

import java.util.List;

public interface UserMapper {

    @Select("select * from user")
    List<User> getUsers();
}
```

#### 3. 核心配置mybatis-config.xml

```xml
<configuration>
    <!--引入外部配置文件-->
    <properties resource="db.properties"/>
    <!--可以给实体类起别名-->
    <typeAliases>
        <typeAlias type="indi.yid.pojo.User" alias="User"></typeAlias>
    </typeAliases>
    <environments default="development">
        <environment id="development">
            <transactionManager type="JDBC"/>
            <dataSource type="POOLED">
                <property name="driver" value="${driver}"/>
                <property name="url" value="${url}"/>
                <property name="username" value="${username}"/>
                <property name="password" value="${password}"/>
            </dataSource>
        </environment>
    </environments>

    <!--绑定接口-->
    <mappers>
        <mapper class="indi.yid.dao.UserMapper"></mapper>
    </mappers>
</configuration>
```

## 示例CRUD

```java
public interface UserMapper {
    @Select("select * from user")
    List<User> getUsers();

    //方法存在多个参数，所有的参数必须加@Param
    @Select("select * from user where id = #{id}")
    User getUserById(@Param("id") int id);

    @Insert("insert into user (id, name, pwd) values"+"(#{id},#{name},#{password})")
    int addUser(User user);

    @Update("update user set name=#{name}, pwd=#{password} " + "where id=#{id}")
    int updateUser(User user);

    @Delete("delete from user where id=#{id}")
    int deleteUser(@Param("id") int id);
}
```

```java
@Test
    public void test(){
        // 获得sqlsession对象
        SqlSession sqlSession = MybatisUtils.getSqlSession();
        try{
            // 1.执行 getmapper
            UserMapper userDao = sqlSession.getMapper(UserMapper.class);
            List<User> userList = userDao.getUsers();
            for (User user : userList) {
                System.out.println(user);
            }
        }catch(Exception e){
            e.printStackTrace();
        }finally{
            //关闭
            sqlSession.close();
        }
    }

    @Test
    public void getuserById(){
        SqlSession sqlSession = MybatisUtils.getSqlSession();
        try{
            UserMapper userDao = sqlSession.getMapper(UserMapper.class);
            User user = userDao.getUserById(1);
            System.out.println(user);
        }catch(Exception e){
            e.printStackTrace();
        }finally{
            sqlSession.close();
        }
    }

    @Test
    public void addUser(){
        SqlSession sqlSession = MybatisUtils.getSqlSession();
        try{
            UserMapper userDao = sqlSession.getMapper(UserMapper.class);
            userDao.addUser(new User(6, "kun","123"));
        }catch(Exception e){
            e.printStackTrace();
        }finally{
            sqlSession.close();
        }
    }

    @Test
    public void updateUser(){
        SqlSession sqlSession = MybatisUtils.getSqlSession();
        try{
            UserMapper userDao = sqlSession.getMapper(UserMapper.class);
            userDao.updateUser(new User(6, "fang","123"));
        }catch(Exception e){
            e.printStackTrace();
        }finally{
            sqlSession.close();
        }
    }

    @Test
    public void deleteUser(){
        SqlSession sqlSession = MybatisUtils.getSqlSession();
        try{
            UserMapper userDao = sqlSession.getMapper(UserMapper.class);
            userDao.deleteUser(6);
        }catch(Exception e){
            e.printStackTrace();
        }finally{
            sqlSession.close();
        }
    }
```







# MyBatis执行流程

![image-20211118205112671](https://raw.githubusercontent.com/handsomeyi/Pics/master/image-20211118205112671.png)











