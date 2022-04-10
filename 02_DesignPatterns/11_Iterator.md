# 迭代器Iterator

遍历容器

![image-20211105144413972](https://raw.githubusercontent.com/handsomeyi/Pics/master/image-20211105144413972.png)



## 手写LinkedList的Iterator

```java
/**
 * 相比数组，这个容器不用考虑边界问题，可以动态扩展
 */
class LinkedList_<E> implements Collection_<E> {
    Node<E> head = null;
    Node<E> tail = null;
    //目前容器中有多少个元素
    private int size = 0;

    public void add(E o) {
        Node<E> n = new Node<>(o);
        n.next = null;

        if(head == null) {
            head = n;
            tail = n;
        }

        tail.next = n;
        tail = n;
        size++;
    }

    private class Node<E> {
        private E o;
        Node<E> next;

        public Node(E item) {
            this.o = item;
        }
    }

    public int size() {
        return size;
    }

    @Override
    public Iterator_<E> iterator() {
        return new LinkedListIterator();
    }

    private class LinkedListIterator<E> implements Iterator_ {
        Node curNode = head;
        @Override
        public boolean hasNext() {
            if (curNode.next == null)
                return false;
            else
                return true;
        }
        @Override
        public E next() {
            curNode = curNode.next;
            return (E) curNode.o;
        }
    }
}
```

## ArrayList的Iterator

```java
/**
 * 相比数组，这个容器不用考虑边界问题，可以动态扩展
 */
class ArrayList_<E> implements Collection_<E> {
    E[] objects = (E[])new Object[10];
    //objects中下一个空的位置在哪儿,或者说，目前容器中有多少个元素
    private int index = 0;
    public void add(E o) {
        if(index == objects.length) {
            E[] newObjects = (E[])new Object[objects.length*2];
            System.arraycopy(objects, 0, newObjects, 0, objects.length);
            objects = newObjects;
        }

        objects[index] = o;
        index ++;
    }

    public int size() {
        return index;
    }

    @Override
    public Iterator_<E> iterator() {
        return new ArrayListIterator();
    }

    private class ArrayListIterator<E> implements Iterator_<E> {

        private int currentIndex = 0;

        @Override
        public boolean hasNext() {
            if(currentIndex >= index) return false;
            return true;
        }

        @Override
        public E next() {
            E o = (E)objects[currentIndex];
            currentIndex ++;
            return o;
        }
    }
}
```



## Main-test

```java
public class Main {
    public static void main(String[] args) {
        Collection_<String> list = new ArrayList_<>();
        for(int i=0; i<15; i++) {
            list.add("s" + i);
        }
        System.out.println(list.size());

        //这个接口的调用方式：
        Iterator_<String> it = list.iterator();
        while(it.hasNext()) {
            String o = it.next();
            System.out.println(o);
        }

        System.out.println("=========================");

        LinkedList_<String> linkedList = new LinkedList_<String>();
        for (int i = 1; i <= 10; i++) {
            linkedList.add(new String("S" + i));
        }

        System.out.println(linkedList.size());
        Iterator_ iterator_linkedList = linkedList.iterator();
        while (iterator_linkedList.hasNext()){
            String o = iterator_linkedList.next().toString();
            System.out.println(o);
        }
    }
}
```
