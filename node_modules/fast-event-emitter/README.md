Fast implementation of Node's event emitter. Simple 

Benchmark:

```
new EventEmitter() x 19,984,579 ops/sec ±4.82% (71 runs sampled)
em.on('event', listener).dispose() x 5,777,453 ops/sec ±2.20% (85 runs sampled)
em.once('event', listener); em.emit('event'); x 1,821,827 ops/sec ±5.32% (78 runs sampled)
em.emit('oneListener'); x 2,022,895 ops/sec ±2.31% (84 runs sampled)
em.emit('oneListener', 1); x 14,901,685 ops/sec ±6.69% (66 runs sampled)
em.emit('oneListener', 1, 2); x 24,374,163 ops/sec ±5.28% (91 runs sampled)
em.emit('twoListeners'); x 8,369,519 ops/sec ±1.09% (89 runs sampled)
em.emit('twoListeners', 1); x 6,826,521 ops/sec ±0.99% (94 runs sampled)
em.emit('twoListeners', 1, 2); x 6,566,629 ops/sec ±1.00% (93 runs sampled)
```

### EventEmitter()

Creates a new event emitter

### listener on(event, callback)

creates, and returns a new listener

### listener off(event, callback)

removes a listener

### listener once(event, callback)

Creates one listener, and disposes it once it's called

### emit(event[, ...args])

emits an event with the given arguments

### listener.dispose()

disposes the listener