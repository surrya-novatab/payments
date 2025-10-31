import React from "react";
import { Switch, Route } from "react-router-dom";
import { lazyWithRetry } from "src/Shared/Utils/lazyWithRetry";

const PayrixMobilePayment = lazyWithRetry(
  () => import("./components/PayrixMobilePayment/PayrixMobilePayment")
);
const PayrixCardManual = lazyWithRetry(
  () => import("./components/PayrixCardManual/PayrixCardManual")
);
const PayrixSaveAndPay = lazyWithRetry(
  () => import("./components/PayrixSaveAndPay/PayrixSaveAndPay")
);
const PayrixSaveCard = lazyWithRetry(
  () => import("./components/PayrixSaveCard/PayrixSaveCard")
);

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

const PayrixRouter: React.FC<PayrixRouterProps> = ({
  basePath = "/payrix",
}) => {
  return (
    <div className="payrix-router">
      <Switch>
        {routes.map(({ path, component: Component }) => (
          <Route
            key={path}
            exact
            path={`${basePath}/${path}`}
            component={Component}
          />
        ))}
      </Switch>
    </div>
  );
};

export default PayrixRouter;
