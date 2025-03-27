import { z } from "zod";

export const zodSubscriptionSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  purchaseId: z.string().min(1, "Purchase ID is required"),
  expiryData: z.string().min(1, "Expiry date is required"), // You can add regex if there's a specific format
  purchaseDate: z
    .date()
    .or(
      z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date format")
    ),
  packageName: z.string().min(1, "Package name is required"),
  purchaseToken: z.string().min(1, "Purchase token is required"),
  userId: z.string().min(1, "User ID is required"), // Assuming you need userId
});
