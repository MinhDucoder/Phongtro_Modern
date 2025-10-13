const { Client } = require('meilisearch');

// Test kết nối MeiliSearch
async function testMeiliSearch() {
    try {
        const client = new Client({
            host: 'http://localhost:7700',
            apiKey: 'masterKey'
        });

        // Test health
        const health = await client.health();
        console.log('✅ MeiliSearch Health:', health);

        // Test get version
        const version = await client.getVersion();
        console.log('✅ MeiliSearch Version:', version);

        // Test tạo index
        const index = client.index('posts');
        const indexInfo = await index.getRawInfo();
        console.log('✅ Posts Index Info:', indexInfo);

        console.log('\n🎉 MeiliSearch đang hoạt động tốt!');
    } catch (error) {
        console.error('❌ Lỗi kết nối MeiliSearch:', error.message);
        console.log('\n💡 Hướng dẫn khắc phục:');
        console.log('1. Chạy: docker run -d -p 7700:7700 -e MEILI_MASTER_KEY="masterKey" getmeili/meilisearch:latest');
        console.log('2. Kiểm tra container: docker ps');
        console.log('3. Kiểm tra logs: docker logs <container_id>');
    }
}

testMeiliSearch();