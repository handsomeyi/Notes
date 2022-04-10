# Memento-备忘录

记录快照(瞬时状态)

存盘

存档



**注意区分 Command**

Menento是直接跳跃到目的

Command是一步一步redo到目的地



## tank 存档

GameObject实现Serializable



法1°  transient 修饰符 表示这个对象不序列化 ( load出来就不包含了 )

法2°  把TankFireObserver 也继承 Serializable



save() 方法存档 ==> ObjectOutputStream( new FileOutputStream )



load就把save反过来就行啦 !











