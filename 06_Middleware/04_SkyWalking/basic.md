# Apache Skywalking

APM(Application Performance Management)应用性能管理

Skywalking基于探针技术实现链路追踪.(零侵入零耦合)

![img](https://s2.loli.net/2022/03/10/83EbGA2jMdDzWRl.png)

总体来说可以粗略分为三个部分: 

- collector(收集器): 链路数据收集器, 数据可以落地ElasticSearch, 单机也可以落地H2, 不推荐, H2仅作为临时演示用
- agent(探针): 用来收集和发送数据到收集器
- web: web可视化平台, 用于展示落地的数据



# 安装部署

官方网站

http://skywalking.apache.org/

## 下载

http://skywalking.apache.org/downloads/

## 启动

![image-20220307111847144](https://s2.loli.net/2022/03/07/Q8ix6TPF7DsBZNK.png)

# 接入探针 

## 脚本

```shell
#!/bin/sh
# SkyWalking Agent配置
export SW_AGENT_NAME=boot-micrometer #Agent名字,一般使用`spring.application.name`
export SW_AGENT_COLLECTOR_BACKEND_SERVICES=127.0.0.1:11800 #配置 Collector 地址. 
export SW_AGENT_SPAN_LIMIT=2000 #配置链路的最大Span数量, 默认为 300. 
export JAVA_AGENT=-javaagent:/root/apache-skywalking-apm-bin/agent/skywalking-agent.jar
java $JAVA_AGENT -jar springcloudalibaba-0.0.1-SNAPSHOT.jar #jar启动
```

## idea(VM option)

```java
-javaagent:C:/dev/apache-skywalking-apm-8.2.0/apache-skywalking-apm-bin/agent/skywalking-agent.jar -Dskywalking.agent.service_name=provider -Dskywalking.collector.backend_service=192.168.150.113:11800
```

# 监控dashboard

![image-20220307112151621](https://s2.loli.net/2022/03/07/COmHDxht7qZsXkl.png)

dashboard: http://192.168.150.113:8080/

**数据收集端口: **

- Http默认端口 12800

- gRPC默认端口 11800

### Global全局维度

**Services load**: 服务每分钟请求数

**Slow Services**: 慢响应服务, 单位ms

**Un-Health services(Apdex)**:Apdex性能指标, 1为满分. 

- Apdex 一个由众多网络分析技术公司和测量工业组成的联盟组织, 它们联合起来开发了“应用性能指数”即“Apdex”(Application Performance Index), 用一句话来概括, Apdex是用户对应用性能满意度的量化值
- http://www.apdex.org/

**Slow Endpoints**: 慢响应端点, 单位ms

**Global Response Latency**: 百分比响应延时, 不同百分比的延时时间, 单位ms

**Global Heatmap**: 服务响应时间热力分布图, 根据时间段内不同响应时间的数量显示颜色深度



### Service服务维度

**Service Apdex(数字**）:当前服务的评分 

**Service Avg Response Times**: 平均响应延时, 单位ms

**Successful Rate(数字）**: 请求成功率

**Servce Load(数字）**: 每分钟请求数

**Service Apdex(折线图）**: 不同时间的Apdex评分

**Service Response Time Percentile**: 百分比响应延时

**Successful Rate(折线图）**: 不同时间的请求成功率

**Servce Load(折线图）**: 不同时间的每分钟请求数

**Servce Instances Load**: 每个服务实例的每分钟请求数

**Slow Service Instance**: 每个服务实例的最大延时

**Service Instance Successful Rate**: 每个服务实例的请求成功率



### Instance

**Service Instance Load**: 当前实例的每分钟请求数

**Service Instance Successful Rate**: 当前实例的请求成功率

**Service Instance Latency**: 当前实例的响应延时

**JVM CPU**:jvm占用CPU的百分比

**JVM Memory**: JVM内存占用大小, 单位m

**JVM GC Time**: JVM垃圾回收时间, 包含YGC和OGC

**JVM GC Count**: JVM垃圾回收次数, 包含YGC和OGC

### Endpoint

**Endpoint Load in Current Service**: 每个端点的每分钟请求数

**Slow Endpoints in Current Service**: 每个端点的最慢请求时间, 单位ms

**Successful Rate in Current Service**: 每个端点的请求成功率

**Endpoint Load**: 当前端点每个时间段的请求数据

**Endpoint Avg Response Time**: 当前端点每个时间段的请求行响应时间

**Endpoint Response Time Percentile**: 当前端点每个时间段的响应时间占比

**Endpoint Successful Rate**: 当前端点每个时间段的请求成功率



# Skywalking对服务的性能影响分析及多线程下的链路传递

https://www.jianshu.com/p/c7076b8c6cb5

skywalking对服务启动时间还是有影响的, 且服务越小影响越大.

其探针是使用 JavaAgent 的两大字节码操作工具之一的**ByteBuddy** (另外一个是Javassist) 实现的

# JavaAgent

Javaagent是java命令的一个参数. 参数 javaagent 可以用于指定一个 jar 包, 并且对该 java 包有2个要求: 

1. **这个 jar 包的 MANIFEST.MF 文件必须指定 Premain-Class 项.** 
2. **Premain-Class 指定的那个类必须实现 premain() 方法.** 

premain 方法, 从字面上理解, 就是运行在 main 函数之前的的类. 当Java 虚拟机启动时, 在执行 main 函数之前, JVM 会先运行`-javaagent`所指定 jar 包内 **Premain-Class** 这个类的 **premain** 方法 . 

Skywalking本质上就是个JavaAgent. 



## Demo

- 准备两个类

```java
public class JavaAgentDemo {

	// 该方法在main方法之前运行，与main方法运行在同一个JVM中
    public static void premain(String agentArgs, Instrumentation inst) {
        System.out.println("------ premain method for two args ------ agentArgs:" + agentArgs + " inst:" + inst.toString());
    }
	// 如果没传参数 或者不存在上面的方法 则默认这个
    public static void premain(String agentArgs) {
        System.out.println("------ premain method for one args ------ agentArgs:" + agentArgs);
    }
}

public class AgentTest {
    public static void main(String[] args) {
        System.out.println(" ------ main method");
    }
}

```

- 在pom.xml同级目录 mvn clean package 把这个maven项目打成jar
- VMoptions: -javaagent:C:\IDEA_workspace\coding-for-great-offer\java-test-javaagent\target/java-test-javaagent-1.0-SNAPSHOT.jar="hello world"

- 然后run
