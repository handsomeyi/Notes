

# Builder

* 分离复杂对象的构建与表示.

* 同样的构建过程可以创建不同的表示.

* 无需记忆, 自然使用即可.

  

![image-20211105212912095](https://raw.githubusercontent.com/handsomeyi/Pics/master/image-20211105212912095.png)



**Bulider**: 注重---构造对象

**模板方法**: 注重---方法执行



==**Builder思想**==

Builder就是一个Builder接口, 规定了各种build方法, 然后有一个实现具体接口方法的类,

 并且每个方法都return this, 就可以实现链式语法, 参数或者要建造的种类特别多, 就用builder比较方便. 

我要啥玩意, 我就链式点出来, 不用的, 就不用点.

## TerrainBuilder

```java
public interface TerrainBuilder {
    //为了链式语法, 返回对象本身
    TerrainBuilder buildWall();
    TerrainBuilder buildFort();
    TerrainBuilder buildMine();
    Terrain build();
}
```

```java
public class ComplexTerrainBuilder implements TerrainBuilder {
    Terrain terrain = new Terrain();
    @Override
    public TerrainBuilder buildWall() {
        terrain.w = new Wall(10, 10, 50, 50);
        return this;
    }
    @Override
    public TerrainBuilder buildFort() {
        terrain.f = new Fort(10, 10, 50, 50);
        return this;
    }
    @Override
    public TerrainBuilder buildMine() {
        terrain.m = new Mine(10, 10, 50, 50);
        return this;
    }
    @Override
    public Terrain build() {
        return terrain;
    }
}
```

## PersonBuilder

```java
public class Person {
    int id;
    String name;
    int age;
    double weight;
    int score;
    Location loc;

    private Person() {}

    public static class PersonBuilder {
        Person p = new Person();

        public PersonBuilder basicInfo(int id, String name, int age) {
            p.id = id;
            p.name = name;
            p.age = age;
            return this;
        }

        public PersonBuilder weight(double weight) {
            p.weight = weight;
            return this;
        }

        public PersonBuilder score(int score) {
            p.score = score;
            return this;
        }

        public PersonBuilder loc(String street, String roomNo) {
            p.loc = new Location(street, roomNo);
            return this;
        }

        public Person build() {
            return p;
        }
    }
}

class Location {
    String street;
    String roomNo;

    public Location(String street, String roomNo) {
        this.street = street;
        this.roomNo = roomNo;
    }
}
```

## main

```java
public class Main {
    public static void main(String[] args) {
        TerrainBuilder builder = new ComplexTerrainBuilder();
        //链式语法,因为bulid返回this
        Terrain t = builder.buildFort().buildMine().buildWall().build();
        //new Terrain(Wall w, Fort f, Mine m)不行, 为了分离
        //Effective Java
        
        //例子2 Person
        Person p = new Person.PersonBuilder()
                .basicInfo(1, "zhangsan", 18)
                //.score(20)
                .weight(200)
                //.loc("bj", "23")
                .build();
    }
}
```

