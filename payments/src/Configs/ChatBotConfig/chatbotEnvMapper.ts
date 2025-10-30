import chatBotEnvEndpoints, { chatBotEnvMapper } from "./chatbotEnvEndPoints";

const defaultChatbotEndpoint = "restaurants-dev01.dev.plateron.com";

const getHost = () => {
    let host = window.location.hostname;
    const updateHost = host.replace("rms.", "").replace("www.", "");

    return updateHost;
}

const chatbotEnvMapper = () => {
    const updateHost = getHost();
    const chatBotEnvEndpoint = chatBotEnvEndpoints[updateHost];

    if(!chatBotEnvEndpoint){
        return chatBotEnvEndpoints[defaultChatbotEndpoint];
    }

    return chatBotEnvEndpoint;
};


const getChatbotEnv = () => {
    const updateHost = getHost();

    const chatBotEnvEndpoint = chatBotEnvMapper[updateHost];

    if(!chatBotEnvEndpoint){
        return chatBotEnvMapper[defaultChatbotEndpoint];
    }

    return chatBotEnvEndpoint;
};

export { getChatbotEnv}

export default chatbotEnvMapper;