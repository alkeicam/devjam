module.exports = {
    API: {
        BASE_URLS: ["https://devjam-lab.azurewebsites.net"]
    },
    SYNC: {
        SYNC_INTERVAL_MS: 1000*60*2, // every 2 minutes,
        PATH: "/receive"
    },
    JOIN: {
        PATH: "/auth/join"
    }
}