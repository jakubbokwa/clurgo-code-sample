// @ts-nocheck
import * as React from "react";
import * as ReactDOMServer from "react-dom/server";
import { Configure, getServerState, InstantSearch } from "react-instantsearch";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import type { AppProps } from "next/app";
import localFont from "next/font/local";
import flagsmith, { createFlagsmithInstance } from "flagsmith/isomorphic";
import { FlagsmithProvider } from "flagsmith/react";
import { CookieConsentProvider } from "@use-cookie-consent/react";
import client from "../graphql-client";

import { SettingsProvider } from "../providers/SettingsProvider";
import { NavigationProvider } from "../providers/NavigationProvider";
import { SearchProvider } from "../providers/searchProvider";
import { StackProvider } from "../providers/StackProvider";
import { MobileMenuProvider } from "../providers/MobileMenuProvider";
import { CategoriesProvider } from "../providers/categoriesProvider";

import { GoogleTagManagerScript } from "../components/Marketing";
import { Auth } from "../components/Auth/Auth";
import { FuseSearchProvider } from "../components/FuseSearch/FuseSearchProvider";
import { typesenseInstantSearchAdapter } from "../components/Search/typesenseInstantsearchAdapter";
import {
  InstantSearchProvider,
  SearchState,
} from "../components/Search/InstantSearchProvider";
import { IState } from "flagsmith/types";

import { getSettings } from "../utils/getSettings";

import "../styles/globals.css";
import "../styles/glider.min.css";
import "../styles/react-tabs.css";

const settings = getSettings();

const sangbleu = localFont({
  src: [
    {
      path: "../styles/SangBleuSunrise-Regular-WebXL.woff2",
      style: "normal",
      weight: "400",
    },
    {
      path: "../styles/SangBleuSunrise-Livre-WebXL.woff2",
      style: "normal",
      weight: "500",
    },
  ],
  display: "swap",
  variable: "--shop-sangbleu",
});

const calibre = localFont({
  src: [
    {
      path: "../styles/calibre-regular.woff2",
      style: "normal",
      weight: "400",
    },
    {
      path: "../styles/calibre-medium.woff2",
      style: "normal",
      weight: "500",
    },
  ],
  display: "swap",
  variable: "--shop-calibre",
});

function MyApp({
  Component,
  pageProps,
  flagsmithState,
  serverState,
  initialSearchState,
}: AppProps & {
  flagsmithState: IState<string, string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  serverState: any;
  initialSearchState: SearchState;
}) {
  React.useEffect(() => {
    document.body.classList.add(sangbleu.variable, calibre.variable);
  }, []);
  const market = flagsmithState?.flags?.market;
  const settings = getSettings();
  const indexName = market?.enabled ? "products_shop_de" : "products";
  const [searchClient] = React.useState(
    () => typesenseInstantSearchAdapter.searchClient
  );

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
    >
      <FlagsmithProvider flagsmith={flagsmith} serverState={flagsmithState}>
        <InstantSearchProvider
          serverState={serverState}
          searchClient={searchClient}
          indexName={indexName}
          initialSearchState={initialSearchState}
        >
          <SettingsProvider {...settings}>
            <CookieConsentProvider>
              <GoogleTagManagerScript
                gtmId={settings.other.googleAnalyticsID}
                debug={settings.other.googleAnalyticsDebugMode}
              />
              <Auth locale="de">
                <StackProvider client={client}>
                  <SearchProvider>
                    <FuseSearchProvider>
                      <MobileMenuProvider>
                        <CategoriesProvider>
                          <NavigationProvider>
                            <Component {...pageProps} />
                          </NavigationProvider>
                        </CategoriesProvider>
                      </MobileMenuProvider>
                    </FuseSearchProvider>
                  </SearchProvider>
                </StackProvider>
              </Auth>
            </CookieConsentProvider>
          </SettingsProvider>
        </InstantSearchProvider>
      </FlagsmithProvider>
    </GoogleReCaptchaProvider>
  );
}

MyApp.getInitialProps = async () => {
  const flagsmithSSR = createFlagsmithInstance();
  await flagsmithSSR
    .init({
      environmentID: settings.other.flagsmithID,
      enableAnalytics: settings.other.flagsmithEnableAnalytics,
    })
    .catch(console.error);

  const market = flagsmithSSR.getState()?.flags?.market;
  const indexName = market?.enabled ? "products_shop_de" : "products";

  const initialSearchState = { query: "", page: 1 };

  const serverState = await getServerState(
    <InstantSearch
      indexName={indexName}
      searchClient={typesenseInstantSearchAdapter.searchClient}
      initialUiState={{
        [indexName]: initialSearchState.query ? initialSearchState : {},
      }}
    >
      <Configure />
    </InstantSearch>,
    { renderToString: ReactDOMServer.renderToString }
  );

  return {
    flagsmithState: flagsmithSSR.getState(),
    serverState,
    initialSearchState,
  };
};

export default MyApp;
