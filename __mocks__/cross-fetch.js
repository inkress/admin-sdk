// The client imports `cross-fetch`, which in jest (node) would hit the real network. Route it to
// `global.fetch` so a test's `global.fetch = jest.fn(...)` can stub resource-method responses. Wired
// in via jest.config.cjs's moduleNameMapper (roots is scoped to src, so a root __mocks__ won't
// auto-apply). Delegates at call time so a per-test reassignment of `global.fetch` is honoured.
const crossFetch = (...args) => global.fetch(...args);
crossFetch.default = crossFetch;
crossFetch.fetch = crossFetch;
module.exports = crossFetch;
module.exports.default = crossFetch;
