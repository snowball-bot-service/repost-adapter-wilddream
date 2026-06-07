import { ProcessMethod, RepostMethod } from '@snowball-bot/repost-adapter';
export declare abstract class SnowballException extends Error {
    protected constructor(message: string);
}
/**
 * 获取 Handle Data 失败错误
 */
export declare class FetchHandleDataFailedException extends SnowballException {
    readonly method: RepostMethod;
    readonly handleId: string;
    readonly msg: string;
    constructor(method: RepostMethod, handleId: string, msg: string);
}
/**
 * 不支持的类型错误
 */
export declare class UnsupportedMethodException extends SnowballException {
    readonly method: RepostMethod;
    readonly handleId: string;
    constructor(method: RepostMethod, handleId: string);
}
/**
 * 不支持的进程错误
 */
export declare class UnsupportedProcessException extends SnowballException {
    readonly process: ProcessMethod;
    readonly source: string;
    constructor(process: ProcessMethod, source: string);
}
