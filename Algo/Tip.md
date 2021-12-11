# 一些固定的需要记忆的结论

---


### 任何数%1都是等于0  

### 重要结论: N层汉诺塔问题固定最优解: 2^N - 1   

### 一个整数除2向上取整: N+1/2, 不用管这个数是奇数还是偶数   

### x & -x : 提取出x最右侧的1出来
10101000 --> 00001000
-x:计组知识 -x就是~x+1
再和x与一下, 就得到最右侧的1

### (x & 1) == 1 就是奇数 否则偶数  
if((a & 1) == 1){
printf("奇数");  
}else{    
printf("偶数");



### 分配律 (*a*⋅*b*)mod*m *= [(*a *mod* m*)⋅ (*b *mod* m*)] mod* m

也就是模可以分开取模, 得到的结果相乘 再取模









https://blog.csdn.net/qq_40178464/article/details/79941843

一维数组拷贝的方式：clone（）方法







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
