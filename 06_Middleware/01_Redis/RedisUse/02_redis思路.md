# 秒杀 抢100个商品
思路: 请求先到达redis(减少无效请求去DB)

### 法1° 
CacheService.class

decrNum(Interger itemID) {
//减少redis的值
//如果减完大于零 => true
//否则 => false
}

### 法2°
思路: 因为做的是数值计算, String类型的val
encoding 是 int
redis6.x的源码

可以通过2进制的操作
X 0 0 0 0 0 0 0  => 正常减
1  0 0 0 0 0 0 0 => 报错
就是到了0之后 callback 4个操作   然后后来的就报错了

### 法3° 
线程池隔离
单一商品肯定是串行减少的
介入==线程池资源隔离==的方式

TPoolConfig
TPoolimp
每个业务有自己独立的Pool 里面方式的

减少redis的无效请求:
不用的话会出现: -1 -2 并发去提交redis事务   
如果用了: 会让redis事务O(1)