# Taints and Tolerations in Kubernetes 

## Concept:
Taints and tolerations help control where pods can run in Kubernetes.

- **Taint:** Applied on a Node to repel pods from it.
- **Toleration:** Added in a Pod to allow it to be scheduled on a tainted Node.

## Simple Explanation:
Taints act like a "No Entry" sign on a Node.
Only Pods with a matching toleration (entry pass) can run on those Nodes.

## Why We Use Taints & Tolerations:
- Reserve Nodes for specific workloads like databases or GPU-heavy applications.
- Prevent normal application pods from using those Nodes.
- Achieve better performance, isolation, and resource management.

## Before Applying Taints:
Kubernetes schedules pods automatically on any available Node without restrictions.

### Example Pod (Without Toleration):
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: normal-pod
spec:
  containers:
  - name: nginx
    image: nginx
````

This Pod can run on any Node.

## Applying Taint on Node:

Command to taint a Node:

```bash
kubectl taint nodes node1 key=value:NoSchedule
```

Now, node1 will reject all pods unless they have a matching toleration.

## What Happens Now:

Pods without tolerations cannot run on the tainted Node and will remain in Pending state.

## Pod with Matching Toleration:

Example Pod YAML with toleration:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: toleration-pod
spec:
  tolerations:
  - key: "key"
    operator: "Equal"
    value: "value"
    effect: "NoSchedule"
  containers:
  - name: nginx
    image: nginx
```

This pod can tolerate the taint and will be scheduled on node1.

## Practical Use Case Example:

### Scenario:

Dedicated database Nodes.

1. Apply Taint on Node:

```bash
kubectl taint nodes db-node db=exclusive:NoSchedule
```

2. Add Toleration to Database Pods:

```yaml
tolerations:
- key: "db"
  operator: "Equal"
  value: "exclusive"
  effect: "NoSchedule"
```

* Normal Pods will be blocked.
* Only Database Pods will run on db-node.

## Types of Effects in Taints:

| Effect           | Description                                                          |
| ---------------- | -------------------------------------------------------------------- |
| NoSchedule       | Blocks Pods without matching toleration from being scheduled.        |
| PreferNoSchedule | Tries to avoid scheduling Pods without toleration, but not enforced. |
| NoExecute        | Evicts running Pods without toleration and blocks future scheduling. |

## How to Remove Taint:

```bash
kubectl taint nodes node1 key=value:NoSchedule-
```

The Node becomes available for all Pods again.

## Key Summary:

* Taints restrict workloads on Nodes.
* Tolerations allow specific Pods to bypass those restrictions.
* Commonly used for dedicated Nodes (e.g., DB, GPU workloads).

## Learning Flow for Students:

1. Deploy a Pod normally; it runs anywhere.
2. Apply Taint; show Pods can’t run on that Node.
3. Add Toleration; show Pod can now run on tainted Node.
4. Remove Taint; Node returns to normal.
5. Discuss real-world use cases.

## Common Commands:

| Task              | Command Example                                  |
| ----------------- | ------------------------------------------------ |
| Add Taint         | kubectl taint nodes node1 key=value\:NoSchedule  |
| Remove Taint      | kubectl taint nodes node1 key=value\:NoSchedule- |
| Check Node Taints | kubectl describe node node1                      |
| Deploy Pod        | kubectl apply -f pod.yaml                        |



