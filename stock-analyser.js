const PRODUCTS = [
    {
        name: 'Seam XVIII Signature',
        url: 'https://one8.com/products/seam-xviii-signature-mens-white.js',
        page: 'https://one8.com/products/seam-xviii-signature-mens-white',
        variantId: 57738053583008 // UK 11
    }
];
const TELEGRAM_BOT_TOKEN = '8312085477:AAF8VOWEnffFZVqYj5qBDZ1i9vP4kR-mdJM';
const TELEGRAM_CHAT_ID = '5181642224'; // Leave empty for now
async function sendTelegramMessage(message) {
    if (!TELEGRAM_CHAT_ID) {
        console.log('Telegram Chat ID not configured.');
        return;
    }

    try {
        await fetch(
            `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    text: message
                })
            }
        );
    } catch (error) {
        console.error('Telegram notification failed:', error.message);
    }
}
const CHECK_INTERVAL_MS = 10000;
let alarmStarted = false;
async function sendStartupNotification() {
    await sendTelegramMessage(
        '✅ One8 Stock Monitor Started\n' +
        `Time: ${new Date().toLocaleString()}\n` +
        `Monitoring ${PRODUCTS.length} products for UK 11 stock.`
    );
}
async function checkProduct(productInfo) {
    try {
        const response = await fetch(productInfo.url);
        const product = await response.json();

        const variant = product.variants.find(
            v => v.id === productInfo.variantId
        );

        if (variant?.available) {
            await sendTelegramMessage(
                `🚨 ${productInfo.name} UK 11 AVAILABLE!\n` +
                `Size: ${variant.title}\n` +
                `Price: ₹${variant.price / 100}\n` +
                `${productInfo.page}`
            );
            console.log('\n=================================');
            console.log(`🚨 ${productInfo.name} UK 11 AVAILABLE 🚨`);
            console.log(`Size: ${variant.title}`);
            console.log(`Price: ₹${variant.price / 100}`);
            console.log(`SKU: ${variant.sku}`);
            console.log(`Link: ${productInfo.page}`);
            console.log('=================================\n');

            if (!alarmStarted) {
                alarmStarted = true;

                process.stdout.write('\x07\x07\x07');

                setInterval(() => {
                    process.stdout.write('\x07');
                }, 2000);
            }
        } else {
            console.log(
                `[${new Date().toLocaleTimeString()}] ${productInfo.name} UK 11 unavailable`
            );
        }
    } catch (err) {
        console.error(`${productInfo.name}:`, err.message);
    }
}

async function checkAll() {
    for (const product of PRODUCTS) {
        await checkProduct(product);
    }
}
await sendStartupNotification();
checkAll();
setInterval(checkAll, CHECK_INTERVAL_MS);
