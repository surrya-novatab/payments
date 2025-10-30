import { pathOr } from "ramda";
import { LocalStorageKeys } from "src/Shared/Enums";

export const getToken = () => {
    return localStorage.getItem(LocalStorageKeys.AuthToken);
};

export const getSessionToken = () => {
    return localStorage.getItem(LocalStorageKeys.SessionToken);
};

export const getRestuarantRefId = () => {
    const restaurant = sessionStorage.getItem(LocalStorageKeys.Restaurant);
    if (restaurant) {
        const data = JSON.parse(restaurant);
        return pathOr("", [0, "refId"], data);
    }
    return "";
};

export const getBusinessRefId = () => {
    const data = JSON.parse(sessionStorage.getItem("restaurant") || "[]");
    return pathOr("", [0, "businessRefId"], data);
};

export const getXFeatureAccess = () => {
    const data = JSON.parse(sessionStorage.getItem("restaurant") || "[]");
    return pathOr("", [0, "xFeatureAccess"], data);
};

export const getProfile = () => {
    // @ts-ignore
    const profile = JSON.parse(localStorage.getItem("profile"));
    return profile;
};

export const getHouseAccountId = () => {
    const queryParams = new URLSearchParams(window.location.search);
    const houseAccountIdParam = queryParams.get("houseAccountId");
    return houseAccountIdParam;
};

export const getUserRefId = () => {
    const queryParams = new URLSearchParams(window.location.search);
    const userRefIdParam = queryParams.get("userRefId");
    return userRefIdParam;
};

export const getCustomerType = () => {
    const queryParams = new URLSearchParams(window.location.search);
    const houseAccountIdParam = queryParams.get("isHouseAccount");
    return houseAccountIdParam;
};

export const setSelectedRestaurantTop = (selectedRestaurant: any, restaurants: any[]) => {
    if (selectedRestaurant && restaurants) {
        // Find index from restaurant array with selected restaura
        // remove that parituclar index from restaurant array
        // set the selected restaurant at top of the restaurants array
        // then set that restaurant array in localstorage in restaurat key

        const findCurrentRestaurant = restaurants?.findIndex((item) => {
            return item?.refId === selectedRestaurant?.refId;
        });
        const removeCurrentRestaurant = restaurants.filter((item, index) => {
            return index !== findCurrentRestaurant;
        });
    }
};

export const setNewrestaurantToken = (restaurant: any) => {
    const restaurent = JSON.parse(sessionStorage.getItem("restaurant") || "[]");
    if (restaurent && restaurent.length > 0) {
        restaurent[0] = restaurant;
        sessionStorage.setItem("restaurant", JSON.stringify(restaurent));
    }
};

export const tokenPresent = () => {
    const token = localStorage.getItem("token");
    if (token == "" || token == undefined || token == null) {
        return false;
    } else {
        return true;
    }
};

export const getResDetails = () => {
    // @ts-ignore
    const restaurent = JSON.parse(sessionStorage.getItem("restaurant"));
    return restaurent[0];
};
export const getPWADisplayMode = () => {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;

    if (document.referrer.startsWith("android-app://")) {
        return "twa";
    } else if (isStandalone) {
        return "standalone";
    }
    return "browser";
};

export const setPayrollAccess = (access: boolean) => {
    localStorage.setItem("payrollAccess", access.toString());
};

export const getPayrollAccess = (): boolean => {
    const payrollAccess = localStorage.getItem("payrollAccess");
    return payrollAccess === "true";
};

export const clearPayrollAccess = () => {
    localStorage.removeItem("payrollAccess");
};



