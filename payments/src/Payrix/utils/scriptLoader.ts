// Function to check if current URL is production
export const isProduction = (): boolean => {
    if (typeof window === "undefined") return false;

    const hostname = window.location.hostname.toLowerCase();

    // Check if it's novatab.com domain
    if (!hostname.includes("novatab.com")) {
        return false;
    }

    return hostname.includes("prod") || (!hostname.includes("uat") && hostname.includes("novatab.com"));

    //sandbox environment
    //  return false;
};

// Get the correct Payrix URL based on environment
export const getPayrixUrl = (): string => {
    return isProduction()
        ? "https://api.payrix.com/payFieldsScript?spa=1"
        : "https://test-api.payrix.com/payFieldsScript?spa=1";
};

// Script configurations for each component type
export const SCRIPT_CONFIGS = {
    "save-card": [
        { src: getPayrixUrl(), id: "payrix-script" },
        { src: "https://code.jquery.com/jquery-3.6.3.min.js", id: "jquery" },
    ],
    "card-manual": [
        { src: "https://code.jquery.com/jquery-3.6.3.min.js", id: "jquery" },
        { src: getPayrixUrl(), id: "payrix-script" },
    ],
    "mobile-payment": [
        { src: getPayrixUrl(), id: "payrix-script" },
        { src: "https://pay.google.com/gp/p/js/pay.js", id: "gpay-script" },
        {
            src: "https://applepay.cdn-apple.com/jsapi/1.latest/apple-pay-sdk.js",
            id: "apple-pay-script",
        },
        { src: "https://code.jquery.com/jquery-3.6.3.min.js", id: "jquery" },
    ],
    "save-and-pay": [
        { src: getPayrixUrl(), id: "payrix-script" },
        { src: "https://code.jquery.com/jquery-3.6.3.min.js", id: "jquery" },
    ],
} as const;

type ComponentType = keyof typeof SCRIPT_CONFIGS;

const loadSingleScript = (src: string, id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (document.getElementById(id)) return resolve();

        const script = document.createElement("script");
        script.src = src;
        script.id = id;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load: ${src}`));
        document.head.appendChild(script);
    });
};

export const loadPayrixScripts = async (componentType: ComponentType): Promise<void> => {
    const scripts = SCRIPT_CONFIGS[componentType];

    for (const script of scripts) {
        await loadSingleScript(script.src, script.id);
    }
};
