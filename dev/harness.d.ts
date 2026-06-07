import type { Adapter, AdapterProcessResponsePayload, AdapterRepostResponsePayload, ProcessMethod } from '@snowball-bot/repost-adapter';
export declare class MockAdapterHost {
    private readonly config;
    private repostHandler;
    private processHandler;
    private adapter;
    constructor(config?: Record<string, unknown>);
    /**
     * 注册 adapter，触发其 initState
     */
    register(adapter: Adapter): Promise<void>;
    /**
     * 模拟核心收到消息后的转发触发
     */
    emitRepost(url: string): Promise<AdapterRepostResponsePayload | null>;
    /**
     * 模拟核心收到下一步进程触发（🍓 / 🍉 / 🍎）
     *
     * @param method 进程代号（strawberry / watermelon / apple）
     * @param source 进程入参，通常是上一步 response 中携带的 ID
     */
    emitProcess(method: ProcessMethod, source: string): Promise<AdapterProcessResponsePayload | null>;
    /**
     * 释放
     */
    dispose(): Promise<void>;
    private buildContext;
}
