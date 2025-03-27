import { model, Schema } from "mongoose";
import { ISubscription } from "./subscription.interface";

const SubscriptionSchema: Schema = new Schema<ISubscription>({
  productId: { type: String, required: true },
  purchaseId: { type: String, required: true },
  expiryDate: { type: Date, required: true },
  purchaseDate: { type: Date, required: true, default: Date.now },
  packageName: { type: String, required: true },
  purchaseToken: { type: String, required: true },
  packagePrice: { type: Number, required: true },
  userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
});

const Subscription = model<ISubscription>("Subscription", SubscriptionSchema);

export default Subscription;
