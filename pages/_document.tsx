// @ts-nocheck
import React from "react";
import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
  DocumentInitialProps,
} from "next/document";

import fState from "../flagsmith";
import { IState } from "flagsmith/types";

import { getSettings } from "../utils/getSettings";
import { Settings } from "../types/Settings";
import { featureFlagsEnum } from "../helpers/featureFlags";

interface PromisedDocumentInitialProps extends DocumentInitialProps {
  flagState: IState<string, string>;
  settings: Settings;
}

// This method or data fetching in general in _document is not recommended by Next.js,
// but it's the best way to get the flagsmith state into the document.
// https://nextjs.org/docs/pages/building-your-application/routing/custom-document
class XYZDocument extends Document<PromisedDocumentInitialProps> {
  static async getInitialProps(
    ctx: DocumentContext
  ): Promise<PromisedDocumentInitialProps> {
    const originalRenderPage = ctx.renderPage;

    const flagState = await fState();
    const settings = getSettings();

    ctx.renderPage = () =>
      originalRenderPage({
        enhanceApp: (App) => App,
        enhanceComponent: (Component) => Component,
      });

    const initialProps = await Document.getInitialProps(ctx);

    return {
      ...initialProps,
      flagState,
      settings,
    };
  }

  render() {
    const { flagState, settings } = this.props;

    return (
      <Html>
        <Head>
          {process.env.GTM_ID && (
            <>
              {settings.other?.cookiebotID && (
                <script
                  data-cookieconsent="ignore"
                  dangerouslySetInnerHTML={{
                    __html: `
                    window.dataLayer = window.dataLayer || [];
                    function gtag() {
                      dataLayer.push(arguments);
                    }
                    gtag("consent", "default", {
                      ad_storage: "denied",
                      analytics_storage: "denied",
                      functionality_storage: "denied",
                      personalization_storage: "denied",
                      security_storage: "granted",
                      wait_for_update: 500,
                    });
                    gtag("set", "ads_data_redaction", true);
                    gtag("set", "url_passthrough", true);
                  `,
                  }}
                />
              )}
              {flagState.flags?.[featureFlagsEnum.ticket_62]?.enabled &&
              settings.other?.googleAnalyticsID &&
              process.env.NEXT_PUBLIC_IS_PREVIEW_ENV === "true" ? (
                <noscript>
                  <iframe
                    src={`https://www.googletagmanager.com/ns.html?id=${
                      settings.other.googleAnalyticsID
                    }&gtm_auth=E46bHaIJfLesbMooQEInqA&gtm_preview=env-4&gtm_cookies_win=x${
                      settings.other.googleAnalyticsDebugMode
                        ? "&gtm_debug=x"
                        : ""
                    }`}
                    height="0"
                    width="0"
                    style={{ display: "none", visibility: "hidden" }}
                    id="gtm-dataLayer-init"
                    data-cookieconsent="auto"
                  ></iframe>
                </noscript>
              ) : (
                <script
                  id="google-tag-manager"
                  data-cookieconsent="ignore"
                  dangerouslySetInnerHTML={{
                    __html: `
                    (function(w, d, s, l, i) {
                      w[l] = w[l] || [];
                      w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
                      var f = d.getElementsByTagName(s)[0],
                        j = d.createElement(s),
                        dl = l != 'dataLayer' ? '&l=' + l : '';
                      j.async = true;
                      j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
                      f.parentNode.insertBefore(j, f);
                    })(window, document, 'script', 'dataLayer', '${process.env.GTM_ID}');
                  `,
                  }}
                />
              )}
            </>
          )}
          {settings.other?.cookiebotID && (
            <script
              id="Cookiebot"
              src="https://consent.cookiebot.com/uc.js"
              data-cbid={settings.other?.cookiebotID}
              type="text/javascript"
              async
            />
          )}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default XYZDocument;
