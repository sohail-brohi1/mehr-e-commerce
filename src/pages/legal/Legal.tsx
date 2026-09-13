import { InfoPage } from "@/components/shared/InfoPage";

export function Shipping() {
  return (
    <InfoPage
      eyebrow="Delivery"
      title="Shipping."
      description="Tracked courier nationwide. Free over PKR 15,000."
    >
      <p>We ship across Pakistan in 3–5 working days via tracked courier.</p>
      <p>Orders over PKR 15,000 ship free. Below that, delivery is PKR 300.</p>
      <p>Cash on delivery is available everywhere we ship. JazzCash, Easypaisa and bank transfer are confirmed within the hour on working days.</p>
      <p>You will receive an email when the order is confirmed, and again when it leaves the atelier.</p>
    </InfoPage>
  );
}

export function Returns() {
  return (
    <InfoPage
      eyebrow="Care"
      title="Exchanges."
      description="Unused pieces can be exchanged within 14 days."
    >
      <p>If a piece doesn’t sit right, we will exchange it within 14 days of delivery, unworn, unwashed, with tags attached.</p>
      <p>Sale pieces and custom lengths are final. Shawls that have been draped and worn cannot be returned for hygiene.</p>
      <p>Write to us with your order number and we will send a courier. You pay the return shipping; we cover the outbound exchange.</p>
      <p>Refunds, when agreed, go back the way you paid, within 7 working days of the piece reaching us.</p>
    </InfoPage>
  );
}

export function Privacy() {
  return (
    <InfoPage
      eyebrow="Trust"
      title="Privacy."
      description="We keep only what we need to sew, ship and write to you."
    >
      <p>Your name, email, phone and address are stored to fulfil orders and, if you ask us to, to tell you when something new lands.</p>
      <p>If you shop without an account, we keep a private device id on this phone so your wishlist and orders stay yours. We also store the network address on an order for fraud checks — we do not use IP as your identity, because mobile IPs change.</p>
      <p>We do not sell your details. Payments by wallet or bank are confirmed by reference number — we never store card numbers.</p>
      <p>You can ask us to delete your account at any time. Order records we are required to keep for tax stay anonymised.</p>
      <p>Questions: hello@mehr.pk</p>
    </InfoPage>
  );
}
