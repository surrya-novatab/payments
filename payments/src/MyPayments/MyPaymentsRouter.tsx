import React, { Suspense } from "react";
import { Route, Switch } from "react-router-dom";
import Loading from "../Shared/Components/Loading";

// Lazy load components for better performance
import PaymentPage from "./CardManual/PaymentPage";
import PaymentElementsPage from "./PaymentElements/PaymentElementsPage";
import SaveCardPage from "./SaveCard/SaveCardPage";
import SaveAndPay from "./SaveAndPay/SaveAndPay";

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
  basePath = "/stripe",
}) => {
  return (
    <div className="stripe-router">
      <Suspense fallback={<Loading />}>
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
      </Suspense>
    </div>
  );
};

export default MyPaymentsRouter;
