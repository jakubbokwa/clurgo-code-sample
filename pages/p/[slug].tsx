// @ts-nocheck
import React from "react";
import {
  ComponentRenderData,
  extractPlasmicQueryData,
  PlasmicComponent,
  PlasmicRootProvider,
} from "@plasmicapp/loader-nextjs";
import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Head from "next/head";
import flagsmith from "flagsmith";
import fState from "../../../flagsmith";
import { FlagsmithProvider } from "flagsmith/react";
import { gql } from "graphql-request";
import client from "../../../graphql-client";
import { PLASMIC } from "../../../plasmic-init";
import { ParsedUrlQuery } from "querystring";

import { ProductPageContext } from "../../../contexts/ProductPageContext";
import { StackProvider } from "../../../contexts/StackProvider";
import { CategoriesProvider } from "../../../contexts/CategoriesProvider";

import { BreadcrumbList } from "../../../types/BreadcrumbList";
import { WebPage } from "../../../types/WebPage";
import { getSettings } from "../../../utils/getSettings";

interface PageParams extends ParsedUrlQuery {
  slug: string;
}

interface PageProps {
  plasmicData: ComponentRenderData;
  queryCache: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  metaData: metaData;
  slug: string;
  currentPage: WebPage;
}

type metaData = {
  title: string;
  metaTitle: string;
  metaDescription: string;
};

