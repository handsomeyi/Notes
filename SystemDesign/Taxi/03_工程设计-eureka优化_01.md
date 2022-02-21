上节课，服务拆分，接口设计问题。

---

# 微服务项目结构

项目在独立仓库中。

整体

```sh
|--online-taxi-three
	!-- 项目A
	|-- 项目B
```

单独项目

```sh
|--pom
|--src
	|--controller
	|--service
		impl
		接口
	|--dao
    	entity
    	mapper
    |--manager
    |--constant常量
    |--request 接受的参数bean
    |--response返回参数bean
|--resource
	|--mapper
		|--xxxxMapper.xml
	yml	
```



## 异常

dao层的异常：不用打日志。catch。跑上去。

service:打日志，详细信息。时间，参数，

controller: 异常包装成 状态码。



公司maven私服：

UserBean。

dto：common。二方库。





application-dev.yml

application-qa.yml

application-prd.yml



## eureka-server优化

```
@EnableEurekaServer
```

和pom



组成eureka-server。





10个微服务：7个，= 3    70%，4  ，不开。

80%

1000     7  3（网络抖动）    93%。开。



**不同数量服务的自我保护**

**快速下线。**



map<服务名，map<实例id，实例信息>>

```
ConcurrentHashMap<String, Map<String, Lease<InstanceInfo>>>
```



# cap

eureka 为什么ap。

## 三级缓存



registry

# 优化

```sh
  server:
  	# 自我保护，看服务多少。
    enable-self-preservation: false
    # 自我保护阈值
    renewal-percent-threshold: 0.85
    # 剔除服务时间间隔
    eviction-interval-timer-in-ms: 1000
    # 关闭从readOnly读注册表
    use-read-only-response-cache: false
    # readWrite 和 readOnly 同步时间间隔。
    response-cache-update-interval-ms: 1000
```





