有各种各样的负载平衡方法，它们针对不同的需求使用不同的算法。

## Least Connection Method 最少接驳法
 — This method directs traffic to the server with the fewest active connections. This approach is quite useful when there are a large number of persistent client connections which are unevenly distributed between the servers. 这种方法将流量导向活动连接最少的服务器。当服务器之间存在大量不均匀分布的持久客户端连接时，这种方法非常有

## east Response Time Method 最小响应时间法 
— This algorithm directs traffic to the server with the fewest active connections and the lowest average response time. 
	该算法将流量导向活动连接最少、平均响应时间最短的服务器
	
## Least Bandwidth Method 最小带宽法
- This method selects the server that is currently serving the least amount of traffic measured in megabits per second (Mbps). - 此方法选择当前提供最少流量的服务器(以兆比特每秒(Mbps)为单位)

## Round Robin Method 循环法
 This method cycles through a list of servers and sends each new request to the next server. When it reaches the end of the list, it starts over at the beginning. It is most useful when the servers are of equal specification and there are not many persistent connections. ー这种方法循环使用一个服务器列表，并将每个新的请求发送到下一个服务器。当它到达列表的末尾时，它从头开始。当服务器具有相同的规范并且没有很多持久性连接时，它是最有用的

```c
j = i;
do
{
j = (j + 1) mod n;
i = j;
return Si;
} while (j != i);
return NULL;
```


## Weighted Round Robin Method 加权循环法
 — The weighted round-robin scheduling is designed to better handle servers with different processing capacities. Each server is assigned a weight (an integer value that indicates the processing capacity). Servers with higher weights receive new connections before those with less weights and servers with higher weights get more connections than those with less weights. ー加权 round robin 的设计是为了更好地处理不同处理能力的服务器。为每个服务器分配一个权重(表示处理能力的整数值)。权重较高的服务器获得新的连接，权重较低的服务器获得更多的连接，权重较高的服务器获得更多的连接

```c
#include <stdlib.h>
#include <stdio.h>
#include <unistd.h>
#include <string.h>

typedef struct
{
int weight;
char name[2];
}server;


int getsum(int *set, int size)
{
int i = 0; 
int res = 0;

for (i = 0; i < size; i++)
res += set[i];

return res;
}

int gcd(int a, int b)
{
int c;
while(b)
{
c = b;
b = a % b;
a = c;
}

return a;
}

int getgcd(int *set, int size)
{
int i = 0; 
int res = set[0];

for (i = 1; i < size; i++)
res = gcd(res, set[i]);

return res;
}

int getmax(int *set, int size)
{
int i = 0; 
int res = set[0];

for (i = 1; i < size; i++)
{
if (res < set[i]) res = set[i];
}

return res;
}


int lb_wrr__getwrr(server *ss, int size, int gcd, int maxweight, int *i, int *cw) 
{
while (1) 
{
*i = (*i + 1) % size;
if (*i == 0) 
{
*cw = *cw - gcd;
if (*cw <= 0) 
{
*cw = maxweight;
if (*cw == 0) 
{
return -1;
}
}
}
if (ss[*i].weight >= *cw) 
{
return *i;
}
}
}

void wrr(server *ss, int *weights, int size)
{
int i = 0;

int gcd = getgcd(weights, size);
int max = getmax(weights, size);
int sum = getsum(weights, size);


int index = -1;
int curweight = 0;

for (i = 0; i < sum; i++) 
{
lb_wrr__getwrr(ss, size, gcd, max, &(index), &(curweight));
printf("%s(%d) ", ss[index].name, ss[index].weight);
}

printf("\n");
return;
}

server *initServers(char **names, int *weights, int size)
{
int i = 0;
server *ss = calloc(size, sizeof(server));


for (i = 0; i < size; i++)
{
ss[i].weight = weights[i];
memcpy(ss[i].name, names[i], 2);
}

return ss;
}

int main()
{
int i = 0;

int weights[] = {1, 2, 4};
char *names[] = {"a", "b", "c"};
int size = sizeof(weights) / sizeof(int);


server *ss = initServers(names, weights, size);

printf("server is ");
for (i = 0; i < size; i++)
{
printf("%s(%d) ", ss[i].name, ss[i].weight);
}
printf("\n");

printf("\nwrr sequence is ");
wrr(ss, weights, size);

return;
}
```


-   **IP Hash IP 散列** — Under this method, a hash of the IP address of the client is calculated to redirect the request to a server. ー根据这种方法，计算客户端 IP 地址的散列值，将请求重定向到服务器