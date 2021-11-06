# Visitor-访问者

## 抽象语法树

![image-20211105164459916](https://raw.githubusercontent.com/handsomeyi/Pics/master/image-20211105164459916.png)

运行时, 会执行各种节点检查. 





## 传统模式各种检查......

原始的模式, 很繁杂.

![image-20211105164837681](https://raw.githubusercontent.com/handsomeyi/Pics/master/image-20211105164837681.png)



## Visitor模式-访问者模式

访问某种节点的时候 引用各种对应**Visitor**进行检查

![image-20211105165007634](https://raw.githubusercontent.com/handsomeyi/Pics/master/image-20211105165007634.png)





# ASM-动态生成字节码



ClassPrinter 

```java
public class ClassPrinter extends ClassVisitor {
    public ClassPrinter() {
        super(ASM4);
    }

    @Override
    public void visit(int version, int access, String name, String signature, String superName, String[] interfaces) {
        System.out.println(name + " extends " + superName + "{" );
    }
    @Override
    public FieldVisitor visitField(int access, String name, String descriptor, String signature, Object value) {
        System.out.println("    " + name);
        return null;
    }

    @Override
    public MethodVisitor visitMethod(int access, String name, String descriptor, String signature, String[] exceptions) {
        System.out.println("    " + name + "()");
        return null;
    }

    @Override
    public void visitEnd() {

        System.out.println("}");
    }

    public static void main(String[] args) throws IOException {
        ClassPrinter cp = new ClassPrinter();
        //ClassReader cr = new ClassReader("java.lang.Runnable");
        ClassReader cr = new ClassReader(
                ClassPrinter.class.getClassLoader().getResourceAsStream("com/mashibing/dp/ASM/T1.class"));



        cr.accept(cp, 0);
    }
}
```



### 转换过程:

![image-20211105172251799](https://raw.githubusercontent.com/handsomeyi/Pics/master/image-20211105172251799.png)



## 生成动态代理?



![image-20211105183831916](https://raw.githubusercontent.com/handsomeyi/Pics/master/image-20211105183831916.png)

```java
public class ClassTransformerTest {
    public static void main(String[] args) throws Exception {
        ClassReader cr = new ClassReader(
                //把Tank.class加载到内存
                ClassPrinter.class.getClassLoader().getResourceAsStream("com/mashibing/dp/ASM/Tank.class"));
                //为了植入一些自己想要的东西, 所以可以理解为动态代理

        ClassWriter cw = new ClassWriter(0);
        //自己定义的Visitor
        ClassVisitor cv = new ClassVisitor(ASM4, cw) {
            @Override
            public MethodVisitor visitMethod(int access, String name, String descriptor, String signature, String[] exceptions) {
                MethodVisitor mv = super.visitMethod(access, name, descriptor, signature, exceptions);
                //return mv;
                return new MethodVisitor(ASM4, mv) {
                    @Override
                    public void visitCode() {
                        //修改的method , 加入了此段汇编语句 
                        visitMethodInsn(INVOKESTATIC, "com/mashibing/dp/ASM/TimeProxy","before", "()V", false);
                        super.visitCode();
                    }
                };
            }
        };

        //如果直接 cr.accept(cw, 0) 就会原地复制一份同样的class文件
        cr.accept(cv, 0);
        
        byte[] b2 = cw.toByteArray();
        MyClassLoader cl = new MyClassLoader();
        //Class c = cl.loadClass("com.mashibing.dp.ASM.Tank");
        cl.loadClass("com.mashibing.dp.ASM.TimeProxy");
        Class c2 = cl.defineClass("com.mashibing.dp.ASM.Tank", b2);
        c2.getConstructor().newInstance();


        String path = (String)System.getProperties().get("user.dir");
        File f = new File(path + "/com/mashibing/dp/ASM/");
        f.mkdirs();

        FileOutputStream fos = new FileOutputStream(new File(path + "/com/mashibing/dp/ASM/Tank_0.class"));
        fos.write(b2);
        fos.flush();
        fos.close();

    }
}
```































