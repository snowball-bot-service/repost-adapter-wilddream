import { HttpManager } from './utils/http';
import { RepostMethod } from '@snowball-bot/repost-adapter';
import { WildDreamArtworkResponse, WildDreamUserProfileResponse } from './wilddream.api';
type RepostMethodPayloadMap = {
    post: WildDreamArtworkResponse;
    profile: WildDreamUserProfileResponse;
    live: null;
};
/**
 * 将 URL 转换成 URL payload
 * @param source
 */
export declare function extractURL(source: string): URL;
/**
 * 提取 Source URL 中的 Handle ID (PostId, UserId, ...)
 * @param source 原始 URL
 * @example Path: /post/114514 => numberOfPath: 1 => 114514
 */
export declare function extractHandleId(source: string): [RepostMethod, string];
/**
 * 进行对应的 API 请求，拿到 Handle Data
 * @param http
 * @param method
 * @param handleId
 */
export declare function fetchHandleDataFromAPI<M extends RepostMethod>(http: HttpManager, method: M, handleId: string): Promise<RepostMethodPayloadMap[M]>;
export {};
