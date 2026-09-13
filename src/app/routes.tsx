import { Route, Routes } from "react-router-dom";
import { StorefrontLayout } from "@/layouts/StorefrontLayout";
import { Account } from "@/pages/account/Account";
import { Forgot } from "@/pages/account/Forgot";
import { Login } from "@/pages/account/Login";
import { Reset } from "@/pages/account/Reset";
import { Privacy, Returns, Shipping } from "@/pages/legal/Legal";
import { About } from "@/pages/storefront/About";
import { Checkout } from "@/pages/storefront/Checkout";
import { Collections } from "@/pages/storefront/Collections";
import { Contact } from "@/pages/storefront/Contact";
import { Home } from "@/pages/storefront/Home";
import { Kids } from "@/pages/storefront/Kids";
import { NewArrivals } from "@/pages/storefront/NewArrivals";
import { NotFound } from "@/pages/storefront/NotFound";
import { Product } from "@/pages/storefront/Product";
import { Shawls } from "@/pages/storefront/Shawls";
import { Track } from "@/pages/storefront/Track";
import { TryOn } from "@/pages/storefront/TryOn";
import { Wishlist } from "@/pages/storefront/Wishlist";
import { Women } from "@/pages/storefront/Women";
import { Admin } from "@/pages/studio/Studio";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<StorefrontLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/women" element={<Women />} />
        <Route path="/kids" element={<Kids />} />
        <Route path="/shawls" element={<Shawls />} />
        <Route path="/new-arrivals" element={<NewArrivals />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/products/:slug" element={<Product />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/account" element={<Account />} />
        <Route path="/account/login" element={<Login />} />
        <Route path="/account/forgot" element={<Forgot />} />
        <Route path="/account/reset" element={<Reset />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/shipping" element={<Shipping />} />
        <Route path="/returns" element={<Returns />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/track" element={<Track />} />
        <Route path="/try-on" element={<TryOn />} />
        <Route path="/try-on/:slug" element={<TryOn />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
