# error: failed to push some refs to如何解决

![[Pasted image 20220210011115.png]]

我们在创建仓库的时候，都会勾选“使用Reamdme文件初始化这个仓库”这个操作初识了一个README文件并配置添加了忽略文件。但是这两份内容并没有联系，

-   对于error: failed to push some refsto‘远程仓库地址’  
	1 使用如下命令
	```git pull --rebase origin master```
	
	2 然后再进行上传:
	```git push -u origin master```

	