import 'dotenv/config';   // 自动加载 .env 文件
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
      await host.emitRepost(url);
    } catch (err) {
      console.error(`✗ Failed:`, err);
    }
  }

  await host.dispose();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
