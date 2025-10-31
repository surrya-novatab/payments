import React, { Suspense } from "react";
import { Switch, Route, BrowserRouter } from "react-router-dom";
import Loading from "./Shared/Components/Loading";
import PayrixRouter from "./Payrix/Payrix";
import MyPaymentsRouter from "./MyPayments/MyPaymentsRouter";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Switch>
          <Route path="/payrix" component={PayrixRouter} />
          <Route path="/" component={MyPaymentsRouter} />
        </Switch>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
