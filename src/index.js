import { HttpManager } from './utils/http';
import { extractHandleId, fetchHandleDataFromAPI } from "./manager";
import { UnsupportedMethodException, UnsupportedProcessException } from './utils/error';
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
        return {
            author: {
                headshotUrl: getUserHeadshotURL(userId),
                nickname: userNickName,
                userId: userPageName,
            },
            cover: getArtworkImageURL(userId, handleId),
            badges: [
                [
                ]
            ],
            strawberry: {
                emoji: "🖼",
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
            badges: [
                [
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
        const medias = [
            {
                type: "image",
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
