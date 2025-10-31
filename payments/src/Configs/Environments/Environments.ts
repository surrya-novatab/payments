import { getXFeatureAccess } from "src/Shared/Utils/LocalStorageUtils";
import { ConfigModel } from "./Models";
import { getEnvConfigKey } from "./Utils/environment.utils";
import demoConfig from "./Demo.json";

const ENV_CONFIG_URL =
    "https://dev-rms-config-294f655d18b3.s3.ap-south-1.amazonaws.com/external-config.json";

const loadConfig = (xFeature: boolean): ConfigModel => {
    try {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", ENV_CONFIG_URL, false);
        xhr.send(null);

        if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            return getEnvConfigKey(xFeature, data);
        } else {
            console.error(`Failed to load configuration. Status: ${xhr.status}`);
            return demoConfig as unknown as ConfigModel;
        }
    } catch (error) {
        return demoConfig as unknown as ConfigModel;
    }
};

export const getConfig = () => {
    let xValue = getXFeatureAccess();
    let Config: ConfigModel = loadConfig(xValue);
    return function () {
        let xFeature = getXFeatureAccess();
        if (xValue !== xFeature) {
            xValue = xFeature;
            Config = loadConfig(xFeature);
        }
        return Config;
    };
};
export const ConfigProvider = getConfig();
export default ConfigProvider;
