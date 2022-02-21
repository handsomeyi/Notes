# zuul生产中的问题

网关能干啥:

**分发服务, 鉴权, 过滤请求, 监控, 路由(动态), 限流** 



网关基础操作: 

1. jar包: **spring-cloud-starter-netflix-zuul**
2. 注解: CloudZuulApplication启动类   **@EnableZuulProxy**
3. 配置文件



## 1. token不向后传

单体项目 => 微服务



==**postman**== ---Cookie---> ==**被调用方**==

http://localhost:8004/test/sms-test5 

直接传cookie给被调用方 得到返回token没问题



==**postman**== ---Cookie---> ==**网关**== ---Cookie---> ==**被调用方**==

http://locatlhost:9100/service-sms/test/sms-test5 

传cookie给网关 然后网关再传给被调用方 就不能直接返回postman token



因为最小知道原则 后面被调用方不需要知道cookie 只要能正确返回就行



阿里规约 泰山版 已批注



## 2. 客户url不变 重构单体项目

老项目向微服务改造时遇到的问题

**法1°** Filter 使用灰度的方式改url

​		 做好老url和新url的对应关系

**法2°** Nginx 地址映射

**法3°** zuul 自定义 filter

**法4°** Nginx 做重定向







# zuul 核心

本质是一系列过滤器

四种过滤器: pre, route, post, error

![image-20220221150642504](https://s2.loli.net/2022/02/21/IktrwxinNvYSzE5.png)

四种过滤器的执行顺序?

**PRE**: 在请求被路由之前调用, 可利用这种过滤器 **鉴权**. **选择微服务**, **记录日志** ,**限流**.

**ROUTE**: 在将请求路由到微服务调用, 用于**构建发送给微服务的请求**, 并用http clinet(或者**ribbon**) 请求微服务.

**POST**: 在调用微服务执行后, **可用于添加header**, **记录日志**, 将响应发给客户端.

**ERROR**: 在其他阶段发生错误是, 走此过滤器.



**ROUTE **有几种?

路由 过滤器：
**RibbonXXXFilter**：将 url 路由到服务

**SimpleHostRoutingFilter**：将url 路由到 url 地址

**SendForward Filter**： 转发（转向zuul自己）



写filter步骤

1. **继承 zuulfilter**

2. **public boolean shouldFilter()** ：true ：执行此过滤器,false：不执行

3. **run** ： 过滤器的业务逻辑

4. **filterType**：pre,route,post,error

5. **filter order**：数字越小,越先执行



# zuul 动态路由问题

## 1. 使用ZuulFilter转发路由(路由到服务)

生产线上url需要按照需要通过网关转发给不同的service

之前用过自定义路由, 在yml文件配置route的方式去做转发, 遇到一个问题那就是 

zuul.route.<自定serviceid>.path = /account/** 

zuul.route.<自定serviceid>.serviceId=account,

但是不能保证请求的url, 在/account/后面的url路径跟account服务里面的路径一致, 所以这样会有问题.

这样的话, 只能用另外一种方式了, 那就是通过filter转发

https://www.cnblogs.com/logan-w/p/12498943.html

```Java
@Component
public class CommonServicePathFilter extends ZuulFilter {

    private final static String GETWAY_FOWARD_PREFIX="getway_forward_";

    private final static String GETWAY_COMPAY_CONFIG_KEY = "getway_company";

    @Autowired
    private RedisTemplate redisTemplate;

    @Override
    public String filterType() {
       //这里很重要，必须是route
        return "route";
    }

    @Override
    public int filterOrder() {
        return 1;
    }

    @Override
    public Object run() throws ZuulException {
        RequestContext ctx = RequestContext.getCurrentContext();
        String url = ctx.getRequest().getRequestURI();
        Map<String,String> forwardMap =  getForwardMap(url);
        if(forwardMap != null){
            String fowardUrl = forwardMap.get(url);
            String serviceId = getServiceId(fowardUrl);
            String requestUrl = getRequestUrl(fowardUrl,serviceId);
              //1.设置目标service的Controller的路径
            ctx.put(FilterConstants.REQUEST_URI_KEY,requestUrl);
             //2.设置目标service的serviceId
            ctx.put(FilterConstants.SERVICE_ID_KEY,serviceId);
        }
        return null;
    }

    private String getServiceId(String url){
        if(url.startsWith("/")){
            String temp = url.substring(1);
            return temp.split("/")[0];
        }else{
            return null;
        }
    }

    private String getRequestUrl(String url,String serviceId){
        return url.substring(serviceId.length() +1);
    }

    @Override
    public boolean shouldFilter() {
       return true;
    }

    private Map<String,String> getForwardMap(String originalUrl){
           //todo:这里是返回一个map，传入一个originUrl,返回一个要转发的url
    }
}
```

## 2. 动态路由 根据不同人=>不同服务

系统的**z轴数据分片**的思想 (x轴代表扩展加机器, y轴代表大服务拆成小服务)

例如: 

**[北京用户]** -----------从yml获取----------> **[北京系统]**

**[长沙用户]** -----------从yml获取----------> **[长沙系统]**

北京车多, 接单范围小 北京设置了

长沙车少, 接单范围大

![image-20220221220321594](https://s2.loli.net/2022/02/21/eVCKrOoSfXLlWIg.png)

```java
@Component
public class HostFilterFengYu extends ZuulFilter {

    @Override
    public String filterType() {
        return FilterConstants.ROUTE_TYPE;
    }

    @Override
    public int filterOrder() {
        return 0;
    }

    @Override
    public boolean shouldFilter() {
        return false;
    }

    @SneakyThrows
    @Override
    public Object run() throws ZuulException {
        RequestContext currentContext = RequestContext.getCurrentContext();
        HttpServletRequest request = currentContext.getRequest();
        // 获取 请求url
        String remoteAddr = request.getRequestURI();
        // 和 老地址 做匹配
        if (remoteAddr.contains("/zuul-api-driver")){
            // rmoteAddr => newAddr
            currentContext.setRouteHost(new URI
("http://localhost:8003/test/sms-test3").toURL()
                                       );
        }
        return null;
    }
}
```

ps: @SneakyThrows (**利用泛型骗过javac编译器**) https://www.jianshu.com/p/7d0ed3aef34b

### 用到的小技巧

新建一个自定义**application-my.yml**通过一个**MyYml.class**控制

把新的private MyYml yml; @Autowired一下, 然后

```yml
test:
  address: fucking-fucked
```

把新yml注册到一个类MyYml里面

```java
@Component
@PropertySource(value = {"classpath:application-my.yml"})
@ConfigurationProperties(prefix = "test")
@Data
public class MyYml {
    @Value("${address}")
    private String address;
}
```

在Controller里面可以直接get到

```java
@RestController
public class controller {
    @Autowired
    private MyYml myYml;

    @GetMapping("/controllerTest")
    public String myForward(){
        return "controllerTest" + myYml.getAddress();
    }
}
```





# 404 问题来源

从网关地址来源找: 

1. eureka 服务, zuul从eureka获取的服务. => 没注册呗
2. 配置文件中定义. => 没写呗

---

1. ![image-20220221214842736](https://s2.loli.net/2022/02/21/ZYdVWFOsyHi7tuo.png)

---

2. ![image-20220221215121689](https://s2.loli.net/2022/02/21/En4foQjcLNqZy8O.png)

---



