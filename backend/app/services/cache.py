"""
Tiny in-process cache for the public read endpoints.

Every open browser tab polls the live scores, so without this each visitor's
request hits the database. With a few seconds of caching, hundreds of visitors
share one query. Admin writes clear it, so a score change still shows up at once.
"""
import time
from threading import Lock
from typing import Any, Callable

TTL_SECONDS = 5.0

_store: dict[tuple, tuple[float, Any]] = {}
_lock = Lock()


def cached(key: tuple, compute: Callable[[], Any], ttl: float = TTL_SECONDS) -> Any:
    now = time.monotonic()
    with _lock:
        hit = _store.get(key)
        if hit and hit[0] > now:
            return hit[1]
    value = compute()
    with _lock:
        _store[key] = (now + ttl, value)
    return value


def clear() -> None:
    with _lock:
        _store.clear()
