import React, { Suspense } from "react";
import { Switch, Route } from "react-router-dom";
import Loading from "../Shared/Components/Loading";
import { lazyWithRetry } from "../Shared/Utils/lazyWithRetry";
// Lazy load components for better performance
const PayrixSaveCard = lazyWithRetry(() => import("./components/PayrixSaveCard/PayrixSaveCard"));
// const PayrixCardManual = lazyWithRetry(
//     () => import("./components/PayrixCardManual/PayrixCardManual").then(module => ({ default: module.default }))
// )
// ;

import PayrixCardManual from "./components/PayrixCardManual/PayrixCardManual";

const PayrixMobilePayment = lazyWithRetry(
    () => import("./components/PayrixMobilePayment/PayrixMobilePayment").then(module => ({ default: module.default }))
);

const PayrixSaveAndPay = lazyWithRetry(
    () => import("./components/PayrixSaveAndPay/PayrixSaveAndPay").then(module => ({ default: module.default }))
)

interface PayrixRouterProps {
    basePath?: string;
}
const routes = [
    {
        path: "save-card/:merchantId/:customerId",
        component: PayrixSaveCard,
    },
    {
        path: "card-manual/:paymentPageId",
        component: PayrixCardManual,
    },
    {
        path: "mobile-payment/:paymentPageId",
        component: PayrixMobilePayment,
    },
    {
        path: "save-and-pay/:merchantId/:customerId/:paymentPageId",
        component: PayrixSaveAndPay,
    },
];

const PayrixRouter: React.FC<PayrixRouterProps> = ({ basePath = "/payrix" }) => {
     console.log('reached')
    
    return (
        <div className="payrix-router">
            <Suspense fallback={<Loading />}>
                <Switch>
                    {routes.map(({ path, component: Component }) => (
                        <Route
                            key={path}
                            exact
                            path={`${basePath}/${path}`}
                            element={<Component />}
                        />
                    ))}
                </Switch>
            </Suspense>
        </div>
    );
};

export default PayrixRouter;
