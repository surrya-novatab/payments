import React, { Suspense } from "react";
import { Route, Switch } from "react-router-dom";
import Loading from "../Shared/Components/Loading";

// Lazy load components for better performance
import { lazyWithRetry } from "src/Shared/Utils/lazyWithRetry";

const PaymentPage = lazyWithRetry(() => import("./CardManual/PaymentPage"));
const PaymentElementsPage = lazyWithRetry(
  () => import("./PaymentElements/PaymentElementsPage")
);
const SaveCardPage = lazyWithRetry(() => import("./SaveCard/SaveCardPage"));
const SaveAndPay = lazyWithRetry(() => import("./SaveAndPay/SaveAndPay"));

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

const MyPaymentsRouter: React.FC<MyPaymentsRouterProps> = ({
  basePath = "/",
}) => {
  return (
    <div className="stripe-router">
      <Suspense fallback={<Loading />}>
        <Switch>
          {routes.map(({ path, component: Component }) => (
            <Route
              key={path}
              exact
              path={`/${path}`}
              component={Component}
            />
          ))}
        </Switch>
      </Suspense>
    </div>
  );
};

export default MyPaymentsRouter;
