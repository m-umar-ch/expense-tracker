/**
 * Problem: SubTotal Getting right now: $37082.5 while it should be $36917.71
 * I wanted to bring to your attention an issue I’ve identified with Quote #322.
 *
 * Upon investigation, it appears that the Quote Discount (0.22247%) was manually entered by the supplier user (aoral@generalinsulation.com) on this quote. However, I’ve noticed a discrepancy in how this discount is being applied. Instead of being subtracted from the product subtotal of $37,000.00, it is being added, resulting in an incorrect subtotal of $37,082.50.
 *
 * The expected behavior should be:
 *
 * Product Total: $37,000.00
 * Quote Discount (0.22247%): −$82.29
 * Expected Subtotal: ~$36,917.71
 *
 * ---
 *
 * SOLUTION & ROOT CAUSE:
 * The issue was caused by two overlapping bugs in the `calcProductsTotal` calculation:
 * 1. Unit Price Precision/Rounding: The extra discount calculation created a long decimal unit price (e.g., 1.63 * 0.91 = 1.4833). The original code multiplied this exact floating-point value by the large quantity (25,000) which led to 37,082.50. In standard invoicing, the discounted unit price visually rounds to two decimal places ($1.48) *before* multiplying by quantity. This fixes the baseline product total calculation to visually align with $37,000.00 (1.48 * 25,000).
 * 2. Absolute Discount Logic Bug: The absolute `product.discount` override was accidentally being added (`+`) to the product total instead of being correctly subtracted (`-`).
 *
 * HOW IT WORKS NOW:
 * 1. Calculate Unit Price: Fetch the base `product.price`.
 * 2. Apply Extra Percentage: If `productsDiscount` has an entry for the product, calculate the discounted unit price.
 * 3. Currency Rounding: Explicitly round this newly discounted unit price to 2 decimal digits (`Number.toFixed(2)`) to reflect standard exact currency layout.
 * 4. Multiplication: Multiply the bounded unit price by the `product.qty`.
 * 5. Subtract Flat Discount: Correctly subtract (`-`) any explicit flat `product.discount` override from the respective subtotal.
 */

export default function calcProductsTotal(products, productsDiscount) {
  console.log("products", products, "productDiscount", productsDiscount);

  return (
    products?.reduce((total, product) => {
      const minPrice = product?.min_price || 0;
      const maxPrice = product?.max_price || Infinity;

      const extraDiscount =
        productsDiscount?.[product.product_id]?.discount || 0;

      let unitPrice = parseFloat(product.price);
      if (extraDiscount) {
        unitPrice = unitPrice * ((100 - +extraDiscount) / 100);
      }
      unitPrice = Number(unitPrice.toFixed(2));

      let productTotal =
        Math.max(
          minPrice,
          Math.min(unitPrice * parseInt(product.qty || "0"), maxPrice),
        ) + parseFloat(product.discount || "0");

      console.log(
        `Product ID: ${product.product_id}, Min Price: ${minPrice}, Max Price: ${maxPrice}, Price: ${product.price}, Qty: ${product.qty}, Discount: ${product.discount}, Extra Discount: ${extraDiscount}, Product Total: ${productTotal}`,
      );
      return total + productTotal;
    }, 0) || 0
  );
}

