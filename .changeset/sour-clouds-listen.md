---
'@zwidekalanga/svelte-lazylog': patch
---

Fixed an issue where line numbers were not incrementing correctly when using WebSocket or EventSource connections. This was caused by a mismatch between the updated `processText` function signature and its call sites in the LazyLog component.
