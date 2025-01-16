// @ts-nocheck
import React from "react";
import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import {
  PlasmicRootProvider,
  PlasmicComponent,
  ComponentRenderData,
  extractPlasmicQueryData,
} from "@plasmicapp/loader-nextjs";
import flagsmith from "flagsmith";
import fState from "../../flagsmith";
import { FlagsmithProvider } from "flagsmith/react";
import { PLASMIC } from "../../plasmic-init";
import client from "../../graphql-client";
import { ParsedUrlQuery } from "querystring";

import { fetchStores } from "../../hooks/useFetchStores";
import { fetchStoreBySlug } from "../../hooks/useFetchStoreBySlug";

import { StackProvider } from "../../contexts";
import { SearchProvider } from "../../contexts/SearchContext";
import { CategoriesProvider } from "../../contexts/CategoriesProvider";

import { Store } from "../../types/Hygraph/Store";

interface PageParams extends ParsedUrlQuery {
  slug: string;
}

interface PageProps {
  plasmicData: ComponentRenderData;
  queryCache: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  metaData: metaData;
  slug: string;
}

type metaData = {
  title: string;
  metaTitle: string;
  metaDescription: string;
};

export const getStaticPaths: GetStaticPaths<PageParams> = async () => {
  const flagState = await fState();

  if (!flagState.flags?.["market"].enabled) {
    return { paths: [], fallback: "blocking" };
  }

  const stores = await fetchStores(client);
  const storeSlugs = stores.map((store) => store.slug);
  const paths = storeSlugs.map((slug) => ({
    params: { slug },
  }));

  return {
    paths,
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const flagState = await fState();

  if (!flagState.flags?.["market"].enabled) {
    return { notFound: true };
  }

  const slug = context.params?.slug;

  if (!slug || typeof slug !== "string") {
    return { notFound: true };
  }

  let store: Store | null = null;
  try {
    store = await fetchStoreBySlug(slug, client);

    if (!store) {
      return { notFound: true };
    }
  } catch (error) {
    return { notFound: true };
  }

  const plasmicData = await PLASMIC.fetchComponentData(`/stores/${slug}`);
  if (!plasmicData) {
    return { props: {} };
  }

  const pageMeta = plasmicData.entryCompMetas[0];

  const queryCache = await extractPlasmicQueryData(
    <PlasmicRootProvider
      loader={PLASMIC}
      prefetchedData={plasmicData}
      pageParams={{ slug }}
      skipFonts={true}
    >
      <FlagsmithProvider flagsmith={flagsmith} serverState={flagState}>
        <StackProvider client={client}>
          <SearchProvider>
            <CategoriesProvider>
              <PlasmicComponent component={pageMeta.displayName} />
            </CategoriesProvider>
          </SearchProvider>
        </StackProvider>
      </FlagsmithProvider>
    </PlasmicRootProvider>
  );

  const metaData = {
    title: store?.metadata?.title ?? null,
    metaTitle: store?.metadata?.title ?? null,
    metaDescription: store?.metadata?.description ?? null,
  };

  return {
    props: {
      plasmicData,
      queryCache,
      metaData,
      slug,
    },

    revalidate: 60,
  };
};

export default function StorePage({
  plasmicData,
  queryCache,
  metaData,
  slug,
}: PageProps) {
  const { title, metaTitle, metaDescription } = metaData;
  const pageMeta = plasmicData.entryCompMetas[0];

  return (
    <PlasmicRootProvider
      loader={PLASMIC}
      prefetchedData={plasmicData}
      prefetchedQueryData={queryCache}
      pageParams={pageMeta.params}
      pageQuery={{ slug }}
      skipFonts={true}
    >
      <PlasmicComponent component={pageMeta.displayName} />
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
}
