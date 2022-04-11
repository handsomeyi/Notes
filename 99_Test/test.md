# 数据库连接测试

```java

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
public class how {
    //属性
    private static String driver="com.mysql.cj.jdbc.Driver";
//JDBC驱动类名
    private static final String URL="jdbc:mysql://localhost:3306/hgs?serverTimezone=GMT%2B8&useUnicode=true&characterEncoding=utf8&useSSL=false";
    private static final String USER="root";
//用户名
    private static final String PASSWORD="root";
//密码
    //创建连接
    public static Connection getConnection(){
        Connection conn=null;
        try {
            Class.forName(driver);
 //加载jdbc驱动
            conn=DriverManager.getConnection(URL, USER, PASSWORD);
//创建连接
            //System.out.println("创建连接成功！");
        } catch (Exception e) {
            e.printStackTrace();
        }
 
        return conn;
    }
    //关闭连接
    public static void close(Connection conn,Statement st,ResultSet rs){
        if(rs!=null){
            try {
                rs.close();
                //System.out.println("关闭rs成功！");
            } catch (Exception e) {
                // TODO: handle exception
                e.printStackTrace();
            }
        }
        if(st!=null){
            try {
                st.close();
                //System.out.println("关闭st成功！");
            } catch (Exception e) {
                // TODO: handle exception
                e.printStackTrace();
            }
        }
        if(conn!=null){
            try {
                conn.close();
                //System.out.println("关闭conn成功！");
            } catch (Exception e) {
 
                // TODO: handle exception
                e.printStackTrace();
            }
        }
    }
 
 
    public static void main(String[] args) {
 
        try        {
            Connection conn = how.getConnection();
            if(conn!=null)
            {
                System.out.println("数据库连接正常！");
            }
            else            {
                System.out.println("数据库连接异常！");
            }
        }
        catch(Exception ex)
        {
            ex.printStackTrace();
        }
 
    }
}
```



bx_java

https://www.cnblogs.com/_programmer/p/3396933.html

关于时间的帖子,    **计时用System.nanoTime() ,计算程序运行的时间**
如果用 System.currentTimeMillis可能会导致很多时间都一样



**Hello MarkDown!**

![image-20211013164042399](C:\Users\handsomeyi\AppData\Roaming\Typora\typora-user-images\image-20211013164042399.png)

# nice1

## 1.1

## 1.2

# nice2

## 2.1

## 2.2

![](https://raw.githubusercontent.com/handsomeyi/Pics/master/202110131740395.jpg)











## ![](https://raw.githubusercontent.com/handsomeyi/Pics/master/Aurora-4k.jpg)





![image-20211013200802238](https://raw.githubusercontent.com/handsomeyi/Pics/master/202110132008315.png)

![image-20211013200713471](https://raw.githubusercontent.com/handsomeyi/Pics/master/202110132007527.png)



MarkDown yyds!









之前的也就算了 没啥事儿

3.24面试翻车 还是不够优秀呗 就很难受...
