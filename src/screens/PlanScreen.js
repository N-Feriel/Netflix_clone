import { loadStripe } from "@stripe/stripe-js";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addPlan, selectUser } from "../features/userSlice";
import db from "../firebase";
import "./PlanScreen.css";

function PlanScreen() {
  const [products, setProducts] = useState([]);
  const [suscription, setSubcription] = useState(null);
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  useEffect(() => {
    db.collection("customers")
      .doc(user.uid)
      .collection("subscriptions")
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach(async (suscription) => {
          setSubcription({
            role: suscription.data().role,
            current_period_end: suscription.data().current_period_end.seconds,
            current_period_start:
              suscription.data().current_period_start.seconds,
          });
          dispatch(addPlan(suscription.data().role));
        });
      });
  }, [user.uid]);

  const loadCheckout = async (priceId) => {
    const docRef = await db
      .collection("customers")
      .doc(user.uid)
      .collection("checkout_sessions")
      .add({
        price: priceId,
        success_url: window.location.origin,
        cancel_url: window.location.origin,
      });

    docRef.onSnapshot(async (snap) => {
      const { error, sessionId } = snap.data();
      if (error) {
        //show an error to your custumor and
        //inspect your Cloud Function logs in firebase console
        alert(`An error occured: ${error.message}`);
      }

      if (sessionId) {
        //We have a session, let;s redirect to checkout
        //Init stripe
        const stripe = await loadStripe(
          "pk_test_51IKV6pB7B1Sagu8UVd95uCwb2LVBRNGciGg9jZFgc2QAhWTGTuIP4LhpVw0JYQRrjdNMNkdnDLSbe7vRKlFtOyJD00fKuf6dvm"
        );
        stripe.redirectToCheckout({ sessionId });
      }
    });
  };

  useEffect(() => {
    db.collection("products")
      .where("active", "==", true)
      .get()
      .then((querySnapshot) => {
        const products = {};
        querySnapshot.forEach(async (productDoc) => {
          products[productDoc.id] = productDoc.data();
          const priceSnap = await productDoc.ref.collection("prices").get();
          priceSnap.docs.forEach((price) => {
            products[productDoc.id].prices = {
              priceId: price.id,
              proceData: price.data(),
            };
          });
        });
        setProducts(products);
      });
  }, []);

  return (
    <div className="plansScreen">
      <br />
      {suscription && (
        <p>
          Renewal date:{" "}
          {new Date(
            suscription?.current_period_end * 1000
          ).toLocaleDateString()}{" "}
        </p>
      )}
      {Object.entries(products).map(([productId, productData]) => {
        const isCurrentPackage = productData.name
          ?.toLowerCase()
          .includes(suscription?.role);
        return (
          <div
            className={`${
              isCurrentPackage && "plansScreen_plan--disabled"
            } plansScreen_plan`}
            key={productId}
          >
            <div className="plansScreen_info">
              <h5>{productData.name}</h5>
              <h6>{productData.description}</h6>
            </div>
            <button
              onClick={() =>
                !isCurrentPackage && loadCheckout(productData.prices.priceId)
              }
            >
              {isCurrentPackage ? "Current Package" : "Suscribe"}
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default PlanScreen;
