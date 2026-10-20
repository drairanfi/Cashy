# Runtime capability manifest contract

A factory run declares its runtime capabilities before routing work. The manifest is a factual description of what the current host can do, not a desired configuration. The orchestrator MUST treat any omitted or `false` capability as unavailable.

Store it with the run context or supply it directly to the orchestrator. Do not create a new manifest format per agent CLI.

## Minimal manifest

```yaml
version: 1
runtime:
  name: codex
  adapter: native-multi-agent
capabilities:
  delegate_agents: true
  wait_for_agent_completion: true
  agent_result_visibility: true
  parallel_agent_dispatch: true
  fresh_agent_context: true
  isolated_workspaces: true
  worktrees: true
  repository_commands: true
  tracker_read: true
  tracker_write: true
  pull_requests: true
  browser_qa: true
  visual_qa: true
  persistent_run_state: false
limits:
  max_parallel_agents: 4
  notes: "Worktrees must be created by the host per workspace-isolation-contract.md (scripts/create-isolated-worktree.sh) and removed by the orchestrator on merge/close/abandon (scripts/remove-isolated-worktree.sh + prune)."
```

## Fields

| Field | Meaning | Routing effect when unavailable |
|---|---|---|
| `delegate_agents` | Can start a distinct agent execution. | Execute one role at a time inline; do not claim independence. |
| `wait_for_agent_completion` | Can wait for a dispatched agent to reach a terminal result. | Do not dispatch a dependent role in the background; run inline or block. |
| `agent_result_visibility` | Can retrieve the child's final structured result. | Do not accept background commentary as a handoff; run inline or block. |
| `parallel_agent_dispatch` | Can launch multiple distinct agents at once. | Dispatch one role at a time. |
| `fresh_agent_context` | Can give verifier or QA a context not shared with the writer. | Mark verification as non-independent and request human review if independence is required. |
| `isolated_workspaces` | Can prevent separate writers from sharing files. | Serialize writer work; never parallelize writers. |
| `worktrees` | Can create Git worktrees. | Use another confirmed isolated workspace, or serialize work. |
| `repository_commands` | Can run repository checks. | Block implementation verification; do not advance the task. |
| `tracker_read` / `tracker_write` | Can read or update task state and comments. | Read-only prevents automatic pickup; write-only is invalid for factory routing. |
| `pull_requests` | Can inspect, update, or merge PRs. | Block PR-dependent transitions or hand off to an authorized human. |
| `browser_qa` | Can drive user flows in a browser. | Do not run functional browser QA automatically. |
| `visual_qa` | Can capture and compare visual evidence. | Do not run visual QA automatically. |
| `persistent_run_state` | Can persist a run record outside the chat. | Use accumulated tracker/PR handoffs as the durable record. |

## Rules

1. The manifest is evaluated for each run because capabilities can change by host, repository, or credentials.
2. `delegate_agents: true` alone does not prove an executable waited handoff. Dependent dispatch also requires `wait_for_agent_completion: true` and `agent_result_visibility: true`.
3. `delegate_agents: true` alone does not prove independent verification. That requires a distinct verifier plus `fresh_agent_context: true`.
4. `worktrees: true` does not permit parallel writers unless `isolated_workspaces: true`, `parallel_agent_dispatch: true`, and a positive `max_parallel_agents` greater than one are also true.
5. Missing browser capability never turns a browser-required QA task into a pass. Set it to `blocked` or request authorized manual QA.
6. Adapter names are informational. Routing is based only on declared capabilities.
