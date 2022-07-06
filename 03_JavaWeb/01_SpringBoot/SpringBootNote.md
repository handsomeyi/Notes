# 1

### 基本结构

spring-boot-starter-parent 依赖 spring-boot-dependencies
spring-boot-dependencies里面有< properties >标签 存了各种组件工具的版本 的 默认规定版本.

各种jpa jdbc mongodb redis等工具 的依赖, 都能在官方文档里面找到.

springboot内嵌tomcat.

Controller包里面的 注解@Controller = @RestController 表示是一个Controller
@RequestMapping("/hello") 表示一个请求路径 应该做的方法.

@SpringBootApplication表示启动类, ComponentScan的就是当前目录.
如果启动类放错了位置, 就用@ComponentScan("/启动类应该的位置").

### 部署

通过maven的Lifecycle的package生成jar包, 服务器上java -jar [path]运行

### SpringBoot配置文件

用yaml比较好

配置文件优先级
![image.png](https://s2.loli.net/2022/07/04/gqGvXC3S14rc7OZ.png)

### 注解

注解就是一个Java5开始引入的特性, 辅助作用, Annontation, 将任何信息或metadata与程序关联.

注解的原理就是**反射**. => 反射应用原理 => Java SPI
**SPI**: 是JDK内置的一种服务提供发现机制, SPI是一种动态替换发现的机制, 比如有个接口, 想运行时动态的给它添加实现, 你只需要添加一个实现.

![image.png](https://s2.loli.net/2022/07/04/hfsREWTBKQe4GIz.png)

**元注解**

![image.png](https://s2.loli.net/2022/07/04/8BnjGtWeTUZxP2E.png)

# 2

### 内嵌Servlet容器支持

SpringBoot还能用Servlet, 虽然一般用不上, 因为Boot自动就会给你实现.
但是某些场景下还是要自己写Servlet, 例如用Druid数据源的时候得用.
就是将自定义的Servlet添加到SpringBoot容器中.

在启动类上添加@ServletComponentScan表示我要添加Servlet.
@WebServlet(name = "myServlet",urlPatterns = "/srv") 表示自定义的Servlet类.

详细步骤在原始笔记.

# 4

### 启动过程

应用入口SpringBootApplication

```java
@SpringBootApplication
public class StartupApplication {
    public static void main(String[] args) {
        SpringApplication.run(StartupApplication.class, args);
    }
}
```

```java
// 为什么是用 Class.run 而不是 new Class().run 呢?
静态成员***通过实例对象访问, 显示通过类实例而不是类本身调用方法和属性。

现有一个类Test，有静态方法methods和静态属性fields。
对于静态变量或方法，推荐使用的方式是Test.fields,而不是new Test().fields。
当然，使用this.fields也是不行的！因为this也指向一个实例对象。
如果出现以上告警，那一定是对于java不推荐的方式使用了静态元素。
// 分析：
可能是考虑到实例会被回收
```







监听器的启动 (观察者模式)