

# 简单例子-Comparable

**就是决策方法由我们自己实现, 框架已经有了, 直接 implements 接口就行了.**

```java
public class Cat implements Comparable<Cat> {
    int weight, height;
    public Cat(int weight, int height) {
        this.weight = weight;
        this.height = height;
    }
    public int compareTo(Cat c) {
        if(this.weight < c.weight) return -1;
        else if(this.weight > c.weight) return 1;
        else return 0;
    }
    @Override
    public String toString() {
        return "Cat{" +
                "weight=" + weight +
                ", height=" + height +
                '}';
    }
}
```

```java
public class Dog implements Comparable<Dog> {
    int food;
    public Dog(int food) {
        this.food = food;
    }
    @Override
    public int compareTo(Dog d) {
        if(this.food < d.food) return -1;
        else if(this.food > d.food) return 1;
        else return 0;
    }
    @Override
    public String toString() {
        return "Dog{" +
                "food=" + food +
                '}';
    }
}
```

```java
public interface Comparable<T> {
    int compareTo(T o);
}
```

```java
public class Sorter<T> {

    public void sort(T[] arr, Comparator<T> comparator) {
        for(int i=0; i<arr.length - 1; i++) {
            int minPos = i;

            for(int j=i+1; j<arr.length; j++) {
                minPos = comparator.compare(arr[j],arr[minPos])==-1 ? j : minPos;
            }
            swap(arr, i, minPos);
        }
    }

    //sort(int)

    void swap(T[] arr, int i, int j) {
        T temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
}
```

```java
public class Main {
    public static void main(String[] args) {
        //int[] a = {9, 2, 3, 5, 7, 1, 4};
        Cat[] a = {new Cat(3, 3), new Cat(5, 5), new Cat(1, 1)};
        //Dog[] a = {new Dog(3), new Dog(5), new Dog(1)};
        Sorter<Cat> sorter = new Sorter<>();
        sorter.sort(a, (o1, o2)->{
            if(o1.weight < o2.weight) return -1;
            else if (o1.weight>o2.weight) return 1;
            else return 0;
        });
        System.out.println(Arrays.toString(a));
    }
}
```

# Strategy-Comparator

开辟原则 -- 对修改关闭, 对扩展开放

```java
@FunctionalInterface
public interface Comparator<T> {
    int compare(T o1, T o2);

    default void m() {
        System.out.println("m");
    }
}
```

写两个比较器, 针对对应属性的

```java
public class CatHeightComparator implements Comparator<Cat> {
    @Override
    public int compare(Cat o1, Cat o2) {
        if(o1.height > o2.height) return -1;
        else if (o1.height < o2.height) return 1;
        else return 0;
    }
}
```

```java
public class CatWeightComparator implements Comparator<Cat> {
    @Override
    public int compare(Cat o1, Cat o2) {
        if(o1.weight < o2.weight) return -1;
        else if (o1.weight > o2.weight) return 1;
        else return 0;
    }
}
```

用泛型来规定比较什么

```java
public class Sorter<T> {

    public void sort(T[] arr, Comparator<T> comparator) {
        for(int i=0; i<arr.length - 1; i++) {
            int minPos = i;

            for(int j=i+1; j<arr.length; j++) {
                minPos = comparator.compare(arr[j],arr[minPos])==-1 ? j : minPos;
            }
            swap(arr, i, minPos);
        }
    }

    //sort(int)

    void swap(T[] arr, int i, int j) {
        T temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
}
```

用Sorter的Cat实例:sorter

sorter.sort()传入要测试的arr对象, 和Lambda表达式实现的比较策略

```java
public class Main {
    public static void main(String[] args) {
        Cat[] a = {new Cat(3, 3), new Cat(5, 5), new Cat(1, 1)};
        Sorter<Cat> sorter = new Sorter<>();
        sorter.sort(a, (o1, o2)->{
            if(o1.weight < o2.weight) return -1;
            else if (o1.weight>o2.weight) return 1;
            else return 0;
        });
        System.out.println(Arrays.toString(a));
    }
}
```





























