import React, { Suspense } from 'react';
import { Switch, Route, BrowserRouter } from 'react-router-dom';
import { lazyWithRetry } from './Shared/Utils/lazyWithRetry';
import Loading from './Shared/Components/Loading';

// Lazy load the routers
const PayrixRouter = lazyWithRetry(() => import('./Payrix/Payrix').then(module => ({ default: module.default })));
const MyPaymentsRouter = lazyWithRetry(() => import('./MyPayments/MyPaymentsRouter').then(module => ({ default: module.default })));

const App: React.FC = () => {
  return (
    <BrowserRouter>
  
      <Suspense fallback={<Loading />}>
        <Switch>
          {/* Payment Routes */}
          <Route path="/stripe/*" component={<MyPaymentsRouter />} />
          <Route path="/payrix/*" component={<PayrixRouter />} />
          <Route path="/" component={<PayrixRouter />} />
        </Switch>
      </Suspense>

    </BrowserRouter>
  );
};

export default App;