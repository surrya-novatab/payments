// import type { ConfigModel } from "../Models";

const DEFAULT_ENV = "qa03";
const LOCAL_HOST = "localhost";
const LOCAL_ENV = "qa02";
const ENVIRONMENTS = "environments";
const ENVIRONMENT_MAPPING = "environmentMapping";

interface EnvironmentConfig {
    [key: string]: ConfigModel | Record<string, string> | undefined;

    [ENVIRONMENTS]: {
        [key: string]: string;
    };
    [ENVIRONMENT_MAPPING]?: {
        [key: string]: string;
    };
}

const SUBDOMAIN_INDEX = 1;
const FIRST_ARRAY_INDEX = 0;
const NON_ENTERPRISE_PRODUCTION_KEYWORD = "restaurants";

const getEnvConfigKey = (xFeatureAccess: boolean, data: EnvironmentConfig): ConfigModel => {
    let host = window.location.hostname;
    const updateHost = host.replace("rms.", "").replace("www.", "");
    const environmentObject = data[ENVIRONMENTS];
    const environmentKeys = Object.keys(environmentObject);

    const configKey = environmentKeys.find(
        (envKey: string) => environmentObject[envKey] === updateHost
    );

    if (configKey && configKey === LOCAL_HOST) {
        return data[LOCAL_ENV] as ConfigModel;
    }

    if (configKey) {
        return data[configKey] as ConfigModel;
    }

    const directNovatab = updateHost.match(/^[^.]+\.novatab\.com$/);
    if (directNovatab) {
        const environmentKeyWord = updateHost.split(".")[FIRST_ARRAY_INDEX];

        if (environmentKeyWord === NON_ENTERPRISE_PRODUCTION_KEYWORD) {
            return data["prod"] as ConfigModel;
        }

        return data["prod-enterprise"] as ConfigModel;
    }

    const subdomainMatch = updateHost.match(/^[^.]+\.([^.]+)\.novatab\.com$/);
    if (subdomainMatch && subdomainMatch[SUBDOMAIN_INDEX]) {
        const envKey = subdomainMatch[SUBDOMAIN_INDEX];

        const enterpriseKey = `${envKey}-enterprise`;
        if (data[enterpriseKey]) {
            return data[enterpriseKey] as ConfigModel;
        }

        const mappingObject = data[ENVIRONMENT_MAPPING];
        if (mappingObject && mappingObject[envKey]) {
            const mappedEnv = mappingObject[envKey];
            return data[mappedEnv] as ConfigModel;
        }
    }

    return data[DEFAULT_ENV] as ConfigModel;
};

export { getEnvConfigKey };
