module.exports = {
    SYNC: {
        DEFAULT_URLS: ["https://devjam-lab.azurewebsites.net/receive"],
        DEFAULT_ACCOUNT_ID: "_guest",
        SYNC_INTERVAL_MS: 1000*60*2 // every 2 minutes
    },
    JOIN: {
        DEFAULT_URLS: ["http://localhost:7071/auth/join"],
    }
}