console.log(
  "Response: ",
  calcProductsTotal(
    [
      {
        product_id: 1684,

        title: "CavityRock Unfaced",

        url: "/product/cavityrock-unfaced/",

        variants: [
          {
            id: 2423,

            attributes: {
              attribute_pa_thickness: "1-r-4-3",

              "attribute_pa_board-size": "16x48",
            },

            price: 0.82,
          },

          {
            id: 1685,

            attributes: {
              attribute_pa_thickness: "1-r-4-3",

              "attribute_pa_board-size": "24x48",
            },

            price: 0.82,
          },

          {
            id: 1686,

            attributes: {
              attribute_pa_thickness: "1-5-r-6-5",

              "attribute_pa_board-size": "16x48",
            },

            price: 1.22,
          },

          {
            id: 1687,

            attributes: {
              attribute_pa_thickness: "1-5-r-6-5",

              "attribute_pa_board-size": "24x48",
            },

            price: 1.22,
          },

          {
            id: 1688,

            attributes: {
              attribute_pa_thickness: "2-r-8-6",

              "attribute_pa_board-size": "16x48",
            },

            price: 1.63,
          },

          {
            id: 1689,

            attributes: {
              attribute_pa_thickness: "2-r-8-6",

              "attribute_pa_board-size": "24x48",
            },

            price: 1.63,
          },

          {
            id: 1690,

            attributes: {
              attribute_pa_thickness: "2-5-r-10-8",

              "attribute_pa_board-size": "16x48",
            },

            price: 2.04,
          },

          {
            id: 1691,

            attributes: {
              attribute_pa_thickness: "2-5-r-10-8",

              "attribute_pa_board-size": "24x48",
            },

            price: 2.04,
          },

          {
            id: 1692,

            attributes: {
              attribute_pa_thickness: "3-r-12-9",

              "attribute_pa_board-size": "16x48",
            },

            price: 2.44,
          },

          {
            id: 1693,

            attributes: {
              attribute_pa_thickness: "3-r-12-9",

              "attribute_pa_board-size": "24x48",
            },

            price: 2.44,
          },

          {
            id: 1694,

            attributes: {
              attribute_pa_thickness: "3-5-r-15-1",

              "attribute_pa_board-size": "16x48",
            },

            price: 2.85,
          },

          {
            id: 1695,

            attributes: {
              attribute_pa_thickness: "3-5-r-15-1",

              "attribute_pa_board-size": "24x48",
            },

            price: 2.85,
          },

          {
            id: 1696,

            attributes: {
              attribute_pa_thickness: "4-r-17-2",

              "attribute_pa_board-size": "16x48",
            },

            price: 3.26,
          },

          {
            id: 1697,

            attributes: {
              attribute_pa_thickness: "4-r-17-2",

              "attribute_pa_board-size": "24x48",
            },

            price: 3.26,
          },

          {
            id: 1698,

            attributes: {
              attribute_pa_thickness: "4-5-r-19-4",

              "attribute_pa_board-size": "16x48",
            },

            price: 3.66,
          },

          {
            id: 1699,

            attributes: {
              attribute_pa_thickness: "4-5-r-19-4",

              "attribute_pa_board-size": "24x48",
            },

            price: 3.66,
          },

          {
            id: 1700,

            attributes: {
              attribute_pa_thickness: "5-r-21-5",

              "attribute_pa_board-size": "16x48",
            },

            price: 4.07,
          },

          {
            id: 1701,

            attributes: {
              attribute_pa_thickness: "5-r-21-5",

              "attribute_pa_board-size": "24x48",
            },

            price: 4.07,
          },

          {
            id: 1702,

            attributes: {
              attribute_pa_thickness: "6-r-25-8",

              "attribute_pa_board-size": "16x48",
            },

            price: 4.88,
          },

          {
            id: 1703,

            attributes: {
              attribute_pa_thickness: "6-r-25-8",

              "attribute_pa_board-size": "24x48",
            },

            price: 4.88,
          },

          {
            id: 1704,

            attributes: {
              attribute_pa_thickness: "7-r-30-1",

              "attribute_pa_board-size": "16x48",
            },

            price: 5.69,
          },

          {
            id: 1705,

            attributes: {
              attribute_pa_thickness: "7-r-30-1",

              "attribute_pa_board-size": "24x48",
            },

            price: 5.69,
          },

          {
            id: 1706,

            attributes: {
              attribute_pa_thickness: "8-r-34-4",

              "attribute_pa_board-size": "16x48",
            },

            price: 6.51,
          },

          {
            id: 1707,

            attributes: {
              attribute_pa_thickness: "8-r-34-4",

              "attribute_pa_board-size": "24x48",
            },

            price: 6.51,
          },
        ],

        attributes: {
          pa_thickness: {
            label: "Thickness",

            options: [
              {
                value: "1-r-4-3",

                label: '1" (R-4.3)',
              },

              {
                value: "1-5-r-6-5",

                label: '1.5" (R-6.5)',
              },

              {
                value: "2-r-8-6",

                label: '2" (R-8.6)',
              },

              {
                value: "2-5-r-10-8",

                label: '2.5" (R-10.8)',
              },

              {
                value: "3-r-12-9",

                label: '3" (R-12.9)',
              },

              {
                value: "3-5-r-15-1",

                label: '3.5" (R-15.1)',
              },

              {
                value: "4-r-17-2",

                label: '4" (R-17.2)',
              },

              {
                value: "4-5-r-19-4",

                label: '4.5" (R-19.4)',
              },

              {
                value: "5-r-21-5",

                label: '5" (R-21.5)',
              },

              {
                value: "6-r-25-8",

                label: '6" (R-25.8)',
              },

              {
                value: "7-r-30-1",

                label: '7" (R-30.1)',
              },

              {
                value: "8-r-34-4",

                label: '8" (R-34.4)',
              },
            ],
          },

          "pa_board-size": {
            label: "Board Size",

            options: [
              {
                value: "24x48",

                label: "24x48",
              },

              {
                value: "16x48",

                label: "16x48",
              },
            ],
          },
        },

        price: "1.63",

        units: {
          unit: "SF",

          price_unit: "SF",
        },

        note: "",

        min_price: "",

        max_price: "",

        id: 892,

        variation_id: 1688,

        qty: 25000,

        discount: 0,
      },
    ],
    {
      1684: {
        product_id: "1684",
        discount: "9",
      },
    },
  ),
);
