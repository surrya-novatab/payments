export interface ConfigModel {
    httpService: HttpService;
    baseUrl: string;
}
export interface HttpService {
    serviceUrls: ServiceUrls;
    applicationName: string;
}
export interface ServiceUrls {
    communication: string;
    location: string;
    notification: string;
    restaurantAccount: string;
    restaurantMenu: string;
    restaurant: string;
    restaurantOrder: string;
    restaurantSetting: string;
    userAccount: string;
    payments: string;
    subscriptions: string;
    cardconnect: string;
    reports: string;
    config: string;
    transactions: string;
    business: string;
    assets: string;
    restaurantOrderVersionTwo: string;
    kioskSettings: string;
    services: string;
    kdsSetup?: string;
    kdsMicroService: string;
    oldReports: string;
    kdsSetupActiveDisplay?: string;
    "reports-microservice": string;
    timesheetreports?: string;
    aiCampaigns: string;
    customers: string;
    discounts:string;
    guestForm:string;
    reportBuilder:string;
    authService: string;
    
}

