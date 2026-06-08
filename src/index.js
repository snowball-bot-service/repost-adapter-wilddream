import { HttpManager } from './utils/http';
import { extractHandleId, fetchHandleDataFromAPI } from "./manager";
import { UnsupportedMethodException, UnsupportedProcessException } from './utils/error';
import { fetchArtworkData, getArtworkImageURL, getArtworkRawImageURL, getUserHeadshotURL, } from './wilddream.api';
import dayjs from 'dayjs';
export { HttpManager, HttpError } from './utils/http';
/**
 * 常量仓库
 * @param apiBaseURL API 基础地址
 * @param provider 提供商
 * @param apiTimeout API 超时时间（毫秒）
 * @param apiRetries API 重试次数
 */
const CONST = {
    provider: "wilddream",
    apiBaseURL: "https://www.wilddream.net",
    apiTimeout: 10000,
    apiRetries: 1,
};
/**
 * 实例仓库
 * @param instance.http 模块级 HTTP 客户端, 在 initState 中创建, dispose 中销毁
 * */
const INSTANCE = {
    http: null,
};
const adapter = {
    manifest: {
        name: `repost-adapter-${CONST.provider}`,
        provider: CONST.provider,
        whitelistHosts: ['wilddream.net'],
        version: 1,
        author: 'Rominwolf',
        billing: {
            text: 100,
            token: 100,
            media: 1000,
            green: 1,
        },
        providerInfo: {
            name: 'WildDream',
            icon: '🐾',
            color: '#FFFFFF',
            bgColor: '#2B3E50',
        }
    },
    /**
     * 适配器初始化时触发，在此处注册各类资源
     * @param ctx
     */
    async initState(ctx) {
        const userAgent = ctx.config('userAgent');
        // HTTP 客户端
        INSTANCE.http = new HttpManager({
            baseUrl: CONST.apiBaseURL,
            timeoutMs: CONST.apiTimeout,
            retries: CONST.apiRetries,
            headers: {
                userAgent: `${userAgent}`,
            },
            logger: ctx.logger,
        });
        // 注册转发请求处理器
        ctx.on('onRepostRequest', (req) => handleRepostRequest(req, ctx, {}));
        ctx.on("onProcessRequest", (req) => handleProcessingRequest(req, ctx, {}));
        ctx.logger.info(`[${CONST.provider}] Adapter initialized.`);
    },
    /**
     * 适配器销毁时触发，在此处清理各类资源
     *
     * eg. 关闭 HTTP 客户端, 清空定时器, 断开长连接...
     */
    async dispose() {
        // 中断在途请求并释放 HTTP 客户端
        INSTANCE.http?.dispose();
        INSTANCE.http = null;
    },
};
// ============================================================================
// TODO: 2. 实现下方的 handle 函数
// ============================================================================
//
// 这是 adapter 的核心：接收一个 URL，返回标准化的转发数据。
//
// ============================================================================
async function handleRepostRequest(req, ctx, _options) {
    const { helper, logger } = ctx;
    logger.debug(`[${CONST.provider}] fetching ${req.source}`);
    // 从 req.source 解析出 Handle Info
    const [handleMethod, handleId] = extractHandleId(req.source);
    // 不支持的转发模式
    if (handleMethod === "live")
        throw new UnsupportedMethodException(handleMethod, handleId);
    // 调用平台 API 拿到原始数据
    const handleData = await fetchHandleDataFromAPI(INSTANCE.http, handleMethod, handleId);
    // 函数：构建 Post
    const fnBuildPost = () => {
        const payload = handleData;
        const { userid: userId, username: userNickName, userpagename: userPageName, } = payload.author;
        const { title, description, rating, allowfullimage: allowFullImage, dateline: publishDate, favcount: favs, viewcount: views, } = payload.artwork;
        return {
            publishAt: dayjs.unix(+publishDate).toDate(),
            author: {
                headshotUrl: getUserHeadshotURL(userId),
                nickname: userNickName,
                userId: userPageName,
            },
            title: title,
            content: description,
            cover: getArtworkImageURL(userId, handleId),
            badges: [
                [
                    { emoji: "👀", name: helper.extraHumanable("浏览", +views, "次") },
                    { emoji: "✨", name: helper.extraHumanable("收藏", +favs, "人") },
                ]
            ],
            useForward: +(rating) > 0,
            strawberry: {
                emoji: "🖼",
                feature: allowFullImage === "1" ? "原图" : "浏览图",
            },
        };
    };
    // 函数：构建 Profile
    const fnBuildProfile = () => {
        const payload = handleData;
        const { userid: userId, username: userNickName, userpagename: userPageName, introduction } = payload.user;
        const fursonaImageId = payload.profile.fursona_img;
        return {
            author: {
                headshotUrl: getUserHeadshotURL(userId),
                nickname: userNickName,
                userId: userPageName,
            },
            title: userNickName,
            content: introduction,
            cover: fursonaImageId.length > 0 ? getArtworkImageURL(userId, fursonaImageId) : undefined,
            badges: [
                [
                    { emoji: "🧩", name: helper.extraHumanable("作品", +payload.artworkcount, "份") },
                    { emoji: "👀", name: helper.extraHumanable("总浏览量", +payload.pageviews, "次") },
                    { emoji: "✨", name: helper.extraHumanable("被收藏", +payload.favcount, "次") },
                ]
            ],
        };
    };
    // 转换成标准 response 格式
    return {
        method: handleMethod,
        provider: CONST.provider,
        code: req.code,
        originalUrl: req.source,
        requester: req.requester,
        postId: handleId,
        ...(handleMethod === "post" ? fnBuildPost() : fnBuildProfile()),
    };
}
async function handleProcessingRequest(req, ctx, _options) {
    const { logger } = ctx;
    const { method, source, requester, code } = req;
    logger.debug(`[${CONST.provider}] fetching ${method}: ${source}`);
    // 获取原图
    if (method === "strawberry") {
        const artwork = await fetchArtworkData(INSTANCE.http, source);
        const { title, artworkid: artworkId, allowfullimage: allowFullImage, filename: fileName, userid: userId, } = artwork.artwork;
        const url = allowFullImage === "1"
            ? getArtworkRawImageURL(userId, fileName)
            : getArtworkImageURL(userId, artworkId);
        const medias = [
            {
                type: "image",
                url: url,
                summary: `[图片]${title}_${artworkId}`,
            }
        ];
        return {
            provider: CONST.provider,
            code, requester, method,
            medias,
        };
    }
    // 抛出不支持的进程
    throw new UnsupportedProcessException(method, source);
}
export default adapter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFPQSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQzNDLE9BQU8sRUFBQyxlQUFlLEVBQUUsc0JBQXNCLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFDbEUsT0FBTyxFQUFFLDBCQUEwQixFQUFFLDJCQUEyQixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3hGLE9BQU8sRUFDTCxnQkFBZ0IsRUFDaEIsa0JBQWtCLEVBQUUscUJBQXFCLEVBQ3pDLGtCQUFrQixHQUduQixNQUFNLGlCQUFpQixDQUFDO0FBQ3pCLE9BQU8sS0FBSyxNQUFNLE9BQU8sQ0FBQztBQUUxQixPQUFPLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQTBCdEQ7Ozs7OztHQU1HO0FBQ0gsTUFBTSxLQUFLLEdBS1A7SUFDRixRQUFRLEVBQUUsV0FBVztJQUNyQixVQUFVLEVBQUUsMkJBQTJCO0lBQ3ZDLFVBQVUsRUFBRSxLQUFLO0lBQ2pCLFVBQVUsRUFBRSxDQUFDO0NBQ2QsQ0FBQTtBQUVEOzs7S0FHSztBQUNMLE1BQU0sUUFBUSxHQUVWO0lBQ0YsSUFBSSxFQUFFLElBQUk7Q0FDWCxDQUFBO0FBRUQsTUFBTSxPQUFPLEdBQVk7SUFDdkIsUUFBUSxFQUFFO1FBQ1IsSUFBSSxFQUFFLGtCQUFrQixLQUFLLENBQUMsUUFBUSxFQUFFO1FBQ3hDLFFBQVEsRUFBRSxLQUFLLENBQUMsUUFBUTtRQUN4QixjQUFjLEVBQUUsQ0FBQyxlQUFlLENBQUM7UUFDakMsT0FBTyxFQUFFLENBQUM7UUFDVixNQUFNLEVBQUUsV0FBVztRQUNuQixPQUFPLEVBQUU7WUFDUCxJQUFJLEVBQUUsR0FBRztZQUNULEtBQUssRUFBRSxHQUFHO1lBQ1YsS0FBSyxFQUFFLElBQUk7WUFDWCxLQUFLLEVBQUUsQ0FBQztTQUNUO1FBQ0QsWUFBWSxFQUFFO1lB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