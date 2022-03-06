# 总体说明

> 出题官请移步这里：[出题指引](https://labfiles.acmcoder.com/ojhtml/index.html?v=1#/intver)

> 所有的测试用例输入，最后一行都有一个回车"\n"！！！

> Linux系统，文件名大小写敏感，在c/c++引用头文件时尤其需要注意；

> 读取输入时，不要自行加提示消息，例如：```raw_input('Please input two numbers: ')```；

> 输出答案时，不要自行添加提示消息，例如：```printf("My answer is:\n")```；

> 答案输出完毕时，不要让控制台等待，例如：```system("pause")```；

> 您的程序只能从标准输入（stdin，即“键盘”）读入，并输出到标准输出（stdout，即“屏幕”）；

> 不允许操作文件或者访问网络，否则将导致不正确的结果；

> 请不要引用不必要的头文件或命名空间。

# 输出超限解释

> 在我们检测您的程序输出时，发现输出的字符个数比正确答案多了，所以不用比对，已经是错误的；

> 这个时候就会给您返回输出超限，其实您可以认为就是答案错误。

# 输入输出

## OJ运行原理：

```bash
for usercase in `ls .`
do
  cat $usercase | 你的脚本或编译后的程序 > test.out
done
```
也就是说，后台每一个测试用例都会重启您的应用。

## 注意事项
> 您的程序需要从stdin读入数据，并输出到stdout；

> 数据的输入输出格式请遵循题目的描述。

## 可能遇到的坑（持续补充中ing）

> 有些题目是客户自己出的，可能描述不会很人性化，我们监控到后台提问时会及时发布公告进行说明，请留意公告，并看清楚测试样例（*注意是真实的样例输入，而不是样例描述*，有的时候描述可能会有瑕疵，但是真实的样例输入是经过代码验证的）；

> 有些输入说明告诉你是输入一个整数n，一般的输入样例肯定是真的给你一个整数，但是，有些客户出题会是n=3；带上“n=”这2个字符。

> 有些输入说明告诉你是输入一个数组arr，一般输入的样例是n个空格分隔的数字，但是，有些客户出题会是[1,2,3,4,5]，您读到的输入有中括号，以及逗号，而且逗号前后可能还有空格。

> 关于为什么不提供类似于leetcode的免输入输出模式，这个需要后台录题时录入模版，我们后台是支持免输入输出模式的，但是很少客户使用；我们理解可能是功能不完善，如果有愿意加入我们的，请发送简历至"postmaster@acmcoder.com"。

> 陆续补坑......

## “奇怪”的输入输出

### 说明
> 目前，赛码网有大一半的题目都是客户自己的出题官出的，也就是说可能是你未来的同事出的；

> 对于这些题目的输入输出，可能会有些直接，需要考生多编写点输入输出代码；

> 我们尽量在改进出题系统的核心函数模式，让更多的出题官愿意使用核心函数模式；

> 有些考生可能要吐槽，客户自己出的题目，赛码网为什么不改进下题目的输入输出？

这个问的很好，因为目前赛码网的编程题的出题量是巨大的，根本审核不过来，只要题目能跑通，题目就是合格的。

### 没有给出矩阵的行列数
```
有些输入可能是：
输入一个矩阵，每行以空格分隔。
3 2 3
1 6 5
7 8 9
```

> 对于这种没有给定矩阵行列数的输入，我们只能按照字符串拆分来进行。

> python
```python3
#!/usr/bin/env python  
# coding=utf-8
arr = []
while 1:
    s = input()

    if s != "":
        arr.append(list(map(int, s.split())))
    else:
        break
# 使用自测数据按钮时调试用，正式提交时要删掉。
print(arr)
```

> js

```js
let arr = [];
let line;
while ((line = read_line()) != "") {
    arr.push(line.split(' ').map(v=>parseInt(v)));
}
// 使用自测数据按钮时调试用，正式提交时要删掉。
for (let i=0; i<arr.length; i++) {
    for (let j=0; j<arr[i].length; j++) {
        printsth(arr[i][j], ' ');
    }
    print();
}
```

> java

```java
import java.io.*;
import java.util.*;

class Solution {
    public void myFunc(ArrayList<ArrayList<Integer>> arr) {
        // 使用自测数据按钮时调试用，正式提交时要删掉。
        System.out.println(arr);
    }
}
public class Main
{
    public static void main(String args[])
    {
        Scanner cin = new Scanner(System.in);
        ArrayList<ArrayList<Integer>> arr = new ArrayList<ArrayList<Integer>>();
        while(cin.hasNextLine())
        {
            ArrayList<Integer> row = new ArrayList<Integer>();
            String line = cin.nextLine();
            if (line.length() > 0) {
                String[] arrLine = line.split(" ");
                for (int i=0; i<arrLine.length; i++) {
                    row.add(Integer.parseInt(arrLine[i]));
                }
                arr.add(row);
            }
        }
        
        new Solution().myFunc(arr);
    }
}
```

> c

```c
#include <stdio.h>
int main()
{
    int arr[1024][1024];
    int row = 0, col = 0, j = 0;
    char c;
    while(scanf("%d", &arr[row][j]) != EOF) {
        c = getchar();
        if (row == 0) col++;
        if (c == '\n') {
            row++;
            j = 0;
        } else if (c == ' ') {
            j++;
        }
    }
    // 使用自测数据按钮时调试用，正式提交时要删掉。
    printf("rows: %d, cols: %d\n", row, col);
    for (int i=0; i<row; i++) {
        for (int k=0; k<col; k++) {
            printf("%d ", arr[i][k]);
        }
        printf("\n");
    }
}
```

> c++

```c++
#include <iostream>
#include <vector>
#include <string>
#include <sstream>
using namespace std;
int main() {
    vector<vector<int>> arr;
    string input;
    while (getline(cin, input)) {
        if (input.size() > 0) {
            stringstream stringin(input);
            int num;
            vector<int> a;
            while (stringin >> num) {
                a.push_back(num);
            }
            arr.push_back(a);
        }
    }
    // 使用自测数据按钮时调试用，正式提交时要删掉。
    cout << "rows: " << arr.size() << ", cols: " << arr[0].size() << endl;
    for (int i=0; i<arr.size(); i++) {
        for (int j=0; j<arr[i].size(); j++) {
            cout << arr[i][j] << " ";
        }
        cout << endl;
    }
}
```

### Js读取超长字符串

> 由于read_line()只能读取1024个字符，所以如果题目中的用例涉及到长度大于1024字符串的，需要用到gets(n)这个函数。

```
例如有这样一个题目，读取一个字符串，计算其长度。
备注：字符串的长度范围为1到10000;
代码一般这么写：
```

```js
let line = gets(10000);
print(line.length);
```

```
如果测试用例长度刚好10000，则没有问题。
如果测试用例长度为小于10000，假设是100，则您的答案为101，错误。
因为gets(n)函数在遇到回车，或者第n个字符时，都会结束，但是如果是遇到回车结束的，则回车也会包含在返回值当中，所以，应该trim一下。
```

```js
let line = gets(10000).trim();
print(line.length);
```

### 输入数组中带有中括号和逗号
```
有些输入可能是，输入一个矩阵：
[[3,2,3],
 [1,6,5],
 [7,8,9]]
```

> 对于这种没有给定矩阵行列数的输入，而且还包含中括号和逗号的输入，我们也是只能按照字符串拆分来进行。

这里逗号和右中括号是关键。

> python
```python3
#!/usr/bin/env python  
# coding=utf-8
arr = []
while 1:
    s = input()

    if s != "":
        arr.append(list(map(int, s.replace("],", "").replace(" ", "").replace("[", "").replace("]", "").split(","))))
    else:
        break
# 使用自测数据按钮时调试用，正式提交时要删掉。
print(arr)
```

> js

```js
let arr = [];
let line;
while ((line = read_line()) != "") {
    arr.push(line.replace(/\]\,/g, "").replace(/ /g, "").replace(/\[/g, "").replace(/\]/g, "").split(",").map(v=>parseInt(v)));
}
// 使用自测数据按钮时调试用，正式提交时要删掉。
for (let i=0; i<arr.length; i++) {
    for (let j=0; j<arr[i].length; j++) {
        printsth(arr[i][j], ' ');
    }
    print();
}
```

> java

```java
import java.io.*;
import java.util.*;

class Solution {
    public void myFunc(ArrayList<ArrayList<Integer>> arr) {
        // 使用自测数据按钮时调试用，正式提交时要删掉。
        System.out.println(arr);
    }
}
public class Main
{
    public static void main(String args[])
    {
        Scanner cin = new Scanner(System.in);
        ArrayList<ArrayList<Integer>> arr = new ArrayList<ArrayList<Integer>>();
        while(cin.hasNextLine())
        {
            ArrayList<Integer> row = new ArrayList<Integer>();
            String line = cin.nextLine().trim();
            if (line.length() > 0) {
                String[] arrLine = line
                    .replace("],", "")
                    .replace(" ", "")
                    .replace("[", "")
                    .replace("]", "")
                    .split(",");

                for (int i=0; i<arrLine.length; i++) {
                    row.add(Integer.parseInt(arrLine[i]));
                }
                arr.add(row);
            }
        }
        
        new Solution().myFunc(arr);
    }
}
```

> c

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main()
{
    int arr[1024][1024];
    char buf[1024];
    char *tok;
    
    int row = 0, col = 0, j = 0;
    while(NULL != gets(buf)) {
        if (strlen(buf) > 0) {
            tok = strtok(buf, " ,[]");
            while (tok != NULL) {
                arr[row][j++] = atoi(tok);
                if (row == 0) col++;
                tok = strtok(NULL, " ,[]");
            }
            row++, j = 0;
        }
    }
    // 使用自测数据按钮时调试用，正式提交时要删掉。
    printf("rows: %d, cols: %d\n", row, col);
    for (int i=0; i<row; i++) {
        for (int k=0; k<col; k++) {
            printf("%d ", arr[i][k]);
        }
        printf("\n");
    }
}
```

> c++

```c++
#include <iostream>
#include <vector>
#include <string>
#include <string.h>
#include <sstream>
using namespace std;
int main() {
    vector<vector<int>> arr;
    string input;
    char *tok;
    while (getline(cin, input)) {
        if (input.size() > 0) {
            vector<int> a;
            tok = strtok((char *)input.c_str(), " ,[]");
            while (tok != NULL) {
                a.push_back(stoi(tok));
                tok = strtok(NULL, " ,[]");
            }
            arr.push_back(a);
        }
    }
    // 使用自测数据按钮时调试用，正式提交时要删掉。
    cout << "rows: " << arr.size() << ", cols: " << arr[0].size() << endl;
    for (int i=0; i<arr.size(); i++) {
        for (int j=0; j<arr[i].size(); j++) {
            cout << arr[i][j] << " ";
        }
        cout << endl;
    }
}
```

### 输出数组或矩阵

> 有些时候，出题人可能是直接用python进行的验题，输出二维数组时，是带有中括号和逗号的。

```python3
arr = [[1,2,3],[4,5,6]]
print(arr)
```
输出是：
```
[[1, 2, 3], [2, 3, 4]]
```

```
输出已经拼好了中括号和逗号，但是，别的语言就没有这么幸运，需要自己拼凑这些。
```

> js

```js
let arr = [[1,2,3],[4,5,6]]
console.log(arr.toString())
// 输出是：1,2,3,4,5,6
// 这样就错了，没有中括号

console.log(JSON.stringify(arr));
// 这样是对的

// 这样也是可以的
printsth('[');
for (let i=0; i<arr.length; i++) {
    printsth('[');
    printsth(arr[i].join(', '));
    printsth(']');
    if (i < arr.length - 1)
        printsth(', ');
}
print(']');
```

## 自测模式
> 您可以使用编程界面的“自测数据”进行样例数据或自定义数据的调试；

> 样例数据您需要自行从题干拷贝粘贴到自测数据中；（后续产品升级时，会替您录入第一个样例数据到自测数据中）

> 您可以添加多个自定义数据；

## 提交及计算成绩
> 在非“自测数据”状态下，点击调试按钮，就算最后的提交；

> 我们只取最后一次的提交计算最终成绩。

# Java
## 版本
> 1.8.0_66
```bash
root@oj-tk2sd:/# java -version
java version "1.8.0_66"
Java(TM) SE Runtime Environment (build 1.8.0_66-b17)
Java HotSpot(TM) 64-Bit Server VM (build 25.66-b17, mixed mode)
root@oj-tk2sd:/# javac -version
javac 1.8.0_66
root@oj-tk2sd:/#
```

## 编译命令
```javac -encoding UTF8 Main.java```

## 运行命令
```cat usercase.in | java Main```

## 类名：public class Main
> 根据编译命令和运行命令，我们可以得出：

不要自定义包名称，否则会报错，即不要添加package answer之类的语句；

您可以写很多个类，但是必须有一个类名为Main，并且为public属性，并且Main为唯一的public class；

Main类的里面必须包含一个名字为'main'的静态方法（函数），这个方法是程序的入口。

## 示例代码
```java
//package main
//注意不要添加包名称，否则会报错。

import java.io.*;
import java.util.*;
class Solution {
    public int addab(int a, int b) {
        return a+b;
    }
}
public class Main
{
    public static void main(String args[])
    {
        Scanner cin = new Scanner(System.in);
        int a, b;
        while(cin.hasNextInt())
        {
            a = cin.nextInt();
            b = cin.nextInt();
            Solution s = new Solution();
            int c = s.addab(a, b);
            System.out.println(c);
        }
    }
}
```

# 
# golang
## 版本 1.2.1
> go version go1.2.1 linux/amd64

> go version go1.13.15 linux/amd64 灰度中...

## 编译命令
```bash
go build -o Main.exe -p 1 Main.go
```

## 示例代码
```go
package main
import "fmt"
import "io"
func main() {
  a:=0
  b:=0
  for {
    _, err := fmt.Scanf("%d%d",&a,&b)
    if err != nil {
        if err == io.EOF {
            break
        }
    } else {
		fmt.Printf("%d\n",a+b)
	}
  }
}
```

