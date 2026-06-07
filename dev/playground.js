import 'dotenv/config'; // 自动加载 .env 文件
import adapter from '../src';
import { MockAdapterHost } from './harness';
async function main() {
    const host = new MockAdapterHost({
        userAgent: process.env.USER_AGENT,
    });
    await host.register(adapter);
    // 测试 URL 列表：随便改、随便加
    const testUrls = [
        'https://www.wilddream.net/Art/view/44716',
        'https://www.wilddream.net/user/rominwolf',
    ];
    for (const url of testUrls) {
        try {
            const res = await host.emitRepost(url);
            // 转发 post 后，模拟用户点 🍓 触发 strawberry 进程（取原图）
            if (res?.method === 'post' && res.strawberry) {
                await host.emitProcess('strawberry', res.postId);
            }
        }
        catch (err) {
            console.error(`✗ Failed:`, err);
        }
    }
    await host.dispose();
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxheWdyb3VuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInBsYXlncm91bmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxlQUFlLENBQUMsQ0FBRyxlQUFlO0FBQ3pDLE9BQU8sT0FBTyxNQUFNLFFBQVEsQ0FBQztBQUM3QixPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBRTVDLEtBQUssVUFBVSxJQUFJO0lBQ2pCLE1BQU0sSUFBSSxHQUFHLElBQUksZUFBZSxDQUFDO1FBQy9CLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVU7S0FDbEMsQ0FBQyxDQUFDO0lBRUgsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBRTdCLG9CQUFvQjtJQUNwQixNQUFNLFFBQVEsR0FBRztRQUNmLDBDQUEwQztRQUMxQywwQ0FBMEM7S0FDM0MsQ0FBQztJQUVGLEtBQUssTUFBTSxHQUFHLElBQUksUUFBUSxFQUFFO1FBQzFCLElBQUk7WUFDRixNQUFNLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFdkMsMkNBQTJDO1lBQzNDLElBQUksR0FBRyxFQUFFLE1BQU0sS0FBSyxNQUFNLElBQUksR0FBRyxDQUFDLFVBQVUsRUFBRTtnQkFDNUMsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDbEQ7U0FDRjtRQUFDLE9BQU8sR0FBRyxFQUFFO1lBQ1osT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDakM7S0FDRjtJQUVELE1BQU0sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3ZCLENBQUM7QUFFRCxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtJQUNuQixPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ25CLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEIsQ0FBQyxDQUFDLENBQUMifQ==