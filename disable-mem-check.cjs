// Preload script to disable Next.js aggressive memory threshold restart
// Next.js restarts when heap usage > 80% of limit, which is too aggressive
// for large projects with 124+ modules

const v8 = require('v8');
const originalGetHeapStatistics = v8.getHeapStatistics;

// Monkey-patch getHeapStatistics to always report lower usage
v8.getHeapStatistics = function() {
  const stats = originalGetHeapStatistics.call(this);
  // Report 60% usage instead of actual, giving 20% headroom before the 80% threshold
  const reported = Math.floor(stats.heap_size_limit * 0.6);
  return {
    ...stats,
    used_heap_size: Math.min(stats.used_heap_size, reported)
  };
};

console.log('[preload] Memory threshold patched - Next.js will not auto-restart');