export const getStaticPaths: GetStaticPaths<PageParams> = async () => {
  const flagState = await fState();

  const isMarketEnabled = flagState.flags?.["market"].enabled || false;
  const settings = getSettings();
  const marketName = settings.organization.marketName;

  const query = isMarketEnabled
    ? gql`
        query GetProductSlugs($marketName: String!) {
          products(
            first: 100
            where: { collections: { markets_some: { name: $marketName } } }
          ) {
            slug
          }
        }
      `
    : gql`
        query GetProductSlugs {
          products(first: 100) {
            slug
          }
        }
      `;

  let data: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  try {
    data = await client.request(query, { marketName });
  } catch (error) {
    console.error("getStaticPathError: " + error);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const paths = data.products.map((product: any) => {
    return {
      params: { slug: product.slug },
    };
  });

  return {
    paths,
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const flagState = await fState();
  const settings = getSettings();

  const isMarketEnabled = flagState.flags?.["market"].enabled || false;

  const marketName = settings.organization.marketName;

  const slug = context.params?.slug;

  const query = isMarketEnabled
    ? gql`
        query GetProductDataBySlug($slug: String, $marketName: String!) {
          products(
            where: {
              slug: $slug
              collections: {
                documentInStages_some: { stage: PUBLISHED }
                markets_some: { name: $marketName }
              }
            }
          ) {
            name
            description {
              text
            }
            categories(
              first: 1
              where: {
                navigationItems_some: {
                  documentInStages_some: { stage: PUBLISHED }
                }
              }
            ) {
              name
              navigationItems {
                name
                slug
              }
            }
          }
        }
      `
    : gql`
        query GetProductDataBySlug($slug: String) {
          products(
            where: {
              slug: $slug
              collections: { documentInStages_some: { stage: PUBLISHED } }
            }
          ) {
            name
            description {
              text
            }
            categories(
              first: 1
              where: {
                navigationItems_some: {
                  documentInStages_some: { stage: PUBLISHED }
                }
              }
            ) {
              name
              navigationItems {
                name
                slug
              }
            }
          }
        }
      `;

  const variables = {
    slug,
    marketName,
  };

  let product;
  try {
    const data: any = await client.request(query, variables); // eslint-disable-line @typescript-eslint/no-explicit-any
    if (data.products.length > 0) {
      product = data.products[0];
    }
  } catch (error) {
    console.log(JSON.stringify(error, null, 2));
  }

  if (!product) {
    return { notFound: true };
  } else {
    const plasmicData = await PLASMIC.fetchComponentData("/p/" + slug);
    if (!plasmicData) {
      // non-Plasmic catch-all
      console.log("NO PLASMICDATA");
      return { props: {} };
    }

    const pageMeta = plasmicData.entryCompMetas[0];

    const pageParams = { slug: slug ?? "" };

    let mainNavigationItem = { name: "", slug: "" };
    if (product && product.categories?.length > 0) {
      mainNavigationItem = product.categories?.[0].navigationItems?.[0];
    }
    const breadcrumbList: BreadcrumbList = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [],
    };
    breadcrumbList.itemListElement.push({
      "@type": "ListItem",
      position: 1,
      name: "Startseite",
      item: `${settings.organization.baseUrl}`,
    });
    if (mainNavigationItem.name !== "") {
      breadcrumbList.itemListElement.push({
        "@type": "ListItem",
        position: 2,
        name: mainNavigationItem.name,
        item: `${settings.organization.baseUrl}/c/${mainNavigationItem.slug}`,
      });
    }
    breadcrumbList.itemListElement.push({
      "@type": "ListItem",
      position: mainNavigationItem.name !== "" ? 3 : 2,
      name: product?.name || "",
    });
    const currentPage: WebPage = {
      breadcrumb: breadcrumbList,
    };

    const queryCache = await extractPlasmicQueryData(
      <PlasmicRootProvider
        loader={PLASMIC}
        prefetchedData={plasmicData}
        pageParams={pageParams}
        skipFonts={true}
      >
        <StackProvider client={client} currentPage={currentPage}>
          <FlagsmithProvider flagsmith={flagsmith} serverState={flagState}>
            <CategoriesProvider>
              {/*<NavigationProvider>
              <Auth locale="de">*/}

              <ProductPageContext.Provider value={pageParams}>
                <PlasmicComponent
                  component={pageMeta.displayName}
                  componentProps={pageParams}
                />
              </ProductPageContext.Provider>

              {/*</Auth>
            </NavigationProvider>*/}
            </CategoriesProvider>
          </FlagsmithProvider>
        </StackProvider>
      </PlasmicRootProvider>
    );

    let trimmedDescription;
    if (product?.description) {
      trimmedDescription = product.description.text.substring(0, 150);
    } else {
      trimmedDescription = "";
    }

    const metaData = {
      title: product?.name || "",
      metaTitle: product?.name || "",
      metaDescription: trimmedDescription,
    };
    return {
      props: { plasmicData, queryCache, metaData, slug, currentPage },
      revalidate: 60,
    };
  }
};

const ProductPage: NextPage<PageProps> = ({
  plasmicData,
  queryCache,
  metaData,
  slug,
  currentPage,
}) => {
  const title = metaData?.title ?? null;
  const metaTitle = metaData?.metaTitle ?? null;
  const metaDescription = metaData?.metaDescription ?? null;

  const pageMeta = plasmicData.entryCompMetas[0];

  const pageParams = { slug: slug };

  return (
    <PlasmicRootProvider
      loader={PLASMIC}
      prefetchedData={plasmicData}
      prefetchedQueryData={queryCache}
      pageParams={pageMeta.params}
      pageQuery={pageParams}
      skipFonts={true}
    >
      <StackProvider client={client} currentPage={currentPage}>
        <CategoriesProvider>
          {/*<NavigationProvider>*/}
          <ProductPageContext.Provider value={pageParams}>
            <PlasmicComponent component={pageMeta.displayName} />
          </ProductPageContext.Provider>
          {/*</NavigationProvider>*/}
        </CategoriesProvider>
      </StackProvider>

      <Head>
        {title ? <title>{title}</title> : null}
        {metaTitle ? (
          <meta key="og:title" property="og:title" content={metaTitle} />
        ) : null}
        {metaTitle ? <meta name="title" content={metaTitle} /> : null}
        {metaDescription ? (
          <meta name="description" content={metaDescription} />
        ) : null}
        {metaDescription ? (
          <meta name="og:description" content={metaDescription} />
        ) : null}
        <meta
          httpEquiv="content-type"
          content="text/html; charset=iso-8859-1"
        />
      </Head>
    </PlasmicRootProvider>
  );
};

export default ProductPage;
