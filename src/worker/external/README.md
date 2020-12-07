# 监控和上报

alloy-worker 实现了完整的 Worker 可用性监控指标和全周期 Worker 错误监控. 并且把监控上报和上报接口抽离到 `external` 目录下.

## 使用上报

`external` 目录名称表示 `report.ts` 和 `reportProxy.ts` 并不局限于 alloy-worker 内部. 可以用于同构的业务功能.

## EOF
