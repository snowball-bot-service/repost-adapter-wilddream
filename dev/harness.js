/**
 * 模拟核心的最小宿主环境，用于在 starter 项目本地调试 adapter，
 * 无需启动真正的 core。
 *
 * 行为差异：
 * - 不实现路由（所有 emitRepost 都直接交给已注册的 adapter）
 * - 不实现 provider/host 冲突检测
 * - config 由 harness 构造时传入，模拟 core 注入
 */
/**
 * 将数字格式化为人类可读，如 1.2K / 3M（mimic core helper）
 */
function humanableNumber(num) {
    if (Math.abs(num) < 1000)
        return String(num);
    const units = ['K', 'M', 'B', 'T'];
    let value = num;
    let unitIndex = -1;
    while (Math.abs(value) >= 1000 && unitIndex < units.length - 1) {
        value /= 1000;
        unitIndex += 1;
    }
    return `${parseFloat(value.toFixed(1))}${units[unitIndex]}`;
}
export class MockAdapterHost {
    config;
    repostHandler = null;
    processHandler = null;
    adapter = null;
    constructor(config = {}) {
        this.config = config;
    }
    /**
     * 注册 adapter，触发其 initState
     */
    async register(adapter) {
        if (this.adapter) {
            throw new Error('MockAdapterHost only supports one adapter at a time');
        }
        this.adapter = adapter;
        const ctx = this.buildContext();
        await adapter.initState(ctx);
        if (!this.repostHandler) {
            throw new Error(`Adapter ${adapter.manifest.name} did not register an onRepostRequest handler`);
        }
        console.log(`✓ Registered ${adapter.manifest.name} (${adapter.manifest.provider})`);
        console.log(`  whitelistHosts: ${adapter.manifest.whitelistHosts.join(', ')}`);
    }
    /**
     * 模拟核心收到消息后的转发触发
     */
    async emitRepost(url) {
        if (!this.repostHandler || !this.adapter) {
            throw new Error('No adapter registered');
        }
        const parsed = new URL(url);
        const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
        // 验证 host 命中 whitelistHosts（mimic core 路由）
        if (!this.adapter.manifest.whitelistHosts.includes(host)) {
            console.warn(`⚠ URL host "${host}" not in adapter's whitelistHosts. ` +
                `Real core would not route this to your adapter.`);
        }
        const req = {
            source: url,
            code: `dev-${Date.now()}`,
            requester: {
                userId: '-1',
                nickname: 'DEVELOPER'
            },
        };
        console.log(`\n→ emitRepost: ${url}`);
        const result = await this.repostHandler(req);
        console.log(`← response:`, result);
        return result;
    }
    /**
     * 模拟核心收到下一步进程触发（🍓 / 🍉 / 🍎）
     *
     * @param method 进程代号（strawberry / watermelon / apple）
     * @param source 进程入参，通常是上一步 response 中携带的 ID
     */
    async emitProcess(method, source) {
        if (!this.processHandler || !this.adapter) {
            throw new Error('No onProcessRequest handler registered. ' +
                'Call ctx.on("onProcessRequest", ...) in your adapter\'s initState.');
        }
        const req = {
            method,
            source,
            code: `dev-${Date.now()}`,
            requester: {
                userId: '-1',
                nickname: 'DEVELOPER'
            },
        };
        console.log(`\n→ emitProcess(${method}): ${source}`);
        const result = await this.processHandler(req);
        console.log(`← response:`, result);
        return result;
    }
    /**
     * 释放
     */
    async dispose() {
        await this.adapter?.dispose?.();
    }
    buildContext() {
        return {
            on: (event, handler) => {
                switch (event) {
                    case 'onRepostRequest':
                        if (this.repostHandler) {
                            throw new Error('onRepostRequest handler already registered');
                        }
                        this.repostHandler = handler;
                        break;
                    case 'onProcessRequest':
                        if (this.processHandler) {
                            throw new Error('onProcessRequest handler already registered');
                        }
                        this.processHandler = handler;
                        break;
                    default:
                        throw new Error(`Unknown event: ${event}`);
                }
            },
            config: (key) => this.config[key],
            helper: {
                pick: (record, key, fallback) => record[key] ?? fallback,
                extraHumanable: (prefix, number, suffix) => `${prefix}${humanableNumber(number)}${suffix}`,
                humanableDuration: (duration, forceHours = false) => {
                    const total = Math.max(0, Math.floor(duration));
                    const hours = Math.floor(total / 3600);
                    const minutes = Math.floor((total % 3600) / 60);
                    const seconds = total % 60;
                    const pad = (n) => String(n).padStart(2, '0');
                    return hours > 0 || forceHours
                        ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
                        : `${pad(minutes)}:${pad(seconds)}`;
                },
            },
            logger: {
                info: (msg, ...args) => console.log(`[info]`, msg, ...args),
                warn: (msg, ...args) => console.warn(`[warn]`, msg, ...args),
                error: (msg, ...args) => console.error(`[error]`, msg, ...args),
                debug: (msg, ...args) => console.log(`[debug]`, msg, ...args),
            },
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFybmVzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBWUE7Ozs7Ozs7O0dBUUc7QUFDSDs7R0FFRztBQUNILFNBQVMsZUFBZSxDQUFDLEdBQVc7SUFDbEMsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUk7UUFBRSxPQUFPLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUM3QyxNQUFNLEtBQUssR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ25DLElBQUksS0FBSyxHQUFHLEdBQUcsQ0FBQztJQUNoQixJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUNuQixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxJQUFJLFNBQVMsR0FBRyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtRQUM5RCxLQUFLLElBQUksSUFBSSxDQUFDO1FBQ2QsU0FBUyxJQUFJLENBQUMsQ0FBQztLQUNoQjtJQUNELE9BQU8sR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDO0FBQzlELENBQUM7QUFFRCxNQUFNLE9BQU8sZUFBZTtJQU1QO0lBTFgsYUFBYSxHQUF5QixJQUFJLENBQUM7SUFDM0MsY0FBYyxHQUEwQixJQUFJLENBQUM7SUFDN0MsT0FBTyxHQUFtQixJQUFJLENBQUM7SUFFdkMsWUFDbUIsU0FBa0MsRUFBRTtRQUFwQyxXQUFNLEdBQU4sTUFBTSxDQUE4QjtJQUNwRCxDQUFDO0lBRUo7O09BRUc7SUFDSCxLQUFLLENBQUMsUUFBUSxDQUFDLE9BQWdCO1FBQzdCLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNoQixNQUFNLElBQUksS0FBSyxDQUFDLHFE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