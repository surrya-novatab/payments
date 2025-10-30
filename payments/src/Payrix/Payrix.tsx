import React from "react";
import { Switch, Route } from "react-router-dom";
import PayrixSaveCard from "./components/PayrixSaveCard/PayrixSaveCard";
import PayrixCardManual from "./components/PayrixCardManual/PayrixCardManual";
import PayrixMobilePayment from "./components/PayrixMobilePayment/PayrixMobilePayment";
import PayrixSaveAndPay from "./components/PayrixSaveAndPay/PayrixSaveAndPay";

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
