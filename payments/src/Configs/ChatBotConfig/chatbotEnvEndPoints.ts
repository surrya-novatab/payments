const chatBotEnvEndpoints : Record<string, string> = {
    "restaurants-dev01.dev.plateron.com": "https://ai-dev01.dev.plateron.com",
    "restaurants-dev02.dev.plateron.com": "https://ai-dev01.dev.plateron.com",
    "restaurants-dev03.dev.plateron.com": "https://ai-dev01.dev.plateron.com",
    "restaurants-qa03.dev.plateron.com": "https://ai-qa03.dev.plateron.com",
    "restaurants-qa01.dev.plateron.com": "https://ai-qa03.dev.plateron.com",
    "restaurants-qa02.dev.plateron.com": "https://ai-qa03.dev.plateron.com",

    "localhost": "http://localhost:4000",
};

const chatBotEnvMapper : Record<string, string> = {
    "restaurants-dev01.dev.plateron.com": "dev01",
    "restaurants-dev02.dev.plateron.com": "dev02",
    "restaurants-dev03.dev.plateron.com": "dev03",
    "restaurants-qa03.dev.plateron.com": "qa03",
    "restaurants-qa01.dev.plateron.com": "qa01",
    "restaurants-qa02.dev.plateron.com": "qa02",

    "localhost": "dev01",
};

export { chatBotEnvMapper}

export default chatBotEnvEndpoints;