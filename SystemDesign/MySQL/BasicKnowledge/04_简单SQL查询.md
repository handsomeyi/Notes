# 查询

```sql
-- 对emp表查询：
select * from emp; -- *代表所有数据
-- 显示部分列：
select empno,ename,sal from emp;
-- 显示部分行：where子句
select * from emp where sal > 2000;
-- 显示部分列，部分行：
select empno,ename,job,mgr from emp where sal > 2000;
```

# 别名

```sql
-- 起别名：
select empno 员工编号,ename 姓名,sal 工资 from emp; -- as 省略，''或者""省略了
-- as alias 别名
select empno as 员工编号,ename as 姓名,sal as 工资 from emp;
select empno as '员工编号',ename as "姓名",sal as 工资 from emp;
-- > 1064 - You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near '编号,ename as "姓 名",sal as 工资 from emp' at line 1
-- 错误原因：在别名中有特殊符号的时候，''或者""不可以省略不写
select empno as 员工 编号,ename as "姓 名",sal as 工资 from emp;
```

# 运算

```sql
-- 算术运算符：
select empno,ename,sal,sal+1000 as '涨薪后',deptno from emp where sal < 2500;
select empno,ename,sal,comm,sal+comm from emp;  -- ？？？后面再说
```

# 去重

```sql
-- 去重操作：
select job from emp;
select distinct job from emp;
select job,deptno from emp;
select distinct job,deptno from emp; -- 对后面的所有列组合 去重 ，而不是单独的某一列去重
```

# 排序

```sql
-- 排序：
select * from emp order by sal; -- 默认情况下是按照升序排列的
select * from emp order by sal asc; -- asc 升序，可以默认不写
select * from emp order by sal desc; -- desc 降序
select * from emp order by sal asc ,deptno desc; -- 在工资升序的情况下，deptno按照降序排列
```

# where条件查询

```sql
-- 查看emp表：
select * from emp;
-- where子句：将过滤条件放在where子句的后面，可以筛选/过滤出我们想要的符合条件的数据：
-- where 子句 + 关系运算符
select * from emp where deptno <> 10;
select * from emp where deptno != 10;
select * from emp where job = 'clerk'; -- 默认情况下不区分大小写 
select * from emp where binary job = 'clerk'; -- binary区分大小写
select * from emp where hiredate < '1981-12-25';
-- where 子句 + 逻辑运算符：and 
select * from emp where sal > 1500 and sal < 3000;  -- (1500,3000)
select * from emp where sal > 1500 && sal < 3000; 
select * from emp where sal > 1500 and sal < 3000 order by sal;
select * from emp where sal between 1500 and 3000; -- [1500,3000]
-- where 子句 + 逻辑运算符：or
select * from emp where deptno = 10 or deptno = 20;
select * from emp where deptno = 10 || deptno = 20;
select * from emp where deptno in (10,20);
select * from emp where job in ('MANAGER','CLERK','ANALYST');
```

## where模糊查询

%代表任意多个字符 (可以为0个字符)

```sql
-- where子句 + 模糊查询：
-- 查询名字中带A的员工  -- %代表任意多个字符 0,1,2，.....
select * from emp where ename like '%A%' ;
-- _任意一个字符
select * from emp where ename like '__A%' ;
-- 关于null的判断：
select * from emp where comm is null;
select * from emp where comm is not null;
-- 小括号的使用  ：因为不同的运算符的优先级别不同，加括号为了可读性
select * from emp where job = 'SALESMAN' or job = 'CLERK' and sal >=1500; -- 先and再or  and > or
select * from emp where job = 'SALESMAN' or (job = 'CLERK' and sal >=1500); 
select * from emp where (job = 'SALESMAN' or job = 'CLERK') and sal >=1500;
```

**参考完整版(正则, 通配符, 内置函数等)**: https://cloud.tencent.com/developer/article/1655586

1. 注意大小写,在使用模糊匹配时,也就是匹配文本时,MySQL默认配置是不区分大小写的。
2. 注意尾部空格,"%test"是不能匹配"test "这样的记录的。
3. null不能通过 "%" 查到





