import { describe, it, expect, vi, beforeEach } from 'vitest';
// 在 import adapter 之前 mock 掉网络层，保留纯 URL 构造函数的真实实现。
// index.ts（process 路径）与 manager.ts（repost 路径）都从这里取 fetch 函数。
vi.mock('../src/wilddream.api', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        fetchArtworkData: vi.fn(),
        fetchUserProfileData: vi.fn(),
    };
});
import adapter from '../src';
import { fetchArtworkData, fetchUserProfileData, } from '../src/wilddream.api';
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
};
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
};
// ---------------------------------------------------------------------------
// Mock AdapterContext
// ---------------------------------------------------------------------------
function createMockContext(configValues = {}) {
    let repostHandler = null;
    let processHandler = null;
    const ctx = {
        on: vi.fn((event, h) => {
            if (event === 'onRepostRequest')
                repostHandler = h;
            if (event === 'onProcessRequest')
                processHandler = h;
        }),
        config: vi.fn((key) => configValues[key]),
        helper: {
            pick: (record, key, fallback) => record[key] ?? fallback,
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
            if (!repostHandler)
                throw new Error('onRepostRequest handler not registered');
            return repostHandler;
        },
        getProcessHandler: () => {
            if (!processHandler)
                throw new Error('onProcessRequest handler not registered');
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
            expect(result.method).toBe('post');
            expect(result.provider).toBe('wilddream');
            expect(result.originalUrl).toBe(source);
            expect(result.postId).toBe('44716');
            expect(result.code).toBe('test');
            expect(result.author.nickname).toBe('Rominwolf');
            // post 路径会挂载 🍓 strawberry 进程
            expect(result.strawberry).toBeDefined();
        });
        it('handles a profile URL', async () => {
            mockFetchUserProfileData.mockResolvedValue(PROFILE_FIXTURE);
            const { ctx, getRepostHandler } = createMockContext();
            await adapter.initState(ctx);
            const source = 'https://www.wilddream.net/user/rominwolf';
            const result = await getRepostHandler()({ source, code: 'test', requester: REQUESTER });
            expect(result).not.toBeNull();
            expect(result.method).toBe('profile');
            expect(result.postId).toBe('rominwolf');
            expect(result.title).toBe('Rominwolf');
            expect(result.strawberry).toBeUndefined();
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
            expect(result.provider).toBe('wilddream');
            expect(result.method).toBe('strawberry');
            expect(result.code).toBe('test');
            expect(result.medias).toHaveLength(1);
            expect(result.medias[0].type).toBe('image');
            expect(result.medias[0].url).toContain('44716');
        });
        it('throws on an unsupported process', async () => {
            const { ctx, getProcessHandler } = createMockContext();
            await adapter.initState(ctx);
            await expect(getProcessHandler()({
                method: 'watermelon',
                source: '44716',
                code: 'test',
                requester: REQUESTER,
            })).rejects.toBeInstanceOf(UnsupportedProcessException);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRhcHRlci50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYWRhcHRlci50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFFLE1BQU0sUUFBUSxDQUFDO0FBTzlELG1EQUFtRDtBQUNuRCw2REFBNkQ7QUFDN0QsRUFBRSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxLQUFLLEVBQUUsY0FBYyxFQUFFLEVBQUU7SUFDdkQsTUFBTSxNQUFNLEdBQUcsTUFBTSxjQUFjLEVBQXlDLENBQUM7SUFDN0UsT0FBTztRQUNMLEdBQUcsTUFBTTtRQUNULGdCQUFnQixFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDekIsb0JBQW9CLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRTtLQUM5QixDQUFDO0FBQ0osQ0FBQyxDQUFDLENBQUM7QUFFSCxPQUFPLE9BQU8sTUFBTSxRQUFRLENBQUM7QUFDN0IsT0FBTyxFQUNMLGdCQUFnQixFQUNoQixvQkFBb0IsR0FHckIsTUFBTSxzQkFBc0IsQ0FBQztBQUM5QixPQUFPLEVBQUUsMkJBQTJCLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUVqRSxNQUFNLG9CQUFvQixHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUN6RCxNQUFNLHdCQUF3QixHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUMsQ0FBQztBQUVqRSw4RUFBOEU7QUFDOUUsZ0NBQWdDO0FBQ2hDLDhFQUE4RTtBQUU5RSxNQUFNLGVBQWUsR0FBRztJQUN0QixPQUFPLEVBQUUsSUFBSTtJQUNiLE9BQU8sRUFBRTtRQUNQLFNBQVMsRUFBRSxPQUFPO1FBQ2xCLEtBQUssRUFBRSxjQUFjO1FBQ3JCLFdBQVcsRUFBRSx3QkFBd0I7UUFDckMsTUFBTSxFQUFFLEdBQUc7UUFDWCxRQUFRLEVBQUUs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