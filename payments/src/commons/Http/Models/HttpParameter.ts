import { HttpMethod } from "../Enums/HttpMethod";
import { HttpParameterSubRoute } from "../Enums/HttpParameterSubRoute";

export interface HttpHeaderParameter {
    key: string;
    value: string;
}

export interface HttpParameter {
    endPoint: string;
    api?: string;
    method: HttpMethod;
    body?: any;
    subRoute: HttpParameterSubRoute;
    headers?: Array<HttpHeaderParameter>;
    redirect?: string;
    extraRequestParams?: Array<HttpHeaderParameter>;
}
