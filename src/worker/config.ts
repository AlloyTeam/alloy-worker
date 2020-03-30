/*
 * Alloy Worker 的配置参数
 * 比如: 默认通信超时时间
 */

/**
 * 通信超时时间, 默认 30s
 */
export const CommunicationTimeout = 30000;

/**
 * 心跳包检测间隔, 默认 5s
 */
export const HeartBeatCheckInterVal = 5000;

/**
 * 心跳包超时间隔, 默认 30s, 可以比通信超时时间大
 */
export const HeartBeatCheckTimeout = 30000;

/**
 * 心跳检测延迟启动的时间间隔, 默认 10s
 */
export const HeartBeatCheckStartDelay = 10000;
