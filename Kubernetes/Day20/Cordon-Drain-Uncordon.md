# Kubernetes Node Maintenance: Detailed Guide on Cordon, Drain, Uncordon

---

## Concept:
In Kubernetes, Nodes sometimes need to be **temporarily removed from scheduling** for:
- Maintenance (OS patching, Kernel updates)
- Hardware replacement
- Debugging issues
- Rebooting Nodes safely

For such cases, Kubernetes provides 3 powerful commands:
1. **Cordon** — Stop scheduling new Pods on Node (existing Pods stay running).
2. **Drain** — Move all Pods off Node (eviction) + mark Node unschedulable.
3. **Uncordon** — Allow scheduling again (Node back to normal).

---

## 1. Cordon — Mark Node as Unschedulable

### Purpose:
Prevent **new Pods** from being scheduled to this Node.  
Existing Pods **will not be evicted**; they will keep running.

### Command:
```bash
kubectl cordon <node-name>
````

#### Example:

```bash
kubectl cordon ip-192-168-59-88.ap-south-1.compute.internal
```

#### What Happens:

* Node status changes to `SchedulingDisabled`.
* Running Pods stay untouched.
* New Pods are prevented from scheduling here.

#### Verify:

```bash
kubectl get nodes
```

---

## 2. Drain — Evict All Pods from Node (Safe Removal)

### Purpose:

Safely evict **all Pods** from Node for maintenance.

### Command:

```bash
kubectl drain <node-name> --ignore-daemonsets --delete-emptydir-data
```

#### Parameters:

* `--ignore-daemonsets`
  DaemonSet Pods (like kube-proxy, node-exporter) are skipped (they auto-manage themselves).
* `--delete-emptydir-data`
  Deletes Pods with emptyDir volumes; required for complete drain.

#### Example:

```bash
kubectl drain ip-192-168-59-88.ap-south-1.compute.internal --ignore-daemonsets --delete-emptydir-data
```

#### What Happens:

* Kubernetes **evicts all regular Pods** safely.
* Pod eviction honors PodDisruptionBudgets (if configured).
* DaemonSet Pods stay.
* Node remains in `SchedulingDisabled` state after draining.

---

### Key Note:

If draining fails because of critical system Pods without PodDisruptionBudget, you’ll get errors like:

```
cannot delete Pod ... because it would violate PodDisruptionBudget
```

---

## 3. Uncordon — Re-enable Node Scheduling

### Purpose:

Make Node available again for new Pods to be scheduled.

### Command:

```bash
kubectl uncordon <node-name>
```

#### Example:

```bash
kubectl uncordon ip-192-168-59-88.ap-south-1.compute.internal
```

#### Result:

Node status changes back to:

```
Ready
```

Pods can now be scheduled onto this Node again.

---

## Workflow Example (Full Lifecycle):

1. Cordon Node (Stop new scheduling):

```bash
kubectl cordon <node-name>
```

2. Drain Node (Evict all Pods):

```bash
kubectl drain <node-name> --ignore-daemonsets --delete-emptydir-data
```

3. Do Node Maintenance (Reboot, Patching, Debugging).

4. Uncordon Node (Re-enable scheduling):

```bash
kubectl uncordon <node-name>
```

---

## Real-World Use Cases:

| Scenario                            | Solution                                     |
| ----------------------------------- | -------------------------------------------- |
| Upgrade Kubernetes or Node OS       | cordon → drain → patch → uncordon            |
| Move workloads from old Node        | cordon → drain → delete Node                 |
| Node disk issue (temporary removal) | cordon → drain → fix → uncordon              |
| Debug performance issues on Node    | cordon → drain (optional) → debug → uncordon |

---

## Command Cheat Sheet:

| Action                       | Command Example                                                      |
| ---------------------------- | -------------------------------------------------------------------- |
| Mark Node Unschedulable      | kubectl cordon <node-name>                                           |
| Evict Pods and Unschedulable | kubectl drain <node-name> --ignore-daemonsets --delete-emptydir-data |
| Allow Node Scheduling Again  | kubectl uncordon <node-name>                                         |
| Check Node Status            | kubectl get nodes                                                    |

---

## Important Notes for Students:

* Cordon does not remove or stop any running Pods.
* Drain forcibly evicts Pods but is graceful (respects termination periods).
* Always use `--ignore-daemonsets` while draining to avoid issues.
* Nodes can remain cordoned even after drain if you don’t uncordon manually.

---

## Troubleshooting Tips:

* Drain stuck? Check:

```bash
kubectl get poddisruptionbudgets
```

Pods protected by disruption budgets may block draining.

* Drain errors? Try:

```bash
kubectl drain <node-name> --force --ignore-daemonsets --delete-emptydir-data
```

(Use `--force` carefully; it can cause disruption.)

* DaemonSet Pods won’t drain — they must be handled separately if needed.

---



