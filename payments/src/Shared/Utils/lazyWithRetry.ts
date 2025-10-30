import { lazy } from 'react';

export const lazyWithRetry = (componentImport: () => Promise<any>) =>
    lazy(() => {
        const pageHasAlreadyBeenForceRefreshed = JSON.parse(
            window.localStorage.getItem("page-has-been-force-refreshed") || "false"
        );

        return new Promise((resolve, reject) => {
            componentImport()
                .then((component) => {
                    window.localStorage.setItem("page-has-been-force-refreshed", "false");
                    resolve(component);
                })
                .catch((error) => {
                    if (!pageHasAlreadyBeenForceRefreshed) {
                        window.localStorage.setItem("page-has-been-force-refreshed", "true");
                        window.location.reload();
                        return;
                    }
                    reject(error);
                });
        });
    });