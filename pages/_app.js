import "../styles/globals.css";
import "tailwindcss/tailwind.css";

import { CommerceProvider } from "nextjs-commerce-shopify";

export const Shopify = {
  domain: "ingoshk.myshopify.com",
  token: "6a93f1aa45758dc02e521a9d1eef9abc",
  currencyCode: "HKD",
};

const App = ({ children }) => {
  return <CommerceProvider config={Shopify}>{children}</CommerceProvider>;
};

function MyApp({ Component, pageProps }) {
  return (
    <App>
      <Component {...pageProps} />
    </App>
  );
}

export default MyApp;
