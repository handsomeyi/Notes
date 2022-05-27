# Redis为什么快? 

# TPS/QPS是多少? 

10w

# 解决了项目什么问题?

- 为什么快? 

  基于单线程

- 

# Redis rehash

rehash有2种工作模式

lazy rehashing：在每次对dict进行操作的时候执行一个slot的rehash

active rehashing：每100ms里面使用1ms时间进行rehash。

这两者==都是渐进式hash==, 这是rehash的两种模式, 
前者是主动渐进, 比如100ms拿出1ms用来rehash; 
而后者则是请求来的的那个数据顺便rehash一下.

