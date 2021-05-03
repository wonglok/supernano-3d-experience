import { getAllCollections } from "nextjs-commerce-shopify";
import { useEffect } from "react";
import { Shopify } from "./_app";

import { getProduct } from "nextjs-commerce-shopify";

export default function CollectionPage() {
  useEffect(async () => {
    let collections = await getAllCollections({
      domain: Shopify.domain,
      token: Shopify.token,
    });

    collections = collections.filter((e) => e.handle === "supernano");

    console.log(collections);

    const product = await getProduct({
      domain: Shopify.domain,
      token: Shopify.token,
      handle: "supernano-unicorn-test",
    });
    console.log(product);
  });

  return <div></div>;
}

// "Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0LzY3MTA3NjE2ODUxNDQ="
// handle: "supernano-unicorn-test"
