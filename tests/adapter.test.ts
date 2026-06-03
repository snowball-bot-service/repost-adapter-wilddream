import { describe, it, expect, vi, beforeEach } from 'vitest';
import type {
  AdapterContext,
  ProcessHandler,
  RepostHandler,
} from '@snowball-bot/repost-adapter';

// 在 import adapter 之前 mock 掉网络层，保留纯 URL 构造函数的真实实现。
// index.ts（process 路径）与 manager.ts（repost 路径）都从这里取 fetch 函数。
vi.mock('../src/wilddream.api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/wilddream.api')>();
  return {
    ...actual,
    fetchArtworkData: vi.fn(),
    fetchUserProfileData: vi.fn(),
  };
});

import adapter from '../src';
import {
  fetchArtworkData,
  fetchUserProfileData,
  type WildDreamArtworkResponse,
  type WildDreamUserProfileResponse,
} from '../src/wilddream.api';
import { UnsupportedProcessException } from '../src/utils/error';

const mockFetchArtworkData = vi.mocked(fetchArtworkData);
const mockFetchUserProfileData = vi.mocked(fetchUserProfileData);

// ---------------------------------------------------------------------------
// Fixtures（仅填充 handler 实际读取的字段）
// ---------------------------------------------------------------------------

const ARTWORK_FIXTURE = {
  success: true,
  artwork: {
    artworkid: '44716',
    title: 'Test Artwork',
    description: 'an artwork description',
    rating: '0',
    dateline: '1700000000',
    viewcount: '1234',
    favcount: '56',
  },
  author: {
    userid: '789',
    username: 'Rominwolf',
    userpagename: 'rominwolf',
  },
} as unknown as WildDreamArtworkResponse;

const PROFILE_FIXTURE = {
  user: {
    userid: '789',
    username: 'Rominwolf',
    userpagename: 'rominwolf',
    introduction: 'hello there',
  },
  profile: {
    fursona_img: '99',
  },
  artworkcount: 12,
  favcount: 340,
  pageviews: 5678,
} as unknown as WildDreamUserProfileResponse;

// ---------------------------------------------------------------------------
// Mock AdapterContext
// ---------------------------------------------------------------------------

function createMockContext(configValues: Record<string, unknown> = {}): {
  ctx: AdapterContext;
  getRepostHandler: () => RepostHandler;
  getProcessHandler: () => ProcessHandler;
} {
  let repostHandler: RepostHandler | null = null;
  let processHandler: ProcessHandler | null = null;

  const ctx: AdapterContext = {
    on: vi.fn((event, h) => {
      if (event === 'onRepostRequest') repostHandler = h as RepostHandler;
      if (event === 'onProcessRequest') processHandler = h as ProcessHandler;
    }) as AdapterContext['on'],
    config: vi.fn((key: string) => configValues[key]) as AdapterContext['config'],
    helper: {
      pick: (record, key, fallback) => record[key] ?? fallback!,
      extraHumanable: (prefix, number, suffix) => `${prefix}${number}${suffix}`,
      humanableDuration: (duration) => String(duration),
    },
    logger: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    },
  };

  return {
    ctx,
    getRepostHandler: () => {
      if (!repostHandler) throw new Error('onRepostRequest handler not registered');
      return repostHandler;
    },
    getProcessHandler: () => {
      if (!processHandler) throw new Error('onProcessRequest handler not registered');
      return processHandler;
    },
  };
}

const REQUESTER = { userId: 'REQUESTER_USERID', nickname: 'REQUESTER_NICKNAME' };

describe('adapter', () => {
  beforeEach(() => {
    mockFetchArtworkData.mockReset();
    mockFetchUserProfileData.mockReset();
  });

  it('exposes correct manifest', () => {
    expect(adapter.manifest.name).toBe('repost-adapter-wilddream');
    expect(adapter.manifest.provider).toBe('wilddream');
    expect(adapter.manifest.whitelistHosts).toContain('wilddream.net');
  });

  it('registers both handlers on init', async () => {
    const { ctx } = createMockContext();
    await adapter.initState(ctx);
    expect(ctx.on).toHaveBeenCalledWith('onRepostRequest', expect.any(Function));
    expect(ctx.on).toHaveBeenCalledWith('onProcessRequest', expect.any(Function));
  });

  describe('onRepostRequest', () => {
    it('handles a post URL', async () => {
      mockFetchArtworkData.mockResolvedValue(ARTWORK_FIXTURE);

      const { ctx, getRepostHandler } = createMockContext();
      await adapter.initState(ctx);

      const source = 'https://www.wilddream.net/Art/view/44716';
      const result = await getRepostHandler()({ source, code: 'test', requester: REQUESTER });

      expect(result).not.toBeNull();
      expect(result!.method).toBe('post');
      expect(result!.provider).toBe('wilddream');
      expect(result!.originalUrl).toBe(source);
      expect(result!.postId).toBe('44716');
      expect(result!.code).toBe('test');
      expect(result!.author.nickname).toBe('Rominwolf');
      // post 路径会挂载 🍓 strawberry 进程
      expect(result!.strawberry).toBeDefined();
    });

    it('handles a profile URL', async () => {
      mockFetchUserProfileData.mockResolvedValue(PROFILE_FIXTURE);

      const { ctx, getRepostHandler } = createMockContext();
      await adapter.initState(ctx);

      const source = 'https://www.wilddream.net/user/rominwolf';
      const result = await getRepostHandler()({ source, code: 'test', requester: REQUESTER });

      expect(result).not.toBeNull();
      expect(result!.method).toBe('profile');
      expect(result!.postId).toBe('rominwolf');
      expect(result!.title).toBe('Rominwolf');
      expect(result!.strawberry).toBeUndefined();
    });
  });

  describe('onProcessRequest', () => {
    it('handles the strawberry process (原图)', async () => {
      mockFetchArtworkData.mockResolvedValue(ARTWORK_FIXTURE);

      const { ctx, getProcessHandler } = createMockContext();
      await adapter.initState(ctx);

      const result = await getProcessHandler()({
        method: 'strawberry',
        source: '44716',
        code: 'test',
        requester: REQUESTER,
      });

      expect(result).not.toBeNull();
      expect(result!.provider).toBe('wilddream');
      expect(result!.method).toBe('strawberry');
      expect(result!.code).toBe('test');
      expect(result!.medias).toHaveLength(1);
      expect(result!.medias[0].type).toBe('image');
      expect(result!.medias[0].url).toContain('44716');
    });

    it('throws on an unsupported process', async () => {
      const { ctx, getProcessHandler } = createMockContext();
      await adapter.initState(ctx);

      await expect(
        getProcessHandler()({
          method: 'watermelon',
          source: '44716',
          code: 'test',
          requester: REQUESTER,
        })
      ).rejects.toBeInstanceOf(UnsupportedProcessException);
    });
  });
});
