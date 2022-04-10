

# 责任链模式



![https://note.youdao.com/yws/public/resource/3cffc4f2f5185a0d83050a1d59b9ec93/xmlnote/DDC56ED82C874B8C8EE820A86A7EECAD/64AE989D64DF44F39E04048B430D8772/2054](https://raw.githubusercontent.com/handsomeyi/Pics/master/2054)





## 问题

发表帖子需要屏蔽关键字.



把将来可能会扩展功能的封装起来, 之后就可以单独扩展了, 不会影响到主线. 

和servlet.filter很类似

### version 1

```java
public class Main {
    public static void main(String[] args) {
        Msg msg = new Msg();
        msg.setMsg("大家好:)，<script>，欢迎访问 mashibing.com ，大家都是996 ");

        FilterChain fc = new FilterChain();
        fc.add(new HTMLFilter())
                .add(new SensitiveFilter());

        FilterChain fc2 = new FilterChain();
        fc2.add(new FaceFilter()).add(new URLFilter());
		
        //把List2作为元素, 加到主List上
        fc.add(fc2);

        fc.doFilter(msg);
        System.out.println(msg);

    }
}

class Msg {
    String name;
    String msg;

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }

    @Override
    public String toString() {
        return "Msg{" +
                "msg='" + msg + '\'' +
                '}';
    }
}

interface Filter {
    boolean doFilter(Msg m);
}

class HTMLFilter implements Filter {
    @Override
    public boolean doFilter(Msg m) {
        String r = m.getMsg();
        r = r.replace('<', '[');
        r = r.replace('>', ']');
        m.setMsg(r);
        return true;
    }
}

class SensitiveFilter implements Filter {
    @Override
    public boolean doFilter(Msg m) {
        String r = m.getMsg();
        r = r.replaceAll("996", "955");
        m.setMsg(r);
        return false;
    }
}

class FaceFilter implements Filter {
    @Override
    public boolean doFilter(Msg m) {
        String r = m.getMsg();
        r = r.replace(":)", "^V^");
        m.setMsg(r);
        return true;
    }
}

class URLFilter implements Filter {
    @Override
    public boolean doFilter(Msg m) {
        String r = m.getMsg();
        r = r.replace("mashibing.com", "http://www.mashibing.com");
        m.setMsg(r);
        return true;
    }
}

class FilterChain implements Filter {
    private List<Filter> filters = new ArrayList<>();

    public FilterChain add(Filter f) {
        filters.add(f);
        return this;
    }

    public boolean doFilter(Msg m) {
        for(Filter f : filters) {
            //任何一个环节 只要返回false, 就不会继续执行了
            if(!f.doFilter(m)) return false;
        }

        return true;
    }
}
```

---



### version 4

类似递归调用

![image-20211103153823424](https://raw.githubusercontent.com/handsomeyi/Pics/master/image-20211103153823424.png)

```java
package com.mashibing.dp.cor.servlet.v4;

import java.util.ArrayList;
import java.util.List;

public class Servlet_Main {
    public static void main(String[] args) {
        Request request = new Request();
        request.str = "大家好:)，<script>，欢迎访问 mashibing.com ，大家都是996 ";
        Response response = new Response();
        response.str = "response";

        FilterChain chain = new FilterChain();
        // 这个chain.add 就是加到 List<Filter> filters里面
        chain.add(new HTMLFilter()).add(new SensitiveFilter());
        chain.doFilter(request, response);
        System.out.println(request.str);
        System.out.println(response.str);
    }
}

//实现这个接口的方法必须 doFilter
interface Filter {
    void doFilter(Request request, Response response, FilterChain chain);
}

////////////////////////////////HTMLFilter//////////////////////////////////////
class HTMLFilter implements Filter {
    @Override
    public void doFilter(Request request, Response response, FilterChain chain) {
        request.str = request.str.replaceAll("<", "[").replaceAll(">", "]") + "HTMLFilter()";
        chain.doFilter(request, response);
        response.str += "--HTMLFilter()";

    }
}////////////////////////////////////////////////////////////////////////////

class Request {
    String str;
}

class Response {
    String str;
}

/////////////////////////////////SensitiveFilter///////////////////////////////
class SensitiveFilter implements Filter {
    @Override
    public void doFilter(Request request, Response response, FilterChain chain) {
        request.str = request.str.replaceAll("996", "955") + " SensitiveFilter()";
        chain.doFilter(request, response);
        response.str += "--SensitiveFilter()";

    }
}////////////////////////////////////////////////////////////////////////////


/////////////////////////////////FilterChain/////////////////////////////////
class FilterChain {
    List<Filter> filters = new ArrayList<>();
    int index = 0;

    public FilterChain add(Filter f) {
        filters.add(f);
        return this;
    }

    public void doFilter(Request request, Response response) {
        if(index == filters.size()) return;
        Filter f = filters.get(index);
        //每次调用
        index ++;

        f.doFilter(request, response, this);
    }
}//////////////////////////////////////////////////////////////////////////////
```









































