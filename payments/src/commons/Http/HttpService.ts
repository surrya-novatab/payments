import type { HttpHeaderParameter, HttpParameter } from "./Models/HttpParameter";
import type { HttpResult } from "./Models/HttpResult";
import axios from "axios";
import type { CancelToken, CancelTokenSource } from "axios";
import {
    getToken,
    getXFeatureAccess,
} from "src/Shared/Utils/LocalStorageUtils";
import { pathOr } from "ramda";
import { HttpRequestHeader } from "src/Shared/Enums/HttpRequestHeader";
import { ConfigProvider } from "src/Configs/Environments/Environments";
import type { ServiceUrls } from "src/Configs/Environments/Models";

interface header {
    [key: string]: string | boolean | undefined;
}

interface IAxiosRequestType {
    [key: string]: string | header | CancelToken | undefined;
}

const createRequest = () => {
    let cancel: CancelTokenSource;
    return async (
        parameter: HttpParameter,
        isCancellable = false,
        shouldCancelExistingRequests = false
    ): Promise<HttpResult> => {
        const xFeatureAccess = getXFeatureAccess();
        const Config = ConfigProvider();
        const headers: header = {};
        headers[HttpRequestHeader.Authorization] = `Bearer ${getToken()}`;
        headers[HttpRequestHeader.ApplicatioName] = "BakeIt360.Web"; // Match the working curl request
        headers[HttpRequestHeader.xFeatureAccess] = xFeatureAccess;
        headers[HttpRequestHeader.CacheControl] = "no-store, no-cache, must-revalidate";
        headers[HttpRequestHeader.Pragma] = "no-cache";
        headers[HttpRequestHeader.Expires] = "0";

        if (parameter.headers) {
            parameter.headers.forEach((h) => {
                headers[h.key] = h.value;
            });
        }
        const route = Config.httpService.serviceUrls[parameter.subRoute as keyof ServiceUrls];
        const url = `${route}${parameter.endPoint}`;

        if (shouldCancelExistingRequests && cancel) {
            cancel.cancel();
        }
        if (isCancellable) {
            cancel = axios.CancelToken.source();
        }
        let axiosRequestPayload: IAxiosRequestType = {
            url: url,
            method: parameter.method,
            headers: { ...headers },
            data: parameter.body,
            cancelToken: isCancellable ? cancel.token : undefined,
        };
        if (parameter.extraRequestParams) {
            parameter.extraRequestParams.forEach(
                (item: HttpHeaderParameter) => (axiosRequestPayload[item.key] = item.value)
            );
        }

        const axiosIns = axios({
            ...axiosRequestPayload,
        });

        try {
            const response = await axiosIns;
            if (response.status === 200 || response.status === 201) {
                return {
                    success: true,
                    response: response.data,
                    headers: response.headers,
                    statusCode: response.status,
                } as HttpResult;
            }
            return {
                success: true,
                response: response.data,
                headers: response.headers,
                statusCode: response.status,
            } as HttpResult;
        } catch (error: any) {
            if (axios.isCancel(error)) {
                return { success: false, isCancelled: true } as HttpResult;
            }
            if (error.response?.status === 401) {
                // logout(getRestaurantRefIdEnhanced());
                window.location.reload();
            }
            return {
                success: false,
                errorResponse: error?.response?.data,
                headers: error?.headers,
                errorMessage: error?.response?.data
                    ? pathOr("", [0, "message"], error?.response?.data)
                    : error?.message,
                errorCode: error.response?.status,
                statusCode: error.response?.status,
            } as HttpResult;
        }
    };
};

export const request = createRequest();
