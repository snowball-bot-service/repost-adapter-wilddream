import {
  Adapter,
  AdapterContext,
  AdapterRepostResponsePayload,
  AdapterRepostRequestParams,
  SocialProvider, AdapterProcessRequestParams, AdapterProcessResponsePayload, ProcessMediaInfo,
} from '@snowball-bot/repost-adapter';
import { HttpManager } from './utils/http';
import {extractHandleId, fetchHandleDataFromAPI} from "./manager";
import { UnsupportedMethodException, UnsupportedProcessException } from './utils/error';
import {
  fetchArtworkData,
  getArtworkImageURL, getArtworkRawImageURL,
  getUserHeadshotURL,
  WildDreamArtworkResponse,
  WildDreamUserProfileResponse,
} from './wilddream.api';
import dayjs from 'dayjs';

export { HttpManager, HttpError } from './utils/http';
export type {
  HttpManagerOptions,
  HttpRequestOptions,
  HttpMethod,
  QueryParams,
} from './utils/http';

// ============================================================================
// TODO: 1. 修改下方 manifest 信息
// ============================================================================
//
// - manifest.name: 必须以 `repost-adapter-` 开头
// - manifest.provider: 你的平台标识符，比如 'twitter' / 'bilibili'
// - manifest.whitelistHosts: 你的 adapter 接管的域名列表（不带 www）
// - manifest.version: 适配器自己的版本号，每次有重大变化时递增
// - manifest.author: 你的昵称
// - manifest.billing: 各类费用雪花定价
// - manifest.providerInfo: 该适配器的基本信息
//
// ============================================================================

interface AdapterOptions {
  apiKey?: string;
}

/**
 * 常量仓库
 * @param apiBaseURL API 基础地址
 * @param provider 提供商
 * @param apiTimeout API 超时时间（毫秒）
 * @param apiRetries API 重试次数
 */
const CONST: {
  apiBaseURL: string,
  provider: SocialProvider,
  apiTimeout: number,
  apiRetries: number,
} = {
  provider: "wilddream",
  apiBaseURL: "https://www.wilddream.net",
  apiTimeout: 10000,
  apiRetries: 1,
}

/**
 * 实例仓库
 * @param instance.http 模块级 HTTP 客户端, 在 initState 中创建, dispose 中销毁
 * */
const INSTANCE: {
  http: HttpManager | null;
} = {
  http: null,
}

const adapter: Adapter = {
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
  async initState(ctx: AdapterContext) {
    const userAgent = ctx.config<string>('userAgent');

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

async function handleRepostRequest(
  req: AdapterRepostRequestParams,
  ctx: AdapterContext,
  _options: AdapterOptions
): Promise<AdapterRepostResponsePayload | null> {
  const { helper, logger } = ctx;

  logger.debug(`[${CONST.provider}] fetching ${req.source}`);

  // 从 req.source 解析出 Handle Info
  const [handleMethod, handleId] = extractHandleId(req.source);

  // 不支持的转发模式
  if (handleMethod === "live")
    throw new UnsupportedMethodException(handleMethod, handleId);

  // 调用平台 API 拿到原始数据
  const handleData = await fetchHandleDataFromAPI(INSTANCE.http!, handleMethod, handleId);

  // 函数：构建 Post
  const fnBuildPost = (): Omit<
    AdapterRepostResponsePayload,
    'postId' | 'method' | "code" | "originalUrl" | "provider" | "requester"
  > => {
    const payload = handleData as WildDreamArtworkResponse;
    const {
      userid: userId, username: userNickName, userpagename: userPageName,
    } = payload.author;
    const {
      title, description,
      rating,
      allowfullimage: allowFullImage,
      dateline: publishDate,
      favcount: favs, viewcount: views,
    } = payload.artwork;

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
  const fnBuildProfile = (): Omit<
    AdapterRepostResponsePayload,
    'postId' | 'method' | "code" | "originalUrl" | "provider" | "requester"
  > => {
    const payload = handleData as WildDreamUserProfileResponse;
    const {
      userid: userId, username: userNickName, userpagename: userPageName, introduction
    } = payload.user;
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
    }
  }

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

async function handleProcessingRequest(
  req: AdapterProcessRequestParams,
  ctx: AdapterContext,
  _options: AdapterOptions,
): Promise<AdapterProcessResponsePayload | null> {
  const { logger } = ctx;
  const { method, source, requester, code } = req;

  logger.debug(`[${CONST.provider}] fetching ${method}: ${source}`);

  // 获取原图
  if (method === "strawberry") {
    const artwork = await fetchArtworkData(INSTANCE.http!, source);
    const {
      title,
      artworkid: artworkId,
      allowfullimage: allowFullImage,
      filename: fileName,
      userid: userId,
    } = artwork.artwork;

    const url = allowFullImage === "1"
      ? getArtworkRawImageURL(userId, fileName!)
      : getArtworkImageURL(userId, artworkId);

    const medias: ProcessMediaInfo[] = [
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
