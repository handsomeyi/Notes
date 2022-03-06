# OAuth

是一个验证授权(Authorization)的开放标准, 所有人都有基于这个标准实现自己的OAuth.

使用 **`access token`** 来进行身份验证

普遍使用OAuth 2.0

# Why?

OAuth之前用HTTP Basic Authentication, 直接传输用户名密码验证. => **不安全**

OAuth能使得第三方应用对资源访问更安全.

```xml
（1）"云冲印"为了后续的服务，会保存用户的密码，这样很不安全。
（2）Google不得不部署密码登录，而我们知道，单纯的密码登录并不安全。
（3）"云冲印"拥有了获取用户储存在Google所有资料的权力，用户没法限制"云冲印"获得授权的范围和有效期。
（4）用户只有修改密码，才能收回赋予"云冲印"的权力。但是这样做，会使得其他所有获得用户授权的客户端应用程序全部失效。
（5）只要有一个客户端应用程序被破解，就会导致用户密码泄漏，以及所有被密码保护的数据泄漏。
```





# What?

## 一些名词解释

（1） **Third-party application**：第三方应用程序，本文中又称"客户端"（client），即上一节例子中的"云冲印"。

（2）**HTTP service**：HTTP服务提供商，本文中简称"服务提供商"，即上一节例子中的Google。

（3）**Resource Owner**：资源所有者，本文中又称"用户"（user）。也就是一个人...

（4）**User Agent**：用户代理，本文中就是指浏览器。

（5）**Authorization server**：认证服务器，即服务提供商专门用来处理认证的服务器。

（6）**Resource server**：资源服务器，即服务提供商存放用户生成的资源的服务器。它与认证服务器，可以是同一台服务器，也可以是不同的服务器。

## 运行流程

OAuth在"客户端"与"服务提供商"之间，设置了一个授权层（authorization layer）。

也可以理解为认证服务器. 

![OAuth运行流程](https://s2.loli.net/2022/03/04/COhLIMkVP1KGaAw.png)







# OAuth中心组件

















参考(阮一峰的网络日志): http://www.ruanyifeng.com/blog/2014/05/oauth_2_0.html