# Dijkstra算法代码

#Dijkstra算法 

---

```java

public static HashMap<Node, Integer> dijkstra1(Node from) {
    // 从head出发到所有点的最小距离
    // key : 从head出发到达key
    // value : 从head出发到达key的最小距离
    // 如果在表中，没有T的记录，含义是从head出发到T这个点的距离为正无穷
    HashMap<Node, Integer> distanceMap = new HashMap<>();
    distanceMap.put(from, 0);
    // 已经求过距离的节点，存在selectedNodes中，以后再也不碰
    HashSet<Node> selectedNodes = new HashSet<>();
    // from 0
    Node minNode = getMinDistanceAndUnselectedNode(distanceMap, selectedNodes);
    while (minNode != null) {
        int distance = distanceMap.get(minNode);
        for (Edge edge : minNode.edges) {
            Node toNode = edge.to;
            if (!distanceMap.containsKey(toNode)) {
                distanceMap.put(toNode, distance + edge.weight);
            } else {
                distanceMap.put(edge.to, 
                        Math.min(distanceMap.get(toNode), distance + edge.weight));
            }
        }
        selectedNodes.add(minNode);
        minNode = getMinDistanceAndUnselectedNode(distanceMap, selectedNodes);
    }
    return distanceMap;
}

public static Node getMinDistanceAndUnselectedNode(
        HashMap<Node, Integer> distanceMap, 
        HashSet<Node> touchedNodes) {
    Node minNode = null;
    int minDistance = Integer.MAX_VALUE;
    for (Entry<Node, Integer> entry : distanceMap.entrySet()) {
        Node node = entry.getKey();
        int distance = entry.getValue();
        if (!touchedNodes.contains(node) && distance < minDistance) {
            minNode = node;
            minDistance = distance;
        }
    }
    return minNode;
}

public static class NodeRecord {
    public Node node;
    public int distance;

    public NodeRecord(Node node, int distance) {
        this.node = node;
        this.distance = distance;
    }
}

public static class NodeHeap {
    private Node[] nodes; // 实际的堆结构
    // key 某一个node， value 上面堆中的位置
    private HashMap<Node, Integer> heapIndexMap;
    // key 某一个节点， value 从源节点出发到该节点的目前最小距离
    private HashMap<Node, Integer> distanceMap;
    private int size; // 堆上有多少个点

    public NodeHeap(int size) {
        nodes = new Node[size];
        heapIndexMap = new HashMap<>();
        distanceMap = new HashMap<>();
        size = 0;
    }

    public boolean isEmpty() {
        return size == 0;
    }

    // 有一个点叫node，现在发现了一个从源节点出发到达node的距离为distance
    // 判断要不要更新，如果需要的话，就更新
    public void addOrUpdateOrIgnore(Node node, int distance) {
        if (inHeap(node)) {
            distanceMap.put(node, Math.min(distanceMap.get(node), distance));
            insertHeapify(node, heapIndexMap.get(node));
        }
        if (!isEntered(node)) {
            nodes[size] = node;
            heapIndexMap.put(node, size);
            distanceMap.put(node, distance);
            insertHeapify(node, size++);
        }
    }

    public NodeRecord pop() {
        NodeRecord nodeRecord = new NodeRecord(nodes[0], distanceMap.get(nodes[0]));
        swap(0, size - 1);
        heapIndexMap.put(nodes[size - 1], -1);
        distanceMap.remove(nodes[size - 1]);
        // free C++同学还要把原本堆顶节点析构，对java同学不必
        nodes[size - 1] = null;
        heapify(0, --size);
        return nodeRecord;
    }

    private void insertHeapify(Node node, int index) {
        while (distanceMap.get(nodes[index]) 
                < distanceMap.get(nodes[(index - 1) / 2])) {
            swap(index, (index - 1) / 2);
            index = (index - 1) / 2;
        }
    }

    private void heapify(int index, int size) {
        int left = index * 2 + 1;
        while (left < size) {
            int smallest = left + 1 < size && distanceMap.get(nodes[left + 1]) < distanceMap.get(nodes[left])
                    ? left + 1
                    : left;
            smallest = distanceMap.get(nodes[smallest]) 
                    < distanceMap.get(nodes[index]) ? smallest : index;
            if (smallest == index) {
                break;
            }
            swap(smallest, index);
            index = smallest;
            left = index * 2 + 1;
        }
    }

    private boolean isEntered(Node node) {
        return heapIndexMap.containsKey(node);
    }

    private boolean inHeap(Node node) {
        return isEntered(node) && heapIndexMap.get(node) != -1;
    }

    private void swap(int index1, int index2) {
        heapIndexMap.put(nodes[index1], index2);
        heapIndexMap.put(nodes[index2], index1);
        Node tmp = nodes[index1];
        nodes[index1] = nodes[index2];
        nodes[index2] = tmp;
    }
}

// 改进后的dijkstra算法
// 从head出发，所有head能到达的节点，生成到达每个节点的最小路径记录并返回
public static HashMap<Node, Integer> dijkstra2(Node head, int size) {
    NodeHeap nodeHeap = new NodeHeap(size);
    nodeHeap.addOrUpdateOrIgnore(head, 0);
    HashMap<Node, Integer> result = new HashMap<>();
    while (!nodeHeap.isEmpty()) {
        NodeRecord record = nodeHeap.pop();
        Node cur = record.node;
        int distance = record.distance;
        for (Edge edge : cur.edges) {
            nodeHeap.addOrUpdateOrIgnore(edge.to, edge.weight + distance);
        }
        result.put(cur, distance);
    }
    return result;
}
```