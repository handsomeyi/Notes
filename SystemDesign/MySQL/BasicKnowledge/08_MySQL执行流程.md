# MySQL执行流程图

https://www.processon.com/view/link/621c4c570e3e745d894d3a42

# LRU缓存机制 (Buffer Pool)

详解: https://www.cnblogs.com/better-farther-world2099/articles/14768929.html

OS, MemCache: 都是用的LRU普通缓存机制

LRU就是一个定长链表

最近用过的页放在头部

超出了缓冲池长度的移除 => 太久没用过的页就被淘汰了

(预读就是读一页数据加载到buffer)

============= 预读失败? ============

预读失败: 没从加载到buffer的页读取数据

MySQL:

设置了 新生代(new sublist) -> 老生代(old sublist)

7   :   3

新数据从老生代头插入 如果新数据真的需要就再拎到新生代头

=============缓冲池污染?=============

例如查找字符串: 扫描大量数据时,大量热数据被淘汰

![image-20220228121622209](https://s2.loli.net/2022/02/28/tjcdhrSgGHQAy9l.png)