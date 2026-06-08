import { fetchArtworkData, fetchUserProfileData } from './wilddream.api';
/**
 * method -> API 抓取函数 的注册表。
 *
 * 每一项要么是对应的抓取函数, 要么是 `null` (表示该渠道不支持此 method)。
 * `satisfies` 在此处校验每个 handler 的返回类型与 {@link RepostMethodPayloadMap}
 * 对应项一致；任何不匹配都会在此对象上直接报错，而非在调用处。
 */
const PAYLOAD_FETCHERS = {
    post: fetchArtworkData,
    profile: fetchUserProfileData,
    live: null,
};
/**
 * 将 URL 转换成 URL payload
 * @param source
 */
export function extractURL(source) {
    return new URL(source);
}
/**
 * 提取 Source URL 中的 Handle ID (PostId, UserId, ...)
 * @param source 原始 URL
 * @example Path: /post/114514 => numberOfPath: 1 => 114514
 */
export function extractHandleId(source) {
    const { pathname } = extractURL(source);
    const paths = pathname.split('/');
    // 如果分割的 Paths 首个为空，则删除
    if (paths.length > 1 && paths[0].length === 0) {
        paths.shift();
    }
    const [type, tree2, tree3] = paths;
    switch (type) {
        case 'Art':
            return ['post', tree3];
        case 'user':
            return ['profile', tree2];
    }
}
/**
 * 进行对应的 API 请求，拿到 Handle Data
 * @param http
 * @param method
 * @param handleId
 */
export async function fetchHandleDataFromAPI(http, method, handleId) {
    const fetcher = PAYLOAD_FETCHERS[method];
    // null 项: 该渠道不支持此 method (eg. live), 返回 null 回调
    if (!fetcher) {
        return null;
    }
    return fetcher(http, handleId);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUNMLGdCQUFnQixFQUNoQixvQkFBb0IsRUFJckIsTUFBTSxpQkFBaUIsQ0FBQztBQVF6Qjs7Ozs7O0dBTUc7QUFDSCxNQUFNLGdCQUFnQixHQUFHO0lBQ3ZCLElBQUksRUFBRSxnQkFBZ0I7SUFDdEIsT0FBTyxFQUFFLG9CQUFvQjtJQUM3QixJQUFJLEVBQUUsSUFBSTtDQUtYLENBQUM7QUFFRjs7O0dBR0c7QUFDSCxNQUFNLFVBQVUsVUFBVSxDQUFDLE1BQWM7SUFDdkMsT0FBTyxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUN6QixDQUFDO0FBRUQ7Ozs7R0FJRztBQUNILE1BQU0sVUFBVSxlQUFlLENBQUMsTUFBYztJQUM1QyxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3hDLE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUEwQyxDQUFDO0lBRTNFLHVCQUF1QjtJQUN2QixJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1FBQzdDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztLQUNmO0lBRUQsTUFBTSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLEdBQUcsS0FBSyxDQUFDO0lBRW5DLFFBQVEsSUFBSSxFQUFFO1FBQ1osS0FBSyxLQUFLO1lBQ1IsT0FBTyxDQUFDLE1BQU0sRUFBRSxLQUFNLENBQUMsQ0FBQztRQUMxQixLQUFLLE1BQU07WUFDVCxPQUFPLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO0tBQzdCO0FBQ0gsQ0FBQztBQUVEOzs7OztHQUtHO0FBQ0gsTUFBTSxDQUFDLEtBQUssVUFBVSxzQkFBc0IsQ0FDMUMsSUFBaUIsRUFDakIsTUFBUyxFQUNULFFBQWdCO0lBRWhCLE1BQU0sT0FBTyxHQUFHLGdCQUFnQixDQUFDLE1BQU0sQ0FFL0IsQ0FBQztJQUVULGdEQUFnRDtJQUNoRCxJQUFJLENBQUMsT0FBTyxFQUFFO1FBQ1osT0FBTyxJQUFpQyxDQUFDO0tBQzFDO0lBRUQsT0FBTyxPQUFPLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ2pDLENBQUMifQ==