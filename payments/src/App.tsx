import React, { Suspense } from "react";
import { Switch, Route, BrowserRouter } from "react-router-dom";
import { lazyWithRetry } from "./Shared/Utils/lazyWithRetry";
import Loading from "./Shared/Components/Loading";
import PayrixRouter from "./Payrix/Payrix";
import MyPaymentsRouter from "./MyPayments/MyPaymentsRouter";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Switch>
          <Route path="/" component={MyPaymentsRouter} />
          <Route path="/payrix" component={PayrixRouter} />
        </Switch>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
