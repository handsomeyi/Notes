# 一些固定的需要记忆的结论

---
# [java归并排序，单线程vs多线程](https://www.cnblogs.com/bobsha/p/5698106.html)


### 任何数%1都是等于0  

### 重要结论: N层汉诺塔问题固定最优解: 2^N - 1   

### 一个整数除2向上取整: (N+1)/2, 不用管这个数是奇数还是偶数   

### x & -x : 提取出x最右侧的1出来
10101000 --> 00001000
-x:计组知识 -x就是~x+1
再和x与一下, 就得到最右侧的1

### (x & 1) == 1 就是奇数 否则偶数  
if((a & 1) == 1){
printf("奇数");  
}else{    
printf("偶数");



### 分配律 (*a*⋅*b*)%m *= [(*a % m*)⋅ (*b *%* m*)] %* m

也就是模可以分开取模, 得到的结果相乘 再取模

#### (a + b) % m = [(a % m) + (b % m)] % m







https://blog.csdn.net/qq_40178464/article/details/79941843

一维数组拷贝的方式：clone（）方法



### 异或交换 [ 注意：当a和b相等时，该方法不适用]

```java
// 交换arr的i和j位置上的值
public static void swap(int[] arr, int i, int j) {
   arr[i] = arr[i] ^ arr[j];
   arr[j] = arr[i] ^ arr[j];
   arr[i] = arr[i] ^ arr[j];
}
```



### 常见ASCII码

ASCII：美国信息交换标准代码（American Standard Code for Information Interchange）

null，空字符对应ASCII码的0（创建一个字符数组，其默认值是'\u0000'，转成整数就是0）

数字的0-9对应ASCII码的48-57

大写字母的A-Z对应ASCII码的65-90

小写字母的a-z对应ASCII码的97-122

（小提示：先按住键盘上的 "Alt" 键不放，再用小键盘上的数字键输入码值即可输出该码值对应的字符）

![img](https://s2.loli.net/2021/12/10/b4fcYwJMnVDNlBP.jpg)

————————————————
原文链接：https://blog.csdn.net/weixin_43916982/article/details/115683057





```java
String.valueOf(s);
```



### 遍历HashMap

```java
public static void main(String[] args) {
        //一般来说,最好初始化一下, 小于12的就不要初始化了
        // 默认的就是16,因为加载因子是0.75,也就是到16*0.75=12的时候会扩容
        Map<String, String> map = new HashMap<>(3);
        map.put("welcome","to");
        map.put("java","study");
        map.put("wechat","best396975802");
//遍历方法1: 先遍历key , 再取出value
        System.out.println("遍历方法1: 先遍历key , 再取出value");
        for (String key : map.keySet()) {
            System.out.println("key is "+key);
            System.out.println("value is "+ map.get(key));
        }
//遍历方法2: 直接遍历value
        System.out.println("遍历方法2: 直接遍历value");
        for (String value : map.values()) {
            System.out.println("value is "+value);
        }
//遍历方法3: 通过遍历entry来取Key和value,推荐的方法!!!
        System.out.println("遍历方法3: 通过遍历entry来取Key和value,推荐的方法!!!");
        for (Map.Entry<String, String> entry : map.entrySet()) {
            System.out.println("key is "+entry.getKey());
            System.out.println("value is "+ entry.getValue());
        }
//遍历方法4: 通过forEach方法直接遍历key和value
        System.out.println("遍历方法4: 通过forEach方法直接遍历");
        map.forEach((key,value)->{
            System.out.println("key is "+ key);
            System.out.println("value is "+ value);
        });
    }
```

————————————————

原文连接: https://cloud.tencent.com/developer/article/1532402







## ++i和i++的区别

单独使用的时候是没有区别的，但是如果当成运算符，就会有区别了！

如图所示，我们用a=i++和a=++i举例说明

1.先说a=i++，这个运算的意思是先把i的值赋予a，然后在执行i=i+1；

当i初始等于3时，执行a=i++，最终结果a=3，i=4.

2.而a=++i，这个的意思是先执行i=i+1，然后在把i的值赋予a；

当i初始等于3时，执行a=++i，最终结果a=4，i=4.

![img](https://pic3.zhimg.com/80/v2-5a60b1f6b10c18fb3445d98ff17d97f6_720w.jpg)

**所以说两者参与运算时的区别就是：**

1. a=i++ , a 返回原来的值a=i,i=i+1;
   a=++i , a 返回加1后的值,a=i+1,i=i+1。
   也就是**i++是先赋值，然后再自增；++i是先自增，后赋值。**
2. 第二个区别就是： i++ 不能作为左值，而++i可以。



### 返回最大值及其下标

	int max = 0;
	int maxIndex = 0;
	for (int i = 0; i < arr.length; i++) {
			if (arr[i] > max) {
				max = arr[i];
				maxIndex = i;
			}
		}
————————————————
版权声明：本文为CSDN博主「码点」的原创文章，遵循CC 4.0 BY-SA版权协议，转载请附上原文出处链接及本声明。
原文链接：https://blog.csdn.net/qq_31939617/article/details/83822397


### 防止溢出的方法：

