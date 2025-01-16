// @ts-nocheck
import * as React from "react";
import {
  PlasmicComponent,
  extractPlasmicQueryData,
  ComponentRenderData,
  PlasmicRootProvider,
} from "@plasmicapp/loader-nextjs";
import { GetStaticProps } from "next";
import { PLASMIC } from "../plasmic-init";

export const getStaticProps: GetStaticProps = async () => {
  const plasmicData = await PLASMIC.fetchComponentData("/error");
  const queryCache = await extractPlasmicQueryData(
    <PlasmicRootProvider
      loader={PLASMIC}
      prefetchedData={plasmicData}
      skipFonts={true}
    >
      <PlasmicComponent component="/error" />
    </PlasmicRootProvider>
  );
  return {
    props: {
      plasmicData,
      queryCache,
    },
    revalidate: 60,
  };
};

export default function PlasmicLoaderPage(props: {
  plasmicData?: ComponentRenderData;
  queryCache?: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
}) {
  const { plasmicData, queryCache } = props;

  return (
    <PlasmicRootProvider
      loader={PLASMIC}
      prefetchedData={plasmicData}
      prefetchedQueryData={queryCache}
      skipFonts={true}
    >
      <PlasmicComponent component="/error" />
    </PlasmicRootProvider>
  );
}
