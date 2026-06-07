import { HttpManager } from './utils/http';
import { extractHandleId, fetchHandleDataFromAPI } from "./manager";
import { UnsupportedMethodException, UnsupportedProcessException } from './utils/error';
import { fetchArtworkData, getArtworkImageURL, getUserHeadshotURL, } from './wilddream.api';
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
            bgColor: '#000000',
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
        const { userid: userId, username: userNickName, userpagename: userPageName } = payload.author;
        return {
            publishAt: dayjs.unix(+payload.artwork.dateline).toDate(),
            author: {
                headshotUrl: getUserHeadshotURL(userId),
                nickname: userNickName,
                userId: userPageName,
            },
            title: payload.artwork.title,
            content: payload.artwork.description,
            cover: getArtworkImageURL(userId, handleId),
            badges: [
                [
                    { emoji: "👀", name: helper.extraHumanable("浏览", +payload.artwork.viewcount, "次") },
                    { emoji: "✨", name: helper.extraHumanable("喜欢", +payload.artwork.favcount, "人") },
                ]
            ],
            useForward: +(payload.artwork.rating) > 0,
            strawberry: {
                emoji: "🖼",
                feature: "原图",
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
            images: fursonaImageId.length > 0 ? [getArtworkImageURL(userId, fursonaImageId)] : undefined,
            badges: [
                [
                    { emoji: "🧩", name: helper.extraHumanable("作品总数", +payload.artworkcount, "个") },
                    { emoji: "👀", name: helper.extraHumanable("作品总观看", +payload.pageviews, "次") },
                    { emoji: "✨", name: helper.extraHumanable("作品总喜欢", +payload.favcount, "次") },
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
        const artworkId = source;
        const artwork = await fetchArtworkData(INSTANCE.http, artworkId);
        const medias = [
            {
                type: "image",
                url: getArtworkImageURL(artwork.author.userid, artworkId),
                summary: `[图片]${artwork.artwork.title}_${artworkId}`,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFPQSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQzNDLE9BQU8sRUFBQyxlQUFlLEVBQUUsc0JBQXNCLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFDbEUsT0FBTyxFQUFFLDBCQUEwQixFQUFFLDJCQUEyQixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3hGLE9BQU8sRUFDTCxnQkFBZ0IsRUFDaEIsa0JBQWtCLEVBQ2xCLGtCQUFrQixHQUduQixNQUFNLGlCQUFpQixDQUFDO0FBQ3pCLE9BQU8sS0FBSyxNQUFNLE9BQU8sQ0FBQztBQUUxQixPQUFPLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQTBCdEQ7Ozs7OztHQU1HO0FBQ0gsTUFBTSxLQUFLLEdBS1A7SUFDRixRQUFRLEVBQUUsV0FBVztJQUNyQixVQUFVLEVBQUUsMkJBQTJCO0lBQ3ZDLFVBQVUsRUFBRSxLQUFLO0lBQ2pCLFVBQVUsRUFBRSxDQUFDO0NBQ2QsQ0FBQTtBQUVEOzs7S0FHSztBQUNMLE1BQU0sUUFBUSxHQUVWO0lBQ0YsSUFBSSxFQUFFLElBQUk7Q0FDWCxDQUFBO0FBRUQsTUFBTSxPQUFPLEdBQVk7SUFDdkIsUUFBUSxFQUFFO1FBQ1IsSUFBSSxFQUFFLGtCQUFrQixLQUFLLENBQUMsUUFBUSxFQUFFO1FBQ3hDLFFBQVEsRUFBRSxLQUFLLENBQUMsUUFBUTtRQUN4QixjQUFjLEVBQUUsQ0FBQyxlQUFlLENBQUM7UUFDakMsT0FBTyxFQUFFLENBQUM7UUFDVixNQUFNLEVBQUUsV0FBVztRQUNuQixPQUFPLEVBQUU7WUFDUCxJQUFJLEVBQUUsR0FBRztZQUNULEtBQUssRUFBRSxHQUFHO1lBQ1YsS0FBSyxFQUFFLElBQUk7WUFDWCxLQUFLLEVBQUUsQ0FBQztTQUNUO1FBQ0QsWUFBWSxFQUFFO1lBQ1osSUFBSSxFQUFF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