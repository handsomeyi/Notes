# Zuul到底是什么

我认为非常多的



https://cloud.tencent.com/developer/article/1527119

- 单体应用：浏览器发起请求，请求直接打到单体应用所在的机器上，应用从[数据库](https://cloud.tencent.com/solution/database?from=10680)查询数据原路返回给浏览器，对于单体应用来说，它只有一个，不需要网关。

- 微服务：微服务的应用可能部署在不同机房，不同地区，不同域名下。此时客户端（浏览器/手机/软件工具）想要请求对应的服务，都需要知道机器的具体的IP或者域名URL，当微服务实例众多时，这是难以记忆的。此时就有了网关，客户端相关的请求直接发送到网关，由网关根据请求标识解析判断出具体的微服务ip，再把请求转发到微服务实例。这其中的记忆功能就全部交由网关来操作了。

  ![img](https://s2.loli.net/2022/04/05/18Bt9qDehoAxcQK.png)

单点入口(分发服务)
安全认证(鉴权)
限流熔断
监控(日志监控)

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

```yaml
zuul:
    #以下配置，表示忽略下面的值向微服务传播，以下配置为空表示：所有请求头都穿透到后面微服务。
  sensitive-headers: # 源码用LinkedHashSet<String>存,存了Cookie,Set-Cookie,Authorization
  routes:
    xxx:
      path: /a-forward/**
      url: forward:/myController
#     配合 龙哥,后面两个*号，表示 所有路径都转发，一个* 表示 只转发一级。
    service-sms: /zuul-api-driver/**
    # 配合 风雨冷人
    xxxx: /zuul-api-driver/**
    #此处名字随便取
    custom-zuul-name:
      path: /zuul-api-driver/**
      url: http://localhost:8080/
```



**因为最小知道原则** 后面被调用方不需要知道cookie 只要能正确返回就行



阿里规约 泰山版 已批注



## 2. 客户url不变 重构单体项目

老项目向微服务改造时遇到的问题

**法1°** Filter 使用灰度的方式改url

​		 做好老url和新url的对应关系

**法2°** Nginx 地址映射

**法3°** zuul 自定义 filter

**法4°** Nginx 做重定向



Nginx是服务端负载均衡, zuul是客户端负载均衡



# zuul 核心

本质是一系列过滤器

四种过滤器: pre, route, post, error

![image-20220221150642504](https://s2.loli.net/2022/02/21/IktrwxinNvYSzE5.png)

四种过滤器的执行顺序?

**PRE**: 在请求被路由之前调用, 可利用这种过滤器 ==**鉴权**. **选择微服务**, **记录日志** ,**限流**==.

**ROUTE**: 在将请求路由到微服务调用, 用于**==构建发送给微服务的请求==**, 并用http clinet(或者**ribbon**) 请求微服务.

**POST**: 在调用微服务执行后, ==**可用于添加header**, **记录日志**==, 将响应发给客户端.

**ERROR**: 在其他阶段发生错误是, 走此过滤器, 做日志处理...



**ROUTE **有几种?

路由 过滤器：
**RibbonXXXFilter**：将 url 路由到服务

**SimpleHostRoutingFilter**：将url 路由到 url 地址

**SendForward Filter**： 转发（转向zuul自己）



## 写filter步骤(==如果要用网关解决问题==)

1. **继承 zuulfilter**

2. **public boolean shouldFilter()** ：true ：执行此过滤器,false：不执行

3. **run** ： 过滤器的业务逻辑

4. **filterType**：pre,route,post,error

5. **filter order**：数字越小,越先执行





# 解决方式

备选方案

1. 地址映射
   - 存数据库redis等
   - Nginx地址映射(或者Nginx做重定向)
2. yml配置文件route方式去做转发, 但是不好扩展, 要穷举url.
3. 动态路由转发, 使用ZuulFilter转发路由(过滤器类型route)

# zuul 动态路由问题

## 1. 就是龙哥的旧url不变, 使用ZuulFilter转发路由(url路由到服务)

生产线上url需要按照需要通过网关转发给不同的service

之前用过自定义路由, 在yml文件配置route的方式去做转发, 遇到一个问题那就是 

```yaml
zuul:
  routes:
    自定serviceid:
      path: /a-forward/**
      url: forward:/myController
```

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

## 2. 风雨哥的动态路由 根据不同人=>不同服务(url路由到实际url)

系统的**z轴数据分片**的思想 (x轴代表扩展加机器, y轴代表大服务拆成小服务)
xyz轴 => 水平复制, 服务拆分, 数据分片.

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
myytest:
  address: fucking-fucked
```

把新yml注册到一个类MyYml里面

```java
@Component
@PropertySource(value = {"classpath:application-my.yml"})
@ConfigurationProperties(prefix = "myymltest")
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





# 网关404 问题来源

从网关地址来源找: 

1. eureka 服务, zuul从eureka获取的服务. => 没注册呗
2. 配置文件中定义. => 没写呗

---

1. DiscoveryClientRouteLocator也就是用到了zuul时, 网关地址的来源

   ![image-20220406142118397](https://s2.loli.net/2022/04/06/cnTD7YA5QJVS96t.png)

   ![image-20220221214842736](https://s2.loli.net/2022/02/21/ZYdVWFOsyHi7tuo.png)

---

2. SimpleRouteLocator简单的routeLocator直接到

   ![image-20220221215121689](https://s2.loli.net/2022/02/21/En4foQjcLNqZy8O.png)

---



# 网关本质: 过滤器

![image-20220405221519837](https://s2.loli.net/2022/04/05/kgWjXTDaPtm7YVM.png)

**should, run, filterType, order** 也就这么些东西了

# 网关的高可用

网关的高可用(==把多个网关也注册到注册中心==): 

Nginx就配合使用Keepalived保证高可用

**Nginx + Keepalived------------------------>网关------------------------>注册中心**

​								   |**------------------------>网关------------------------>注册中心**

## 只要能调http就能连注册中心

node做路由 => eureka

## 网关设计要考虑到==节省计算资源==

确实, 我发现前面的设计都挺消耗计算资源的.

最后要考虑到节省计算资源.

# 网关接口容错



# 过滤器开关(上线项目怎么实时调整?)

可用于商业行为, 例如刚开始开放使用, 然后突然开启过滤器限量.

```java
@Autowired
private RedisTemplate<String, String> redisTemplate;

@Override
public boolean shouldFilter() { // 放到redis里, 服务无状态 => 实时调整
    String str = redisTemplate.opsForValue().get("test-filter");
    if (str.trim().equals("1")) {
        return true;
    }
    return false;
}
```

# Actuator(探针)查看路由, 过滤器

基本上写微服务就要用Actuator.

![image-20220406170933052](https://s2.loli.net/2022/04/06/QqtdUXTYWO4FakH.png)

# IP过滤? **==sendZuulResponse==**

次数限制, 设备号过滤. 

用过滤器 => zuul中的pre过滤器 => 继承zuulfilter设置为pre过滤器

RibbonRoutingFilter里的 **==sendZuulResponse==**

```java
// pre有错的时候, 就可以把sendZuulResponse设置为false, 节省计算资源.
sendZuulResponse(false) => 控制了不向route过滤器执行,
因为RinnbonRoutingFilter里面的shouldFilter()方法的判断条件就是包含了sendZuulResponse条件.
```



```java
// 如果我不想让指定的某个过滤器使用, 可以用
currentContext.set("IPFilter", "0"); // 某个前面执行过滤器的逻辑里面设置

// 然后在IPFilter里面的shouldFilter
@Override
public boolean shouldFilter() {
    return RequestContext.getCurrentContext().get("IPFilter").equals("1");
}
```



# ==网关总流量限流==

https://www.alibabacloud.com/blog/throttling-solutions-in-standalone-and-distributed-scenarios_596984

## 令牌桶算法 || 漏桶算法

```java
import com.google.common.util.concurrent.RateLimiter;
```

![image-20220406180820856](https://s2.loli.net/2022/04/06/JGC9W5OoaF1IY7c.png)

**令牌生成速率固定, 令牌桶容量固定, 然后调用方抢令牌, 如果抢不到拒绝.**

```java
@Component
public class LimitFilter extends ZuulFilter {
    @Override
    public String filterType() {
        return FilterConstants.PRE_TYPE;
    }
    @Override
    public int filterOrder() {
        return -10;
    }
    @Override
    public boolean shouldFilter() {
        return true;
    }
    // 2 qps(1秒  2个 请求 Query Per Second 每秒查询量)
    private static final RateLimiter RATE_LIMITER = RateLimiter.create(50); // 每秒50个
    @Override
    public Object run() throws ZuulException {
        RequestContext currentContext = RequestContext.getCurrentContext();

        if (RATE_LIMITER.tryAcquire()){
            System.out.println("通过");
            return null;
        }else {
            // 被限流的实现逻辑 例如currentContext.set("limitFlag", false);
            // 然后其他所有的Filter都要在shouldFilter()方法里
            // 加上RequestContext.getCurrentContext().get("limitFlag");作为should的条件
            System.out.println("被限流了");
            currentContext.setSendZuulResponse(false);
            currentContext.setResponseStatusCode(HttpStatus.TOO_MANY_REQUESTS.value());
        }
        return null;
    }
}
```

用Jmeter测试接口, 看看是否限流了.拓展漏桶算法: 

![8ace763134181eb8feb372f20e941988751c1ed4](https://s2.loli.net/2022/04/06/w5ZP49rcX613SgG.png)

- **Maximum Number of Requests Allowed (N):** The bucket size
- **Time Window Size (T):** The time required for the entire bucket to be drained
- **Maximum Traffic Rate (V):** The rate at which the entire bucket of water leaks, which is equal to N/T
- **Request Throttling:** Indicates that the water injection rate is greater than the water leakage rate, eventually causing an overflow of water in the bucket

```java
/**
 * The water that is in the bucket.
 */
private long left;
/**
 * The timestamp of the last successful water injection.
 */
private long lastInjectTime = System.currentTimeMillis();
/**
 * The bucket capacity.
 */
private long capacity;
/**
 * The time required for the bucket to be drained.
 */
private long duration;
/**
 * The water leakage rate of the bucket, which is equal to capacity/duration.
 */
private double velocity;

public boolean tryAcquire(String key) {
    long now = System.currentTimeMillis();
    // Water in the bucket = Previously left water – Water leaked during the past period of time.
    // Water leaked during the last period of time = (Current time – Last water injection time) × Water leakage rate
    // If the current time is too far from the last water injection time (no water has been injected for a long time), the water left in the bucket is 0 (the bucket is drained).
    left = Math.max(0, left - (long)((now - lastInjectTime) * velocity));
    // If no water overflows after one unit volume of water is injected, access is allowed.
    if (left + 1 <= capacity) {
        lastInjectTime = now;
        left++;
        return true;
    } else {
        return false;
    }
}
```

# ==对于服务的限流==



```java
@Component
public class LimitFilter implements Filter {

    // 2=每秒2个；0.1 = 10秒1个
    private static final RateLimiter RATE_LIMITER = RateLimiter.create(1);

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        // 限流的业务逻辑
        if (RATE_LIMITER.tryAcquire()){
            filterChain.doFilter(servletRequest,servletResponse);
        }else {
            servletResponse.setCharacterEncoding("utf-8");
            servletResponse.setContentType("text/html; charset=utf-8");

            PrintWriter pw = null;

            pw = servletResponse.getWriter();
            pw.write("限流了");

            pw.close();
        }
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
    }

    @Override
    public void destroy() {
    }
}
```



# Alibaba Sentinel限流

![img](https://s2.loli.net/2022/04/06/d6UVK4s2BCQwDic.png)

1. 继承ZuulFilter写过滤器 => Zuul

```java
@Component
public class SentinelFilter extends ZuulFilter {

    @Override
    public String filterType() {
        return FilterConstants.PRE_TYPE;
    }

    @Override
    public int filterOrder() {
        return -10;
    }

    @Override
    public boolean shouldFilter() {
        return true;
    }

    @Override
    public Object run() throws ZuulException {
        // 限流业务逻辑
        Entry entry = null;
        try {
            entry = SphU.entry("HelloWorld");
            System.out.println("正常请求");
            // 走后面其他过滤器的逻辑 set true => RequestContext.getCurrentContext().setSendZuulResponse(false);
            // 其他过滤器的shouldFilter()就.sendZuulResponse()获取这个boolean值.
        } catch (BlockException e) {
            e.printStackTrace();
            System.out.println("阻塞住了");
            // 不走后面其他过滤器的逻辑 set false => RequestContext.getCurrentContext().setSendZuulResponse(false);
            // 其他过滤器的shouldFilter()就get这个boolean值.
        } finally {
            if (null != entry) {
                entry.exit();
            }
        }
        return null;
    }
}
```

2. 写一个单独service包, 写一个SentinelService类

   - 首先写一个SentinelService类

     ```java
     @Service
     public class SentinelService {
         // 获取资源
         @SentinelResource(value = "SentinelService.success", blockHandler = "fail")
         public String success() {
             System.out.println("success正常请求");
             return "success";
         }
     
         public String fail(BlockException e) {
             System.out.println("fail阻塞");
             return "fail";
         }
     }
     ```

   - controller挂上, 然后调用success方法

     ```java
     @RestController
     public class controller {
     
         @GetMapping("/myController")
         public String testController(){
             System.out.println("我的调用！");
     
             return "my controller";
         }
     
         @Autowired
         private MyYml myYml;
     
         @Autowired
         private SentinelService sentinelService;
     
         @GetMapping("/controllerTest")
         public String myForward(){
             return sentinelService.success();
         }
     }
     ```

   - 启动类 => 不仅要写init, 还要准备**==SentinelResourceAspect==**, SpringCloudAlibaba就不用写, 因为集成了.

     ```java
     @SpringBootApplication
     @EnableZuulProxy
     public class CloudZuulApplication {
         public static void main(String[] args) {
             SpringApplication.run(CloudZuulApplication.class, args);
         }
         private static void init() {
             // 所有限流规则的合集
             List<FlowRule> rules = new ArrayList<>();
             FlowRule rule = new FlowRule();
     //        // 这是第一种方式继承ZuulFilter写过滤器
     //        rule.setResource("HelloWorld"); // 资源名称
     //        rule.setGrade(RuleConstant.FLOW_GRADE_QPS); // 限流类型
     //        rule.setCount(2); // 2QPS
     //        rules.add(rule);
     
             // 这是第二种方式SentinelService类
             FlowRule rule2 = new FlowRule();
             rule2.setResource("SentinelService.success"); // 资源名称
             rule2.setGrade(RuleConstant.FLOW_GRADE_QPS); // 限流类型
             rule2.setCount(2); // 2QPS 这个就是资源嘛,
             rules.add(rule2);
     
             FlowRuleManager.loadRules(rules);
         }
     
         // sentinel的SentinelResourceAspect采用aspect的around拦截SentinelResource，
         // 在执行之前进行限流判断，在捕获异常的时候，会根据异常类型判断是调用fallback方法还是调用block handler方法。
         @Bean
         public SentinelResourceAspect sentinelResourceAspect() {
             return new SentinelResourceAspect();
         }
     }
     ```
