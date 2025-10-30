import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Loading from "../Shared/Components/Loading";
import { lazyWithRetry } from "../Shared/Utils/lazyWithRetry";

// Lazy load components for better performance
const PaymentPage = lazyWithRetry(() => import("./CardManual/PaymentPage").then(module => ({ default: module.default })));
const PaymentElementsPage = lazyWithRetry(() => import("./PaymentElements/PaymentElementsPage").then(module => ({ default: module.default })));
const SaveCardPage = lazyWithRetry(() => import("./SaveCard/SaveCardPage").then(module => ({ default: module.default })));
const SaveAndPay = lazyWithRetry(() => import("./SaveAndPay/SaveAndPay").then(module => ({ default: module.default })));

interface MyPaymentsRouterProps {
    basePath?: string;
}

const routes = [
    {
        path: "card-manual-payment/:paymentPageId",
        component: PaymentPage,
    },
    {
        path: "payment-elements/:paymentPageId",
        component: PaymentElementsPage,
    },
    {
        path: "save-card/:merchantId/:customerId",
        component: SaveCardPage,
    },
    {
        path: "save-and-pay/:merchantId/:customerId/:paymentPageId",
        component: SaveAndPay,
    },
];

const MyPaymentsRouter: React.FC<MyPaymentsRouterProps> = ({ basePath = "/stripe" }) => {
    return (
        <div className="stripe-router">
            <Suspense fallback={<Loading />}>
                <Routes>
                    {routes.map(({ path, component: Component }) => (
                        <Route
                            key={path}
                            exact
                            path={`${basePath}/${path}`}
                            element={<Component />}
                        />
                    ))}
                </Routes>
            </Suspense>
        </div>
    );
};

export default MyPaymentsRouter;