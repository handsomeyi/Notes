# spring-boot-starter-parent

```xml
<parent>
   <groupId>org.springframework.boot</groupId>
   <artifactId>spring-boot-starter-parent</artifactId>
   <version>2.3.12.RELEASE</version>
   <relativePath/> <!-- lookup parent from repository -->
</parent>
```

Maven用户可以继承[spring-boot](https://so.csdn.net/so/search?from=pc_blog_highlight&q=spring-boot)-starter-parent项目，来获取最佳依赖。这个父项目提供了以下几个功能：

- 默认Java 1.6编译
- UTF-8编码格式
- 依赖管理部分，可让你对公共依赖省略version标签。继承自spring-boot-dependencies POM。
- 良好的资源过滤
- 良好的插件配置s
- 对于application.properties和application.yml包括profile-specific文件，良好的资源过滤





# 主程序和注解

```java
@SpringBootConfiguration
@EnableAutoConfiguration
@ComponentScan(
    excludeFilters = {@Filter(
    type = FilterType.CUSTOM,
    classes = {TypeExcludeFilter.class}
), @Filter(
    type = FilterType.CUSTOM,
    classes = {AutoConfigurationExcludeFilter.class}
)}
)
public @interface SpringBootApplication {
    // ......
}
```

## @SpringBootApplication

这个类是SpringBoot的主配置, 运行这个类的main方法来启动

## @ComponentScan

自动扫描并加载符合条件的组件或者bean ， 将这个bean定义加载到IOC容器中

## @SpringBootConfiguration







### Controller

Controller 应该只负责 跳转 参数 取数f据

其他的复杂业务应该放到service里面

