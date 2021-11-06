# Adapter-适配器

![image-20211105210755912](https://raw.githubusercontent.com/handsomeyi/Pics/master/image-20211105210755912.png)

常见用处: 

InputStreamReader

OutputStreamWriter

```java
public class Main {
    public static void main(String[] args) throws Exception {
        FileInputStream fis = new FileInputStream("c:/test.text");
        InputStreamReader isr = new InputStreamReader(fis);
        BufferedReader br = new BufferedReader(isr);
        String line = br.readLine();
        
        while (line != null && !line.equals("")) {
            System.out.println(line);
        }
        br.close();
    }
}
```

Adapter就是把两种不同的接口适配, 让他们能够协作使用,

**就像欧洲的吹风机, 到中国用, 就得配一个适配器.**