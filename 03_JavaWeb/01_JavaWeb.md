# Tomcat服务器

用来处理用户的请求, 并且响应一些信息

Tomcat源码



## 请你谈谈网站是如何进行访问的！

1. 输入一个域名；回车
2. **检查本机**的==C:\Windows\System32\drivers\etc\hosts==**配置文件**下有没有这个域名映射；
1. 有：直接返回对应的ip地址，这个地址中，有我们需要访问的web程序，可以直接访问
2. 没有：去DNS服务器找，找到的话就返回，找不到就返回找不到；
127.0.0.1 www.qinjiang.com



![](https://i.loli.net/2021/11/14/wlpRKQxFVT6mIoz.png)

## 物理服务器

往云服务器里面丢一个tomcat服务器就行

然后客户端就可以通过  注册过的域名/网络ip  访问tomcat结构里面的webapps文件





# HTTP

HTTP（超文本传输协议）是一个简单的请求-响应协议，它通常==运行在TCP之上==。

**文本**: html，字符串，~ ….
**超文本**: 图片，音乐，视频，定位，地图…….
**默认端口**: 80



**Https**: 安全的
**默认端口**: 443

## 版本

**http1.0**
HTTP/1.0：客户端可以与web服务器连接后，只能获得一个web资源，断开连接。
**http2.0**
HTTP/1.1：客户端可以与web服务器连接后，可以获得多个web资源。

## Request

```java
Request URL:https://www.baidu.com/ 请求地址
Request Method:GET //get方法/post方法
Status Code:200 OK //状态码：200
Remote（远程） Address:14.215.177.39:443
```

```java
Accept:text/html
Accept-Encoding:gzip, deflate, br
Accept-Language:zh-CN,zh;q=0.9 //语言
Cache-Control:max-age=0
Connection:keep-alive
```

### 请求行

* 请求行中的请求方式：GET

* 请求方式：Get，Post，HEAD,DELETE,PUT,TRACT…
  	**get**：请求能够携带的参数比较少，大小有限制，**会在浏览器的URL地址栏显示数据内容**，不
  安全，但高效
  	**post**：请求能够携带的参数没有限制，大小没有限制，**不会在浏览器的URL地址栏显示数据内**
  **容，安全，但==不高效==**。

### 消息头

```java
Accept-Encoding：//支持哪种编码格式 GBK UTF-8 GB2312 ISO8859-1
Accept-Language：//告诉浏览器，它的语言环境
Cache-Control：	//缓存控制
Connection：		//告诉浏览器，请求完成是断开还是保持连接
HOST：			//主机......
```



## Response

``` java
Cache-Control:private //缓存控制
Connection:Keep-Alive //连接
Content-Encoding:gzip //编码
Content-Type:text/html//类型
```

### 响应体

``` java
Accept：        //告诉浏览器，它所支持的数据类型
Accept-Encoding：//支持哪种编码格式 GBK UTF-8 GB2312 ISO8859-1
Accept-Language：//告诉浏览器，它的语言环境
Cache-Control：//缓存控制
Connection：//告诉浏览器，请求完成是断开还是保持连接
HOST：//主机..../.
Refresh：//告诉客户端，多久刷新一次；
Location：//让网页重新定位；
```

### 响应状态码

**200**：请求响应成功 200
**3xx**：请求重定向
**重定向**：你重新到我给你新位置去；
**4xx**：找不到资源 404
**资源不存在**；
**5xx**：服务器代码错误 500 502: 网关错误



## 常见面试题
当你的浏览器中地址栏输入地址并回车的一瞬间到页面能够展示回来，经历了什么？



# Maven

Maven的核心思想：约定大于配置



有时候闪退，考虑是否没用配置相关环境变量，目前没有maven环境变量。



父项目中的java子项目可以直接使用

子项目的依赖夫项目不能直接使用



# Servlet

Sun在这些API中提供一个接口叫做：Servlet，如果你想开发一个Servlet程序，

只需要完成两个小步骤：

* 编写一个类，实现Servlet接口
  把开发好的Java类部署到web服务器中。





![](https://raw.githubusercontent.com/handsomeyi/Pics/master/1qSovsu9tZH5IU4.png)

如果有请求，例如我要看a.html，Tomcat就是搞来web.xml里面找到url-pattern 对应的servlet-name 然后再去servlet标签里面找class

```xml
<servlet>
    <servlet-name>helloServlet</servlet-name>
    <servlet-class>indi.yid.servlet.HelloServlet</servlet-class>

</servlet>
<servlet-mapping> <!--一个servlet对应一个mapping-->
    <servlet-name>helloServlet</servlet-name>
    <url-pattern>/yid</url-pattern>
</servlet-mapping>
```



找到class之后，运行里面的代码，如下

```java
public class HelloServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    }
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        super.doGet(req, resp);//也doGet
    }
}
```



## Servlet执行原理

Servlet是由Web服务器调用，web服务器在收到浏览器请求之后，会：

产生两个对象，请求和响应对象

![image-20211115110524390](https://raw.githubusercontent.com/handsomeyi/Pics/master/image-20211115110524390.png)

## mapping

我们写的是JAVA程序，但是要通过浏览器访问，而浏览器需要连接web服务器，
所以我们需要再web服务中注册我们写的Servlet，还需给他一个浏览器能够访问的路径；



一个Servlet可以指定多个映射路径

一个Servlet可以指定通用映射路径(通配符)

```xml
<!--通用路径-->
<servlet-mapping>
<servlet-name>hello</servlet-name>
<url-pattern>/hello/*</url-pattern>
</servlet-mapping>
```

```xml
<!--默认请求路径-->
<servlet-mapping>
<servlet-name>hello</servlet-name>
<url-pattern>/*</url-pattern>
</servlet-mapping>
```

```xml
<servlet-mapping><!--前缀-->
<servlet-name>hello</servlet-name>
<url-pattern>*.qinjiang</url-pattern>
</servlet-mapping>
```

**优先级问题**
指定了固有的映射路径优先级最高，如果找不到就会走默认的处理请求；

```xml
<!--404-->
<servlet>
<servlet-name>error</servlet-name>
<servlet-class>com.kuang.servlet.ErrorServlet</servlet-class>
</servlet>
<servlet-mapping>
<servlet-name>error</servlet-name>
<url-pattern>/*</url-pattern>
</servlet-mapping>
```

## ServletContext

![image-20211115132206797](https://raw.githubusercontent.com/handsomeyi/Pics/master/image-20211115132206797.png)

web容器在启动的时候，它会为每个web程序都创建一个对应的ServletContext对象，它**代表了当前的web应用**。



* **我在这个Servlet中保存的数据，可以在另外一个servlet中拿到；**

```java
public class HelloServlet extends HttpServlet {
@Override
protected void doGet(HttpServletRequest req, HttpServletResponse resp)
throws ServletException, IOException {
//this.getInitParameter() 初始化参数
//this.getServletConfig() Servlet配置
//this.getServletContext() Servlet上下文
ServletContext context = this.getServletContext();
String username = "秦疆"; //数据
context.setAttribute("username",username); //将一个数据保存在了
ServletContext中，名字为：username 。值 username
}
}
```

```java
public class GetServlet extends HttpServlet {
@Override
protected void doGet(HttpServletRequest req, HttpServletResponse resp)
throws ServletException, IOException {
ServletContext context = this.getServletContext();
String username = (String) context.getAttribute("username");
resp.setContentType("text/html");
resp.setCharacterEncoding("utf-8");
resp.getWriter().print("名字"+username);
}
   @Override
protected void doPost(HttpServletRequest req, HttpServletResponse resp)
throws ServletException, IOException {
doGet(req, resp);
}
}
```

```xml
<servlet>
<servlet-name>hello</servlet-name>
<servlet-class>com.kuang.servlet.HelloServlet</servlet-class>
</servlet>
<servlet-mapping>
<servlet-name>hello</servlet-name>
<url-pattern>/hello</url-pattern>
</servlet-mapping>
<servlet>
<servlet-name>getc</servlet-name>
<servlet-class>com.kuang.servlet.GetServlet</servlet-class>
</servlet>
<servlet-mapping>
<servlet-name>getc</servlet-name>
<url-pattern>/getc</url-pattern>
</servlet-mapping>
```



* **获取初始化参数**

```xml
<!--配置一些web应用初始化参数-->
<context-param>
<param-name>url</param-name>
<param-value>jdbc:mysql://localhost:3306/mybatis</param-value>
</context-param>
```

```java
protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws
ServletException, IOException {
ServletContext context = this.getServletContext();
String url = context.getInitParameter("url");
resp.getWriter().print(url);
}
```



- **请求转发**

```java
@Override
protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws
ServletException, IOException {
ServletContext context = this.getServletContext();
System.out.println("进入了ServletDemo04");
//RequestDispatcher requestDispatcher =
context.getRequestDispatcher("/gp"); //转发的请求路径
//requestDispatcher.forward(req,resp); //调用forward实现请求转发；
context.getRequestDispatcher("/gp").forward(req,resp);
}
```

![image-20211115154122972](https://raw.githubusercontent.com/handsomeyi/Pics/master/image-20211115154122972.png)



## HttpServletResponse

web服务器接收到客户端的http请求，针对这个请求，分别创建

- 一个代表请求的HttpServletRequest对象，

- 代表响应的一个HttpServletResponse；





HttpServletResponse中有一些方法



**负责向浏览器发送数据的方法**

getOutputStream()

getWriter()



**负责向浏览器发送响应头的方法**



**响应的状态码** (int) 

200, 300, 404, 500



### 实现下载文件

。。。。。。

### **实现重定向**

```java
void sendRedirect(String var1) 1 throws IOException;//传入要去的地址就行了
////////////////////////////////////////////////////////////////////////////
@Override
protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws
ServletException, IOException {
/* 重定向的本质如下：
resp.setHeader("Location","/r/img");
resp.setStatus(302);
*/
    resp.sendRedirect("/r/img");//重定向
}
```



**面试题：请你聊聊重定向和转发的区别？**
**==相同点==**
页面都会实现跳转
==**不同点**==
请求转发的时候，url不会产生变化    **307**
重定向时候，url地址栏会发生变化；**302**

网络传输过程不同，上面有涉及到。



## HttpServletRequest

实现Post传输 用户名&密码 然后转发

```java
protected void doGet(HttpServletRequest req, HttpServletResponse resp)
throws ServletException, IOException {
req.setCharacterEncoding("utf-8");
resp.setCharacterEncoding("utf-8");
String username = req.getParameter("username");
String password = req.getParameter("password");
String[] hobbys = req.getParameterValues("hobbys");
System.out.println("=============================");
//后台接收中文乱码问题
System.out.println(username);
System.out.println(password);
System.out.println(Arrays.toString(hobbys));
System.out.println("=============================");
System.out.println(req.getContextPath());
//通过请求转发
//这里的 / 代表当前的web应用
req.getRequestDispatcher("/success.jsp").forward(req,resp);
}
```

## Cookie & Session



**会话**：用户打开一个浏览器，点击了很多超链接，访问多个web资源，关闭浏览器，这个过程可以称之
为会话；
**有状态会话**：一个同学来过教室，下次再来教室，我们会知道这个同学，曾经来过，称之为有状态会
话；



**cookie**
**客户端**技术 （响应，请求）



**session**
**服务器**技术，利用这个技术，可以保存用户的会话信息？ 我们可以把信息或者数据放在Session
中！



### Cookie

每次收到Cookie都会自动更新一个CookCie返回给客户端

1. 服务器从请求中拿到cookie信息
2. 服务器响应给客户端cookie

```java
Cookie[] cookies = req.getCookies(); //获得Cookie
cookie.getName(); //获得cookie中的key
cookie.getValue(); //获得cookie中的vlaue
new Cookie("lastLoginTime", System.currentTimeMillis()+""); //新建一个cookie
cookie.setMaxAge(24*60*60); //设置cookie的有效期
resp.addCookie(cookie); //响应给客户端一个cookie
```

**一个网站cookie是否存在上限！聊聊细节问题**

- 一个web站点可以给浏览器发送多个cookie，最多存放20个cookie；

- Cookie大小有限制4kb；

- 300个cookie浏览器上限

- 关闭浏览器自动失效



cookie：一般会保存在本地的 用户目录下 **appdata**；

### Session(==重点==)

服务器会给每一个用户（浏览器）创建一个==**Seesion对象**==；
**一个Seesion独占一个浏览器**，只要浏览器没有关闭，这个Session就存在；
用户登录之后，整个网站它都可以访问！--> 保存用户的信息；保存购物车的信息…..

![image-20211115173831147](https://raw.githubusercontent.com/handsomeyi/Pics/master/image-20211115173831147.png)





### Session和cookie的区别
Cookie是把用户的数据 写给用户的浏览器，浏览器保存 （可以保存多个）

并且服务器在resp的时候会更新Cookie



Session把用户的数据写到用户独占Session中，服务器端保存 （保存重要的信息，减少服务器资
源的浪费）
Session对象由**服务创建**；







# JavaBean

**就是一个实体类**
JavaBean有特定的写法：

- 必须要有一个无参构造

- 属性必须私有化
- 必须有对应的get/set方法；



**一般用来和数据库的字段做映射 ORM；**



ORM ：对象关系映射
表--->类
字段-->属性
行记录---->对象

| id   | name   | age  | address |
| ---- | ------ | ---- | ------- |
| 1    | yid    | 22   | NA      |
| 2    | zook   | 12   | SAT     |
| 3    | ezreal | 44   | NK      |

# 初学者的疑惑，到底什么是javaBean？

https://blog.csdn.net/zhouvip666/article/details/83867401

JavaBeans是Java中一种特殊的类，可以将多个对象封装到一个对象（bean）中。特点是可序列化，提供无参构造器，提供getter方法和setter方法访问对象的属性。名称中的“Bean”是用于Java的可重用软件组件的惯用叫法。
—以上源自维基百科

一开始，我们封装一个对象的时候，以汽车对象为例子：

```java
public class car {
	/**
	 * 这是一个五座小汽车
	 */
	private int 车轮 = 4 ;
	private int 方向盘 = 1;
	private int 座位 = 5;
	public int get车轮() {
		return 车轮;
	}
	public void set车轮(int 车轮) {
		this.车轮 = 车轮;
	}
	public int get方向盘() {
		return 方向盘;
	}
	public void set方向盘(int 方向盘) {
		this.方向盘 = 方向盘;
	}
	public int get座位() {
		return 座位;
	}
	public void set座位(int 座位) {
		this.座位 = 座位;
	}	
}
```

**一开始学习的java的时候，我们把上述代码称之为一个对象类，而到了后期，我们称之为一个javaBean。**

**因为后期java为了便于操作数据，通常是使用对象为容器，把需要操作的数据赋值给对象，而为了便于赋值，那我们必须要有这种get/set方法。**

### 总结如下：

**1、所有属性为private
2、提供默认构造方法
3、提供getter和setter
4、实现serializable接口**



目前的理解是**==数据的容器==**，若以后再有所感受，会继续更新本帖。各位朋友如果有更好的理解欢迎留言分享，感谢。

# MVC三层架构

什么是MVC： **Model view Controller** 模型、视图、控制器



**以前的模式:**

![image-20211116144103490](https://raw.githubusercontent.com/handsomeyi/Pics/master/image-20211116144103490.png)

用户直接访问控制层，控制层就可以直接操作数据库；



**现在的MVC架构:**

<img src="https://raw.githubusercontent.com/handsomeyi/Pics/master/image-20211116144411775.png" alt="image-20211116144411775" style="zoom:150%;" />



**Model**
业务处理 ：业务逻辑（Service）
数据持久层：CRUD （Dao）



**View**
展示数据
提供链接发起Servlet请求 （a，form，img…）



**Controller （Servlet）**
接收用户的请求 ：（req：请求参数、Session信息….）
交给业务层处理对应的代码
控制视图的跳转

```java
登录--->接收用户的登录请求--->处理用户的请求（获取用户登录的参数，username，
password）---->交给业务层处理登录业务（判断用户名密码是否正确：事务）--->Dao层查询用
户名和密码是否正确-->数据库
```

# Filter(==重点==)

Filter：过滤器 ，用来过滤网站的数据；
处理中文乱码
登录验证….

```java
public class CharacterEncodingFilter implements Filter {
//初始化：web服务器启动，就以及初始化了，随时等待过滤对象出现！
public void init(FilterConfig filterConfig) throws
ServletException {
System.out.println("CharacterEncodingFilter初始化");
}
//Chain : 链
/*
1. 过滤中的所有代码，在过滤特定请求的时候都会执行
2. 必须要让过滤器继续同行
chain.doFilter(request,response);
*/
public void doFilter(ServletRequest request, ServletResponse
response, FilterChain chain) throws IOException, ServletException {
request.setCharacterEncoding("utf-8");
response.setCharacterEncoding("utf-8");
response.setContentType("text/html;charset=UTF-8");
System.out.println("CharacterEncodingFilter执行前....");
    chain.doFilter(request,response); //让我们的请求继续走，如果不写，程序到这里就被拦截停止！
System.out.println("CharacterEncodingFilter执行后....");
}
//销毁：web服务器关闭的时候，过滤会销毁
public void destroy() {
System.out.println("CharacterEncodingFilter销毁");
}
}
```

```xml
<filter>
<filter-name>CharacterEncodingFilter</filter-name>
<filter-class>com.kuang.filter.CharacterEncodingFilter</filterclass>
</filter>
<filter-mapping>
<filter-name>CharacterEncodingFilter</filter-name>
<!--只要是 /servlet的任何请求，会经过这个过滤器-->
<url-pattern>/servlet/*</url-pattern>
<!--<url-pattern>/*</url-pattern>-->
</filter-mapping>
```

# Listener

实现一个监听器的接口；（有N种）
1. 编写一个监听器
实现监听器的接口…

例如:统计打开网站的人数

```java
//统计网站在线人数 ： 统计session
public class OnlineCountListener implements HttpSessionListener {
//创建session监听： 看你的一举一动
//一旦创建Session就会触发一次这个事件！
public void sessionCreated(HttpSessionEvent se) {
ServletContext ctx = se.getSession().getServletContext();
System.out.println(se.getSession().getId());
Integer onlineCount = (Integer) ctx.getAttribute("OnlineCount");
if (onlineCount==null){
onlineCount = new Integer(1);
}else {
int count = onlineCount.intValue();
onlineCount = new Integer(count+1);
}
ctx.setAttribute("OnlineCount",onlineCount);
}
//销毁session监听
//一旦销毁Session就会触发一次这个事件！
public void sessionDestroyed(HttpSessionEvent se) {
ServletContext ctx = se.getSession().getServletContext();
Integer onlineCount = (Integer) ctx.getAttribute("OnlineCount");
if (onlineCount==null){
onlineCount = new Integer(0);
}else {
int count = onlineCount.intValue();
onlineCount = new Integer(count-1);
}
ctx.setAttribute("OnlineCount",onlineCount);
}
/*
Session销毁：
1. 手动销毁 getSession().invalidate();
2. 自动销毁
*/
}
```

```xml
<!--注册监听器-->
<listener>
<listener-class>com.kuang.listener.OnlineCountListener</listenerclass>
</listener>
```



# JDBC

![image-20211116161401650](https://raw.githubusercontent.com/handsomeyi/Pics/master/image-20211116161401650.png)





**jar包:**

java.sql
javax.sql
mysql-conneter-java… 连接驱动（必须要导入）



## 创建表

```SQL
CREATE TABLE users(
id INT PRIMARY KEY,
`name` VARCHAR(40),
`password` VARCHAR(40),
email VARCHAR(60),
birthday DATE
);
INSERT INTO users(id,`name`,`password`,email,birthday)
VALUES(1,'张三','123456','zs@qq.com','2000-01-01');
INSERT INTO users(id,`name`,`password`,email,birthday)
VALUES(2,'李四','123456','ls@qq.com','2000-01-01');
INSERT INTO users(id,`name`,`password`,email,birthday)
VALUES(3,'王五','123456','ww@qq.com','2000-01-01');
SELECT * FROM users;
```





## 导入数据库依赖

```xml
<!--mysql的驱动-->
<dependency>
<groupId>mysql</groupId>
<artifactId>mysql-connector-java</artifactId>
<version>5.1.47</version>
</dependency>
```

## IDEA中连接数据库

![image-20211116162642331](https://raw.githubusercontent.com/handsomeyi/Pics/master/image-20211116162642331.png)



## JDBC 固定步骤

1. 加载驱动
2. 连接数据库,代表数据库
3. 向数据库发送SQL的对象Statement : CRUD
4. 编写SQL （根据业务，不同的SQL）
5. 执行SQL
6. **关闭连接**















